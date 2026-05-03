import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportSection from "@/components/ReportSection";
import { todayOslo } from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

async function getActivity(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await getActivity(id);
  if (!a) return { title: "Aktivitet – Mangfoldhuset Vestland" };
  return {
    title: `${a.title} – Mangfoldhuset Vestland`,
    description: String(a.description ?? "").slice(0, 160),
  };
}

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ActivityPage({ params }: Props) {
  const { id } = await params;
  const a = await getActivity(id);
  if (!a) notFound();

  const isPast = a.event_date < todayOslo();
  const photos: string[] = a.photos ?? [];

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <Link href="/aktiviteter" className="text-sm font-semibold text-green-dark">
          ← Alle aktiviteter
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {a.featured && (
            <span className="rounded-full bg-fig px-2.5 py-1 text-xs font-bold text-white">
              ★ Fremhevet
            </span>
          )}
          {(a.categories ?? []).map((c: string) => (
            <span
              key={c}
              className="rounded-full bg-[#F7E9E9] px-2.5 py-1 text-xs font-bold text-fig"
            >
              {c}
            </span>
          ))}
          {isPast && (
            <span className="rounded-full bg-cream-2 px-2.5 py-1 text-xs font-bold text-ink-soft">
              Gjennomført
            </span>
          )}
        </div>

        <h1 className="mt-3 font-serif text-4xl font-medium">{a.title}</h1>
        <p className="mt-3 text-base capitalize text-ink-soft">{longDate(a.event_date)}</p>
        <p className="text-base text-ink-soft">{a.place}</p>

        {(a.video_url || a.image_url) && (
          <div className="mt-8 overflow-hidden rounded-[18px] border border-line">
            {a.video_url ? (
              <video src={a.video_url} controls className="w-full bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.image_url} alt={a.title} className="max-h-[520px] w-full object-cover" />
            )}
          </div>
        )}

        <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-ink-soft">
          {a.description}
        </p>

        {a.external_link && (
          <a
            href={a.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
          >
            Se innlegget →
          </a>
        )}

        {(a.responsible_name || a.responsible_phone || a.responsible_email) && (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
            <span>Ansvarlig{a.responsible_name ? `: ${a.responsible_name}` : ""}</span>
            {a.responsible_phone && (
              <a href={`tel:${a.responsible_phone.replace(/\s/g, "")}`} className="font-semibold text-green-dark">
                {a.responsible_phone}
              </a>
            )}
            {a.responsible_email && (
              <a href={`mailto:${a.responsible_email}`} className="font-semibold text-green-dark">
                {a.responsible_email}
              </a>
            )}
          </div>
        )}

        <ReportSection
          heading="Slik gikk det"
          participants={a.participants ?? null}
          participantsLabel="deltakere"
          summary={a.summary ?? null}
          feedback={a.feedback ?? null}
          photos={photos}
          title={a.title}
        />
      </main>
      <Footer />
    </>
  );
}
