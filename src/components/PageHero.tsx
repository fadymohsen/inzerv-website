import type { Dict } from "@/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import { IPhone, type Shot } from "./IPhone";
import { HeroWords } from "./Motion";
import { Rings } from "./Rings";

export function PageHero({
  title,
  sub,
  shot,
  locale,
  app,
  children,
}: {
  title: string;
  sub: string;
  shot: Shot;
  locale: Locale;
  app: Dict["app"];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="hero-rings pointer-events-none absolute -end-[14rem] top-1/2 hidden w-[56rem] -translate-y-1/2 lg:block"><Rings className="w-full" /></div>
      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-5 pt-20 lg:grid-cols-[1.35fr_1fr] lg:px-8 lg:pt-28">
        <div className="pb-14 lg:pb-28">
          <h1 className="max-w-[16ch] text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.035em] rtl:leading-[1.25]">
            <HeroWords text={title} />
          </h1>
          <p className="fade-up mt-7 max-w-[50ch] text-xl leading-relaxed text-white/80" style={{ ["--d" as string]: "500ms" } as React.CSSProperties}>{sub}</p>
          {children}
        </div>
        <div className="rise mx-auto hidden w-[17rem] lg:block" style={{ ["--rise-from" as string]: "80px", ["--rise-delay" as string]: "300ms" } as React.CSSProperties}>
          <IPhone shot={shot} locale={locale} t={app} priority sizes="17rem" className="translate-y-[7%] drop-shadow-[0_2rem_2.5rem_rgba(0,0,0,0.35)]" />
        </div>
      </div>
    </section>
  );
}
