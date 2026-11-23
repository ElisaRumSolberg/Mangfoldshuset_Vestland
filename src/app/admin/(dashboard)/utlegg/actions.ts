"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireEditor, requireOwner } from "@/lib/auth-guard";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { todayOslo } from "@/lib/recurring";
import { expenseCopyMessage, expenseDecisionMessage, FAKTURA_EMAIL } from "@/lib/expense-email";
import {
  isStatus,
  parseLines,
  toNok,
  totalOriginal,
  validReceiptPaths,
} from "@/lib/expenses";

const BACK = "/admin/utlegg";
const MAX_ATTACH_BYTES = 25 * 1024 * 1024;

function text(formData: FormData, key: string, max: number) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

/** Leverer inn et utlegg. Serveren regner om alle beløp selv. */
export async function submitExpense(formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) failed(BACK, "generell");

  const NEW = `${BACK}/ny`;
  const date = text(formData, "expense_date", 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || date > todayOslo()) {
    failed(NEW, "ugyldig-dato");
  }
  const purpose = text(formData, "purpose", 200);
  if (!purpose) failed(NEW, "mangler-formal");
  const name = text(formData, "by_name", 100);
  if (!name) failed(NEW, "mangler-navn");

  const currency = "NOK";
  const rate = 1;

  const parsed = parseLines(formData.get("lines"));
  if ("error" in parsed) failed(NEW, parsed.error);

  const receipts = validReceiptPaths(formData.get("receipts"), user.id);
  const noReceipt = formData.get("no_receipt") === "on";
  if (receipts.length === 0 && !noReceipt) failed(NEW, "mangler-kvittering");

  const original = totalOriginal(parsed.lines);
  const nok = toNok(original, currency, rate);
  if (!(original > 0)) failed(NEW, "ugyldig-linje");

  const description = text(formData, "description", 2000);
  const email = user.email ?? null;

  const { data: row, error } = await supabase
    .from("expenses")
    .insert({
      created_by_name: name,
      created_by_email: email,
      expense_date: date,
      purpose,
      description,
      currency,
      exchange_rate: rate,
      lines: parsed.lines,
      total_original: original,
      total_nok: nok,
      receipts,
      no_receipt: receipts.length === 0 && noReceipt,
    })
    .select("id")
    .single();
  if (error || !row) failed(NEW, "generell", error);

  // Kopi til faktura@ (med kvitteringene vedlagt så langt det er plass). Feiler dette, er utlegget likevel lagret.
  if (isResendConfigured()) {
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
      const mail = expenseCopyMessage({
        by: name,
        email,
        date,
        purpose,
        description,
        currency,
        rate,
        lines: parsed.lines,
        totalOriginal: original,
        totalNok: nok,
        receiptCount: receipts.length,
        noReceipt: receipts.length === 0,
        link: `${site}/admin/utlegg/${row.id}`,
      });
      const attachments: { filename: string; content: Buffer }[] = [];
      let bytes = 0;
      for (const path of receipts) {
        const { data: blob } = await supabase.storage.from("receipts").download(path);
        if (!blob) continue;
        const buf = Buffer.from(await blob.arrayBuffer());
        if (bytes + buf.length > MAX_ATTACH_BYTES) continue;
        bytes += buf.length;
        attachments.push({ filename: `kvittering-${attachments.length + 1}.${path.split(".").pop()}`, content: buf });
      }
      await getResendClient().emails.send(
        {
          from: process.env.RESEND_FROM ?? "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
          to: FAKTURA_EMAIL,
          replyTo: email ?? NOTIFY_EMAIL,
          attachments,
          ...mail,
        },
        { idempotencyKey: `utlegg-${row.id}` },
      );
    } catch (e) {
      console.error("[utlegg] kopi til faktura@ feilet", e);
    }
  }

  revalidatePath(BACK);
  done(BACK, "utlegg-sendt");
}

/** Kasserer (owner) setter status: godkjent, utbetalt, avvist eller tilbake til «venter». Innleveren får beskjed. */
export async function decideExpense(id: string, formData: FormData) {
  await requireOwner();
  const back = `${BACK}/${id}`;
  const decision = formData.get("decision");
  if (!isStatus(decision)) failed(back, "generell");
  const note = text(formData, "decision_note", 1000);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayOslo();
  const patch =
    decision === "ny"
      ? { status: "ny", decision_note: note, decided_by_email: null, decided_at: null, paid_at: null }
      : {
          status: decision,
          decision_note: note,
          decided_by_email: user?.email ?? null,
          decided_at: new Date().toISOString(),
          paid_at: decision === "utbetalt" ? today : null,
        };
  const { data, error } = await supabase
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select("purpose, total_nok, created_by_email")
    .maybeSingle();
  if (error) failed(back, "generell", error);
  if (!data) failed(back, "ingen-endring");

  if (isResendConfigured() && data.created_by_email && decision !== "ny") {
    try {
      const mail = expenseDecisionMessage({ purpose: data.purpose, totalNok: data.total_nok, status: decision, note });
      await getResendClient().emails.send({
        from: process.env.RESEND_FROM ?? "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
        to: data.created_by_email,
        replyTo: NOTIFY_EMAIL,
        ...mail,
      });
    } catch (e) {
      console.error("[utlegg] beskjed til innleveren feilet", e);
    }
  }

  revalidatePath(BACK);
  revalidatePath(back);
  done(BACK, "utlegg-behandlet");
}

/** Owner kan slette alle; innleveren kan trekke sitt eget så lenge det ikke er behandlet (RLS passer på det). */
export async function deleteExpense(id: string) {
  await requireEditor();
  const supabase = await createClient();
  const { data: row } = await supabase.from("expenses").select("receipts").eq("id", id).maybeSingle();
  const { data, error } = await supabase.from("expenses").delete().eq("id", id).select("id");
  if (error) failed(BACK, "generell", error);
  if (!data || data.length === 0) failed(BACK, "ingen-endring");
  if (row?.receipts?.length) await supabase.storage.from("receipts").remove(row.receipts);
  revalidatePath(BACK);
  done(BACK, "slettet");
}
