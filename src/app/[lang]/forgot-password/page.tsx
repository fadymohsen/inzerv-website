import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotFlow } from "@/components/auth/ForgotFlow";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/forgot-password">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).auth.forgot.title, robots: { index: false } };
}

export default async function ForgotPasswordPage({ params }: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).auth;

  return (
    <AuthShell t={t} title={t.forgot.title}>
      <Suspense fallback={null}>
        <ForgotFlow locale={lang} t={t} />
      </Suspense>
    </AuthShell>
  );
}
