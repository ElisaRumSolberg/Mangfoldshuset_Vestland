"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formUrl } from "@/lib/form-url";
import { done, failed } from "@/lib/admin-flash";
import { requireEditor } from "@/lib/auth-guard";

export async function addIssue(formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const coverUrl = formUrl(formData, "cover_url");
  const pdfUrl = formUrl(formData, "pdf_url");

  if (!pdfUrl) failed("/admin/mangfoldsposten", "mangler-pdf");

  const { error } = await supabase.from("magazine_issues").insert({
    title: formData.get("title") as string,
    issue_date: formData.get("issue_date") as string,
    cover_image_url: coverUrl,
    pdf_url: pdfUrl,
  });
  if (error) failed("/admin/mangfoldsposten", "generell", error);

  revalidatePath("/admin/mangfoldsposten");
  revalidatePath("/mangfoldsposten");
  revalidatePath("/");
  done("/admin/mangfoldsposten", "lagt-til");
}

export async function updateIssue(id: string, formData: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const coverUrl = formUrl(formData, "cover_url");
  const pdfUrl = formUrl(formData, "pdf_url");

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

  const back = `/admin/mangfoldsposten/${id}`;
  if (error) failed(back, "generell", error);
  if (!data || data.length === 0) failed(back, "ingen-endring");

  revalidatePath("/admin/mangfoldsposten");
  revalidatePath("/mangfoldsposten");
  revalidatePath("/");
  done("/admin/mangfoldsposten", "lagret");
}

export async function deleteIssue(id: string) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("magazine_issues").delete().eq("id", id);
  if (error) failed("/admin/mangfoldsposten", "generell", error);

  revalidatePath("/admin/mangfoldsposten");
  revalidatePath("/mangfoldsposten");
  revalidatePath("/");
  done("/admin/mangfoldsposten", "slettet");
}
