"use client";

import { useState } from "react";
import { inputClass } from "@/components/forms";

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
  describedBy,
  showLabel,
  hideLabel,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
  describedBy?: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={shown ? "text" : "password"}
        dir="ltr"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} pe-20 text-start`}
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-pressed={shown}
        className="absolute inset-y-0 end-1 my-1 rounded-lg px-3 text-sm font-medium text-ink-muted hover:text-navy"
      >
        {shown ? hideLabel : showLabel}
      </button>
    </div>
  );
}
