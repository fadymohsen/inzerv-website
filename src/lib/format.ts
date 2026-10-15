import type { GovService } from "./types";
import type { Locale } from "./i18n";

const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function digits(value: string, locale: Locale): string {
  return locale === "ar" ? value.replace(/\d/g, (d) => arabicDigits[Number(d)]) : value;
}

export function serviceName(s: GovService, locale: Locale): string {
  return locale === "ar" ? s.nameAr : s.nameEn;
}

export function serviceDescription(s: GovService, locale: Locale): string {
  return (locale === "ar" ? s.descriptionAr : s.descriptionEn) ?? "";
}

/** The API returns English estimates like "5–7 business days". */
export function processingTime(s: GovService, locale: Locale): string {
  const raw = s.estimatedProcessingTime ?? "";
  if (locale !== "ar") return raw;
  return digits(raw.replace(/business days?/i, "أيام عمل"), locale);
}

export function pad2(n: number, locale: Locale): string {
  return digits(String(n).padStart(2, "0"), locale);
}

export function countryName(code: string, fallback: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
}

export function firstSentence(text: string): string {
  const first = text.split(/(?<=[.!؟])\s/)[0] ?? text;
  return first.replace(/\.$/, "") + ".";
}
