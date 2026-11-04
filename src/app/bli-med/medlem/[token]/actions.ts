"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAfterSave } from "@/lib/public-submission";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { looksLikeBot } from "@/lib/spam-guard";
import { familyMembersSchema } from "@/lib/validation";
import { MAX_HOUSEHOLD, splitName } from "@/lib/household";
import { ageOn } from "@/lib/membership-fee";
import { todayOslo } from "@/lib/recurring";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FAIL = { error: "Kunne ikke legge til personen. Sjekk feltene og prøv igjen." };

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

  redirect(`/bli-med/medlem/${token}?lagt=1&betal=${created.pay_token}`);
}
