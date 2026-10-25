import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon, CarIcon, DocumentIcon, HeartIcon, HomeIcon, TagIcon } from "@/components/Icons";
import { getDictionary } from "@/lib/dictionaries";
import { pad2 } from "@/lib/format";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.about.title,
    description: t.meta.pages.about,
    alternates: {
      canonical: `https://inzerv.co/${lang}/about`,
      languages: {
        en: "https://inzerv.co/en/about",
        ar: "https://inzerv.co/ar/about",
      },
    },
    openGraph: {
      title: t.about.title,
      description: t.meta.pages.about,
      url: `https://inzerv.co/${lang}/about`,
    },
  };
}

const roadmapIcons = [DocumentIcon, HomeIcon, CarIcon, HeartIcon, TagIcon];

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  const app = dict.app;

  return (
    <>
      <PageHero title={t.title} sub={t.lead} shot="track" locale={lang} app={app} />

      <section className="bg-bg-light">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8 lg:py-28">
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] rtl:leading-[1.35]">
            {t.missionTitle}
          </h2>
          <div className="flex max-w-[62ch] flex-col gap-6 text-lg leading-relaxed text-ink-muted">
            {t.mission.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8 lg:py-28">
          <h2 className="self-start text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] lg:sticky lg:top-28 rtl:leading-[1.35]">
            {t.valuesTitle}
          </h2>
          <ol className="border-t border-line">
            {t.values.map((v, i) => (
              <li key={v.title} className="grid gap-3 border-b border-line py-8 sm:grid-cols-[4rem_1fr]">
                <span className="tabular text-sm font-medium text-ink-muted">{pad2(i + 1, lang)}</span>
                <div>
                  <h3 className="text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-3 max-w-[54ch] leading-relaxed text-ink-muted">{v.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-bg-light">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8 lg:py-28">
          <div>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] rtl:leading-[1.35]">
              {t.roadmapTitle}
            </h2>
            <p className="mt-4 max-w-[40ch] text-ink-muted">{t.roadmapSub}</p>
          </div>
          <ul className="border-t border-line">
            {t.roadmap.map((r, i) => {
              const Icon = roadmapIcons[i] ?? DocumentIcon;
              return (
                <li key={r.name} className="flex items-center gap-5 border-b border-line py-6">
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-btn ${
                      r.live ? "bg-turquoise text-navy" : "bg-white text-navy"
                    }`}
                  >
                    <Icon size={24} />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-ink-muted">{r.text}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.live ? "bg-navy text-white" : "border border-line bg-white text-ink-muted"
                    }`}
                  >
                    {r.live ? t.statusLive : t.statusSoon}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-turquoise">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 lg:flex-row lg:items-center lg:px-8">
          <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-navy rtl:leading-[1.35]">
            {t.ctaTitle}
          </h2>
          <ButtonLink href={`/${lang}/checkout`} variant="navy" className="px-8">
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
              { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `https://inzerv.co/${lang}` },
              { "@type": "ListItem", position: 2, name: t.title, item: `https://inzerv.co/${lang}/about` },
            ],
          }),
        }}
      />
    </>
  );
}
