import { describe, expect, it } from "vitest";
import { expensesCsv, lineTotal, parseLines, parseNumber, toNok, totalOriginal, validReceiptPaths, type ExpenseRow } from "./expenses";

describe("parseNumber", () => {
  it("accepts comma and dot as decimal separator and rejects junk", () => {
    expect(parseNumber("12,5")).toBe(12.5);
    expect(parseNumber(" 1 200 ")).toBe(1200);
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("")).toBeNull();
  });
});

describe("totals", () => {
  // Tallene fra regnearket «Workshop – Cost Calculation»: 5 TRY = 1 NOK.
  const lines = [
    { qty: 51, unitPrice: 200 },
    { qty: 10, unitPrice: 600 },
    { qty: 18, unitPrice: 250 },
    { qty: 12, unitPrice: 240 },
    { qty: 21, unitPrice: 200 },
    { qty: 14.5, unitPrice: 500 },
  ];
  it("sums lines and converts TRY to NOK like the spreadsheet", () => {
    expect(lineTotal({ qty: 51, unitPrice: 200 })).toBe(10200);
    expect(totalOriginal(lines)).toBe(35030);
    expect(toNok(35030, "TRY", 5)).toBe(7006);
    expect(toNok(41030, "TRY", 5)).toBe(8206);
  });
  it("leaves NOK untouched and never divides by a bad rate", () => {
    expect(toNok(100, "NOK", 5)).toBe(100);
    expect(toNok(100, "TRY", 0)).toBe(0);
  });
});

describe("parseLines", () => {
  it("parses valid lines and defaults the unit", () => {
    const r = parseLines(JSON.stringify([{ item: "Kalip", qty: "51", unit: "stk", unitPrice: "200" }, { item: "kumaş", qty: "14,5", unit: "meter", unitPrice: 500 }]));
    expect("lines" in r && r.lines).toEqual([
      { item: "Kalip", qty: 51, unit: "stk", unitPrice: 200 },
      { item: "kumaş", qty: 14.5, unit: "meter", unitPrice: 500 },
    ]);
  });
  it("ignores empty rows but needs at least one real line", () => {
    expect(parseLines(JSON.stringify([{ item: "", qty: "", unitPrice: "" }]))).toEqual({ error: "ingen-linjer" });
    expect(parseLines("[]")).toEqual({ error: "ingen-linjer" });
  });
  it("rejects a half-filled or negative line instead of dropping it silently", () => {
    expect(parseLines(JSON.stringify([{ item: "Kalip", qty: "", unitPrice: "200" }]))).toEqual({ error: "ugyldig-linje" });
    expect(parseLines(JSON.stringify([{ item: "Kalip", qty: "-1", unitPrice: "200" }]))).toEqual({ error: "ugyldig-linje" });
    expect(parseLines("ikke json")).toEqual({ error: "ugyldig-linje" });
  });
});

describe("validReceiptPaths", () => {
  const uid = "11111111-1111-1111-1111-111111111111";
  const file = "22222222-2222-2222-2222-222222222222";
  it("keeps only files inside the user's own folder", () => {
    const raw = [`${uid}/${file}.jpg`, `99999999-9999-9999-9999-999999999999/${file}.jpg`, `${uid}/../x.jpg`, "tull"].join("\n");
    expect(validReceiptPaths(raw, uid)).toEqual([`${uid}/${file}.jpg`]);
  });
  it("accepts the shared public folder but nothing outside it", () => {
    const raw = [`public/${file}.png`, `${uid}/${file}.png`, `public/x/${file}.png`].join("\n");
    expect(validReceiptPaths(raw, "public")).toEqual([`public/${file}.png`]);
  });
});

describe("expensesCsv", () => {
  const row: ExpenseRow = {
    id: "1", created_by_name: "Merve", created_by_email: "m@x.no", expense_date: "2026-11-20", purpose: "Workshop",
    description: "=SUM(A1)", currency: "TRY", exchange_rate: 5, total_original: 41030, total_nok: 8206, receipts: ["a", "b"],
    no_receipt: false, status: "godkjent", decision_note: null, decided_at: null, paid_at: null, created_at: "2026-11-21T10:00:00Z",
  };
  it("writes one semicolon row per expense and defuses spreadsheet formulas", () => {
    const csv = expensesCsv([row]);
    expect(csv.startsWith("﻿Dato;")).toBe(true);
    expect(csv).toContain("2026-11-20;Workshop;'=SUM(A1);Merve;m@x.no;TRY;5;41030;8206;Godkjent");
  });
});
