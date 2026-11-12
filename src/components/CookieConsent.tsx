"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Samtykkestatus finnes kun i nettleserens localStorage, så den kan
    // først leses etter mount – umulig å vite ved første render.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      if (!localStorage.getItem("cookie-consent")) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function decide(value: "godkjent" | "avvist") {
    try {
      localStorage.setItem("cookie-consent", value);
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Informasjonskapsler"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/97 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Vi bruker ikke informasjonskapsler for å spore besøkende. Les mer i{" "}
          <a href="/personvern" className="underline hover:text-ink">
            personvernerklæringen
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("avvist")}
            className="min-h-11 rounded-lg border border-ink px-5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Avvis
          </button>
          <button
            type="button"
            onClick={() => decide("godkjent")}
            className="min-h-11 rounded-lg bg-fig px-5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
          >
            Greit
          </button>
        </div>
      </div>
    </div>
  );
}
