import SubmissionForm from "@/components/SubmissionForm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportSection from "@/components/ReportSection";
import ActivityMedia, { type MediaImage } from "@/components/ActivityMedia";
import HoneypotFields from "@/components/HoneypotFields";
import { todayOslo } from "@/lib/recurring";
import { isActivityPast, longDateRange } from "@/lib/activity-date";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { signUpForActivity } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ meldt?: string; feil?: string }>;
};

async function getActivity(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await getActivity(id);
  if (!a) return { title: "Aktivitet – Mangfoldshuset Vestland" };
  return {
    title: `${a.title} – Mangfoldshuset Vestland`,
    description: String(a.description ?? "").slice(0, 160),
  };
}

export default async function ActivityPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { meldt, feil } = await searchParams;
  const a = await getActivity(id);
  if (!a) notFound();

  const isPast = isActivityPast(a, todayOslo());
  const photos: string[] = a.photos ?? [];
  const galleryImages: MediaImage[] = photos.map((src) => ({ src, contain: false }));
  if (a.image_url && !photos.includes(a.image_url)) {
    galleryImages.unshift({ src: a.image_url, contain: true });
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <Link href="/aktiviteter" className="text-sm font-semibold text-green-dark">
          ← Alle aktiviteter
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
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
            <p className="mt-3 text-base capitalize text-ink-soft">{longDateRange(a)}</p>
            <p className="text-base text-ink-soft">{a.place}</p>

            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink-soft">
              {a.description}
            </p>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-line bg-cream-2">
            {a.video_url ? (
              <video src={a.video_url} controls className="aspect-[4/3] w-full bg-black" />
            ) : (
              <ActivityMedia images={galleryImages} title={a.title} className="aspect-[3/4] w-full" />
            )}
          </div>
        </div>

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

        {a.registration_open && !isPast && (
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
                action={signUpForActivity.bind(null, a.id)}
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <HoneypotFields />
                {feil === "1" && (
                  <p className="rounded-lg bg-[#F7E9E9] px-4 py-2.5 text-sm font-semibold text-fig sm:col-span-2">
                    Sjekk at navn og e-post er fylt ut riktig, og prøv igjen.
                  </p>
                )}
                <input
                  name="name"
                  required
                  placeholder="Navn"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="E-post"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <input
                  name="phone"
                  placeholder="Telefon (valgfritt)"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <input
                  type="number"
                  name="participants"
                  min={1}
                  defaultValue={1}
                  placeholder="Antall deltakere"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig"
                />
                <textarea
                  name="comment"
                  rows={2}
                  placeholder="Kommentar (valgfritt)"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig sm:col-span-2"
                />
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

        <ReportSection
          heading="Slik gikk det"
          participants={a.participants ?? null}
          participantsLabel="deltakere"
          summary={a.summary ?? null}
          feedback={a.feedback ?? null}
          photos={[]}
          title={a.title}
        />
      </main>
      <Footer />
    </>
  );
}
