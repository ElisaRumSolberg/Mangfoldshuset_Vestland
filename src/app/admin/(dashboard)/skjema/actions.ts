"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteApplication(id: string) {
  const supabase = await createClient();
  await supabase.from("applications").delete().eq("id", id);
  revalidatePath("/admin/skjema");
}
