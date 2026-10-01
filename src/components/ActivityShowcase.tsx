"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type ShowcaseSlide = {
  title: string;
  image: string;
  href: string;
  /** Afiser vises i sin helhet (object-contain); ekte foto fyller ruten (object-cover). */
  isPoster?: boolean;
};

/** Bildekarusell med tittel og "Mer"-knapp per bilde, hentet fra ekte aktiviteter. */
export default function ActivityShowcase({
  slides,
  className = "",
}: {
  slides: ShowcaseSlide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  if (!slides.length) return null;

  const count = slides.length;
  const arrow =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-ink shadow-md transition-colors hover:bg-white";

  return (
    <div className={`group relative overflow-hidden bg-ink ${className}`}>
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.image + i}
          aria-hidden={i !== index}
          src={slide.image}
          alt={slide.title}
          className={`warm-photo absolute inset-0 h-full w-full transition-opacity duration-1000 ${
            slide.isPoster ? "object-contain" : "object-cover"
          } ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {slides.map((slide, i) => (
        <div
          key={slide.href + i}
          inert={i !== index}
          aria-hidden={i !== index}
          className={`absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 p-6 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <p className="font-serif text-xl font-medium leading-tight text-white drop-shadow-sm">
            {slide.title}
          </p>
          <Link
            href={slide.href}
            className="rounded-full bg-white/90 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            Mer
          </Link>
        </div>
      ))}

      {count > 1 && (
        <>
          <button type="button" onClick={() => setPaused(p => !p)} aria-pressed={paused} className="absolute left-3 top-3 z-20 rounded-full bg-white px-3 py-3 text-xs text-ink">
            {paused ? "Start bildevisning" : "Pause bildevisning"}
          </button>
          <button
            type="button"
            aria-label="Forrige bilde"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className={`${arrow} left-3`}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Neste bilde"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className={`${arrow} right-3`}
          >
            →
          </button>
          <div className="absolute right-4 top-4 z-10 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Vis bilde ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
