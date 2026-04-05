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

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.image + i}
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
          className={`absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 p-6 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <h3 className="font-serif text-xl font-medium leading-tight text-white drop-shadow-sm">
            {slide.title}
          </h3>
          <Link
            href={slide.href}
            className="rounded-full bg-white/90 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            Mer
          </Link>
        </div>
      ))}

      {slides.length > 1 && (
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
      )}
    </div>
  );
}
