"use client";

import { useState } from "react";
import ActivityCard from "./ActivityCard";

const grads = [
  "from-[#6E8B67] to-[#3F5A3E]",
  "from-[#C08A5C] to-[#9C3B44]",
  "from-[#9CA86B] to-[#4B6B4A]",
];

type Item = Omit<Parameters<typeof ActivityCard>[0], "grad"> & {
  id?: string;
  iso?: string;
};

export default function ActivityGrid({
  items,
  pageSize = 3,
  emptyText,
}: {
  items: Item[];
  pageSize?: number;
  emptyText: string;
}) {
  const [start, setStart] = useState(0);

  if (!items.length) {
    return <p className="mt-4 text-sm text-ink-soft">{emptyText}</p>;
  }

  const canPage = items.length > pageSize;
  const visible = items.slice(start, start + pageSize);

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {visible.map((ev, i) => (
          <ActivityCard
            key={ev.id ?? `${ev.title}-${ev.iso ?? ev.date}`}
            {...ev}
            grad={grads[(start + i) % grads.length]}
          />
        ))}
      </div>
      {canPage && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setStart((v) => Math.max(0, v - pageSize))}
            disabled={start === 0}
            aria-label="Forrige"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"
          >
            ←
          </button>
          <span className="text-xs text-ink-soft" aria-live="polite">
            {start + 1}–{Math.min(start + pageSize, items.length)} av {items.length}
          </span>
          <button
            type="button"
            onClick={() =>
              setStart((v) => Math.min(v + pageSize, Math.max(0, items.length - 1)))
            }
            disabled={start + pageSize >= items.length}
            aria-label="Neste"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
