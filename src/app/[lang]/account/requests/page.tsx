import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestsPage } from "@/components/account/RequestsPage";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).account.requests.title, robots: { index: false } };
}

export default async function AccountRequestsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <RequestsPage locale={lang} t={getDictionary(lang)} />;
}
