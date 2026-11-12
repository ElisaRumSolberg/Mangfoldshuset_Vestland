// Påminnelser til nye medlemmer som ikke har betalt (de har ingen utløpsdato ennå).
// Siste sendte milepæl lagres i members.last_reminder_offset som UNPAID_BASE + dager,
// så den aldri kan forveksles med utløpspåminnelsene (som bruker -15…30).

import { FEE_ADULT } from "@/lib/membership-fee";
import { isVippsPublic } from "@/lib/vipps";

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

/** Én e-post per husstand: hver person som ikke har betalt, med eget beløp. */
export function unpaidMessage(firstName: string, people: { name: string; fee: number; link?: string }[]) {
  // Når Vipps er satt opp, betaler hver person direkte på sin egen medlemsside.
  const direct = isVippsPublic() && people.every((p) => p.link);
  const pay = direct
    ? "Betal med Vipps direkte på medlemssiden, eller til bankkonto 3207 31 01688"
    : "Betal med Vipps til #595791 eller til bankkonto 3207 31 01688";
  const body =
    people.length > 1
      ? `Medlemskapet aktiveres for hver person når kontingenten er betalt. Hver person har sin egen betaling, per år. Foresatte betaler for barn under 18 år:\n${people
          .map((p) => `- ${p.name}: ${p.fee} kr${p.link ? ` (${p.link})` : ""}`)
          .join("\n")}\n\n${pay}, og skriv navnet på den du betaler for.`
      : `Medlemskapet aktiveres når kontingenten er betalt: ${people[0]?.fee ?? FEE_ADULT} kr per år. ${pay}.${people[0]?.link ? `\n\nDin medlemsside: ${people[0].link}` : ""}`;
  return {
    subject: "Fullfør medlemskapet ditt i Mangfoldshuset Vestland",
    text: `Hei ${firstName}!\n\nTakk for at du meldte deg inn i Mangfoldshuset Vestland. ${body}\n\nHar du allerede betalt, ser vi det snart, og du kan se bort fra denne e-posten.\n\nMangfoldshuset Vestland`,
  };
}
