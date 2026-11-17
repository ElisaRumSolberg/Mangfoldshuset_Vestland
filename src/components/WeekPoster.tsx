import Link from "next/link";
import WeekList from "@/components/WeekList";
import { loadWeek } from "@/lib/week-load";

const nav = "inline-flex min-h-11 items-center text-base font-semibold text-fig underline underline-offset-4 hover:text-fig-dark";

/**
 * «Ukens program» på Aktiviteter: plakaten for uken (laget automatisk av tallene på nettsiden), bla mellom
 * uker og selve listen under «Vis som liste». Nedlasting av plakaten til Instagram/Facebook ligger i admin.
 */
export default async function WeekPoster({ weekParam }: { weekParam?: string }) {
  const { week, thisWeek, prev, next } = await loadWeek(weekParam);
  const q = `uke=${week.start}`;
  const link = (iso: string) => `/aktiviteter?uke=${iso}#ukens-program`;

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

      <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/aktiviteter/ukeplakat?${q}&format=instagram`}
          width={1080}
          height={1350}
          alt={`Plakat for uke ${week.number}. Alle dager og tider står i listen ved siden av.`}
          className="h-auto w-full rounded-xl border border-line bg-white"
        />

        <div className="flex flex-col gap-6">
          <nav aria-label="Bla mellom uker" className="flex flex-wrap items-center gap-x-8">
            <Link href={link(prev)} className={nav}>
              ← Forrige uke
            </Link>
            {week.start !== thisWeek && (
              <Link href="/aktiviteter#ukens-program" className={nav}>
                Denne uken
              </Link>
            )}
            <Link href={link(next)} className={nav}>
              Neste uke →
            </Link>
          </nav>

          <details className="group border-t border-line pt-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
              Vis som liste
              <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-2">
              <WeekList week={week} />
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
