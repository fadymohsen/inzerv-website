import { ChevronDownIcon } from "./Icons";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-4 text-start text-lg font-medium text-navy">
            {item.q}
            <ChevronDownIcon className="faq-chevron shrink-0 text-navy" size={22} />
          </summary>
          <p className="max-w-[62ch] pb-6 leading-relaxed text-ink-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
