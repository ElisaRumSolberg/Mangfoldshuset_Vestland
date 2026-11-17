import Link from "next/link";
import { fetchPrograms, todayOslo } from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { addDaysIso, buildWeek, mondayOf, parseWeekParam, type WeekActivity } from "@/lib/week-program";

async function fetchWeekActivities(start: string, end: string): Promise<WeekActivity[]> {
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

const nav = "inline-flex min-h-11 items-center text-base font-semibold text-fig underline underline-offset-4 hover:text-fig-dark";

/**
 * «Ukens program»: mandag–søndag, regnet ut av faste tilbud og enkeltaktiviteter, så det alltid stemmer med
 * resten av nettsiden. `compact` brukes på forsiden (kun inneværende uke).
 */
export default async function WeekProgram({
  weekParam,
  compact = false,
  basePath = "/aktiviteter",
}: {
  weekParam?: string;
  compact?: boolean;
  basePath?: string;
}) {
  const today = todayOslo();
  const start = compact ? mondayOf(today) : parseWeekParam(weekParam, today);
  const programs = await fetchPrograms();
  const activities = await fetchWeekActivities(start, addDaysIso(start, 6));
  const week = buildWeek(programs, activities, start);
  const thisWeek = mondayOf(today);
  const prev = addDaysIso(start, -7);
  const next = addDaysIso(start, 7);
  const link = (iso: string) => `${basePath}?uke=${iso}#ukens-program`;

  return (
    <section id="ukens-program" aria-labelledby="ukens-program-heading" className="scroll-mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="ukens-program-heading" className="font-serif text-2xl font-medium">
          Ukens program
        </h2>
        <p className="text-base text-ink-soft">
          Uke {week.number} · {week.label}
        </p>
      </div>

      {week.days.length === 0 ? (
        <p className="mt-5 border-t border-line pt-5 text-base text-ink-soft">Ingen faste tilbud denne uken.</p>
      ) : (
        <ol className="mt-4 border-t border-line">
          {week.days.map((day) => (
            <li key={day.iso} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <p className="text-base font-semibold text-ink">
                {day.name} <span className="font-normal text-ink-soft">{day.dateText}</span>
              </p>
              <ul className="flex flex-col gap-3">
                {day.items.map((item) => (
                  <li key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5">
                    <div className="min-w-0">
                      {item.href ? (
                        <Link href={item.href} className="text-base font-semibold text-ink underline-offset-4 hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="text-base font-semibold text-ink">{item.title}</span>
                      )}
                      {item.place && <p className="text-base text-ink-soft">{item.place}</p>}
                    </div>
                    <p className="whitespace-nowrap text-right text-base tabular-nums text-ink">
                      {item.note === "avlyst" ? (
                        <span className="font-semibold text-fig">Avlyst</span>
                      ) : item.note === "starter" ? (
                        <span className="font-semibold text-green-dark">Starter i uke {item.startsWeek}</span>
                      ) : (
                        item.time
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      {compact ? (
        <p className="mt-4">
          <Link href="/aktiviteter#ukens-program" className={nav}>
            Se hele programmet og neste uke
          </Link>
        </p>
      ) : (
        <nav aria-label="Bla mellom uker" className="mt-3 flex flex-wrap items-center gap-x-8">
          <Link href={link(prev)} className={nav}>
            ← Forrige uke
          </Link>
          {start !== thisWeek && (
            <Link href={`${basePath}#ukens-program`} className={nav}>
              Denne uken
            </Link>
          )}
          <Link href={link(next)} className={nav}>
            Neste uke →
          </Link>
        </nav>
      )}
    </section>
  );
}
