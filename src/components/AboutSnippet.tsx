import Link from "next/link";

export default function AboutSnippet() {
  return (
    <section className="bg-cream-2 py-18">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-12 md:grid-cols-[0.85fr_1.15fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/om_oss_resim.png"
          alt="Mangfoldshuset Vestland"
          className="h-80 w-full rounded-[20px] bg-cream object-contain p-6"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
            Om oss
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium leading-tight">
            Mangfoldshuset Vestland
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Mangfoldshuset Vestland er en ideell og frivillig organisasjon som
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
