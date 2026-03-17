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

export async function addNews(formData: FormData) {
  const supabase = await createClient();
  const imageUrl = await uploadFile(
    supabase,
    formData.get("image") as File,
    "nyheter"
  );
  const videoUrl = await uploadFile(
    supabase,
    formData.get("video") as File,
    "nyheter"
  );

  await supabase.from("news").insert({
    title: formData.get("title") as string,
    summary: formData.get("summary") as string,
    image_url: imageUrl,
    video_url: videoUrl,
    external_link: (formData.get("external_link") as string) || null,
  });

  revalidatePath("/admin/nyheter");
  revalidatePath("/nyheter");
  revalidatePath("/");
}

export async function updateNews(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrl = await uploadFile(
    supabase,
    formData.get("image") as File,
    "nyheter"
  );
  const videoUrl = await uploadFile(
    supabase,
    formData.get("video") as File,
    "nyheter"
  );

  const updates: Record<string, unknown> = {
    title: formData.get("title") as string,
    summary: formData.get("summary") as string,
    external_link: (formData.get("external_link") as string) || null,
  };
  if (imageUrl) updates.image_url = imageUrl;
  if (videoUrl) updates.video_url = videoUrl;

  const { error, data } = await supabase
    .from("news")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(`Kunne ikke oppdatere nyhet: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(
      "Ingen rad ble oppdatert. Sjekk at RLS-policyen for UPDATE på 'news' er kjørt (se supabase/schema.sql)."
    );
  }

  revalidatePath("/admin/nyheter");
  revalidatePath("/nyheter");
  revalidatePath("/");
  redirect("/admin/nyheter");
}

export async function deleteNews(id: string) {
  const supabase = await createClient();
  await supabase.from("news").delete().eq("id", id);

  revalidatePath("/admin/nyheter");
  revalidatePath("/nyheter");
  revalidatePath("/");
}
