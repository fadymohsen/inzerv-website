"use client";

import { useEffect, useRef } from "react";

/** Bottom sheet on phones, centred card on larger screens. */
export function Modal({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input") ?? []);
    focusable()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        tabIndex={-1}
        aria-label={label}
        onClick={onClose}
        className="absolute inset-0 bg-navy/60"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="fade-up relative m-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_2rem_4rem_-1rem_rgba(3,26,48,0.5)] sm:p-7"
      >
        {children}
      </div>
    </div>
  );
}
