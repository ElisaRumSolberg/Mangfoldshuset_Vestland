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
