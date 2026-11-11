"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPayment, newDonationReference, parseDonation, toOre, vippsEnv } from "@/lib/vipps";
import { SITE } from "@/lib/vipps-server";

/**
 * Starter en gave via Vipps. Beløpet kommer fra et av de faste valgene eller et eget beløp (10–100 000 kr) og
 * kontrolleres her på serveren. Giveren sendes videre til Vipps. Vi lagrer ingen personopplysninger.
 */
export async function startVippsDonation(formData: FormData) {
  const chosen = formData.get("amount");
  const kroner = parseDonation(chosen === "annet" ? formData.get("custom") : chosen);
  const cfg = vippsEnv();
  if (!kroner || !cfg || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect("/stott-oss/feil");
  }

  const reference = newDonationReference();
  const amountOre = toOre(kroner);
  const supabase = createAdminClient();
  const { error } = await supabase.from("vipps_donations").insert({ reference, amount_ore: amountOre });
  if (error) redirect("/stott-oss/feil");

  let redirectUrl: string;
  try {
    ({ redirectUrl } = await createPayment(cfg!, {
      reference,
      amountOre,
      description: "Gave til Mangfoldshuset Vestland",
      returnUrl: `${SITE()}/stott-oss/takk/${reference}`,
    }));
  } catch {
    await supabase.from("vipps_donations").update({ status: "failed" }).eq("reference", reference);
    redirect("/stott-oss/feil");
  }
  redirect(redirectUrl!);
}
