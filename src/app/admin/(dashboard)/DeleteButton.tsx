"use client";

/**
 * «Slett»-knapp som spør om bekreftelse før skjemaet sendes. Ligger inni et vanlig
 * <form action={...}>; avbryter man dialogen, skjer ingenting.
 */
export default function DeleteButton({
  what,
  extra,
  children = "Slett",
}: {
  /** Hva som slettes, f.eks. «Påskefest» – vises i spørsmålet og leses opp av skjermlesere. */
  what: string;
  /** Ekstra advarsel, f.eks. «Alle bilder og påmeldinger forsvinner også.» */
  extra?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      aria-label={`Slett ${what}`}
      onClick={(e) => {
        const msg = `Vil du slette «${what}»?${extra ? `\n\n${extra}` : ""}\n\nDette kan ikke angres.`;
        if (!window.confirm(msg)) e.preventDefault();
      }}
      className="min-h-11 rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
    >
      {children}
    </button>
  );
}
