import Link from "next/link";

const cards = [
  {
    title: "Bli frivillig",
    desc: "Bruk tiden, erfaringene eller ferdighetene dine i fellesskapet.",
    cta: "Bli frivillig",
    href: "/bli-med",
    iconBg: "bg-[#EAF0E9]",
    ctaColor: "text-green-dark",
    icon: (
      <path
        d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
        stroke="#4B6B4A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
  {
    title: "Har du en idé?",
    desc: "Har du lyst til å starte en aktivitet, et kurs eller et prosjekt?",
    cta: "Del ideen din",
    href: "/har-du-en-ide",
    iconBg: "bg-[#F7E9E9]",
    ctaColor: "text-fig",
    icon: (
      <path
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2c.5.3.8.9.8 1.5V16h4.4v-.3c0-.6.3-1.2.8-1.5A6 6 0 0 0 12 3Z"
        stroke="#9C3B44"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    title: "Samarbeid med oss",
    desc: "Vi ønsker samarbeid med organisasjoner, bedrifter og offentlige aktører.",
    cta: "Kontakt oss",
    href: "/samarbeid",
    iconBg: "bg-[#EFE7D6]",
    ctaColor: "text-[#7A6A3F]",
    icon: (
      <path
        d="M4 8l8-4 8 4-8 4-8-4Z M4 8v8l8 4 8-4V8"
        stroke="#7A6A3F"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

export default function ContributeSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-11 max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
          Delta
        </p>
        <h2 className="mt-2 font-serif text-3xl font-medium">Vil du bidra?</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-[18px] border border-line bg-white p-8 transition-all hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div
              className={`mb-4.5 flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                {c.icon}
              </svg>
            </div>
            <h3 className="font-serif text-lg">{c.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              {c.desc}
            </p>
            <Link
              href={c.href}
              className={`mt-4 inline-block text-sm font-semibold ${c.ctaColor}`}
            >
              {c.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
