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

const mInput =
  "w-full rounded-xl border border-line bg-cream/60 px-4 py-3 text-base text-ink caret-[#9C3B44] outline-none transition-colors placeholder:text-ink-soft/60 focus:border-fig focus:bg-white";
const mLabel = "mb-1.5 block text-sm font-semibold text-ink";

const PANEL_STEPS = [
  ["Meld deg inn", "Fyll ut skjemaet for deg selv."],
  ["Betal for deg selv", "Hver person har sin egen betaling. Foresatte betaler for barn."],
  ["Legg til familien", "Når du har betalt, kan du legge til flere."],
] as const;

/** Medlemsseksjonen: et grønt infopanel i merkefargene ved siden av ett enkelt skjema. */
function MembershipSection({
  sendt,
  feil,
  vippsLink,
}: {
  sendt?: string;
  feil?: string;
  vippsLink?: string | null;
}) {
  return (
    <section id="medlem" className="scroll-mt-32 pb-6 pt-8">
      <div className="rise grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <aside className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#557453] to-[#33482F] p-7 text-white shadow-[0_22px_44px_-24px_rgba(51,72,47,0.7)] sm:p-9 lg:sticky lg:top-28">
          <svg
            className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 text-white"
            viewBox="0 0 400 400"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="300" cy="300" r="150" opacity="0.06" />
            <path
              d="M200 90C200 90 130 150 130 220C130 265 162 300 200 300C238 300 270 265 270 220C270 150 200 90 200 90Z"
              opacity="0.1"
            />
            <path
              d="M204 96C220 78 250 62 285 70C292 86 292 116 268 134C246 120 220 104 204 96Z"
              opacity="0.14"
            />
          </svg>

          <div className="relative">
            <h2 className="font-serif text-4xl font-medium text-balance">Bli medlem</h2>
            <p className="mt-4 text-base leading-relaxed text-white/90">
              Mangfoldshuset Vestland er en aktivitetsforening for alle i nærmiljøet. Et medlemskap er et verdifullt
              bidrag til arbeidet vårt – uansett alder, bakgrunn og forutsetninger.
            </p>

            <dl className="mt-7 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/12 px-5 py-4 ring-1 ring-white/20">
                <dt className="text-sm font-semibold">
                  0–15 år
                  <span className="block text-xs font-normal text-white/80">Foresatt betaler</span>
                </dt>
                <dd className="font-serif text-3xl">25 kr</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/12 px-5 py-4 ring-1 ring-white/20">
                <dt className="text-sm font-semibold">Fra og med 16 år</dt>
                <dd className="font-serif text-3xl">100 kr</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-white/80">Per person, per år.</p>

            <h3 className="mt-8 font-serif text-xl font-medium">Slik går det til</h3>
            <ol className="mt-3 space-y-3 text-sm leading-relaxed">
              {PANEL_STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#33482F]">
                    {i + 1}
                  </span>
                  <span className="text-white/90">
                    <strong className="font-semibold text-white">{title}.</strong> {text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="rounded-[24px] border border-line bg-white p-6 shadow-[0_16px_36px_-24px_rgba(51,49,44,0.45)] sm:p-9">
          {sendt === "medlem" ? (
            <Thanks text="Takk! Vi har sendt en e-post til adressen du oppga, med lenke til din medlemsside. Der ser du betalingsstatus og hvordan du betaler eller fornyer." vippsLink={vippsLink} />
          ) : (
            <>
              <h3 className="font-serif text-3xl font-medium text-ink">Meld deg inn</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                Du melder deg inn og betaler for deg selv. Flere i familien kan legges til når du har betalt.
              </p>

              <SubmissionForm action={submitMembership} className="mt-7 flex flex-col gap-5">
                <HoneypotFields />
                {feil === "medlem" && <ErrorNotice />}
                <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="field-first_name" className={mLabel}>Fornavn</label>
                    <input id="field-first_name" name="first_name" required autoComplete="given-name" className={mInput} />
                  </div>
                  <div>
                    <label htmlFor="field-last_name" className={mLabel}>Etternavn</label>
                    <input id="field-last_name" name="last_name" required autoComplete="family-name" className={mInput} />
                  </div>
                  <div>
                    <label htmlFor="field-birth_date" className={mLabel}>Fødselsdato</label>
                    <BirthDateInput id="field-birth_date" name="birth_date" className={mInput} />
                  </div>
                  <div>
                    <label htmlFor="field-gender" className={mLabel}>Kjønn</label>
                    <select id="field-gender" name="gender" required defaultValue="" className={mInput}>
                      <option value="">Velg</option>
                      <option value="kvinne">Kvinne</option>
                      <option value="mann">Mann</option>
                      <option value="annet">Annet</option>
                      <option value="ukjent">Ønsker ikke å oppgi</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="field-email" className={mLabel}>E-post</label>
                    <input id="field-email" type="email" name="email" required autoComplete="email" className={mInput} />
                  </div>
                  <div>
                    <label htmlFor="field-phone" className={mLabel}>Telefon</label>
                    <input id="field-phone" name="phone" type="tel" autoComplete="tel" className={mInput} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="field-address" className={mLabel}>Adresse</label>
                    <input id="field-address" name="address" autoComplete="street-address" className={mInput} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="field-guardian" className={mLabel}>
                      Foresatt <span className="font-normal text-ink-soft">(bare hvis du er under 18 år)</span>
                    </label>
                    <input id="field-guardian" name="guardian" className={mInput} />
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-ink-soft">
                  Vi spør om fødselsdato og kjønn fordi vi må rapportere antall medlemmer etter alder og kjønn til
                  støtteordninger. Du kan velge «Ønsker ikke å oppgi» på kjønn.
                </p>

                <div>
                  <label htmlFor="field-comment" className={mLabel}>
                    Kommentar <span className="font-normal text-ink-soft">(valgfritt)</span>
                  </label>
                  <textarea id="field-comment" name="comment" rows={2} className={mInput} />
                </div>

                <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
                  <input type="checkbox" name="terms" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#9C3B44]" />
                  <span>
                    Jeg godtar{" "}
                    <a href="/medlemsvilkar" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">
                      medlemsvilkårene
                    </a>{" "}
                    og at opplysningene lagres i medlemsregisteret (se{" "}
                    <a href="/personvern" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">
                      personvern
                    </a>
                    ).
                  </span>
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-fig px-7 text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(126,46,54,0.9)] transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
                >
                  Meld meg inn
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </SubmissionForm>

              <details className="mt-8 rounded-2xl bg-cream px-5 py-4 text-sm leading-relaxed text-ink-soft">
                <summary className="cursor-pointer font-semibold text-ink">Mer om medlemskapet</summary>
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  <li>Medlemskapet gjelder kalenderåret, 1. januar–31. desember. Melder du deg inn fra 1. oktober, gjelder det ut neste år.</li>
                  <li>Du velger selv om det skal fornyes automatisk 1. januar (kommer snart). Du får e-post 15 dager før.</li>
                  <li>Du kan når som helst si opp automatisk fornyelse, i Vipps-appen eller på e-post.</li>
                  <li>Betaler du på nett, har du 14 dagers angrerett og får hele kontingenten tilbake.</li>
                  <li>Som medlem kan du delta på aktivitetene våre og har møte- og stemmerett på årsmøtet.</li>
                </ul>
                <p className="mt-3">
                  <a href="/medlemsvilkar" className="font-semibold text-green-dark underline underline-offset-2">
                    Les alle medlemsvilkårene
                  </a>
                </p>
              </details>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

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
          <MembershipSection sendt={sendt} feil={feil} vippsLink={vippsLink} />

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
