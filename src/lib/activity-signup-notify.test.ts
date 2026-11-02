import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), insert: vi.fn(), send: vi.fn(), configured: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }), insert: mocks.insert }) }) }));
vi.mock("@/lib/supabase/isConfigured", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: async () => false }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: mocks.configured, NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", () => ({ todayOslo: () => "2026-11-02" }));
import { signUpForActivity } from "@/app/aktiviteter/[id]/actions";

const id = "00000000-0000-4000-8000-000000000002";
function data() {
  const f = new FormData();
  Object.entries({ name: "Kari Test", email: "kari@example.invalid", participants: "2", comment: "12 år" }).forEach(([k, v]) => f.set(k, v));
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.lookup.mockResolvedValue({ data: { title: "Min historie", event_date: "2026-11-08", registration_open: true }, error: null });
  mocks.insert.mockResolvedValue({ error: null });
  mocks.send.mockResolvedValue({ error: null });
  mocks.configured.mockReturnValue(true);
});

it("notifies the organisation about a new signup", async () => {
  await expect(signUpForActivity(id, data())).rejects.toThrow("?meldt=1");
  expect(mocks.send).toHaveBeenCalledOnce();
  const mail = mocks.send.mock.calls[0][0];
  expect(mail.to).toBe("qa@example.invalid");
  expect(mail.replyTo).toBe("kari@example.invalid");
  expect(mail.subject).toBe("Ny påmelding: Min historie – Kari Test");
  expect(mail.text).toContain("Antall personer: 2");
  expect(mail.text).toContain("Kommentar: 12 år");
  expect(mail.text).toContain("Bildesamtykke: Nei");
});

it("stores photo consent only when the box is ticked", async () => {
  const f = data();
  f.set("photo_consent", "on");
  await expect(signUpForActivity(id, f)).rejects.toThrow("?meldt=1");
  expect(mocks.insert.mock.calls[0][0].photo_consent).toBe(true);
  expect(mocks.send.mock.calls[0][0].text).toContain("Bildesamtykke: Ja");

  mocks.insert.mockClear();
  await expect(signUpForActivity(id, data())).rejects.toThrow("?meldt=1");
  expect(mocks.insert.mock.calls[0][0].photo_consent).toBe(false);
});

it("does not notify when the signup was not saved", async () => {
  mocks.insert.mockResolvedValue({ error: {} });
  await expect(signUpForActivity(id, data())).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.send).not.toHaveBeenCalled();
});

it("a failing mail does not turn a saved signup into an error", async () => {
  mocks.send.mockRejectedValue(new Error("mail outage"));
  await expect(signUpForActivity(id, data())).rejects.toThrow("?meldt=1");
});
