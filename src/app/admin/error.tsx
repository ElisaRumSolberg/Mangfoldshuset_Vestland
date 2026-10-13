"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-serif text-2xl font-medium text-ink">Noe gikk galt</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Det ble ikke noe av dette. Ingenting er slettet. Prøv igjen, eller gå tilbake til
        forsiden av admin. Hvis det skjer flere ganger, send en melding til den som har
        ansvar for nettsiden og oppgi koden under.
      </p>
      {error.digest && (
        <p className="mt-3 text-sm text-ink-soft">
          Feilkode: <code className="rounded bg-cream-2 px-1.5 py-0.5">{error.digest}</code>
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full bg-fig px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >
          Prøv igjen
        </button>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-sm font-semibold text-ink hover:border-ink"
        >
          Til admin
        </Link>
      </div>
    </div>
  );
}
