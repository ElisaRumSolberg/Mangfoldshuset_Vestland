import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportSection from "@/components/ReportSection";
import ActivityMedia from "@/components/ActivityMedia";
import { formatHighlightDate, parseHighlights } from "@/lib/highlights";
import {
  nextOccurrences,
  shortDate,
  timeText,
  todayOslo,
  toProgram,
  whenText,
  type Program,
} from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

async function getProgram(id: string): Promise<Program | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("recurring_programs")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  return data ? toProgram(data) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProgram(id);
  if (!p) return { title: "Fast tilbud – Mangfoldshuset Vestland" };
  return {
    title: `${p.title} – Mangfoldshuset Vestland`,
    description: p.description.slice(0, 160),
  };
}

export default async function ProgramPage({ params }: Props) {
  const { id } = await params;
  const p = await getProgram(id);
  if (!p) notFound();

  const today = todayOslo();
  const next = nextOccurrences(p, today, 5);
  const time = timeText(p);
  const skipped = p.skipped_dates.filter((d) => d >= today).sort();
  const startsLater = p.start_date && p.start_date > today;
  const highlights = parseHighlights(p.highlights);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <Link href="/aktiviteter" className="inline-flex min-h-11 items-center -my-3 text-sm font-semibold text-green-dark">
          ← Alle aktiviteter
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {p.featured && (
            <span className="rounded-full bg-fig px-2.5 py-1 text-xs font-bold text-white">
              ★ Fremhevet
            </span>
          )}
          <span className="rounded-full bg-[#F7E9E9] px-2.5 py-1 text-xs font-bold text-fig">
            Fast tilbud
          </span>
        </div>

        <h1 className="mt-3 font-serif text-4xl font-medium">{p.title}</h1>
        <p className="mt-3 text-lg font-semibold text-ink">
          {whenText(p)}
          {time ? ` · ${time}` : ""}
        </p>
        <p className="text-base text-ink-soft">{p.place}</p>
        {p.note && (
          <p className="mt-3 w-fit rounded-full bg-cream-2 px-3 py-1 text-sm font-semibold text-green-dark">
            {p.note}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
          <div>
            {p.description && (
              <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">
                {p.description}
              </p>
            )}

            <div className="mt-8 rounded-2xl border border-line bg-white p-6">
              <h2 className="font-serif text-xl font-medium">
                {startsLater && p.start_date ? `Starter ${shortDate(p.start_date)}` : "Neste datoer"}
              </h2>
              {next.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-1.5 text-base text-ink-soft">
                  {next.map((d) => (
                    <li key={d} className="capitalize">
                      {shortDate(d)}
                      {time ? ` · ${time}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">Ingen kommende datoer.</p>
              )}
              {skipped.length > 0 && (
                <p className="mt-3 text-sm text-fig">Avlyst: {skipped.map(shortDate).join(", ")}</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-green-dark">
              {p.external_link && (
                <a href={p.external_link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center -my-3">
                  Se på Facebook →
                </a>
              )}
            </div>

            {(p.responsible_name || p.responsible_phone || p.contact) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                <span>Ansvarlig{p.responsible_name ? `: ${p.responsible_name}` : ""}</span>
                {p.responsible_phone && (
                  <a href={`tel:${p.responsible_phone.replace(/\s/g, "")}`} className="font-semibold text-green-dark">
                    {p.responsible_phone}
                  </a>
                )}
                {p.contact && (
                  <a href={`mailto:${p.contact}`} className="break-all font-semibold text-green-dark">
                    {p.contact}
                  </a>
                )}
              </div>
            )}
          </div>

          {p.image_url && (
            <a
              href={p.image_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Åpne plakat: ${p.title}`}
              className="self-start"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt={`Plakat: ${p.title}`}
                className="w-full rounded-[18px] border border-line"
              />
            </a>
          )}
        </div>

        {highlights.length > 0 && (
          <section className="mt-14 border-t border-line pt-10">
            <h2 className="font-serif text-2xl font-medium">Høydepunkter</h2>
            <ul className="mt-6 flex flex-col gap-4">
              {highlights.map((h, i) => (
                <li key={i} className="rounded-xl border border-line bg-cream px-5 py-4">
                  {h.date && (
                    <p className="text-xs font-bold uppercase tracking-wide text-green-dark">
                      {formatHighlightDate(h.date)}
                    </p>
                  )}
                  <p className="mt-1 text-base text-ink-soft">{h.text}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ReportSection
          heading="Hittil"
          participants={p.participants}
          participantsLabel="deltakere hittil"
          summary={p.summary}
          feedback={p.feedback}
          photos={[]}
          title={p.title}
        />

        {p.photos.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-medium">Bilder</h2>
            <div className="mt-6 overflow-hidden rounded-[18px] border border-line">
              <ActivityMedia
                images={p.photos}
                title={p.title}
                className="aspect-square w-full sm:aspect-[4/3]"
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
