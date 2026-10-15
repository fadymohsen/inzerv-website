import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { CheckoutFlow } from "./CheckoutFlow";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).checkout.title, robots: { index: false } };
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const catalog = await getCatalog();

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.025em] rtl:leading-[1.3]">
          {t.checkout.title}
        </h1>
        <p className="mt-4 mb-12 max-w-[56ch] text-lg text-ink-muted">{t.checkout.sub}</p>

        {catalog.live ? (
          <Suspense fallback={<p className="py-16 text-ink-muted">{t.common.loading}</p>}>
            <CheckoutFlow
              locale={lang}
              t={t.checkout}
              legal={{ terms: t.footer.terms, refund: t.footer.refund, privacy: t.footer.privacy }}
              services={catalog.services}
              destinations={catalog.destinations}
            />
          </Suspense>
        ) : (
          <div role="alert" className="max-w-xl rounded-card border border-warning/40 p-6">
            <p className="text-warning">{t.checkout.catalogDown}</p>
            <a href={`/${lang}/checkout`} className="mt-4 inline-block font-medium text-navy underline underline-offset-4">
              {t.checkout.retry}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
