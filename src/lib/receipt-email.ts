/** E-post til medlemmet når betalingen er registrert (første gang og når admin sender kvittering på nytt). */
export function receiptMessage(
  member: { first_name: string; expires_at: string; pay_token: string },
  site: string,
): { subject: string; text: string } {
  const year = member.expires_at.slice(0, 4);
  return {
    subject: "Betalingen din er registrert",
    text: `Hei ${member.first_name}!\n\nVi har registrert betalingen din. Medlemskapet ditt gjelder ut ${year}.\n\nPå din egen side kan du se medlemskapet ditt og legge til flere i familien. Hver person har sin egen betaling, og foresatte betaler for barn under 18 år:\n${site}/bli-med/medlem/${member.pay_token}\n\nMangfoldshuset Vestland`,
  };
}

import { isVippsPublic } from "@/lib/vipps";

/** Lenke til medlemmets egen side (betalingsstatus, fornyelse, legge til flere). */
export function memberPageUrl(site: string, payToken: string): string {
  return `${site}/bli-med/medlem/${payToken}`;
}

/** E-post når noen som allerede er registrert, melder seg inn på nytt (f.eks. for å fornye). */
export function existingMemberMessage(
  member: { first_name: string; expires_at: string | null; pay_token: string },
  fee: number,
  today: string,
  site: string,
): { subject: string; text: string } {
  const link = memberPageUrl(site, member.pay_token);
  const how = isVippsPublic()
    ? "med Vipps direkte på medlemssiden din (lenken under), eller til bankkonto 3207 31 01688"
    : "Vipps til #595791 eller bankkonto 3207 31 01688, og skriv navnet ditt";
  const active = !!member.expires_at && member.expires_at >= today;
  const status = active
    ? `Du er allerede medlem, og medlemskapet ditt gjelder ut ${member.expires_at!.slice(0, 4)}. Du trenger ikke melde deg inn på nytt.`
    : member.expires_at
      ? `Du er registrert fra før, men medlemskapet ditt utløp ${member.expires_at}. Du fornyer ved å betale ${fee} kr: ${how}. Når betalingen er registrert, får du en bekreftelse på e-post.`
      : `Du er registrert fra før, men vi har ikke registrert noen betaling ennå. Kontingenten er ${fee} kr per år: ${how}. Når betalingen er registrert, får du en bekreftelse på e-post.`;
  return {
    subject: "Din medlemsside – Mangfoldshuset Vestland",
    text: `Hei ${member.first_name}!\n\n${status}\n\nHer er din egen medlemsside:\n${link}\n\nMangfoldshuset Vestland`,
  };
}
