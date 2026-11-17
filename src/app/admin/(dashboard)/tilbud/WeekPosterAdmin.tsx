import Link from "next/link";
import { getT } from "@/lib/admin-i18n-server";
import { loadWeek } from "@/lib/week-load";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-fig px-4 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white";
const nav = "inline-flex min-h-11 items-center text-sm font-semibold text-fig underline underline-offset-4";

/** For admin: ukeplakaten med nedlasting til Instagram og Facebook. Plakaten lages av de samme tidene som nettsiden viser. */
export default async function WeekPosterAdmin({ weekParam }: { weekParam?: string }) {
  const t = await getT();
  const { week, thisWeek, prev, next } = await loadWeek(weekParam);
  const q = `uke=${week.start}`;
  const link = (iso: string) => `/admin/tilbud?uke=${iso}`;

  return (
    <section className="mt-6 rounded-xl border border-line bg-cream p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-serif text-lg font-semibold text-ink">{t("Ukens plakat")}</h2>
        <p className="text-sm text-ink-soft">
          {t("Uke {n}", { n: week.number })} · {week.label}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/aktiviteter/ukeplakat?${q}&format=instagram`}
          width={1080}
          height={1350}
          alt={t("Plakat for uken")}
          className="h-auto w-40 rounded-lg border border-line bg-white"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="max-w-md text-sm leading-relaxed text-ink-soft">
            {t("Plakaten lages av de samme tidene som står på nettsiden. Last den ned og legg den ut på Facebook eller Instagram.")}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`/aktiviteter/ukeplakat?${q}&format=instagram&last=1`} download className={button}>
              Instagram
            </a>
            <a href={`/aktiviteter/ukeplakat?${q}&format=story&last=1`} download className={button}>
              Instagram story
            </a>
            <a href={`/aktiviteter/ukeplakat?${q}&format=facebook&last=1`} download className={button}>
              Facebook
            </a>
          </div>
          <nav aria-label={t("Bla mellom uker")} className="flex flex-wrap items-center gap-x-6">
            <Link href={link(prev)} className={nav}>
              ← {t("Forrige uke")}
            </Link>
            {week.start !== thisWeek && (
              <Link href="/admin/tilbud" className={nav}>
                {t("Denne uken")}
              </Link>
            )}
            <Link href={link(next)} className={nav}>
              {t("Neste uke")} →
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
