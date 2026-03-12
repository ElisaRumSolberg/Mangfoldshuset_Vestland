import Link from "next/link";

const news = [
  {
    title: "Nytt vårprogram er klart",
    date: "2. sep 2026",
    grad: "from-[#6E8B67] to-[#3F5A3E]",
  },
  {
    title: "Kulturkveld samlet familier i Bergen",
    date: "24. aug 2026",
    grad: "from-[#C08A5C] to-[#9C3B44]",
  },
  {
    title: "Vi søker frivillige",
    date: "15. aug 2026",
    grad: "from-[#9CA86B] to-[#4B6B4A]",
  },
];

export default function NewsAndMagazine() {
  return (
    <section className="bg-cream-2 py-18">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 py-12 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-2xl">Siste nyheter</h2>
            <Link
              href="/nyheter"
              className="text-sm font-semibold text-green-dark"
            >
              Se alle nyheter →
            </Link>
          </div>
          <div className="flex flex-col">
            {news.map((n) => (
              <Link
                key={n.title}
                href="/nyheter"
                className="flex items-center gap-4.5 border-b border-line py-4.5"
              >
                <div
                  className={`h-16 w-16 flex-shrink-0 rounded-xl bg-gradient-to-br ${n.grad}`}
                />
                <div>
                  <p className="mb-1 text-xs text-ink-soft">{n.date}</p>
                  <p className="font-serif text-base font-semibold">
                    {n.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[20px] bg-ink p-8 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9C2B0]">
              Mangfoldsposten
            </p>
            <h3 className="mt-3 font-serif text-2xl text-white">
              Les siste utgave av Mangfoldshusets felles magasin
            </h3>
          </div>
          <Link
            href="/nyheter/mangfoldsposten"
            className="mt-6 inline-block self-start rounded-full border border-white/50 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
          >
            Les magasinet
          </Link>
        </div>
      </div>
    </section>
  );
}
