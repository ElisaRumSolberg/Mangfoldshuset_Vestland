"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";

export async function deleteApplication(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) failed("/admin/skjema", "generell", error);
  revalidatePath("/admin/skjema");
  done("/admin/skjema", "slettet");
}

export async function setApplicationStatus(id: string, status: "ny" | "behandlet") {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) failed("/admin/skjema", "generell", error);
  revalidatePath("/admin/skjema");
  done("/admin/skjema", "lagret");
}

export async function saveApplicationNote(id: string, formData: FormData) {
  await requireOwner();
  const raw = formData.get("note");
  const note = typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 2000) : null;
  const supabase = await createClient();
  const { error } = await supabase.from("applications").update({ note }).eq("id", id);
  if (error) failed("/admin/skjema", "generell", error);
  revalidatePath("/admin/skjema");
  done("/admin/skjema", "lagret");
}
