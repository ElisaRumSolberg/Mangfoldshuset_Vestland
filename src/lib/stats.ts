import type { createClient } from "@/lib/supabase/server";
import { programParticipants, programVolunteerHours, toProgram, todayOslo } from "@/lib/recurring";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Sum av deltakere som er registrert på aktiviteter og faste tilbud.
 * Feil (f.eks. at kolonnene ikke finnes ennå) gir 0 så forsiden aldri går i stykker.
 */
export async function autoParticipants(supabase: Supabase, today: string = todayOslo()): Promise<number> {
  const [a, p] = await Promise.all([
    supabase.from("activities").select("participants").not("participants", "is", null),
    supabase.from("recurring_programs").select("*"),
  ]);
  const activities = (a.error ? [] : (a.data ?? [])).reduce(
    (acc: number, r: { participants: number | null }) => acc + (r.participants ?? 0),
    0,
  );
  const programs = (p.error ? [] : (p.data ?? [])).reduce(
    (acc: number, r: Record<string, unknown>) => acc + (programParticipants(toProgram(r), today).value ?? 0),
    0,
  );
  return activities + programs;
}

/** Frivillige timer som regnes ut automatisk: faste tilbud (samlinger × frivillige × timer) og timer oppgitt per aktivitet. */
export async function autoVolunteerHours(supabase: Supabase, today: string = todayOslo()): Promise<number> {
  const [a, p] = await Promise.all([
    supabase.from("activities").select("volunteer_hours").not("volunteer_hours", "is", null),
    supabase.from("recurring_programs").select("*"),
  ]);
  const activities = (a.error ? [] : (a.data ?? [])).reduce(
    (acc: number, r: { volunteer_hours: number | null }) => acc + (r.volunteer_hours ?? 0),
    0,
  );
  const programs = (p.error ? [] : (p.data ?? [])).reduce(
    (acc: number, r: Record<string, unknown>) => acc + programVolunteerHours(toProgram(r), today),
    0,
  );
  return activities + programs;
}

export type ActivityCount = { events: number; programs: number; total: number };

/**
 * «Aktiviteter i år»: arrangementer som er holdt hittil i år, pluss hvert aktive faste tilbud som én aktivitet.
 * Feil gir 0 så forsiden aldri går i stykker.
 */
export async function autoActivities(supabase: Supabase, today: string): Promise<ActivityCount> {
  const year = today.slice(0, 4);
  const [a, p] = await Promise.all([
    supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .gte("event_date", `${year}-01-01`)
      .lte("event_date", today),
    supabase.from("recurring_programs").select("id", { count: "exact", head: true }).eq("active", true),
  ]);
  const events = a.error ? 0 : (a.count ?? 0);
  const programs = p.error ? 0 : (p.count ?? 0);
  return { events, programs, total: events + programs };
}
