import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).auth.setPassword.title, robots: { index: false, follow: false }, referrer: "no-referrer" };
}

export default async function SetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).auth;

  return (
    <AuthShell t={t} title={t.setPassword.title} sub={t.setPassword.sub}>
      <Suspense fallback={null}>
        <SetPasswordForm locale={lang} t={t} />
      </Suspense>
    </AuthShell>
  );
}
