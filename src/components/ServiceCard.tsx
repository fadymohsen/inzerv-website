"use client";

import { useState } from "react";
import { ArrowIcon, ChevronDownIcon } from "./Icons";

export function ServiceCard({
  name,
  price,
  perCopyLabel,
  timeLabel,
  time,
  checkoutHref,
  orderLabel,
  isBlocked,
  blockedLabel,
  showLabel,
  hideLabel,
  children,
}: {
  name: string;
  price: string;
  perCopyLabel: string;
  timeLabel: string;
  time: string;
  checkoutHref: string;
  orderLabel: string;
  isBlocked: boolean;
  blockedLabel: string;
  showLabel: string;
  hideLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="group/card flex flex-col rounded-2xl border border-navy/10 bg-white overflow-hidden transition-shadow hover:shadow-md">
      {/* Always-visible header */}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {/* Name row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em]">{name}</h3>
          {!isBlocked && (
            <a
              href={checkoutHref}
              aria-label={orderLabel}
              className="group/btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-navy hover:text-white"
            >
              <ArrowIcon size={16} />
            </a>
          )}
        </div>

        {/* Price + time row */}
        <div className="flex items-end justify-between gap-3 border-t border-navy/8 pt-4">
          <p className="tabular text-2xl font-semibold tracking-tight leading-none">
            {price}
            <span className="ms-1 text-sm font-normal text-ink-muted">{perCopyLabel}</span>
          </p>
          <p className="text-right text-sm text-ink-muted">
            <span className="block">{timeLabel}</span>
            <span className="font-medium text-navy">{time}</span>
          </p>
        </div>

        {/* Details toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1.5 self-start text-sm font-medium text-ink-muted transition-colors hover:text-navy"
        >
          <ChevronDownIcon
            size={16}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
          {open ? hideLabel : showLabel}
        </button>
      </div>

      {/* Expandable details — CSS grid rows trick for smooth animation */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-5 border-t border-navy/8 px-5 pb-6 pt-5 sm:px-6">
            {children}

            {isBlocked ? (
              <p className="inline-flex min-h-11 items-center rounded-btn border border-line px-5 text-sm font-medium text-ink-muted">
                {blockedLabel}
              </p>
            ) : (
              <a
                href={checkoutHref}
                className="group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-btn bg-navy px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {orderLabel}
                <ArrowIcon size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
