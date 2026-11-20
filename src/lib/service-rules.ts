import type { Dict } from "@/dictionaries/en";
import { fmt } from "./dictionaries";
import { countryName } from "./format";
import type { GeoRule, GovService } from "./types";
import type { Locale } from "./i18n";

export const canOrderMyself = (s?: GovService) => s?.allowMyself !== false;
export const canOrderOther = (s?: GovService) => s?.allowOther !== false;

/** "Egypt (Cairo, Alexandria), Qatar (all cities)" */
export function describeGeo(rule: GeoRule, locale: Locale, allCities: string): string {
  return rule
    .map((r) => {
      const name = countryName(r.code, r.code, locale);
      const cities = r.cities ? r.cities.map((c) => (locale === "ar" ? c.ar : c.en)).join(locale === "ar" ? "، " : ", ") : allCities;
      return `${name} (${cities})`;
    })
    .join(locale === "ar" ? "؛ " : "; ");
}

/** Short notices to show on the services list and the single-service page. */
export function serviceNotices(s: GovService, locale: Locale, t: Dict["checkout"]["rules"]): string[] {
  const out: string[] = [];
  if (s.isBlocked) out.push(t.blockedNote);
  if (s.relationshipRule === "first" && canOrderOther(s)) out.push(t.firstDegree);
  if (s.residenceRule?.length) {
    out.push(s.type === "criminal_record" ? t.criminalRecordResidenceNote : fmt(t.residenceOnly, { places: describeGeo(s.residenceRule, locale, t.allCities) }));
  }
  if (s.deliveryRule?.length) out.push(fmt(t.deliveryOnly, { places: describeGeo(s.deliveryRule, locale, t.allCities) }));
  return out;
}
