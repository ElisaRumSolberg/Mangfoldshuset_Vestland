import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildExpensePdf, nbDate, type PdfExpense } from "./expense-pdf";

const PNG_1x1 = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));

const base: PdfExpense = {
  name: "Şükrü Öztürk",
  address: "Arne Abrahamsens vei 1",
  postcode: "5161",
  account: "86011117947",
  date: "2026-11-20",
  purpose: "Workshop – Kalıp ve kumaş",
  description: "Alışveriş için ödendi 🙂 (emoji ve Türkçe karakterler: ğ ı İ ş)",
  lines: [
    { item: "Kalıp", qty: 51, unit: "stk", unitPrice: 40 },
    { item: "Kumaş", qty: 14.5, unit: "meter", unitPrice: 100 },
  ],
  totalNok: 3490,
  noReceipt: false,
  signaturePng: PNG_1x1,
  signedAt: "2026-11-23",
  approvedBy: null,
  approvedAt: null,
  paidAt: null,
  receipts: [],
};

describe("buildExpensePdf", () => {
  it("builds a valid one-page PDF with Turkish letters, an emoji and a signature", async () => {
    const bytes = await buildExpensePdf(base);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    if (process.env.WRITE_SAMPLE_PDF) writeFileSync(process.env.WRITE_SAMPLE_PDF, bytes);
  });

  it("continues on a second page when there are many lines and shows who approved", async () => {
    const lines = Array.from({ length: 45 }, (_, i) => ({ item: `Vare ${i + 1} med en ganske lang beskrivelse som må kortes ned for å passe i tabellen`, qty: 1, unit: "stk" as const, unitPrice: 10 }));
    const bytes = await buildExpensePdf({ ...base, lines, totalNok: 450, approvedBy: "Serap", approvedAt: "2026-11-24", paidAt: "2026-11-25" });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it("appends receipt images and PDFs behind the form, and skips a broken attachment", async () => {
    const receiptPdf = await PDFDocument.create();
    receiptPdf.addPage([200, 200]);
    const bytes = await buildExpensePdf({
      ...base,
      receipts: [
        { kind: "png", bytes: PNG_1x1 },
        { kind: "pdf", bytes: await receiptPdf.save() },
        { kind: "jpg", bytes: Uint8Array.from([1, 2, 3]) },
      ],
    });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it("formats Norwegian dates", () => {
    expect(nbDate("2026-11-23")).toBe("23.11.2026");
    expect(nbDate(null)).toBe("");
  });
});
