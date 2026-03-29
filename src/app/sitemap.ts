import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const paths = [
  "",
  "/om-oss",
  "/aktiviteter",
  "/nyheter",
  "/nyheter/mangfoldsposten",
  "/bli-med",
  "/kontakt",
  "/personvern",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "/aktiviteter" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
