import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { CarIcon, DocumentIcon, HeartIcon, HomeIcon } from "@/components/Icons";
import { Rings } from "@/components/Rings";
import { ServiceGrid, type CardData } from "@/components/ServiceGrid";
import { getCatalog } from "@/lib/catalog";
import { getDictionary, money } from "@/lib/dictionaries";
import { serviceNotices } from "@/lib/service-rules";
import { processingTime, serviceDescription, serviceName } from "@/lib/format";
import { hasLocale } from "@/lib/i18n";
import type { GovService } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.services.metaTitle,
    description: t.meta.pages.services,
    alternates: {
      canonical: `https://inzerv.com/${lang}/services`,
      languages: {
        en: "https://inzerv.com/en/services",
        ar: "https://inzerv.com/ar/services",
      },
    },
    openGraph: {
      title: t.services.metaTitle,
      description: t.meta.pages.services,
      url: `https://inzerv.com/${lang}/services`,
    },
  };
}

const categoryIcons = [HomeIcon, CarIcon, HeartIcon];


function labels(s: GovService, lang: "en" | "ar") {
  const pick = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const fields = [...s.fields]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((f) => !f.showForAnotherPerson)
    .map((f) => pick(f.labelEn, f.labelAr));
  const docs = [...s.requiredDocuments]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => pick(d.labelEn, d.labelAr));
  return { fields, docs };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { services, live } = await getCatalog();

  return (
    <>
      <PageHero title={t.services.title} sub={t.services.sub} shot="catalog" locale={lang} app={t.app}>
        {!live && (
          <p role="status" className="mt-8 max-w-[60ch] rounded-btn border border-warning/60 bg-white px-4 py-3 text-sm text-warning">
            {t.services.staleNote}
          </p>
        )}
      </PageHero>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-10 lg:mb-14">
            <h2 className="text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-snug">
              {t.services.docsTitle}
            </h2>
          </div>

          <ServiceGrid
            cards={services.map((s): CardData => {
              const { fields, docs } = labels(s, lang);
              return {
                id: s.type,
                name: serviceName(s, lang),
                price: money(s.servicePrice, lang),
                perCopyLabel: t.common.perCopy,
                timeLabel: t.common.processing,
                time: processingTime(s, lang),
                checkoutHref: `/${lang}/checkout?service=${s.type}`,
                orderLabel: t.common.orderThis,
                isBlocked: !!s.isBlocked,
                blockedLabel: t.checkout.rules.blocked,
                showLabel: t.services.showDetails,
                hideLabel: t.services.hideDetails,
                description: serviceDescription(s, lang),
                notices: serviceNotices(s, lang, t.checkout.rules),
                docs,
                docsLabel: t.services.requiredDocs,
                fields,
                fieldsLabel: t.services.requiredInfo,
              };
            })}
          />
        </div>
      </section>


      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="pointer-events-none absolute -end-[18rem] top-1/2 w-[56rem] -translate-y-1/2 opacity-60">
          <Rings className="w-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-10 lg:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-turquoise/40 bg-turquoise/10 px-4 py-1.5 text-sm font-medium text-turquoise">
              <span className="size-2 animate-pulse rounded-full bg-turquoise" />
              {t.common.comingSoon}
            </span>
            <h2 className="mt-4 max-w-[16ch] text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-snug">
              {t.services.comingTitle}
            </h2>
            <p className="mt-3 max-w-[42ch] text-white/70">{t.services.comingSub}</p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.categories.map((c, i) => {
              const Icon = categoryIcons[i] ?? DocumentIcon;
              return (
                <li
                  key={c.name}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-turquoise/15 text-turquoise">
                    <Icon size={24} />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">{c.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `https://inzerv.com/${lang}` },
              { "@type": "ListItem", position: 2, name: t.services.title, item: `https://inzerv.com/${lang}/services` },
            ],
          }),
        }}
      />

      {/* Service structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t.services.docsTitle,
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: serviceName(s, lang),
                description: serviceDescription(s, lang),
                serviceType: "Government Document Processing",
                provider: { "@type": "Organization", name: "Inzerv", url: "https://inzerv.com" },
                areaServed: { "@type": "Country", name: "Egypt" },
                url: `https://inzerv.com/${lang}/checkout?service=${s.type}`,
                offers: {
                  "@type": "Offer",
                  priceCurrency: "EGP",
                  price: s.servicePrice,
                  availability: "https://schema.org/InStock",
                },
              },
            })),
          }),
        }}
      />
    </>
  );
}

