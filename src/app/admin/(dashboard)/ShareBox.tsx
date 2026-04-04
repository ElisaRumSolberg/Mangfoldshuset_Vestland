"use client";

import { useState } from "react";

export default function ShareBox({
  url,
  title = "Lenke til plakat/QR-kode",
}: {
  url: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore – bruker kan markere og kopiere manuelt
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-serif text-lg font-medium text-ink">{title}</h2>
        <p className="mt-1 break-all text-sm text-ink-soft">{url}</p>
        <button
          type="button"
          onClick={copy}
          className="mt-3 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-fig hover:text-fig"
        >
          {copied ? "✓ Kopiert" : "Kopier lenke"}
        </button>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt={`QR-kode – ${title}`}
          width={140}
          height={140}
          className="rounded-lg border border-line bg-white p-2"
        />
        <a
          href={qrUrl}
          download={`qr-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-green-dark"
        >
          Last ned QR-kode
        </a>
      </div>
    </div>
  );
}
