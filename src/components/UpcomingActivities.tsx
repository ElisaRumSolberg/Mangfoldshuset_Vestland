import Link from "next/link";
import ActivityCard from "./ActivityCard";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

const grads = [
  "from-[#6E8B67] to-[#3F5A3E]",
  "from-[#C08A5C] to-[#9C3B44]",
  "from-[#9CA86B] to-[#4B6B4A]",
];

const fallback = [
  {
    title: "Kulturkveld i Bergen",
    category: "Kultur",
    date: "4. okt",
    place: "Møtestedet, Bergen",
    desc: "En kveld med mat, musikk og møter på tvers av kulturer.",
    imageUrl: null as string | null,
    videoUrl: null as string | null,
    externalLink: null as string | null,
  },
  {
    title: "Språkkafé",
    category: "Språk",
    date: "11. okt",
    place: "Bibliotek, Bergen",
    desc: "Praktisér norsk i en avslappet og hyggelig atmosfære.",
    imageUrl: null as string | null,
    videoUrl: null as string | null,
    externalLink: null as string | null,
  },
  {
    title: "Familiedag i parken",
    category: "Barn & familie",
    date: "18. okt",
    place: "Nygårdsparken",
    desc: "Aktiviteter og lek for hele familien, uansett bakgrunn.",
    imageUrl: null as string | null,
    videoUrl: null as string | null,
    externalLink: null as string | null,
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

export default async function UpcomingActivities() {
  let events = fallback;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activities")
      .select("*")
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date", { ascending: true })
      .limit(3);

    if (data?.length) {
      events = data.map((a) => ({
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
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Kalender
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium">
            Kommende aktiviteter
          </h2>
        </div>
        <Link
          href="/aktiviteter"
          className="rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-cream"
        >
          Se alle aktiviteter
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {events.map((ev, i) => (
          <ActivityCard key={ev.title} {...ev} grad={grads[i % grads.length]} />
        ))}
      </div>
    </section>
  );
}
