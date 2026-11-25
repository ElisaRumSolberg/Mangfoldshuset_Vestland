"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { checkExpenseCode, expenseAccessToken, expenseCodeConfigured, EXPENSE_COOKIE, hasExpenseAccess } from "@/lib/expense-access";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { expenseCopyMessage, FAKTURA_EMAIL } from "@/lib/expense-email";
import { expenseToPdf, pdfFileName, type ExpenseFull } from "@/lib/expense-document";
import { looksLikeBot, isRateLimited } from "@/lib/spam-guard";
import { todayOslo } from "@/lib/recurring";
import { normalizeAccount, parseLines, parseSignature, totalOriginal, validPostcode, validReceiptPaths } from "@/lib/expenses";

const PAGE = "/utlegg";
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "heic", "pdf"];

function text(formData: FormData, key: string, max: number) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

/** Feil ord går alltid langsomt, så ordet ikke kan gjettes raskt. */
async function wrongCodeDelay() {
  await new Promise((r) => setTimeout(r, 900));
}

async function unlocked() {
  return hasExpenseAccess((await cookies()).get(EXPENSE_COOKIE)?.value);
}

/** Første steg: riktig fellesord gir en informasjonskapsel som slipper deg inn til skjemaet i 12 timer. */
export async function unlockExpenseForm(formData: FormData) {
  if (!isSupabaseConfigured() || !expenseCodeConfigured()) redirect(`${PAGE}?feil=stengt`);
  const token = expenseAccessToken();
  if (!checkExpenseCode(formData.get("code")) || !token) {
    await wrongCodeDelay();
    redirect(`${PAGE}?feil=kode`);
  }
  (await cookies()).set(EXPENSE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: PAGE,
    maxAge: 60 * 60 * 12,
  });
  redirect(PAGE);
}

export type UploadTarget = { path: string; token: string } | { error: "kode" | "feil" };

/** Gir nettleseren lov til å laste opp ÉN kvittering til den private bøtten, når fellesordet er godkjent. */
export async function receiptUploadTarget(ext: string): Promise<UploadTarget> {
  if (!isSupabaseConfigured() || !expenseCodeConfigured()) return { error: "feil" };
  if (!(await unlocked())) return { error: "kode" };
  const clean = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!ALLOWED_EXT.includes(clean)) return { error: "feil" };
  const path = `public/${crypto.randomUUID()}.${clean}`;
  const { data, error } = await createAdminClient().storage.from("receipts").createSignedUploadUrl(path);
  if (error || !data) return { error: "feil" };
  return { path, token: data.token };
}

/** Lagrer et utlegg fra en frivillig uten admin-konto. Alt regnes om på serveren. */
export async function submitPublicExpense(formData: FormData) {
  if (!isSupabaseConfigured() || !expenseCodeConfigured()) redirect(`${PAGE}?feil=stengt`);
  if (looksLikeBot(formData)) redirect(`${PAGE}/takk`); // late som om det gikk bra
  if (!(await unlocked())) redirect(PAGE);

  const date = text(formData, "expense_date", 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || date > todayOslo()) redirect(`${PAGE}?feil=dato`);
  const purpose = text(formData, "purpose", 200);
  const name = text(formData, "by_name", 100);
  const email = text(formData, "by_email", 200)?.toLowerCase() ?? null;
  const phone = text(formData, "by_phone", 40);
  if (!purpose || !name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect(`${PAGE}?feil=felt`);
  const address = text(formData, "by_address", 200);
  if (!address) redirect(`${PAGE}?feil=adresse`);
  const postcode = validPostcode(formData.get("by_postcode"));
  if (!postcode) redirect(`${PAGE}?feil=postnummer`);
  const account = normalizeAccount(formData.get("by_account"));
  if (!account) redirect(`${PAGE}?feil=konto`);
  if (!parseSignature(formData.get("signature"))) redirect(`${PAGE}?feil=signatur`);
  if (formData.get("confirm") !== "on") redirect(`${PAGE}?feil=bekreft`);

  const parsed = parseLines(formData.get("lines"));
  if ("error" in parsed) redirect(`${PAGE}?feil=${parsed.error === "ingen-linjer" ? "linjer" : "linje"}`);
  const receipts = validReceiptPaths(formData.get("receipts"), "public");
  const noReceipt = formData.get("no_receipt") === "on";
  if (receipts.length === 0 && !noReceipt) redirect(`${PAGE}?feil=kvittering`);
  const total = totalOriginal(parsed.lines);
  if (!(total > 0)) redirect(`${PAGE}?feil=linje`);

  if (await isRateLimited("expenses", email)) redirect(`${PAGE}?feil=for-mange`);

  const description = text(formData, "description", 2000);
  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("expenses")
    .insert({
      created_by: null,
      created_by_name: name,
      created_by_email: email,
      created_by_phone: phone,
      created_by_address: address,
      created_by_postcode: postcode,
      bank_account: account,
      signature: formData.get("signature"),
      signed_at: new Date().toISOString(),
      source: "lenke",
      expense_date: date,
      purpose,
      description,
      currency: "NOK",
      exchange_rate: 1,
      lines: parsed.lines,
      total_original: total,
      total_nok: total,
      receipts,
      no_receipt: receipts.length === 0 && noReceipt,
    })
    .select("*")
    .single();
  if (error || !row) {
    console.error("[utlegg] lagring feilet", error);
    redirect(`${PAGE}?feil=lagring`);
  }

  if (isResendConfigured()) {
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
      const full = row as ExpenseFull;
      const mail = expenseCopyMessage({
        by: name,
        email,
        phone,
        date,
        purpose,
        description,
        currency: "NOK",
        rate: 1,
        lines: parsed.lines,
        totalOriginal: total,
        totalNok: total,
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

  redirect(`${PAGE}/takk`);
}
