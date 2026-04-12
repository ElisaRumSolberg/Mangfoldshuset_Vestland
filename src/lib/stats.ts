import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Sum av deltakere som er registrert på aktiviteter og faste tilbud.
 * Feil (f.eks. at kolonnene ikke finnes ennå) gir 0 så forsiden aldri går i stykker.
 */
export async function autoParticipants(supabase: Supabase): Promise<number> {
  const [a, p] = await Promise.all([
    supabase.from("activities").select("participants").not("participants", "is", null),
    supabase.from("recurring_programs").select("participants").not("participants", "is", null),
  ]);
  const sum = (rows: { participants: number | null }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + (r.participants ?? 0), 0);
  return sum(a.error ? null : a.data) + sum(p.error ? null : p.data);
}
