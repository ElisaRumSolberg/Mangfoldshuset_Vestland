import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export type Utvalg = {
  id: string;
  slug: string;
  title: string;
  description: string;
  activity_match: string | null;
  external_link: string | null;
  contact: string | null;
  photos: string[];
  active: boolean;
  /** Egen fargeprofil (valgfritt). Alle tre må være satt for at den skal brukes. */
  color_from: string | null;
  color_to: string | null;
  accent: string | null;
};

export function toUtvalg(r: Record<string, unknown>): Utvalg {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    description: (r.description as string) ?? "",
    activity_match: (r.activity_match as string | null) ?? null,
    external_link: (r.external_link as string | null) ?? null,
    contact: (r.contact as string | null) ?? null,
    photos: (r.photos as string[] | null) ?? [],
    active: (r.active as boolean | null) ?? true,
    color_from: (r.color_from as string | null) ?? null,
    color_to: (r.color_to as string | null) ?? null,
    accent: (r.accent as string | null) ?? null,
  };
}

/** De tre fargene når alle er satt, ellers null (bruk standardfargene). */
export function customColors(
  u: Pick<Utvalg, "color_from" | "color_to" | "accent">
): { from: string; to: string; accent: string } | null {
  return u.color_from && u.color_to && u.accent
    ? { from: u.color_from, to: u.color_to, accent: u.accent }
    : null;
}

/** Aktive utvalg, sortert alfabetisk. Tomt hvis tabellen mangler eller Supabase ikke er satt opp. */
export async function fetchUtvalg(): Promise<Utvalg[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("utvalg")
    .select("*")
    .eq("active", true)
    .order("title", { ascending: true });
  if (error || !data) return [];
  return data.map(toUtvalg);
}
