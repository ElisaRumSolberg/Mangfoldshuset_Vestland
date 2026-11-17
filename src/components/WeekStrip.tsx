import Link from "next/link";
import { loadWeek } from "@/lib/week-load";
import { addDaysIso, dayShort, tintFor } from "@/lib/week-program";

const DAY_NAMES = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

function dateText(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * Ukens program som en farget stripe på forsiden: én kolonne per ukedag, hvert tilbud i sin egen farge.
 * Mandag–fredag vises alltid; lørdag og søndag bare når noe skjer.
 */
export default async function WeekStrip() {
  const { week, today } = await loadWeek(undefined, true);
  const byIso = new Map(week.days.map((d) => [d.iso, d]));
  const columns = Array.from({ length: 7 }, (_, i) => addDaysIso(week.start, i))
    .filter((iso, i) => i < 5 || byIso.has(iso))
    .map((iso) => ({ iso, name: DAY_NAMES[new Date(`${iso}T00:00:00Z`).getUTCDay()], items: byIso.get(iso)?.items ?? [] }));

  return (
    <section id="ukens-program" aria-labelledby="ukens-program-heading" className="mx-auto max-w-6xl scroll-mt-28 px-6 pt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="ukens-program-heading" className="font-serif text-2xl font-medium">
          Ukens program
          <span className="ml-3 font-sans text-base font-normal text-ink-soft">uke {week.number}</span>
        </h2>
        <Link
          href="/aktiviteter#ukens-program"
          className="inline-flex min-h-11 items-center text-base font-semibold text-fig underline underline-offset-4 hover:text-fig-dark"
        >
          Se plakaten og neste uke
        </Link>
      </div>

      <ol
        className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3 md:grid md:overflow-visible md:pb-0"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => {
          const isToday = col.iso === today;
          return (
            <li
              key={col.iso}
              className={`w-44 shrink-0 snap-start rounded-lg p-2 md:w-auto ${isToday ? "bg-white ring-2 ring-fig" : "bg-white/60 ring-1 ring-line"}`}
              aria-current={isToday ? "date" : undefined}
            >
              <p className="px-1 text-base font-semibold text-ink">
                <span aria-hidden="true">{dayShort(col.name)}</span>
                <span className="sr-only">{col.name}</span>{" "}
                <span className="font-normal text-ink-soft">{dateText(col.iso)}</span>
                {isToday && <span className="ml-1.5 text-sm font-semibold text-fig">i dag</span>}
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {col.items.length === 0 ? (
                  <li className="px-1 py-1 text-sm text-ink-soft">Ingen tilbud</li>
                ) : (
                  col.items.map((item) => {
                    const tint = tintFor(item.title);
                    const when = item.note === "avlyst" ? "Avlyst" : item.note === "starter" ? `Starter uke ${item.startsWeek}` : item.time;
                    const body = (
                      <>
                        <span className="block text-[15px] font-semibold leading-snug" style={{ color: tint.fg }}>
                          {item.title}
                        </span>
                        {when && (
                          <span className="block text-sm tabular-nums" style={{ color: tint.fg }}>
                            {when}
                          </span>
                        )}
                      </>
                    );
                    const style = { backgroundColor: tint.bg, borderLeft: `4px solid ${tint.solid}` };
                    return (
                      <li key={item.key}>
                        {item.href ? (
                          <Link href={item.href} className="block rounded-md px-2.5 py-2 hover:brightness-95" style={style}>
                            {body}
                          </Link>
                        ) : (
                          <div className="rounded-md px-2.5 py-2" style={style}>
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
