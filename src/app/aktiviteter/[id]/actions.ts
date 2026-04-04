"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { activitySignupSchema } from "@/lib/validation";
import { isRateLimited, looksLikeBot } from "@/lib/spam-guard";

export async function signUpForActivity(activityId: string, formData: FormData) {
  if (looksLikeBot(formData)) redirect(`/aktiviteter/${activityId}?meldt=1`);

  const parsed = activitySignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    participants: formData.get("participants"),
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) redirect(`/aktiviteter/${activityId}?feil=1`);
  const { name, email, phone, participants, comment } = parsed.data;

  if (await isRateLimited("activity_signups", email)) redirect(`/aktiviteter/${activityId}?meldt=1`);

  const supabase = await createClient();
  await supabase.from("activity_signups").insert({
    activity_id: activityId,
    name,
    email,
    phone: phone || null,
    participants,
    comment: comment || null,
  });

  redirect(`/aktiviteter/${activityId}?meldt=1`);
}
