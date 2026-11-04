import { describe, expect, it } from "vitest";
import { coverageYear, yearEnd } from "./membership-year";

describe("coverageYear", () => {
  it("covers this year for a new payer before 1 October", () => {
    expect(coverageYear("2026-03-10", null)).toBe(2026);
    expect(coverageYear("2026-09-30", null)).toBe(2026);
  });
  it("covers next year too when paying from 1 October", () => {
    expect(coverageYear("2026-10-01", null)).toBe(2027);
    expect(coverageYear("2026-11-03", null)).toBe(2027);
  });
  it("treats an expired membership like a new one", () => {
    expect(coverageYear("2026-11-03", "2026-05-01")).toBe(2027);
    expect(coverageYear("2026-04-01", "2025-12-31")).toBe(2026);
  });
  it("renews the year after a membership that ends on 31 December", () => {
    expect(coverageYear("2026-11-03", "2026-12-31")).toBe(2027);
    expect(coverageYear("2026-01-10", "2026-12-31")).toBe(2027);
  });
  it("extends an older mid-year expiry to the end of that year", () => {
    expect(coverageYear("2026-11-03", "2027-03-10")).toBe(2027);
  });
  it("gives the end date of a year", () => {
    expect(yearEnd(2027)).toBe("2027-12-31");
  });
});
