import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityGrid from "@/components/ActivityGrid";
import OrganicPanel from "@/components/OrganicPanel";
import PhotoSlideshow from "@/components/PhotoSlideshow";
import ActivityShowcase, { type ShowcaseSlide } from "@/components/ActivityShowcase";
import { customColors, toUtvalg } from "@/lib/utvalg";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { shortDateRange } from "@/lib/activity-date";

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
  if (!u) return { title: "Utvalg – Mangfoldshuset Vestland" };
  return {
    title: `${u.title} – Mangfoldshuset Vestland`,
    description: u.description.slice(0, 160),
  };
}

function hexToRgba(hex: string, alpha: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

export default async function UtvalgPage({ params }: Props) {
  const { slug } = await params;
  const u = await getUtvalg(slug);
  if (!u) notFound();

  let upcoming: ReturnType<typeof mapActivities> = [];
  let done: ReturnType<typeof mapActivities> = [];
  let totalActivities = 0;
  let totalParticipants = 0;
  // Bildeserie øverst: bilder fra utvalgets aktiviteter, med tittel og "Mer"-knapp (som på forsiden).
  let heroSlides: ShowcaseSlide[] = [];
  // «Fra aktivitetene» (oppsummeringer) og «Det deltakerne sier» (tilbakemeldinger),
  // hentet automatisk fra aktivitetene som hører til utvalget.
  let summaries: { id: string; title: string; date: string; participants: number | null; text: string }[] = [];
  let quotes: { text: string; id: string; title: string }[] = [];
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
        .or(`end_date.gte.${today},and(end_date.is.null,event_date.gte.${today})`)
        .order("event_date", { ascending: true }),
      supabase
        .from("activities")
        .select("*")
        .or(`end_date.lt.${today},and(end_date.is.null,event_date.lt.${today})`)
        .order("event_date", { ascending: false }),
    ]);
    const upcomingMatched = (upcomingData ?? []).filter(matches);
    const doneMatched = (doneData ?? []).filter(matches);
    totalActivities = upcomingMatched.length + doneMatched.length;
    totalParticipants = [...upcomingMatched, ...doneMatched].reduce(
      (sum, a) => sum + ((a.participants as number | null) ?? 0),
      0
    );
    const newestFirst = [...upcomingMatched, ...doneMatched].sort((x, y) =>
      String(y.event_date).localeCompare(String(x.event_date))
    );
    for (const a of newestFirst) {
      const chosen = ((a.homepage_image_urls as string[] | null) ?? []).filter(Boolean);
      const photos = ((a.photos as string[] | null) ?? []).filter(Boolean);
      const images = chosen.length ? chosen : photos.length ? photos.slice(0, 2) : [a.image_url].filter(Boolean);
      for (const image of images as string[]) {
        heroSlides.push({
          title: a.title as string,
          image,
          href: `/aktiviteter/${a.id}`,
          // Plakater (afiser) vises i sin helhet, ekte foto fyller ruten.
          isPoster: image === a.image_url,
        });
      }
    }
    heroSlides = heroSlides.slice(0, 10);
    upcoming = mapActivities(upcomingMatched);
    done = mapActivities(doneMatched).slice(0, 6);

    summaries = doneMatched
      .filter((a) => String(a.summary ?? "").trim())
      .slice(0, 4)
      .map((a) => ({
        id: a.id as string,
        title: a.title as string,
        date: shortDateRange(a),
        participants: (a.participants as number | null) ?? null,
        text: String(a.summary).trim(),
      }));
    quotes = doneMatched
      .flatMap((a) =>
        String(a.feedback ?? "")
          .split("\n")
          .map((q) => q.trim())
          .filter(Boolean)
          .map((text) => ({ text, id: a.id as string, title: a.title as string }))
      )
      .slice(0, 6);
  }

  // Egen fargeprofil (satt av admin), ellers stabilt valg ut fra navnet slik at
  // samme utvalg alltid får samme standardfarge.
    const custom = customColors(u);
  const nameSum = [...u.title].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const panelVariant = nameSum % 2 === 0 ? "green" : "fig";

  // Bakgrunnene under "Om oss" (cream-2) skal alternere. Kommende/Tidligere
  // vises alltid (som på /aktiviteter), bilder bare når det finnes noen.
  const visible = [true, summaries.length > 0, quotes.length > 0, true];
  const [upcomingBg, summaryBg, quoteBg, doneBg] = visible.reduce<{
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
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-[1fr_1fr] md:py-16">
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
                    className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                      custom ? "hover:brightness-95" : "bg-fig text-white hover:bg-fig-dark"
                    }`}
                    style={
                      custom
                        ? { backgroundColor: custom.accent, color: custom.from }
                        : undefined
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1Z" />
                    </svg>
                    Følg oss på Facebook
                  </a>
                )}
                {u.instagram_link && (
                  <a
                    href={u.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
                    </svg>
                    Følg oss på Instagram
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
            {u.cover_images.length ? (
              <PhotoSlideshow
                images={u.cover_images}
                className="h-80 rounded-3xl border border-white/10 md:h-[440px]"
              />
            ) : heroSlides.length ? (
              <ActivityShowcase
                slides={heroSlides}
                className="h-80 rounded-3xl border border-white/10 md:h-[440px]"
              />
            ) : (
              <OrganicPanel
                variant={panelVariant}
                colors={custom ? { from: custom.accent, to: custom.from } : undefined}
                className="h-80 md:h-[440px]"
              />
            )}
          </div>
        </section>

        {/* Om oss: kort, i samme stil som forsidens Om oss-utsnitt */}
        <section className="bg-cream-2 py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[0.85fr_1.15fr]">
            <dl className="order-2 grid grid-cols-2 gap-4 rounded-[20px] border border-line bg-white p-6 md:order-1">
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-green-dark">Aktiviteter</dt>
                <dd className="mt-1 font-serif text-3xl font-medium text-ink">{totalActivities}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-green-dark">Deltakere</dt>
                <dd className="mt-1 font-serif text-3xl font-medium text-ink">
                  {totalParticipants > 0 ? `${totalParticipants.toLocaleString("nb-NO")}+` : "–"}
                </dd>
              </div>
              {u.contact && (
                <div className="col-span-2 border-t border-line pt-4">
                  <dt className="text-xs font-bold uppercase tracking-widest text-green-dark">Kontakt</dt>
                  <dd className="mt-1 text-sm">
                    <a className="break-all font-semibold text-ink underline underline-offset-4" href={`mailto:${u.contact}`}>
                      {u.contact}
                    </a>
                  </dd>
                </div>
              )}
              <div className="col-span-2">
                <Link
                  href="/bli-med#frivillig"
                  className="inline-flex min-h-11 items-center rounded-full bg-fig px-6 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
                >
                  Bli med i utvalget
                </Link>
              </div>
            </dl>
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
              <ActivityGrid items={upcoming} emptyText="" />
            ) : (
              <div className="mt-6 rounded-[18px] border border-line bg-white p-8">
                <p className="font-serif text-xl text-ink">Ingen kommende aktiviteter akkurat nå</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                  Nye aktiviteter legges ut her så snart de er klare. Bli medlem i Mangfoldshuset Vestland, så hører du fra oss først.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/bli-med#medlem"
                    className="inline-flex min-h-11 items-center rounded-full bg-fig px-6 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
                  >
                    Bli medlem
                  </Link>
                  <Link
                    href="/bli-med#frivillig"
                    className="inline-flex min-h-11 items-center rounded-full border border-ink px-6 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
                  >
                    Bli med i utvalget
                  </Link>
                  {u.external_link && (
                    <a
                      href={u.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border border-ink px-6 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
                    >
                      Følg oss på Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {summaries.length > 0 && (
          <section className={`px-6 py-16 ${summaryBg}`}>
            <div className="mx-auto max-w-6xl">
              <h2 className="font-serif text-2xl font-medium">Fra aktivitetene</h2>
              <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {summaries.map((x) => (
                  <li key={x.id} className="rounded-[18px] border border-line bg-white p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
                      {x.date}
                      {x.participants ? ` · ${x.participants} deltakere` : ""}
                    </p>
                    <h3 className="mt-2 font-serif text-lg">
                      <Link href={`/aktiviteter/${x.id}`} className="hover:text-fig">
                        {x.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                      {x.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {quotes.length > 0 && (
          <section className={`px-6 py-16 ${quoteBg}`}>
            <div className="mx-auto max-w-6xl">
              <h2 className="font-serif text-2xl font-medium">Det deltakerne sier</h2>
              <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quotes.map((q, i) => (
                  <li key={i} className="flex flex-col justify-between rounded-[18px] border border-line bg-white p-6">
                    <p className="font-serif text-base italic leading-relaxed text-ink">«{q.text}»</p>
                    <Link
                      href={`/aktiviteter/${q.id}`}
                      className="mt-4 inline-block text-xs font-semibold text-green-dark hover:underline"
                    >
                      Etter «{q.title}»
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className={`px-6 py-16 ${doneBg}`}>
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-2xl font-medium">
              Tidligere aktiviteter
            </h2>
            <ActivityGrid
              items={done}
              emptyText="Ingen tidligere aktiviteter er lagt til ennå."
            />
          </div>
        </section>

        <section className="px-6 py-16 bg-cream-2">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-2xl font-medium">Slik blir du med</h2>
            <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <li className="rounded-[18px] border border-line bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fig font-serif text-lg text-white">1</span>
                <h3 className="mt-4 font-serif text-lg">Bli medlem</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Fyll ut medlemsskjemaet. Medlemskap koster 100 kr for enkeltperson og 150 kr for familie per år.
                </p>
                <Link
                  href="/bli-med#medlem"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-fig hover:underline"
                >
                  Bli medlem →
                </Link>
              </li>
              <li className="rounded-[18px] border border-line bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fig font-serif text-lg text-white">2</span>
                <h3 className="mt-4 font-serif text-lg">Betal kontingenten</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Betal med Vipps til #595791 eller til bankkonto 3207 31 01688, så aktiverer vi medlemskapet ditt.
                </p>
              </li>
              <li className="rounded-[18px] border border-line bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fig font-serif text-lg text-white">3</span>
                <h3 className="mt-4 font-serif text-lg">Bli med i utvalget</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Meld deg som frivillig, eller kom på en av aktivitetene våre og møt oss.
                </p>
                <Link
                  href="/bli-med#frivillig"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-fig hover:underline"
                >
                  Bli frivillig →
                </Link>
              </li>
            </ol>
          </div>
        </section>

        {(u.external_link || u.instagram_link) && (
          <section className="px-6 pb-16">
            <div
              className={`mx-auto flex max-w-6xl flex-col items-center gap-5 rounded-[20px] px-8 py-10 text-center text-white ${custom ? "" : "bg-gradient-to-br from-[#5F7A56] to-[#4D6245]"}`}
              style={custom ? { backgroundImage: `linear-gradient(135deg, ${custom.from}, ${custom.to})` } : undefined}
            >
              <h2 className="font-serif text-2xl font-medium">Følg {u.title}</h2>
              <p className="max-w-md text-sm leading-relaxed text-white/95">
                Nyheter, bilder og invitasjoner til neste aktivitet legger vi ut i sosiale medier. Vil du høre fra oss først, bli medlem.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {u.external_link && (
                  <a
                    href={u.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5"
                  >
                    Facebook
                  </a>
                )}
                {u.instagram_link && (
                  <a
                    href={u.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-white/70 px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    Instagram
                  </a>
                )}
                <Link
                  href="/bli-med#medlem"
                  className="inline-flex min-h-11 items-center rounded-full bg-fig px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
                >
                  Bli medlem
                </Link>
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
    end_date?: string | null;
    place: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    external_link: string | null;
    responsible_name: string | null;
    responsible_phone: string | null;
    responsible_email: string | null;
    featured: boolean | null;
  }[]
) {
  return data.map((a) => ({
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
  }));
}
