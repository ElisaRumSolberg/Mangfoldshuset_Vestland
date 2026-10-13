import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityGrid from "@/components/ActivityGrid";
import FasteTilbud from "@/components/FasteTilbud";
import { fetchPrograms, occurrenceCards, sortUpcoming } from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { shortDateRange } from "@/lib/activity-date";

export const metadata: Metadata = {
  title: "Aktiviteter – Mangfoldshuset Vestland",
  description: "Kommende og tidligere aktiviteter i Mangfoldshuset Vestland.",
};

type MappedActivity = ReturnType<typeof mapActivities>[number];

export default async function AktiviteterPage() {
  let upcoming: MappedActivity[] = [];
  let past: MappedActivity[] = [];
  const yearById = new Map<string, string>();
  const programs = await fetchPrograms();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: upcomingData }, { data: pastData }] = await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .or(`end_date.gte.${today},and(end_date.is.null,event_date.gte.${today})`)
        .order("event_date", { ascending: true }),
      supabase
        .from("activities")
        .select("*")
        .or(`end_date.lt.${today},and(end_date.is.null,event_date.lt.${today})`)
        .order("event_date", { ascending: false }),
    ]);

    upcoming = mapActivities(upcomingData ?? []);
    past = mapActivities(pastData ?? []);
    // Året en aktivitet hører til: sluttdato hvis den finnes, ellers startdato.
    for (const a of pastData ?? []) {
      yearById.set(a.id as string, String((a.end_date as string | null) ?? a.event_date).slice(0, 4));
    }
  }

  // Fremhevede først, så enkeltarrangementer, så faste tilbud (hver uke/måned).
  const merged = sortUpcoming([...upcoming, ...occurrenceCards(programs, 1)]);

  // Tidligere aktiviteter gruppert per år, nyeste år først.
  const pastGroups = Object.entries(
    past.reduce<Record<string, MappedActivity[]>>((acc, a) => {
      const year = yearById.get(a.id) ?? String(a.iso).slice(0, 4);
      (acc[year] ??= []).push(a);
      return acc;
    }, {})
  )
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year, items }));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
          Kalender
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium">Aktiviteter</h1>

        <FasteTilbud programs={programs} />

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">
            Kommende aktiviteter
          </h2>
          <ActivityGrid
            items={merged}
            emptyText="Ingen kommende aktiviteter er lagt til ennå."
          />
        </section>

        <section className="mt-16 border-t border-line pt-12">
          <h2 className="font-serif text-2xl font-medium">
            Tidligere aktiviteter
          </h2>
          {pastGroups.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Ingen tidligere aktiviteter er lagt til ennå.
            </p>
          ) : (
            pastGroups.map((g, i) => (
              <details
                key={g.year}
                open={i === 0}
                className="group mt-6 rounded-[18px] border border-line bg-white px-5 pb-6 pt-2"
              >
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-2 [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-xl font-medium">{g.year}</span>
                  <span className="flex items-center gap-2 text-sm text-ink-soft">
                    {g.items.length} {g.items.length === 1 ? "aktivitet" : "aktiviteter"}
                    <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </span>
                </summary>
                <ActivityGrid items={g.items} emptyText="" />
              </details>
            ))
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function mapActivities(
  data: {
    id: string;
    title: string;
    categories: string[] | null;
    event_date: string;
    end_date?: string | null;
    place: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    external_link: string | null;
    responsible_name?: string | null;
    responsible_phone?: string | null;
    responsible_email?: string | null;
    featured?: boolean | null;
  }[]
) {
  return data.map((a) => ({
    id: a.id,
    iso: a.event_date,
    href: `/aktiviteter/${a.id}`,
    title: a.title,
    categories: a.categories ?? [],
    date: shortDateRange(a),
    place: a.place,
    desc: a.description,
    imageUrl: a.image_url,
    videoUrl: a.video_url,
    externalLink: a.external_link,
    responsibleName: a.responsible_name,
    responsiblePhone: a.responsible_phone,
    responsibleEmail: a.responsible_email,
    featured: !!a.featured,
    recurring: false,
  }));
}
