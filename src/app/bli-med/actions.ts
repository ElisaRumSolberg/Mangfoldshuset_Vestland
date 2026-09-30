"use server";

import { redirect } from "next/navigation";
import { savePublicSubmission, notifyAfterSave } from "@/lib/public-submission";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { applicationSchema, membershipSchema, familyMembersSchema } from "@/lib/validation";
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
  if (formData.get("terms") !== "on") return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  const parsed = membershipSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    membership_type: formData.get("membership_type"),
    birth_date: formData.get("birth_date") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    guardian: formData.get("guardian") ?? "",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  if (await isRateLimited("members", parsed.data.email)) return { error: "For mange innsendinger. Vent litt og prøv igjen." };

  const str = (k: string) => typeof formData.get(k) === "string" ? (formData.get(k) as string).trim() : "";
  const { first_name, last_name, email, membership_type } = parsed.data;

  const family = familyMembersSchema.safeParse(
    membership_type === "familie"
      ? [2, 3, 4, 5, 6]
          .map((n) => ({ name: str(`fam_name_${n}`), birth_date: str(`fam_birth_${n}`) }))
          .filter((f) => f.name)
      : []);
  if (!family.success) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };
  const family_members = family.data;

  const saved = await savePublicSubmission("members", {
      membership_type,
      family_members,
      first_name,
      last_name,
      email,
      birth_date: parsed.data.birth_date || null,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      guardian: parsed.data.guardian || null,
      comment: parsed.data.comment || null,
      accepted_terms: formData.get("terms") === "on",
    });
  if (!saved) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  if (isResendConfigured()) {
    await notifyAfterSave(() => getResendClient().emails.send({
      from: "Mangfoldshuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Ny medlemssøknad: ${first_name} ${last_name}`,
      text: `${first_name} ${last_name} (${email}) har meldt seg inn. Se admin → Medlemmer.`,
    }));
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
  if (!parsed.success) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };
  const { name, email } = parsed.data;
  const phone = parsed.data.phone || null;

  if (await isRateLimited("applications", email)) return { error: "For mange innsendinger. Vent litt og prøv igjen." };

  const data: Record<string, string | string[]> = {};
  const allowed = ["interesser", "ferdigheter", "tilgjengelighet", "type_bidrag", "ide", "malgruppe", "hjelp", "kommentar", "organisasjon", "tema", "melding"];
  for (const key of new Set(formData.keys())) {
    if (!allowed.includes(key)) continue;
    const raw = formData.getAll(key);
    if (raw.length > 10 || raw.some(v => typeof v !== "string" || v.length > 5000)) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };
    const values = raw.map(String).map(v => v.trim()).filter(Boolean);
    if (values.length) data[key] = values.length === 1 ? values[0] : values;
  }
  if ((type === "ide" && !data.ide) || (type === "samarbeid" && !data.organisasjon)) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  const saved = await savePublicSubmission("applications", { type, name, email, phone, data });
  if (!saved) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  if (isResendConfigured()) {
    const body = Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");
    await notifyAfterSave(() => getResendClient().emails.send({
      from: "Mangfoldshuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `${LABELS[type]}: ${name}`,
      text: `Fra: ${name} (${email}${phone ? `, ${phone}` : ""})\n\n${body}`,
    }));
  }

  redirect(`/bli-med?sendt=${type}#${type}`);
}
