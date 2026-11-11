import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn(), send: vi.fn(), find: vi.fn(), update: vi.fn(), insert: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ update: () => ({ eq: mocks.update }), insert: mocks.insert }) }) }));
vi.mock("@/lib/public-submission", () => ({ savePublicSubmission: mocks.save, notifyAfterSave: async (f: () => Promise<unknown>) => { await f(); } }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: async () => false }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: () => true, NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("@/lib/member-lookup", () => ({ findExistingMember: mocks.find }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", async (orig) => ({ ...(await orig<typeof import("@/lib/recurring")>()), todayOslo: () => "2026-11-03" }));
import { submitMembership } from "@/app/bli-med/actions";
import { existingMemberMessage } from "@/lib/receipt-email";

function form() {
  const f = new FormData();
  Object.entries({
    first_name: "Kari", last_name: "Nordmann", email: "kari@example.invalid",
    birth_date: "1985-05-01", gender: "kvinne", terms: "on",
  }).forEach(([k, v]) => f.set(k, v));
  return f;
}
const existing = { id: "m1", first_name: "Kari", last_name: "Nordmann", birth_date: "1985-05-01", expires_at: "2026-05-01", pay_token: "tok-1" };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.save.mockResolvedValue(true);
  mocks.send.mockResolvedValue({ error: null });
  mocks.find.mockResolvedValue(null);
  mocks.update.mockResolvedValue({ error: null });
  mocks.insert.mockResolvedValue({ error: null });
});

it("does not create a second row when an existing member signs up again", async () => {
  mocks.find.mockResolvedValue(existing);
  await expect(submitMembership(form())).rejects.toThrow("REDIRECT:/bli-med?sendt=medlem#medlem");
  expect(mocks.save).not.toHaveBeenCalled();
  const toMember = mocks.send.mock.calls.map((c) => c[0]).find((m) => m.to === "kari@example.invalid");
  expect(toMember.text).toContain("/bli-med/medlem/tok-1");
  // I gratisperioden aktiveres et utløpt medlemskap uten betaling.
  expect(mocks.update).toHaveBeenCalledOnce();
  expect(toMember.text).toContain("allerede medlem");
  expect(toMember.text).toContain("ut 2026");
  expect(mocks.send.mock.calls.map((c) => c[0]).some((m) => m.to === "qa@example.invalid")).toBe(true);
});

it("still signs up a new person normally", async () => {
  await expect(submitMembership(form())).rejects.toThrow("REDIRECT:/bli-med/medlem/");
  expect(mocks.save).toHaveBeenCalledOnce();
});

it("makes a new sign-up a free, active member during the free period", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-not-a-real-key");
  await expect(submitMembership(form())).rejects.toThrow("REDIRECT:/bli-med/medlem/");
  expect(mocks.insert).toHaveBeenCalledOnce();
  expect(mocks.insert.mock.calls[0][0]).toMatchObject({ expires_at: "2026-12-31", first_name: "Kari" });
  expect(mocks.save).not.toHaveBeenCalled();
  const welcome = mocks.send.mock.calls.map((c) => c[0]).find((m) => m.to === "kari@example.invalid");
  expect(welcome.text).toContain("gratis");
  expect(welcome.text).toContain("1. januar 2027");
  expect(welcome.text).not.toContain("#595791");
  vi.unstubAllEnvs();
});

it("writes the right status for active, expired and never-paid members", () => {
  const site = "https://example.invalid";
  const active = existingMemberMessage({ first_name: "K", expires_at: "2027-12-31", pay_token: "t" }, 100, "2026-11-03", site);
  expect(active.text).toContain("allerede medlem");
  expect(active.text).toContain("ut 2027");
  const expired = existingMemberMessage({ first_name: "K", expires_at: "2026-05-01", pay_token: "t" }, 100, "2026-11-03", site);
  expect(expired.text).toContain("utløp 2026-05-01");
  expect(expired.text).toContain("100 kr");
  const unpaid = existingMemberMessage({ first_name: "K", expires_at: null, pay_token: "t" }, 25, "2026-11-03", site);
  expect(unpaid.text).toContain("ikke registrert noen betaling");
  expect(unpaid.text).toContain("25 kr");
  expect(unpaid.text).toContain("https://example.invalid/bli-med/medlem/t");
});
