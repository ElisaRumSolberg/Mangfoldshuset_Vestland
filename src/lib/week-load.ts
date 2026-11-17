import { fetchPrograms, todayOslo } from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { addDaysIso, buildWeek, mondayOf, parseWeekParam, type Week, type WeekActivity } from "@/lib/week-program";

/** Enkeltaktiviteter som berører uken (fra og med mandag til og med søndag). */
export async function fetchWeekActivities(start: string, end: string): Promise<WeekActivity[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activities")
      .select("id, title, place, event_date, end_date, event_time")
      .lte("event_date", end)
      .or(`end_date.gte.${start},and(end_date.is.null,event_date.gte.${start})`);
    return (data ?? []) as WeekActivity[];
  } catch {
    return [];
  }
}

export type LoadedWeek = {
  week: Week;
  today: string;
  thisWeek: string;
  prev: string;
  next: string;
};

/** Henter alt som trengs for å vise en uke. `current` ignorerer ?uke og viser inneværende uke. */
export async function loadWeek(weekParam?: string, current = false): Promise<LoadedWeek> {
  const today = todayOslo();
  const thisWeek = mondayOf(today);
  const start = current ? thisWeek : parseWeekParam(weekParam, today);
  const [programs, activities] = await Promise.all([fetchPrograms(), fetchWeekActivities(start, addDaysIso(start, 6))]);
  return {
    week: buildWeek(programs, activities, start),
    today,
    thisWeek,
    prev: addDaysIso(start, -7),
    next: addDaysIso(start, 7),
  };
}
