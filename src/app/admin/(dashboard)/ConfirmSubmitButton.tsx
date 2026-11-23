"use client";

import { useT } from "@/components/admin/AdminLang";

/** Sende-knapp som spør om bekreftelse først. Avbryter man dialogen, skjer ingenting. */
export default function ConfirmSubmitButton({
  label,
  message,
  className,
}: {
  label: string;
  /** Spørsmålet (allerede oversatt). */
  message: string;
  className?: string;
}) {
  const t = useT();
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(`${message}\n\n${t("Dette kan ikke angres.")}`)) e.preventDefault();
      }}
      className={
        className ??
        "min-h-11 rounded-lg bg-fig px-5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
      }
    >
      {label}
    </button>
  );
}
