import { fmtMoney, STATUS_LABEL, type ExpenseLine, type ExpenseStatus } from "@/lib/expenses";

export const FAKTURA_EMAIL = process.env.FAKTURA_EMAIL ?? "faktura@mangfoldshusetvestland.no";

type Submitted = {
  by: string;
  email: string | null;
  phone?: string | null;
  date: string;
  purpose: string;
  description: string | null;
  currency: string;
  rate: number;
  lines: ExpenseLine[];
  totalOriginal: number;
  totalNok: number;
  receiptCount: number;
  noReceipt: boolean;
  link: string;
};

/** Kopi av et innlevert utlegg til faktura@-kontoen, så regnskapsføreren har alt på ett sted. */
export function expenseCopyMessage(e: Submitted): { subject: string; text: string } {
  const lines = e.lines
    .map((l) => `- ${l.item}: ${l.qty} ${l.unit} × ${fmtMoney(l.unitPrice, e.currency)} = ${fmtMoney(l.qty * l.unitPrice, e.currency)}`)
    .join("\n");
  const rate = e.currency === "NOK" ? "" : `\nKurs: 1 NOK = ${e.rate} ${e.currency}`;
  return {
    subject: `Utlegg: ${e.purpose} (${fmtMoney(e.totalNok)})`,
    text: [
      `Nytt utlegg levert inn av ${e.by}${e.email ? ` (${e.email})` : ""}${e.phone ? `, tlf. ${e.phone}` : ""}.`,
      "",
      `Dato: ${e.date}`,
      `Gjelder: ${e.purpose}`,
      e.description ? `Beskrivelse: ${e.description}` : "",
      "",
      lines,
      "",
      `Sum: ${fmtMoney(e.totalOriginal, e.currency)}${rate}`,
      `Sum i NOK: ${fmtMoney(e.totalNok)}`,
      e.noReceipt ? "Kvittering mangler." : `Kvitteringer: ${e.receiptCount} (vedlagt hvis de er små nok, ellers i admin).`,
      "",
      `Se og behandle i admin: ${e.link}`,
    ]
      .filter((s, i, a) => !(s === "" && a[i - 1] === ""))
      .join("\n"),
  };
}

/** Beskjed til den som leverte utlegget når regnskapet har behandlet det. */
export function expenseDecisionMessage(
  e: { purpose: string; totalNok: number; status: ExpenseStatus; note: string | null },
): { subject: string; text: string } {
  const what: Record<ExpenseStatus, string> = {
    ny: "er satt tilbake til «venter på godkjenning»",
    godkjent: "er godkjent",
    utbetalt: "er godkjent og utbetalt",
    avvist: "er dessverre avvist",
  };
  return {
    subject: `Utlegget ditt: ${STATUS_LABEL[e.status].toLowerCase()}`,
    text: `Hei!\n\nUtlegget ditt «${e.purpose}» (${fmtMoney(e.totalNok)}) ${what[e.status]}.${e.note ? `\n\nMerknad: ${e.note}` : ""}\n\nHar du spørsmål, svar på denne e-posten.\n\nMangfoldshuset Vestland`,
  };
}
