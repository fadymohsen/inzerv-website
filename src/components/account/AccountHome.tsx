"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/Button";
import { ChevronRightIcon, DocumentIcon, GlobeIcon, HeadsetIcon, LockIcon, LogoutIcon, ShieldIcon, UserIcon, CheckIcon } from "@/components/Icons";
import { Modal } from "@/components/Modal";
import { Rings } from "@/components/Rings";
import { useSession } from "@/components/SessionProvider";
import type { Dict } from "@/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import { AccountGate } from "./AccountGate";
import { Avatar } from "./Avatar";
import { useProfile } from "./useAccount";

type Item = { href?: string; onClick?: () => void; icon: React.ReactNode; label: string; trailing?: string };

export function AccountHome({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <AccountGate locale={locale} t={t}>
      {() => <Inner locale={locale} t={t} />}
    </AccountGate>
  );
}

function Inner({ locale, t }: { locale: Locale; t: Dict }) {
  const a = t.account;
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const { profile } = useProfile(true);
  const [sheet, setSheet] = useState<"none" | "language" | "signout">("none");
  const [busy, setBusy] = useState(false);

  const name = `${profile?.firstName ?? user?.firstName ?? ""} ${profile?.lastName ?? user?.lastName ?? ""}`.trim();
  const email = profile?.email ?? user?.email ?? "";
  const swap = (l: Locale) => pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${l}`) || `/${l}`;

  const items: Item[] = [
    { href: `/${locale}/account/personal`, icon: <UserIcon size={22} />, label: a.personal },
    { href: `/${locale}/account/password`, icon: <LockIcon size={22} />, label: a.changePassword },
    { href: `/${locale}/contact`, icon: <HeadsetIcon size={22} />, label: a.help },
    { href: `/${locale}/privacy-policy`, icon: <ShieldIcon size={22} />, label: a.privacy },
    { href: `/${locale}/terms`, icon: <DocumentIcon size={22} />, label: a.terms },
    {
      onClick: () => setSheet("language"),
      icon: <GlobeIcon size={22} />,
      label: a.language,
      trailing: locale === "en" ? a.english : a.arabic,
    },
  ];

  const rowClass =
    "flex min-h-16 w-full items-center gap-4 px-5 text-start text-base font-medium text-navy transition-colors hover:bg-bg-light focus-visible:bg-bg-light";
  const row = (it: Item) => {
    const inner = (
      <>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-turquoise/12 text-turquoise">{it.icon}</span>
        <span className="flex-1">{it.label}</span>
        {it.trailing && <span className="text-sm font-normal text-ink-muted">{it.trailing}</span>}
        <ChevronRightIcon size={20} className="shrink-0 text-ink-muted" />
      </>
    );
    return it.href ? (
      <Link href={it.href} className={rowClass}>
        {inner}
      </Link>
    ) : (
      <button type="button" onClick={it.onClick} className={rowClass}>
        {inner}
      </button>
    );
  };

  async function confirmSignOut() {
    setBusy(true);
    await signOut();
    router.replace(`/${locale}`);
  }

  return (
    <div className="bg-bg-light pb-20">
      <div className="relative overflow-hidden bg-navy text-white">
        <Rings className="pointer-events-none absolute -end-40 top-1/2 w-[30rem] -translate-y-1/2 opacity-80" />
        <div className="relative mx-auto max-w-2xl px-5 pb-24 pt-10 lg:pt-14">
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] rtl:leading-[1.35]">{a.title}</h1>
          <p className="mt-2 text-white/75">{a.subtitle}</p>
        </div>
      </div>

      <div className="relative mx-auto -mt-14 max-w-2xl px-5">
        <section aria-label={a.title} className="flex items-center gap-4 rounded-card border border-line bg-white p-5 shadow-[0_1rem_2.5rem_-1.25rem_rgba(6,37,68,0.35)]">
          <Avatar src={profile?.profilePhotoUrl} name={name} size={72} />
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold">{name}</p>
            <p dir="ltr" className="truncate text-start text-ink-muted rtl:text-end">{email}</p>
          </div>
        </section>

        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
          {items.map((it) => (
            <li key={it.label}>{row(it)}</li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setSheet("signout")}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-card border border-error/40 bg-white text-base font-semibold text-error transition-colors hover:bg-error/5"
        >
          <LogoutIcon size={22} />
          {a.signOut}
        </button>
      </div>

      <Modal open={sheet === "language"} onClose={() => setSheet("none")} label={a.chooseLanguage}>
        <h2 className="text-xl font-semibold">{a.chooseLanguage}</h2>
        <ul className="mt-5 flex flex-col gap-2">
          {(["en", "ar"] as Locale[]).map((l) => (
            <li key={l}>
              <Link
                href={swap(l)}
                hrefLang={l}
                lang={l}
                onClick={() => setSheet("none")}
                aria-current={l === locale ? "true" : undefined}
                className={`flex min-h-14 items-center justify-between rounded-btn border px-4 text-base font-medium ${
                  l === locale ? "border-turquoise bg-turquoise/10 text-navy" : "border-line text-navy hover:border-navy/40"
                }`}
              >
                <span>{l === "en" ? "🇬🇧 English" : "🇪🇬 العربية"}</span>
                {l === locale && <CheckIcon size={20} className="text-turquoise" />}
              </Link>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal open={sheet === "signout"} onClose={() => !busy && setSheet("none")} label={a.signOut}>
        <h2 className="text-xl font-semibold">{a.signOut}</h2>
        <p className="mt-3 text-ink-muted">{a.signOutConfirm}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setSheet("none")} disabled={busy} className={buttonClass("outline")}>
            {a.cancel}
          </button>
          <button
            type="button"
            onClick={confirmSignOut}
            disabled={busy}
            className="inline-flex min-h-12 items-center justify-center rounded-btn bg-error px-5 text-base font-medium text-white disabled:opacity-60"
          >
            {busy ? "…" : a.signOut}
          </button>
        </div>
      </Modal>
    </div>
  );
}
