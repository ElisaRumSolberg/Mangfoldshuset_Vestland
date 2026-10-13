"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formUrl } from "@/lib/form-url";
import { done, failed } from "@/lib/admin-flash";
import { requireEditor } from "@/lib/auth-guard";

export async function addNews(formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const imageUrl = formUrl(formData, "image_url");
  const videoUrl = formUrl(formData, "video_url");

  const { error: addError } = await supabase.from("news").insert({
    title: formData.get("title") as string,
    summary: formData.get("summary") as string,
    published_at: (formData.get("published_at") as string) || undefined,
    image_url: imageUrl,
    video_url: videoUrl,
    external_link: formUrl(formData, "external_link"),
  });
  if (addError) failed("/admin/nyheter", "generell", addError);

  revalidatePath("/admin/nyheter");
  revalidatePath("/nyheter");
  revalidatePath("/");
  done("/admin/nyheter", "lagt-til");
}

export async function updateNews(id: string, formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const imageUrl = formUrl(formData, "image_url");
  const videoUrl = formUrl(formData, "video_url");

  const updates: Record<string, unknown> = {
    title: formData.get("title") as string,
    summary: formData.get("summary") as string,
    external_link: formUrl(formData, "external_link"),
  };
  if (formData.get("published_at")) updates.published_at = formData.get("published_at") as string;
  if (imageUrl) updates.image_url = imageUrl;
  if (videoUrl) updates.video_url = videoUrl;

  const { error, data } = await supabase
    .from("news")
    .update(updates)
    .eq("id", id)
    .select();

  const back = `/admin/nyheter/${id}`;
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");

  revalidatePath("/admin/nyheter");
  revalidatePath("/nyheter");
  revalidatePath("/");
  done("/admin/nyheter", "lagret");
}

export async function deleteNews(id: string) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) failed("/admin/nyheter", "generell", error);

  revalidatePath("/admin/nyheter");
  revalidatePath("/nyheter");
  revalidatePath("/");
  done("/admin/nyheter", "slettet");
}
