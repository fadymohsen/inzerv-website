"use client";

import Link from "next/link";
import { BackIcon } from "@/components/Icons";
import type { Dict } from "@/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import { AccountGate } from "./AccountGate";
import { RequestsList } from "./RequestsList";

export function RequestsPage({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <AccountGate locale={locale} t={t}>
      {() => <Inner locale={locale} t={t} />}
    </AccountGate>
  );
}

function Inner({ locale, t }: { locale: Locale; t: Dict }) {
  const r = t.account.requests;

  return (
    <div className="bg-bg-light pb-20">
      <div className="mx-auto max-w-2xl px-5 pt-6 lg:pt-10">
        <Link
          href={`/${locale}/account`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-navy"
        >
          <BackIcon size={18} />
          {t.account.back}
        </Link>

        <h1 className="mt-4 text-[clamp(1.75rem,3.4vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] rtl:leading-[1.35]">
          {r.title}
        </h1>
        <p className="mt-2 text-ink-muted">{r.sub}</p>

        <div className="mt-6">
          <RequestsList locale={locale} t={r} />
        </div>
      </div>
    </div>
  );
}
