"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formInt, formList, formText, formUrl, formUrls } from "@/lib/form-url";
import { requireEditor } from "@/lib/auth-guard";

export async function addActivity(formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const imageUrl = formUrl(formData, "image_url");
  const videoUrl = formUrl(formData, "video_url");

  const { error } = await supabase.from("activities").insert({
    title: formData.get("title") as string,
    categories: formList(formData, "categories"),
    event_date: formData.get("event_date") as string,
    end_date: (formData.get("end_date") as string) || null,
    place: formData.get("place") as string,
    description: formData.get("description") as string,
    image_url: imageUrl,
    video_url: videoUrl,
    external_link: (formData.get("external_link") as string) || null,
    responsible_name: formText(formData, "responsible_name"),
    responsible_phone: formText(formData, "responsible_phone"),
    responsible_email: formText(formData, "responsible_email"),
    registration_open: formData.get("registration_open") === "on",
    featured: formData.get("featured") === "on",
    show_on_homepage: formData.get("show_on_homepage") === "on",
  });
  if (error) throw new Error(`Kunne ikke legge til aktivitet: ${error.message}`);

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
}

export async function updateActivity(id: string, formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const imageUrl = formUrl(formData, "image_url");
  const videoUrl = formUrl(formData, "video_url");

  const updates: Record<string, unknown> = {
    title: formData.get("title") as string,
    categories: formList(formData, "categories"),
    event_date: formData.get("event_date") as string,
    end_date: (formData.get("end_date") as string) || null,
    place: formData.get("place") as string,
    description: formData.get("description") as string,
    external_link: (formData.get("external_link") as string) || null,
    responsible_name: formText(formData, "responsible_name"),
    responsible_phone: formText(formData, "responsible_phone"),
    responsible_email: formText(formData, "responsible_email"),
    registration_open: formData.get("registration_open") === "on",
    featured: formData.get("featured") === "on",
    show_on_homepage: formData.get("show_on_homepage") === "on",
    participants: formInt(formData, "participants"),
    summary: formText(formData, "summary"),
    feedback: formText(formData, "feedback"),
  };
  // Bildelisten erstattes bare når galleri-feltet var med i skjemaet.
  if (formData.get("photos_present")) updates.photos = formUrls(formData, "photos");
  if (imageUrl) updates.image_url = imageUrl;
  if (videoUrl) updates.video_url = videoUrl;

  const { error, data } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(`Kunne ikke oppdatere aktivitet: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(
      "Ingen rad ble oppdatert. Sjekk at RLS-policyen for UPDATE på 'activities' er kjørt (se supabase/schema.sql)."
    );
  }

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
  redirect("/admin/aktiviteter");
}

export async function deleteActivity(id: string) {
  await requireEditor();
  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", id);

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
}

export async function deleteSignup(activityId: string, signupId: string) {
  await requireEditor();
  const supabase = await createClient();
  await supabase.from("activity_signups").delete().eq("id", signupId);
  revalidatePath(`/admin/aktiviteter/${activityId}`);
}
