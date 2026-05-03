import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganicPanel from "@/components/OrganicPanel";
import PhotoSlideshow from "@/components/PhotoSlideshow";
import ImpactCounters from "@/components/ImpactCounters";
import { fetchSiteSettings } from "@/lib/site-settings";

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

const malgrupper = ["Barn", "Ungdom", "Voksne", "Seniorer", "Familie"];

const grupper = [
  {
    title: "Barn og ungdom",
    desc: "Aktiviteter og fritidstilbud som engasjerer barn og ungdom i lokalmiljøet.",
    grad: "from-[#9CA86B] to-[#4B6B4A]",
  },
  {
    title: "Aktivitet for familie",
    desc: "Felles aktiviteter og opplevelser der hele familien kan delta sammen.",
    grad: "from-[#C08A5C] to-[#9C3B44]",
  },
  {
    title: "Kvinner",
    desc: "Et trygt møtested for kvinner i lokalmiljøet.",
    grad: "from-[#C08A5C] to-[#9C3B44]",
  },
  {
    title: "Menn",
    desc: "Et fellesskap og møtested for menn i lokalmiljøet.",
    grad: "from-[#6E8B67] to-[#3F5A3E]",
  },
  {
    title: "Kultur",
    desc: "Kulturkvelder, mat og markeringer som viser mangfoldet i Vestland.",
    grad: "from-[#9CA86B] to-[#4B6B4A]",
  },
  {
    title: "Språk og dialog",
    desc: "Språkkafé og samtalegrupper for å styrke norskferdigheter og fellesskap.",
    grad: "from-[#6E8B67] to-[#3F5A3E]",
  },
  {
    title: "Seniorer",
    desc: "Sosiale samlinger og arrangementer for eldre, som vår årlige seniordag.",
    grad: "from-[#C08A5C] to-[#9C3B44]",
  },
];

const nettverkTints = [
  { bg: "#F7E9E9", text: "#9C3B44" },
  { bg: "#EAF0E9", text: "#3A5439" },
  { bg: "#EFE7D6", text: "#7A6A3F" },
];

const nettverk = [
  { name: "Oslo", href: "https://mangfoldhuset.no/" },
  { name: "Østfold", href: "https://www.ostfoldmh.no/" },
  { name: "Drammen", href: "https://www.buskerud.mangfoldhuset.no/" },
  { name: "Trøndelag", href: "https://trondelag.mangfoldhuset.no/" },
  { name: "Rogaland", href: "https://www.facebook.com/mangfoldshusetrogaland/?_rdr" },
  { name: "Agder", href: "https://www.facebook.com/mangfoldshuset.agder" },
  { name: "Vestfold", href: "https://www.facebook.com/MangfoldhusetVestfold" },
];

const tints = [
  { bg: "#F7E9E9", text: "#9C3B44" },
  { bg: "#EAF0E9", text: "#3A5439" },
];

const solidGrupper = [
  { bg: "#9C3B44" },
  { bg: "#4B6B4A" },
  { bg: "#C08A5C" },
  { bg: "#3F5A3E" },
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

export default async function OmOssPage() {
  const settings = await fetchSiteSettings();

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
            {settings.om_oss_images.length ? (
              <PhotoSlideshow
                images={settings.om_oss_images}
                className="h-72 rounded-3xl border border-white/10 md:h-96"
              />
            ) : (
              <OrganicPanel variant="green" className="h-72 md:h-96" />
            )}
          </div>
        </section>

        {/* Misjon og visjon */}
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className="rounded-[18px] border-2 p-8"
                style={{ backgroundColor: "#F7E9E9", borderColor: "#9C3B44" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-fig">
                  Misjon
                </p>
                <p className="mt-3 text-lg leading-relaxed text-ink">
                  Vi skaper trygge møteplasser der mennesker med ulike
                  bakgrunner kan bygge relasjoner, lære av hverandre og delta
                  aktivt i lokalsamfunnet.
                </p>
              </div>
              <div
                className="rounded-[18px] border-2 p-8"
                style={{ backgroundColor: "#EAF0E9", borderColor: "#3A5439" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
                  Visjon
                </p>
                <p className="mt-3 text-lg leading-relaxed text-ink">
                  Et Vestland der mangfold oppleves som en styrke, og der
                  alle – uansett bakgrunn – føler tilhørighet og likeverd.
                </p>
              </div>
            </div>
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
              {formal.map((f, i) => {
                const tint = tints[i % tints.length];
                return (
                  <div
                    key={f}
                    className="flex items-start gap-3.5 rounded-xl border border-line bg-cream px-5 py-4"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: tint.bg, color: tint.text }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-ink-soft">{f}</p>
                  </div>
                );
              })}
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
            {verdier.map((v, i) => {
              const tint = tints[i % tints.length];
              return (
                <span
                  key={v}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: tint.bg, color: tint.text }}
                >
                  {v}
                </span>
              );
            })}
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
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {malgrupper.map((m, i) => (
                <div
                  key={m}
                  className="rounded-xl py-6 text-center font-serif text-lg text-white"
                  style={{ backgroundColor: solidGrupper[i % solidGrupper.length].bg }}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Våre grupper (målgrupper) */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Målgrupper
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
                className="overflow-hidden rounded-[18px] border border-line bg-white"
              >
                <div className={`h-2 bg-gradient-to-r ${g.grad}`} />
                <div className="p-6">
                  <h3 className="font-serif text-lg">{g.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {g.desc}
                  </p>
                </div>
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
          <div className="mt-6 flex flex-wrap gap-3">
            {nettverk.map((n, i) => {
              const tint = nettverkTints[i % nettverkTints.length];
              return (
                <a
                  key={n.name}
                  href={n.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: tint.bg, color: tint.text }}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                >
                  {n.name} →
                </a>
              );
            })}
          </div>
        </section>

        {/* Bli med oss */}
        <section className="bg-cream py-20 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="font-serif text-3xl font-medium md:text-4xl">
              Bli med oss!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Er du interessert i å bidra til et mer inkluderende og
              mangfoldig samfunn? Bli medlem eller frivillig i Mangfoldhuset
              Vestland!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/bli-med"
                className="rounded-full bg-fig px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
              >
                Bli medlem
              </Link>
              <Link
                href="/kontakt"
                className="rounded-full border border-ink px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-cream"
              >
                Kontakt oss
              </Link>
            </div>
          </div>
        </section>

        <ImpactCounters />
      </main>
      <Footer />
    </>
  );
}
