"use client";

import Link from "next/link";
import { buttonClass } from "@/components/Button";
import { useSession } from "@/components/SessionProvider";
import type { Locale } from "@/lib/i18n";

/** Shown on the service list only while signed out. */
export function AnonStrip({ lang, text, signIn, create }: { lang: Locale; text: string; signIn: string; create: string }) {
  const { status } = useSession();
  if (status !== "anonymous") return null;
  const next = encodeURIComponent(`/${lang}/request`);
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-turquoise/50 bg-turquoise/10 p-5 sm:p-6">
      <p className="text-lg font-medium">{text}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={`/${lang}/signup?next=${next}`} className={buttonClass("navy", "min-h-12 px-6")}>
          {create}
        </Link>
        <Link href={`/${lang}/signin?next=${next}`} className={buttonClass("outline", "min-h-12 px-6")}>
          {signIn}
        </Link>
      </div>
    </div>
  );
}
