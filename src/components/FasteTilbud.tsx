import {
  nextOccurrences,
  shortDate,
  timeText,
  todayOslo,
  weekdayAbbr,
  whenText,
  type Program,
} from "@/lib/recurring";

const tints = [
  "bg-green/10 text-green-dark",
  "bg-fig/10 text-fig",
  "bg-[#C08A5C]/15 text-[#8a5a34]",
];

export default function FasteTilbud({ programs }: { programs: Program[] }) {
  if (!programs.length) return null;
  const today = todayOslo();

  return (
    <section className="mt-12" aria-labelledby="faste-tilbud">
      <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
        Hver uke og hver måned
      </p>
      <h2 id="faste-tilbud" className="mt-2 font-serif text-2xl font-medium">
        Faste tilbud
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {programs.map((p, i) => {
          const next = nextOccurrences(p, today, 1)[0];
          const time = timeText(p);
          const upcomingSkipped = p.skipped_dates.filter((d) => d >= today).sort();
          const startsLater = p.start_date && p.start_date > today;

          return (
            <article
              key={p.id}
              className="flex flex-col rounded-[18px] border border-line bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-wide ${tints[i % tints.length]}`}
                >
                  {weekdayAbbr(p)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{whenText(p)}</p>
                  {time && <p className="text-sm text-ink-soft">{time}</p>}
                </div>
              </div>

              <h3 className="mt-4 font-serif text-xl">{p.title}</h3>
              {p.description && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.description}</p>
              )}
              <p className="mt-3 text-sm text-ink-soft">{p.place}</p>

              {p.note && (
                <p className="mt-3 w-fit rounded-full bg-cream-2 px-3 py-1 text-xs font-semibold text-green-dark">
                  {p.note}
                </p>
              )}

              <div className="mt-auto pt-4">
                {startsLater && p.start_date && (
                  <p className="text-sm font-semibold text-fig">
                    Starter {shortDate(p.start_date)}
                  </p>
                )}
                {next && !startsLater && (
                  <p className="text-sm font-semibold text-ink">Neste: {shortDate(next)}</p>
                )}
                {upcomingSkipped.length > 0 && (
                  <p className="mt-1 text-xs text-fig">
                    Avlyst: {upcomingSkipped.map(shortDate).join(", ")}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-green-dark">
                  {p.image_url && (
                    <a href={p.image_url} target="_blank" rel="noopener noreferrer">
                      Se plakat →
                    </a>
                  )}
                  {p.external_link && (
                    <a href={p.external_link} target="_blank" rel="noopener noreferrer">
                      Se på Facebook →
                    </a>
                  )}
                  {p.contact && (
                    <a href={`mailto:${p.contact}`} className="break-all font-normal">
                      {p.contact}
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
