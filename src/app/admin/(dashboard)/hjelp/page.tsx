import type { Metadata } from "next";
import Link from "next/link";
import HjelpTr from "./HjelpTr";
import { getAdminLang } from "@/lib/admin-i18n-server";

export const metadata: Metadata = { title: "Hjelp – brukerveiledning" };

const sections = [
  { id: "logge-inn", title: "Logge inn og ut" },
  { id: "aktivitet", title: "Legge til en aktivitet" },
  { id: "etterpa", title: "Etter arrangementet: «Slik gikk det»" },
  { id: "bilder", title: "Bilder og filer" },
  { id: "faste-tilbud", title: "Faste tilbud (ukentlige og månedlige)" },
  { id: "utvalg", title: "Utvalg" },
  { id: "nyheter", title: "Nyheter og Mangfoldsposten" },
  { id: "medlemmer", title: "Medlemmer (bare administrator)" },
  { id: "meldinger", title: "Meldinger og søknader (bare administrator)" },
  { id: "forsiden", title: "Bilder og Vipps på forsiden" },
  { id: "feil", title: "Når noe går galt" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-6">
      <h2 className="font-serif text-xl font-medium text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-1.5 pl-6">{children}</ol>;
}

export default async function HjelpPage() {
  const tr = (await getAdminLang()) === "tr";

  return (
    <div className="max-w-3xl">
      {tr ? (
        <HjelpTr />
      ) : (
        <>
      <h1 className="font-serif text-2xl font-medium text-ink">Slik bruker du admin</h1>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">
        En enkel veiledning for deg som oppdaterer nettsiden. Du kan ikke ødelegge noe ved å
        lese eller prøve deg frem: før noe slettes, blir du alltid spurt først. Etter hver
        handling står det en grønn melding øverst på siden som viser at det gikk bra.
      </p>

      <nav aria-label="Innhold" className="mt-6 rounded-2xl border border-line bg-cream p-5">
        <p className="text-sm font-semibold text-ink">Hopp til</p>
        <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex min-h-11 items-center text-sm font-medium text-green-dark underline-offset-2 hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="logge-inn" title="Logge inn og ut">
        <Steps>
          <li>
            Gå til <strong>mangfoldshusetvestland.no/admin</strong> i nettleseren.
          </li>
          <li>Skriv inn e-postadressen og passordet ditt, og trykk «Logg inn».</li>
          <li>Når du er ferdig, trykk «Logg ut» øverst til høyre.</li>
        </Steps>
        <p>
          <strong>Glemt passord?</strong> Trykk «Glemt passord?» på innloggingssiden. Du får en
          e-post med en lenke. Trykk på lenken og velg et nytt passord med minst 12 tegn. Det
          nye passordet må være et annet enn det gamle.
        </p>
        <p>
          <strong>Språk:</strong> Knappene NO og TR øverst til høyre bytter mellom norsk og
          tyrkisk i admin. Nettsiden for besøkende er alltid på norsk.
        </p>
        <p>
          Du ser bare de delene du har tilgang til. «Redaktør» kan endre innhold. «Utvalg» kan
          bare redigere sitt eget utvalg.
        </p>
      </Section>

      <Section id="aktivitet" title="Legge til en aktivitet">
        <Steps>
          <li>
            Trykk <strong>Aktiviteter</strong> i menyen.
          </li>
          <li>
            Fyll ut skjemaet øverst: tittel, kategori, dato, sted og en kort beskrivelse.
            Klokkeslett, pris og bilde er valgfritt.
          </li>
          <li>
            Velg en eller flere <strong>kategorier</strong>. Bruker utvalgene dine et ord her
            (som «ungdom»), dukker aktiviteten automatisk opp på utvalgets side.
          </li>
          <li>
            Huk av «Åpne for påmelding» hvis folk skal kunne melde seg på. Huk av «Fremhevet» for
            å vise den øverst.
          </li>
          <li>Trykk «Legg til aktivitet». Du får en grønn bekreftelse øverst.</li>
        </Steps>
        <p>
          <strong>Endre eller slette:</strong> i listen under skjemaet trykker du «Rediger» for å
          endre, og «Slett» for å fjerne. Slett spør alltid om du er sikker.
        </p>
        <p>
          <strong>Påmeldte:</strong> åpne aktiviteten med «Rediger». Nederst står alle som har
          meldt seg på, med navn, e-post og telefon.
        </p>
      </Section>

      <Section id="etterpa" title="Etter arrangementet: «Slik gikk det»">
        <p>
          Åpne aktiviteten med «Rediger» og finn boksen <strong>Slik gikk det</strong>. Her
          skriver du:
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Antall deltakere</strong> – telles automatisk med i tallet på forsiden.
          </li>
          <li>
            <strong>Oppsummering</strong> – noen få setninger om hva som skjedde.
          </li>
          <li>
            <strong>Tilbakemeldinger</strong> – ett utsagn per linje (trykk Enter mellom hver).
            Skriv bare det deltakerne faktisk har sagt, uten navn.
          </li>
          <li>
            <strong>Bilder</strong> – bare bilder der alle som er avbildet har samtykket. For
            barn må en forelder ha sagt ja.
          </li>
        </ul>
        <p>Husk å trykke «Lagre endringer» nederst.</p>
      </Section>

      <Section id="bilder" title="Bilder og filer">
        <Steps>
          <li>Trykk «Velg fil» (eller «Choose file») og velg bildet fra maskinen.</li>
          <li>
            Vent til det står <strong>«✓ … er lastet opp»</strong> under feltet. Store filer kan
            ta litt tid.
          </li>
          <li>
            Først da trykker du «Legg til» eller «Lagre». Gjør du det for tidlig, venter
            nettleseren og forteller deg at opplastingen ikke er ferdig.
          </li>
        </Steps>
        <p>
          Filer kan være opptil 50 MB. Er filen for stor, står det en tydelig melding. Bruk
          gjerne vanlige bilder (JPG eller PNG) og PDF for Mangfoldsposten.
        </p>
      </Section>

      <Section id="faste-tilbud" title="Faste tilbud (ukentlige og månedlige)">
        <p>
          Brukes for ting som skjer jevnlig, som Barseltreff hver fredag. Du legger inn
          tilbudet én gang, så regner nettsiden ut datoene selv.
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Hvor ofte:</strong> «Hver uke» eller «Hver måned». Velg ukedag. For
            månedlige tilbud velger du også hvilken uke i måneden (for eksempel «siste
            søndag»).
          </li>
          <li>
            <strong>Avlyste datoer:</strong> skriv datoen som ÅÅÅÅ-MM-DD, for eksempel{" "}
            <code className="rounded bg-cream-2 px-1.5 py-0.5">2026-12-25</code>. Flere datoer
            skilles med komma.
          </li>
          <li>
            <strong>Vis på nettsiden:</strong> fjern haken for å skjule tilbudet uten å slette det.
          </li>
        </ul>
      </Section>

      <Section id="utvalg" title="Utvalg">
        <p>
          Hvert utvalg har sin egen side. Under <strong>Utvalg</strong> i menyen kan du endre
          beskrivelse, bilder og lenker.
        </p>
        <p>
          Feltet <strong>«Vis deres aktiviteter»</strong> er viktig: skriv samme ord som du har
          brukt som kategori på aktivitetene (for eksempel «ungdom»). Aktiviteter med det ordet
          vises, med bilder og tilbakemeldinger, på utvalgets side. Skriver du ordet
          annerledes, blir listen tom.
        </p>
      </Section>

      <Section id="nyheter" title="Nyheter og Mangfoldsposten">
        <p>
          <strong>Nyheter:</strong> skriv overskrift og et kort sammendrag, velg gjerne bilde, og
          trykk «Legg til». Den nyeste står øverst på nettsiden.
        </p>
        <p>
          <strong>Mangfoldsposten:</strong> skriv tittel (for eksempel «Høst 2026»), velg dato,
          last opp forsidebilde og PDF, og trykk «Publiser utgave». Vent til PDF-en er
          lastet opp først.
        </p>
      </Section>

      <Section id="medlemmer" title="Medlemmer (bare administrator)">
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Filter</strong> øverst viser aktive, de som utløper snart, utløpte og de
            som ikke har betalt.
          </li>
          <li>
            <strong>Marker betalt / Forny (+1 år)</strong> registrerer betaling og setter
            utløpsdato ett år frem.
          </li>
          <li>
            <strong>Legg til eksisterende medlem</strong> brukes for personer som allerede har
            betalt, men ikke er registrert.
          </li>
          <li>
            <strong>Oversikt</strong> (første side) viser medlemmer som må følges opp, med
            knapper for å ringe eller sende e-post.
          </li>
          <li>
            <strong>Søk</strong> finner medlemmer på navn, e-post, telefon eller navn på
            familiemedlem.
          </li>
          <li>
            <strong>Visning:</strong> «Medlemskap» viser ett kort per medlemskap (med
            familiemedlemmer under). «Hver person for seg» viser alle personer hver for seg,
            med alder og kjønn.
          </li>
          <li>
            <strong>Rediger</strong> lar deg rette navn, kontaktinformasjon, fødselsdato, kjønn
            og familiemedlemmer. Bruk den for eldre medlemmer som mangler fødselsdato eller
            kjønn.
          </li>
          <li>
            <strong>Statistikk etter alder og kjønn</strong> øverst viser antall i hver
            aldersgruppe, hvor mange som er under 26 år og hvor mange som er 6–25 år. Brukes til
            rapporter til støtteordninger.
          </li>
          <li>
            Nye medlemmer som ikke har betalt får automatisk en påminnelse på e-post etter 3 og
            14 dager.
          </li>
        </ul>
      </Section>

      <Section id="meldinger" title="Meldinger og søknader (bare administrator)">
        <p>
          <strong>Meldinger</strong> er det folk har skrevet i kontaktskjemaet. Du får også en
          kopi på e-post.
        </p>
        <p>
          <strong>Søknader</strong> er frivillige, idéer og forslag om samarbeid fra «Bli
          med»-siden. Svar dem på e-post eller telefon, og slett etterpå.
        </p>
      </Section>

      <Section id="forsiden" title="Bilder og Vipps på forsiden">
        <p>
          Under <strong>Innhold</strong> bytter du bildene på forsiden og på «Om oss». Her ligger
          også ferdige lenker og QR-koder til plakater.
        </p>
        <p>
          <strong>Vipps:</strong> får du en lenke fra Vipps (starter med https://), limer du den
          inn i feltet «Lenke til Vipps innsamling» og trykker «Lagre». Da vises en «Gi med
          Vipps»-knapp på nettsiden.
        </p>
        <p>
          <strong>Statistikk</strong> (bare administrator) viser tallene i «Samfunnsinnsats» på
          forsiden. Deltakere regnes ut automatisk fra aktivitetene, så du trenger bare å legge
          inn det som ikke er registrert andre steder.
        </p>
      </Section>

      <Section id="feil" title="Når noe går galt">
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Rød melding øverst:</strong> les teksten. Den sier hva du kan gjøre. Prøv
            igjen, og logg ut og inn hvis den sier at du ikke har tilgang.
          </li>
          <li>
            <strong>«Noe gikk galt»-side:</strong> ingenting er slettet. Trykk «Prøv igjen». Skjer
            det flere ganger, send en melding til den som har ansvar for nettsiden og oppgi
            feilkoden som står på siden.
          </li>
          <li>
            <strong>Endringen vises ikke på nettsiden:</strong> vent et par minutter og last
            siden på nytt (trykk F5, eller dra ned på mobil).
          </li>
          <li>
            <strong>Slettet ved en feil:</strong> det kan ikke angres fra admin. Kontakt den som
            har ansvar for nettsiden så fort som mulig.
          </li>
        </ul>
        <p className="pt-2">
          <Link href="/admin" className="font-semibold text-green-dark underline">
            Tilbake til oversikten
          </Link>
        </p>
      </Section>
        </>
      )}
    </div>
  );
}
