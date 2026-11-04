// Sammendrag og eksport av betalinger: ett medlem = én betaling per år.

import { buildStats, type MemberStats } from "@/lib/member-stats";

export const METHODS = ["vipps", "bank", "kontant", "kort", "annet", "ukjent"] as const;
export type Method = (typeof METHODS)[number];

export const METHOD_LABEL: Record<Method, string> = {
  vipps: "Vipps",
  bank: "Bank",
  kontant: "Kontant",
  kort: "Kort",
  annet: "Annet",
  ukjent: "Ukjent",
};

export function isMethod(v: unknown): v is Method {
  return typeof v === "string" && (METHODS as readonly string[]).includes(v);
}

export type PaymentRow = {
  id: string;
  amount: number;
  method: string;
  paid_at: string;
  covers_year: number;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    gender: string | null;
  } | null;
};

export type PaymentSummary = {
  payments: number;
  members: number;
  total: number;
  byMethod: { method: string; count: number; sum: number }[];
  stats: MemberStats;
};

/** `asOf` er datoen alderen regnes på, f.eks. 31. desember i året rapporten gjelder. */
export function summarize(rows: PaymentRow[], asOf: string): PaymentSummary {
  const memberIds = new Set<string>();
  const methods = new Map<string, { count: number; sum: number }>();
  let total = 0;
  const persons: { birth: string | null; gender: string | null }[] = [];

  for (const r of rows) {
    total += r.amount;
    const m = methods.get(r.method) ?? { count: 0, sum: 0 };
    m.count += 1;
    m.sum += r.amount;
    methods.set(r.method, m);
    if (r.member && !memberIds.has(r.member.id)) {
      memberIds.add(r.member.id);
      persons.push({ birth: r.member.birth_date, gender: r.member.gender });
    }
  }

  return {
    payments: rows.length,
    members: memberIds.size,
    total,
    byMethod: [...methods.entries()].map(([method, v]) => ({ method, ...v })).sort((a, b) => b.count - a.count),
    stats: buildStats(persons, asOf),
  };
}

/** Celler som starter med = + - @ kan bli tolket som formler i Excel. */
function cell(v: string | number | null | undefined): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Semikolonseparert CSV med BOM, som åpnes riktig i norsk Excel. */
export function paymentsCsv(rows: PaymentRow[]): string {
  const header = ["Dato", "Fornavn", "Etternavn", "Fødselsdato", "Kjønn", "Beløp (kr)", "Metode", "Dekker år"];
  const lines = rows.map((r) =>
    [
      r.paid_at,
      r.member?.first_name,
      r.member?.last_name,
      r.member?.birth_date,
      r.member?.gender,
      r.amount,
      METHOD_LABEL[r.method as Method] ?? r.method,
      r.covers_year,
    ]
      .map(cell)
      .join(";"),
  );
  return "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n") + "\r\n";
}
