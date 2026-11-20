import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/lib/i18n";

const base = "https://inzerv.co";

type SitemapPage = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified: string;
};

const pages: SitemapPage[] = [
  { path: "",                changeFrequency: "weekly",  priority: 1.0, lastModified: "2026-11-20" },
  { path: "/services",       changeFrequency: "weekly",  priority: 0.9, lastModified: "2026-11-20" },
  { path: "/about",          changeFrequency: "monthly", priority: 0.7, lastModified: "2026-10-20" },
  { path: "/contact",        changeFrequency: "monthly", priority: 0.6, lastModified: "2026-10-20" },
  { path: "/terms",          changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-15" },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-15" },
  { path: "/refund-policy",  changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-15" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    pages.map(({ path, changeFrequency, priority, lastModified }) => {
      const langAlternates = Object.fromEntries(
        locales.map((l) => [l, `${base}/${l}${path}`])
      );
      return {
        url: `${base}/${lang}${path}`,
        lastModified: new Date(lastModified),
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ...langAlternates,
            "x-default": `${base}/${defaultLocale}${path}`,
          },
        },
      };
    })
  );
}
