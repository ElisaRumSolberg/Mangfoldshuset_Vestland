// Kontingent per person: 16 år og eldre betaler 100 kr, til og med 15 år betaler 25 kr.
// Alderen regnes ut fra fødselsdato på betalingsdagen. Mangler fødselsdato, regnes personen som voksen.

export const FEE_ADULT = 100;
export const FEE_CHILD = 25;
export const ADULT_FROM_AGE = 16;

/** Hele år mellom fødselsdato og en dato (begge ÅÅÅÅ-MM-DD). */
export function ageOn(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.slice(0, 10).split("-").map(Number);
  const [oy, om, od] = onDate.slice(0, 10).split("-").map(Number);
  let age = oy - by;
  if (om < bm || (om === bm && od < bd)) age -= 1;
  return age;
}

export function feeForPerson(birthDate: string | null | undefined, onDate: string): number {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}/.test(birthDate)) return FEE_ADULT;
  return ageOn(birthDate, onDate) >= ADULT_FROM_AGE ? FEE_ADULT : FEE_CHILD;
}

export type FeeSummary = { total: number; adults: number; children: number };

/** Samlet kontingent for hovedmedlemmet og eventuelle familiemedlemmer. */
export function membershipFee(
  persons: { birth_date?: string | null }[],
  onDate: string,
): FeeSummary {
  let adults = 0;
  let children = 0;
  for (const p of persons) {
    if (feeForPerson(p.birth_date, onDate) === FEE_ADULT) adults += 1;
    else children += 1;
  }
  return { total: adults * FEE_ADULT + children * FEE_CHILD, adults, children };
}

/** «225 kr (2 × 100 kr + 1 × 25 kr)», eller bare «100 kr» for én person. */
export function feeText(fee: FeeSummary): string {
  const parts: string[] = [];
  if (fee.adults) parts.push(`${fee.adults} × ${FEE_ADULT} kr`);
  if (fee.children) parts.push(`${fee.children} × ${FEE_CHILD} kr`);
  return fee.adults + fee.children > 1 ? `${fee.total} kr (${parts.join(" + ")})` : `${fee.total} kr`;
}
