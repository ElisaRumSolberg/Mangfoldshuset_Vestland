import SubmissionForm from "@/components/SubmissionForm";
import BliMedTabs from "@/components/BliMedTabs";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoneypotFields from "@/components/HoneypotFields";
import { fetchSiteSettings } from "@/lib/site-settings";
import BirthDateInput from "@/components/BirthDateInput";
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

function VippsButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-fit items-center rounded-full px-6 text-sm font-semibold text-[#1A1512] transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: "#FF5B24" }}
    >
      Betal med Vipps
    </a>
  );
}

function Thanks({ text, vippsLink }: { text: string; vippsLink?: string | null }) {
  return (
    <div className="rounded-xl bg-[#EAF0E9] px-6 py-8 text-center">
      <p className="font-serif text-xl text-green-dark">Takk!</p>
      <p className="mt-1 text-sm text-ink-soft">{text}</p>
      {vippsLink && (
        <div className="mt-5 flex justify-center">
          <VippsButton href={vippsLink} />
        </div>
      )}
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
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 pb-6 pt-8">
      <h2 className="font-serif text-3xl font-medium">{title}</h2>
      <div className="mt-3 max-w-xl space-y-3 text-base leading-relaxed text-ink-soft">
        {typeof intro === "string" ? <p>{intro}</p> : intro}
      </div>
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

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-green-dark">
      <circle cx="12" cy="12" r="10" fill="#EAF0E9" />
      <path d="M7.5 12.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  ["1", "Meld deg inn", "Fyll ut skjemaet for deg selv."],
  ["2", "Betal for deg selv", "Hver person har sin egen betaling. Foresatte betaler for barn."],
  ["3", "Legg til flere", "Når du har betalt, kan du legge til flere i familien."],
] as const;

export default async function BliMedPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string; feil?: string }>;
}) {
  const { sendt, feil } = await searchParams;
  const settings = await fetchSiteSettings();
  const vippsLink = settings.vipps_link;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-20 pb-10">
        <h1 className="font-serif text-4xl font-medium">Bli med</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Mangfoldshuset er åpent for alle. Du kan bli medlem, bidra som
          frivillig, dele en idé eller samarbeide med oss.
        </p>
        <BliMedTabs
          initial={sendt ?? feil}
          tabs={[
            { id: "medlem", label: "Bli medlem" },
            { id: "frivillig", label: "Bli frivillig" },
            { id: "ide", label: "Har du en idé?" },
            { id: "samarbeid", label: "Samarbeid med oss" },
          ]}
        >
          <Section
            id="medlem"
            title="Bli medlem"
            intro={
              <>
                <p>
                  Mangfoldshuset Vestland er først og fremst en aktivitetsrettet forening, men vi trenger alltid
                  flere medlemmer som vil være med på å styrke mangfoldet i nærmiljøet.
                </p>
                <p>
                  Et medlemskap er et verdifullt bidrag til arbeidet vårt med å arrangere aktiviteter for alle –
                  uansett alder, bakgrunn og forutsetninger. Sammen bidrar vi til inkludering, fellesskap og sosial
                  utjevning.
                </p>
              </>
            }
          >
            {sendt === "medlem" ? (
              <Thanks text="Takk for at du melder deg inn! Betal kontingenten med Vipps til #595791, så aktiverer vi medlemskapet ditt. Når du har betalt, kan du legge til flere i familien." vippsLink={vippsLink} />
            ) : (
              <>
                <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {STEPS.map(([n, title, text]) => (
                    <li key={n} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fig font-serif text-lg text-white">
                        {n}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{title}</p>
                        <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <hr className="my-8 border-line" />

                <h3 className="font-serif text-2xl font-medium text-ink">Hva koster det?</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Per person, per år. Du melder deg inn og betaler for deg selv. Først når du har betalt, kan du
                  legge til flere, og de betaler hver for seg. Er medlemmet under 18 år, betaler foresatt.
                </p>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-[#F7E9E9] px-6 py-5">
                    <dt className="text-sm font-semibold text-fig">0–15 år</dt>
                    <dd className="mt-1 font-serif text-4xl text-ink">25 kr</dd>
                    <dd className="mt-1 text-sm text-ink-soft">Foresatt betaler for barnet</dd>
                  </div>
                  <div className="rounded-2xl border border-line bg-[#EAF0E9] px-6 py-5">
                    <dt className="text-sm font-semibold text-green-dark">Fra og med 16 år</dt>
                    <dd className="mt-1 font-serif text-4xl text-ink">100 kr</dd>
                  </div>
                </dl>

                <h3 className="mt-8 font-serif text-2xl font-medium text-ink">Dette får du</h3>
                <ul className="mt-3 flex flex-col gap-2.5 text-base text-ink-soft">
                  {[
                    "Delta på foreningens aktiviteter",
                    "Møte- og stemmerett på årsmøtet",
                    "Foreslå og engasjere deg i aktiviteter, kurs og prosjekter",
                    "Støtte et inkluderende nærmiljø for barn, unge, voksne og seniorer",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <Check />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-cream text-sm text-ink-soft">
                  <details className="group px-5 py-3">
                    <summary className="cursor-pointer font-semibold text-ink">Varighet og fornyelse</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Medlemskapet gjelder kalenderåret, 1. januar–31. desember.</li>
                      <li>Melder du deg inn fra og med 1. oktober, gjelder det ut neste år.</li>
                      <li>Du velger selv om det skal fornyes automatisk 1. januar (kommer snart). Du får e-post 15 dager før.</li>
                    </ul>
                  </details>
                  <details className="group px-5 py-3">
                    <summary className="cursor-pointer font-semibold text-ink">Oppsigelse og angrerett</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Du kan når som helst si opp automatisk fornyelse, i Vipps-appen eller på e-post.</li>
                      <li>Betaler du på nett, har du 14 dagers angrerett fra betalingsdagen og får hele kontingenten tilbake.</li>
                    </ul>
                  </details>
                  <p className="px-5 py-3">
                    <a href="/medlemsvilkar" className="font-semibold text-green-dark underline">
                      Les alle medlemsvilkårene
                    </a>
                  </p>
                </div>

                <hr className="my-8 border-line" />

                <SubmissionForm action={submitMembership} className="flex flex-col gap-5">
                  <HoneypotFields />
                  {feil === "medlem" && <ErrorNotice />}
                  <h3 className="font-serif text-2xl font-medium text-ink">Dine opplysninger</h3>
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
                      <BirthDateInput id="field-birth_date" name="birth_date" className={input} />
                    </div>
                    <div>
                      <label htmlFor="field-gender" className={label}>Kjønn</label>
                      <select id="field-gender" name="gender" required defaultValue="" className={input}>
                        <option value="">Velg</option>
                        <option value="kvinne">Kvinne</option>
                        <option value="mann">Mann</option>
                        <option value="annet">Annet</option>
                        <option value="ukjent">Ønsker ikke å oppgi</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="field-email" className={label}>E-post</label>
                      <input id="field-email" type="email" name="email" required className={input} />
                    </div>
                    <div>
                      <label htmlFor="field-phone" className={label}>Telefon</label>
                      <input id="field-phone" name="phone" className={input} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="field-address" className={label}>Adresse</label>
                      <input id="field-address" name="address" className={input} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="field-guardian" className={label}>Foresatt (bare hvis du er under 18 år)</label>
                      <input id="field-guardian" name="guardian" className={input} />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-soft">
                    Vi spør om fødselsdato og kjønn fordi vi må rapportere antall medlemmer etter alder
                    og kjønn til støtteordninger. Du kan velge «Ønsker ikke å oppgi» på kjønn.
                  </p>

                  <p className="rounded-lg bg-[#EAF0E9] px-4 py-3 text-sm leading-relaxed text-ink-soft">
                    Du melder deg inn og betaler for deg selv. Når betalingen din er registrert, kan du legge til flere
                    i familien på din egen medlemsside. Hver person har sin egen betaling.
                  </p>

                  <div>
                    <label htmlFor="field-comment" className={label}>Kommentar (valgfritt)</label>
                    <textarea id="field-comment" name="comment" rows={2} className={input} />
                  </div>
                  <label className="block text-sm leading-relaxed text-ink-soft">
                    <input type="checkbox" name="terms" required className="mr-2 h-5 w-5 shrink-0 align-middle accent-[#9C3B44]" />
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
                  <button type="submit" className={button}>
                    Meld meg inn
                  </button>
                </SubmissionForm>
              </>
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
                      <label key={i} className="flex min-h-10 items-center gap-2 text-sm text-ink-soft">
                        <input type="checkbox" name="interesser" value={i} className="h-5 w-5 shrink-0 accent-[#9C3B44]" />
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
                      <label key={t} className="flex min-h-10 items-center gap-2 text-sm text-ink-soft">
                        <input type="checkbox" name="tilgjengelighet" value={t} className="h-5 w-5 shrink-0 accent-[#9C3B44]" />
                        {t}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className={label}>Hva har du lyst til?</legend>
                  <div className="mt-2 flex flex-col gap-2">
                    {typer.map((t) => (
                      <label key={t} className="flex min-h-10 items-center gap-2 text-sm text-ink-soft">
                        <input type="checkbox" name="type_bidrag" value={t} className="h-5 w-5 shrink-0 accent-[#9C3B44]" />
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
        </BliMedTabs>
      </main>
      <Footer />
    </>
  );
}
