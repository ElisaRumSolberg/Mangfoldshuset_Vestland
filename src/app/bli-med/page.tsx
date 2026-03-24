import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitApplication } from "./actions";

export const metadata: Metadata = {
  title: "Bli med – Mangfoldhuset Vestland",
  description:
    "Bli medlem, frivillig eller samarbeidspartner i Mangfoldhuset Vestland – eller del en idé.",
};

const MEMBER_FORM = "https://forms.gle/VjdDRAu9LJs8gfiy8";

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

function Contact() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className={label}>Navn</label>
        <input name="name" required className={input} />
      </div>
      <div>
        <label className={label}>E-post</label>
        <input type="email" name="email" required className={input} />
      </div>
      <div>
        <label className={label}>Telefon</label>
        <input name="phone" className={input} />
      </div>
    </div>
  );
}

export default async function BliMedPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string }>;
}) {
  const { sendt } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-20 pb-10">
        <h1 className="font-serif text-4xl font-medium">Bli med</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Mangfoldhuset er åpent for alle. Du kan bli medlem, bidra som
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
            <div className="flex flex-col gap-5">
              <a
                href={MEMBER_FORM}
                target="_blank"
                rel="noopener noreferrer"
                className={button}
              >
                Fyll ut medlemsskjema
              </a>
              <p className="text-sm text-ink-soft">
                Medlemskontingent betales med Vipps til{" "}
                <span className="font-semibold text-ink">#595791</span>.
                [Pris for medlemskap legges inn her.]
              </p>
            </div>
          </Section>

          <Section
            id="frivillig"
            title="Bli frivillig"
            intro="Fortell oss hva du liker å gjøre, så finner vi noe som passer deg."
          >
            {sendt === "frivillig" ? (
              <Thanks text="Vi har mottatt skjemaet ditt og tar kontakt." />
            ) : (
              <form action={submitApplication} className="flex flex-col gap-6">
                <input type="hidden" name="type" value="frivillig" />
                <Contact />
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
                  <label className={label}>
                    Har du erfaring, et talent eller noe du gjerne vil lære bort?
                  </label>
                  <textarea name="ferdigheter" rows={3} className={input} />
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
                        <input type="radio" name="type_bidrag" value={t} className="accent-[#9C3B44]" />
                        {t}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button type="submit" className={button}>
                  Send inn
                </button>
              </form>
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
              <form action={submitApplication} className="flex flex-col gap-5">
                <input type="hidden" name="type" value="ide" />
                <Contact />
                <div>
                  <label className={label}>Idé / forslag</label>
                  <textarea name="ide" required rows={4} className={input} />
                </div>
                <div>
                  <label className={label}>Hvem er aktiviteten for?</label>
                  <input name="malgruppe" className={input} />
                </div>
                <div>
                  <label className={label}>Trenger du hjelp til gjennomføring?</label>
                  <select name="hjelp" className={input} defaultValue="">
                    <option value="">Velg</option>
                    <option>Ja</option>
                    <option>Nei</option>
                    <option>Vet ikke ennå</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Kommentar</label>
                  <textarea name="kommentar" rows={2} className={input} />
                </div>
                <button type="submit" className={button}>
                  Del ideen
                </button>
              </form>
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
              <form action={submitApplication} className="flex flex-col gap-5">
                <input type="hidden" name="type" value="samarbeid" />
                <div>
                  <label className={label}>Organisasjon / virksomhet</label>
                  <input name="organisasjon" required className={input} />
                </div>
                <Contact />
                <div>
                  <label className={label}>Hva ønsker dere å samarbeide om?</label>
                  <input name="tema" className={input} />
                </div>
                <div>
                  <label className={label}>Melding</label>
                  <textarea name="melding" rows={4} className={input} />
                </div>
                <button type="submit" className={button}>
                  Send henvendelse
                </button>
              </form>
            )}
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
