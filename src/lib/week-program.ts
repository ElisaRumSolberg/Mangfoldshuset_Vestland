import { isoWeek, occursOn, type Program } from "@/lib/recurring";

/** «Ukens program»: hva som skjer mandag–søndag, regnet ut fra faste tilbud og enkeltaktiviteter. */

const DAY_NAMES = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

export type WeekItem = {
  key: string;
  title: string;
  /** «16.30–18.00», fri tekst fra en aktivitet, eller null. */
  time: string | null;
  place: string | null;
  href: string | null;
  /** «avlyst»: en dato som er krysset ut. «starter»: tilbudet begynner senere (da vises «Starter i uke N»). */
  note: "avlyst" | "starter" | null;
  startsWeek?: number;
};

export type WeekDay = {
  iso: string;
  name: string;
  dateText: string;
  items: WeekItem[];
};

export type Week = {
  start: string;
  end: string;
  number: number;
  label: string;
  days: WeekDay[];
};

export type WeekActivity = {
  id: string;
  title: string;
  place: string | null;
  event_date: string;
  end_date?: string | null;
  event_time?: string | null;
};

function utcDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDaysIso(iso: string, n: number): string {
  const dt = utcDate(iso);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/** Mandagen i uken en dato hører til (ISO-uke, mandag først). */
export function mondayOf(iso: string): string {
  const dow = utcDate(iso).getUTCDay() || 7;
  return addDaysIso(iso, 1 - dow);
}

/**
 * Hvilken uke som vises, fra `?uke=ÅÅÅÅ-MM-DD`. Ugyldig verdi gir inneværende uke, og man kan bare bla
 * et halvt år frem eller tilbake fra i dag.
 */
export function parseWeekParam(value: string | undefined, today: string, maxWeeks = 26): string {
  const thisWeek = mondayOf(today);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(utcDate(value).getTime())) return thisWeek;
  const monday = mondayOf(value);
  const diffWeeks = Math.round((utcDate(monday).getTime() - utcDate(thisWeek).getTime()) / (7 * 86400000));
  return Math.abs(diffWeeks) > maxWeeks ? thisWeek : monday;
}

function hhmm(t: string) {
  return t.slice(0, 5).replace(":", ".");
}

function programTime(p: Program): string | null {
  if (!p.start_time) return null;
  return p.end_time ? `${hhmm(p.start_time)}–${hhmm(p.end_time)}` : hhmm(p.start_time);
}

/** Kortere sted i ukeoversikten: gateadressen er den samme for nesten alle («Mangfoldhuset» holder). */
export function shortPlace(place: string | null | undefined): string | null {
  if (!place) return null;
  const short = place
    .replace(/,\s*Arne Abrahamsens vei \d+(?:,\s*(?:\d{4}\s+)?[A-Za-zÆØÅæøå]+)?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return short || place;
}

function dateText(iso: string) {
  return utcDate(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" });
}

function weekLabel(start: string, end: string) {
  const s = utcDate(start);
  const e = utcDate(end);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  const month = (d: Date) => d.toLocaleDateString("nb-NO", { month: "long", timeZone: "UTC" });
  return sameMonth
    ? `${s.getUTCDate()}.–${e.getUTCDate()}. ${month(e)}`
    : `${s.getUTCDate()}. ${month(s)} – ${e.getUTCDate()}. ${month(e)}`;
}

/** Første dato tilbudet holdes, på eller etter oppstartsdatoen. */
function firstOccurrence(p: Program, from: string): string | null {
  for (let i = 0; i < 31; i++) {
    const iso = addDaysIso(from, i);
    if (occursOn({ ...p, skipped_dates: [] }, iso)) return iso;
  }
  return null;
}

export function buildWeek(programs: Program[], activities: WeekActivity[], startIso: string): Week {
  const start = mondayOf(startIso);
  const end = addDaysIso(start, 6);
  const days: WeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const iso = addDaysIso(start, i);
    const items: WeekItem[] = [];

    for (const p of programs) {
      if (occursOn(p, iso)) {
        items.push({ key: `p-${p.id}-${iso}`, title: p.title, time: programTime(p), place: shortPlace(p.place), href: `/tilbud/${p.id}`, note: null });
      } else if (p.skipped_dates.includes(iso) && occursOn({ ...p, skipped_dates: [] }, iso)) {
        items.push({ key: `p-${p.id}-${iso}-x`, title: p.title, time: programTime(p), place: shortPlace(p.place), href: `/tilbud/${p.id}`, note: "avlyst" });
      }
    }

    for (const a of activities) {
      const last = a.end_date && a.end_date > a.event_date ? a.end_date : a.event_date;
      if (iso >= a.event_date && iso <= last) {
        items.push({ key: `a-${a.id}-${iso}`, title: a.title, time: a.event_time?.trim() || null, place: shortPlace(a.place), href: `/aktiviteter/${a.id}`, note: null });
      }
    }

    days.push({ iso, name: DAY_NAMES[utcDate(iso).getUTCDay()], dateText: dateText(iso), items });
  }

  // Faste tilbud som starter uken etter: vises på sin ukedag med «Starter i uke N».
  for (const p of programs) {
    if (p.frequency !== "weekly" || !p.start_date || p.start_date <= end || p.start_date > addDaysIso(end, 7)) continue;
    const first = firstOccurrence(p, p.start_date);
    if (!first) continue;
    const day = days.find((d) => utcDate(d.iso).getUTCDay() === p.weekday);
    if (!day) continue;
    day.items.push({ key: `p-${p.id}-start`, title: p.title, time: null, place: shortPlace(p.place), href: `/tilbud/${p.id}`, note: "starter", startsWeek: isoWeek(first) });
  }

  // Tidligst først innenfor en dag; uten klokkeslett sist.
  for (const d of days) {
    d.items.sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99") || a.title.localeCompare(b.title, "nb"));
  }

  return {
    start,
    end,
    number: isoWeek(start),
    label: weekLabel(start, end),
    days: days.filter((d) => d.items.length > 0),
  };
}

/** Fargene hvert tilbud har i ukeoversikten (stripen og plakaten). Ukjente tilbud får en stabil farge ut fra navnet. */
export type Tint = { bg: string; fg: string; solid: string };

const TINTS: Record<string, Tint> = {
  mannstreff: { bg: "#E3EBDD", fg: "#2B4527", solid: "#4B6B4A" },
  "kosetid for kvinner": { bg: "#F4DDE2", fg: "#6E2438", solid: "#B0475F" },
  jenteklubb: { bg: "#D9E9EE", fg: "#173F50", solid: "#2F6D83" },
  leksehjelp: { bg: "#F6E6C8", fg: "#5C3A0B", solid: "#A8691F" },
  språkkafé: { bg: "#E9DDF0", fg: "#472560", solid: "#7A4C8C" },
  torsdagssuppe: { bg: "#F4DCD3", fg: "#6B2514", solid: "#B0452F" },
  barseltreff: { bg: "#F9E1CF", fg: "#6B3418", solid: "#C26F43" },
  "åpent kjøkken": { bg: "#E2EDCC", fg: "#33501A", solid: "#5F8433" },
  familiebrunsj: { bg: "#F5E3C0", fg: "#5C440B", solid: "#A07F1A" },
};

const FALLBACK: Tint[] = [
  { bg: "#E3EBDD", fg: "#2B4527", solid: "#4B6B4A" },
  { bg: "#F4DDE2", fg: "#6E2438", solid: "#B0475F" },
  { bg: "#D9E9EE", fg: "#173F50", solid: "#2F6D83" },
  { bg: "#F6E6C8", fg: "#5C3A0B", solid: "#A8691F" },
];

export function tintFor(title: string): Tint {
  const known = TINTS[title.trim().toLowerCase()];
  if (known) return known;
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK[h % FALLBACK.length];
}

/** «Man», «Tir» … */
export function dayShort(name: string): string {
  return name.slice(0, 3);
}
