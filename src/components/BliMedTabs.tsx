"use client";

import { Children, useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = { id: string; label: string };

/**
 * Fanene på «Bli med»: bare ett skjema vises om gangen. Alle paneler ligger i siden
 * (skjult med `hidden`), så innholdet er tilgjengelig uten JavaScript og bevarer det man
 * har fylt ut når man bytter fane. Ankerlenker som #frivillig åpner riktig fane.
 */
export default function BliMedTabs({
  tabs,
  initial,
  children,
}: {
  tabs: Tab[];
  initial?: string;
  children: ReactNode;
}) {
  const ids = tabs.map((t) => t.id);
  const [active, setActive] = useState(initial && ids.includes(initial) ? initial : ids[0]);
  const panels = Children.toArray(children);

  useEffect(() => {
    function fromHash() {
      const id = window.location.hash.replace("#", "");
      if (ids.includes(id)) setActive(id);
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(id: string) {
    setActive(id);
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {}
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : ids.length - 1)) % ids.length;
    select(ids[next]);
    document.getElementById(`tab-${ids[next]}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Velg hvordan du vil bli med" className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 rounded-full px-5 py-2.5 transition-colors ${
                selected ? "bg-fig text-white" : "bg-[#F7E9E9] text-fig hover:bg-[#F1DADA]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {panels.map((panel, i) => (
          <div
            key={ids[i]}
            id={`panel-${ids[i]}`}
            role="tabpanel"
            aria-labelledby={`tab-${ids[i]}`}
            hidden={ids[i] !== active}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
