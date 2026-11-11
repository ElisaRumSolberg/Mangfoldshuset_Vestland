"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAfterSave } from "@/lib/public-submission";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { looksLikeBot } from "@/lib/spam-guard";
import { familyMembersSchema } from "@/lib/validation";
import { MAX_HOUSEHOLD, splitName } from "@/lib/household";
import { ageOn, feeForPerson } from "@/lib/membership-fee";
import { coverageYear, freeMembershipEnd, isFreePeriod } from "@/lib/membership-year";
import { todayOslo } from "@/lib/recurring";
import { createPayment, newReference, toOre, vippsEnv } from "@/lib/vipps";
import { SITE } from "@/lib/vipps-server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FAIL = { error: "Kunne ikke legge til personen. Sjekk feltene og prøv igjen." };

/**
 * Starter en Vipps-betaling for én person. `payToken` er personens egen hemmelige lenke. Beløp og år regnes
 * ut her på serveren, aldri fra nettleseren. Sender kunden videre til Vipps.
 */
export async function startVippsPayment(payToken: string) {
  if (!UUID.test(payToken)) redirect("/bli-med");
  const back = `/bli-med/medlem/${payToken}`;
  const cfg = vippsEnv();
  if (!cfg || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect(`${back}?vipps=feil`);

  const supabase = createAdminClient();
  const { data: m } = await supabase
    .from("members")
    .select("id, first_name, last_name, birth_date, expires_at")
    .eq("pay_token", payToken)
    .maybeSingle();
  if (!m) redirect("/bli-med");

  const today = todayOslo();
  const covers = coverageYear(today, m.expires_at);
  // Maks ett år frem i tid, så et dobbeltklikk ikke betaler flere år.
  if (covers > Number(today.slice(0, 4)) + 1) redirect(back);

  const reference = newReference();
  const amountOre = toOre(feeForPerson(m.birth_date, today));
  const { error } = await supabase.from("vipps_payments").insert({
    reference,
    member_id: m.id,
    covers_year: covers,
    amount_ore: amountOre,
  });
  if (error) redirect(`${back}?vipps=feil`);

  let redirectUrl: string;
  try {
    ({ redirectUrl } = await createPayment(cfg!, {
      reference,
      amountOre,
      description: `Medlemskap ${covers} – ${m.first_name} ${m.last_name}`,
      returnUrl: `${SITE()}/bli-med/betalt/${reference}`,
    }));
  } catch {
    await supabase.from("vipps_payments").update({ status: "failed" }).eq("reference", reference);
    redirect(`${back}?vipps=feil`);
  }
  redirect(redirectUrl!);
}

/**
 * Et medlem som har betalt, kan legge til en annen person (f.eks. i familien). Den nye personen er eget
 * medlem med egen betaling, og må betale selv før vedkommende kan legge til flere.
 */
export async function addHouseholdMember(token: string, formData: FormData) {
  if (!UUID.test(token)) redirect("/bli-med");
  if (looksLikeBot(formData)) redirect(`/bli-med/medlem/${token}`);
  if (formData.get("terms") !== "on") return FAIL;

  const str = (k: string) => (typeof formData.get(k) === "string" ? (formData.get(k) as string).trim() : "");
  const person = familyMembersSchema.safeParse([
    { name: str("name"), birth_date: str("birth_date"), gender: str("gender") },
  ]);
  if (!person.success || person.data.length !== 1) return FAIL;
  const { name, birth_date, gender } = person.data[0];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return FAIL;
  const supabase = createAdminClient();

  const { data: adder } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, phone, address, expires_at, household_id")
    .eq("pay_token", token)
    .maybeSingle();
  if (!adder) return FAIL;

  const today = todayOslo();
  if (!adder.expires_at || adder.expires_at < today) {
    return { error: "Du må betale din egen kontingent først. Når betalingen er registrert, kan du legge til flere." };
  }

  const household_id = adder.household_id ?? adder.id;
  if (!adder.household_id) {
    const { error } = await supabase.from("members").update({ household_id }).eq("id", adder.id);
    if (error) return FAIL;
  }
  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("household_id", household_id);
  if ((count ?? 0) >= MAX_HOUSEHOLD) {
    return { error: "Du har lagt til så mange personer som går an her. Ta kontakt med oss hvis flere skal være med." };
  }

  const under18 = ageOn(birth_date, today) < 18;
  const { data: created, error } = await supabase.from("members").insert({
    ...splitName(name, adder.last_name),
    birth_date,
    gender,
    email: adder.email,
    phone: adder.phone,
    address: adder.address,
    guardian: under18 ? `${adder.first_name} ${adder.last_name}` : null,
    accepted_terms: true,
    membership_type: "familie",
    family_members: [],
    household_id,
    // I gratisperioden er den nye personen medlem med en gang.
    ...(isFreePeriod(today) ? { expires_at: freeMembershipEnd() } : {}),
  }).select("pay_token").single();
  if (error || !created) return FAIL;

  if (isResendConfigured()) {
    await notifyAfterSave(() =>
      getResendClient().emails.send({
        from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
        to: NOTIFY_EMAIL,
        subject: `Ny person lagt til: ${name}`,
        text: `${adder.first_name} ${adder.last_name} (${adder.email}) la til ${name}. Personen er eget medlem og betaler selv. Se admin → Medlemmer.`,
      }),
    );
  }

  redirect(isFreePeriod(today) ? `/bli-med/medlem/${token}?lagt=1` : `/bli-med/medlem/${token}?lagt=1&betal=${created.pay_token}`);
}
