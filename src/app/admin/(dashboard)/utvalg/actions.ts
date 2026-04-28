"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formText, formUrls } from "@/lib/form-url";

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
    external_link: formText(formData, "external_link"),
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
  const supabase = await createClient();
  const f = fields(formData);
  const slug = slugify(f.title);
  if (!slug) throw new Error("Skriv inn et navn for utvalget.");

  const { error } = await supabase.from("utvalg").insert({
    ...f,
    slug,
    cover_images: formUrls(formData, "cover_images"),
    photos: formUrls(formData, "photos"),
  });
  if (error) {
    throw new Error(
      error.code === "23505"
        ? `Et utvalg med adressen /utvalg/${slug} finnes allerede. Velg et annet navn.`
        : `Kunne ikke legge til utvalg: ${error.message}`
    );
  }
  refresh(slug);
}

export async function updateUtvalg(id: string, formData: FormData) {
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

  if (error) throw new Error(`Kunne ikke oppdatere utvalg: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      "Ingen rad ble oppdatert. Sjekk at supabase/utvalg.sql er kjørt (RLS-policy for endring)."
    );
  }

  refresh(data[0]?.slug as string | undefined);
  redirect("/admin/utvalg");
}

export async function deleteUtvalg(id: string) {
  const supabase = await createClient();
  await supabase.from("utvalg").delete().eq("id", id);
  refresh();
}
