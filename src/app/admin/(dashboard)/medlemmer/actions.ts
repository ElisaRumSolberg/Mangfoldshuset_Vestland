"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function plusOneYear(base: Date) {
  const d = new Date(base);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}

const GENDERS = ["kvinne", "mann", "annet", "ukjent"];

function gender(v: FormDataEntryValue | null): string | null {
  return typeof v === "string" && GENDERS.includes(v) ? v : null;
}

function dateOrNull(v: FormDataEntryValue | null): string | null {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export async function markPaid(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { data: m } = await supabase
    .from("members")
    .select("expires_at")
    .eq("id", id)
    .single();
  if (!m) failed("/admin/medlemmer", "generell");

  const today = new Date(iso(new Date()));
  const current = m.expires_at ? new Date(m.expires_at) : null;
  const base = current && current > today ? current : today;

  const { error } = await supabase
    .from("members")
    .update({ paid_at: iso(today), expires_at: iso(plusOneYear(base)) })
    .eq("id", id);
  if (error) failed("/admin/medlemmer", "generell", error);
  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "betalt");
}

export async function addMember(formData: FormData) {
  await requireOwner();
  const supabase = await createClient();
  const expires = (formData.get("expires_at") as string) || null;

  const { error } = await supabase.from("members").insert({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    birth_date: (formData.get("birth_date") as string) || null,
    gender: gender(formData.get("gender")),
    membership_type: formData.get("membership_type") === "familie" ? "familie" : "enkelt",
    accepted_terms: true,
    paid_at: expires ? iso(new Date()) : null,
    expires_at: expires,
  });
  if (error) failed("/admin/medlemmer", "generell", error);
  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "lagt-til");
}

export async function deleteMember(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) failed("/admin/medlemmer", "generell", error);
  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "slettet");
}

export async function updateMember(id: string, formData: FormData) {
  await requireOwner();
  const supabase = await createClient();
  const back = `/admin/medlemmer/${id}`;

  const text = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const first = text("first_name");
  const last = text("last_name");
  const email = text("email");
  if (!first || !last || !email) failed(back, "mangler-felt");

  const family = [1, 2, 3, 4, 5]
    .map((n) => ({
      name: text(`fam_name_${n}`),
      birth_date: dateOrNull(formData.get(`fam_birth_${n}`)),
      gender: gender(formData.get(`fam_gender_${n}`)),
    }))
    .filter((f) => f.name);

  const { error, data } = await supabase
    .from("members")
    .update({
      first_name: first,
      last_name: last,
      email,
      phone: text("phone"),
      address: text("address"),
      birth_date: dateOrNull(formData.get("birth_date")),
      gender: gender(formData.get("gender")),
      membership_type: formData.get("membership_type") === "familie" ? "familie" : "enkelt",
      family_members: family,
    })
    .eq("id", id)
    .select();
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");

  revalidatePath("/admin/medlemmer");
  done("/admin/medlemmer", "lagret");
}
