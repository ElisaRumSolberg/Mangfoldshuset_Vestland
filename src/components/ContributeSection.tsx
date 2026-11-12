import Link from "next/link";

const choices = [
  {
    title: "Bli frivillig",
    desc: "Bruk tiden, erfaringene eller ferdighetene dine i fellesskapet.",
    cta: "Bli frivillig",
    href: "/bli-med#frivillig",
  },
  {
    title: "Har du en idé?",
    desc: "Har du lyst til å starte en aktivitet, et kurs eller et prosjekt?",
    cta: "Del ideen din",
    href: "/bli-med#ide",
  },
  {
    title: "Samarbeid med oss",
    desc: "Vi ønsker samarbeid med organisasjoner, bedrifter og offentlige aktører.",
    cta: "Kontakt oss",
    href: "/bli-med#samarbeid",
  },
];

export default function ContributeSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-serif text-3xl font-medium">Vil du bidra?</h2>
      <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-line pt-8 md:grid-cols-3">
        {choices.map((c) => (
          <li key={c.title}>
            <h3 className="font-serif text-xl font-medium">{c.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">{c.desc}</p>
            <Link
              href={c.href}
              className="mt-3 inline-flex min-h-11 items-center text-base font-semibold text-fig underline underline-offset-4 hover:text-fig-dark"
            >
              {c.cta}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
