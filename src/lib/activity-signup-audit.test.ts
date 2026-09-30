import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), insert: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }), insert: mocks.insert }) }) }));
vi.mock("@/lib/supabase/isConfigured", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: async () => false }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", () => ({ todayOslo: () => "2026-09-30" }));
import { signUpForActivity } from "@/app/aktiviteter/[id]/actions";
const id = "00000000-0000-4000-8000-000000000001";
function data() { const f = new FormData(); Object.entries({ name: "QA", email: "qa@example.invalid", participants: "1" }).forEach(([k,v]) => f.set(k,v)); return f; }
beforeEach(() => {
  vi.resetAllMocks();
  mocks.lookup.mockResolvedValue({ data: { event_date: "2026-10-01", registration_open: true }, error: null });
  mocks.insert.mockResolvedValue({ error: null });
});
it.each([
  null,
  { event_date: "2026-10-01", registration_open: false },
  { event_date: "2026-09-29", registration_open: true },
])("rejects missing/closed/past activity: %j", async activity => {
  mocks.lookup.mockResolvedValue({ data: activity, error: null });
  await expect(signUpForActivity(id, data())).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.insert).not.toHaveBeenCalled();
});
it("rejects an invalid id before querying", async () => {
  await expect(signUpForActivity("//untrusted.invalid", data())).rejects.toThrow("REDIRECT:/aktiviteter");
  expect(mocks.lookup).not.toHaveBeenCalled();
});
it("reports failed inserts without success", async () => {
  mocks.insert.mockResolvedValue({ error: {} });
  await expect(signUpForActivity(id, data())).resolves.toEqual({ error: expect.any(String) });
});
it("allows valid future registration", async () => {
  await expect(signUpForActivity(id, data())).rejects.toThrow("?meldt=1");
  expect(mocks.insert).toHaveBeenCalledOnce();
});
