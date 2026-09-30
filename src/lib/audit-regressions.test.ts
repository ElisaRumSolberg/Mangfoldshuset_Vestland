import { beforeEach, describe, expect, it, vi } from "vitest";
import { roleFromUser } from "./roles";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(), send: vi.fn(), configured: vi.fn(), rate: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: () => ({ insert: mocks.insert }) }) }));
vi.mock("@/lib/supabase/isConfigured", () => ({ isSupabaseConfigured: mocks.configured }));
vi.mock("@/lib/resend", () => ({ isResendConfigured: () => true, getResendClient: () => ({ emails: { send: mocks.send } }), NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: mocks.rate }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

import { sendContactMessage } from "@/app/kontakt/actions";
import { submitMembership, submitApplication } from "@/app/bli-med/actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([k, v]) => data.set(k, v));
  return data;
}
const contact = () => form({ name: "QA Ø Test", email: "qa@example.invalid", subject: "QA", message: "Synthetic message" });
const member = () => form({ first_name: "QA", last_name: "Test", email: "qa@example.invalid", membership_type: "enkelt", terms: "on" });
const application = () => form({ type: "ide", name: "QA", email: "qa@example.invalid", ide: "Synthetic idea" });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.configured.mockReturnValue(true);
  mocks.rate.mockResolvedValue(false);
  mocks.insert.mockResolvedValue({ error: null });
  mocks.send.mockResolvedValue({ error: null });
});

describe("QA-01 explicit authorization", () => {
  it.each([null, { app_metadata: {} }, { app_metadata: { role: "unexpected" } }])("rejects absent/unknown roles: %j", (user) => {
    expect(roleFromUser(user)).toBeNull();
  });
});

describe("QA-02 persistence before success", () => {
  const cases = [
    ["contact", sendContactMessage, contact, "/kontakt?feil=1", "/kontakt?sendt=takk"],
    ["membership", submitMembership, member, "/bli-med?feil=medlem#medlem", "/bli-med?sendt=medlem#medlem"],
    ["application", submitApplication, application, "/bli-med?feil=ide#ide", "/bli-med?sendt=ide#ide"],
  ] as const;
  for (const [label, action, data, , success] of cases) {
    it(`${label}: database error never claims success or sends mail`, async () => {
      mocks.insert.mockResolvedValue({ error: { message: "synthetic database failure" } });
      await expect(action(data())).resolves.toEqual({ error: expect.any(String) });
      expect(mocks.send).not.toHaveBeenCalled();
    });
    it(`${label}: missing configuration never claims success`, async () => {
      mocks.configured.mockReturnValue(false);
      await expect(action(data())).resolves.toEqual({ error: expect.any(String) });
      expect(mocks.insert).not.toHaveBeenCalled();
      expect(mocks.send).not.toHaveBeenCalled();
    });
    it(`${label}: network failure is handled without exposing details`, async () => {
      mocks.insert.mockRejectedValue(new Error("private connection details"));
      await expect(action(data())).resolves.toEqual({ error: expect.any(String) });
      expect(mocks.send).not.toHaveBeenCalled();
    });
    it(`${label}: successful persistence sends notification and confirms`, async () => {
      await expect(action(data())).rejects.toThrow(`REDIRECT:${success}`);
      expect(mocks.insert).toHaveBeenCalledOnce();
      expect(mocks.send).toHaveBeenCalledOnce();
    });
    it(`${label}: mail outage after persistence does not encourage duplicate submission`, async () => {
      mocks.send.mockRejectedValue(new Error("mail unavailable"));
      await expect(action(data())).rejects.toThrow(`REDIRECT:${success}`);
      expect(mocks.insert).toHaveBeenCalledOnce();
    });
  }
  it("membership: missing terms are rejected server-side", async () => {
    const data = member(); data.delete("terms");
    await expect(submitMembership(data)).resolves.toEqual({ error: expect.any(String) });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
