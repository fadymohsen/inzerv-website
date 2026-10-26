import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/signup">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).auth.signup.title, robots: { index: false } };
}

export default async function SignUpPage({ params }: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.auth;

  return (
    <AuthShell t={t} title={t.signup.title} sub={t.signup.sub}>
      <Suspense fallback={null}>
        <SignUpForm locale={lang} t={t} legal={{ terms: dict.footer.terms, privacy: dict.footer.privacy }} />
      </Suspense>
    </AuthShell>
  );
}
