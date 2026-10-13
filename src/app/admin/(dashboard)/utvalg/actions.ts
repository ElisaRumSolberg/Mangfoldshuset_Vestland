"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formText, formUrl, formUrls } from "@/lib/form-url";
import { done, failed } from "@/lib/admin-flash";
import { requireEditor, requireUtvalgAccess } from "@/lib/auth-guard";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // fjerner é->e, ø/å normaliseres separat under
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fields(formData: FormData) {
  const useCustomColors = formData.get("use_custom_colors") === "on";
  return {
    title: formText(formData, "title") ?? "",
    description: formText(formData, "description") ?? "",
    activity_match: formText(formData, "activity_match"),
    external_link: formUrl(formData, "external_link"),
    instagram_link: formText(formData, "instagram_link"),
    contact: formText(formData, "contact"),
    active: formData.get("active") === "on",
    // Fargevelgeren har alltid en verdi; vi lagrer den bare når kutucuken er huket av.
    color_from: useCustomColors ? formText(formData, "color_from") : null,
    color_to: useCustomColors ? formText(formData, "color_to") : null,
    accent: useCustomColors ? formText(formData, "accent") : null,
  };
}

function refresh(slug?: string) {
  revalidatePath("/admin/utvalg");
  revalidatePath("/om-oss");
  revalidatePath("/");
  if (slug) revalidatePath(`/utvalg/${slug}`);
}

export async function addUtvalg(formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const f = fields(formData);
  const slug = slugify(f.title);
  if (!slug) failed("/admin/utvalg", "mangler-navn");

  const { error } = await supabase.from("utvalg").insert({
    ...f,
    slug,
    cover_images: formUrls(formData, "cover_images"),
    photos: formUrls(formData, "photos"),
  });
  if (error) failed("/admin/utvalg", error.code === "23505" ? "navn-finnes" : "generell", error);
  refresh(slug);
  done("/admin/utvalg", "lagt-til");
}

export async function updateUtvalg(id: string, formData: FormData) {
  await requireUtvalgAccess(id);
  const supabase = await createClient();
  const updates: Record<string, unknown> = fields(formData);
  if (formData.get("photos_present")) updates.photos = formUrls(formData, "photos");
  if (formData.get("cover_images_present")) {
    updates.cover_images = formUrls(formData, "cover_images");
  }

  const { error, data } = await supabase
    .from("utvalg")
    .update(updates)
    .eq("id", id)
    .select();

  const back = `/admin/utvalg/${id}`;
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");

  refresh(data[0]?.slug as string | undefined);
  done("/admin/utvalg", "lagret");
}

export async function deleteUtvalg(id: string) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("utvalg").delete().eq("id", id);
  if (error) failed("/admin/utvalg", "generell", error);
  refresh();
  done("/admin/utvalg", "slettet");
}
