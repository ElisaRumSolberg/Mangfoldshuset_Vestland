import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Medlemsvilkår – Mangfoldshuset Vestland",
  description: "Vilkår for medlemskap i Mangfoldshuset Vestland.",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Hvem kan bli medlem",
    body: (
      <p>
        Medlemskap i Mangfoldshuset Vestland er åpent for alle, uavhengig av
        alder, bakgrunn, tro eller bosted. Medlemmer under 18 år registreres
        med foresatt.
      </p>
    ),
  },
  {
    title: "2. Medlemskontingent",
    body: (
      <p>
        Kontingenten er per person: 100 kr per år for medlemmer fra og med 16
        år, og 25 kr per år for medlemmer til og med 15 år. Det finnes ingen
        egen familiepris; en familie betaler for hvert medlem. Du melder deg
        inn og betaler for deg selv. Først når din egen betaling er registrert,
        kan du legge til andre personer, for eksempel familiemedlemmer. Hver av
        dem er eget medlem og må betale før vedkommende kan legge til flere.
        Hvert medlem har
        sin egen betaling. Er medlemmet under 18 år, betaler foresatt
        kontingenten for barnet, og barnet er likevel eget medlem med egen
        betaling. Alderen regnes
        ut fra fødselsdatoen din på betalingsdagen (ved automatisk fornyelse:
        1. januar).
        Kontingenten betales med Vipps, enten direkte på nettsiden (når denne
        betalingsmåten er åpnet), eller til{" "}
        <span className="font-semibold text-ink">#595791</span>. Du kan også
        betale til bankkonto{" "}
        <span className="font-semibold text-ink">3207 31 01688</span>. Prisene
        er oppgitt i norske kroner og er den totale prisen; det kommer ingen
        tilleggsgebyrer. Medlemskapet aktiveres når kontingenten er registrert
        mottatt.
      </p>
    ),
  },
  {
    title: "3. Varighet og fornyelse",
    body: (
      <p>
        Medlemskapet gjelder for kalenderåret, fra 1. januar til 31. desember.
        Melder du deg inn i løpet av året, betaler du full kontingent og er
        medlem ut det året. Melder du deg inn fra og med 1. oktober, gjelder
        medlemskapet ut neste kalenderår. Medlemskapet utløper 31. desember og
        fornyes ved ny innbetaling, med mindre du har valgt automatisk
        fornyelse (se punkt 4). Vi sender en påminnelse i god tid før utløp.
      </p>
    ),
  },
  {
    title: "4. Automatisk fornyelse (valgfritt)",
    body: (
      <>
        <p>
          Når du melder deg inn eller fornyer på nett, kan du velge automatisk
          fornyelse. Det er helt frivillig. Da trekkes kontingenten for det
          kommende året den 1. januar hvert år, med betalingsmåten du har
          godkjent. Beløpet er kontingenten som gjelder for medlemmet på det
          tidspunktet. Et barn som har fylt 16 år, betaler altså 100 kr.
        </p>
        <p className="mt-3">
          Vi sender deg en e-post senest 15 dager før hvert trekk, altså innen
          16. desember. E-posten viser beløp, dato og hvordan du sier opp
          avtalen. Du kan si opp avtalen når som helst før trekket, i
          Vipps-appen eller ved å sende e-post til{" "}
          <a className="underline" href="mailto:post@mangfoldshusetvestland.no">
            post@mangfoldshusetvestland.no
          </a>
          . Sier du opp, utløper medlemskapet 31. desember.
        </p>
      </>
    ),
  },
  {
    title: "5. Medlemmenes rettigheter",
    body: (
      <p>
        Medlemmer kan delta på foreningens aktiviteter, har møte- og
        stemmerett på årsmøtet, og kan foreslå og engasjere seg i aktiviteter,
        kurs og prosjekter i regi av foreningen.
      </p>
    ),
  },
  {
    title: "6. Utmelding og opphør",
    body: (
      <p>
        Medlemskapet opphører automatisk ved manglende fornyelse, eller ved
        skriftlig utmelding til{" "}
        <a className="underline" href="mailto:post@mangfoldshusetvestland.no">
          post@mangfoldshusetvestland.no
        </a>
        . Innbetalt kontingent refunderes ikke ved utmelding i løpet av
        medlemsåret, med unntak av når du bruker angreretten (se punkt 8).
      </p>
    ),
  },
  {
    title: "7. Personopplysninger",
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
    title: "8. Angrerett og refusjon",
    body: (
      <>
        <p>
          Når du melder deg inn og betaler på nett, har du som forbruker 14
          dagers angrerett regnet fra dagen du betalte. Du bruker angreretten
          ved å sende en e-post til{" "}
          <a className="underline" href="mailto:post@mangfoldshusetvestland.no">
            post@mangfoldshusetvestland.no
          </a>{" "}
          innen fristen, med navnet ditt og e-postadressen du meldte deg inn
          med.
        </p>
        <p className="mt-3">
          Vi refunderer hele kontingenten til samme betalingsmåte uten ugrunnet
          opphold, og senest 14 dager etter at vi mottok meldingen. Medlemskapet
          opphører da fra det tidspunktet du angret. Etter at angrefristen har
          gått ut refunderes ikke kontingenten, se punkt 6.
        </p>
      </>
    ),
  },
  {
    title: "9. Klager",
    body: (
      <p>
        Er du misfornøyd med medlemskapet, betalingen eller en refusjon, send en
        e-post til{" "}
        <a className="underline" href="mailto:post@mangfoldshusetvestland.no">
          post@mangfoldshusetvestland.no
        </a>{" "}
        eller ring oss på{" "}
        <a className="underline" href="tel:40567853">
          405 67 853
        </a>
        . Vi svarer så raskt vi kan, normalt innen 14 dager. Hvis vi ikke blir
        enige, kan du ta kontakt med{" "}
        <a
          className="underline"
          href="https://www.forbrukerradet.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          Forbrukerrådet
        </a>{" "}
        for veiledning.
      </p>
    ),
  },
  {
    title: "10. Endringer i vilkårene",
    body: (
      <p>
        Styret kan endre disse vilkårene. Endringer kunngjøres på nettsiden og
        gjelder fra kunngjøringstidspunktet, med mindre annet er bestemt.
      </p>
    ),
  },
  {
    title: "11. Hvem vi er",
    body: (
      <p>
        Mangfoldshuset Vestland, organisasjonsnummer 914 732 999, Arne
        Abrahamsens vei 1, Bergen. E-post:{" "}
        <a className="underline" href="mailto:post@mangfoldshusetvestland.no">
          post@mangfoldshusetvestland.no
        </a>
        , telefon 405 67 853.
      </p>
    ),
  },
];

export default function MedlemsvilkarPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Medlemsvilkår</h1>
        <p className="mt-3 text-sm text-ink-soft">Sist oppdatert: november 2026</p>

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
