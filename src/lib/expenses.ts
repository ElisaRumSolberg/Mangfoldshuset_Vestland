// Utlegg (masraf formu): beregning, validering og eksport. Serveren regner alltid selv om;
// summene nettleseren viser er bare en hjelp underveis.

import { csvCell } from "@/lib/payments-report";

export const CURRENCIES = ["NOK", "TRY", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const UNITS = ["stk", "meter", "kg", "liter", "pakke", "time"] as const;
export type Unit = (typeof UNITS)[number];

export const STATUSES = ["ny", "godkjent", "utbetalt", "avvist"] as const;
export type ExpenseStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<ExpenseStatus, string> = {
  ny: "Venter på godkjenning",
  godkjent: "Godkjent",
  utbetalt: "Utbetalt",
  avvist: "Avvist",
};

/** Fargemerke for statusen i admin (Tailwind-klasser). */
export const STATUS_TINT: Record<string, string> = {
  ny: "bg-[#F5EAD5] text-[#93701F]",
  godkjent: "bg-[#EAF0E9] text-green-dark",
  utbetalt: "bg-[#E3EEF5] text-[#1F5A7A]",
  avvist: "bg-[#F7E9E9] text-fig",
};

export const MAX_LINES = 40;
export const MAX_RECEIPTS = 10;

export type ExpenseLine = { item: string; qty: number; unit: Unit; unitPrice: number };

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}

export function isUnit(v: unknown): v is Unit {
  return typeof v === "string" && (UNITS as readonly string[]).includes(v);
}

export function isStatus(v: unknown): v is ExpenseStatus {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Tall fra et skjema: godtar både komma og punktum som desimaltegn. */
export function parseNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function lineTotal(l: Pick<ExpenseLine, "qty" | "unitPrice">) {
  return round2(l.qty * l.unitPrice);
}

export function totalOriginal(lines: Pick<ExpenseLine, "qty" | "unitPrice">[]) {
  return round2(lines.reduce((sum, l) => sum + lineTotal(l), 0));
}

/** «Kurs» er hvor mange enheter av valutaen som tilsvarer 1 NOK (som i regnearket: 5 TRY = 1 NOK). */
export function toNok(amount: number, currency: Currency, rate: number) {
  if (currency === "NOK") return round2(amount);
  if (!(rate > 0)) return 0;
  return round2(amount / rate);
}

/** Leser linjene fra JSON-feltet i skjemaet. Ugyldige linjer gir feil i stedet for å bli stille droppet. */
export function parseLines(raw: unknown): { lines: ExpenseLine[] } | { error: "ingen-linjer" | "ugyldig-linje" } {
  let data: unknown;
  try {
    data = JSON.parse(typeof raw === "string" ? raw : "[]");
  } catch {
    return { error: "ugyldig-linje" };
  }
  if (!Array.isArray(data)) return { error: "ugyldig-linje" };
  const filled = data.filter((l) => l && typeof l === "object" && (String((l as { item?: unknown }).item ?? "").trim() !== ""));
  if (filled.length === 0) return { error: "ingen-linjer" };
  if (filled.length > MAX_LINES) return { error: "ugyldig-linje" };

  const lines: ExpenseLine[] = [];
  for (const l of filled as Record<string, unknown>[]) {
    const item = String(l.item ?? "").trim().slice(0, 200);
    const qty = parseNumber(l.qty);
    const unitPrice = parseNumber(l.unitPrice);
    const unit = isUnit(l.unit) ? l.unit : "stk";
    if (!item || qty === null || unitPrice === null || qty <= 0 || unitPrice < 0 || qty > 100000 || unitPrice > 10000000) {
      return { error: "ugyldig-linje" };
    }
    lines.push({ item, qty, unit, unitPrice });
  }
  return { lines };
}

/** Kvitteringsstier som tilhører brukeren: «<bruker-id>/<fil>». Alt annet avvises. */
export function validReceiptPaths(raw: unknown, folder: string): string[] {
  if (typeof raw !== "string") return [];
  const re = new RegExp(`^${folder.replace(/[^a-z0-9-]/gi, "")}/[0-9a-f-]{36}\\.[a-z0-9]{2,5}$`, "i");
  const out: string[] = [];
  for (const p of raw.split("\n").map((s) => s.trim()).filter(Boolean)) {
    if (re.test(p)) out.push(p);
  }
  return [...new Set(out)].slice(0, MAX_RECEIPTS);
}

export function fmtMoney(n: number, currency: string = "NOK") {
  return `${n.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export type ExpenseRow = {
  id: string;
  created_by_name: string | null;
  created_by_email: string | null;
  created_by_phone?: string | null;
  source?: string;
  expense_date: string;
  purpose: string;
  description: string | null;
  currency: string;
  exchange_rate: number;
  total_original: number;
  total_nok: number;
  receipts: string[];
  no_receipt: boolean;
  status: string;
  decision_note: string | null;
  decided_by_email?: string | null;
  decided_at: string | null;
  paid_at: string | null;
  created_at: string;
};

/** Semikolonseparert CSV med BOM (åpnes riktig i norsk Excel), sortert etter dato. */
export function expensesCsv(rows: ExpenseRow[]): string {
  const header = [
    "Dato", "Formål", "Beskrivelse", "Levert av", "E-post", "Valuta", "Kurs (valuta per 1 NOK)",
    "Beløp i valuta", "Beløp i NOK", "Status", "Utbetalt dato", "Antall kvitteringer", "Merknad",
  ];
  const sorted = [...rows].sort((a, b) => a.expense_date.localeCompare(b.expense_date) || a.created_at.localeCompare(b.created_at));
  const lines = sorted.map((r) =>
    [
      r.expense_date, r.purpose, r.description, r.created_by_name, r.created_by_email, r.currency,
      r.currency === "NOK" ? "" : r.exchange_rate, r.total_original, r.total_nok,
      isStatus(r.status) ? STATUS_LABEL[r.status] : r.status, r.paid_at, r.no_receipt ? "mangler" : r.receipts.length, r.decision_note,
    ]
      .map(csvCell)
      .join(";"),
  );
  return "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n") + "\r\n";
}

// --- Opplysninger til utbetaling (som på utleggsskjemaet) ---

/** Norsk kontonummer: 11 siffer med gyldig kontrollsiffer (mod 11). Mellomrom og punktum godtas. */
export function normalizeAccount(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[\s.]/g, "");
  if (!/^\d{11}$/.test(digits)) return null;
  const w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = w.reduce((s, x, i) => s + x * Number(digits[i]), 0);
  const check = (11 - (sum % 11)) % 11;
  if (check === 10 || check !== Number(digits[10])) return null;
  return digits;
}

export function formatAccount(digits: string) {
  return digits.length === 11 ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}` : digits;
}

export function validPostcode(raw: unknown): string | null {
  return typeof raw === "string" && /^\d{4}$/.test(raw.trim()) ? raw.trim() : null;
}

const MAX_SIGNATURE_BYTES = 150 * 1024;

/** Underskriften kommer som PNG i en data-adresse. Alt annet (annen filtype, for stor, ikke PNG) avvises. */
export function parseSignature(raw: unknown): Uint8Array | null {
  if (typeof raw !== "string" || !raw.startsWith("data:image/png;base64,")) return null;
  const b64 = raw.slice("data:image/png;base64,".length);
  if (b64.length > MAX_SIGNATURE_BYTES * 1.4 || !/^[A-Za-z0-9+/=]+$/.test(b64)) return null;
  const bytes = Uint8Array.from(Buffer.from(b64, "base64"));
  const magic = [0x89, 0x50, 0x4e, 0x47];
  if (bytes.length < 200 || bytes.length > MAX_SIGNATURE_BYTES || magic.some((m, i) => bytes[i] !== m)) return null;
  return bytes;
}
