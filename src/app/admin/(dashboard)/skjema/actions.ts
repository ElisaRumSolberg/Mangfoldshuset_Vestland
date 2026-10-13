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
