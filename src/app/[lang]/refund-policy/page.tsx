import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/refund-policy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.legal.refund.title,
    description: t.meta.pages.refund,
    alternates: {
      canonical: `https://inzerv.co/${lang}/refund-policy`,
      languages: {
        en: "https://inzerv.co/en/refund-policy",
        ar: "https://inzerv.co/ar/refund-policy",
      },
    },
  };
}

export default async function RefundPage({ params }: PageProps<"/[lang]/refund-policy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <LegalPage doc={dict.legal.refund} current="refund" t={dict.legal} footer={dict.footer} locale={lang} />;
}
