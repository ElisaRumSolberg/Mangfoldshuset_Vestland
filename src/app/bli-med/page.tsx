import SubmissionForm from "@/components/SubmissionForm";
import BliMedTabs from "@/components/BliMedTabs";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoneypotFields from "@/components/HoneypotFields";
import { fetchSiteSettings } from "@/lib/site-settings";
import BirthDateInput from "@/components/BirthDateInput";
import { submitApplication, submitMembership } from "./actions";
import { feeStartsText, isFreePeriod } from "@/lib/membership-year";
import { isVippsPublic } from "@/lib/vipps";
import { todayOslo } from "@/lib/recurring";

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
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-green";
const label = "mb-1.5 block text-base font-semibold text-ink";
const button =
  "w-fit rounded-lg bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark";

function VippsButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-fit items-center rounded-lg px-6 text-sm font-semibold text-[#1A1512] transition-transform"
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
      Noe mangler eller er feil. Sjekk at navn, e-post og fødselsdato er fylt ut riktig, og prøv igjen.
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
      <div className="mt-8 rounded-xl border border-line bg-white p-8">
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
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink caret-[#9C3B44] outline-none transition-colors placeholder:text-ink-soft/60 focus:border-green";
const mLabel = "mb-1.5 block text-base font-semibold text-ink";

/** Medlemsseksjonen: skjemaet først, med én setning om prisen. Resten ligger i «Mer om medlemskapet». */
function MembershipSection({
  sendt,
  feil,
  vippsLink,
}: {
  sendt?: string;
  feil?: string;
  vippsLink?: string | null;
}) {
  const free = isFreePeriod(todayOslo());
  return (
    <section id="medlem" className="scroll-mt-32 pb-6 pt-8">
      <div className="rise max-w-xl">
        {sendt === "medlem" ? (
          <Thanks
            text={free
              ? "Takk! Du er medlem, og medlemskapet er gratis ut 2026. Vi har sendt en e-post med lenke til din medlemsside."
              : "Takk! Vi har sendt en e-post til adressen du oppga, med lenke til din medlemsside. Der ser du betalingsstatus og hvordan du betaler eller fornyer."}
            vippsLink={free || isVippsPublic() ? null : vippsLink}
          />
        ) : (
          <>
            <h2 className="font-serif text-3xl font-medium text-ink">Meld deg inn</h2>
            <p className="mt-3 text-base leading-relaxed text-ink">
              {free ? (
                <>
                  Medlemskap er <strong>gratis</strong> fram til {feeStartsText()}. Deretter koster det 100 kr per år, og
                  25 kr for barn og unge til og med 15 år.
                </>
              ) : (
                <>Kontingenten er 100 kr per år, og 25 kr for barn og unge til og med 15 år.</>
              )}
            </p>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">
              Du melder deg inn for deg selv. Flere i familien kan legges til etterpå.
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
                <div className="sm:col-span-2">
                  <label htmlFor="field-email" className={mLabel}>E-post</label>
                  <input id="field-email" type="email" name="email" required autoComplete="email" className={mInput} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="field-phone" className={mLabel}>
                    Telefon <span className="font-normal text-ink-soft">(valgfritt)</span>
                  </label>
                  <input id="field-phone" name="phone" type="tel" autoComplete="tel" className={mInput} />
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
                <div className="sm:col-span-2">
                  <label htmlFor="field-address" className={mLabel}>
                    Adresse <span className="font-normal text-ink-soft">(valgfritt)</span>
                  </label>
                  <input id="field-address" name="address" autoComplete="street-address" className={mInput} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="field-guardian" className={mLabel}>
                    Foresatt <span className="font-normal text-ink-soft">(bare hvis du er under 18 år)</span>
                  </label>
                  <input id="field-guardian" name="guardian" className={mInput} />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                Vi spør om fødselsdato og kjønn fordi vi må rapportere antall medlemmer etter alder og kjønn til
                støtteordninger. Du kan velge «Ønsker ikke å oppgi» på kjønn.
              </p>

              <div>
                <label htmlFor="field-comment" className={mLabel}>
                  Kommentar <span className="font-normal text-ink-soft">(valgfritt)</span>
                </label>
                <textarea id="field-comment" name="comment" rows={2} className={mInput} />
              </div>

              <label className="flex items-start gap-3 text-base leading-relaxed text-ink-soft">
                <input type="checkbox" name="terms" required className="mt-1 h-5 w-5 shrink-0 accent-[#9C3B44]" />
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
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-fig px-7 text-base font-semibold text-white transition-colors hover:bg-fig-dark sm:w-fit"
              >
                Meld meg inn
              </button>
            </SubmissionForm>

            <details className="mt-8 border-t border-line pt-5 text-base leading-relaxed text-ink-soft">
              <summary className="cursor-pointer font-semibold text-ink">Mer om medlemskapet</summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>Hver person er eget medlem. Foresatte melder inn barn.</li>
                <li>Medlemskapet gjelder kalenderåret, 1. januar–31. desember. Melder du deg inn fra 1. oktober, gjelder det ut neste år.</li>
                {free && <li>Medlemskap er gratis fram til {feeStartsText()}. Vi gir deg beskjed i god tid før du skal fornye.</li>}
                <li>Du velger selv om det skal fornyes automatisk 1. januar (kommer snart). Du får e-post 15 dager før, og kan når som helst si opp, i Vipps-appen eller på e-post.</li>
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
