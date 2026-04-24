import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nyheter – Mangfoldhuset Vestland",
  description: "Siste nyheter og meldinger fra Mangfoldhuset Vestland.",
};

const grads = [
  "from-[#6E8B67] to-[#3F5A3E]",
  "from-[#C08A5C] to-[#9C3B44]",
  "from-[#9CA86B] to-[#4B6B4A]",
];

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  image_url: string | null;
  video_url: string | null;
  external_link: string | null;
  published_at: string;
};

export default async function NyheterPage() {
  let news: NewsItem[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false });
    news = (data ?? []) as NewsItem[];
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Nyheter</h1>
        <p className="mt-3 max-w-xl text-base text-ink-soft">
          Siste nyheter og meldinger fra Mangfoldhuset Vestland.
        </p>

        <Link
          href="/mangfoldsposten"
          className="mt-8 flex items-center justify-between gap-4 rounded-[18px] bg-[#F7E9E9] px-6 py-5 transition-opacity hover:opacity-90"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-fig">
              Mangfoldsposten
            </span>
            <span className="mt-1 block font-serif text-lg text-ink">
              Les Mangfoldshusets felles magasin
            </span>
          </span>
          <span className="text-sm font-semibold text-fig">Åpne →</span>
        </Link>

        {news.length ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {news.map((n, i) => (
              <article
                key={n.id}
                className="overflow-hidden rounded-[18px] border border-line bg-white"
              >
                {n.video_url ? (
                  <video src={n.video_url} controls className="aspect-[4/3] w-full bg-black object-cover" />
                ) : n.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.image_url} alt={n.title} className="warm-photo aspect-[4/3] w-full object-cover object-top" />
                ) : (
                  <div className={`aspect-[4/3] bg-gradient-to-br ${grads[i % grads.length]}`} />
                )}
                <div className="p-5">
                  <p className="text-xs text-ink-soft">
                    {new Date(n.published_at).toLocaleDateString("nb-NO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1.5 font-serif text-lg">{n.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{n.summary}</p>
                  {n.external_link && (
                    <a
                      href={n.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 inline-block text-sm font-semibold text-green-dark"
                    >
                      Se innlegget →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-ink-soft">
            Ingen nyheter er publisert ennå.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
