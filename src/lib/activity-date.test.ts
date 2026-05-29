import { describe, expect, it } from "vitest";
import { effectiveEndDate, isActivityPast, longDateRange, shortDateRange } from "./activity-date";

describe("effectiveEndDate", () => {
  it("returns event_date when there is no end_date", () => {
    expect(effectiveEndDate({ event_date: "2026-10-01" })).toBe("2026-10-01");
  });

  it("returns end_date when it is after event_date", () => {
    expect(effectiveEndDate({ event_date: "2026-10-01", end_date: "2026-10-03" })).toBe(
      "2026-10-03"
    );
  });

  it("falls back to event_date when end_date is before or equal to it (bad data)", () => {
    expect(effectiveEndDate({ event_date: "2026-10-01", end_date: "2026-10-01" })).toBe(
      "2026-10-01"
    );
    expect(effectiveEndDate({ event_date: "2026-10-01", end_date: "2026-09-01" })).toBe(
      "2026-10-01"
    );
  });
});

describe("isActivityPast", () => {
  it("is false for an activity happening today", () => {
    expect(isActivityPast({ event_date: "2026-09-30" }, "2026-09-30")).toBe(false);
  });

  it("is false on the last day of a multi-day activity", () => {
    expect(
      isActivityPast({ event_date: "2026-09-28", end_date: "2026-09-30" }, "2026-09-30")
    ).toBe(false);
  });

  it("is true the day after a multi-day activity ends", () => {
    expect(
      isActivityPast({ event_date: "2026-09-28", end_date: "2026-09-30" }, "2026-10-01")
    ).toBe(true);
  });
});

describe("shortDateRange", () => {
  it("formats a single day", () => {
    expect(shortDateRange({ event_date: "2026-10-02" })).toMatch(/2\.\s*okt/i);
  });

  it("formats a same-month range compactly", () => {
    expect(shortDateRange({ event_date: "2026-09-04", end_date: "2026-09-05" })).toMatch(
      /^4\.–5\.\s*sep/i
    );
  });

  it("formats a cross-month range with both months spelled out", () => {
    const result = shortDateRange({ event_date: "2026-09-30", end_date: "2026-10-02" });
    expect(result).toMatch(/sep/i);
    expect(result).toMatch(/okt/i);
    expect(result).toContain(" – ");
  });
});

describe("longDateRange", () => {
  it("includes the weekday for a single-day activity", () => {
    const result = longDateRange({ event_date: "2026-10-01" });
    expect(result.toLowerCase()).toContain("oktober");
    expect(result.toLowerCase()).toMatch(/mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag/);
  });

  it("formats a range as 'start – end' with the year only at the end", () => {
    const result = longDateRange({ event_date: "2026-09-04", end_date: "2026-09-05" });
    expect(result).toBe("4. september – 5. september 2026");
  });
});
