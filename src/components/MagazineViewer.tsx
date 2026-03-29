"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageFlip as PageFlipType } from "page-flip";

const PAGE_RATIO = 595.5 / 842.25; // A4 stående
const RENDER_WIDTH = 1000; // px per side ved opptegning

export type Issue = {
  id: string;
  title: string;
  issue_date: string;
  cover_image_url: string | null;
  pdf_url: string;
};

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
}

export default function MagazineViewer({ issues }: { issues: Issue[] }) {
  const [selectedId, setSelectedId] = useState(issues[0].id);
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
      <section aria-label={selected.title}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-fig">
              {selected.id === issues[0].id ? "Siste utgave" : "Fra arkivet"}
            </p>
            <h2 className="font-serif text-2xl">{selected.title}</h2>
            <p className="text-sm capitalize text-ink-soft">{formatMonth(selected.issue_date)}</p>
          </div>
          <a
            href={selected.pdf_url}
            download
            className="rounded-full border border-ink px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Last ned PDF
          </a>
        </div>
        <Book key={selected.pdf_url} pdfUrl={selected.pdf_url} />
      </section>

      <aside aria-label="Arkiv">
        <h2 className="font-serif text-2xl">Arkiv</h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-3">
          {issues.map((i, idx) => {
            const active = i.id === selected.id;
            return (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(i.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
                    active
                      ? "border-fig bg-white shadow-sm"
                      : "border-line bg-white/60 hover:border-fig/50 hover:bg-white"
                  }`}
                >
                  {i.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.cover_image_url}
                      alt=""
                      className="aspect-[3/4] w-16 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-16 shrink-0 rounded-lg bg-gradient-to-br from-[#6E8B67] to-[#3F5A3E]" />
                  )}
                  <span className="min-w-0">
                    {idx === 0 && (
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-fig">
                        Nyeste
                      </span>
                    )}
                    <span className="block truncate text-sm font-semibold text-ink">
                      {i.title}
                    </span>
                    <span className="block text-xs capitalize text-ink-soft">
                      {formatMonth(i.issue_date)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

function Book({ pdfUrl }: { pdfUrl: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlipType | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [availW, setAvailW] = useState(0);
  const [availH, setAvailH] = useState(0);

  // Mål plassen boken har (bredde fra rammen, høyde fra vinduet).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    function measure() {
      setAvailW(frame!.clientWidth);
      setAvailH(Math.max(360, window.innerHeight - 260));
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const spread = availW >= 640;
  const pageW = availW ? Math.min(availH * PAGE_RATIO, spread ? availW / 2 : availW) : 0;
  const bookW = Math.floor(spread ? pageW * 2 : pageW);
  const bookH = Math.floor(pageW / PAGE_RATIO);

  // Last PDF og tegn hver side til et bilde.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        const pdf = await pdfjs.getDocument({ url: pdfUrl }).promise;
        if (cancelled) return;
        setTotal(pdf.numPages);
        const out: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i);
          const base = p.getViewport({ scale: 1 });
          const viewport = p.getViewport({ scale: RENDER_WIDTH / base.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          await p.render({ canvas, viewport }).promise;
          out.push(canvas.toDataURL("image/jpeg", 0.85));
          if (cancelled) return;
          setProgress(i);
        }
        setImages(out);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Start sidevenderen når bildene er klare (og på nytt ved bytte mellom oppslag/enkeltside).
  const ready = images.length > 0 && bookW > 0;
  useEffect(() => {
    if (!ready || !bookRef.current) return;
    const el = bookRef.current;
    let flip: PageFlipType | null = null;
    let disposed = false;

    (async () => {
      const { PageFlip } = await import("page-flip");
      if (disposed) return;
      flip = new PageFlip(el, {
        width: 500,
        height: Math.round(500 / PAGE_RATIO),
        size: "stretch",
        minWidth: 200,
        maxWidth: 1200,
        minHeight: 280,
        maxHeight: 1700,
        showCover: true,
        maxShadowOpacity: 0.45,
        flippingTime: 700,
        mobileScrollSupport: false,
      });
      flip.loadFromHTML(el.querySelectorAll<HTMLElement>(".mag-page"));
      flip.on("flip", (e) => setPage(Number(e.data)));
      flipRef.current = flip;
      setPage(0);
    })();

    return () => {
      disposed = true;
      flipRef.current = null;
      try {
        flip?.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, spread]);

  const prev = useCallback(() => flipRef.current?.flipPrev(), []);
  const next = useCallback(() => flipRef.current?.flipNext(), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  function fullscreen() {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }

  return (
    <div
      ref={frameRef}
      className="rounded-[18px] border border-line bg-cream-2 p-4 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:bg-[#2b2a26]"
    >
      <div
        className="flex items-center justify-center"
        style={{ minHeight: bookH || 360 }}
      >
        {error ? (
          <div className="text-center">
            <p className="text-ink-soft">Kunne ikke åpne magasinet her.</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-fig px-5 py-2 text-sm font-semibold text-white hover:bg-fig-dark"
            >
              Åpne PDF i ny fane
            </a>
          </div>
        ) : !ready ? (
          <div className="text-center" role="status">
            <p className="text-sm text-ink-soft">
              Åpner magasinet… {total > 0 ? `${progress} av ${total} sider` : ""}
            </p>
            <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-fig transition-all"
                style={{ width: total ? `${(progress / total) * 100}%` : "8%" }}
              />
            </div>
          </div>
        ) : (
          <div
            key={String(spread)}
            ref={bookRef}
            style={{ width: bookW, height: bookH }}
            className="shadow-2xl"
          >
            {images.map((src, i) => (
              <div key={i} className="mag-page bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Side ${i + 1}`}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={!ready}
          aria-label="Forrige side"
          className="rounded-full border border-line bg-white px-5 py-2 text-lg transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
        >
          ←
        </button>
        <p className="min-w-28 text-center text-sm text-ink-soft" aria-live="polite">
          {ready
            ? `Side ${page + 1}${
                spread && page > 0 && page + 2 <= images.length ? `–${page + 2}` : ""
              } av ${images.length}`
            : ""}
        </p>
        <button
          type="button"
          onClick={next}
          disabled={!ready}
          aria-label="Neste side"
          className="rounded-full border border-line bg-white px-5 py-2 text-lg transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
        >
          →
        </button>
        <button
          type="button"
          onClick={fullscreen}
          disabled={!ready}
          className="ml-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
        >
          Fullskjerm
        </button>
      </div>
    </div>
  );
}
