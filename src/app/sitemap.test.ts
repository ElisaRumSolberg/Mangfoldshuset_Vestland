import { describe, expect, it, vi } from "vitest";

const rows = vi.hoisted(() => ({ activities: [] as unknown[] }));
vi.mock("@/lib/utvalg", () => ({ fetchUtvalg: async () => [{ slug: "ungdom" }] }));
vi.mock("@/lib/recurring", async (actual) => ({
  ...(await actual<typeof import("@/lib/recurring")>()),
  fetchPrograms: async () => [{ id: "p1", title: "Torsdagssuppe" }],
}));
vi.mock("@/lib/supabase/isConfigured", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({ select: () => ({ order: async () => ({ data: rows.activities, error: null }) }) }),
  }),
}));

import sitemap from "./sitemap";

const paths = async () => (await sitemap()).map((e) => new URL(e.url).pathname);

describe("sitemap", () => {
  it("lists every activity and recurring programme at its readable address", async () => {
    rows.activities = [{ id: "a1", title: "Kulturkveld på Holen", event_date: "2026-10-04" }];
    const list = await paths();
    expect(list).toContain("/tilbud/torsdagssuppe");
    expect(list).toContain("/aktiviteter/kulturkveld-pa-holen-2026-10-04");
    expect(list).toContain("/utvalg/ungdom");
    expect(list).toContain("/medlemsvilkar");
    expect(list.some((p) => p.startsWith("/admin"))).toBe(false);
  });

  it("still lists the fixed pages when there are no activities", async () => {
    rows.activities = null as unknown as unknown[];
    expect(await paths()).toContain("/aktiviteter");
  });
});
