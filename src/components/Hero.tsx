import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#3A3733] to-[#2E2B27]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(156,59,68,0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(75,107,74,0.35), transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <div>
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#EFE7D6]">
            En del av Mangfoldhuset-nettverket
          </span>
          <h1 className="max-w-xl font-serif text-4xl font-medium leading-[1.1] text-white md:text-5xl">
            Et varmt fellesskap i Vestland
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#D8D2C4]">
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

        <div className="flex h-80 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#5B7A57] to-[#3F5A3E] text-center md:h-[420px]">
          <div className="px-6 text-white/75">
            <p className="text-sm font-semibold">
              Ekte bilde fra en Vestlandet-aktivitet
            </p>
            <p className="mt-1 text-xs opacity-75">
              [plassholder – erstattes med foto]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
