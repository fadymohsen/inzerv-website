import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import metadata from "libphonenumber-js/metadata.max.json";

export type { CountryCode };

export const DEFAULT_PHONE_COUNTRY: CountryCode = "EG";

export type PhoneCountryOption = { code: CountryCode; dialCode: string; name: string; flag: string };

const optionsCache = new Map<string, PhoneCountryOption[]>();

/** Regional-indicator flag emoji for a 2-letter ISO country code, e.g. "QA" -> "🇶🇦". */
export function flagEmoji(code: CountryCode): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/** Dial-code options for the phone country picker, sorted by localized country name. */
export function phoneCountryOptions(locale: string): PhoneCountryOption[] {
  const cached = optionsCache.get(locale);
  if (cached) return cached;
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const options = getCountries()
    .map((code) => ({ code, dialCode: getCountryCallingCode(code), name: names.of(code) ?? code, flag: flagEmoji(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  optionsCache.set(locale, options);
  return options;
}

/**
 * Normalizes case/whitespace and returns the matching dial-code country, since a
 * country code from an external catalog may arrive as e.g. "qa" or " QA " rather
 * than the exact-cased ISO value libphonenumber-js expects (it rejects anything else,
 * silently failing every validation for that country). Returns null when unrecognized.
 */
export function normalizePhoneCountry(code: string): CountryCode | null {
  const normalized = code.trim().toUpperCase();
  return (getCountries() as readonly string[]).includes(normalized) ? (normalized as CountryCode) : null;
}

/** A generous default for countries whose metadata entry has no usable length data. */
const DEFAULT_MAX_NATIONAL_DIGITS = 15;

/**
 * The most digits a national number can have for `country`.
 * Used to stop a phone field accepting arbitrarily long input.
 */
export function maxNationalDigits(country: CountryCode): number {
  const lengths = (metadata.countries as Record<string, unknown[]>)[country]?.[3];
  if (!Array.isArray(lengths) || lengths.length === 0) return DEFAULT_MAX_NATIONAL_DIGITS;
  return Math.max(...(lengths as number[]));
}

/** True length and format for `country`'s numbering plan (not just a plausible length). `nationalNumber` excludes the dial code. */
export function isPhoneLengthValid(nationalNumber: string, country: CountryCode): boolean {
  const trimmed = nationalNumber.trim();
  if (!trimmed) return false;
  return isValidPhoneNumber(trimmed, country);
}

/** Combines a national number with its country's dial code into E.164, e.g. "+201070608705". */
export function toE164(nationalNumber: string, country: CountryCode): string | null {
  const phone = parsePhoneNumberFromString(nationalNumber.trim(), country);
  return phone ? phone.number : null;
}

/** Best-effort split of a stored phone value (E.164 or bare local digits) for prefilling an edit form. */
export function splitPhone(
  value: string,
  fallbackCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): { country: CountryCode; national: string } {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    const phone = parsePhoneNumberFromString(trimmed);
    if (phone?.country) return { country: phone.country, national: phone.nationalNumber };
  }
  return { country: fallbackCountry, national: trimmed.replace(/^0+/, "") };
}
