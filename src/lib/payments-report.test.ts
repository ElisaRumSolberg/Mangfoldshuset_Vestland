import { describe, expect, it } from "vitest";
import { paymentsCsv, summarize, type PaymentRow } from "./payments-report";

const row = (over: Partial<PaymentRow> & { id: string }): PaymentRow => ({
  amount: 100,
  method: "vipps",
  paid_at: "2026-03-10",
  covers_year: 2026,
  member: { id: over.id, first_name: "Kari", last_name: "Test", birth_date: "1985-01-01", gender: "kvinne" },
  ...over,
});

describe("summarize", () => {
  it("counts one paying member per person, even children, with the sum and methods", () => {
    const rows = [
      row({ id: "a" }),
      row({ id: "b", amount: 25, method: "bank", member: { id: "b", first_name: "Liv", last_name: "Test", birth_date: "2018-05-05", gender: "kvinne" } }),
      row({ id: "c", amount: 25, method: "bank", member: { id: "c", first_name: "Ola", last_name: "Test", birth_date: "2014-02-02", gender: "mann" } }),
    ];
    const s = summarize(rows, "2026-12-31");
    expect(s.payments).toBe(3);
    expect(s.members).toBe(3);
    expect(s.total).toBe(150);
    expect(s.byMethod).toEqual([
      { method: "bank", count: 2, sum: 50 },
      { method: "vipps", count: 1, sum: 100 },
    ]);
    expect(s.stats.total).toBe(3);
    expect(s.stats.under26).toBe(2);
    expect(s.stats.age6to25).toBe(2);
  });
  it("does not count the same member twice", () => {
    const s = summarize([row({ id: "a" }), row({ id: "p2", member: { id: "a", first_name: "Kari", last_name: "Test", birth_date: "1985-01-01", gender: "kvinne" } })], "2026-12-31");
    expect(s.payments).toBe(2);
    expect(s.members).toBe(1);
  });
});

describe("paymentsCsv", () => {
  it("writes semicolon separated rows with a BOM and neutralises formulas", () => {
    const csv = paymentsCsv([
      row({ id: "a", member: { id: "a", first_name: "=HYPERLINK(\"x\")", last_name: "Test; Jr", birth_date: "1985-01-01", gender: "kvinne" } }),
    ]);
    expect(csv.startsWith("﻿Dato;Fornavn")).toBe(true);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('"Test; Jr"');
    expect(csv).toContain("2026-03-10;");
    expect(csv).toContain(";100;Vipps;2026");
  });
});
