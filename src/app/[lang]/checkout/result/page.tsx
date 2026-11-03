import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { PaymentResult } from "./PaymentResult";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout/result">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).checkout.title, robots: { index: false } };
}

export default async function PaymentResultPage({ params }: PageProps<"/[lang]/checkout/result">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
        <Suspense fallback={<p className="text-center text-ink-muted">{t.checkout.result.checking}</p>}>
          <PaymentResult locale={lang} t={t.checkout} />
        </Suspense>
      </div>
    </section>
  );
}
