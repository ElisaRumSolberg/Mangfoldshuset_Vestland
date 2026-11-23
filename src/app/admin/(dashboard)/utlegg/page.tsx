import Link from "next/link";
import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { STATUSES, STATUS_LABEL, STATUS_TINT, fmtMoney, isStatus, type ExpenseRow } from "@/lib/expenses";

export default async function AdminUtleggPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; year?: string }>;
}) {
  const { status = "", year = "" } = await searchParams;
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = roleFromUser(user) === "owner";

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  const all = (data ?? []) as ExpenseRow[];

  const years = [...new Set(all.map((e) => e.expense_date.slice(0, 4)))].sort().reverse();
  const yearSel = /^\d{4}$/.test(year) ? year : "";
  const inYear = yearSel ? all.filter((e) => e.expense_date.startsWith(yearSel)) : all;
  const shown = isStatus(status) ? inYear.filter((e) => e.status === status) : inYear;
  const count = (s: string) => inYear.filter((e) => e.status === s).length;
  const sum = (rows: ExpenseRow[]) => rows.reduce((a, e) => a + Number(e.total_nok), 0);
  const href = (s: string) => {
    const q = new URLSearchParams();
    if (s) q.set("status", s);
    if (yearSel) q.set("year", yearSel);
    const qs = q.toString();
    return qs ? `/admin/utlegg?${qs}` : "/admin/utlegg";
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">{t("Utlegg")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            {isOwner
              ? t("Her leverer du inn utlegg med bilde av kvitteringen, og her godkjenner du dem. Alt arkiveres, og du kan laste ned en oversikt til regnskapsføreren.")
              : t("Her leverer du inn utlegg du har betalt for foreningen, med bilde av kvitteringen. Kasserer godkjenner det, og du får beskjed på e-post.")}
          </p>
        </div>
        <Link href="/admin/utlegg/ny" className="inline-flex min-h-11 items-center rounded-lg bg-fig px-5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark">
          + {t("Nytt utlegg")}
        </Link>
      </div>

      {isOwner && (
        <p className="mt-6 rounded-xl border border-line bg-cream px-5 py-4 text-sm text-ink-soft">
          {t("Frivillige uten konto kan levere utlegg på")} <strong className="text-ink">/utlegg</strong>{" "}
          {t("med et fellesord. Siden står ikke i menyen, så du må dele lenken selv.")}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-fig/40 bg-[#F7E9E9] px-4 py-3 text-sm text-fig">
          {t("Kunne ikke hente utlegg:")} {error.message}. {t("Kjør")} <code>supabase/utlegg.sql</code> {t("i Supabase SQL Editor først.")}
        </p>
      )}

      <nav aria-label={t("Filter")} className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <Link href={href("")} className={`rounded-full px-4 py-2 ${!isStatus(status) ? "bg-ink text-white" : "border border-line text-ink-soft hover:text-ink"}`}>
          {t("Alle")} ({inYear.length})
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={href(s)} className={`rounded-full px-4 py-2 ${status === s ? "bg-ink text-white" : "border border-line text-ink-soft hover:text-ink"}`}>
            {t(STATUS_LABEL[s])} ({count(s)})
          </Link>
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        {years.length > 1 && (
          <form method="get" className="flex items-end gap-2">
            {isStatus(status) && <input type="hidden" name="status" value={status} />}
            <div>
              <label htmlFor="year" className="mb-1 block text-sm font-medium text-ink">{t("År")}</label>
              <select id="year" name="year" defaultValue={yearSel} className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig">
                <option value="">{t("Alle")}</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="min-h-11 rounded-lg border border-fig px-5 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white">{t("Vis")}</button>
          </form>
        )}
        {isOwner && (
          <a
            href={`/admin/utlegg/eksport${yearSel ? `?year=${yearSel}` : ""}`}
            download
            className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink-soft transition-colors hover:border-fig hover:text-fig"
          >
            {t("Last ned som Excel (CSV)")}
          </a>
        )}
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        {t("Viser {n} utlegg, til sammen {sum}.", { n: shown.length, sum: fmtMoney(sum(shown)) })}
      </p>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-cream p-6 text-sm text-ink-soft">{t("Ingen utlegg her ennå.")}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {shown.map((e) => (
            <li key={e.id}>
              <Link href={`/admin/utlegg/${e.id}`} className="block rounded-xl border border-line bg-cream p-5 transition-colors hover:border-fig">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-base font-semibold text-ink">{e.purpose}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {e.expense_date} · {e.created_by_name ?? e.created_by_email ?? "–"}
                      {e.no_receipt ? ` · ${t("kvittering mangler")}` : ` · ${e.receipts.length} ${t("kvittering(er)")}`}
                      {e.source === "lenke" ? ` · ${t("via lenke")}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg font-medium text-ink">{fmtMoney(Number(e.total_nok))}</p>
                    {e.currency !== "NOK" && <p className="text-xs text-ink-soft">{fmtMoney(Number(e.total_original), e.currency)}</p>}
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TINT[e.status] ?? ""}`}>
                      {isStatus(e.status) ? t(STATUS_LABEL[e.status]) : e.status}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
