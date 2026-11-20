import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, MailIcon } from "@/components/Icons";
import { SUPPORT_EMAIL, SUPPORT_PHONE_MOBILE, SUPPORT_PHONE_MOBILE_2 } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { ContactForm } from "./ContactForm";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.contact.title,
    description: t.meta.pages.contact,
    alternates: {
      canonical: `https://inzerv.com/${lang}/contact`,
      languages: {
        en: "https://inzerv.com/en/contact",
        ar: "https://inzerv.com/ar/contact",
      },
    },
    openGraph: {
      title: t.contact.title,
      description: t.meta.pages.contact,
      url: `https://inzerv.com/${lang}/contact`,
    },
  };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).contact;

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `https://inzerv.com/${lang}` },
            { "@type": "ListItem", position: 2, name: t.title, item: `https://inzerv.com/${lang}/contact` },
          ],
        }),
      }}
    />
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-24 lg:px-8 lg:py-28">
        <div>
          <h1 className="text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.025em] rtl:leading-[1.3]">
            {t.title}
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-muted">{t.sub}</p>

          <dl className="mt-10 flex flex-col gap-8">
            <div>
              <dt className="text-sm font-medium text-ink-muted">{t.emailLabel}</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  dir="ltr"
                  className="inline-flex min-h-11 items-center gap-3 text-xl font-semibold underline decoration-turquoise decoration-2 underline-offset-8"
                >
                  <MailIcon size={22} />
                  {SUPPORT_EMAIL}
                </a>
              </dd>
            </div>
            <div className="border-t border-line pt-6">
              <dt className="text-sm font-medium text-ink-muted">{t.phoneLabel}</dt>
              <dd className="mt-2 flex flex-col gap-2">
                {[SUPPORT_PHONE_MOBILE, SUPPORT_PHONE_MOBILE_2].map((num) => (
                  <a
                    key={num}
                    href={`https://wa.me/20${num.replace(/^0/, "")}`}
                    target="_blank"
                    rel="noopener"
                    dir="ltr"
                    className="inline-flex min-h-11 items-center gap-3 text-xl font-semibold underline decoration-turquoise decoration-2 underline-offset-8"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-turquoise"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {num}
                  </a>
                ))}
              </dd>
            </div>
            <div className="border-t border-line pt-6">
              <dt className="whitespace-nowrap font-semibold">{t.inAppTitle}</dt>
              <dd className="mt-2 leading-relaxed text-ink-muted">{t.inAppText}</dd>
            </div>
            <div className="border-t border-line pt-6">
              <dt className="font-semibold">{t.trackTitle}</dt>
              <dd className="mt-2 leading-relaxed text-ink-muted">{t.trackText}</dd>
              <dd className="mt-3">
                <Link
                  href={`/${lang}/account/requests`}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-turquoise underline decoration-turquoise/40 decoration-2 underline-offset-4 hover:decoration-turquoise"
                >
                  {t.trackLink}
                  <ArrowIcon size={16} />
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-card border border-line bg-bg-light p-6 sm:p-9">
          <h2 className="mb-7 text-2xl font-semibold">{t.formTitle}</h2>
          <ContactForm t={t} locale={lang} />
        </div>
      </div>
    </section>
    </>
  );
}
