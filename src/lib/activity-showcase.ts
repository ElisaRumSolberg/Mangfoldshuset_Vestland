import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import type { ShowcaseSlide } from "@/components/ActivityShowcase";

/** Bilder fra aktiviteter administrator har valgt å vise i karusellen på forsiden. */
export async function fetchActivityShowcaseSlides(limit = 6): Promise<ShowcaseSlide[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("activities")
    .select("id, title, photos, image_url, event_date")
    .eq("show_on_homepage", true)
    .order("event_date", { ascending: false })
    .limit(limit);

  const slides: ShowcaseSlide[] = [];
  for (const a of data ?? []) {
    const realPhoto = (a.photos as string[] | null)?.[0] as string | undefined;
    const image = realPhoto ?? (a.image_url as string | null);
    if (!image) continue;
    // Plakater (afiser) må vises i sin helhet – ekte foto kan trygt fylle ruten.
    slides.push({ title: a.title as string, image, href: `/aktiviteter/${a.id}`, isPoster: !realPhoto });
  }

  return slides;
}
