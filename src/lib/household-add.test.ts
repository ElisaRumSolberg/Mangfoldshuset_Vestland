import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ today: vi.fn(), adder: vi.fn(), count: vi.fn(), insert: vi.fn(), single: vi.fn(), update: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: (_cols: string, opts?: { head?: boolean }) =>
        opts?.head ? { eq: mocks.count } : { eq: () => ({ maybeSingle: mocks.adder }) },
      insert: mocks.insert,
      update: () => ({ eq: mocks.update }),
    }),
  }),
}));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: () => true, NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", async (orig) => ({ ...(await orig<typeof import("@/lib/recurring")>()), todayOslo: () => mocks.today() }));
import { addHouseholdMember } from "@/app/bli-med/medlem/[token]/actions";

const token = "00000000-0000-4000-8000-000000000009";
const paid = { id: "a1", first_name: "Kari", last_name: "Nordmann", email: "kari@example.invalid", phone: "123", address: "Gate 1", expires_at: "2027-12-31", household_id: "H1" };

function form(extra: Record<string, string> = {}) {
  const f = new FormData();
  Object.entries({ name: "Liv Nordmann", birth_date: "2015-09-09", gender: "kvinne", terms: "on", ...extra }).forEach(([k, v]) => f.set(k, v));
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.today.mockReturnValue("2026-11-03");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-not-a-real-key");
  mocks.adder.mockResolvedValue({ data: paid, error: null });
  mocks.count.mockResolvedValue({ count: 1 });
  mocks.insert.mockReturnValue({ select: () => ({ single: mocks.single }) });
  mocks.single.mockResolvedValue({ data: { pay_token: "11111111-1111-4111-8111-111111111111" }, error: null });
  mocks.update.mockResolvedValue({ error: null });
  mocks.send.mockResolvedValue({ error: null });
});

it("makes an added person a free member during the free period", async () => {
  await expect(addHouseholdMember(token, form())).rejects.toThrow(`REDIRECT:/bli-med/medlem/${token}?lagt=1`);
  expect(mocks.insert.mock.calls[0][0].expires_at).toBe("2026-12-31");
});

it("lets a member who has paid add a person as their own, unpaid member (after the free period)", async () => {
  mocks.today.mockReturnValue("2027-02-03");
  await expect(addHouseholdMember(token, form())).rejects.toThrow(
    `REDIRECT:/bli-med/medlem/${token}?lagt=1&betal=11111111-1111-4111-8111-111111111111`,
  );
  const row = mocks.insert.mock.calls[0][0];
  expect(row).toMatchObject({
    first_name: "Liv", last_name: "Nordmann", household_id: "H1", email: "kari@example.invalid",
    guardian: "Kari Nordmann", accepted_terms: true,
  });
  expect(row.expires_at).toBeUndefined();
  expect(row.paid_at).toBeUndefined();
});

it("refuses to add anyone until the member has paid", async () => {
  mocks.adder.mockResolvedValue({ data: { ...paid, expires_at: null }, error: null });
  await expect(addHouseholdMember(token, form())).resolves.toEqual({ error: expect.stringContaining("betale") });
  expect(mocks.insert).not.toHaveBeenCalled();
});

it("refuses when the membership has expired", async () => {
  mocks.adder.mockResolvedValue({ data: { ...paid, expires_at: "2026-10-01" }, error: null });
  await expect(addHouseholdMember(token, form())).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.insert).not.toHaveBeenCalled();
});

it("does not give a guardian for an adult", async () => {
  await expect(addHouseholdMember(token, form({ birth_date: "1980-01-01" }))).rejects.toThrow("?lagt=1");
  expect(mocks.insert.mock.calls[0][0].guardian).toBeNull();
});

it("stops at the household limit", async () => {
  mocks.count.mockResolvedValue({ count: 10 });
  await expect(addHouseholdMember(token, form())).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.insert).not.toHaveBeenCalled();
});

it("needs the terms, valid fields and a known token", async () => {
  await expect(addHouseholdMember(token, form({ terms: "" }))).resolves.toEqual({ error: expect.any(String) });
  await expect(addHouseholdMember(token, form({ birth_date: "" }))).resolves.toEqual({ error: expect.any(String) });
  mocks.adder.mockResolvedValue({ data: null, error: null });
  await expect(addHouseholdMember(token, form())).resolves.toEqual({ error: expect.any(String) });
  await expect(addHouseholdMember("not-a-uuid", form())).rejects.toThrow("REDIRECT:/bli-med");
  expect(mocks.insert).not.toHaveBeenCalled();
});
