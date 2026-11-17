import Link from "next/link";
import { tintFor, type Week } from "@/lib/week-program";

/** Ukens program som ren liste (for lesing, skjermlesere og de som vil se alt som tekst). */
export default function WeekList({ week }: { week: Week }) {
  if (week.days.length === 0) {
    return <p className="text-base text-ink-soft">Ingen faste tilbud denne uken.</p>;
  }
  return (
    <ol className="border-t border-line">
      {week.days.map((day) => (
        <li key={day.iso} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <p className="text-base font-semibold text-ink">
            {day.name} <span className="font-normal text-ink-soft">{day.dateText}</span>
          </p>
          <ul className="flex flex-col gap-3">
            {day.items.map((item) => (
              <li key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5">
                <div className="flex min-w-0 gap-3">
                  <span aria-hidden="true" className="mt-1 h-5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: tintFor(item.title).solid }} />
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
  );
}
