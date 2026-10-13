"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formInt, formList, formText, formUrl, formUrls } from "@/lib/form-url";
import { done, failed } from "@/lib/admin-flash";
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
    event_time: formText(formData, "event_time"),
    price: formText(formData, "price"),
    place: formData.get("place") as string,
    description: formData.get("description") as string,
    image_url: imageUrl,
    video_url: videoUrl,
    external_link: formUrl(formData, "external_link"),
    responsible_name: formText(formData, "responsible_name"),
    responsible_phone: formText(formData, "responsible_phone"),
    responsible_email: formText(formData, "responsible_email"),
    registration_open: formData.get("registration_open") === "on",
    featured: formData.get("featured") === "on",
    show_on_homepage: formData.get("show_on_homepage") === "on",
  });
  if (error) failed("/admin/aktiviteter", "generell", error);

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
  done("/admin/aktiviteter", "lagt-til");
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
    event_time: formText(formData, "event_time"),
    price: formText(formData, "price"),
    place: formData.get("place") as string,
    description: formData.get("description") as string,
    external_link: formUrl(formData, "external_link"),
    responsible_name: formText(formData, "responsible_name"),
    responsible_phone: formText(formData, "responsible_phone"),
    responsible_email: formText(formData, "responsible_email"),
    registration_open: formData.get("registration_open") === "on",
    featured: formData.get("featured") === "on",
    show_on_homepage: formData.get("show_on_homepage") === "on",
    homepage_image_urls: formUrls(formData, "homepage_image_urls"),
    participants: formInt(formData, "participants"),
    summary: formText(formData, "summary"),
    feedback: formText(formData, "feedback"),
  };
  // Bildelisten erstattes bare når galleri-feltet var med i skjemaet.
  if (formData.get("photos_present")) updates.photos = formUrls(formData, "photos");
  if (imageUrl) updates.image_url = imageUrl;
  else if (formData.get("remove_image") === "on") updates.image_url = null;
  if (videoUrl) updates.video_url = videoUrl;

  const { error, data } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", id)
    .select();

  const back = `/admin/aktiviteter/${id}`;
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
  done("/admin/aktiviteter", "lagret");
}

export async function deleteActivity(id: string) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) failed("/admin/aktiviteter", "generell", error);

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
  done("/admin/aktiviteter", "slettet");
}

export async function deleteSignup(activityId: string, signupId: string) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("activity_signups").delete().eq("id", signupId);
  const back = `/admin/aktiviteter/${activityId}`;
  if (error) failed(back, "generell", error);
  revalidatePath(back);
  done(back, "slettet");
}
