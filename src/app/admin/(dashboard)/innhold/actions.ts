"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formUrl, formUrls } from "@/lib/form-url";
import { requireEditor } from "@/lib/auth-guard";

export async function updateSiteSettings(formData: FormData) {
  await requireEditor();
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (formData.get("hero_images_present")) updates.hero_images = formUrls(formData, "hero_images");
  if (formData.get("om_oss_images_present")) updates.om_oss_images = formUrls(formData, "om_oss_images");
  updates.vipps_link = formUrl(formData, "vipps_link");

  if (Object.keys(updates).length) {
    const { error } = await supabase.from("site_settings").update(updates).eq("id", 1);
    if (error) throw new Error(`Kunne ikke lagre innstillinger: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/om-oss");
  revalidatePath("/admin/innhold");
}
