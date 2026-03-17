"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  folder: string
) {
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("images").upload(path, file);
  if (error) return null;

  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

export async function addActivity(formData: FormData) {
  const supabase = await createClient();
  const imageUrl = await uploadFile(
    supabase,
    formData.get("image") as File,
    "aktiviteter"
  );
  const videoUrl = await uploadFile(
    supabase,
    formData.get("video") as File,
    "aktiviteter"
  );

  await supabase.from("activities").insert({
    title: formData.get("title") as string,
    category: formData.get("category") as string,
    event_date: formData.get("event_date") as string,
    place: formData.get("place") as string,
    description: formData.get("description") as string,
    image_url: imageUrl,
    video_url: videoUrl,
    external_link: (formData.get("external_link") as string) || null,
  });

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
}

export async function updateActivity(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrl = await uploadFile(
    supabase,
    formData.get("image") as File,
    "aktiviteter"
  );
  const videoUrl = await uploadFile(
    supabase,
    formData.get("video") as File,
    "aktiviteter"
  );

  const updates: Record<string, unknown> = {
    title: formData.get("title") as string,
    category: formData.get("category") as string,
    event_date: formData.get("event_date") as string,
    place: formData.get("place") as string,
    description: formData.get("description") as string,
    external_link: (formData.get("external_link") as string) || null,
  };
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
  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", id);

  revalidatePath("/admin/aktiviteter");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
}
