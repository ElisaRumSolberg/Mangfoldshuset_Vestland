import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/spam-guard";

/** Usynlige felt som fanger opp enkle spam-boter. Legges inn i offentlige skjemaer. */
export default function HoneypotFields() {
  return (
    <>
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      {/* eslint-disable-next-line react-hooks/purity -- server component, rendert én gang per request */}
      <input type="hidden" name={TIMESTAMP_FIELD} value={Date.now()} />
    </>
  );
}
