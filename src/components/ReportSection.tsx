import Link from "next/link";
import PhotoGallery from "./PhotoGallery";

const CONTACT_EMAIL = "ali.mangfoldhuset@gmail.com";

/** «Slik gikk det»: deltakere, oppsummering, tilbakemeldinger og bilder. Tomt hvis alt mangler. */
export default function ReportSection({
  heading,
  participants,
  participantsLabel,
  summary,
  feedback,
  photos,
  title,
}: {
  heading: string;
  participants: number | null;
  participantsLabel: string;
  summary: string | null;
  feedback: string | null;
  photos: string[];
  title: string;
}) {
  const quotes = (feedback ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);
  const hasReport = participants !== null || !!summary || quotes.length > 0;

  if (!hasReport && photos.length === 0) return null;

  return (
    <section className="mt-14 border-t border-line pt-10">
      {hasReport && (
        <>
          <h2 className="font-serif text-2xl font-medium">{heading}</h2>

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr]">
            {participants !== null && (
              <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full bg-green text-white">
                <span className="font-serif text-3xl font-bold">{participants}</span>
                <span className="mt-0.5 px-3 text-center text-[11px] font-semibold leading-tight">
                  {participantsLabel}
                </span>
              </div>
            )}
            <div>
              {summary && (
                <p className="whitespace-pre-line text-base leading-relaxed text-ink-soft">
                  {summary}
                </p>
              )}
              {quotes.length > 0 && (
                <ul className="mt-5 flex flex-col gap-3">
                  {quotes.map((q, i) => (
                    <li
                      key={i}
                      className="rounded-xl border-l-4 border-fig bg-white px-5 py-3 font-serif text-base italic text-ink"
                    >
                      «{q}»
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {photos.length > 0 && (
        <div className={hasReport ? "mt-12" : ""}>
          <h2 className="font-serif text-2xl font-medium">Bilder</h2>
          <div className="mt-6">
            <PhotoGallery photos={photos} title={title} />
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-soft">
            Vi publiserer bare bilder med samtykke. Ønsker du at et bilde av deg eller barnet ditt
            fjernes, send en e-post til{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            , så fjerner vi det raskt. Les mer i{" "}
            <Link className="underline" href="/personvern">
              personvernerklæringen
            </Link>
            .
          </p>
        </div>
      )}
    </section>
  );
}
