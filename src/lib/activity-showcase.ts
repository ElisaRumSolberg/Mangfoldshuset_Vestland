import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import type { ShowcaseSlide } from "@/components/ActivityShowcase";

/** Bilder fra aktiviteter/tilbud administrator har valgt å vise i karusellen på forsiden. */
export async function fetchActivityShowcaseSlides(limit = 10): Promise<ShowcaseSlide[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const [{ data: activities }, { data: programs }] = await Promise.all([
    supabase
      .from("activities")
      .select("id, title, photos, image_url, homepage_image_urls, event_date")
      .eq("show_on_homepage", true)
      .order("event_date", { ascending: false }),
    supabase
      .from("recurring_programs")
      .select("id, title, photos, image_url, homepage_image_urls")
      .eq("show_on_homepage", true),
  ]);

  const slides: ShowcaseSlide[] = [];
  const addSlides = (a: Record<string, unknown>, href: string) => {
    const chosen = ((a.homepage_image_urls as string[] | null) ?? []).filter(Boolean);
    const realPhoto = (a.photos as string[] | null)?.[0] as string | undefined;
    const images = chosen.length > 0 ? chosen : [realPhoto ?? (a.image_url as string | null)].filter(Boolean);

    for (const image of images as string[]) {
      // Plakater (afiser) må vises i sin helhet – ekte foto kan trygt fylle ruten.
      const isPoster = image === a.image_url;
      slides.push({ title: a.title as string, image, href, isPoster });
    }
  };

  for (const a of activities ?? []) addSlides(a, `/aktiviteter/${a.id}`);
  for (const p of programs ?? []) addSlides(p, `/tilbud/${p.id}`);

  return slides.slice(0, limit);
}
