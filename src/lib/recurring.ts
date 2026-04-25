import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export type Program = {
  id: string;
  title: string;
  description: string;
  frequency: "weekly" | "monthly";
  weekday: number; // 0 = søndag ... 6 = lørdag
  nth: number | null; // kun månedlig: 1-4, -1 = siste
  start_time: string | null;
  end_time: string | null;
  start_date: string | null;
  end_date: string | null;
  place: string;
  note: string | null;
  contact: string | null;
  external_link: string | null;
  image_url: string | null;
  skipped_dates: string[];
  active: boolean;
  featured: boolean;
  participants: number | null; // totalt så langt
  summary: string | null;
  feedback: string | null; // ett utsagn per linje
  photos: string[];
  sort_order: number;
};

const DAYS = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const NTH: Record<string, string> = {
  "1": "Første",
  "2": "Andre",
  "3": "Tredje",
  "4": "Fjerde",
  "-1": "Siste",
};

export const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0].map((d) => ({
  value: d,
  label: DAYS[d][0].toUpperCase() + DAYS[d].slice(1),
}));
export const NTH_OPTIONS = [1, 2, 3, 4, -1].map((n) => ({ value: n, label: NTH[String(n)] }));

/** Dagens dato (ÅÅÅÅ-MM-DD) i norsk tid. */
export function todayOslo(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

function utcDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(iso: string, n: number) {
  const dt = utcDate(iso);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function occursOn(p: Program, iso: string): boolean {
  const dt = utcDate(iso);
  if (dt.getUTCDay() !== p.weekday) return false;

  if (p.frequency === "monthly") {
    const day = dt.getUTCDate();
    const daysInMonth = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
    if (p.nth === -1) {
      if (day + 7 <= daysInMonth) return false; // ikke siste av sin ukedag
    } else if (p.nth) {
      if (Math.ceil(day / 7) !== p.nth) return false;
    }
  }

  if (p.start_date && iso < p.start_date) return false;
  if (p.end_date && iso > p.end_date) return false;
  if (p.skipped_dates.includes(iso)) return false;
  return true;
}

/** Neste datoer (ÅÅÅÅ-MM-DD) fra og med `from`, opptil `count` stykker. */
export function nextOccurrences(p: Program, from: string, count: number, horizonDays = 150) {
  const out: string[] = [];
  for (let i = 0; i <= horizonDays && out.length < count; i++) {
    const iso = addDays(from, i);
    if (occursOn(p, iso)) out.push(iso);
  }
  return out;
}

function fmtTime(t: string) {
  return t.slice(0, 5).replace(":", ".");
}

export function timeText(p: Program): string | null {
  if (!p.start_time) return null;
  return p.end_time
    ? `kl. ${fmtTime(p.start_time)}–${fmtTime(p.end_time)}`
    : `kl. ${fmtTime(p.start_time)}`;
}

/** F.eks. "Hver fredag" eller "Siste søndag i måneden". */
export function whenText(p: Program): string {
  const day = DAYS[p.weekday];
  if (p.frequency === "weekly") return `Hver ${day}`;
  return `${NTH[String(p.nth ?? 1)]} ${day} i måneden`;
}

/** Kort dato med ukedag, f.eks. "fre. 26. sep." */
export function shortDate(iso: string): string {
  return utcDate(iso).toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function weekdayAbbr(p: Program): string {
  return DAYS[p.weekday].slice(0, 3).toUpperCase();
}

/** Gjør en rad fra databasen om til et Program (fyller inn felt som kan mangle). */
export function toProgram(r: Record<string, unknown>): Program {
  return {
    ...(r as unknown as Program),
    skipped_dates: (r.skipped_dates as string[] | null) ?? [],
    featured: (r.featured as boolean | null) ?? false,
    participants: (r.participants as number | null) ?? null,
    summary: (r.summary as string | null) ?? null,
    feedback: (r.feedback as string | null) ?? null,
    photos: (r.photos as string[] | null) ?? [],
  };
}

/** Henter aktive faste tilbud. Tomt hvis tabellen mangler eller Supabase ikke er satt opp. */
export async function fetchPrograms(): Promise<Program[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_programs")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map(toProgram);
}

export type OccurrenceCard = {
  iso: string;
  title: string;
  categories: string[];
  date: string;
  place: string;
  desc: string;
  imageUrl: string | null;
  videoUrl: null;
  externalLink: string | null;
  banner: string;
  imageHref: string | null;
  featured: boolean;
  recurring: true;
  href: string;
};

/** Kommende forekomster som kort som kan blandes inn i aktivitetslisten. */
export function occurrenceCards(
  programs: Program[],
  perProgram: number,
  horizonDays = 60
): OccurrenceCard[] {
  const today = todayOslo();
  return programs.flatMap((p) =>
    nextOccurrences(p, today, perProgram, horizonDays).map((iso) => {
      const time = timeText(p);
      return {
        iso,
        title: p.title,
        categories: ["Fast tilbud"],
        date: whenText(p),
        place: time ? `${time} · ${p.place}` : p.place,
        desc: p.description,
        imageUrl: p.image_url,
        videoUrl: null,
        externalLink: p.external_link,
        banner: shortDate(iso),
        imageHref: p.image_url,
        featured: p.featured,
        recurring: true as const,
        href: `/tilbud/${p.id}`,
      };
    })
  );
}

/**
 * Rekkefølge i «Kommende»: fremhevede først, så enkeltarrangementer, så faste tilbud.
 * Innenfor hver gruppe sorteres det etter dato.
 */
export function sortUpcoming<T extends { iso: string; featured?: boolean; recurring?: boolean }>(
  items: T[]
): T[] {
  const rank = (x: T) => (x.featured ? 0 : x.recurring ? 2 : 1);
  return [...items].sort((a, b) => rank(a) - rank(b) || a.iso.localeCompare(b.iso));
}
