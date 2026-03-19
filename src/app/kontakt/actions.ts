"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

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
