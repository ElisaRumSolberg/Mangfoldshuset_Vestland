import Link from "next/link";

const cards = [
  {
    title: "Bli frivillig",
    desc: "Bruk tiden, erfaringene eller ferdighetene dine i fellesskapet.",
    cta: "Bli frivillig",
    href: "/bli-med#frivillig",
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
    href: "/bli-med#ide",
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
    href: "/bli-med#samarbeid",
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
  const [primary, ...others] = cards;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-11 max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
          Delta
        </p>
        <h2 className="mt-2 font-serif text-3xl font-medium">Vil du bidra?</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
        <div className="flex flex-col justify-center rounded-[18px] border border-[#E3D5B4] bg-[#F1E6CC] p-8 text-ink md:col-span-2 md:row-span-2 md:p-12">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/80">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
                stroke="#9C3B44"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <h3 className="font-serif text-3xl font-medium">{primary.title}</h3>
          <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">
            {primary.desc}
          </p>
          <Link
            href={primary.href}
            className="mt-7 inline-block self-start rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
          >
            {primary.cta}
          </Link>
        </div>

        {others.map((c) => (
          <div
            key={c.title}
            className="rounded-[18px] border border-line bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <h3 className="font-serif text-lg">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.desc}</p>
            <Link
              href={c.href}
              className={`mt-3 inline-block text-sm font-semibold underline-offset-4 hover:underline ${c.ctaColor}`}
            >
              {c.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
