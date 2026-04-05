"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { applicationSchema, membershipSchema } from "@/lib/validation";
import { isRateLimited, looksLikeBot } from "@/lib/spam-guard";

const TYPES = ["frivillig", "ide", "samarbeid"] as const;
type ApplicationType = (typeof TYPES)[number];

const LABELS: Record<ApplicationType, string> = {
  frivillig: "Ny frivillig",
  ide: "Ny idé",
  samarbeid: "Ny samarbeidsforespørsel",
};

export async function submitMembership(formData: FormData) {
  if (looksLikeBot(formData)) redirect("/bli-med?sendt=medlem#medlem");

  const parsed = membershipSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    membership_type: formData.get("membership_type") === "familie" ? "familie" : "enkelt",
    birth_date: formData.get("birth_date") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    guardian: formData.get("guardian") ?? "",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) redirect("/bli-med?feil=medlem#medlem");

  if (await isRateLimited("members", parsed.data.email)) redirect("/bli-med?sendt=medlem#medlem");

  const str = (k: string) => ((formData.get(k) as string) || "").trim() || null;
  const { first_name, last_name, email, membership_type } = parsed.data;

  const family_members =
    membership_type === "familie"
      ? [2, 3, 4, 5, 6]
          .map((n) => ({ name: str(`fam_name_${n}`), birth_date: str(`fam_birth_${n}`) }))
          .filter((f) => f.name)
      : [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.from("members").insert({
      membership_type,
      family_members,
      first_name,
      last_name,
      email,
      birth_date: str("birth_date"),
      address: str("address"),
      phone: str("phone"),
      guardian: str("guardian"),
      comment: str("comment"),
      accepted_terms: formData.get("terms") === "on",
    });
  }

  if (isResendConfigured()) {
    await getResendClient().emails.send({
      from: "Mangfoldhuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Ny medlemssøknad: ${first_name} ${last_name}`,
      text: `${first_name} ${last_name} (${email}) har meldt seg inn. Se admin → Medlemmer.`,
    });
  }

  redirect("/bli-med?sendt=medlem#medlem");
}

export async function submitApplication(formData: FormData) {
  const type = formData.get("type") as ApplicationType;
  if (!TYPES.includes(type)) redirect("/bli-med");
  if (looksLikeBot(formData)) redirect(`/bli-med?sendt=${type}#${type}`);

  const parsed = applicationSchema.safeParse({
    type,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) redirect(`/bli-med?feil=${type}#${type}`);
  const { name, email } = parsed.data;
  const phone = ((formData.get("phone") as string) || null) as string | null;

  if (await isRateLimited("applications", email)) redirect(`/bli-med?sendt=${type}#${type}`);

  const data: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (["type", "name", "email", "phone"].includes(key) || key.startsWith("$ACTION")) continue;
    const values = formData.getAll(key).map(String).filter(Boolean);
    if (values.length) data[key] = values.length === 1 ? values[0] : values;
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.from("applications").insert({ type, name, email, phone, data });
  }

  if (isResendConfigured()) {
    const body = Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");
    await getResendClient().emails.send({
      from: "Mangfoldhuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `${LABELS[type]}: ${name}`,
      text: `Fra: ${name} (${email}${phone ? `, ${phone}` : ""})\n\n${body}`,
    });
  }

  redirect(`/bli-med?sendt=${type}#${type}`);
}
