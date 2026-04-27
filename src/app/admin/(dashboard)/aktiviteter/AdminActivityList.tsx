"use client";

import { useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  image_url: string | null;
  video_url: string | null;
  event_date: string;
  place: string;
  categories: string[] | null;
  featured: boolean | null;
};

const PAGE_SIZE = 10;

export default function AdminActivityList({
  items,
  deleteAction,
}: {
  items: Item[];
  deleteAction: (id: string, formData: FormData) => Promise<void>;
}) {
  const [start, setStart] = useState(0);

  if (!items.length) {
    return <p className="text-sm text-ink-soft">Ingen aktiviteter ennå.</p>;
  }

  const canPage = items.length > PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-xl border border-line bg-cream px-5 py-4"
        >
          <div className="flex items-center gap-4">
            {a.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image_url}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-serif text-base font-semibold text-ink">
                {a.featured && (
                  <span className="mr-1.5 text-fig" title="Fremhevet">
                    ★
                  </span>
                )}
                {a.title}
                {a.video_url ? " (video)" : ""}
              </p>
              <p className="text-sm text-ink-soft">
                {a.event_date} · {a.place} · {(a.categories ?? []).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/aktiviteter/${a.id}`}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Rediger
            </Link>
            <form
              action={deleteAction.bind(null, a.id)}
              onSubmit={(e) => {
                if (!window.confirm(`Slette «${a.title}»? Dette kan ikke angres.`)) {
                  e.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
              >
                Slett
              </button>
            </form>
          </div>
        </div>
      ))}

      {canPage && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setStart((v) => Math.max(0, v - PAGE_SIZE))}
            disabled={start === 0}
            aria-label="Forrige"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"
          >
            ←
          </button>
          <span className="text-xs text-ink-soft" aria-live="polite">
            {start + 1}–{Math.min(start + PAGE_SIZE, items.length)} av {items.length}
          </span>
          <button
            type="button"
            onClick={() =>
              setStart((v) => Math.min(v + PAGE_SIZE, Math.max(0, items.length - 1)))
            }
            disabled={start + PAGE_SIZE >= items.length}
            aria-label="Neste"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
