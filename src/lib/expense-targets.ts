import type { SupabaseClient } from "@supabase/supabase-js";

/** Valg for «hvilken aktivitet er utlegget for»: aktive faste tilbud og aktiviteter fra de siste to månedene og fremover. */
export async function loadExpenseTargets(supabase: SupabaseClient, today: string): Promise<{ programs: string[]; activities: string[] }> {
  const since = new Date(`${today}T00:00:00Z`);
  since.setUTCDate(since.getUTCDate() - 60);
  const [{ data: progs }, { data: acts }] = await Promise.all([
    supabase.from("recurring_programs").select("title").eq("active", true).order("title"),
    supabase
      .from("activities")
      .select("title, event_date")
      .gte("event_date", since.toISOString().slice(0, 10))
      .order("event_date", { ascending: false })
      .limit(40),
  ]);
  return {
    programs: (progs ?? []).map((p) => String(p.title)),
    activities: (acts ?? []).map((a) => `${a.title} (${a.event_date})`),
  };
}
