"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/Button";
import { useSession } from "@/components/SessionProvider";
import type { Dict } from "@/dictionaries/en";
import type { Locale } from "@/lib/i18n";

/** Renders children only for signed-in users; everyone else gets a sign-in prompt. */
export function AccountGate({
  locale,
  t,
  children,
}: {
  locale: Locale;
  t: Dict;
  children: (user: { id: string; email: string; firstName: string; lastName: string }) => React.ReactNode;
}) {
  const { status, user } = useSession();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  if (status === "loading") return <div className="min-h-[50vh]" aria-busy="true" />;
  if (status === "anonymous" || !user) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">{t.account.title}</h1>
        <p className="mt-4 text-ink-muted">{t.account.signInPrompt}</p>
        <Link href={`/${locale}/signin?next=${next}`} className={buttonClass("primary", "mt-8 w-full")}>
          {t.account.signInButton}
        </Link>
        <Link href={`/${locale}/signup?next=${next}`} className={buttonClass("outline", "mt-3 w-full")}>
          {t.nav.createAccount}
        </Link>
      </div>
    );
  }
  return <>{children(user)}</>;
}
