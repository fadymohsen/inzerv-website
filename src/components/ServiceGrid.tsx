"use client";

import { useState } from "react";
import { ArrowIcon, ChevronDownIcon, CloseIcon } from "./Icons";

export type CardData = {
  id: string;
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
  description: string;
  notices: string[];
  docs: string[];
  docsLabel: string;
  fields: string[];
  fieldsLabel: string;
};

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-ink-muted">{title}</h4>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-snug">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-turquoise" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailContent({ card }: { card: CardData }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-ink-muted">{card.description}</p>
      {card.notices.length > 0 && (
        <ul className="flex flex-col gap-1.5 rounded-btn bg-bg-light px-4 py-3 text-sm leading-relaxed text-navy">
          {card.notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      <BulletList title={card.docsLabel} items={card.docs} />
      <BulletList title={card.fieldsLabel} items={card.fields} />
      {card.isBlocked ? (
        <p className="inline-flex min-h-11 items-center rounded-btn border border-line px-5 text-sm font-medium text-ink-muted">
          {card.blockedLabel}
        </p>
      ) : (
        <a
          href={card.checkoutHref}
          className="group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-btn bg-navy px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {card.orderLabel}
          <ArrowIcon size={18} />
        </a>
      )}
    </div>
  );
}

export function ServiceGrid({ cards }: { cards: CardData[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  const openCard = cards.find((c) => c.id === openId) ?? null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const isOpen = openId === card.id;
          return (
            <li key={card.id} id={card.id}>
              <article className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white transition-shadow hover:shadow-md">
                {/* Always-visible header */}
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  {/* Name + order arrow */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em]">{card.name}</h3>
                    {!card.isBlocked && (
                      <a
                        href={card.checkoutHref}
                        aria-label={card.orderLabel}
                        className="group/btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-turquoise/20 text-turquoise transition-colors hover:bg-turquoise hover:text-white"
                      >
                        <ArrowIcon size={16} />
                      </a>
                    )}
                  </div>

                  {/* Price + time */}
                  <div className="flex items-end justify-between gap-3 border-t border-navy/8 pt-4">
                    <p className="tabular text-2xl font-semibold leading-none tracking-tight">
                      {card.price}
                      <span className="ms-1 text-sm font-normal text-ink-muted">{card.perCopyLabel}</span>
                    </p>
                    <p className="text-right text-sm text-ink-muted">
                      <span className="block">{card.timeLabel}</span>
                      <span className="font-medium text-navy">{card.time}</span>
                    </p>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => toggle(card.id)}
                    aria-expanded={isOpen}
                    className="flex items-center gap-1.5 self-start text-sm font-medium text-ink-muted transition-colors hover:text-navy"
                  >
                    {/* Mobile/tablet: chevron + toggle label */}
                    <ChevronDownIcon
                      size={16}
                      className={`transition-transform duration-300 lg:hidden ${isOpen ? "rotate-180" : ""}`}
                    />
                    <span className="lg:hidden">{isOpen ? card.hideLabel : card.showLabel}</span>
                    {/* Desktop: static label — opens modal */}
                    <span className="hidden lg:inline">{card.showLabel} ↗</span>
                  </button>
                </div>

                {/* Mobile / small tablet inline accordion */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out lg:hidden ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-5 border-t border-navy/8 px-5 pb-6 pt-5 sm:px-6">
                      <DetailContent card={card} />
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Desktop modal */}
      {openCard && (
        <div
          className="fixed inset-0 z-50 hidden items-center justify-center bg-navy/50 backdrop-blur-sm lg:flex"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative mx-6 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold leading-snug tracking-[-0.02em]">{openCard.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                  <p className="tabular text-xl font-semibold">
                    {openCard.price}
                    <span className="ms-1 text-sm font-normal text-ink-muted">{openCard.perCopyLabel}</span>
                  </p>
                  <p className="text-sm text-ink-muted">
                    {openCard.timeLabel}:{" "}
                    <span className="font-medium text-navy">{openCard.time}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-navy hover:text-white"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <DetailContent card={openCard} />
          </div>
        </div>
      )}
    </>
  );
}
