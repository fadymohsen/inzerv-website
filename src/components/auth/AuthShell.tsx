import type { Dict } from "@/dictionaries/en";
import { CheckIcon } from "@/components/Icons";
import { Rings } from "@/components/Rings";

export function AuthShell({
  t,
  title,
  sub,
  children,
}: {
  t: Dict["auth"];
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-bg-light">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8 lg:py-20">
        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Rings className="pointer-events-none absolute -end-48 top-1/2 w-[40rem] -translate-y-1/2 opacity-90" />
          <h2 className="relative max-w-[14ch] text-[clamp(2rem,3vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] rtl:leading-[1.35]">
            {t.sideTitle}
          </h2>
          <ul className="relative mt-16 flex flex-col gap-4">
            {t.sidePoints.map((p) => (
              <li key={p} className="flex items-center gap-3 text-lg text-white/85">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-turquoise text-navy">
                  <CheckIcon size={14} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-card border border-line bg-white p-6 sm:p-10">
          <h1 className="text-[clamp(1.875rem,3.4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-[1.35]">
            {title}
          </h1>
          {sub && <p className="mt-3 max-w-[46ch] text-ink-muted">{sub}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
