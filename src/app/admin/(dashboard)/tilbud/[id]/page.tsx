import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toProgram } from "@/lib/recurring";
import { updateProgram } from "../actions";
import TilbudForm from "../TilbudForm";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("recurring_programs")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const program = toProgram(data);

  return (
    <div>
      <Link href="/admin/tilbud" className="text-sm text-ink-soft hover:text-ink">
        ← Tilbake til faste tilbud
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">Rediger tilbud</h1>

      <TilbudForm
        action={updateProgram.bind(null, id)}
        program={program}
        submitLabel="Lagre endringer"
      />
    </div>
  );
}
