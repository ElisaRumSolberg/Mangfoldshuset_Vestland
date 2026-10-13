"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";

export async function deleteMessage(id: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) failed("/admin/meldinger", "generell", error);
  revalidatePath("/admin/meldinger");
  done("/admin/meldinger", "slettet");
}
