"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";
import { isVolunteerStatus, splitList, volunteerFromApplication, type ApplicationRow } from "@/lib/volunteers";

const BACK = "/admin/frivillige";

function text(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function fields(formData: FormData) {
  const status = formData.get("status");
  return {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    interests: splitList(formData.get("interests")),
    availability: splitList(formData.get("availability")),
    programs: text(formData, "programs"),
    status: isVolunteerStatus(status) ? status : "aktiv",
    note: text(formData, "note"),
  };
}

export async function addVolunteer(formData: FormData) {
  await requireOwner();
  const f = fields(formData);
  if (!f.name) failed(BACK, "mangler-navn");
  const supabase = await createClient();
  const { error } = await supabase.from("volunteers").insert(f);
  if (error) failed(BACK, "generell", error);
  revalidatePath(BACK);
  done(BACK, "lagt-til");
}

export async function updateVolunteer(id: string, formData: FormData) {
  await requireOwner();
  const f = fields(formData);
  const back = `${BACK}/${id}`;
  if (!f.name) failed(back, "mangler-navn");
  const supabase = await createClient();
  const { error, data } = await supabase.from("volunteers").update(f).eq("id", id).select("id");
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");
  revalidatePath(BACK);
  done(BACK, "lagret");
}

export async function deleteVolunteer(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("volunteers").delete().eq("id", id);
  if (error) failed(BACK, "generell", error);
  revalidatePath(BACK);
  done(BACK, "slettet");
}

/** Legger en «Bli frivillig»-søknad inn i frivilligregisteret og markerer søknaden som behandlet. */
export async function addFromApplication(applicationId: string) {
  await requireOwner();
  const supabase = await createClient();
  const { data: app } = await supabase.from("applications").select("*").eq("id", applicationId).eq("type", "frivillig").maybeSingle();
  if (!app) failed(BACK, "generell");

  const { error } = await supabase.from("volunteers").insert(volunteerFromApplication(app as ApplicationRow));
  // 23505: allerede lagt til (unik application_id). Da er det bare å markere søknaden.
  if (error && error.code !== "23505") failed(BACK, "generell", error);
  await supabase.from("applications").update({ status: "behandlet" }).eq("id", applicationId);
  revalidatePath(BACK);
  revalidatePath("/admin/skjema");
  done(BACK, "lagt-til");
}
