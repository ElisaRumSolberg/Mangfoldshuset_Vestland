import type { SupabaseClient } from "@supabase/supabase-js";
import { buildExpensePdf, type PdfReceipt } from "@/lib/expense-pdf";
import type { ExpenseLine, ExpenseRow } from "@/lib/expenses";

/** Raden slik den ligger i databasen, med opplysningene til utbetaling og underskriften. */
export type ExpenseFull = ExpenseRow & {
  lines: ExpenseLine[];
  created_by_address: string | null;
  created_by_postcode: string | null;
  bank_account: string | null;
  signature: string | null;
  signed_at: string | null;
};

const MAX_EMBED_BYTES = 20 * 1024 * 1024;

export function receiptKind(path: string): PdfReceipt["kind"] | null {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "png") return "png";
  if (ext === "pdf") return "pdf";
  return null;
}

/** Bygger utleggsskjemaet som PDF, med kvitteringene (bilder og PDF) lagt inn bak skjemaet. */
export async function expenseToPdf(supabase: SupabaseClient, e: ExpenseFull): Promise<Uint8Array> {
  const receipts: PdfReceipt[] = [];
  let bytes = 0;
  for (const path of e.receipts) {
    const kind = receiptKind(path);
    if (!kind) continue;
    const { data: blob } = await supabase.storage.from("receipts").download(path);
    if (!blob) continue;
    const buf = new Uint8Array(await blob.arrayBuffer());
    if (bytes + buf.length > MAX_EMBED_BYTES) continue;
    bytes += buf.length;
    receipts.push({ kind, bytes: buf });
  }

  const signature = e.signature?.startsWith("data:image/png;base64,")
    ? Uint8Array.from(Buffer.from(e.signature.slice("data:image/png;base64,".length), "base64"))
    : null;
  const approved = e.status === "godkjent" || e.status === "utbetalt";

  return buildExpensePdf({
    name: e.created_by_name ?? "",
    address: e.created_by_address,
    postcode: e.created_by_postcode,
    account: e.bank_account,
    date: e.expense_date,
    purpose: e.purpose,
    description: e.description,
    lines: e.lines,
    totalNok: Number(e.total_nok),
    noReceipt: e.no_receipt,
    signaturePng: signature,
    signedAt: e.signed_at ?? e.created_at,
    approvedBy: approved ? e.decided_by_email ?? "" : null,
    approvedAt: approved ? e.decided_at : null,
    paidAt: e.status === "utbetalt" ? e.paid_at : null,
    receipts,
  });
}

/** Filnavn som er trygt i e-post og på disk. */
export function pdfFileName(e: Pick<ExpenseFull, "expense_date" | "created_by_name">) {
  const who = (e.created_by_name ?? "utlegg")
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `utleggsskjema-${e.expense_date}-${who || "utlegg"}.pdf`;
}
