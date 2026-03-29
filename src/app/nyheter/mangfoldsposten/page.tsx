import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mangfoldsposten – Mangfoldhuset Vestland",
  description: "Mangfoldshusets felles magasin – les siste utgave og eldre utgaver.",
};

type Issue = {
  id: string;
  title: string;
  issue_date: string;
  cover_image_url: string | null;
  pdf_url: string;
};

export default async function MangfoldspostenPage() {
  let issues: Issue[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("magazine_issues")
      .select("*")
      .order("issue_date", { ascending: false });
    issues = (data ?? []) as Issue[];
  }

  const [latest, ...older] = issues;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Mangfoldsposten</h1>
        <p className="mt-3 max-w-xl text-base text-ink-soft">
          Mangfoldshusets felles magasin, med nyheter og historier fra hele
          nettverket.
        </p>

        {latest ? (
          <>
            <section className="mt-10 grid grid-cols-1 items-center gap-8 rounded-[18px] border border-line bg-white p-6 md:grid-cols-[240px_1fr]">
              {latest.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={latest.cover_image_url}
                  alt={latest.title}
                  className="w-full rounded-xl object-cover"
                />
              ) : (
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#C08A5C] to-[#9C3B44]" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-fig">
                  Siste utgave
                </p>
                <h2 className="mt-2 font-serif text-2xl">{latest.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {new Date(latest.issue_date).toLocaleDateString("nb-NO", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={latest.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
                  >
                    Les på nett
                  </a>
                  <a
                    href={latest.pdf_url}
                    download
                    className="rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
                  >
                    Last ned PDF
                  </a>
                </div>
              </div>
            </section>

            {older.length > 0 && (
              <section className="mt-14">
                <h2 className="font-serif text-2xl">Tidligere utgaver</h2>
                <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                  {older.map((i) => (
                    <a
                      key={i.id}
                      href={i.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      {i.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={i.cover_image_url}
                          alt={i.title}
                          className="aspect-[3/4] w-full rounded-xl border border-line object-cover transition-transform group-hover:-translate-y-1"
                        />
                      ) : (
                        <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#6E8B67] to-[#3F5A3E]" />
                      )}
                      <p className="mt-2 text-sm font-semibold text-ink">{i.title}</p>
                      <p className="text-xs text-ink-soft">
                        {new Date(i.issue_date).toLocaleDateString("nb-NO", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="mt-10 text-sm text-ink-soft">
            Ingen utgaver er publisert ennå.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
