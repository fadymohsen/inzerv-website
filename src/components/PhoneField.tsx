"use client";

import { useEffect, useState } from "react";
import { inputClass } from "./forms";
import { Select } from "./Select";
import { maxNationalDigits, phoneCountryOptions, type CountryCode } from "@/lib/phone";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import type { Locale } from "@/lib/i18n";

/** Display dial code — shows "+2" for Egypt instead of the full "+20". */
function displayDialCode(dialCode: string, code: CountryCode): string {
  if (code === "EG") return "2";
  return dialCode;
}

export function PhoneField({
  id,
  locale,
  countryLabel,
  searchPlaceholder,
  country,
  onCountryChange,
  value,
  onChange,
  invalid,
  describedBy,
  autoComplete = "tel",
}: {
  id: string;
  locale: Locale;
  countryLabel: string;
  searchPlaceholder?: string;
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy?: string;
  autoComplete?: string;
}) {
  const options = phoneCountryOptions(locale);
  const baseMax = maxNationalDigits(country);
  // EG: allow 11 digits (with leading zero) since we display +2 not +20
  const maxDigits = country === "EG" ? 11 : baseMax;

  // Contact Picker API support (Android Chrome only; iOS Safari not supported)
  const [hasContacts, setHasContacts] = useState(false);
  useEffect(() => {
    setHasContacts(typeof navigator !== "undefined" && "contacts" in navigator);
  }, []);

  function handleChange(raw: string) {
    let cleaned = raw.replace(/\D/g, "");
    // Auto-strip leading zero for countries other than EG (EG uses +2 so user types full 11 digits)
    if (country !== "EG" && cleaned.startsWith("0") && cleaned.length > 1) cleaned = cleaned.slice(1);
    onChange(cleaned.slice(0, maxDigits));
  }

  async function pickFromContacts() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contacts = await (navigator as any).contacts.select(["tel"], { multiple: false });
      if (!contacts?.length || !contacts[0]?.tel?.length) return;
      const raw = String(contacts[0].tel[0]).trim();
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country && parsed.nationalNumber) {
        onCountryChange(parsed.country as CountryCode);
        onChange(parsed.nationalNumber);
      } else {
        // Fallback: strip non-digits and place in the field
        onChange(raw.replace(/\D/g, "").slice(0, maxDigits));
      }
    } catch {
      // User cancelled or permission denied — do nothing
    }
  }

  return (
    <div dir="ltr" className="flex min-w-0 gap-2">
      <div className="w-[8.5rem] shrink-0">
        <Select
          id={`${id}-country`}
          value={country}
          options={options.map((o) => ({
            value: o.code,
            label: `${o.flag} +${displayDialCode(o.dialCode, o.code)} ${o.name}`,
            shortLabel: `${o.flag} +${displayDialCode(o.dialCode, o.code)}`,
          }))}
          onChange={(v) => onCountryChange(v as CountryCode)}
          searchable
          searchPlaceholder={searchPlaceholder}
          aria-invalid={invalid}
          aria-label={countryLabel}
        />
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        value={value}
        maxLength={maxDigits}
        placeholder={locale === "ar" ? `${country === "EG" ? 11 : maxDigits} أرقام` : `${country === "EG" ? 11 : maxDigits} digits`}
        onChange={(e) => handleChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} !w-auto min-w-0 flex-1 text-start`}
      />
      {hasContacts && (
        <button
          type="button"
          onClick={pickFromContacts}
          title={locale === "ar" ? "اختر من جهات الاتصال" : "Pick from contacts"}
          className="flex shrink-0 items-center justify-center rounded-btn border border-line bg-white px-3 text-ink-muted transition-colors hover:border-navy/40 hover:text-navy"
        >
          {/* Address-book icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
            <circle cx="12" cy="10" r="2" />
            <path d="M8 20c.5-2 2-3 4-3s3.5 1 4 3" />
            <path d="M3 7h2M3 11h2M3 15h2" />
          </svg>
        </button>
      )}
    </div>
  );
}
