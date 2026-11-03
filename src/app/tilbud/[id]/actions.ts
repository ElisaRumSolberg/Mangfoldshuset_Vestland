"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { activitySignupSchema } from "@/lib/validation";
import { isRateLimited, looksLikeBot } from "@/lib/spam-guard";
import { savePublicSubmission, notifyAfterSave } from "@/lib/public-submission";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { nextOccurrences, shortDate, timeText, todayOslo, toProgram } from "@/lib/recurring";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FAIL = { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

export async function signUpForProgram(programId: string, formData: FormData) {
  if (!UUID.test(programId)) redirect("/aktiviteter");
  if (looksLikeBot(formData)) redirect(`/tilbud/${programId}?meldt=1`);

  const parsed = activitySignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    participants: formData.get("participants"),
    comment: formData.get("comment") ?? "",
    photo_consent: formData.get("photo_consent") === "on",
  });
  if (!parsed.success) return FAIL;
  const { name, email, phone, participants, comment, photo_consent } = parsed.data;

  const sessionDate = String(formData.get("session_date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) return FAIL;

  if (await isRateLimited("program_signups", email)) return { error: "For mange innsendinger. Vent litt og prøv igjen." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_programs")
    .select("*")
    .eq("id", programId)
    .eq("active", true)
    .maybeSingle();
  if (error || !data || !data.registration_open) return FAIL;
  const program = toProgram(data);

  // Datoen må være en faktisk kommende samling (ikke avlyst eller utenfor serien).
  if (!nextOccurrences(program, todayOslo(), 12).includes(sessionDate)) return FAIL;

  const saved = await savePublicSubmission("program_signups", {
    program_id: programId,
    session_date: sessionDate,
    name,
    email,
    phone: phone || null,
    participants,
    comment: comment || null,
    photo_consent,
  });
  if (!saved) return FAIL;

  if (isResendConfigured()) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
    const time = timeText(program);
    const when = `${shortDate(sessionDate)}${time ? ` ${time}` : ""}`;
    await notifyAfterSave(() => getResendClient().emails.send({
      from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Ny påmelding: ${program.title} ${shortDate(sessionDate)} – ${name}`,
      text: [
        `${name} har meldt seg på «${program.title}» (${when}).`,
        "",
        `E-post: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        `Antall personer: ${participants}`,
        comment ? `Kommentar: ${comment}` : null,
        `Bildesamtykke: ${photo_consent ? "Ja" : "Nei"}`,
        "",
        `Se alle påmeldte: ${site}/admin/tilbud/${programId}`,
      ].filter((l) => l !== null).join("\n"),
    }));
  }

  redirect(`/tilbud/${programId}?meldt=1`);
}
