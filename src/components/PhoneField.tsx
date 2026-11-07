"use client";

import { inputClass } from "./forms";
import { Select } from "./Select";
import { maxNationalDigits, phoneCountryOptions, type CountryCode } from "@/lib/phone";
import type { Locale } from "@/lib/i18n";

export function PhoneField({
  id,
  locale,
  countryLabel,
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
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy?: string;
  autoComplete?: string;
}) {
  const options = phoneCountryOptions(locale);
  const maxDigits = maxNationalDigits(country);

  return (
    <div dir="ltr" className="flex gap-2">
      <div className="w-28 shrink-0">
        <Select
          id={`${id}-country`}
          value={country}
          options={options.map((o) => ({
            value: o.code,
            label: `+${o.dialCode} ${o.name}`,
            shortLabel: `+${o.dialCode}`,
          }))}
          onChange={(v) => onCountryChange(v as CountryCode)}
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
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, maxDigits))}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} !w-auto min-w-0 flex-1 text-start`}
      />
    </div>
  );
}
