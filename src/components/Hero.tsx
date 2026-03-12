import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[600px] items-center overflow-hidden md:min-h-[680px]">
      {/* Bakgrunnsbilde: erstatt med next/image (fill, object-cover) når ekte foto er klart */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5B7A57] via-[#3F5A3E] to-[#2E2B27]" />

      {/* Mørk overlay for lesbarhet over bildet */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(20,19,17,0.82) 0%, rgba(20,19,17,0.55) 45%, rgba(20,19,17,0.25) 100%), linear-gradient(0deg, rgba(20,19,17,0.5) 0%, transparent 40%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <p className="mb-5 text-2xl font-bold uppercase tracking-[0.08em] md:text-3xl">
            <span className="text-white">Mangfoldshuset</span>{" "}
            <span className="text-fig">Vestland</span>
          </p>
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#EFE7D6]">
            En del av Mangfoldhuset-nettverket
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] text-white md:text-5xl">
            Et varmt fellesskap i Vestland
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#EAE5D9]">
            Vi skaper møteplasser der mennesker med ulike bakgrunner kan møtes,
            delta, lære og bidra.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/aktiviteter"
              className="rounded-full bg-fig px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
            >
              Se aktiviteter
            </Link>
            <Link
              href="/bli-med"
              className="rounded-full border border-white/50 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              Bli med
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
