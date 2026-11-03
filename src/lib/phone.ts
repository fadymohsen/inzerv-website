import {
  getCountries,
  getCountryCallingCode,
  isPossiblePhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

export type { CountryCode };

export const DEFAULT_PHONE_COUNTRY: CountryCode = "EG";

export type PhoneCountryOption = { code: CountryCode; dialCode: string; name: string };

const optionsCache = new Map<string, PhoneCountryOption[]>();

/** Dial-code options for the phone country picker, sorted by localized country name. */
export function phoneCountryOptions(locale: string): PhoneCountryOption[] {
  const cached = optionsCache.get(locale);
  if (cached) return cached;
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const options = getCountries()
    .map((code) => ({ code, dialCode: getCountryCallingCode(code), name: names.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  optionsCache.set(locale, options);
  return options;
}

export function isSupportedPhoneCountry(code: string): code is CountryCode {
  return (getCountries() as readonly string[]).includes(code);
}

/** Plausible length for `country`'s numbering plan. `nationalNumber` excludes the dial code. */
export function isPhoneLengthValid(nationalNumber: string, country: CountryCode): boolean {
  const trimmed = nationalNumber.trim();
  if (!trimmed) return false;
  return isPossiblePhoneNumber(trimmed, country);
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
