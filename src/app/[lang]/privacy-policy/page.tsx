import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy-policy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.legal.privacy.title,
    description: t.meta.pages.privacy,
    alternates: {
      canonical: `https://inzerv.co/${lang}/privacy-policy`,
      languages: {
        en: "https://inzerv.co/en/privacy-policy",
        ar: "https://inzerv.co/ar/privacy-policy",
      },
    },
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy-policy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <LegalPage doc={dict.legal.privacy} current="privacy" t={dict.legal} footer={dict.footer} locale={lang} />;
}
