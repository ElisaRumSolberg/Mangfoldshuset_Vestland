"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formUrl } from "@/lib/form-url";

function text(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function fields(formData: FormData) {
  const frequency = formData.get("frequency") === "monthly" ? "monthly" : "weekly";
  const skipped = String(formData.get("skipped_dates") ?? "")
    .split(/[\s,;]+/)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

  return {
    title: text(formData, "title") ?? "",
    description: text(formData, "description") ?? "",
    frequency,
    weekday: Number(formData.get("weekday")),
    nth: frequency === "monthly" ? Number(formData.get("nth")) : null,
    start_time: text(formData, "start_time"),
    end_time: text(formData, "end_time"),
    start_date: text(formData, "start_date"),
    end_date: text(formData, "end_date"),
    place: text(formData, "place") ?? "",
    note: text(formData, "note"),
    contact: text(formData, "contact"),
    external_link: text(formData, "external_link"),
    skipped_dates: skipped,
    active: formData.get("active") === "on",
  };
}

function refresh() {
  revalidatePath("/admin/tilbud");
  revalidatePath("/aktiviteter");
  revalidatePath("/");
}

export async function addProgram(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("recurring_programs").insert({
    ...fields(formData),
    image_url: formUrl(formData, "image_url"),
  });
  if (error) throw new Error(`Kunne ikke legge til tilbud: ${error.message}`);
  refresh();
}

export async function updateProgram(id: string, formData: FormData) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = fields(formData);
  const imageUrl = formUrl(formData, "image_url");
  if (imageUrl) updates.image_url = imageUrl;

  const { error, data } = await supabase
    .from("recurring_programs")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw new Error(`Kunne ikke oppdatere tilbud: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      "Ingen rad ble oppdatert. Sjekk at supabase/tilbud.sql er kjørt (RLS-policy for endring)."
    );
  }

  refresh();
  redirect("/admin/tilbud");
}

export async function deleteProgram(id: string) {
  const supabase = await createClient();
  await supabase.from("recurring_programs").delete().eq("id", id);
  refresh();
}
