// Utleggsskjema som PDF, i samme oppsett som foreningens skjema: opplysninger, kvitteringer med beløp,
// sum, kommentar, dato og underskrift. Kvitteringene legges inn bak skjemaet, så alt er ett bilag.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { fmtMoney, formatAccount, lineTotal, type ExpenseLine } from "@/lib/expenses";

export type PdfReceipt = { kind: "jpg" | "png" | "pdf"; bytes: Uint8Array };

export type PdfExpense = {
  name: string;
  address: string | null;
  postcode: string | null;
  account: string | null;
  date: string;
  purpose: string;
  description: string | null;
  lines: ExpenseLine[];
  totalNok: number;
  noReceipt: boolean;
  signaturePng: Uint8Array | null;
  signedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  receipts: PdfReceipt[];
};

const W = 595.28;
const H = 841.89;
const M = 48;
const INK = rgb(0.22, 0.18, 0.15);
const LINE = rgb(0.36, 0.29, 0.25);
const SOFT = rgb(0.42, 0.4, 0.38);
const BAND = [rgb(0.78, 0.72, 0.56), rgb(0.5, 0.77, 0.78), rgb(0.86, 0.43, 0.2), rgb(0.36, 0.29, 0.25)];

const dir = join(process.cwd(), "src/assets");
let assets: Promise<{ regular: Buffer; bold: Buffer; logo: Buffer }> | null = null;
function loadAssets() {
  assets ??= Promise.all([
    readFile(join(dir, "fonts/NotoSans_400Regular.ttf")),
    readFile(join(dir, "fonts/NotoSans_700Bold.ttf")),
    readFile(join(dir, "logo-pdf.png")),
  ]).then(([regular, bold, logo]) => ({ regular, bold, logo }));
  return assets;
}

/** «2026-11-23» -> «23.11.2026». */
export function nbDate(iso: string | null | undefined) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso ?? "";
}

export async function buildExpensePdf(e: PdfExpense): Promise<Uint8Array> {
  const { regular, bold, logo } = await loadAssets();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Utleggsskjema – ${e.name}`);
  doc.setProducer("Mangfoldshuset Vestland");
  const f = await doc.embedFont(regular, { subset: false });
  const fb = await doc.embedFont(bold, { subset: false });
  const logoImg = await doc.embedPng(logo);

  const known = new Set(f.getCharacterSet());
  /** Tegn fonten ikke har (emoji o.l.) blir «?» i stedet for å stoppe hele PDF-en. */
  const safe = (s: string) => Array.from(s.replace(/\s+/g, " ")).map((c) => (known.has(c.codePointAt(0)!) ? c : "?")).join("");
  const fit = (text: string, font: PDFFont, size: number, max: number) => {
    let s = safe(text);
    if (font.widthOfTextAtSize(s, size) <= max) return s;
    while (s.length > 1 && font.widthOfTextAtSize(`${s}…`, size) > max) s = s.slice(0, -1);
    return `${s}…`;
  };
  const wrap = (text: string, font: PDFFont, size: number, max: number) => {
    const out: string[] = [];
    for (const para of text.split("\n")) {
      let line = "";
      for (const word of safe(para).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(test, size) <= max) line = test;
        else {
          if (line) out.push(line);
          line = word;
        }
      }
      out.push(line);
    }
    return out;
  };

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;

  function header() {
    const lw = 130;
    const lh = (lw * logoImg.height) / logoImg.width;
    page.drawImage(logoImg, { x: (W - lw) / 2, y: H - M - lh + 10, width: lw, height: lh });
    y = H - M - lh - 4;
    const seg = (W - 2 * M) / 4;
    BAND.forEach((c, i) => page.drawRectangle({ x: M + i * seg, y, width: seg, height: 4, color: c }));
    y -= 40;
    page.drawText("Utleggsskjema", { x: M, y, size: 26, font: f, color: INK });
    y -= 26;
  }
  function ensure(h: number) {
    if (y - h < M + 20) {
      page = doc.addPage([W, H]);
      y = H - M;
    }
  }

  const colLabel = 150;
  const full = W - 2 * M;
  function row(label: string, value: string, h = 22) {
    ensure(h);
    page.drawRectangle({ x: M, y: y - h, width: full, height: h, borderColor: LINE, borderWidth: 0.8 });
    page.drawLine({ start: { x: M + colLabel, y }, end: { x: M + colLabel, y: y - h }, thickness: 0.8, color: LINE });
    page.drawText(fit(label, f, 10, colLabel - 12), { x: M + 8, y: y - h + 7, size: 10, font: f, color: INK });
    page.drawText(fit(value, f, 10.5, full - colLabel - 14), { x: M + colLabel + 8, y: y - h + 7, size: 10.5, font: f, color: INK });
    y -= h;
  }

  header();
  row("Navn", e.name);
  row("Adresse", e.address ?? "");
  row("Postnummer", e.postcode ?? "");
  row("Dato", nbDate(e.date));
  row("Prosjekt/aktivitet", e.purpose);
  row("Kontonummer til betaling", e.account ? formatAccount(e.account) : "");

  // Kvitteringer med beløp
  y -= 22;
  const amountW = 110;
  ensure(60);
  page.drawText("Beskrivelse", { x: M + colLabel - 20, y, size: 10, font: f, color: INK });
  page.drawText("Kroner", { x: M + full - amountW + 8, y, size: 10, font: f, color: INK });
  y -= 8;
  e.lines.forEach((l, i) => {
    const h = 20;
    ensure(h);
    page.drawRectangle({ x: M, y: y - h, width: full, height: h, borderColor: LINE, borderWidth: 0.8 });
    page.drawLine({ start: { x: M + full - amountW, y }, end: { x: M + full - amountW, y: y - h }, thickness: 0.8, color: LINE });
    const text = `Kvittering nr${i + 1}: ${l.item} (${l.qty} ${l.unit} × ${l.unitPrice.toLocaleString("nb-NO")})`;
    page.drawText(fit(text, f, 9.5, full - amountW - 14), { x: M + 8, y: y - h + 6, size: 9.5, font: f, color: INK });
    const amount = lineTotal(l).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    page.drawText(amount, { x: M + full - 8 - f.widthOfTextAtSize(amount, 9.5), y: y - h + 6, size: 9.5, font: f, color: INK });
    y -= h;
  });
  ensure(30);
  y -= 6;
  const sum = fmtMoney(e.totalNok);
  page.drawText("Sum:", { x: M + full - amountW - 40, y: y - 12, size: 10, font: f, color: SOFT });
  page.drawText(sum, { x: M + full - 8 - fb.widthOfTextAtSize(sum, 11), y: y - 12, size: 11, font: fb, color: INK });
  y -= 36;

  // Kommentar
  const comment = [e.description, e.noReceipt ? "Kvittering mangler." : null].filter(Boolean).join("\n");
  const cLines = comment ? wrap(comment, f, 10, full - 16) : [];
  const boxH = Math.max(64, 26 + cLines.length * 13);
  ensure(boxH + 90);
  page.drawRectangle({ x: M, y: y - boxH, width: full, height: boxH, borderColor: LINE, borderWidth: 0.8 });
  page.drawText("Kommentar:", { x: M + 8, y: y - 16, size: 10, font: f, color: INK });
  cLines.forEach((ln, i) => page.drawText(ln, { x: M + 8, y: y - 32 - i * 13, size: 10, font: f, color: INK }));
  y -= boxH + 34;

  // Dato og underskrift
  const sigX = M + 250;
  page.drawText(`Dato: ${nbDate(e.signedAt ?? e.date)}`, { x: M + 120, y: y + 4, size: 10.5, font: f, color: INK });
  page.drawLine({ start: { x: M + 150, y }, end: { x: M + 215, y }, thickness: 0.6, color: LINE });
  page.drawText("Underskrift:", { x: sigX, y: y + 4, size: 10.5, font: f, color: INK });
  page.drawLine({ start: { x: sigX + 68, y }, end: { x: M + full, y }, thickness: 0.6, color: LINE });
  if (e.signaturePng) {
    const sig = await doc.embedPng(e.signaturePng);
    const maxW = M + full - (sigX + 68);
    const sh = Math.min(48, (maxW * sig.height) / sig.width);
    const sw = (sh * sig.width) / sig.height;
    page.drawImage(sig, { x: sigX + 72, y: y + 2, width: Math.min(sw, maxW), height: sh });
  }
  y -= 16;
  if (e.signedAt) {
    page.drawText(safe(`Signert elektronisk ${nbDate(e.signedAt)} av ${e.name}`), { x: sigX, y, size: 8, font: f, color: SOFT });
    y -= 12;
  }
  if (e.approvedBy) {
    page.drawText(safe(`Godkjent av ${e.approvedBy} ${nbDate(e.approvedAt)}${e.paidAt ? `, utbetalt ${nbDate(e.paidAt)}` : ""}`), {
      x: M,
      y: y - 6,
      size: 9.5,
      font: fb,
      color: INK,
    });
  }

  // Kvitteringene bak skjemaet
  let n = 0;
  for (const r of e.receipts) {
    n += 1;
    try {
      if (r.kind === "pdf") {
        const src = await PDFDocument.load(r.bytes, { ignoreEncryption: true });
        const pages = await doc.copyPages(src, src.getPageIndices());
        pages.forEach((p) => doc.addPage(p));
        continue;
      }
      const img = r.kind === "png" ? await doc.embedPng(r.bytes) : await doc.embedJpg(r.bytes);
      const p = doc.addPage([W, H]);
      p.drawText(`Kvittering ${n} – ${safe(e.name)}, ${nbDate(e.date)}`, { x: M, y: H - M + 8, size: 9, font: f, color: SOFT });
      const scale = Math.min((W - 2 * M) / img.width, (H - 2 * M - 16) / img.height, 1.6);
      const iw = img.width * scale;
      const ih = img.height * scale;
      p.drawImage(img, { x: (W - iw) / 2, y: H - M - 8 - ih, width: iw, height: ih });
    } catch {
      // En ødelagt vedleggsfil skal ikke stoppe skjemaet; originalen ligger fortsatt i admin.
    }
  }

  return doc.save();
}
