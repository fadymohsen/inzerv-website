/**
 * Profiles store the country as typed at sign-up ("Egypt", "مصر") or as a 2-letter code.
 * Intl.DisplayNames throws on anything that is not a region code, so every lookup goes through here.
 */
const CODE = /^[A-Za-z]{2}$/;

export function regionName(value: string, locale: string): string {
  if (!value) return "";
  if (!CODE.test(value.trim())) return value;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(value.trim().toUpperCase()) ?? value;
  } catch {
    return value;
  }
}

/** Best-effort: a region code, or the code whose English/Arabic name matches the text. "" when unknown. */
export function toCountryCode(value: string, codes: readonly string[]): string {
  const v = value.trim();
  if (!v) return "";
  if (CODE.test(v) && codes.includes(v.toUpperCase())) return v.toUpperCase();
  const key = v.toLowerCase();
  for (const code of codes) {
    for (const loc of ["en", "ar"]) {
      try {
        const name = new Intl.DisplayNames([loc], { type: "region" }).of(code);
        if (name && name.toLowerCase() === key) return code;
      } catch {
        /* unknown code for this runtime */
      }
    }
  }
  return "";
}
