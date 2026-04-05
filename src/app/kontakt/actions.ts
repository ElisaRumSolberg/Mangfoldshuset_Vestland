"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
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
  if (!parsed.success) redirect("/kontakt?feil=1");
  const { name, email, subject, message } = parsed.data;

  if (await isRateLimited("contact_messages", email)) redirect("/kontakt?sendt=takk");

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.from("contact_messages").insert({ name, email, subject, message });
  }

  if (isResendConfigured()) {
    const resend = getResendClient();
    await resend.emails.send({
      from: "Mangfoldhuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Ny henvendelse: ${subject}`,
      text: `Fra: ${name} (${email})\n\n${message}`,
    });
  }

  redirect("/kontakt?sendt=takk");
}
