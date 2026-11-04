import { getT } from "@/lib/admin-i18n-server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ageOn } from "@/lib/member-stats";
import { METHOD_LABEL, summarize, type Method, type PaymentRow } from "@/lib/payments-report";
import { todayOslo } from "@/lib/recurring";
import { deletePayment } from "./actions";
import DeleteButton from "../DeleteButton";

export default async function BetalingerPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const t = await getT();
  const { year: yearParam } = await searchParams;
  const thisYear = Number(todayOslo().slice(0, 4));
  const year = /^\d{4}$/.test(yearParam ?? "") ? Number(yearParam) : thisYear;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_payments")
    .select("id, covers_year, amount, method, paid_at, members(id, first_name, last_name, birth_date, gender)")
    .gte("paid_at", `${year}-01-01`)
    .lte("paid_at", `${year}-12-31`)
    .order("paid_at", { ascending: false });

  const rows: PaymentRow[] = (data ?? []).map((r) => {
    const m = Array.isArray(r.members) ? r.members[0] : r.members;
    return { id: r.id, covers_year: r.covers_year, amount: r.amount, method: r.method, paid_at: r.paid_at, member: m ?? null };
  });
  const asOf = year >= thisYear ? todayOslo() : `${year}-12-31`;
  const s = summarize(rows, asOf);
  const label = (m: string) => t(METHOD_LABEL[m as Method] ?? m);

  const tiles = [
    { label: t("Betalende medlemmer"), value: s.members },
    { label: t("Betalinger"), value: s.payments },
    { label: t("Sum innbetalt"), value: `${s.total} kr` },
    { label: t("Under 26 år"), value: s.stats.under26 },
    { label: t("6–25 år"), value: s.stats.age6to25 },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Betalinger")}</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        {t("Hvert medlem har sin egen betaling, også barn. Oversikten viser hvem som har betalt i året du velger, og kan lastes ned til søknader.")}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {[thisYear, thisYear - 1, thisYear - 2].map((y) => (
          <Link
            key={y}
            href={`/admin/betalinger?year=${y}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              y === year ? "border-fig bg-fig text-white" : "border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {y}
          </Link>
        ))}
        <a
          href={`/admin/betalinger/eksport?year=${year}`}
          className="ml-auto rounded-full bg-[#EAF0E9] px-4 py-2 text-sm font-semibold text-green-dark hover:opacity-80"
        >
          {t("Last ned CSV for {year}", { year })}
        </a>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-[#F7E9E9] px-4 py-3 text-sm text-fig">
          {t("Kunne ikke hente betalinger:")} {error.message}. {t("Kjør")} <code>supabase/member-payments.sql</code>{" "}
          {t("i Supabase SQL Editor først.")}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((x) => (
          <div key={x.label} className="rounded-2xl border border-line bg-cream p-4">
            <p className="text-xs font-semibold text-ink-soft">{x.label}</p>
            <p className="mt-1 font-serif text-2xl text-ink">{x.value}</p>
          </div>
        ))}
      </div>

      {s.byMethod.length > 0 && (
        <p className="mt-3 text-sm text-ink-soft">
          {s.byMethod.map((m) => `${label(m.method)}: ${m.count} (${m.sum} kr)`).join(" · ")}
        </p>
      )}

      <details open className="mt-6 rounded-2xl border border-line bg-cream p-5">
        <summary className="cursor-pointer text-sm font-semibold text-ink">{t("Betalende medlemmer etter alder og kjønn")}</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-1.5 pr-3 font-medium">{t("Alder")}</th>
                <th className="py-1.5 pr-3 font-medium">{t("Kvinner")}</th>
                <th className="py-1.5 pr-3 font-medium">{t("Menn")}</th>
                <th className="py-1.5 pr-3 font-medium">{t("Annet / ikke oppgitt")}</th>
                <th className="py-1.5 font-medium">{t("Sum")}</th>
              </tr>
            </thead>
            <tbody>
              {s.stats.rows.map((r) => (
                <tr key={r.key} className="border-b border-line/60">
                  <td className="py-1.5 pr-3">{r.key === "26+" ? t("26 år og over") : t("{g} år", { g: r.key })}</td>
                  <td className="py-1.5 pr-3">{r.kvinne}</td>
                  <td className="py-1.5 pr-3">{r.mann}</td>
                  <td className="py-1.5 pr-3">{r.annet}</td>
                  <td className="py-1.5 font-semibold">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-soft">
            {t("Alder regnet per {date}. Uten fødselsdato: {x}.", { date: asOf, x: s.stats.unknownAge })}
          </p>
        </div>
      </details>

      <div className="mt-6 flex flex-col gap-2">
        {rows.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("Ingen betalinger registrert i {year}.", { year })}</p>
        ) : (
          rows.map((r) => {
            const age = r.member ? ageOn(r.member.birth_date, r.paid_at) : null;
            const name = r.member ? `${r.member.first_name} ${r.member.last_name}` : t("Slettet medlem");
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream px-5 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {name}
                    {age !== null && <span className="font-normal text-ink-soft"> · {t("{n} år", { n: age })}</span>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {r.paid_at} · {label(r.method)} · {t("dekker {y}", { y: r.covers_year })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg text-ink">{r.amount} kr</span>
                  <form action={deletePayment.bind(null, r.id)}>
                    <DeleteButton
                      what={t("betalingen fra {name}", { name })}
                      extra={t("Medlemmet står da som ikke betalt for denne perioden, med mindre det finnes en tidligere betaling.")}
                    />
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
