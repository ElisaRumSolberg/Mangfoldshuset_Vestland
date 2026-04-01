import Link from "next/link";
import ActivityCard from "./ActivityCard";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { fetchPrograms, occurrenceCards, sortUpcoming } from "@/lib/recurring";

const grads = [
  "from-[#6E8B67] to-[#3F5A3E]",
  "from-[#C08A5C] to-[#9C3B44]",
  "from-[#9CA86B] to-[#4B6B4A]",
];

type Ev = {
  iso: string;
  title: string;
  categories: string[];
  date: string;
  place: string;
  desc: string;
  imageUrl: string | null;
  videoUrl: string | null;
  externalLink: string | null;
  responsibleName?: string | null;
  responsiblePhone?: string | null;
  responsibleEmail?: string | null;
  banner?: string;
  imageHref?: string | null;
  featured?: boolean;
  recurring?: boolean;
  href?: string;
};

const fallback: Ev[] = [
  {
    iso: "",
    title: "Kulturkveld i Bergen",
    categories: ["Kultur"],
    date: "4. okt",
    place: "Møtestedet, Bergen",
    desc: "En kveld med mat, musikk og møter på tvers av kulturer.",
    imageUrl: null,
    videoUrl: null,
    externalLink: null,
  },
  {
    iso: "",
    title: "Språkkafé",
    categories: ["Språk"],
    date: "11. okt",
    place: "Bibliotek, Bergen",
    desc: "Praktisér norsk i en avslappet og hyggelig atmosfære.",
    imageUrl: null,
    videoUrl: null,
    externalLink: null,
  },
  {
    iso: "",
    title: "Familiedag i parken",
    categories: ["Barn", "Familie"],
    date: "18. okt",
    place: "Nygårdsparken",
    desc: "Aktiviteter og lek for hele familien, uansett bakgrunn.",
    imageUrl: null,
    videoUrl: null,
    externalLink: null,
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

export default async function UpcomingActivities() {
  let events: Ev[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);

    // De 6 nærmeste + alle fremhevede (også de som ligger lenger frem i tid).
    const [{ data: soon }, { data: pinned }] = await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(6),
      supabase
        .from("activities")
        .select("*")
        .gte("event_date", today)
        .eq("featured", true)
        .order("event_date", { ascending: true }),
    ]);
    const rows = [
      ...(pinned ?? []),
      ...(soon ?? []).filter((a) => !(pinned ?? []).some((p) => p.id === a.id)),
    ];

    // Neste dato for hvert faste tilbud blandes inn.
    const programs = await fetchPrograms();
    events = sortUpcoming<Ev>([
      ...rows.map((a) => ({
        iso: a.event_date as string,
        title: a.title as string,
        categories: (a.categories as string[] | null) ?? [],
        date: formatDate(a.event_date),
        place: a.place as string,
        desc: a.description as string,
        imageUrl: a.image_url as string | null,
        videoUrl: a.video_url as string | null,
        externalLink: a.external_link as string | null,
        responsibleName: a.responsible_name as string | null,
        responsiblePhone: a.responsible_phone as string | null,
        responsibleEmail: a.responsible_email as string | null,
        featured: !!a.featured,
        recurring: false,
        href: `/aktiviteter/${a.id}`,
      })),
      ...occurrenceCards(programs, 1),
    ]).slice(0, 6);
  }

  if (!events.length) events = fallback;

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
          <ActivityCard key={ev.title + ev.iso} {...ev} grad={grads[i % grads.length]} />
        ))}
      </div>
    </section>
  );
}
