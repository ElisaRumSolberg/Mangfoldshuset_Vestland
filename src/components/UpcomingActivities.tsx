import Link from "next/link";

const events = [
  {
    title: "Kulturkveld i Bergen",
    category: "Kultur",
    date: "4. okt",
    place: "Møtestedet, Bergen",
    desc: "En kveld med mat, musikk og møter på tvers av kulturer.",
    grad: "from-[#6E8B67] to-[#3F5A3E]",
  },
  {
    title: "Språkkafé",
    category: "Språk",
    date: "11. okt",
    place: "Bibliotek, Bergen",
    desc: "Praktisér norsk i en avslappet og hyggelig atmosfære.",
    grad: "from-[#C08A5C] to-[#9C3B44]",
  },
  {
    title: "Familiedag i parken",
    category: "Barn & familie",
    date: "18. okt",
    place: "Nygårdsparken",
    desc: "Aktiviteter og lek for hele familien, uansett bakgrunn.",
    grad: "from-[#9CA86B] to-[#4B6B4A]",
  },
];

export default function UpcomingActivities() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Kalender
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium">
            Kommende aktiviteter
          </h2>
        </div>
        <Link
          href="/aktiviteter"
          className="rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-cream"
        >
          Se alle aktiviteter
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {events.map((ev) => (
          <article
            key={ev.title}
            className="overflow-hidden rounded-[18px] border border-line bg-white transition-all hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div
              className={`flex h-[170px] items-center justify-center bg-gradient-to-br ${ev.grad}`}
            >
              <span className="text-sm font-semibold text-white/85">
                [foto: {ev.title}]
              </span>
            </div>
            <div className="p-5">
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="rounded-full bg-[#F7E9E9] px-2.5 py-1 text-xs font-bold text-fig">
                  {ev.category}
                </span>
                <span className="text-sm text-ink-soft">{ev.date}</span>
              </div>
              <h3 className="font-serif text-lg">{ev.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{ev.place}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                {ev.desc}
              </p>
              <Link
                href="/aktiviteter"
                className="mt-3.5 inline-block text-sm font-semibold text-green-dark"
              >
                Les mer →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
