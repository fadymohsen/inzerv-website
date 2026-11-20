import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon, CarIcon, DocumentIcon, GlobeIcon, HeartIcon, HomeIcon, ShieldIcon, ClipboardListIcon } from "@/components/Icons";
import { Rings } from "@/components/Rings";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.about.title,
    description: t.meta.pages.about,
    alternates: {
      canonical: `https://inzerv.com/${lang}/about`,
      languages: {
        en: "https://inzerv.com/en/about",
        ar: "https://inzerv.com/ar/about",
      },
    },
    openGraph: {
      title: t.about.title,
      description: t.meta.pages.about,
      url: `https://inzerv.com/${lang}/about`,
    },
  };
}

const valueIcons = [ShieldIcon, ClipboardListIcon, GlobeIcon];
const roadmapIcons = [DocumentIcon, HomeIcon, CarIcon, HeartIcon];

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  const app = dict.app;

  return (
    <>
      <PageHero title={t.title} sub={t.lead} shot="track" locale={lang} app={app} />


      {/* Mission */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
          <div className="border-t border-white/10 pt-16 lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:pt-20">
            <h2 className="mb-8 max-w-[14ch] text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-turquoise lg:mb-0 rtl:leading-[1.35]">
              {t.missionTitle}
            </h2>
            <div className="flex max-w-[62ch] flex-col gap-6 text-lg leading-relaxed text-white/80">
              {t.mission.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bg-light">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-12 lg:mb-16">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] rtl:leading-[1.35]">
              {t.valuesTitle}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {t.values.map((v, i) => {
              const Icon = valueIcons[i] ?? ShieldIcon;
              return (
                <div
                  key={v.title}
                  className="flex flex-col gap-6 rounded-2xl border border-navy/8 bg-white p-7 transition-shadow hover:shadow-md"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-navy text-turquoise">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold leading-snug">{v.title}</h3>
                    <p className="mt-3 leading-relaxed text-ink-muted">{v.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="pointer-events-none absolute -end-[16rem] top-1/2 w-[52rem] -translate-y-1/2 opacity-50">
          <Rings className="w-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-12 lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:mb-16">
            <div>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] rtl:leading-[1.35]">
                {t.roadmapTitle}
              </h2>
              <p className="mt-4 max-w-[38ch] text-white/65">{t.roadmapSub}</p>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.roadmap.map((r, i) => {
              const Icon = roadmapIcons[i] ?? DocumentIcon;
              return (
                <li
                  key={r.name}
                  className={`flex flex-col gap-5 rounded-2xl border p-6 ${
                    r.live
                      ? "border-turquoise/30 bg-turquoise/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex size-11 items-center justify-center rounded-xl ${
                        r.live ? "bg-turquoise text-navy" : "bg-white/10 text-white/50"
                      }`}
                    >
                      <Icon size={22} />
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        r.live
                          ? "bg-turquoise/20 text-turquoise"
                          : "border border-white/15 text-white/40"
                      }`}
                    >
                      {r.live ? t.statusLive : t.statusSoon}
                    </span>
                  </div>
                  <div>
                    <p className={`font-semibold leading-snug ${r.live ? "text-white" : "text-white/60"}`}>
                      {r.name}
                    </p>
                    <p className={`mt-1.5 text-sm leading-relaxed ${r.live ? "text-white/75" : "text-white/40"}`}>
                      {r.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-turquoise">
        <div aria-hidden className="pointer-events-none absolute -start-[14rem] top-1/2 w-[48rem] -translate-y-1/2 opacity-20">
          <Rings className="w-full" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 lg:flex-row lg:items-center lg:px-8 lg:py-20">
          <h2 className="max-w-[18ch] text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-navy rtl:leading-[1.3]">
            {t.ctaTitle}
          </h2>
          <ButtonLink href={`/${lang}/request`} variant="navy" className="group/btn min-h-14 shrink-0 px-8 text-base">
            {t.ctaButton}
            <ArrowIcon size={20} />
          </ButtonLink>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `https://inzerv.com/${lang}` },
              { "@type": "ListItem", position: 2, name: t.title, item: `https://inzerv.com/${lang}/about` },
            ],
          }),
        }}
      />
    </>
  );
}
