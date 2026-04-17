"use client";

import { useEffect, useState } from "react";

export default function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = photos.length;

  useEffect(() => {
    if (open === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + count) % count));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % count));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, count]);

  const nav =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-md transition-colors hover:bg-white";

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Åpne bilde ${i + 1} av ${count}`}
              className="block w-full overflow-hidden rounded-xl border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} – bilde ${i + 1}`}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} – bildevisning`}
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
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
                  setOpen((i) => (i === null ? i : (i - 1 + count) % count));
                }}
                className={`${nav} left-4`}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Neste bilde"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i + 1) % count));
                }}
                className={`${nav} right-4`}
              >
                →
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[open]}
            alt={`${title} – bilde ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-lg object-contain"
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {open + 1} av {count}
          </p>
        </div>
      )}
    </>
  );
}
