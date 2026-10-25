import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.legal.terms.title,
    description: t.meta.pages.terms,
    alternates: {
      canonical: `https://inzerv.co/${lang}/terms`,
      languages: {
        en: "https://inzerv.co/en/terms",
        ar: "https://inzerv.co/ar/terms",
      },
    },
  };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <LegalPage doc={dict.legal.terms} current="terms" t={dict.legal} footer={dict.footer} locale={lang} />;
}
