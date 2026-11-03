import { getT } from "@/lib/admin-i18n-server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { autoParticipants } from "@/lib/stats";

export default async function AdminDashboard() {
  const t = await getT();
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const todayMs = new Date(today).getTime();
  const limit = new Date(todayMs + 30 * 86400000).toISOString().slice(0, 10);

  const [
    { count: activityCount },
    participantCount,
    { count: memberCount },
    { data: followUp },
    { data: actSignups },
    { data: progSignups },
  ] = await Promise.all([
    supabase.from("activities").select("*", { count: "exact", head: true }),
    autoParticipants(supabase),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase
      .from("members")
      .select("id, first_name, last_name, email, phone, expires_at")
      .lte("expires_at", limit)
      .order("expires_at", { ascending: true })
      .limit(15),
    supabase
      .from("activity_signups")
      .select("id, name, email, phone, participants, created_at, activity_id, activities!inner(title, event_date)")
      .gte("activities.event_date", today)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("program_signups")
      .select("id, name, email, phone, participants, created_at, program_id, session_date, recurring_programs!inner(title)")
      .gte("session_date", today)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  type One<T> = T | T[] | null;
  const first = <T,>(v: One<T>) => (Array.isArray(v) ? v[0] : v);
  const newSignups = [
    ...(actSignups ?? []).map((s) => {
      const a = first(s.activities as One<{ title: string; event_date: string }>);
      return { ...s, key: `a${s.id}`, title: a?.title ?? "", date: a?.event_date ?? "", href: `/admin/aktiviteter/${s.activity_id}#pameldte` };
    }),
    ...(progSignups ?? []).map((s) => {
      const p = first(s.recurring_programs as One<{ title: string }>);
      return { ...s, key: `p${s.id}`, title: p?.title ?? "", date: s.session_date as string, href: `/admin/tilbud/${s.program_id}#pameldte` };
    }),
  ]
    .sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)))
    .slice(0, 12);

  const cards = [
    { href: "/admin/medlemmer", label: "Medlemmer", value: memberCount ?? 0 },
    { href: "/admin/aktiviteter", label: "Aktiviteter", value: activityCount ?? 0 },
    { href: "/admin/statistikk", label: "Deltakere totalt", value: participantCount },
  ];

  const rows = (followUp ?? []).map((m) => ({
    ...m,
    days: Math.round((new Date(m.expires_at).getTime() - todayMs) / 86400000),
  }));

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Oversikt")}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t("Her ser du hva som skjer. Trenger du hjelp?")}{" "}
        <Link href="/admin/hjelp" className="font-semibold text-green-dark underline">{t("Les brukerveiledningen")}
        </Link>
        .
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-fig"
          >
            <p className="text-sm font-semibold text-ink-soft">{t(c.label)}</p>
            <p className="mt-2 font-serif text-3xl font-medium text-ink">
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-cream p-6">
        <h2 className="font-serif text-xl font-medium text-ink">{t("Nye påmeldinger")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("Påmeldinger til kommende aktiviteter og faste tilbud, nyeste først. Trykk for å se hele listen.")}
        </p>
        <div className="mt-5 flex flex-col divide-y divide-line">
          {newSignups.length ? (
            newSignups.map((s) => (
              <Link key={s.key} href={s.href} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:opacity-80">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {s.name}{" "}
                    <span className="font-normal text-ink-soft">
                      · {s.participants} {s.participants === 1 ? t("person") : t("personer")}
                    </span>
                  </p>
                  <p className="text-sm text-ink-soft">
                    {s.title} · {s.date}
                    {s.phone ? ` · ${s.phone}` : ""}
                  </p>
                </div>
                <p className="text-xs text-ink-soft">{new Date(s.created_at).toLocaleString("nb-NO")}</p>
              </Link>
            ))
          ) : (
            <p className="py-3 text-sm text-ink-soft">{t("Ingen påmeldinger til kommende arrangementer ennå.")}</p>
          )}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-cream p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">{t("Trenger oppfølging")}
          </h2>
          <Link
            href="/admin/medlemmer?filter=snart"
            className="text-sm font-semibold text-green-dark"
          >{t("Se alle medlemmer →")}
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{t("Medlemskap som er utløpt eller utløper innen 30 dager. Ring eller send e-post ved behov.")}
        </p>

        <div className="mt-5 flex flex-col divide-y divide-line">
          {rows.length ? (
            rows.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {m.first_name} {m.last_name}
                  </p>
                  <p
                    className={`text-sm ${
                      m.days < 0 ? "font-semibold text-fig" : "text-ink-soft"
                    }`}
                  >
                    {m.days < 0
                      ? t("Utløpt for {n} dager siden", { n: -m.days })
                      : m.days === 0
                        ? t("Utløper i dag")
                        : t("{n} dager igjen", { n: m.days })}{" "}
                    ({m.expires_at})
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/\s/g, "")}`}
                      className="rounded-full bg-[#EAF0E9] px-4 py-2 font-semibold text-green-dark hover:opacity-80"
                    >{t("Ring")}{" "}{m.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${m.email}`}
                    className="rounded-full border border-line px-4 py-2 text-ink-soft hover:border-ink hover:text-ink"
                  >{t("E-post")}
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="py-3 text-sm text-ink-soft">{t("Ingen medlemskap trenger oppfølging akkurat nå.")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
