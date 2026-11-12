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
    <section className="relative overflow-hidden bg-green">
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 md:grid-cols-[1fr_1fr] md:py-16">
        <div>
          <h1 className="max-w-xl text-balance font-serif text-4xl font-medium leading-[1.1] text-white md:text-5xl">
            Et varmt fellesskap i Vestland
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/95">
            Vi skaper møteplasser der mennesker med ulike bakgrunner kan møtes,
            delta, lære og bidra.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/aktiviteter"
              className="rounded-lg bg-fig px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-fig-dark"
            >
              Se aktiviteter
            </Link>
            <Link
              href="/bli-med"
              className="rounded-lg border border-white/60 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Bli med
            </Link>
          </div>
          {stats}
        </div>

        {slides.length ? (
          <ActivityShowcase
            slides={slides}
            className="h-96 rounded-xl border border-white/10 md:h-[500px]"
          />
        ) : images.length ? (
          <PhotoSlideshow
            images={images}
            className="h-96 rounded-xl border border-white/10 md:h-[500px]"
          />
        ) : (
          <OrganicPanel variant="fig" className="h-96 md:h-[500px]" />
        )}
      </div>
    </section>
  );
}
