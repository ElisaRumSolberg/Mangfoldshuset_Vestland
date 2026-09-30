"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { activitySignupSchema } from "@/lib/validation";
import { isRateLimited, looksLikeBot } from "@/lib/spam-guard";
import { savePublicSubmission } from "@/lib/public-submission";
import { todayOslo } from "@/lib/recurring";
import { isActivityPast } from "@/lib/activity-date";

export async function signUpForActivity(activityId: string, formData: FormData) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activityId)) redirect("/aktiviteter");
  if (looksLikeBot(formData)) redirect(`/aktiviteter/${activityId}?meldt=1`);

  const parsed = activitySignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    participants: formData.get("participants"),
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };
  const { name, email, phone, participants, comment } = parsed.data;

  if (await isRateLimited("activity_signups", email)) return { error: "For mange innsendinger. Vent litt og prøv igjen." };

  const supabase = await createClient();
  const { data: activity, error } = await supabase.from("activities")
    .select("event_date,end_date,registration_open").eq("id", activityId).maybeSingle();
  if (error || !activity || !activity.registration_open || isActivityPast(activity, todayOslo())) {
    return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };
  }
  const saved = await savePublicSubmission("activity_signups", {
    activity_id: activityId,
    name,
    email,
    phone: phone || null,
    participants,
    comment: comment || null,
  });
  if (!saved) return { error: "Kunne ikke sende skjemaet. Sjekk feltene og prøv igjen." };

  redirect(`/aktiviteter/${activityId}?meldt=1`);
}
