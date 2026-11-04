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
