import { describe, expect, it } from "vitest";
import { autoActivities } from "./stats";

type Result = { count: number | null; error: unknown };

/** Etterligner supabase-kjeden for de to tellingene. */
function fake(activities: Result, programs: Result, seen: { gte?: [string, string]; lte?: [string, string] } = {}) {
  return {
    from: (table: string) => ({
      select: () => {
        if (table === "activities") {
          return {
            gte: (col: string, v: string) => {
              seen.gte = [col, v];
              return {
                lte: (col2: string, v2: string) => {
                  seen.lte = [col2, v2];
                  return Promise.resolve(activities);
                },
              };
            },
          };
        }
        return { eq: () => Promise.resolve(programs) };
      },
    }),
  } as never;
}

describe("autoActivities", () => {
  it("counts events held so far this year plus each active weekly programme as one activity", async () => {
    const seen: { gte?: [string, string]; lte?: [string, string] } = {};
    const r = await autoActivities(fake({ count: 6, error: null }, { count: 7, error: null }, seen), "2026-11-09");
    expect(r).toEqual({ events: 6, programs: 7, total: 13 });
    expect(seen.gte).toEqual(["event_date", "2026-01-01"]);
    expect(seen.lte).toEqual(["event_date", "2026-11-09"]);
  });

  it("treats a failing query as zero so the front page never breaks", async () => {
    const r = await autoActivities(fake({ count: null, error: { message: "x" } }, { count: 7, error: null }), "2026-11-09");
    expect(r).toEqual({ events: 0, programs: 7, total: 7 });
    const none = await autoActivities(fake({ count: null, error: { message: "x" } }, { count: null, error: { message: "y" } }), "2026-11-09");
    expect(none.total).toBe(0);
  });
});
