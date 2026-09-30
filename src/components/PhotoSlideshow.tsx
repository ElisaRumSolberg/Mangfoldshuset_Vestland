"use client";

import { useEffect, useState } from "react";

/** Bytter bilde automatisk med en myk overtoning. Ett bilde vises statisk. */
export default function PhotoSlideshow({
  images,
  alt = "",
  className = "",
}: {
  images: string[];
  alt?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(id);
  }, [images.length, paused]);

  if (!images.length) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          aria-hidden={i !== index}
          src={src}
          alt={alt}
          className={`warm-photo absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && <button type="button" aria-pressed={paused} onClick={() => setPaused(p => !p)} className="absolute bottom-3 right-3 z-10 rounded-full bg-white px-3 py-3 text-xs text-ink">{paused ? "Start bildevisning" : "Pause bildevisning"}</button>}
    </div>
  );
}
