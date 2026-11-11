import type { SupabaseClient } from "@supabase/supabase-js";
import { yearEnd } from "@/lib/membership-year";
import { receiptMessage } from "@/lib/receipt-email";
import { capturePayment, getPayment, type VippsEnv } from "@/lib/vipps";

export type SettleResult = "paid" | "pending" | "failed" | "unknown";

type Deps = {
  supabase: SupabaseClient;
  cfg: VippsEnv;
  today: string; // ÅÅÅÅ-MM-DD, norsk tid
  site: string;
  fetchFn?: typeof fetch;
  /** Sender kvitteringen. Utelates når e-post ikke er satt opp. */
  sendMail?: (to: string, message: { subject: string; text: string }) => Promise<unknown>;
};

/**
 * Samme avstemming for en gave: sjekk mot Vipps, trekk pengene når giveren har godkjent, og marker gaven som
 * mottatt nøyaktig én gang. Det registreres ikke noe medlemskap.
 */
export async function settleVippsDonation(
  reference: string,
  deps: { supabase: SupabaseClient; cfg: VippsEnv; fetchFn?: typeof fetch },
): Promise<SettleResult> {
  const { supabase, cfg, fetchFn } = deps;
  const { data: row } = await supabase
    .from("vipps_donations")
    .select("reference, amount_ore, status")
    .eq("reference", reference)
    .maybeSingle();
  if (!row) return "unknown";
  if (row.status === "captured") return "paid";
  if (row.status === "failed") return "failed";

  const fail = async () => {
    await supabase.from("vipps_donations").update({ status: "failed", settled_at: new Date().toISOString() }).eq("reference", reference);
    return "failed" as const;
  };

  let payment = await getPayment(cfg, reference, fetchFn);
  if (["ABORTED", "EXPIRED", "TERMINATED"].includes(payment.state)) return fail();
  if (payment.state === "CREATED") return "pending";
  if (payment.authorized !== row.amount_ore) return fail();

  if (payment.captured < row.amount_ore) {
    await capturePayment(cfg, reference, row.amount_ore, fetchFn);
    payment = await getPayment(cfg, reference, fetchFn);
  }
  if (payment.captured !== row.amount_ore) {
    await supabase.from("vipps_donations").update({ status: "authorized" }).eq("reference", reference);
    return "pending";
  }
  await supabase.from("vipps_donations").update({ status: "captured", settled_at: new Date().toISOString() }).eq("reference", reference);
  return "paid";
}

/**
 * Sjekker en Vipps-betaling mot Vipps selv (vi stoler aldri på det som kommer inn fra nettleseren eller
 * webhooken), trekker pengene når kunden har godkjent, og registrerer medlemsbetalingen nøyaktig én gang.
 * Trygt å kalle flere ganger og samtidig: fra retursiden, fra webhooken og fra nattlig avstemming.
 */
export async function settleVippsPayment(reference: string, deps: Deps): Promise<SettleResult> {
  const { supabase, cfg, today, site, fetchFn, sendMail } = deps;

  const { data: row } = await supabase
    .from("vipps_payments")
    .select("reference, member_id, covers_year, amount_ore, status")
    .eq("reference", reference)
    .maybeSingle();
  if (!row) return "unknown";
  if (row.status === "captured") return "paid";
  if (row.status === "failed") return "failed";

  let payment = await getPayment(cfg, reference, fetchFn);

  if (["ABORTED", "EXPIRED", "TERMINATED"].includes(payment.state)) {
    await supabase.from("vipps_payments").update({ status: "failed", settled_at: new Date().toISOString() }).eq("reference", reference);
    return "failed";
  }
  if (payment.state === "CREATED") return "pending";

  // AUTHORIZED. Beløpet må være det vi ba om, ellers trekker vi ingenting.
  if (payment.authorized !== row.amount_ore) {
    await supabase.from("vipps_payments").update({ status: "failed", settled_at: new Date().toISOString() }).eq("reference", reference);
    return "failed";
  }
  if (payment.captured < row.amount_ore) {
    await capturePayment(cfg, reference, row.amount_ore, fetchFn);
    payment = await getPayment(cfg, reference, fetchFn);
  }
  if (payment.captured !== row.amount_ore) {
    await supabase.from("vipps_payments").update({ status: "authorized" }).eq("reference", reference);
    return "pending";
  }

  // Pengene er trukket. Registrer medlemsbetalingen (unik per person og år, så dobbel kjøring er harmløs).
  const { data: member } = await supabase
    .from("members")
    .select("first_name, email, pay_token, expires_at")
    .eq("id", row.member_id)
    .single();
  if (!member) return "pending";

  const { error: payError } = await supabase.from("member_payments").insert({
    member_id: row.member_id,
    covers_year: row.covers_year,
    amount: row.amount_ore / 100,
    method: "vipps",
    reference,
    paid_at: today,
  });
  const alreadyRecorded = payError?.code === "23505";
  if (payError && !alreadyRecorded) return "pending";

  // Utløpet flyttes aldri bakover (f.eks. om admin har registrert et lengre medlemskap i mellomtiden).
  const newExpiry = yearEnd(row.covers_year);
  if (!member.expires_at || member.expires_at < newExpiry) {
    const { error } = await supabase.from("members").update({ paid_at: today, expires_at: newExpiry }).eq("id", row.member_id);
    if (error) return "pending";
  }
  await supabase.from("vipps_payments").update({ status: "captured", settled_at: new Date().toISOString() }).eq("reference", reference);

  if (!alreadyRecorded && sendMail && member.email) {
    try {
      await sendMail(member.email, receiptMessage({ first_name: member.first_name, expires_at: newExpiry, pay_token: member.pay_token }, site));
    } catch {
      // Betalingen er registrert; admin kan sende kvittering på nytt.
    }
  }
  return "paid";
}
