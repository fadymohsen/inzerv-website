import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonalInfo } from "@/components/account/PersonalInfo";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/account/personal">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).account.info.title, robots: { index: false } };
}

export default async function PersonalPage({ params }: PageProps<"/[lang]/account/personal">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <PersonalInfo locale={lang} t={getDictionary(lang)} />;
}
