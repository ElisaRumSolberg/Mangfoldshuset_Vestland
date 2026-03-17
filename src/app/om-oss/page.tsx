import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganicPanel from "@/components/OrganicPanel";

export const metadata: Metadata = {
  title: "Om oss – Mangfoldhuset Vestland",
  description:
    "Mangfoldhuset Vestland er en ideell frivillig organisasjon og en del av det landsdekkende Mangfoldhuset-nettverket.",
};

const verdier = [
  "Inkludering",
  "Dialog",
  "Fellesskap",
  "Demokrati",
  "Menneskerettigheter",
  "Likestilling",
  "Ytringsfrihet",
];

const malgrupper = ["Barn", "Ungdom", "Voksne", "Seniorer"];

const grupper = [
  {
    title: "Barn og familie",
    desc: "Aktiviteter og samlinger for barnefamilier på tvers av bakgrunn.",
  },
  {
    title: "Kvinner",
    desc: "Et trygt møtested for kvinner i lokalmiljøet.",
  },
  {
    title: "Kultur",
    desc: "Kulturkvelder, mat og markeringer som viser mangfoldet i Vestland.",
  },
  {
    title: "Språk og dialog",
    desc: "Språkkafé og samtalegrupper for å styrke norskferdigheter og fellesskap.",
  },
  {
    title: "Tur og aktivitet",
    desc: "Turer og fysisk aktivitet i naturen, sammen med andre.",
  },
];

const formal = [
  "Fremme sosial utjevning og sosial deltakelse",
  "Skape lokale møteplasser i Vestland",
  "Styrke enkeltmenneskers medansvar og samfunnsengasjement",
  "Bidra til kunnskapsformidling gjennom seminarer og kurs",
  "Gjennomføre aktiviteter for barn og ungdom",
  "Samle mennesker med ulike bakgrunner",
  "Styrke tilhørighet og livskvalitet",
];

export default function OmOssPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hvem er vi */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
                Om oss
              </p>
              <h1 className="mt-2 font-serif text-4xl font-medium leading-tight">
                Hvem er vi?
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                Mangfoldhuset Vestland er en ideell frivillig organisasjon og
                en del av det landsdekkende Mangfoldhuset-nettverket. Vi
                skaper møteplasser der mennesker med ulike bakgrunner,
                kulturer, alder og tro kan møtes, delta og bidra – med mål om
                bedre livskvalitet og sterkere tilhørighet til lokalsamfunnet
                i Vestland.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
                Vi er en åpen organisasjon for alle som ønsker å være med.
                Mangfoldhuset flagger demokrati, menneskerettigheter,
                likestilling og ytringsfrihet, og er verken en religiøs eller
                etnisk organisasjon.
              </p>
            </div>
            <OrganicPanel variant="green" className="h-72 md:h-96" />
          </div>
        </section>

        {/* Vårt formål */}
        <section className="bg-cream-2 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
              Formål
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium">
              Vårt formål
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formal.map((f) => (
                <div
                  key={f}
                  className="rounded-xl border border-line bg-cream px-5 py-4 text-sm leading-relaxed text-ink-soft"
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Våre verdier */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Verdier
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium">
            Våre verdier
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {verdier.map((v) => (
              <span
                key={v}
                className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink"
              >
                {v}
              </span>
            ))}
          </div>
        </section>

        {/* Kimlere hitap ediyoruz */}
        <section className="bg-cream-2 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
              For alle
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium">
              Hvem er aktivitetene for?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-ink-soft">
              Aktivitetene i Mangfoldhuset Vestland er åpne for alle
              aldersgrupper.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {malgrupper.map((m) => (
                <div
                  key={m}
                  className="rounded-xl border border-line bg-cream py-6 text-center font-serif text-lg"
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Våre grupper / utvalg */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Utvalg
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium">
            Våre grupper
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            Innenfor foreningens rammer og vedtekter står hver gruppe fritt
            til å planlegge og gjennomføre egne aktiviteter. Det er fritt for
            alle å velge hvilken gruppe man vil være aktiv i.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {grupper.map((g) => (
              <div
                key={g.title}
                className="rounded-[18px] border border-line bg-white p-6"
              >
                <h3 className="font-serif text-lg">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Vår historie */}
        <section className="bg-cream-2 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
              Historie
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium">
              Vår historie
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
              [Her legges Mangfoldhuset Vestlands lokale historie inn –
              stiftelsesår, hvordan avdelingen i Bergen/Vestland startet, og
              viktige milepæler underveis.]
            </p>
          </div>
        </section>

        {/* Mangfoldshuset i Norge */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Nettverk
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium">
            Mangfoldhuset i Norge
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            Mangfoldhuset er landsdekkende, med hovedsete i Oslo og
            avdelinger i blant annet Drammen, Trondheim, Moss, Stavanger,
            Kristiansand, Vestfold og Vestland. Hver avdeling er selvstendig
            når det gjelder økonomi og styring, men deler samme formål og
            demokratiske struktur.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
