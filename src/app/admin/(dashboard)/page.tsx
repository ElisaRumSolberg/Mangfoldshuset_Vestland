import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const todayMs = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const limit = new Date(todayMs + 30 * 86400000).toISOString().slice(0, 10);

  const [
    { count: activityCount },
    { count: newsCount },
    { count: memberCount },
    { data: followUp },
  ] = await Promise.all([
    supabase.from("activities").select("*", { count: "exact", head: true }),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase
      .from("members")
      .select("id, first_name, last_name, email, phone, expires_at")
      .lte("expires_at", limit)
      .order("expires_at", { ascending: true })
      .limit(15),
  ]);

  const cards = [
    { href: "/admin/medlemmer", label: "Medlemmer", value: memberCount ?? 0 },
    { href: "/admin/aktiviteter", label: "Aktiviteter", value: activityCount ?? 0 },
    { href: "/admin/nyheter", label: "Nyheter", value: newsCount ?? 0 },
  ];

  const rows = (followUp ?? []).map((m) => ({
    ...m,
    days: Math.round((new Date(m.expires_at).getTime() - todayMs) / 86400000),
  }));

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Oversikt over innhold på nettsiden.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-fig"
          >
            <p className="text-sm font-semibold text-ink-soft">{c.label}</p>
            <p className="mt-2 font-serif text-3xl font-medium text-ink">
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-cream p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">
            Trenger oppfølging
          </h2>
          <Link
            href="/admin/medlemmer?filter=snart"
            className="text-sm font-semibold text-green-dark"
          >
            Se alle medlemmer →
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Medlemskap som er utløpt eller utløper innen 30 dager. Ring eller send
          e-post ved behov.
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
                      ? `Utløpt for ${-m.days} dager siden`
                      : m.days === 0
                        ? "Utløper i dag"
                        : `${m.days} dager igjen`}{" "}
                    ({m.expires_at})
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/\s/g, "")}`}
                      className="rounded-full bg-[#EAF0E9] px-4 py-2 font-semibold text-green-dark hover:opacity-80"
                    >
                      Ring {m.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${m.email}`}
                    className="rounded-full border border-line px-4 py-2 text-ink-soft hover:border-ink hover:text-ink"
                  >
                    E-post
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="py-3 text-sm text-ink-soft">
              Ingen medlemskap trenger oppfølging akkurat nå.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
