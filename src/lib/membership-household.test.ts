import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/public-submission", () => ({ savePublicSubmission: mocks.save, notifyAfterSave: async (f: () => Promise<unknown>) => { await f(); } }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: async () => false }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: () => true, NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", async (orig) => ({ ...(await orig<typeof import("@/lib/recurring")>()), todayOslo: () => "2026-11-03" }));
import { submitMembership } from "@/app/bli-med/actions";
import { splitName } from "@/lib/household";

function form(extra: Record<string, string> = {}) {
  const f = new FormData();
  Object.entries({
    first_name: "Kari", last_name: "Nordmann", email: "kari@example.invalid",
    birth_date: "1985-05-01", gender: "kvinne", terms: "on", ...extra,
  }).forEach(([k, v]) => f.set(k, v));
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.save.mockResolvedValue(true);
  mocks.send.mockResolvedValue({ error: null });
});

it("signs up only the person themselves, even if family fields are sent", async () => {
  const f = form({ fam_name_2: "Ola Nordmann", fam_birth_2: "1983-02-02", fam_gender_2: "mann" });
  await expect(submitMembership(f)).rejects.toThrow("REDIRECT:/bli-med/medlem/");
  const row = mocks.save.mock.calls[0][1];
  expect(Array.isArray(row)).toBe(false);
  expect(row).toMatchObject({ first_name: "Kari", last_name: "Nordmann", membership_type: "enkelt", family_members: [] });
  expect(row.household_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(row.pay_token).toMatch(/^[0-9a-f-]{36}$/);
});

it("sends the member a personal link to their own page and notifies the organisation", async () => {
  let redirectedTo = "";
  try {
    await submitMembership(form());
  } catch (e) {
    redirectedTo = String((e as Error).message);
  }
  const token = mocks.save.mock.calls[0][1].pay_token;
  expect(redirectedTo).toBe(`REDIRECT:/bli-med/medlem/${token}?ny=1`);
  const mails = mocks.send.mock.calls.map((c) => c[0]);
  const toMember = mails.find((m) => m.to === "kari@example.invalid");
  expect(toMember.text).toContain(`/bli-med/medlem/${token}`);
  expect(toMember.text).toContain("100 kr per år");
  expect(mails.some((m) => m.to === "qa@example.invalid")).toBe(true);
});

it("tells a child member the child rate", async () => {
  await expect(submitMembership(form({ birth_date: "2015-09-09", guardian: "Kari Nordmann" }))).rejects.toThrow("REDIRECT:/bli-med/medlem/");
  const toMember = mocks.send.mock.calls.map((c) => c[0]).find((m) => m.to === "kari@example.invalid");
  expect(toMember.text).toContain("25 kr per år");
});

it("does not send mail or redirect when nothing was saved", async () => {
  mocks.save.mockResolvedValue(false);
  await expect(submitMembership(form())).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.send).not.toHaveBeenCalled();
});

it("splits names, giving a single name the main member's surname", () => {
  expect(splitName("Ola Per Nordmann", "X")).toEqual({ first_name: "Ola Per", last_name: "Nordmann" });
  expect(splitName("Liv", "Nordmann")).toEqual({ first_name: "Liv", last_name: "Nordmann" });
});
