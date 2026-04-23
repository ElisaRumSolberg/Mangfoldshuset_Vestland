import type { MetadataRoute } from "next";
import { fetchUtvalg } from "@/lib/utvalg";

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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const utvalg = await fetchUtvalg();

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
  ];
}
