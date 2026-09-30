"use client";

import { useId, useRef, useState, useTransition, type ReactNode } from "react";

export type SubmissionResult = void | { error: string };

/** Keep uncontrolled field values on errors and block concurrent submissions. */
export default function SubmissionForm({ action, children, className }: {
  action: (data: FormData) => Promise<SubmissionResult>;
  children: ReactNode;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const errorId = useId();
  return <form className={className} aria-busy={pending} aria-describedby={error ? errorId : undefined} onSubmit={event => {
    event.preventDefault();
    if (busy.current) return;
    const data = new FormData(event.currentTarget);
    busy.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(data);
        if (result?.error) setError(result.error);
      } catch {
        setError("Kunne ikke sende skjemaet. Opplysningene er beholdt. Prøv igjen.");
      } finally { busy.current = false; }
    });
  }}>
    {error && <p id={errorId} role="alert" className="rounded-lg bg-[#F7E9E9] p-3 text-sm text-fig sm:col-span-2">{error}</p>}
    <fieldset disabled={pending} className="contents">{children}</fieldset>
    {pending && <p role="status" className="text-sm text-ink-soft">Sender …</p>}
  </form>;
}
