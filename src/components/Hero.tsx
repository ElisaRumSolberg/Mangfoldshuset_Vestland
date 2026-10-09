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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#586B4F] to-[#48583F]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(156,59,68,0.28), transparent 45%), radial-gradient(circle at 15% 85%, rgba(233,222,199,0.18), transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-x-14 gap-y-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-28 xl:max-w-none xl:grid-cols-[13rem_1.1fr_0.9fr] xl:gap-x-12 xl:px-6 2xl:max-w-[96rem]">
        <div className="md:col-start-1 md:row-start-1 xl:col-start-2">
          <p className="mb-5 text-2xl font-bold uppercase tracking-[0.08em] md:text-3xl xl:whitespace-nowrap xl:text-2xl min-[1440px]:text-3xl">
            <span className="text-white">Mangfoldshuset</span>{" "}
            <span style={{ color: "#D9B26B" }}>Vestland</span>
          </p>
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#EFE7D6]">
            En del av Mangfoldshuset-nettverket
          </span>
          <h1 className="max-w-xl font-serif text-4xl font-medium leading-[1.1] text-white md:text-5xl xl:text-6xl">
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

        {stats && (
          <div className="md:col-start-1 md:row-start-2 xl:col-start-1 xl:row-start-1">{stats}</div>
        )}

        {slides.length ? (
          <ActivityShowcase
            slides={slides}
            className="h-80 rounded-3xl border border-white/10 md:h-[420px] md:col-start-2 md:row-start-1 md:row-span-2 xl:col-start-3 xl:row-span-1"
          />
        ) : images.length ? (
          <PhotoSlideshow
            images={images}
            className="h-80 rounded-3xl border border-white/10 md:h-[420px] md:col-start-2 md:row-start-1 md:row-span-2 xl:col-start-3 xl:row-span-1"
          />
        ) : (
          <OrganicPanel variant="fig" className="h-80 md:h-[420px] md:col-start-2 md:row-start-1 md:row-span-2 xl:col-start-3 xl:row-span-1" />
        )}
      </div>
    </section>
  );
}
