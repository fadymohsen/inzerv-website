import { buildOgImage, ogSize, ogContentType } from "@/lib/og-image";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, type Locale } from "@/lib/i18n";

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? (lang as Locale) : "en";
  const t = getDictionary(locale);
  return buildOgImage(t.services.metaTitle, t.meta.pages.services);
}
