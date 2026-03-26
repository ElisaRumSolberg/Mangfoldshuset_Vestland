"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function plusOneYear(base: Date) {
  const d = new Date(base);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}

export async function markPaid(id: string) {
  const supabase = await createClient();
  const { data: m } = await supabase
    .from("members")
    .select("expires_at")
    .eq("id", id)
    .single();
  if (!m) return;

  const today = new Date(iso(new Date()));
  const current = m.expires_at ? new Date(m.expires_at) : null;
  const base = current && current > today ? current : today;

  await supabase
    .from("members")
    .update({ paid_at: iso(today), expires_at: iso(plusOneYear(base)) })
    .eq("id", id);
  revalidatePath("/admin/medlemmer");
}

export async function addMember(formData: FormData) {
  const supabase = await createClient();
  const expires = (formData.get("expires_at") as string) || null;

  await supabase.from("members").insert({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    membership_type: formData.get("membership_type") === "familie" ? "familie" : "enkelt",
    accepted_terms: true,
    paid_at: expires ? iso(new Date()) : null,
    expires_at: expires,
  });
  revalidatePath("/admin/medlemmer");
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  await supabase.from("members").delete().eq("id", id);
  revalidatePath("/admin/medlemmer");
}
