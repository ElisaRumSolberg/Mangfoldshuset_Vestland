"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, failed } from "@/lib/admin-flash";
import { requireOwner } from "@/lib/auth-guard";

export async function updateStats(formData: FormData) {
  await requireOwner();
  const supabase = await createClient();

  const updates = [
    { key: "activities", value: Number(formData.get("activities")) },
    { key: "participants", value: Number(formData.get("participants")) },
    {
      key: "volunteer_hours",
      value: Number(formData.get("volunteer_hours")),
    },
  ];

  const results = await Promise.all(
    updates.map((u) =>
      supabase.from("impact_stats").update({ value: u.value }).eq("key", u.key)
    )
  );
  const failure = results.find((r) => r.error);
  if (failure) failed("/admin/statistikk", "generell", failure.error);

  revalidatePath("/admin/statistikk");
  revalidatePath("/");
  done("/admin/statistikk", "lagret");
}
