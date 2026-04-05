"use client";

import { useEffect, useState } from "react";

export type MediaImage = string | { src: string; contain?: boolean };

function toImage(img: MediaImage): { src: string; contain: boolean } {
  return typeof img === "string" ? { src: img, contain: false } : { src: img.src, contain: img.contain ?? false };
}

/**
 * Bilder til en aktivitetsside: automatisk bildekarusell øverst (med manuell
 * pil-navigasjon), og et fullskjerm lightbox for å bla gjennom alle bildene.
 * Plakater (contain: true) vises i sin helhet uten beskjæring; vanlige foto
 * fyller ruten fint (object-cover) slik de gjorde før.
 */
export default function ActivityMedia({
  images,
  title,
  className = "",
}: {
  images: MediaImage[];
  title: string;
  className?: string;
}) {
  const items = images.map(toImage);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (count < 2 || open) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(id);
  }, [count, open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, count]);

  if (!count) return null;

  const arrow =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-ink shadow-md transition-colors hover:bg-white";

  return (
    <>
      <div className={`group relative overflow-hidden bg-cream-2 ${className}`}>
        {items.map(({ src, contain }, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt={`${title} – bilde ${i + 1}`}
            onClick={() => setOpen(true)}
            className={`warm-photo absolute inset-0 h-full w-full cursor-pointer transition-opacity duration-1000 ${
              contain ? "object-contain" : "object-cover"
            } ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Forrige bilde"
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              className={`${arrow} left-3 opacity-0 transition-opacity group-hover:opacity-100`}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Neste bilde"
              onClick={() => setIndex((i) => (i + 1) % count)}
              className={`${arrow} right-3 opacity-0 transition-opacity group-hover:opacity-100`}
            >
              →
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Vis bilde ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i === index ? "w-4 bg-white" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} – bildevisning`}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink"
          >
            Lukk ✕
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Forrige bilde"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + count) % count);
                }}
                className={`${arrow} left-4`}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Neste bilde"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % count);
                }}
                className={`${arrow} right-4`}
              >
                →
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={items[index].src}
            alt={`${title} – bilde ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-lg object-contain"
          />
          {count > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {index + 1} av {count}
            </p>
          )}
        </div>
      )}
    </>
  );
}
