"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";
import { yearEnd } from "@/lib/membership-year";

/** Sletter en betaling og setter medlemmets betalt/utløp tilbake til siste gjenværende betaling. */
export async function deletePayment(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const back = "/admin/betalinger";

  const { data: payment } = await supabase.from("member_payments").select("member_id").eq("id", id).single();
  if (!payment) failed(back, "generell");

  const { error } = await supabase.from("member_payments").delete().eq("id", id);
  if (error) failed(back, "generell", error);

  const { data: rest } = await supabase
    .from("member_payments")
    .select("covers_year, paid_at")
    .eq("member_id", payment!.member_id)
    .order("covers_year", { ascending: false })
    .limit(1);
  const latest = rest?.[0];
  const { error: updateError } = await supabase
    .from("members")
    .update(latest ? { paid_at: latest.paid_at, expires_at: yearEnd(latest.covers_year) } : { paid_at: null, expires_at: null })
    .eq("id", payment!.member_id);
  if (updateError) failed(back, "generell", updateError);

  revalidatePath(back);
  revalidatePath("/admin/medlemmer");
  done(back, "slettet");
}
