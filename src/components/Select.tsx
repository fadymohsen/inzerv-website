"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/** `shortLabel`, if given, is shown only on the closed button; the open list always shows `label`. */
export type SelectOption = { value: string; label: string; shortLabel?: string };

export function Select({
  id,
  value,
  options,
  placeholder,
  onChange,
  searchable = false,
  searchPlaceholder,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
}: {
  id: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  /** Adds a type-to-filter box at the top of the list — for long lists (e.g. country pickers). */
  searchable?: boolean;
  searchPlaceholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => {
    setOpen((o) => !o);
    setQuery("");
  }, []);

  const filtered =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

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

  // Focus the filter box fresh each time the list opens.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

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
      toggle();
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

  function onSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    if (e.key === "Enter" && filtered.length) {
      e.preventDefault();
      onChange(filtered[0].value);
      close();
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
        aria-label={ariaLabel}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={`flex min-h-12 w-full items-center justify-between rounded-btn border bg-white px-4 text-start text-base transition-colors duration-150 ${
          ariaInvalid
            ? "border-error ring-1 ring-error"
            : open
              ? "border-turquoise ring-2 ring-turquoise"
              : "border-line hover:border-navy/40"
        }`}
      >
        <span className={`truncate ${selected ? "text-navy" : "text-text-secondary"}`}>
          {(selected?.shortLabel ?? selected?.label) ?? placeholder ?? ""}
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
        <div
          className={`absolute z-50 mt-1.5 overflow-hidden rounded-btn border border-line bg-white shadow-lg shadow-navy/8 ${
            searchable ? "min-w-[14rem] w-max max-w-[min(20rem,90vw)]" : "w-full"
          }`}
        >
          {searchable && (
            <div className="border-b border-line p-2">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="block min-h-10 w-full rounded-btn border border-line bg-bg-light px-3 text-sm text-navy placeholder:text-text-secondary focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise"
              />
            </div>
          )}
          <ul
            id={`${id}-list`}
            ref={listRef}
            role="listbox"
            aria-activedescendant={value ? `${id}-opt-${value}` : undefined}
            className="max-h-64 overflow-auto py-1"
          >
            {filtered.length === 0 && <li className="px-4 py-3 text-sm text-ink-muted">—</li>}
            {filtered.map((o) => {
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
                  className={`flex min-h-11 cursor-pointer items-center gap-3 whitespace-nowrap px-4 text-sm transition-colors duration-100 ${
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
        </div>
      )}
    </div>
  );
}
