import { getT } from "@/lib/admin-i18n-server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addMember, deleteMember, markPaid } from "./actions";
import DeleteButton from "../DeleteButton";

type Status = "ubetalt" | "aktiv" | "snart" | "utlopt";

function statusOf(expires: string | null): { status: Status; days: number | null } {
  if (!expires) return { status: "ubetalt", days: null };
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const days = Math.round((new Date(expires).getTime() - today) / 86400000);
  if (days < 0) return { status: "utlopt", days };
  if (days <= 30) return { status: "snart", days };
  return { status: "aktiv", days };
}

const BADGE: Record<Status, { label: string; cls: string }> = {
  ubetalt: { label: "Ikke betalt", cls: "bg-[#F5EAD5] text-[#93701F]" },
  aktiv: { label: "Aktiv", cls: "bg-[#EAF0E9] text-green-dark" },
  snart: { label: "Utløper snart", cls: "bg-[#F5EAD5] text-[#93701F]" },
  utlopt: { label: "Utløpt", cls: "bg-[#F7E9E9] text-fig" },
};

const FILTERS: [string, string][] = [
  ["alle", "Alle"],
  ["ubetalt", "Ikke betalt"],
  ["snart", "Utløper snart"],
  ["utlopt", "Utløpt"],
  ["aktiv", "Aktive"],
];

function ageOf(birth: string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const before =
    now.getUTCMonth() < b.getUTCMonth() ||
    (now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() < b.getUTCDate());
  if (before) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

const field =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";

export default async function AdminMedlemmerPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; view?: string }>;
}) {
  const t = await getT();
  const { filter = "alle", q = "", view = "medlemskap" } = await searchParams;
  const query = q.trim().toLowerCase();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  const members = (data ?? []).map((m) => {
    const s = statusOf(m.expires_at);
    return { ...m, status: s.status, days: s.days } as {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      birth_date: string | null;
      expires_at: string | null;
      membership_type: "enkelt" | "familie";
      family_members: { name: string; birth_date: string | null }[];
      status: Status;
      days: number | null;
    };
  });
  const persons = members.reduce((n, m) => n + 1 + (m.family_members?.length ?? 0), 0);
  const counts = (s: string) => members.filter((m) => m.status === s).length;
  const byStatus = filter === "alle" ? members : members.filter((m) => m.status === filter);
  const shown = query
    ? byStatus.filter((m) =>
        [
          m.first_name,
          m.last_name,
          `${m.first_name} ${m.last_name}`,
          m.email,
          m.phone ?? "",
          ...(m.family_members ?? []).map((f) => f.name),
        ].some((v) => v.toLowerCase().includes(query))
      )
    : byStatus;

  // Én rad per person: hovedmedlem og hvert familiemedlem for seg.
  const personRows = shown.flatMap((m) => [
    {
      key: `${m.id}-main`,
      name: `${m.first_name} ${m.last_name}`,
      birth: m.birth_date,
      relation: null as string | null,
      m,
    },
    ...(m.family_members ?? []).map((f, i) => ({
      key: `${m.id}-fam-${i}`,
      name: f.name,
      birth: f.birth_date,
      relation: `${m.first_name} ${m.last_name}`,
      m,
    })),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Medlemmer")}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {t("{members} medlemskap ({persons} personer) · {active} aktive · {soon} utløper snart · {expired} utløpt · {unpaid} ikke betalt", {
          members: members.length,
          persons,
          active: counts("aktiv") + counts("snart"),
          soon: counts("snart"),
          expired: counts("utlopt"),
          unpaid: counts("ubetalt"),
        })}
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-[#F7E9E9] px-4 py-3 text-sm text-fig">{t("Kunne ikke hente medlemmer:")}{" "}{error.message}
        </p>
      )}

      <details className="mt-6 rounded-2xl border border-line bg-cream p-5">
        <summary className="cursor-pointer text-sm font-semibold text-ink">{t("Legg til eksisterende medlem")}
        </summary>
        <form action={addMember} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label><span className="mb-1 block text-sm font-medium text-ink">{t("Fornavn")}</span><input name="first_name" required className={field} /></label>
          <label><span className="mb-1 block text-sm font-medium text-ink">{t("Etternavn")}</span><input name="last_name" required className={field} /></label>
          <label><span className="mb-1 block text-sm font-medium text-ink">{t("E-post")}</span><input name="email" type="email" required className={field} /></label>
          <label><span className="mb-1 block text-sm font-medium text-ink">{t("Telefon (valgfritt)")}</span><input name="phone" className={field} /></label>
          <label>
            <span className="mb-1 block text-sm font-medium text-ink">{t("Type medlemskap")}</span>
            <select name="membership_type" className={field} defaultValue="enkelt">
              <option value="enkelt">{t("Enkelt person (100 kr)")}</option>
              <option value="familie">{t("Familie (150 kr)")}</option>
            </select>
          </label>
          <label className="text-sm text-ink-soft sm:col-span-2">{t("Medlemskap gjelder til (la stå tom hvis ikke betalt)")}
            <input name="expires_at" type="date" className={`${field} mt-1 block w-full`} />
          </label>
          <button
            type="submit"
            className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white hover:bg-fig-dark"
          >{t("Legg til")}
          </button>
        </form>
      </details>

      <form action="/admin/medlemmer" method="get" role="search" className="mt-6 flex flex-wrap gap-2">
        <input type="hidden" name="filter" value={filter} />
        <input type="hidden" name="view" value={view} />
        <label className="sr-only" htmlFor="q">{t("Søk etter medlem")}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t("Søk på navn, e-post eller telefon")}
          className="min-h-11 w-full max-w-sm rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-fig px-5 text-sm font-semibold text-white hover:bg-fig-dark"
        >{t("Søk")}
        </button>
        {q && (
          <Link
            href={`/admin/medlemmer?view=${view}&filter=${filter}`}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm text-ink-soft hover:text-ink"
          >{t("Fjern søk")}
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm" role="group" aria-label={t("Visning")}>
        <span className="mr-1 font-semibold text-ink-soft">{t("Visning")}:</span>
        {(
          [
            ["medlemskap", "Medlemskap"],
            ["personer", "Hver person for seg"],
          ] as const
        ).map(([key, text]) => (
          <Link
            key={key}
            href={`/admin/medlemmer?view=${key}&filter=${filter}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            aria-current={view === key ? "true" : undefined}
            className={`min-h-11 inline-flex items-center rounded-full px-4 ${
              view === key ? "bg-ink text-cream" : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            {t(text)}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {FILTERS.map(([key, text]) => (
          <Link
            key={key}
            href={`/admin/medlemmer?view=${view}&filter=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-2 ${
              filter === key ? "bg-fig text-white" : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            {t(text)}
          </Link>
        ))}
      </div>

      {view === "personer" ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-ink-soft">
            {t("{n} personer vises", { n: personRows.length })}
          </p>
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-line bg-cream">
            {personRows.length ? (
              personRows.map((r) => {
                const age = ageOf(r.birth);
                return (
                  <li key={r.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {r.name}{" "}
                        <span className={`ml-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-bold ${BADGE[r.m.status].cls}`}>
                          {t(BADGE[r.m.status].label)}
                        </span>
                      </p>
                      <p className="text-sm text-ink-soft">
                        {r.relation
                          ? t("Familiemedlem av {name}", { name: r.relation })
                          : t("Hovedmedlem")}
                        {" · "}
                        {r.birth
                          ? `${t("født {date}", { date: r.birth })}${age !== null ? ` (${t("{n} år", { n: age })})` : ""}`
                          : t("fødselsdato mangler")}
                        {!r.relation && r.m.phone ? ` · ${r.m.phone}` : ""}
                        {!r.relation ? ` · ${r.m.email}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-5 py-4 text-sm text-ink-soft">{t("Ingen personer her.")}</li>
            )}
          </ul>
        </div>
      ) : (
      <div className="mt-6 flex flex-col gap-3">
        {shown.length ? (
          shown.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-cream px-5 py-4"
            >
              <div>
                <p className="font-serif text-base font-semibold text-ink">
                  {m.first_name} {m.last_name}{" "}
                  <span className={`ml-2 rounded-full px-2.5 py-0.5 font-sans text-xs font-bold ${BADGE[m.status].cls}`}>
                    {t(BADGE[m.status].label)}
                  </span>
                </p>
                <p className="text-sm text-ink-soft">
                  {m.membership_type === "familie" ? t("Familie (150 kr)") : t("Enkelt (100 kr)")} ·{" "}
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
                {m.family_members?.length > 0 && (
                  <div className="mt-1 text-sm text-ink-soft">
                    <p className="font-semibold text-ink">
                      {t("Familiemedlemmer ({n})", { n: m.family_members.length })}
                    </p>
                    <ul className="mt-0.5 list-disc pl-5">
                      {m.family_members.map((f, i) => {
                        const age = ageOf(f.birth_date);
                        return (
                          <li key={i}>
                            {f.name}
                            {f.birth_date
                              ? ` · ${t("født {date}", { date: f.birth_date })}${age !== null ? ` (${t("{n} år", { n: age })})` : ""}`
                              : ` · ${t("fødselsdato mangler")}`}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-ink-soft">
                  {m.expires_at
                    ? t("Gyldig til {date} ({info})", {
                        date: m.expires_at,
                        info:
                          m.days! >= 0
                            ? t("{n} dager igjen", { n: m.days! })
                            : t("utløpt for {n} dager siden", { n: -m.days! }),
                      })
                    : t("Venter på betaling (Vipps #595791)")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={markPaid.bind(null, m.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-[#EAF0E9] px-4 py-2 text-sm font-semibold text-green-dark hover:opacity-80"
                  >
                    {m.expires_at ? t("Forny (+1 år)") : t("Marker betalt")}
                  </button>
                </form>
                <form action={deleteMember.bind(null, m.id)}>
                  <DeleteButton what={`${m.first_name} ${m.last_name}`} extra={t("Medlemmet og eventuelle familiemedlemmer fjernes fra medlemslisten.")} />
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">
            {q ? t("Ingen medlemmer funnet for «{q}».", { q }) : t("Ingen medlemmer her.")}
          </p>
        )}
      </div>
      )}
    </div>
  );
}
