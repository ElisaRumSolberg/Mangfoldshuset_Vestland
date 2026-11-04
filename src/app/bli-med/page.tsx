import SubmissionForm from "@/components/SubmissionForm";
import BliMedTabs from "@/components/BliMedTabs";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoneypotFields from "@/components/HoneypotFields";
import FamilyRows from "@/components/FamilyRows";
import { fetchSiteSettings } from "@/lib/site-settings";
import BirthDateInput from "@/components/BirthDateInput";
import { createAdminClient } from "@/lib/supabase/admin";
import { ageOn, feeForPerson } from "@/lib/membership-fee";
import { todayOslo } from "@/lib/recurring";
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
  ["1", "Fyll ut skjemaet", "Skriv inn deg selv og eventuelt flere i familien."],
  ["2", "Betal for hver person", "Hver person betaler sin egen kontingent."],
  ["3", "Du er medlem", "Vi aktiverer medlemskapet når betalingen er mottatt."],
] as const;

type ThanksPerson = { id: string; first_name: string; last_name: string; birth_date: string | null; paid_at: string | null };

/** Etter innmelding: ett kort per person, med eget beløp og egen betaling. */
function MemberThanks({ people, vippsLink }: { people: ThanksPerson[]; vippsLink?: string | null }) {
  const today = todayOslo();
  return (
    <div>
      <div className="rounded-xl bg-[#EAF0E9] px-6 py-6 text-center">
        <p className="font-serif text-2xl text-green-dark">Takk for at du melder deg inn!</p>
        <p className="mt-1 text-sm text-ink-soft">
          {people.length > 1
            ? "Hver person er eget medlem og betaler for seg. Medlemskapet aktiveres når betalingen er mottatt."
            : "Medlemskapet aktiveres når betalingen er mottatt."}
        </p>
      </div>
      <ul className="mt-5 flex flex-col gap-3">
        {people.map((p) => {
          const fee = feeForPerson(p.birth_date, today);
          const child = !!p.birth_date && ageOn(p.birth_date, today) < 16;
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream px-5 py-4">
              <div>
                <p className="font-semibold text-ink">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-sm text-ink-soft">
                  {child ? "0–15 år" : "Fra og med 16 år"} · <span className="font-semibold text-ink">{fee} kr</span> per år
                </p>
              </div>
              {p.paid_at ? (
                <span className="rounded-full bg-[#EAF0E9] px-4 py-2 text-sm font-semibold text-green-dark">Betalt</span>
              ) : vippsLink ? (
                <VippsButton href={vippsLink} />
              ) : (
                <span className="rounded-full bg-[#F5EAD5] px-4 py-2 text-sm font-semibold text-[#93701F]">Ikke betalt</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-sm leading-relaxed text-ink-soft">
        Betal med Vipps til <span className="font-semibold text-ink">#595791</span> eller til bankkonto{" "}
        <span className="font-semibold text-ink">3207 31 01688</span>, og skriv navnet på den du betaler for.
        Betaling direkte på nettsiden kommer snart.
      </p>
    </div>
  );
}

async function loadHousehold(id: string | undefined): Promise<ThanksPerson[]> {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const { data } = await createAdminClient()
      .from("members")
      .select("id, first_name, last_name, birth_date, paid_at")
      .eq("household_id", id)
      .order("created_at", { ascending: true });
    return (data ?? []) as ThanksPerson[];
  } catch {
    return [];
  }
}

export default async function BliMedPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string; feil?: string; h?: string }>;
}) {
  const { sendt, feil, h } = await searchParams;
  const settings = await fetchSiteSettings();
  const vippsLink = settings.vipps_link;
  const household = sendt === "medlem" ? await loadHousehold(h) : [];

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
            intro="Som medlem er du med på å gjøre Mangfoldshuset Vestland sterkere og på å bestemme retningen."
          >
            {sendt === "medlem" ? (
              household.length > 0 ? (
                <MemberThanks people={household} vippsLink={vippsLink} />
              ) : (
                <Thanks text="Takk for at du melder deg inn! Betal kontingenten med Vipps til #595791, så aktiverer vi medlemskapet ditt. Melder du inn flere, betaler hver person for seg." vippsLink={vippsLink} />
              )
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
                <p className="mt-1 text-sm text-ink-soft">Per person, per år. Hver person betaler for seg.</p>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-[#F7E9E9] px-6 py-5">
                    <dt className="text-sm font-semibold text-fig">0–15 år</dt>
                    <dd className="mt-1 font-serif text-4xl text-ink">25 kr</dd>
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

                  <details className="rounded-lg border border-line bg-cream px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-ink">
                      Vil du melde inn flere i familien? Legg dem til her (opptil 5 personer til)
                    </summary>
                    <FamilyRows inputClass={input} />
                  </details>

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
