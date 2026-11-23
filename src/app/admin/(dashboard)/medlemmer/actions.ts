"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";
import { feeForPerson } from "@/lib/membership-fee";
import { coverageYear, yearEnd } from "@/lib/membership-year";
import { isMethod } from "@/lib/payments-report";
import { todayOslo } from "@/lib/recurring";
import { notifyAfterSave } from "@/lib/public-submission";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { memberPageUrl, receiptMessage } from "@/lib/receipt-email";
import { groupByEmail, recentlyRequested, renewalMessage } from "@/lib/renewal-email";
import { isVippsPublic } from "@/lib/vipps";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

const GENDERS = ["kvinne", "mann", "annet", "ukjent"];

function gender(v: FormDataEntryValue | null): string | null {
  return typeof v === "string" && GENDERS.includes(v) ? v : null;
}

function dateOrNull(v: FormDataEntryValue | null): string | null {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

/** Registrerer én betaling for ett medlem: en rad i betalingsoversikten og nytt utløp (31. desember). */
export async function markPaid(id: string, formData: FormData) {
  await requireOwner();
  const supabase = await createClient();
  const { data: m } = await supabase
    .from("members")
    .select("expires_at, birth_date, first_name, email, pay_token")
    .eq("id", id)
    .single();
  if (!m) failed("/admin/medlemmer", "generell");

  const today = todayOslo();
  const covers = coverageYear(today, m.expires_at);
  // Maks ett år frem i tid, så et dobbeltklikk ikke betaler flere år.
  if (covers > Number(today.slice(0, 4)) + 1) failed("/admin/medlemmer", "allerede-betalt");

  const method = formData.get("method");
  const { data: payment, error: payError } = await supabase
    .from("member_payments")
    .insert({
      member_id: id,
      covers_year: covers,
      amount: feeForPerson(m.birth_date, today),
      method: isMethod(method) ? method : "bank",
      paid_at: today,
    })
    .select("id")
    .single();
  if (payError || !payment) failed("/admin/medlemmer", payError?.code === "23505" ? "allerede-betalt" : "generell", payError ?? undefined);

  const { error } = await supabase
    .from("members")
    .update({ paid_at: today, expires_at: yearEnd(covers) })
    .eq("id", id);
  if (error) {
    await supabase.from("member_payments").delete().eq("id", payment!.id);
    failed("/admin/medlemmer", "generell", error);
  }
  if (isResendConfigured() && m.email) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
    const mail = receiptMessage({ first_name: m.first_name, expires_at: yearEnd(covers), pay_token: m.pay_token }, site);
    await notifyAfterSave(() => getResendClient().emails.send({
      from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
      to: m.email,
      ...mail,
    }));
  }
  revalidatePath("/admin/medlemmer");
  revalidatePath("/admin/betalinger");
  done("/admin/medlemmer", "betalt");
}

/** Sender kvitteringen på nytt, f.eks. når medlemmet sier de ikke fikk beskjed om betalingen. */
export async function sendReceipt(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { data: m } = await supabase
    .from("members")
    .select("first_name, email, expires_at, pay_token")
    .eq("id", id)
    .single();
  // Kvittering gir bare mening for et medlemskap som er betalt og ikke utløpt.
  if (!m || !m.email || !m.expires_at || m.expires_at < todayOslo() || !isResendConfigured()) {
    failed("/admin/medlemmer", "generell");
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
  const { error } = await getResendClient().emails.send({
    from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
    to: m!.email,
    ...receiptMessage({ first_name: m!.first_name, expires_at: m!.expires_at, pay_token: m!.pay_token }, site),
  });
  if (error) failed("/admin/medlemmer", "generell");
  done("/admin/medlemmer", "kvittering");
}

export async function addMember(formData: FormData) {
  await requireOwner();
  const supabase = await createClient();
  const expires = (formData.get("expires_at") as string) || null;

  const { data: created, error } = await supabase.from("members").insert({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    birth_date: (formData.get("birth_date") as string) || null,
    gender: gender(formData.get("gender")),
    membership_type: formData.get("membership_type") === "familie" ? "familie" : "enkelt",
    accepted_terms: true,
    paid_at: expires ? iso(new Date()) : null,
    expires_at: expires,
  }).select("id").single();
  if (error) failed("/admin/medlemmer", "generell", error);
  if (expires && created) {
    // Et eksisterende medlem som legges inn som betalt, skal også stå i betalingsoversikten.
    await supabase.from("member_payments").insert({
      member_id: created.id,
      covers_year: Number(expires.slice(0, 4)),
      amount: feeForPerson((formData.get("birth_date") as string) || null, todayOslo()),
      method: "ukjent",
      reference: "Lagt inn manuelt som eksisterende medlem",
      paid_at: todayOslo(),
    });
  }
  revalidatePath("/admin/medlemmer");
  revalidatePath("/admin/betalinger");
  done("/admin/medlemmer", "lagt-til");
}

export async function deleteMember(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) failed("/admin/medlemmer", "generell", error);
  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "slettet");
}

export async function updateMember(id: string, formData: FormData) {
  await requireOwner();
  const supabase = await createClient();
  const back = `/admin/medlemmer/${id}`;

  const text = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const first = text("first_name");
  const last = text("last_name");
  const email = text("email");
  if (!first || !last || !email) failed(back, "mangler-felt");

  const family = [1, 2, 3, 4, 5]
    .map((n) => ({
      name: text(`fam_name_${n}`),
      birth_date: dateOrNull(formData.get(`fam_birth_${n}`)),
      gender: gender(formData.get(`fam_gender_${n}`)),
    }))
    .filter((f) => f.name);

  const { error, data } = await supabase
    .from("members")
    .update({
      first_name: first,
      last_name: last,
      email,
      phone: text("phone"),
      address: text("address"),
      birth_date: dateOrNull(formData.get("birth_date")),
      gender: gender(formData.get("gender")),
      membership_type: formData.get("membership_type") === "familie" ? "familie" : "enkelt",
      family_members: family,
    })
    .eq("id", id)
    .select();
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");

  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "lagret");
}

type RenewalMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string | null;
  expires_at: string | null;
  pay_token: string;
  renewal_requested_at: string | null;
};

const RENEWAL_COLUMNS = "id, first_name, last_name, email, birth_date, expires_at, pay_token, renewal_requested_at";

/** Sender «forny medlemskapet»-e-post (én per e-postadresse) og husker at den er sendt. Returnerer antall e-poster. */
async function sendRenewal(members: RenewalMember[]): Promise<number> {
  if (!isResendConfigured()) failed("/admin/medlemmer", "generell");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
  const today = todayOslo();
  const supabase = await createClient();
  const from = process.env.RESEND_FROM ?? "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>";
  let sent = 0;

  for (const group of groupByEmail(members)) {
    const people = group.map((m) => ({
      name: `${m.first_name} ${m.last_name}`,
      fee: feeForPerson(m.birth_date, today),
      link: memberPageUrl(site, m.pay_token),
      expires: m.expires_at ?? "",
      coverYear: coverageYear(today, m.expires_at),
    }));
    const mail = renewalMessage(group[0].first_name, people, isVippsPublic());
    const { error } = await getResendClient().emails.send(
      { from, to: group[0].email, replyTo: NOTIFY_EMAIL, ...mail },
      { idempotencyKey: `renewal-${group.map((m) => m.id).join("-")}-${today}`.slice(0, 250) },
    );
    if (error) continue;
    await supabase.from("members").update({ renewal_requested_at: new Date().toISOString() }).in("id", group.map((m) => m.id));
    sent += 1;
  }
  return sent;
}

/** E-post om fornyelse til ett medlem (utløpt eller ikke betalt). */
export async function sendRenewalToMember(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { data: m } = await supabase.from("members").select(RENEWAL_COLUMNS).eq("id", id).maybeSingle();
  if (!m || !m.email || (m.expires_at && m.expires_at >= todayOslo())) failed("/admin/medlemmer", "generell");
  const sent = await sendRenewal([m as RenewalMember]);
  if (sent === 0) failed("/admin/medlemmer", "generell");
  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "fornyelse-sendt");
}

/** E-post om fornyelse til alle utløpte medlemmer som ikke har fått en de siste 14 dagene. */
export async function sendRenewalToExpired() {
  await requireOwner();
  const today = todayOslo();
  const supabase = await createClient();
  const { data, error } = await supabase.from("members").select(RENEWAL_COLUMNS).lt("expires_at", today).limit(300);
  if (error) failed("/admin/medlemmer", "generell", error);
  const due = ((data ?? []) as RenewalMember[]).filter((m) => m.email && !recentlyRequested(m.renewal_requested_at, today));
  if (due.length === 0) failed("/admin/medlemmer", "ingen-mottakere");
  const sent = await sendRenewal(due.slice(0, 100));
  if (sent === 0) failed("/admin/medlemmer", "generell");
  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "fornyelse-sendt");
}
