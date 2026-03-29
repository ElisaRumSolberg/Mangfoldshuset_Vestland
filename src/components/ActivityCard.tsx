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
  grad: string;
}) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-line bg-white transition-all hover:-translate-y-1.5 hover:shadow-xl">
      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="aspect-[4/3] w-full bg-black object-cover"
        />
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="warm-photo aspect-[4/3] w-full object-cover object-top"
        />
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
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="rounded-full bg-[#F7E9E9] px-2.5 py-1 text-xs font-bold text-fig">
            {category}
          </span>
          <span className="text-sm text-ink-soft">{date}</span>
        </div>
        <h3 className="font-serif text-lg">{title}</h3>
        <p className="mt-1.5 text-sm text-ink-soft">{place}</p>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
        {externalLink ? (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-block text-sm font-semibold text-green-dark"
          >
            Se innlegget →
          </a>
        ) : (
          <Link
            href="/aktiviteter"
            className="mt-3.5 inline-block text-sm font-semibold text-green-dark"
          >
            Les mer →
          </Link>
        )}
      </div>
    </article>
  );
}
