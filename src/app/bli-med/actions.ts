"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";

const TYPES = ["frivillig", "ide", "samarbeid"] as const;
type ApplicationType = (typeof TYPES)[number];

const LABELS: Record<ApplicationType, string> = {
  frivillig: "Ny frivillig",
  ide: "Ny idé",
  samarbeid: "Ny samarbeidsforespørsel",
};

export async function submitApplication(formData: FormData) {
  const type = formData.get("type") as ApplicationType;
  if (!TYPES.includes(type)) redirect("/bli-med");

  const name = (formData.get("name") as string) ?? "";
  const email = (formData.get("email") as string) ?? "";
  const phone = ((formData.get("phone") as string) || null) as string | null;

  const data: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (["type", "name", "email", "phone"].includes(key) || key.startsWith("$ACTION")) continue;
    const values = formData.getAll(key).map(String).filter(Boolean);
    if (values.length) data[key] = values.length === 1 ? values[0] : values;
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.from("applications").insert({ type, name, email, phone, data });
  }

  if (isResendConfigured()) {
    const body = Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");
    await getResendClient().emails.send({
      from: "Mangfoldhuset Vestland <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `${LABELS[type]}: ${name}`,
      text: `Fra: ${name} (${email}${phone ? `, ${phone}` : ""})\n\n${body}`,
    });
  }

  redirect(`/bli-med?sendt=${type}#${type}`);
}
