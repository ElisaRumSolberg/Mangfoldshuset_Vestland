"use server";

import { redirect } from "next/navigation";
import { savePublicSubmission, notifyAfterSave } from "@/lib/public-submission";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { contactSchema } from "@/lib/validation";
import { isRateLimited, looksLikeBot } from "@/lib/spam-guard";

export async function sendContactMessage(formData: FormData) {
  if (looksLikeBot(formData)) redirect("/kontakt?sendt=takk");

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };
  const { name, email, subject, message } = parsed.data;

  if (await isRateLimited("contact_messages", email)) return { error: "For mange innsendinger. Vent litt og prøv igjen." };

  const saved = await savePublicSubmission("contact_messages", { name, email, subject, message });
  if (!saved) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  if (isResendConfigured()) {
    const resend = getResendClient();
    await notifyAfterSave(() => resend.emails.send({
      from: "Mangfoldshuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Ny henvendelse: ${subject}`,
      text: `Fra: ${name} (${email})\n\n${message}`,
    }));
  }

  redirect("/kontakt?sendt=takk");
}
