import Link from "next/link";
import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, VOLUNTEER_STATUSES, filterVolunteers, type ApplicationRow, type Volunteer } from "@/lib/volunteers";
import DeleteButton from "../DeleteButton";
import VolunteerForm from "./VolunteerForm";
import { addFromApplication, addVolunteer, deleteVolunteer } from "./actions";

const STATUS_TINT: Record<string, string> = {
  ny: "bg-[#F5EAD5] text-[#93701F]",
  aktiv: "bg-[#EAF0E9] text-green-dark",
  pause: "bg-cream-2 text-ink-soft",
  sluttet: "bg-ink/10 text-ink-soft",
};

export default async function AdminFrivilligePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const t = await getT();
  const supabase = await createClient();

  const [{ data: volData, error }, { data: appData }] = await Promise.all([
    supabase.from("volunteers").select("*").order("name", { ascending: true }),
    supabase.from("applications").select("*").eq("type", "frivillig").order("created_at", { ascending: false }),
  ]);

  const volunteers = (volData ?? []) as Volunteer[];
  const added = new Set(volunteers.map((v) => v.application_id).filter(Boolean));
  const newApps = ((appData ?? []) as ApplicationRow[]).filter((a) => !added.has(a.id));
  const shown = filterVolunteers(volunteers, q, status);
  const counts = Object.fromEntries(VOLUNTEER_STATUSES.map((s) => [s, volunteers.filter((v) => v.status === s).length]));

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Frivillige")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        {t("Her ser du alle frivillige på ett sted. De som melder seg via «Bli frivillig» havner først under «Nye søknader», og du legger dem inn i listen med ett trykk. Du kan også legge inn frivillige som allerede hjelper til.")}
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-fig/40 bg-[#F7E9E9] px-4 py-3 text-sm text-fig">
          {t("Kunne ikke hente frivillige:")} {error.message}. {t("Kjør")} <code>supabase/frivillige.sql</code> {t("i Supabase SQL Editor først.")}
        </p>
      )}

      {newApps.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg font-medium text-ink">{t("Nye søknader")} ({newApps.length})</h2>
          <div className="mt-3 flex flex-col gap-3">
            {newApps.map((a) => (
              <div key={a.id} className="rounded-xl border border-[#E3D5B4] bg-[#FBF3DD] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-base font-semibold text-ink">{a.name}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {a.email}
                      {a.phone ? ` · ${a.phone}` : ""} · {new Date(a.created_at).toLocaleDateString("nb-NO")}
                    </p>
                  </div>
                  <form action={addFromApplication.bind(null, a.id)}>
                    <button type="submit" className="min-h-11 rounded-lg bg-fig px-5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark">
                      {t("Legg til i listen")}
                    </button>
                  </form>
                </div>
                <dl className="mt-2 flex flex-col gap-0.5 text-sm text-ink-soft">
                  {Object.entries(a.data).map(([k, v]) => (
                    <div key={k}>
                      <dt className="inline font-semibold text-ink">{k}: </dt>
                      <dd className="inline">{Array.isArray(v) ? v.join(", ") : v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-lg font-medium text-ink">
            {t("Frivilligliste")} ({volunteers.length})
          </h2>
          <a
            href="/admin/frivillige/eksport"
            download
            className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink-soft transition-colors hover:border-fig hover:text-fig"
          >
            {t("Last ned som Excel (CSV)")}
          </a>
        </div>

        <form className="mt-3 flex flex-wrap items-end gap-3" method="get">
          <div className="min-w-48 flex-1">
            <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink">{t("Søk")}</label>
            <input id="q" name="q" defaultValue={q} placeholder={t("Navn, e-post, tilbud, interesse")} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig" />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-ink">{t("Status")}</label>
            <select id="status" name="status" defaultValue={status} className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig">
              <option value="">{t("Alle")}</option>
              {VOLUNTEER_STATUSES.map((s) => (
                <option key={s} value={s}>{t(STATUS_LABEL[s])} ({counts[s]})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="min-h-11 rounded-lg border border-fig px-5 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white">
            {t("Søk")}
          </button>
          {(q || status) && (
            <Link href="/admin/frivillige" className="inline-flex min-h-11 items-center text-sm font-semibold text-fig underline underline-offset-4">
              {t("Nullstill")}
            </Link>
          )}
        </form>

        <div className="mt-4 flex flex-col gap-3">
          {shown.length ? (
            shown.map((v) => (
              <div key={v.id} className="rounded-xl border border-line bg-cream p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-base font-semibold text-ink">
                      {v.name}
                      <span className={`ml-2 rounded-full px-2.5 py-0.5 font-sans text-xs font-bold ${STATUS_TINT[v.status]}`}>
                        {t(STATUS_LABEL[v.status])}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {[v.email, v.phone].filter(Boolean).join(" · ") || t("Ingen kontaktinfo")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/frivillige/${v.id}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig">
                      {t("Rediger")}
                    </Link>
                    <form action={deleteVolunteer.bind(null, v.id)}>
                      <DeleteButton what={v.name} />
                    </form>
                  </div>
                </div>
                <dl className="mt-2 flex flex-col gap-0.5 text-sm text-ink-soft">
                  {v.programs && (
                    <div><dt className="inline font-semibold text-ink">{t("Hjelper på")}: </dt><dd className="inline">{v.programs}</dd></div>
                  )}
                  {v.interests.length > 0 && (
                    <div><dt className="inline font-semibold text-ink">{t("Interesser")}: </dt><dd className="inline">{v.interests.join(", ")}</dd></div>
                  )}
                  {v.availability.length > 0 && (
                    <div><dt className="inline font-semibold text-ink">{t("Når kan de")}: </dt><dd className="inline">{v.availability.join(", ")}</dd></div>
                  )}
                  {v.note && <div className="whitespace-pre-line">{v.note}</div>}
                </dl>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-soft">
              {volunteers.length ? t("Ingen treff.") : t("Ingen frivillige i listen ennå. Legg dem til under, eller fra «Nye søknader».")}
            </p>
          )}
        </div>
      </section>

      <details className="mt-8 rounded-xl border border-line bg-cream p-5">
        <summary className="cursor-pointer text-sm font-semibold text-ink">{t("Legg til frivillig")}</summary>
        <div className="mt-4">
          <VolunteerForm action={addVolunteer} submitLabel={t("Legg til frivillig")} />
        </div>
      </details>
    </div>
  );
}
