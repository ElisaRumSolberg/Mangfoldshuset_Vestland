"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export async function subscribeNewsletter(formData: FormData) {
  const email = formData.get("email") as string;
  const returnTo = (formData.get("returnTo") as string) || "/";

  if (isSupabaseConfigured() && email) {
    const supabase = await createClient();
    await supabase.from("newsletter_subscribers").insert({ email });
  }

  redirect(`${returnTo}?nyhetsbrev=takk`);
}
