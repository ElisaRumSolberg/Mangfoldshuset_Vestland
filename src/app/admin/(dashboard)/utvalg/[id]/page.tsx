import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toUtvalg } from "@/lib/utvalg";
import { roleFromUser } from "@/lib/roles";
import { updateUtvalg } from "../actions";
import UtvalgForm from "../UtvalgForm";

export default async function EditUtvalgPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: userData }] = await Promise.all([
    supabase.from("utvalg").select("*").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);

  if (!data) notFound();
  const utvalg = toUtvalg(data);
  const role = roleFromUser(userData.user);

  return (
    <div>
      {role !== "utvalg" && (
        <Link href="/admin/utvalg" className="text-sm text-ink-soft hover:text-ink">
          ← Tilbake til utvalg
        </Link>
      )}
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">Rediger utvalg</h1>

      <UtvalgForm
        action={updateUtvalg.bind(null, id)}
        utvalg={utvalg}
        submitLabel="Lagre endringer"
      />
    </div>
  );
}
