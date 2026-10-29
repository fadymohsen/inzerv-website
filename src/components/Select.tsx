"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type SelectOption = { value: string; label: string };

export function Select({
  id,
  value,
  options,
  placeholder,
  onChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: {
  id: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Scroll active option into view when opening
  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector("[data-active]");
    active?.scrollIntoView({ block: "nearest" });
  }, [open]);

  // Keyboard navigation
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = idx < options.length - 1 ? idx + 1 : 0;
      onChange(options[next].value);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : options.length - 1;
      onChange(options[prev].value);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-list`}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`flex min-h-12 w-full items-center justify-between rounded-btn border bg-white px-4 text-start text-base transition-colors duration-150 ${
          ariaInvalid
            ? "border-error ring-1 ring-error"
            : open
              ? "border-turquoise ring-2 ring-turquoise"
              : "border-line hover:border-navy/40"
        }`}
      >
        <span className={selected ? "text-navy" : "text-text-secondary"}>
          {selected?.label ?? placeholder ?? ""}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`shrink-0 text-navy transition-transform duration-200 rtl:-scale-x-100 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          aria-activedescendant={value ? `${id}-opt-${value}` : undefined}
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-btn border border-line bg-white py-1 shadow-lg shadow-navy/8"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li
                key={o.value}
                id={`${id}-opt-${o.value}`}
                role="option"
                aria-selected={active}
                data-active={active ? "" : undefined}
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
                className={`flex min-h-11 cursor-pointer items-center gap-3 px-4 text-sm transition-colors duration-100 ${
                  active
                    ? "bg-turquoise/10 font-medium text-navy"
                    : "text-navy hover:bg-bg-light"
                }`}
              >
                {active && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-turquoise">
                    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span className={active ? "" : "ps-7"}>{o.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
