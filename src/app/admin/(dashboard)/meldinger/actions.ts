"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth-guard";

export async function deleteMessage(id: string) {
  await requireOwner();
  const supabase = await createClient();
  await supabase.from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin/meldinger");
}
