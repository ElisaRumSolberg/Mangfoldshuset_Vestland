import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import PhotoGallery from "@/components/PhotoGallery";
import { toUtvalg } from "@/lib/utvalg";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

async function getUtvalg(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("utvalg")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data ? toUtvalg(data) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const u = await getUtvalg(slug);
  if (!u) return { title: "Utvalg – Mangfoldhuset Vestland" };
  return {
    title: `${u.title} – Mangfoldhuset Vestland`,
    description: u.description.slice(0, 160),
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function UtvalgPage({ params }: Props) {
  const { slug } = await params;
  const u = await getUtvalg(slug);
  if (!u) notFound();

  let activities: ReturnType<typeof mapActivities> = [];
  if (u.activity_match && isSupabaseConfigured()) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("activities")
      .select("*")
      .gte("event_date", today)
      .ilike("category", `%${u.activity_match}%`)
      .order("event_date", { ascending: true });
    activities = mapActivities(data ?? []);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
          Utvalg
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium">{u.title}</h1>
        <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-ink-soft">
          {u.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          {u.external_link && (
            <a
              href={u.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
            >
              Følg oss på Facebook →
            </a>
          )}
          <Link
            href="/bli-med#frivillig"
            className="rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
          >
            Bli med i utvalget
          </Link>
          {u.contact && (
            <a
              href={`mailto:${u.contact}`}
              className="rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
            >
              {u.contact}
            </a>
          )}
        </div>

        {activities.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="font-serif text-2xl font-medium">
              Kommende aktiviteter
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {activities.map((ev) => (
                <ActivityCard
                  key={ev.iso + ev.title}
                  {...ev}
                  grad="from-[#9CA86B] to-[#4B6B4A]"
                />
              ))}
            </div>
          </section>
        )}

        {u.photos.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="font-serif text-2xl font-medium">Bilder</h2>
            <div className="mt-6">
              <PhotoGallery photos={u.photos} title={u.title} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function mapActivities(
  data: {
    id: string;
    title: string;
    category: string;
    event_date: string;
    place: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    external_link: string | null;
    featured: boolean | null;
  }[]
) {
  return data.map((a) => ({
    iso: a.event_date,
    href: `/aktiviteter/${a.id}`,
    title: a.title,
    category: a.category,
    date: formatDate(a.event_date),
    place: a.place,
    desc: a.description,
    imageUrl: a.image_url,
    videoUrl: a.video_url,
    externalLink: a.external_link,
    featured: !!a.featured,
  }));
}
