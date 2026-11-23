/** E-post til medlemmer hvis medlemskap har utløpt: forespørsel om å fornye, med kontingent og personlig betalingsside. */

export type RenewalPerson = {
  name: string;
  fee: number;
  link: string;
  expires: string;
  /** Året betalingen dekker, f.eks. 2027. */
  coverYear: number;
};

export function renewalMessage(firstName: string, people: RenewalPerson[], vipps: boolean): { subject: string; text: string } {
  const how = vipps
    ? "Du betaler enkelt med Vipps på medlemssiden din."
    : "Betal med Vipps til #595791 eller til bankkonto 3207 31 01688, og skriv navnet ditt.";
  const body =
    people.length === 1
      ? `Medlemskapet ditt i Mangfoldshuset Vestland utløp ${people[0].expires}. Vi vil gjerne ha deg med videre!\n\nKontingenten er ${people[0].fee} kr per år. Betaler du nå, gjelder medlemskapet ut ${people[0].coverYear}. ${how}\n\nDin medlemsside: ${people[0].link}`
      : `Medlemskapet til disse i Mangfoldshuset Vestland har utløpt. Vi vil gjerne ha dere med videre! Hver person har sin egen medlemsside og sin egen betaling:\n${people
          .map((p) => `- ${p.name}: ${p.fee} kr per år, gjelder ut ${p.coverYear} (utløp ${p.expires}): ${p.link}`)
          .join("\n")}\n\n${how}`;
  return {
    subject: "Fornye medlemskapet ditt i Mangfoldshuset Vestland?",
    text: `Hei ${firstName}!\n\n${body}\n\nHar du allerede betalt, eller vil du ikke fornye eller ikke få flere slike e-poster? Svar på denne e-posten, så tar vi deg ut av listen.\n\nMangfoldshuset Vestland`,
  };
}

/** Samler medlemmer med samme e-postadresse (en familie), slik at de får én e-post. */
export function groupByEmail<T extends { email: string }>(rows: T[]): T[][] {
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    const key = r.email.trim().toLowerCase();
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()];
}

/** Er det på tide å spørre igjen? Ikke hvis det er sendt for under `days` dager siden. */
export function recentlyRequested(requestedAt: string | null | undefined, today: string, days = 14): boolean {
  if (!requestedAt) return false;
  const ms = new Date(`${today}T00:00:00Z`).getTime() - new Date(requestedAt).getTime();
  return ms < days * 86400000;
}
