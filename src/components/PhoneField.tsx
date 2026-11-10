"use client";

import { inputClass } from "./forms";
import { Select } from "./Select";
import { maxNationalDigits, phoneCountryOptions, type CountryCode } from "@/lib/phone";
import type { Locale } from "@/lib/i18n";

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
  placeholder,
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
  placeholder?: string;
}) {
  const options = phoneCountryOptions(locale);
  const maxDigits = maxNationalDigits(country);

  function handleChange(raw: string) {
    let cleaned = raw.replace(/\D/g, "");
    // Auto-strip leading zero (trunk prefix) for countries that use one
    if (cleaned.startsWith("0") && cleaned.length > 1) cleaned = cleaned.slice(1);
    onChange(cleaned.slice(0, maxDigits));
  }

  return (
    <div dir="ltr" className="flex gap-2">
      <div className="w-28 shrink-0">
        <Select
          id={`${id}-country`}
          value={country}
          options={options.map((o) => ({
            value: o.code,
            label: `${o.flag} +${o.dialCode} ${o.name}`,
            shortLabel: `${o.flag} +${o.dialCode}`,
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
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} !w-auto min-w-0 flex-1 text-start`}
      />
    </div>
  );
}
