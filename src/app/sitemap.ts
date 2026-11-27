import type { MetadataRoute } from "next";
import { fetchUtvalg } from "@/lib/utvalg";
import { fetchPrograms, programPath } from "@/lib/recurring";
import { activityPath } from "@/lib/slug";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const paths = [
  "",
  "/om-oss",
  "/utvalg",
  "/aktiviteter",
  "/nyheter",
  "/mangfoldsposten",
  "/bli-med",
  "/kontakt",
  "/personvern",
  "/medlemsvilkar",
];

async function fetchActivityPaths(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("activities").select("id, title, event_date").order("event_date", { ascending: false });
  return (data ?? []).map(activityPath);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [utvalg, programs, activities] = await Promise.all([fetchUtvalg(), fetchPrograms(), fetchActivityPaths()]);

  return [
    ...paths.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: (p === "" || p === "/aktiviteter" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: p === "" ? 1 : 0.7,
    })),
    ...utvalg.map((u) => ({
      url: `${base}/utvalg/${u.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...programs.map((p) => ({
      url: `${base}${programPath(p)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...activities.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
