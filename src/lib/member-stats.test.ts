import { describe, expect, it } from "vitest";
import { ageOn, buildStats } from "./member-stats";

describe("ageOn", () => {
  it("counts whole years and handles birthdays not yet reached", () => {
    expect(ageOn("2000-10-15", "2026-10-15")).toBe(26);
    expect(ageOn("2000-10-16", "2026-10-15")).toBe(25);
    expect(ageOn("2026-10-15", "2026-10-15")).toBe(0);
  });
  it("returns null for missing, invalid or future dates", () => {
    expect(ageOn(null, "2026-10-15")).toBeNull();
    expect(ageOn("", "2026-10-15")).toBeNull();
    expect(ageOn("tomorrow", "2026-10-15")).toBeNull();
    expect(ageOn("2030-01-01", "2026-10-15")).toBeNull();
  });
});

describe("buildStats", () => {
  const today = "2026-10-15";
  const stats = buildStats(
    [
      { birth: "2024-01-01", gender: "kvinne" }, // 2 år
      { birth: "2018-05-05", gender: "mann" }, // 8 år
      { birth: "2010-03-03", gender: null }, // 16 år
      { birth: "2001-10-15", gender: "kvinne" }, // 25 år
      { birth: "2000-10-14", gender: "mann" }, // 26 år
      { birth: null, gender: "kvinne" },
    ],
    today
  );

  it("groups people by age and gender", () => {
    const by = Object.fromEntries(stats.rows.map((r) => [r.key, r]));
    expect(by["0-5"]).toMatchObject({ kvinne: 1, total: 1 });
    expect(by["6-12"]).toMatchObject({ mann: 1, total: 1 });
    expect(by["13-17"]).toMatchObject({ annet: 1, total: 1 });
    expect(by["18-25"]).toMatchObject({ kvinne: 1, total: 1 });
    expect(by["26+"]).toMatchObject({ mann: 1, total: 1 });
  });

  it("counts under 26, 6–25 and unknown age separately", () => {
    expect(stats.under26).toBe(4);
    expect(stats.age6to25).toBe(3);
    expect(stats.unknownAge).toBe(1);
    expect(stats.total).toBe(6);
  });
});
