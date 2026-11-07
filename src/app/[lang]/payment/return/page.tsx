import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/payment/return">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).checkout.title, robots: { index: false } };
}

/**
 * Where the Inzerv app's payment browser lands after the hosted payment page.
 * It shows nothing about the payment itself: the app asks the backend for that.
 */
export default async function PaymentReturnPage({ params }: PageProps<"/[lang]/payment/return">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const r = getDictionary(lang).checkout.result;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.02em] rtl:leading-snug">{r.appReturnTitle}</h1>
        <p className="mx-auto mt-6 max-w-[44ch] leading-relaxed text-ink-muted">{r.appReturnText}</p>
      </div>
    </section>
  );
}
