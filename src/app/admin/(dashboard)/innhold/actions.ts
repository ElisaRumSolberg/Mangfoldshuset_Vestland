"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formUrls } from "@/lib/form-url";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, string[]> = {};
  if (formData.get("hero_images_present")) updates.hero_images = formUrls(formData, "hero_images");
  if (formData.get("om_oss_images_present")) updates.om_oss_images = formUrls(formData, "om_oss_images");

  if (Object.keys(updates).length) {
    const { error } = await supabase.from("site_settings").update(updates).eq("id", 1);
    if (error) throw new Error(`Kunne ikke lagre bilder: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/om-oss");
  revalidatePath("/admin/innhold");
}
