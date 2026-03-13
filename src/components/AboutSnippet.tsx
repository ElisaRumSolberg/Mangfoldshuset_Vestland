import Link from "next/link";
import OrganicPanel from "./OrganicPanel";

export default function AboutSnippet() {
  return (
    <section className="bg-cream-2 py-18">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-12 md:grid-cols-[0.85fr_1.15fr]">
        {/* Bytt ut med next/image (ekte foto) + className="warm-photo" fra globals.css når bildet er klart */}
        <OrganicPanel variant="fig" className="h-80 rounded-[20px]" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Om oss
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium leading-tight">
            Mangfoldhuset Vestlandet
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Mangfoldhuset Vestlandet er en ideell og frivillig organisasjon som
            skaper møteplasser på tvers av kultur, alder, tro og bakgrunn.
            Gjennom aktiviteter, dialog og frivillig engasjement ønsker vi å
            styrke tilhørighet, deltakelse og fellesskap.
          </p>
          <Link
            href="/om-oss"
            className="mt-6 inline-block rounded-full bg-fig px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
          >
            Les mer om oss
          </Link>
        </div>
      </div>
    </section>
  );
}
