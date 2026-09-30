import SubmissionForm from "@/components/SubmissionForm";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoneypotFields from "@/components/HoneypotFields";
import { submitApplication, submitMembership } from "./actions";

export const metadata: Metadata = {
  title: "Bli med – Mangfoldshuset Vestland",
  description:
    "Bli medlem, frivillig eller samarbeidspartner i Mangfoldshuset Vestland – eller del en idé.",
};

const interesser = [
  "Barn og unge",
  "Kultur",
  "Mat og servering",
  "Språkkafé",
  "Foto og video",
  "Sosiale medier",
  "Praktisk hjelp",
  "Tur og friluft",
  "Kurs og workshops",
  "Planlegging og organisering",
];

const tilgjengelighet = [
  "Hverdager på dagtid",
  "Hverdager på kveldstid",
  "Helger",
  "Av og til",
  "Fast / regelmessig",
];

const typer = [
  "Jeg vil hjelpe på enkelte arrangementer",
  "Jeg ønsker å bidra regelmessig",
  "Jeg vil holde et kurs eller en aktivitet",
  "Jeg har en idé til et nytt prosjekt",
  "Jeg er ikke sikker ennå",
];

const input =
  "w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";
const button =
  "w-fit rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark";

function Thanks({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-[#EAF0E9] px-6 py-8 text-center">
      <p className="font-serif text-xl text-green-dark">Takk!</p>
      <p className="mt-1 text-sm text-ink-soft">{text}</p>
    </div>
  );
}

function ErrorNotice() {
  return (
    <p className="mb-4 rounded-lg bg-[#F7E9E9] px-4 py-2.5 text-sm font-semibold text-fig">
      Sjekk at feltene er fylt ut riktig, og prøv igjen.
    </p>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-line py-16">
      <h2 className="font-serif text-3xl font-medium">{title}</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
        {intro}
      </p>
      <div className="mt-8 rounded-[18px] border border-line bg-white p-8">
        {children}
      </div>
    </section>
  );
}

function Contact({ prefix }: { prefix: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor={`${prefix}-name`} className={label}>Navn</label>
        <input id={`${prefix}-name`} name="name" required className={input} />
      </div>
      <div>
        <label htmlFor={`${prefix}-email`} className={label}>E-post</label>
        <input id={`${prefix}-email`} type="email" name="email" required className={input} />
      </div>
      <div>
        <label htmlFor={`${prefix}-phone`} className={label}>Telefon</label>
        <input id={`${prefix}-phone`} name="phone" className={input} />
      </div>
    </div>
  );
}

export default async function BliMedPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string; feil?: string }>;
}) {
  const { sendt, feil } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-20 pb-10">
        <h1 className="font-serif text-4xl font-medium">Bli med</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Mangfoldshuset er åpent for alle. Du kan bli medlem, bidra som
          frivillig, dele en idé eller samarbeide med oss.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          {[
            ["#medlem", "Bli medlem"],
            ["#frivillig", "Bli frivillig"],
            ["#ide", "Har du en idé?"],
            ["#samarbeid", "Samarbeid med oss"],
          ].map(([href, text]) => (
            <a
              key={href}
              href={href}
              className="rounded-full bg-[#F7E9E9] px-5 py-2.5 text-fig transition-opacity hover:opacity-80"
            >
              {text}
            </a>
          ))}
        </div>

        <div className="mt-10">
          <Section
            id="medlem"
            title="Bli medlem"
            intro="Som medlem støtter du arbeidet vårt og er med på å bestemme retningen. Medlemskap og frivillig arbeid er to ulike ting – du kan gjerne være begge deler."
          >
            {sendt === "medlem" ? (
              <Thanks text="Takk for at du melder deg inn! Betal kontingenten med Vipps til #595791, så aktiverer vi medlemskapet ditt." />
            ) : (
              <SubmissionForm action={submitMembership} className="flex flex-col gap-5">
                <HoneypotFields />
                {feil === "medlem" && <ErrorNotice />}
                <fieldset>
                  <legend className={label}>Medlemskap</legend>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <input type="radio" name="membership_type" value="enkelt" defaultChecked className="accent-[#9C3B44]" />
                      Enkelt person (100 kr)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <input type="radio" name="membership_type" value="familie" className="accent-[#9C3B44]" />
                      Familie (150 kr)
                    </label>
                  </div>
                </fieldset>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="field-first_name" className={label}>Fornavn</label>
                    <input id="field-first_name" name="first_name" required className={input} />
                  </div>
                  <div>
                    <label htmlFor="field-last_name" className={label}>Etternavn</label>
                    <input id="field-last_name" name="last_name" required className={input} />
                  </div>
                  <div>
                    <label htmlFor="field-birth_date" className={label}>Fødselsdato</label>
                    <input id="field-birth_date" type="date" name="birth_date" className={input} />
                  </div>
                  <div>
                    <label htmlFor="field-phone" className={label}>Telefon</label>
                    <input id="field-phone" name="phone" className={input} />
                  </div>
                  <div>
                    <label htmlFor="field-email" className={label}>E-post</label>
                    <input id="field-email" type="email" name="email" required className={input} />
                  </div>
                  <div>
                    <label htmlFor="field-address" className={label}>Adresse</label>
                    <input id="field-address" name="address" className={input} />
                  </div>
                </div>
                <details className="rounded-lg border border-line bg-cream px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-ink">
                    Familiemedlemmer (kun for familiemedlemskap, opptil 5 personer til)
                  </summary>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="contents">
                        <input aria-label={`Person ${n}: navn og etternavn`} name={`fam_name_${n}`} placeholder={`Person ${n}: navn og etternavn`} className={input} />
                        <input type="date" name={`fam_birth_${n}`} className={input} aria-label={`Person ${n}: fødselsdato`} />
                      </div>
                    ))}
                  </div>
                </details>
                <div>
                  <label htmlFor="field-guardian" className={label}>Foresatt (hvis under 18 år)</label>
                  <input id="field-guardian" name="guardian" className={input} />
                </div>
                <div>
                  <label htmlFor="field-comment" className={label}>Kommentar</label>
                  <textarea id="field-comment" name="comment" rows={2} className={input} />
                </div>
                <label className="block text-sm leading-relaxed text-ink-soft">
                  <input type="checkbox" name="terms" required className="mr-2 accent-[#9C3B44]" />
                  Jeg godtar{" "}
                  <a href="/medlemsvilkar" target="_blank" rel="noopener noreferrer" className="underline">
                    medlemsvilkårene
                  </a>{" "}
                  og at opplysningene lagres i medlemsregisteret (se{" "}
                  <a href="/personvern" target="_blank" rel="noopener noreferrer" className="underline">
                    personvern
                  </a>
                  ).
                </label>
                <p className="text-sm text-ink-soft">
                  Medlemskontingent (enkelt 100 kr, familie 150 kr per år)
                  betales med Vipps til{" "}
                  <span className="font-semibold text-ink">#595791</span> eller
                  bankkonto{" "}
                  <span className="font-semibold text-ink">3207 31 01688</span>.
                  Vi jobber med å tilby automatisk fornyelse via Vipps – kommer
                  senere.
                </p>
                <button type="submit" className={button}>
                  Meld meg inn
                </button>
              </SubmissionForm>
            )}
          </Section>

          <Section
            id="frivillig"
            title="Bli frivillig"
            intro="Fortell oss hva du liker å gjøre, så finner vi noe som passer deg."
          >
            {sendt === "frivillig" ? (
              <Thanks text="Vi har mottatt skjemaet ditt og tar kontakt." />
            ) : (
              <SubmissionForm action={submitApplication} className="flex flex-col gap-6">
                <HoneypotFields />
                {feil === "frivillig" && <ErrorNotice />}
                <input type="hidden" name="type" value="frivillig" />
                <Contact prefix="frivillig" />
                <fieldset>
                  <legend className={label}>Interesser</legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {interesser.map((i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-ink-soft">
                        <input type="checkbox" name="interesser" value={i} className="accent-[#9C3B44]" />
                        {i}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="field-ferdigheter" className={label}>
                    Har du erfaring, et talent eller noe du gjerne vil lære bort?
                  </label>
                  <textarea id="field-ferdigheter" name="ferdigheter" rows={3} className={input} />
                </div>
                <fieldset>
                  <legend className={label}>Når kan du?</legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tilgjengelighet.map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm text-ink-soft">
                        <input type="checkbox" name="tilgjengelighet" value={t} className="accent-[#9C3B44]" />
                        {t}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className={label}>Hva har du lyst til?</legend>
                  <div className="mt-2 flex flex-col gap-2">
                    {typer.map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm text-ink-soft">
                        <input type="checkbox" name="type_bidrag" value={t} className="accent-[#9C3B44]" />
                        {t}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button type="submit" className={button}>
                  Send inn
                </button>
              </SubmissionForm>
            )}
          </Section>

          <Section
            id="ide"
            title="Har du en idé?"
            intro="Vil du starte en aktivitet, et kurs eller et prosjekt? Fortell oss – vi hjelper til med det praktiske."
          >
            {sendt === "ide" ? (
              <Thanks text="Takk for at du delte ideen din!" />
            ) : (
              <SubmissionForm action={submitApplication} className="flex flex-col gap-5">
                <HoneypotFields />
                {feil === "ide" && <ErrorNotice />}
                <input type="hidden" name="type" value="ide" />
                <Contact prefix="ide" />
                <div>
                  <label htmlFor="field-ide" className={label}>Idé / forslag</label>
                  <textarea id="field-ide" name="ide" required rows={4} className={input} />
                </div>
                <div>
                  <label htmlFor="field-malgruppe" className={label}>Hvem er aktiviteten for?</label>
                  <input id="field-malgruppe" name="malgruppe" className={input} />
                </div>
                <div>
                  <label htmlFor="field-hjelp" className={label}>Trenger du hjelp til gjennomføring?</label>
                  <select id="field-hjelp" name="hjelp" className={input} defaultValue="">
                    <option value="">Velg</option>
                    <option>Ja</option>
                    <option>Nei</option>
                    <option>Vet ikke ennå</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="field-kommentar" className={label}>Kommentar</label>
                  <textarea id="field-kommentar" name="kommentar" rows={2} className={input} />
                </div>
                <button type="submit" className={button}>
                  Del ideen
                </button>
              </SubmissionForm>
            )}
          </Section>

          <Section
            id="samarbeid"
            title="Samarbeid med oss"
            intro="Vi ønsker samarbeid med organisasjoner, bedrifter og offentlige aktører."
          >
            {sendt === "samarbeid" ? (
              <Thanks text="Takk for henvendelsen! Vi tar kontakt." />
            ) : (
              <SubmissionForm action={submitApplication} className="flex flex-col gap-5">
                <HoneypotFields />
                {feil === "samarbeid" && <ErrorNotice />}
                <input type="hidden" name="type" value="samarbeid" />
                <div>
                  <label htmlFor="field-organisasjon" className={label}>Organisasjon / virksomhet</label>
                  <input id="field-organisasjon" name="organisasjon" required className={input} />
                </div>
                <Contact prefix="samarbeid" />
                <div>
                  <label htmlFor="field-tema" className={label}>Hva ønsker dere å samarbeide om?</label>
                  <input id="field-tema" name="tema" className={input} />
                </div>
                <div>
                  <label htmlFor="field-melding" className={label}>Melding</label>
                  <textarea id="field-melding" name="melding" rows={4} className={input} />
                </div>
                <button type="submit" className={button}>
                  Send henvendelse
                </button>
              </SubmissionForm>
            )}
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
