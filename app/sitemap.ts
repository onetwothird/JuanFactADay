import type { MetadataRoute } from "next";
import { getAllFacts, SITE } from "@/lib/facts";
import { CATEGORIES } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const facts = getAllFacts();
  const used = new Set(facts.map((f) => f.category));
  return [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/facts`, changeFrequency: "daily", priority: 0.9 },
    ...facts.map((f) => ({ url: `${SITE.url}/facts/${f.slug}`, lastModified: f.verified || f.published, priority: 0.8 })),
    ...CATEGORIES.filter((c) => used.has(c.slug)).map((c) => ({ url: `${SITE.url}/kategorya/${c.slug}`, priority: 0.6 })),
    { url: `${SITE.url}/quiz`, priority: 0.6 },
    { url: `${SITE.url}/tungkol`, priority: 0.4 },
    { url: `${SITE.url}/suggest`, priority: 0.3 },
  ];
}
