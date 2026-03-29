import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aktiviteter – Mangfoldhuset Vestland",
  description: "Kommende og tidligere aktiviteter i Mangfoldhuset Vestland.",
};

const grads = [
  "from-[#6E8B67] to-[#3F5A3E]",
  "from-[#C08A5C] to-[#9C3B44]",
  "from-[#9CA86B] to-[#4B6B4A]",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type MappedActivity = ReturnType<typeof mapActivities>[number];

export default async function AktiviteterPage() {
  let upcoming: MappedActivity[] = [];
  let past: MappedActivity[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: upcomingData }, { data: pastData }] = await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true }),
      supabase
        .from("activities")
        .select("*")
        .lt("event_date", today)
        .order("event_date", { ascending: false }),
    ]);

    upcoming = mapActivities(upcomingData ?? []);
    past = mapActivities(pastData ?? []);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
          Kalender
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium">Aktiviteter</h1>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">
            Kommende aktiviteter
          </h2>
          {upcoming.length ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {upcoming.map((ev, i) => (
                <ActivityCard
                  key={ev.title + ev.date}
                  {...ev}
                  grad={grads[i % grads.length]}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              Ingen kommende aktiviteter er lagt til ennå.
            </p>
          )}
        </section>

        <section className="mt-16 border-t border-line pt-12">
          <h2 className="font-serif text-2xl font-medium">
            Tidligere aktiviteter
          </h2>
          {past.length ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {past.map((ev, i) => (
                <ActivityCard
                  key={ev.title + ev.date}
                  {...ev}
                  grad={grads[i % grads.length]}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              Ingen tidligere aktiviteter er lagt til ennå.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function mapActivities(
  data: {
    title: string;
    category: string;
    event_date: string;
    place: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    external_link: string | null;
  }[]
) {
  return data.map((a) => ({
    title: a.title,
    category: a.category,
    date: formatDate(a.event_date),
    place: a.place,
    desc: a.description,
    imageUrl: a.image_url,
    videoUrl: a.video_url,
    externalLink: a.external_link,
  }));
}
