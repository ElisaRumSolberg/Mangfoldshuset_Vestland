import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Personvern – Mangfoldhuset Vestland",
  description: "Slik behandler Mangfoldhuset Vestland personopplysninger.",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Behandlingsansvarlig",
    body: (
      <p>
        Mangfoldhuset Vestland, org.nr. 914 732 999, Arne Abrahamsens vei 1,
        Bergen. Kontakt oss på{" "}
        <a className="underline" href="mailto:ali.mangfoldhuset@gmail.com">
          ali.mangfoldhuset@gmail.com
        </a>{" "}
        eller telefon 405 67 853 for spørsmål om personvern.
      </p>
    ),
  },
  {
    title: "Hvilke opplysninger vi samler inn og hvorfor",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Medlemsregister:</strong> navn, fødselsdato, adresse, e-post,
          telefon, eventuell foresatt, familiemedlemmer og betalingsstatus. Brukes
          til å administrere medlemskap, sende påminnelser om fornyelse og
          dokumentere medlemstall overfor offentlige støtteordninger.
        </li>
        <li>
          <strong>Kontaktskjema:</strong> navn, e-post, tema og melding. Brukes til
          å svare på henvendelsen din.
        </li>
        <li>
          <strong>Frivillig, idé og samarbeid:</strong> navn, e-post, telefon og
          informasjonen du oppgir i skjemaet. Brukes til å ta kontakt og
          koordinere frivillig arbeid.
        </li>
        <li>
          <strong>Administratorinnlogging:</strong> e-post og innloggingsøkt for
          personer med tilgang til administrasjonen av nettsiden.
        </li>
      </ul>
    ),
  },
  {
    title: "Behandlingsgrunnlag",
    body: (
      <p>
        Medlemsregisteret behandles fordi det er nødvendig for medlemskapet og
        for foreningens berettigede interesse i å drive organisasjonen
        (personvernforordningen art. 6 nr. 1 bokstav b og f). Øvrige skjemaer
        behandles på grunnlag av samtykket du gir ved å sende inn skjemaet
        (art. 6 nr. 1 bokstav a).
      </p>
    ),
  },
  {
    title: "Hvor lenge vi lagrer opplysningene",
    body: (
      <p>
        Medlemsopplysninger lagres så lenge du er medlem, og slettes senest to
        år etter at medlemskapet utløper, med mindre vi har plikt til å beholde
        dem. Henvendelser via kontaktskjemaet og andre skjemaer slettes når
        saken er avsluttet, senest etter tolv måneder.
      </p>
    ),
  },
  {
    title: "Hvem vi deler opplysninger med",
    body: (
      <>
        <p>
          Vi selger eller utleverer ikke personopplysninger. Vi bruker disse
          databehandlerne som leverer teknisk drift:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Supabase (database og filer, region London – Storbritannia)</li>
          <li>Vercel (hosting av nettsiden)</li>
          <li>Resend (utsending av e-postvarsler og påminnelser)</li>
        </ul>
        <p className="mt-2">
          Overføring til land utenfor EØS skjer på grunnlag av
          standard­kontraktsbestemmelser eller tilstrekkelighetsvedtak.
        </p>
      </>
    ),
  },
  {
    title: "Informasjonskapsler",
    body: (
      <p>
        Vi bruker ikke sporings- eller markedsføringskapsler. Nødvendige
        informasjonskapsler brukes kun for innlogging i administrasjonen. Vi
        bruker ikke Google Analytics.
      </p>
    ),
  },
  {
    title: "Bilder og video fra arrangementer",
    body: (
      <p>
        Vi publiserer bare bilder og video av personer, særlig barn, med
        samtykke. Ønsker du at et bilde fjernes, kontakt oss, så fjerner vi det
        raskt. Deltakertall og tilbakemeldinger fra arrangementer publiseres
        uten navn.
      </p>
    ),
  },
  {
    title: "Dine rettigheter",
    body: (
      <>
        <p>
          Du har rett til innsyn i opplysningene vi har om deg, til å få dem
          rettet eller slettet, til å begrense eller protestere mot
          behandlingen, og til å trekke tilbake samtykke. Kontakt oss for å
          bruke rettighetene dine.
        </p>
        <p className="mt-2">
          Du kan klage til{" "}
          <a
            className="underline"
            href="https://www.datatilsynet.no"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datatilsynet
          </a>{" "}
          hvis du mener vi behandler opplysninger i strid med regelverket.
        </p>
      </>
    ),
  },
];

export default function PersonvernPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Personvernerklæring</h1>
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
