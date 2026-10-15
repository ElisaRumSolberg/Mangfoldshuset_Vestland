import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ candidates: vi.fn(), update: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ is: () => ({ is: () => ({ gte: mocks.candidates }) }) }),
      update: () => ({ eq: mocks.update }),
    }),
  }),
}));
vi.mock("@/lib/resend", () => ({
  getResendClient: () => ({ emails: { send: mocks.send } }),
  isResendConfigured: () => true,
  NOTIFY_EMAIL: "qa@example.invalid",
}));
import { GET } from "@/app/api/cron/betalingspaminnelser/route";

const req = (token = "qa-secret") =>
  new Request("http://localhost/api/cron/betalingspaminnelser", { headers: { authorization: `Bearer ${token}` } });

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", "qa-secret");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-not-a-real-key");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-15T08:00:00Z"));
  mocks.candidates.mockResolvedValue({
    data: [
      { id: "m1", first_name: "A", last_name: "B", email: "a@example.invalid", membership_type: "enkelt", created_at: "2026-10-12T10:00:00Z", last_reminder_offset: null },
      { id: "m2", first_name: "C", last_name: "D", email: "c@example.invalid", membership_type: "familie", created_at: "2026-10-14T10:00:00Z", last_reminder_offset: null },
    ],
    error: null,
  });
  mocks.send.mockResolvedValue({ error: null });
  mocks.update.mockResolvedValue({ error: null });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it("rejects wrong secrets", async () => {
  expect((await GET(req("wrong"))).status).toBe(401);
  expect(mocks.send).not.toHaveBeenCalled();
});

it("reminds only members unpaid for 3+ days, with a stable idempotency key", async () => {
  const res = await GET(req());
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ reminded: 1 });
  const memberCalls = mocks.send.mock.calls.filter((c) => c[0].to === "a@example.invalid");
  expect(memberCalls).toHaveLength(1);
  expect(memberCalls[0][1]).toEqual({ idempotencyKey: "unpaid-m1-3" });
  expect(mocks.send.mock.calls.some((c) => c[0].to === "c@example.invalid")).toBe(false);
});

it("reports database failure", async () => {
  mocks.candidates.mockResolvedValue({ error: { message: "x" } });
  expect((await GET(req())).status).toBe(503);
});
