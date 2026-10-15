// Påminnelser til nye medlemmer som ikke har betalt (de har ingen utløpsdato ennå).
// Siste sendte milepæl lagres i members.last_reminder_offset som UNPAID_BASE + dager,
// så den aldri kan forveksles med utløpspåminnelsene (som bruker -15…30).

export const UNPAID_MILESTONES = [3, 14] as const;
export const UNPAID_BASE = 1000;
/** Eldre uten betaling får ikke flere påminnelser. */
export const UNPAID_WINDOW_DAYS = 30;

export function lastSentMilestone(stored: number | null | undefined): number {
  return typeof stored === "number" && stored >= UNPAID_BASE ? stored - UNPAID_BASE : 0;
}

/** Neste milepæl som skal sendes nå, eller null. Én påminnelse per kjøring. */
export function nextUnpaidMilestone(daysSinceSignup: number, stored: number | null | undefined): number | null {
  const sent = lastSentMilestone(stored);
  for (const m of UNPAID_MILESTONES) {
    if (daysSinceSignup >= m && sent < m) return m;
  }
  return null;
}

export function unpaidMessage(firstName: string, type: string) {
  const amount = type === "familie" ? "150 kr (familie)" : "100 kr (enkelt)";
  return {
    subject: "Fullfør medlemskapet ditt i Mangfoldshuset Vestland",
    text: `Hei ${firstName}!\n\nTakk for at du meldte deg inn i Mangfoldshuset Vestland. Medlemskapet aktiveres når kontingenten er betalt: ${amount} per år. Betal med Vipps til #595791 eller til bankkonto 3207 31 01688.\n\nHar du allerede betalt, ser vi det snart, og du kan se bort fra denne e-posten.\n\nMangfoldshuset Vestland`,
  };
}
