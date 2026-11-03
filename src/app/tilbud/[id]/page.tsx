import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportSection from "@/components/ReportSection";
import ActivityMedia from "@/components/ActivityMedia";
import SubmissionForm from "@/components/SubmissionForm";
import HoneypotFields from "@/components/HoneypotFields";
import { signUpForProgram } from "./actions";
import { formatHighlightDate, parseHighlights } from "@/lib/highlights";
import {
  isoWeek,
  nextOccurrences,
  parseMenu,
  shortDate,
  timeText,
  todayOslo,
  toProgram,
  whenText,
  type Program,
} from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ meldt?: string }>;
};

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

export default async function ProgramPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { meldt } = await searchParams;
  const p = await getProgram(id);
  if (!p) notFound();

  const today = todayOslo();
  const next = nextOccurrences(p, today, 5);
  const signupDates = p.registration_open ? nextOccurrences(p, today, 8) : [];
  const menu = parseMenu(p.menu);
  const menuRows = nextOccurrences(p, today, 8)
    .map((iso) => ({ iso, week: isoWeek(iso), entry: menu.find((m) => m.week === isoWeek(iso)) }))
    .filter((r): r is { iso: string; week: number; entry: (typeof menu)[number] } => !!r.entry);
  const forMembers = !!p.price && /medlem/i.test(p.price);
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
        {(p.price || p.registration_open) && (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-base">
            {p.price && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-green-dark">Pris</dt>
                <dd className="mt-0.5 text-ink">{p.price}</dd>
              </div>
            )}
            {p.registration_open && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-green-dark">Påmelding</dt>
                <dd className="mt-0.5 text-ink">Påmelding kreves – se skjema nedenfor</dd>
              </div>
            )}
          </dl>
        )}
        {forMembers && (
          <p className="mt-3 text-base text-ink-soft">
            Ikke medlem ennå?{" "}
            <Link href="/bli-med#medlem" className="font-semibold text-green-dark underline">
              Bli medlem her
            </Link>
          </p>
        )}
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

            {menuRows.length > 0 && (
              <div className="mt-8 rounded-2xl border border-line bg-white p-6">
                <h2 className="font-serif text-xl font-medium">Ukens suppe</h2>
                <ul className="mt-3 flex flex-col gap-4">
                  {menuRows.map((r) => (
                    <li key={r.iso} className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      {p.menu_image_url && p.menu_image_week === r.week && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.menu_image_url}
                          alt={`${r.entry.name}, uke ${r.week}`}
                          className="aspect-[3/2] w-full rounded-xl border border-line object-cover sm:w-48"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
                          Uke {r.week} · {shortDate(r.iso)}
                        </p>
                        <p className="mt-0.5 text-lg font-semibold text-ink">{r.entry.name}</p>
                        {r.entry.ingredients && (
                          <p className="text-base text-ink-soft">Inneholder: {r.entry.ingredients}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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

        {p.registration_open && signupDates.length > 0 && (
          <section className="mt-10 rounded-[18px] border border-line bg-cream p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-medium">Meld deg på</h2>
            {meldt === "1" ? (
              <div className="mt-4 rounded-xl bg-[#EAF0E9] px-6 py-8 text-center">
                <p className="font-serif text-xl text-green-dark">Takk!</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Du er nå påmeldt. Vi gleder oss til å se deg!
                </p>
              </div>
            ) : (
              <SubmissionForm
                action={signUpForProgram.bind(null, p.id)}
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <HoneypotFields />
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-ink">Hvilken dag vil du komme?</span>
                  <select
                    name="session_date"
                    required
                    className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm capitalize outline-none focus:border-fig"
                  >
                    {signupDates.map((d) => (
                      <option key={d} value={d}>
                        {shortDate(d)}
                        {time ? ` · ${time}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <input
                  name="name"
                  required
                  aria-label="Navn"
                  placeholder="Navn"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <input
                  type="email"
                  name="email"
                  required
                  aria-label="E-post"
                  placeholder="E-post"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <input
                  name="phone"
                  aria-label="Telefon (valgfritt)"
                  placeholder="Telefon (valgfritt)"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <input
                  type="number"
                  name="participants"
                  min={1}
                  defaultValue={1}
                  aria-label="Antall deltakere"
                  placeholder="Antall deltakere"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <textarea
                  name="comment"
                  rows={2}
                  aria-label="Kommentar (valgfritt)"
                  placeholder="Kommentar (valgfritt)"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig sm:col-span-2"
                />
                <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft sm:col-span-2">
                  <input
                    type="checkbox"
                    name="photo_consent"
                    className="mt-1 h-5 w-5 shrink-0 accent-[#9C3B44]"
                  />
                  <span>
                    <strong className="font-semibold text-ink">Bildesamtykke (valgfritt):</strong> Jeg
                    samtykker til at det kan tas bilder av meg eller barnet mitt under arrangementet,
                    og at bildene kan publiseres på nettsiden og i sosiale medier til Mangfoldshuset
                    Vestland. For barn under 18 år gir foresatt samtykket. Du kan når som helst trekke
                    samtykket tilbake ved å sende e-post til{" "}
                    <a className="underline" href="mailto:post@mangfoldshusetvestland.no">
                      post@mangfoldshusetvestland.no
                    </a>
                    . Krysser du ikke av, publiserer vi ikke bilder av deg.
                  </span>
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
                >
                  Meld meg på
                </button>
              </SubmissionForm>
            )}
          </section>
        )}

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
