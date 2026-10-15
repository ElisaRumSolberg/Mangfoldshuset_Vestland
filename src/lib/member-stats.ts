// Aldersgrupper og kjønnsfordeling for medlemsstatistikk (f.eks. rapportering til støtteordninger).

export type Gender = "kvinne" | "mann" | "annet" | "ukjent";

export const AGE_GROUPS = [
  { key: "0-5", min: 0, max: 5 },
  { key: "6-12", min: 6, max: 12 },
  { key: "13-17", min: 13, max: 17 },
  { key: "18-25", min: 18, max: 25 },
  { key: "26+", min: 26, max: 200 },
] as const;

/** Alder i hele år på en gitt dato (ÅÅÅÅ-MM-DD). Returnerer null ved manglende/ugyldig dato. */
export function ageOn(birth: string | null | undefined, today: string): number | null {
  if (!birth || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
  const [by, bm, bd] = birth.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

export type StatPerson = { birth: string | null; gender: string | null };

export type StatRow = {
  key: string;
  kvinne: number;
  mann: number;
  annet: number; // «annet», «ønsker ikke å oppgi» og ikke oppgitt
  total: number;
};

export type MemberStats = {
  rows: StatRow[];
  unknownAge: number;
  total: number;
  under26: number;
  age6to25: number;
};

export function buildStats(persons: StatPerson[], today: string): MemberStats {
  const rows: StatRow[] = AGE_GROUPS.map((g) => ({ key: g.key, kvinne: 0, mann: 0, annet: 0, total: 0 }));
  let unknownAge = 0;
  let under26 = 0;
  let age6to25 = 0;

  for (const p of persons) {
    const age = ageOn(p.birth, today);
    if (age === null) {
      unknownAge += 1;
      continue;
    }
    const idx = AGE_GROUPS.findIndex((g) => age >= g.min && age <= g.max);
    const row = rows[idx];
    if (p.gender === "kvinne") row.kvinne += 1;
    else if (p.gender === "mann") row.mann += 1;
    else row.annet += 1;
    row.total += 1;
    if (age < 26) under26 += 1;
    if (age >= 6 && age <= 25) age6to25 += 1;
  }

  return { rows, unknownAge, total: persons.length, under26, age6to25 };
}
