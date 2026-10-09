import Link from "next/link";
import OrganicPanel from "./OrganicPanel";
import PhotoSlideshow from "./PhotoSlideshow";
import ActivityShowcase, { type ShowcaseSlide } from "./ActivityShowcase";

export default function Hero({
  images = [],
  slides = [],
  stats,
}: {
  images?: string[];
  slides?: ShowcaseSlide[];
  stats?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#5F7A56] to-[#4D6245]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(156,59,68,0.28), transparent 45%), radial-gradient(circle at 15% 85%, rgba(233,222,199,0.18), transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 md:grid-cols-[1fr_1fr] md:py-16">
        <div>
          <p className="mb-5 text-2xl font-bold uppercase tracking-[0.08em] md:text-3xl">
            <span className="text-white">Mangfoldshuset</span>{" "}
            <span style={{ color: "#F2D898" }}>Vestland</span>
          </p>
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
            En del av Mangfoldshuset-nettverket
          </span>
          <h1 className="max-w-xl font-serif text-4xl font-medium leading-[1.1] text-white md:text-5xl">
            Et varmt fellesskap i Vestland
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/95">
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
          {stats}
        </div>

        {slides.length ? (
          <ActivityShowcase
            slides={slides}
            className="h-96 rounded-3xl border border-white/10 md:h-[500px]"
          />
        ) : images.length ? (
          <PhotoSlideshow
            images={images}
            className="h-96 rounded-3xl border border-white/10 md:h-[500px]"
          />
        ) : (
          <OrganicPanel variant="fig" className="h-96 md:h-[500px]" />
        )}
      </div>
    </section>
  );
}
