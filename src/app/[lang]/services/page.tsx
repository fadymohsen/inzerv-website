import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon, CarIcon, DocumentIcon, HeartIcon, HomeIcon, TagIcon } from "@/components/Icons";
import { getCatalog } from "@/lib/catalog";
import { getDictionary, money } from "@/lib/dictionaries";
import { countryName, processingTime, serviceDescription, serviceName } from "@/lib/format";
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
      canonical: `https://inzerv.co/${lang}/services`,
      languages: {
        en: "https://inzerv.co/en/services",
        ar: "https://inzerv.co/ar/services",
      },
    },
  };
}

const categoryIcons = [HomeIcon, CarIcon, HeartIcon, TagIcon];

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-ink-muted">{title}</h4>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[0.9375rem] leading-snug">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-turquoise" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  const { services, destinations, live } = await getCatalog();

  const inside = destinations.filter((d) => d.zone === "inside_egypt");
  const outside = destinations.filter((d) => d.zone === "outside_egypt");

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
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <h2 className="text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-snug">
                {t.services.docsTitle}
              </h2>
              <p className="mt-3 max-w-[40ch] text-ink-muted">{t.services.docsSub}</p>
            </div>

            <div className="border-t border-line">
              {services.map((s) => {
                const { fields, docs } = labels(s, lang);
                return (
                  <article key={s.type} id={s.type} className="grid gap-8 border-b border-line py-10 md:grid-cols-[1fr_1fr]">
                    <div>
                      <h3 className="text-2xl font-semibold">{serviceName(s, lang)}</h3>
                      <p className="mt-3 max-w-[48ch] leading-relaxed text-ink-muted">
                        {serviceDescription(s, lang)}
                      </p>
                      <dl className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm text-ink-muted">{t.services.feeLabel}</dt>
                          <dd className="tabular mt-1 text-xl font-semibold">
                            {money(s.servicePrice, lang)}
                            <span className="ms-1 text-sm font-normal text-ink-muted">{t.common.perCopy}</span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-ink-muted">{t.common.processing}</dt>
                          <dd className="mt-1 text-xl font-semibold">{processingTime(s, lang)}</dd>
                        </div>
                      </dl>
                      <ButtonLink href={`/${lang}/checkout?service=${s.type}`} className="mt-7">
                        {t.common.orderThis}
                        <ArrowIcon size={20} />
                      </ButtonLink>
                    </div>
                    <div className="flex flex-col gap-7">
                      <ListBlock title={t.services.requiredDocs} items={docs} />
                      <ListBlock title={t.services.requiredInfo} items={fields} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-light">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <h2 className="text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-snug">
                {t.services.deliveryTitle}
              </h2>
              <p className="mt-3 max-w-[40ch] text-ink-muted">{t.services.deliverySub}</p>
            </div>
            <div className="overflow-x-auto rounded-card border border-line bg-white">
              <table className="w-full min-w-[22rem] text-start">
                <tbody>
                  {[
                    { label: t.services.insideEgypt, rows: inside },
                    { label: t.services.outsideEgypt, rows: outside },
                  ].map((group) => (
                    <GroupRows key={group.label} label={group.label} rows={group.rows} lang={lang} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <h2 className="text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-snug">
                {t.services.comingTitle}
              </h2>
              <p className="mt-3 max-w-[40ch] text-ink-muted">{t.services.comingSub}</p>
            </div>
            <ul className="border-t border-line">
              {t.services.categories.map((c, i) => {
                const Icon = categoryIcons[i] ?? DocumentIcon;
                return (
                  <li key={c.name} className="flex items-center gap-5 border-b border-line py-6">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-btn bg-bg-light text-navy">
                      <Icon size={24} />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-ink-muted">{c.text}</p>
                    </div>
                    <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted">
                      {t.common.comingSoon}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
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
              { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `https://inzerv.co/${lang}` },
              { "@type": "ListItem", position: 2, name: t.services.title, item: `https://inzerv.co/${lang}/services` },
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
                provider: { "@type": "Organization", name: "Inzerv" },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "EGP",
                  price: s.servicePrice,
                },
              },
            })),
          }),
        }}
      />
    </>
  );
}

function GroupRows({
  label,
  rows,
  lang,
}: {
  label: string;
  rows: { country: string; countryCode: string; deliveryFee: number }[];
  lang: "en" | "ar";
}) {
  return (
    <>
      <tr className="bg-bg-light">
        <th colSpan={2} scope="colgroup" className="px-5 py-3 text-start text-sm font-medium text-ink-muted">
          {label}
        </th>
      </tr>
      {rows.map((d) => (
        <tr key={d.countryCode} className="border-t border-line">
          <th scope="row" className="px-5 py-4 text-start font-medium">
            {countryName(d.countryCode, d.country, lang)}
          </th>
          <td className="tabular px-5 py-4 text-end font-semibold">{money(d.deliveryFee, lang)}</td>
        </tr>
      ))}
    </>
  );
}
