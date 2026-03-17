"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  folder: string
) {
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("images").upload(path, file);
  if (error) return null;

  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

export async function addIssue(formData: FormData) {
  const supabase = await createClient();
  const coverUrl = await uploadFile(
    supabase,
    formData.get("cover") as File,
    "mangfoldsposten"
  );
  const pdfUrl = await uploadFile(
    supabase,
    formData.get("pdf") as File,
    "mangfoldsposten"
  );

  if (!pdfUrl) return;

  await supabase.from("magazine_issues").insert({
    title: formData.get("title") as string,
    issue_date: formData.get("issue_date") as string,
    cover_image_url: coverUrl,
    pdf_url: pdfUrl,
  });

  revalidatePath("/admin/mangfoldsposten");
  revalidatePath("/nyheter/mangfoldsposten");
  revalidatePath("/");
}

export async function updateIssue(id: string, formData: FormData) {
  const supabase = await createClient();
  const coverUrl = await uploadFile(
    supabase,
    formData.get("cover") as File,
    "mangfoldsposten"
  );
  const pdfUrl = await uploadFile(
    supabase,
    formData.get("pdf") as File,
    "mangfoldsposten"
  );

  const updates: Record<string, unknown> = {
    title: formData.get("title") as string,
    issue_date: formData.get("issue_date") as string,
  };
  if (coverUrl) updates.cover_image_url = coverUrl;
  if (pdfUrl) updates.pdf_url = pdfUrl;

  const { error, data } = await supabase
    .from("magazine_issues")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(`Kunne ikke oppdatere utgave: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(
      "Ingen rad ble oppdatert. Sjekk at RLS-policyen for UPDATE på 'magazine_issues' er kjørt (se supabase/media.sql)."
    );
  }

  revalidatePath("/admin/mangfoldsposten");
  revalidatePath("/nyheter/mangfoldsposten");
  revalidatePath("/");
  redirect("/admin/mangfoldsposten");
}

export async function deleteIssue(id: string) {
  const supabase = await createClient();
  await supabase.from("magazine_issues").delete().eq("id", id);

  revalidatePath("/admin/mangfoldsposten");
  revalidatePath("/nyheter/mangfoldsposten");
  revalidatePath("/");
}
