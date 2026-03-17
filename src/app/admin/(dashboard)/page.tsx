import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: activityCount }, { count: newsCount }] = await Promise.all([
    supabase.from("activities").select("*", { count: "exact", head: true }),
    supabase.from("news").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      href: "/admin/aktiviteter",
      label: "Aktiviteter",
      value: activityCount ?? 0,
    },
    { href: "/admin/nyheter", label: "Nyheter", value: newsCount ?? 0 },
    { href: "/admin/statistikk", label: "Statistikk", value: "→" },
  ];

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
    </div>
  );
}
