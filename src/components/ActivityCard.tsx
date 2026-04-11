import Link from "next/link";

export default function ActivityCard({
  title,
  category,
  date,
  place,
  desc,
  imageUrl,
  videoUrl,
  externalLink,
  banner,
  imageHref,
  featured,
  href,
  grad,
}: {
  title: string;
  category: string;
  date: string;
  place: string;
  desc: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  externalLink?: string | null;
  /** Vises som kort bånd i stedet for foto-plassholder (faste tilbud uten bilde). */
  banner?: string;
  /** Gjør bildet klikkbart (åpner plakaten i full størrelse). */
  imageHref?: string | null;
  /** Fremhevet av admin: vises øverst med egen etikett. */
  featured?: boolean;
  /** Detaljside for aktiviteten/tilbudet. */
  href?: string;
  grad: string;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[18px] border bg-white transition-all hover:-translate-y-1.5 hover:shadow-xl ${
        featured ? "border-fig/50 shadow-md" : "border-line"
      }`}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="aspect-[4/3] w-full bg-black object-cover"
        />
      ) : imageUrl && imageHref ? (
        <a
          href={imageHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Åpne plakat: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="aspect-[4/3] w-full object-cover object-top"
          />
        </a>
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="warm-photo aspect-[4/3] w-full object-cover object-top"
        />
      ) : banner ? (
        <div
          className={`flex h-28 items-center justify-center bg-gradient-to-br ${grad}`}
        >
          <span className="font-serif text-2xl text-white">{banner}</span>
        </div>
      ) : (
        <div
          className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${grad}`}
        >
          <span className="text-sm font-semibold text-white/85">
            [foto: {title}]
          </span>
        </div>
      )}
      <div className="p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
          {featured && (
            <span className="rounded-full bg-fig px-2.5 py-1 text-xs font-bold text-white">
              ★ Fremhevet
            </span>
          )}
          <span className="rounded-full bg-[#F7E9E9] px-2.5 py-1 text-xs font-bold text-fig">
            {category}
          </span>
          <span className="text-sm text-ink-soft">{date}</span>
        </div>
        <h3 className="font-serif text-lg">
          {href ? (
            <Link href={href} className="hover:text-fig">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="mt-1.5 text-sm text-ink-soft">{place}</p>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-green-dark">
          <Link href={href ?? "/aktiviteter"}>Les mer →</Link>
          {externalLink && (
            <a href={externalLink} target="_blank" rel="noopener noreferrer">
              Se innlegget →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
