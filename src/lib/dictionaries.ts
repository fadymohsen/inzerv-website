import { en, type Dict } from "@/dictionaries/en";
import { ar } from "@/dictionaries/ar";
import type { Locale } from "./i18n";

const dictionaries: Record<Locale, Dict> = { en, ar };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export function money(amount: number, locale: Locale): string {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return locale === "ar" ? `${n} ج.م` : `EGP ${n}`;
}

export function num(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(n);
}
