import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addMember, deleteMember, markPaid } from "./actions";

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
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "alle" } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
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
      status: Status;
      days: number | null;
    };
  });
  const counts = (s: string) => members.filter((m) => m.status === s).length;
  const shown = filter === "alle" ? members : members.filter((m) => m.status === filter);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Medlemmer</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {members.length} totalt · {counts("aktiv") + counts("snart")} aktive ·{" "}
        {counts("snart")} utløper snart · {counts("utlopt")} utløpt ·{" "}
        {counts("ubetalt")} ikke betalt
      </p>

      <details className="mt-6 rounded-2xl border border-line bg-cream p-5">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          Legg til eksisterende medlem
        </summary>
        <form action={addMember} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="first_name" required placeholder="Fornavn" className={field} />
          <input name="last_name" required placeholder="Etternavn" className={field} />
          <input name="email" type="email" required placeholder="E-post" className={field} />
          <input name="phone" placeholder="Telefon" className={field} />
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

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {FILTERS.map(([key, text]) => (
          <Link
            key={key}
            href={`/admin/medlemmer?filter=${key}`}
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
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
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
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-fig hover:text-fig"
                  >
                    Slett
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">Ingen medlemmer her.</p>
        )}
      </div>
    </div>
  );
}
