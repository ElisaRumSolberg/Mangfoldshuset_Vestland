"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { feeForPerson } from "@/lib/membership-fee";
import { findExistingMember } from "@/lib/member-lookup";
import { existingMemberMessage } from "@/lib/receipt-email";
import { todayOslo } from "@/lib/recurring";
import { savePublicSubmission, notifyAfterSave } from "@/lib/public-submission";
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
  if (formData.get("terms") !== "on") return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  const parsed = membershipSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    membership_type: "enkelt",
    birth_date: formData.get("birth_date") ?? "",
    gender: formData.get("gender") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    guardian: formData.get("guardian") ?? "",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  if (await isRateLimited("members", parsed.data.email)) return { error: "For mange innsendinger. Vent litt og prøv igjen." };

  // Melder en som allerede er medlem seg inn igjen (f.eks. for å fornye), lager vi ikke en ny rad,
  // for da telles personen dobbelt. Lenken til medlemssiden sendes til e-postadressen i stedet.
  const existing = await findExistingMember({ email: parsed.data.email, first_name: parsed.data.first_name, last_name: parsed.data.last_name, birth_date: parsed.data.birth_date });
  if (existing) {
    if (isResendConfigured()) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
      const today = todayOslo();
      const mail = existingMemberMessage(existing, feeForPerson(existing.birth_date, today), today, siteUrl);
      await notifyAfterSave(() => getResendClient().emails.send({
        from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
        to: parsed.data.email,
        replyTo: NOTIFY_EMAIL,
        ...mail,
      }));
      await notifyAfterSave(() => getResendClient().emails.send({
        from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
        to: NOTIFY_EMAIL,
        subject: `Medlem meldte seg inn på nytt: ${existing.first_name} ${existing.last_name}`,
        text: `${existing.first_name} ${existing.last_name} er allerede registrert. Det ble ikke laget en ny rad. Vi har sendt personen en lenke til medlemssiden sin.`,
      }));
    }
    redirect("/bli-med?sendt=medlem#medlem");
  }

  // Man melder seg inn selv og betaler for seg selv. Flere kan legges til først etter at
  // egen betaling er registrert (se /bli-med/medlem/[token]). household_id knytter dem sammen.
  const { first_name, last_name, email } = parsed.data;
  const household_id = randomUUID();
  const pay_token = randomUUID();
  const fee = feeForPerson(parsed.data.birth_date, todayOslo());

  const saved = await savePublicSubmission("members", {
    membership_type: "enkelt",
    family_members: [],
    household_id,
    pay_token,
    first_name,
    last_name,
    email,
    birth_date: parsed.data.birth_date,
    gender: parsed.data.gender,
    address: parsed.data.address || null,
    phone: parsed.data.phone || null,
    guardian: parsed.data.guardian || null,
    comment: parsed.data.comment || null,
    accepted_terms: formData.get("terms") === "on",
  });
  if (!saved) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  if (isResendConfigured()) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
    const from = "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>";
    await notifyAfterSave(() => getResendClient().emails.send({
      from,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Ny medlemssøknad: ${first_name} ${last_name}`,
      text: `${first_name} ${last_name} (${email}) har meldt seg inn. Kontingent: ${fee} kr. Se admin → Medlemmer.`,
    }));
    await notifyAfterSave(() => getResendClient().emails.send({
      from,
      to: email,
      replyTo: NOTIFY_EMAIL,
      subject: "Velkommen som medlem – betal kontingenten din",
      text: `Hei ${first_name}!\n\nTakk for at du meldte deg inn i Mangfoldshuset Vestland. Medlemskapet aktiveres når kontingenten er betalt: ${fee} kr per år.\n\nBetal med Vipps til #595791 eller til bankkonto 3207 31 01688, og skriv navnet ditt.\n\nDu betaler for deg selv. Når betalingen er registrert, kan du legge til flere i familien på din egen side. Hver person har sin egen betaling, og foresatte betaler for barn under 18 år:\n${site}/bli-med/medlem/${pay_token}\n\nMangfoldshuset Vestland`,
    }));
  }

  redirect(`/bli-med/medlem/${pay_token}?ny=1`);
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
      from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `${LABELS[type]}: ${name}`,
      text: `Fra: ${name} (${email}${phone ? `, ${phone}` : ""})\n\n${body}`,
    }));
  }

  redirect(`/bli-med?sendt=${type}#${type}`);
}
