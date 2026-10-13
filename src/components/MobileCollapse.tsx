"use client";

import { useState, type ReactNode } from "react";

/**
 * Viser alle elementer på store skjermer, men bare de første på mobil, med en knapp for å
 * vise resten. Alt ligger i siden hele tiden (skjult med CSS), så innholdet er uendret for
 * søkemotorer og skjermlesere.
 */
export default function MobileCollapse({
  items,
  visibleOnMobile = 2,
  className = "",
  moreLabel = "Vis flere",
  lessLabel = "Vis færre",
}: {
  items: ReactNode[];
  visibleOnMobile?: number;
  className?: string;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const extra = items.length - visibleOnMobile;

  return (
    <>
      <ul className={className}>
        {items.map((item, i) => (
          <li
            key={i}
            className={i >= visibleOnMobile && !open ? "hidden md:contents" : "contents"}
          >
            {item}
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-ink px-6 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream md:hidden"
        >
          {open ? lessLabel : `${moreLabel} (${extra})`}
        </button>
      )}
    </>
  );
}
