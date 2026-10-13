import { redirect } from "next/navigation";
import type { FlashErr, FlashOk } from "./admin-flash-messages";

/** Sender brukeren tilbake til en side med en «Lagret»-melding. Kaster NEXT_REDIRECT. */
export function done(path: string, code: FlashOk): never {
  redirect(`${path}?ok=${code}`);
}

/**
 * Sender brukeren tilbake med en forståelig feilmelding i stedet for en krasjside.
 * Den tekniske feilen logges på serveren (synlig i Vercel-loggene).
 */
export function failed(path: string, code: FlashErr = "generell", detail?: unknown): never {
  if (detail) console.error(`[admin] ${path}: ${code}`, detail);
  redirect(`${path}?feil=${code}`);
}
