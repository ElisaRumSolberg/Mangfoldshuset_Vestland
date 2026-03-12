"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-consent")) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function decide(value: "godkjent" | "avvist") {
    try {
      localStorage.setItem("cookie-consent", value);
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/97 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-serif text-base font-semibold text-ink">
            Informasjonskapsler
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Vi bruker ikke informasjonskapsler for å spore vanlige besøkende.
            Nødvendige cookies brukes kun ved administratorpålogging. Les mer
            i vår{" "}
            <a href="/personvern" className="underline hover:text-ink">
              personvernerklæring
            </a>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("avvist")}
            className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Avvis
          </button>
          <button
            type="button"
            onClick={() => decide("godkjent")}
            className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
          >
            Godta
          </button>
        </div>
      </div>
    </div>
  );
}
