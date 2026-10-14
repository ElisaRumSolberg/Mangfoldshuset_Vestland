"use client";

import { useT } from "@/components/admin/AdminLang";

/**
 * «Slett»-knapp som spør om bekreftelse før skjemaet sendes. Ligger inni et vanlig
 * <form action={...}>; avbryter man dialogen, skjer ingenting.
 */
export default function DeleteButton({
  what,
  extra,
}: {
  /** Hva som slettes, f.eks. «Påskefest» – vises i spørsmålet og leses opp av skjermlesere. */
  what: string;
  /** Ekstra advarsel (allerede oversatt), f.eks. «Alle bilder og påmeldinger forsvinner også.» */
  extra?: string;
}) {
  const t = useT();
  return (
    <button
      type="submit"
      aria-label={t("Slett {what}", { what })}
      onClick={(e) => {
        const msg = `${t("Vil du slette «{what}»?", { what })}${extra ? `\n\n${extra}` : ""}\n\n${t("Dette kan ikke angres.")}`;
        if (!window.confirm(msg)) e.preventDefault();
      }}
      className="min-h-11 rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
    >
      {t("Slett")}
    </button>
  );
}
