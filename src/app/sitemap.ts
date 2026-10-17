import type { MetadataRoute } from "next";

const base = "https://inzerv.co";

const pages: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "",                changeFrequency: "weekly",  priority: 1.0 },
  { path: "/services",       changeFrequency: "weekly",  priority: 0.9 },
  { path: "/about",          changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact",        changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms",          changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/refund-policy",  changeFrequency: "monthly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return (["en", "ar"] as const).flatMap((lang) =>
    pages.map(({ path, changeFrequency, priority }) => ({
      url: `${base}/${lang}${path}`,
      lastModified: new Date(),
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
