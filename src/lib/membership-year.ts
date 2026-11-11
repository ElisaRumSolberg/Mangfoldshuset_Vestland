// Medlemskapet gjelder kalenderåret (1. januar–31. desember). Melder man seg inn eller betaler
// fra og med 1. oktober, gjelder det ut neste kalenderår. Se /medlemsvilkar.

export const NEXT_YEAR_FROM_MONTH = 10;

/** Siste dag i et medlemsår, ÅÅÅÅ-MM-DD. */
export function yearEnd(year: number): string {
  return `${year}-12-31`;
}

/**
 * Hvilket år en betaling dekker. `today` og `currentExpires` er ÅÅÅÅ-MM-DD.
 * - Har medlemmet et gyldig medlemskap, forlenges det: slutter det 31. desember, dekker betalingen
 *   neste år, ellers resten av året medlemskapet allerede slutter i.
 * - Ellers dekker betalingen i år, eller neste år når det er 1. oktober eller senere.
 */
export function coverageYear(today: string, currentExpires: string | null): number {
  if (currentExpires && currentExpires >= today) {
    const year = Number(currentExpires.slice(0, 4));
    return currentExpires.slice(5) === "12-31" ? year + 1 : year;
  }
  const year = Number(today.slice(0, 4));
  return Number(today.slice(5, 7)) >= NEXT_YEAR_FROM_MONTH ? year + 1 : year;
}

// Gratisperiode: medlemskap er gratis til og med 31. desember 2026. Fra og med 1. januar 2027
// betaler man kontingent. Endres datoen her, følger hele nettsiden etter.
export const FEE_STARTS = "2027-01-01";

/** Er vi fortsatt i perioden der medlemskap er gratis? `today` er ÅÅÅÅ-MM-DD (norsk tid). */
export function isFreePeriod(today: string): boolean {
  return today < FEE_STARTS;
}

/** Siste dag et gratis medlemskap gjelder (dagen før kontingenten innføres), ÅÅÅÅ-MM-DD. */
export function freeMembershipEnd(): string {
  return yearEnd(Number(FEE_STARTS.slice(0, 4)) - 1);
}

/** «1. januar 2027» */
export function feeStartsText(): string {
  const [y, m, d] = FEE_STARTS.split("-").map(Number);
  const months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
  return `${d}. ${months[m - 1]} ${y}`;
}
