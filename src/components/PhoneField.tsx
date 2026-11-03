"use client";

import { inputClass } from "./forms";
import { phoneCountryOptions, type CountryCode } from "@/lib/phone";
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

  return (
    <div dir="ltr" className="flex gap-2">
      <select
        id={`${id}-country`}
        value={country}
        onChange={(e) => onCountryChange(e.target.value as CountryCode)}
        aria-label={countryLabel}
        className={`${inputClass} !w-[6.5rem] shrink-0 px-2`}
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            +{o.dialCode} {o.code}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} !w-auto min-w-0 flex-1 text-start`}
      />
    </div>
  );
}
