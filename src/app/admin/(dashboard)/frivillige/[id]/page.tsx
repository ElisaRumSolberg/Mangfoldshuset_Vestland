import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import type { Volunteer } from "@/lib/volunteers";
import VolunteerForm from "../VolunteerForm";
import { updateVolunteer } from "../actions";

export default async function EditVolunteerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = await getT();
  const supabase = await createClient();
  const { data } = await supabase.from("volunteers").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <Link href="/admin/frivillige" className="text-sm font-semibold text-fig underline underline-offset-4">
        ← {t("Tilbake til frivillige")}
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-medium text-ink">{t("Rediger frivillig")}</h1>
      <div className="mt-6 max-w-2xl rounded-xl border border-line bg-cream p-6">
        <VolunteerForm action={updateVolunteer.bind(null, id)} submitLabel={t("Lagre endringer")} volunteer={data as Volunteer} />
      </div>
    </div>
  );
}
