import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MailIcon } from "@/components/Icons";
import { SUPPORT_EMAIL } from "@/lib/config";
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
      canonical: `https://inzerv.co/${lang}/contact`,
      languages: {
        en: "https://inzerv.co/en/contact",
        ar: "https://inzerv.co/ar/contact",
      },
    },
    openGraph: {
      title: t.contact.title,
      description: t.meta.pages.contact,
      url: `https://inzerv.co/${lang}/contact`,
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
            { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `https://inzerv.co/${lang}` },
            { "@type": "ListItem", position: 2, name: t.title, item: `https://inzerv.co/${lang}/contact` },
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

          <dl className="mt-12 flex flex-col gap-10">
            <div>
              <dt className="text-sm font-medium text-ink-muted">{t.emailLabel}</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  dir="ltr"
                  className="inline-flex items-center gap-3 text-xl font-semibold underline decoration-turquoise decoration-2 underline-offset-8"
                >
                  <MailIcon size={22} />
                  {SUPPORT_EMAIL}
                </a>
              </dd>
            </div>
            <div className="max-w-[44ch] border-t border-line pt-8">
              <dt className="font-semibold">{t.inAppTitle}</dt>
              <dd className="mt-2 leading-relaxed text-ink-muted">{t.inAppText}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-card border border-line bg-bg-light p-6 sm:p-9">
          <h2 className="mb-7 text-2xl font-semibold">{t.formTitle}</h2>
          <ContactForm t={t} />
        </div>
      </div>
    </section>
    </>
  );
}
