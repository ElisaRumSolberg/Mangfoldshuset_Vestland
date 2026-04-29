import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  hero_images: string[];
  om_oss_images: string[];
};

const empty: SiteSettings = { hero_images: [], om_oss_images: [] };

/** Globale bilder (forside, Om oss). Tomt hvis tabellen mangler eller Supabase ikke er satt opp. */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return empty;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (!data) return empty;
  return {
    hero_images: (data.hero_images as string[] | null) ?? [],
    om_oss_images: (data.om_oss_images as string[] | null) ?? [],
  };
}
