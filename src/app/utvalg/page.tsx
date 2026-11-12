import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchUtvalg } from "@/lib/utvalg";

export const metadata: Metadata = {
  title: "Utvalg – Mangfoldshuset Vestland",
  description:
    "Undergrupper i Mangfoldshuset Vestland, som Kvinneutvalget og Mangfoldhuset Ungdom.",
};

const grads = [
  "from-[#C08A5C] to-[#9C3B44]",
  "from-[#9CA86B] to-green",
  "from-green to-green-dark",
];

export default async function UtvalgOversiktPage() {
  const utvalg = await fetchUtvalg();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Våre utvalg</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
          Utvalgene er undergrupper i Mangfoldshuset Vestland som driver egne
          aktiviteter innenfor foreningens rammer.
        </p>

        {utvalg.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {utvalg.map((u, i) => (
              <Link
                key={u.id}
                href={`/utvalg/${u.slug}`}
                className="group overflow-hidden rounded-xl border border-line bg-white transition-all hover:shadow-lg"
              >
                <div className={`h-2 bg-gradient-to-r ${grads[i % grads.length]}`} />
                <div className="p-6">
                  <h2 className="font-serif text-xl">{u.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {u.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-green-dark">
                    Les mer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-ink-soft">
            Ingen utvalg er lagt til ennå.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
