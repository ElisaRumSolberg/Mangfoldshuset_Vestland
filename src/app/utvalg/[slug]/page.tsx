import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import PhotoGallery from "@/components/PhotoGallery";
import OrganicPanel from "@/components/OrganicPanel";
import { customColors, toUtvalg } from "@/lib/utvalg";
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

function hexToRgba(hex: string, alpha: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r},${g},${b},${alpha})`;
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

  let upcoming: ReturnType<typeof mapActivities> = [];
  let done: ReturnType<typeof mapActivities> = [];
  if (u.activity_match && isSupabaseConfigured()) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const match = u.activity_match.toLowerCase();
    const matches = (a: { categories: string[] | null }) =>
      (a.categories ?? []).some((c) => c.toLowerCase().includes(match));

    const [{ data: upcomingData }, { data: doneData }] = await Promise.all([
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
    upcoming = mapActivities((upcomingData ?? []).filter(matches));
    done = mapActivities((doneData ?? []).filter(matches)).slice(0, 6);
  }

  // Egen fargeprofil (satt av admin), ellers stabilt valg ut fra navnet slik at
  // samme utvalg alltid får samme standardfarge.
  const custom = customColors(u);
  const nameSum = [...u.title].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const panelVariant = nameSum % 2 === 0 ? "green" : "fig";
  const aboutPanelVariant = panelVariant === "green" ? "fig" : "green";

  // Bakgrunnene under "Om oss" (cream-2) skal alternere. Kommende/Tidligere
  // vises alltid (som på /aktiviteter), bilder bare når det finnes noen.
  const visible = [true, true, u.photos.length > 0];
  const [upcomingBg, doneBg, photosBg] = visible.reduce<{
    count: number;
    out: string[];
  }>(
    (acc, isVisible) => {
      if (!isVisible) return { count: acc.count, out: [...acc.out, ""] };
      const count = acc.count + 1;
      return { count, out: [...acc.out, count % 2 === 0 ? "bg-cream-2" : ""] };
    },
    { count: 0, out: [] }
  ).out;

  return (
    <>
      <Navbar />
      <main>
        {/* En lett utgave av forsidens hero, i samme stil (egen fargeprofil hvis satt) */}
        <section
          className={`relative overflow-hidden ${custom ? "" : "bg-gradient-to-b from-[#586B4F] to-[#48583F]"}`}
          style={custom ? { backgroundImage: `linear-gradient(to bottom, ${custom.from}, ${custom.to})` } : undefined}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: custom
                ? `radial-gradient(circle at 78% 22%, ${hexToRgba(custom.accent, 0.35)}, transparent 45%), radial-gradient(circle at 15% 85%, ${hexToRgba(custom.accent, 0.15)}, transparent 50%)`
                : "radial-gradient(circle at 78% 22%, rgba(156,59,68,0.28), transparent 45%), radial-gradient(circle at 15% 85%, rgba(233,222,199,0.18), transparent 50%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            <div>
              <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#EFE7D6]">
                Utvalg
              </span>
              <h1 className="max-w-xl font-serif text-3xl font-medium leading-[1.1] text-white md:text-4xl">
                {u.title}
              </h1>
              <div className="mt-8 flex flex-wrap gap-4">
                {u.external_link && (
                  <a
                    href={u.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-full px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                      custom ? "hover:brightness-95" : "bg-fig text-white hover:bg-fig-dark"
                    }`}
                    style={
                      custom
                        ? { backgroundColor: custom.accent, color: custom.from }
                        : undefined
                    }
                  >
                    Følg oss på Facebook →
                  </a>
                )}
                <Link
                  href="/bli-med#frivillig"
                  className="rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Bli med i utvalget
                </Link>
                {u.contact && (
                  <a
                    href={`mailto:${u.contact}`}
                    className="rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    {u.contact}
                  </a>
                )}
              </div>
            </div>
            <OrganicPanel
              variant={panelVariant}
              colors={custom ? { from: custom.accent, to: custom.from } : undefined}
              className="h-48 md:h-64"
            />
          </div>
        </section>

        {/* Om oss: kort, i samme stil som forsidens Om oss-utsnitt */}
        <section className="bg-cream-2 py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[0.85fr_1.15fr]">
            <OrganicPanel
              variant={aboutPanelVariant}
              colors={custom ? { from: custom.from, to: custom.to } : undefined}
              className="order-2 h-56 rounded-[20px] md:order-1"
            />
            <div className="order-1 md:order-2">
              <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
                Om oss
              </p>
              <p className="mt-4 max-w-xl whitespace-pre-line text-base leading-relaxed text-ink-soft">
                {u.description}
              </p>
            </div>
          </div>
        </section>

        <section className={`px-6 py-16 ${upcomingBg}`}>
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-2xl font-medium">
              Kommende aktiviteter
            </h2>
            {upcoming.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {upcoming.map((ev) => (
                  <ActivityCard
                    key={ev.iso + ev.title}
                    {...ev}
                    grad="from-[#9CA86B] to-[#4B6B4A]"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">
                Ingen kommende aktiviteter er lagt til ennå.
              </p>
            )}
          </div>
        </section>

        <section className={`px-6 py-16 ${doneBg}`}>
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-2xl font-medium">
              Tidligere aktiviteter
            </h2>
            {done.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {done.map((ev) => (
                  <ActivityCard
                    key={ev.iso + ev.title}
                    {...ev}
                    grad="from-[#C08A5C] to-[#9C3B44]"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">
                Ingen tidligere aktiviteter er lagt til ennå.
              </p>
            )}
          </div>
        </section>

        {u.photos.length > 0 && (
          <section className={`px-6 py-16 ${photosBg}`}>
            <div className="mx-auto max-w-6xl">
              <h2 className="font-serif text-2xl font-medium">Flere bilder</h2>
              <div className="mt-6">
                <PhotoGallery photos={u.photos} title={u.title} />
              </div>
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
    categories: string[] | null;
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
    categories: a.categories ?? [],
    date: formatDate(a.event_date),
    place: a.place,
    desc: a.description,
    imageUrl: a.image_url,
    videoUrl: a.video_url,
    externalLink: a.external_link,
    featured: !!a.featured,
  }));
}
