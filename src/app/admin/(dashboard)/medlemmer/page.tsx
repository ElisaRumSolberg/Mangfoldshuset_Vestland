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

const field =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";

export default async function AdminMedlemmerPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter = "alle", q = "" } = await searchParams;
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

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Medlemmer</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {members.length} medlemskap ({persons} personer) · {counts("aktiv") + counts("snart")} aktive ·{" "}
        {counts("snart")} utløper snart · {counts("utlopt")} utløpt ·{" "}
        {counts("ubetalt")} ikke betalt
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-[#F7E9E9] px-4 py-3 text-sm text-fig">
          Kunne ikke hente medlemmer: {error.message}
        </p>
      )}

      <details className="mt-6 rounded-2xl border border-line bg-cream p-5">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          Legg til eksisterende medlem
        </summary>
        <form action={addMember} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label><span className="mb-1 block text-sm font-medium text-ink">Fornavn</span><input name="first_name" required className={field} /></label>
          <label><span className="mb-1 block text-sm font-medium text-ink">Etternavn</span><input name="last_name" required className={field} /></label>
          <label><span className="mb-1 block text-sm font-medium text-ink">E-post</span><input name="email" type="email" required className={field} /></label>
          <label><span className="mb-1 block text-sm font-medium text-ink">Telefon (valgfritt)</span><input name="phone" className={field} /></label>
          <label>
            <span className="mb-1 block text-sm font-medium text-ink">Type medlemskap</span>
            <select name="membership_type" className={field} defaultValue="enkelt">
              <option value="enkelt">Enkelt person (100 kr)</option>
              <option value="familie">Familie (150 kr)</option>
            </select>
          </label>
          <label className="text-sm text-ink-soft sm:col-span-2">
            Medlemskap gjelder til (la stå tom hvis ikke betalt)
            <input name="expires_at" type="date" className={`${field} mt-1 block w-full`} />
          </label>
          <button
            type="submit"
            className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white hover:bg-fig-dark"
          >
            Legg til
          </button>
        </form>
      </details>

      <form action="/admin/medlemmer" method="get" role="search" className="mt-6 flex flex-wrap gap-2">
        <input type="hidden" name="filter" value={filter} />
        <label className="sr-only" htmlFor="q">
          Søk etter medlem
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Søk på navn, e-post eller telefon"
          className="min-h-11 w-full max-w-sm rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-fig px-5 text-sm font-semibold text-white hover:bg-fig-dark"
        >
          Søk
        </button>
        {q && (
          <Link
            href={`/admin/medlemmer?filter=${filter}`}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm text-ink-soft hover:text-ink"
          >
            Fjern søk
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map(([key, text]) => (
          <Link
            key={key}
            href={`/admin/medlemmer?filter=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-2 ${
              filter === key ? "bg-fig text-white" : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            {text}
          </Link>
        ))}
      </div>

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
                    {BADGE[m.status].label}
                  </span>
                </p>
                <p className="text-sm text-ink-soft">
                  {m.membership_type === "familie" ? "Familie (150 kr)" : "Enkelt (100 kr)"} ·{" "}
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
                {m.family_members?.length > 0 && (
                  <p className="text-sm text-ink-soft">
                    Familie: {m.family_members.map((f) => f.name).join(", ")}
                  </p>
                )}
                <p className="text-sm text-ink-soft">
                  {m.expires_at
                    ? `Gyldig til ${m.expires_at} (${
                        m.days! >= 0 ? `${m.days} dager igjen` : `utløpt for ${-m.days!} dager siden`
                      })`
                    : "Venter på betaling (Vipps #595791)"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={markPaid.bind(null, m.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-[#EAF0E9] px-4 py-2 text-sm font-semibold text-green-dark hover:opacity-80"
                  >
                    {m.expires_at ? "Forny (+1 år)" : "Marker betalt"}
                  </button>
                </form>
                <form action={deleteMember.bind(null, m.id)}>
                  <DeleteButton what={`${m.first_name} ${m.last_name}`} extra="Medlemmet og eventuelle familiemedlemmer fjernes fra medlemslisten." />
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">
            {q ? `Ingen medlemmer funnet for «${q}».` : "Ingen medlemmer her."}
          </p>
        )}
      </div>
    </div>
  );
}
