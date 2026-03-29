"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageFlip as PageFlipType } from "page-flip";

const PAGE_RATIO = 595.5 / 842.25; // A4 stående
const RENDER_WIDTH = 1200; // px per side ved opptegning
const ZOOMS = [1, 1.5, 2];
const ARCHIVE_PAGE_SIZE = 4;

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
  const [start, setStart] = useState(0);
  const visible = issues.slice(start, start + ARCHIVE_PAGE_SIZE);
  const canPage = issues.length > ARCHIVE_PAGE_SIZE;

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
          {visible.map((i, vIdx) => {
            const idx = start + vIdx;
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
        {canPage && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStart((v) => Math.max(0, v - ARCHIVE_PAGE_SIZE))}
              disabled={start === 0}
              aria-label="Nyere utgaver"
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"
            >
              ←
            </button>
            <span className="text-xs text-ink-soft" aria-live="polite">
              {start + 1}–{Math.min(start + ARCHIVE_PAGE_SIZE, issues.length)} av {issues.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setStart((v) =>
                  Math.min(v + ARCHIVE_PAGE_SIZE, Math.max(0, issues.length - 1))
                )
              }
              disabled={start + ARCHIVE_PAGE_SIZE >= issues.length}
              aria-label="Eldre utgaver"
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"
            >
              →
            </button>
          </div>
        )}
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
  const [frameW, setFrameW] = useState(0);
  const [frameH, setFrameH] = useState(0);
  const [winH, setWinH] = useState(0);
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);

  // Mål rammen (og vinduet). I fullskjerm styrer rammen selv høyden, så vi slipper å vente på vinduet.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    function measure() {
      setFrameW(frame!.clientWidth);
      setFrameH(frame!.clientHeight);
      setWinH(window.innerHeight);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [full]);

  const pad = full ? 16 : 32;
  const spread = frameW >= 760;
  const gutter = spread ? 72 : 0; // plass til pilene ved siden av boken
  const availW = frameW - pad * 2 - gutter * 2;
  const availH = full ? frameH - pad * 2 - 80 : Math.max(380, winH - 330);
  const basePageW =
    frameW > 0 ? Math.max(0, Math.min(availH * PAGE_RATIO, spread ? availW / 2 : availW)) : 0;
  const pageW = basePageW * zoom;
  const bookW = Math.floor(spread ? pageW * 2 : pageW);
  const bookH = Math.floor(pageW / PAGE_RATIO);
  const baseBookH = Math.floor(basePageW / PAGE_RATIO);

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
        maxWidth: 4000,
        minHeight: 280,
        maxHeight: 5600,
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

  // page-flip måler bare på vindusendring; si fra når rammen (f.eks. fullskjerm) endrer størrelse.
  useEffect(() => {
    if (!ready) return;
    const ids = [60, 350].map((ms) =>
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), ms)
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [ready, bookW, bookH]);

  const prev = useCallback(() => flipRef.current?.flipPrev(), []);
  const atEnd = spread && page > 0 ? page + 1 >= images.length - 1 : page >= images.length - 1;
  const next = useCallback(() => {
    // Siste side: neste-knappen blar tilbake til forsiden.
    if (atEnd) flipRef.current?.flip(0);
    else flipRef.current?.flipNext();
  }, [atEnd]);

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

  // Ved zoom: start midt i den forstørrede boken.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || zoom === 1) return;
    const id = window.setTimeout(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollTop = 0;
    }, 400);
    return () => window.clearTimeout(id);
  }, [zoom, full]);

  // Zoomet inn: sürükle for å flytte deg rundt (sidevending skjer med pilene/tastene).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || zoom === 1) return;
    let drag: { x: number; y: number; left: number; top: number } | null = null;

    function down(e: MouseEvent) {
      if (e.button !== 0) return;
      e.stopPropagation(); // hindrer page-flip i å starte en sidevending
      e.preventDefault();
      drag = { x: e.clientX, y: e.clientY, left: el!.scrollLeft, top: el!.scrollTop };
      el!.style.cursor = "grabbing";
    }
    function move(e: MouseEvent) {
      if (!drag) return;
      el!.scrollLeft = drag.left - (e.clientX - drag.x);
      el!.scrollTop = drag.top - (e.clientY - drag.y);
    }
    function up() {
      drag = null;
      el!.style.cursor = "grab";
    }
    function touch(e: TouchEvent) {
      e.stopPropagation(); // la nettleseren rulle med fingeren
    }

    el.style.cursor = "grab";
    el.addEventListener("mousedown", down, true);
    el.addEventListener("touchstart", touch, true);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      el.style.cursor = "";
      el.removeEventListener("mousedown", down, true);
      el.removeEventListener("touchstart", touch, true);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [zoom, full]);

  function stepZoom(dir: 1 | -1) {
    setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, ZOOMS.indexOf(z) + dir))]);
  }

  function closeFull() {
    setFull(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }

  function toggleFull() {
    if (full) {
      closeFull();
      return;
    }
    setFull(true);
    // Ekte fullskjerm der nettleseren tillater det; ellers dekker rammen bare vinduet.
    void frameRef.current?.requestFullscreen?.().catch(() => {});
  }

  useEffect(() => {
    if (!full) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFull(false);
    }
    function onFsChange() {
      if (!document.fullscreenElement) setFull(false);
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [full]);

  // Kapittelet står alene: skyv boken så forsiden/baksiden havner midt i rammen.
  const lastIndex = images.length - 1;
  const shift = !spread
    ? 0
    : page === 0
      ? -pageW / 2
      : page >= lastIndex && images.length % 2 === 0
        ? pageW / 2
        : 0;

  const navBtn =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-xl text-ink shadow-md transition-colors hover:bg-ink hover:text-cream disabled:opacity-30";

  const tool =
    "rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink";

  return (
    <div
      ref={frameRef}
      className={
        full
          ? "fixed inset-0 z-[100] flex flex-col justify-center bg-[#2b2a26] p-4"
          : "relative rounded-[18px] border border-line bg-cream-2 p-8 max-sm:p-4"
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p
          className={`text-sm ${full ? "text-white/80" : "text-ink-soft"}`}
          aria-live="polite"
        >
          {ready
            ? `Side ${page + 1}${
                spread && page > 0 && page + 2 <= images.length ? `–${page + 2}` : ""
              } av ${images.length}`
            : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => stepZoom(-1)}
            disabled={!ready || zoom === ZOOMS[0]}
            aria-label="Zoom ut"
            className={`${tool} px-3.5`}
          >
            −
          </button>
          <span
            className={`w-12 text-center text-xs font-semibold ${full ? "text-white/80" : "text-ink-soft"}`}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => stepZoom(1)}
            disabled={!ready || zoom === ZOOMS[ZOOMS.length - 1]}
            aria-label="Zoom inn"
            className={`${tool} px-3.5`}
          >
            +
          </button>
          <button type="button" onClick={toggleFull} disabled={!ready} className={`${tool} ml-2`}>
            {full ? "Lukk fullskjerm ✕" : "Fullskjerm"}
          </button>
        </div>
      </div>

      <div className="relative">
        {ready && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Forrige side"
              className={`${navBtn} left-0`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Neste side"
              className={`${navBtn} right-0`}
            >
              →
            </button>
          </>
        )}
        <div
          ref={stageRef}
          className={`flex ${zoom > 1 ? "overflow-auto" : ""}`}
          style={{
            minHeight: baseBookH || 360,
            height: zoom > 1 ? baseBookH + 8 : undefined,
          }}
        >
          {error ? (
            <div className="m-auto text-center">
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
            <div className="m-auto text-center" role="status">
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
              className="m-auto shrink-0 drop-shadow-2xl"
              style={{
                width: bookW,
                height: bookH,
                transform: `translateX(${shift}px)`,
                transition: "transform 0.5s ease",
              }}
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
      </div>
    </div>
  );
}
