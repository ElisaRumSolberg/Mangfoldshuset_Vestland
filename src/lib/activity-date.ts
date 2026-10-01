export type DatedActivity = { event_date: string; end_date?: string | null };

/** Siste dag aktiviteten pågår (samme som event_date hvis ingen sluttdato er satt). */
export function effectiveEndDate(a: DatedActivity): string {
  return a.end_date && a.end_date > a.event_date ? a.end_date : a.event_date;
}

export function isActivityPast(a: DatedActivity, today: string): boolean {
  return effectiveEndDate(a) < today;
}

function utcDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

/** Kort dato til kort/badge, f.eks. "10. okt." eller "10.–12. okt." */
export function shortDateRange(a: DatedActivity): string {
  const start = utcDate(a.event_date);
  const startShort = start.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" });
  if (!a.end_date || a.end_date <= a.event_date) return startShort;

  const end = utcDate(a.end_date);
  const endShort = end.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" });
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  return sameMonth ? `${start.getUTCDate()}.–${endShort}` : `${startShort} – ${endShort}`;
}

/** Lang dato til aktivitetssiden, f.eks. "onsdag 1. oktober 2025" eller "1. – 3. oktober 2025". */
export function longDateRange(a: DatedActivity): string {
  const start = utcDate(a.event_date);
  if (!a.end_date || a.end_date <= a.event_date) {
    return start.toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  const end = utcDate(a.end_date);
  const startText = start.toLocaleDateString("nb-NO", { day: "numeric", month: "long", timeZone: "UTC" });
  const endText = end.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${startText} – ${endText}`;
}

/** Google Kalender-lenke for et heldags-arrangement (event_time vises kun i beskrivelsen, siden det er fritekst). */
export function googleCalendarUrl(
  a: DatedActivity & { title: string; place: string; event_time?: string | null }
): string {
  const start = a.event_date.replaceAll("-", "");
  const endExclusive = utcDate(effectiveEndDate(a));
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const end = endExclusive.toISOString().slice(0, 10).replaceAll("-", "");
  const details = a.event_time ? `Klokkeslett: ${a.event_time}` : "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: a.title,
    dates: `${start}/${end}`,
    location: a.place,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
