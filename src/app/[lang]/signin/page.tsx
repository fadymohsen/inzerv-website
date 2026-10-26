import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/signin">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).auth.signin.submit, robots: { index: false } };
}

export default async function SignInPage({ params }: PageProps<"/[lang]/signin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).auth;

  return (
    <AuthShell t={t} title={t.signin.title} sub={t.signin.sub}>
      <Suspense fallback={null}>
        <SignInForm locale={lang} t={t} />
      </Suspense>
    </AuthShell>
  );
}
