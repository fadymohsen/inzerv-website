"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dict } from "@/dictionaries/en";
import { otherLocale, type Locale } from "@/lib/i18n";
import { buttonClass } from "./Button";
import { CloseIcon, MenuIcon } from "./Icons";
import { Logo } from "./Logo";

export function Header({ locale, t }: { locale: Locale; t: Dict["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: `/${locale}/services`, label: t.services },
    { href: `/${locale}#how-it-works`, label: t.howItWorks },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/contact`, label: t.contact },
  ];

  const switchHref = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${otherLocale(locale)}`) || `/${otherLocale(locale)}`;
  const close = () => setOpen(false);

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      pathname === href.split("#")[0] && !href.includes("#")
        ? "text-white"
        : "text-white/75 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line-navy bg-navy">
      <span aria-hidden className="progress pointer-events-none absolute inset-x-0 bottom-[-1px] h-[3px] bg-turquoise" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-turquoise focus:px-4 focus:py-2 focus:text-navy"
      >
        {t.skip}
      </a>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Logo locale={locale} />

        <nav aria-label={t.primary} className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={switchHref}
            hrefLang={otherLocale(locale)}
            aria-label={t.languageLabel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors duration-150 hover:text-white"
          >
            {t.language}
          </Link>
          <Link href={`/${locale}/checkout`} className={buttonClass("primary", "min-h-11 px-5 text-sm")}>
            {t.cta}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.closeMenu : t.openMenu}
          className="-me-2 inline-flex size-11 items-center justify-center rounded-lg text-white md:hidden"
        >
          {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line-navy bg-navy md:hidden">
          <nav aria-label={t.primary} className="mx-auto flex max-w-7xl flex-col px-5 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="flex min-h-12 items-center rounded-lg px-2 text-base font-medium text-white/90"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={switchHref}
              hrefLang={otherLocale(locale)}
              onClick={close}
              className="flex min-h-12 items-center rounded-lg px-2 text-base font-medium text-white/90"
            >
              {t.language}
            </Link>
            <Link
              href={`/${locale}/checkout`}
              onClick={close}
              className={buttonClass("primary", "mt-3 w-full")}
            >
              {t.cta}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
