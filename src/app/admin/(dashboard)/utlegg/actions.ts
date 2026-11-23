"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireEditor, requireOwner } from "@/lib/auth-guard";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { todayOslo } from "@/lib/recurring";
import { expenseCopyMessage, expenseDecisionMessage, FAKTURA_EMAIL } from "@/lib/expense-email";
import { expenseToPdf, pdfFileName, type ExpenseFull } from "@/lib/expense-document";
import {
  isStatus,
  normalizeAccount,
  parseLines,
  parseSignature,
  totalOriginal,
  validPostcode,
  validReceiptPaths,
} from "@/lib/expenses";

const BACK = "/admin/utlegg";

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
  const address = text(formData, "by_address", 200);
  if (!address) failed(NEW, "mangler-adresse");
  const postcode = validPostcode(formData.get("by_postcode"));
  if (!postcode) failed(NEW, "ugyldig-postnummer");
  const account = normalizeAccount(formData.get("by_account"));
  if (!account) failed(NEW, "ugyldig-konto");
  const signaturePng = parseSignature(formData.get("signature"));
  if (!signaturePng) failed(NEW, "mangler-signatur");
  if (formData.get("confirm") !== "on") failed(NEW, "mangler-bekreftelse");

  const parsed = parseLines(formData.get("lines"));
  if ("error" in parsed) failed(NEW, parsed.error);

  const receipts = validReceiptPaths(formData.get("receipts"), user.id);
  const noReceipt = formData.get("no_receipt") === "on";
  if (receipts.length === 0 && !noReceipt) failed(NEW, "mangler-kvittering");

  const original = totalOriginal(parsed.lines);
  if (!(original > 0)) failed(NEW, "ugyldig-linje");

  const description = text(formData, "description", 2000);
  const email = user.email ?? null;

  const { data: row, error } = await supabase
    .from("expenses")
    .insert({
      created_by_name: name,
      created_by_email: email,
      created_by_address: address,
      created_by_postcode: postcode,
      bank_account: account,
      signature: formData.get("signature"),
      signed_at: new Date().toISOString(),
      expense_date: date,
      purpose,
      description,
      currency: "NOK",
      exchange_rate: 1,
      lines: parsed.lines,
      total_original: original,
      total_nok: original,
      receipts,
      no_receipt: receipts.length === 0 && noReceipt,
    })
    .select("*")
    .single();
  if (error || !row) failed(NEW, "generell", error);

  // Kopi til faktura@ med utleggsskjemaet (og kvitteringene) som PDF. Feiler dette, er utlegget likevel lagret.
  if (isResendConfigured()) {
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
      const full = row as ExpenseFull;
      const mail = expenseCopyMessage({
        by: name,
        email,
        date,
        purpose,
        description,
        currency: "NOK",
        rate: 1,
        lines: parsed.lines,
        totalOriginal: original,
        totalNok: original,
        receiptCount: receipts.length,
        noReceipt: receipts.length === 0,
        link: `${site}/admin/utlegg/${full.id}`,
      });
      const pdf = await expenseToPdf(supabase, full);
      await getResendClient().emails.send(
        {
          from: process.env.RESEND_FROM ?? "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
          to: FAKTURA_EMAIL,
          replyTo: email ?? NOTIFY_EMAIL,
          attachments: [{ filename: pdfFileName(full), content: Buffer.from(pdf) }],
          ...mail,
        },
        { idempotencyKey: `utlegg-${full.id}` },
      );
    } catch (e) {
      console.error("[utlegg] kopi til faktura@ feilet", e);
    }
  }

  revalidatePath(BACK);
  done(BACK, "utlegg-sendt");
}

/** Owner setter status: godkjent, utbetalt, avvist eller tilbake til «venter». Innleveren får beskjed. */
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
