import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ candidates: vi.fn(), update: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ select: () => ({ gte: () => ({ lte: mocks.candidates }) }), update: () => ({ eq: mocks.update }) }) }) }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: () => true, NOTIFY_EMAIL: "qa@example.invalid" }));
import { GET } from "@/app/api/cron/paminnelser/route";
function request(token = "qa-secret") { return new Request("http://localhost/api/cron/paminnelser", { headers: { authorization: `Bearer ${token}` } }); }
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", "qa-secret"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-not-a-real-key");
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-29T22:30:00Z"));
  mocks.candidates.mockResolvedValue({ data: [{ id: "synthetic-1", first_name: "QA", last_name: "Test", email: "qa@example.invalid", expires_at: "2026-10-01" }], error: null });
  mocks.send.mockResolvedValue({ error: null }); mocks.update.mockResolvedValue({ error: null });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
it("denies wrong or missing secrets without reads or sends", async () => {
  expect((await GET(request("wrong"))).status).toBe(401);
  vi.stubEnv("CRON_SECRET", "");
  expect((await GET(request())).status).toBe(401);
  expect(mocks.candidates).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
});
it("uses Oslo date and a stable idempotency key on repeated calls", async () => {
  expect((await GET(request())).status).toBe(200);
  expect((await GET(request())).status).toBe(200);
  const memberCalls = mocks.send.mock.calls.filter(call => call[0].to === "qa@example.invalid" && call[1]);
  expect(memberCalls).toHaveLength(2);
  expect(memberCalls[0][1]).toEqual({ idempotencyKey: "membership-synthetic-1-2026-10-01-1" });
  expect(memberCalls[1][1]).toEqual(memberCalls[0][1]);
});
it("reports database failures rather than zero-success", async () => {
  mocks.candidates.mockResolvedValue({ error: { message: "synthetic" } });
  expect((await GET(request())).status).toBe(503);
  expect(mocks.send).not.toHaveBeenCalled();
});
it("reports reminder update failure", async () => {
  mocks.update.mockResolvedValue({ error: {} });
  expect((await GET(request())).status).toBe(503);
});
