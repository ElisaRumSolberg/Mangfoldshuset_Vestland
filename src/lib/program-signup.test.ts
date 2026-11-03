import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), insert: vi.fn(), send: vi.fn(), configured: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }) }), insert: mocks.insert }) }) }));
vi.mock("@/lib/supabase/isConfigured", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: async () => false }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: mocks.configured, NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", async (orig) => ({ ...(await orig<typeof import("@/lib/recurring")>()), todayOslo: () => "2026-11-03" }));
import { signUpForProgram } from "@/app/tilbud/[id]/actions";

const id = "00000000-0000-4000-8000-000000000003";
const row = {
  id, title: "Torsdagssuppe", description: "", frequency: "weekly", weekday: 4, nth: null,
  start_time: "13:30:00", end_time: "15:00:00", start_date: "2026-11-05", end_date: null,
  place: "Arne Abrahamsens vei 1", skipped_dates: ["2026-11-12"], active: true, registration_open: true,
};

function data(date: string) {
  const f = new FormData();
  Object.entries({ name: "Kari Test", email: "kari@example.invalid", participants: "2", session_date: date }).forEach(([k, v]) => f.set(k, v));
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.lookup.mockResolvedValue({ data: row, error: null });
  mocks.insert.mockResolvedValue({ error: null });
  mocks.send.mockResolvedValue({ error: null });
  mocks.configured.mockReturnValue(true);
});

it("stores the signup for the chosen Thursday and notifies the organisation", async () => {
  await expect(signUpForProgram(id, data("2026-11-19"))).rejects.toThrow("?meldt=1");
  expect(mocks.insert.mock.calls[0][0]).toMatchObject({ program_id: id, session_date: "2026-11-19", participants: 2 });
  const mail = mocks.send.mock.calls[0][0];
  expect(mail.subject).toContain("Torsdagssuppe");
  expect(mail.text).toContain("kl. 13.30–15.00");
  expect(mail.text).toContain(`/admin/tilbud/${id}`);
});

it.each([
  ["a date that is not a Thursday", "2026-11-18"],
  ["a cancelled Thursday", "2026-11-12"],
  ["a past Thursday", "2026-10-29"],
  ["a malformed date", "i morgen"],
])("rejects %s", async (_label, date) => {
  await expect(signUpForProgram(id, data(date))).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.insert).not.toHaveBeenCalled();
});

it("rejects signups when registration is closed", async () => {
  mocks.lookup.mockResolvedValue({ data: { ...row, registration_open: false }, error: null });
  await expect(signUpForProgram(id, data("2026-11-19"))).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.insert).not.toHaveBeenCalled();
});
