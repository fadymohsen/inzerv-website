"use client";

import { useEffect, useState } from "react";

type Item = { id: string; n: string; label: string };

export function LegalToc({ items, title }: { items: Item[]; title: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const list = (
    <ol className="flex flex-col gap-1">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            className={`flex items-baseline gap-3 rounded-lg px-3 py-2 text-[0.9375rem] leading-snug transition-colors duration-150 ${
              active === i.id ? "bg-bg-light font-semibold text-navy" : "text-ink-muted hover:text-navy"
            }`}
          >
            <span className="tabular w-5 shrink-0 text-xs">{i.n}</span>
            {i.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      {/* desktop: sticky list */}
      <nav aria-label={title} className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <p className="mb-3 px-3 text-sm font-medium text-ink-muted">{title}</p>
        {list}
      </nav>

      {/* mobile: collapsible */}
      <details className="rounded-card border border-line bg-white lg:hidden">
        <summary className="flex min-h-14 cursor-pointer items-center justify-between px-5 font-medium">
          {title}
          <span aria-hidden className="faq-chevron text-ink-muted">
            ▾
          </span>
        </summary>
        <div className="px-2 pb-3">{list}</div>
      </details>
    </>
  );
}
