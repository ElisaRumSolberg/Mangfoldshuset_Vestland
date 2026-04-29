import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Medlemsvilkår – Mangfoldhuset Vestland",
  description: "Vilkår for medlemskap i Mangfoldhuset Vestland.",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Hvem kan bli medlem",
    body: (
      <p>
        Medlemskap i Mangfoldhuset Vestland er åpent for alle, uavhengig av
        alder, bakgrunn, tro eller bosted. Medlemmer under 18 år registreres
        med foresatt.
      </p>
    ),
  },
  {
    title: "2. Medlemskontingent",
    body: (
      <p>
        Kontingenten er 100 kr per år for enkeltmedlemskap og 150 kr per år
        for familiemedlemskap (inntil 6 personer på samme adresse).
        Kontingenten betales med Vipps til{" "}
        <span className="font-semibold text-ink">#595791</span> eller til
        bankkonto <span className="font-semibold text-ink">3207 31 01688</span>.
        Medlemskapet aktiveres når kontingenten er registrert mottatt.
      </p>
    ),
  },
  {
    title: "3. Varighet og fornyelse",
    body: (
      <p>
        Medlemskapet gjelder i ett år fra betalingsdato. Vi sender en
        påminnelse i god tid før utløp. Medlemskapet fornyes ved ny
        innbetaling av kontingent og fornyes ikke automatisk.
      </p>
    ),
  },
  {
    title: "4. Medlemmenes rettigheter",
    body: (
      <p>
        Medlemmer kan delta på foreningens aktiviteter, har møte- og
        stemmerett på årsmøtet, og kan foreslå og engasjere seg i aktiviteter,
        kurs og prosjekter i regi av foreningen.
      </p>
    ),
  },
  {
    title: "5. Utmelding og opphør",
    body: (
      <p>
        Medlemskapet opphører automatisk ved manglende fornyelse, eller ved
        skriftlig utmelding til{" "}
        <a className="underline" href="mailto:ali.mangfoldhuset@gmail.com">
          ali.mangfoldhuset@gmail.com
        </a>
        . Innbetalt kontingent refunderes ikke ved utmelding i løpet av
        medlemsåret.
      </p>
    ),
  },
  {
    title: "6. Personopplysninger",
    body: (
      <p>
        Opplysningene du oppgir ved innmelding lagres i medlemsregisteret og
        behandles i tråd med vår{" "}
        <Link className="underline" href="/personvern">
          personvernerklæring
        </Link>
        .
      </p>
    ),
  },
  {
    title: "7. Endringer i vilkårene",
    body: (
      <p>
        Styret kan endre disse vilkårene. Endringer kunngjøres på nettsiden og
        gjelder fra kunngjøringstidspunktet, med mindre annet er bestemt.
      </p>
    ),
  },
];

export default function MedlemsvilkarPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-8 rounded-xl border border-fig/30 bg-[#F7E9E9] px-5 py-4 text-sm text-fig">
          Utkast – ikke godkjent av styret ennå. Innholdet må gjennomgås og
          justeres før det er endelig.
        </div>

        <h1 className="font-serif text-4xl font-medium">Medlemsvilkår</h1>
        <p className="mt-3 text-sm text-ink-soft">Sist oppdatert: september 2026</p>

        <div className="mt-10 flex flex-col gap-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-2xl font-medium">{s.title}</h2>
              <div className="mt-3 text-base leading-relaxed text-ink-soft">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
