"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/admin/AdminLang";

const WIDTH = 800;
const HEIGHT = 240;

/** Underskrift med finger, penn eller mus. Gir fra seg et PNG (data-adresse), eller tom tekst når kladden er tom. */
export default function SignaturePad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const t = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f1a17";
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * WIDTH) / r.width, y: ((e.clientY - r.top) * HEIGHT) / r.height };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01); // en prikk også ved et enkelt trykk
    ctx.stroke();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    setEmpty(false);
    onChange(canvas.current!.toDataURL("image/png"));
  }

  function clear() {
    canvas.current?.getContext("2d")?.clearRect(0, 0, WIDTH, HEIGHT);
    setEmpty(true);
    onChange("");
  }

  return (
    <div>
      <div className="relative rounded-lg border border-line bg-white">
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="img"
          aria-label={t("Felt for underskrift")}
          className="block w-full cursor-crosshair rounded-lg"
          style={{ touchAction: "none", aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-soft/70">
            {t("Skriv navnet ditt her med finger eller mus")}
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-line" aria-hidden="true" />
      </div>
      <button type="button" onClick={clear} className="mt-2 min-h-11 px-2 text-sm text-ink-soft underline underline-offset-4 hover:text-fig">
        {t("Slett underskriften og start på nytt")}
      </button>
    </div>
  );
}
