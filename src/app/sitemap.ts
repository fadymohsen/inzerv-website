import type { MetadataRoute } from "next";

const base = "https://inzerv.co";

const pages: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number; lastModified: string }> = [
  { path: "",                changeFrequency: "weekly",  priority: 1.0, lastModified: "2026-10-25" },
  { path: "/services",       changeFrequency: "weekly",  priority: 0.9, lastModified: "2026-10-25" },
  { path: "/about",          changeFrequency: "monthly", priority: 0.7, lastModified: "2026-10-20" },
  { path: "/contact",        changeFrequency: "monthly", priority: 0.6, lastModified: "2026-10-20" },
  { path: "/terms",          changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-15" },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-15" },
  { path: "/refund-policy",  changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-15" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return (["en", "ar"] as const).flatMap((lang) =>
    pages.map(({ path, changeFrequency, priority, lastModified }) => ({
      url: `${base}/${lang}${path}`,
      lastModified: new Date(lastModified),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${base}/en${path}`,
          ar: `${base}/ar${path}`,
        },
      },
    }))
  );
}
