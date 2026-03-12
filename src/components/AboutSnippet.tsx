import Link from "next/link";

export default function AboutSnippet() {
  return (
    <section className="bg-cream-2 py-18">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-12 md:grid-cols-[0.85fr_1.15fr]">
        <div className="flex h-80 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#B9614F] to-[#8B3A3C] text-center">
          <span className="text-sm font-semibold text-white/80">
            [foto: fellesskap]
          </span>
        </div>
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
