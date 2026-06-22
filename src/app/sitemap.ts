import { MetadataRoute } from "next";

const BASE_URL = "https://cabinet-gyneco.vercel.app";
const locales = ["fr", "ar"] as const;

type PageEntry = { path: string; priority: string };

const pages: PageEntry[] = [
  { path: "", priority: "1.0" },
  { path: "about", priority: "0.8" },
  { path: "services", priority: "0.9" },
  { path: "blog", priority: "0.7" },
  { path: "contact", priority: "0.6" },
  { path: "privacy", priority: "0.3" },
  { path: "legal", priority: "0.3" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.priority === "1.0" ? "weekly" as const : "monthly" as const,
        priority: parseFloat(page.priority),
        alternates: {
          languages: {
            fr: `${BASE_URL}/fr/${page.path}`,
            ar: `${BASE_URL}/ar/${page.path}`,
          },
        },
      });
    }
  }

  return entries;
}
