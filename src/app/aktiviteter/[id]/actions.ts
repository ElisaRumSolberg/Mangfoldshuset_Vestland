"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpForActivity(activityId: string, formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string) ?? "";
  const email = (formData.get("email") as string) ?? "";
  const phone = ((formData.get("phone") as string) || null) as string | null;
  const participants = Math.max(1, Number(formData.get("participants")) || 1);
  const comment = ((formData.get("comment") as string) || null) as string | null;

  await supabase.from("activity_signups").insert({
    activity_id: activityId,
    name,
    email,
    phone,
    participants,
    comment,
  });

  redirect(`/aktiviteter/${activityId}?meldt=1`);
}
