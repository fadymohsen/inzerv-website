"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dict } from "@/dictionaries/en";
import { SUPPORT_EMAIL } from "@/lib/config";
import { fmt } from "@/lib/dictionaries";
import { otherLocale, type Locale } from "@/lib/i18n";
import { buttonClass } from "./Button";
import { ArrowIcon, CloseIcon, MailIcon, MenuIcon, UserIcon } from "./Icons";
import { Logo } from "./Logo";
import { Rings } from "./Rings";
import { useSession } from "./SessionProvider";

const vars = (d: number) => ({ ["--d" as string]: `${d}ms` }) as React.CSSProperties;

export function Header({ locale, t, footer }: { locale: Locale; t: Dict["nav"]; footer: Dict["footer"] }) {
  const pathname = usePathname();
  const { status, user, signOut } = useSession();
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const overlay = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);
  const [openPath, setOpenPath] = useState(pathname);
  // navigating while open (link, back button) hides the menu without an effect
  const isOpen = state !== "closed" && openPath === pathname;

  const close = useCallback(() => {
    setState((s) => (s === "open" ? "closing" : s));
  }, []);

  // finish the exit animation, then unmount
  useEffect(() => {
    if (state !== "closing") return;
    const id = window.setTimeout(() => {
      setState("closed");
      openBtn.current?.focus();
    }, 300);
    return () => window.clearTimeout(id);
  }, [state]);

  // close when the viewport grows past the mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setState("closed");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // scroll lock, focus handling, Escape, focus trap
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !overlay.current) return;
      const f = overlay.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const links = [
    { href: `/${locale}/services`, label: t.services },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/contact`, label: t.contact },
  ];

  const swap = (l: Locale) => pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${l}`) || `/${l}`;
  const switchHref = swap(otherLocale(locale));

  const desktopLink = (href: string) =>
    `inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
      pathname === href.split("#")[0] && !href.includes("#") ? "text-white" : "text-white/75 hover:text-white"
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

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:h-18 lg:px-8">
        <Logo locale={locale} />

        <nav aria-label={t.primary} className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={desktopLink(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={switchHref}
            hrefLang={otherLocale(locale)}
            aria-label={t.languageLabel}
            className="rounded-lg px-3 py-2 text-xl transition-opacity duration-150 hover:opacity-80"
          >
            {locale === "en" ? "🇪🇬" : "🇬🇧"}
          </Link>
          {status === "authenticated" && user ? (
            <div className="flex items-center gap-1">
              <Link
                href={`/${locale}/account`}
                title={t.account}
                className="inline-flex max-w-[11rem] items-center gap-2 truncate rounded-lg px-2 py-2 text-sm text-white/85 transition-colors duration-150 hover:text-white"
              >
                <UserIcon size={20} className="shrink-0" />
                {fmt(t.hello, { name: user.firstName })}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors duration-150 hover:text-white"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            status === "anonymous" && (
              <>
                <Link
                  href={`/${locale}/signin`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white/75 transition-colors duration-150 hover:text-white"
                >
                  <UserIcon size={20} />
                  {t.signIn}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className={buttonClass("outline-light", "hidden min-h-11 px-5 text-sm font-semibold xl:inline-flex")}
                >
                  {t.createAccount}
                </Link>
              </>
            )
          )}
          <Link href={`/${locale}/request`} className={buttonClass("primary", "min-h-11 px-5 text-sm")}>
            {t.cta}
          </Link>
        </div>

        <button
          ref={openBtn}
          type="button"
          onClick={() => {
            setOpenPath(pathname);
            setState("open");
          }}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={t.openMenu}
          className="-me-2 inline-flex size-11 items-center justify-center rounded-lg text-white lg:hidden"
        >
          <MenuIcon size={26} />
        </button>
      </div>

      {isOpen && (
        <div
          ref={overlay}
          role="dialog"
          aria-modal="true"
          aria-label={t.primary}
          data-state={state}
          className="menu-overlay fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-navy text-white lg:hidden"
        >
          <Rings className="pointer-events-none absolute -end-[22rem] top-[28%] w-[52rem] opacity-90" />

          {/* top bar, same position as the header so nothing jumps */}
          <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-line-navy px-5">
            <Logo locale={locale} />
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              aria-label={t.closeMenu}
              className="-me-2 inline-flex size-11 items-center justify-center rounded-lg text-white"
            >
              <CloseIcon size={26} />
            </button>
          </div>

          <nav aria-label={t.primary} className="relative flex-1 px-5 pt-6">
            <ul>
              {links.map((l, i) => {
                const current = pathname === l.href.split("#")[0] && !l.href.includes("#");
                return (
                  <li key={l.href} className="fade-up border-b border-white/12" style={vars(120 + i * 70)}>
                    <Link
                      href={l.href}
                      onClick={close}
                      aria-current={current ? "page" : undefined}
                      className={`group/link flex min-h-[4.5rem] items-center justify-between gap-4 text-[2.25rem] font-semibold leading-none tracking-[-0.03em] rtl:leading-[1.3] ${
                        current ? "text-turquoise" : "text-white"
                      }`}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="tabular w-6 text-sm font-medium tracking-normal text-white/50">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {l.label}
                      </span>
                      <ArrowIcon size={22} className="shrink-0 text-white/50 group-hover/link:text-turquoise" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="fade-up relative px-5 pb-8 pt-8" style={vars(420)}>
            <div className="flex items-center justify-between gap-4">
              <div role="group" aria-label={t.languageLabel} className="inline-flex rounded-full border border-white/25 p-1 text-sm font-medium">
                {(["en", "ar"] as Locale[]).map((l) => (
                  <Link
                    key={l}
                    href={swap(l)}
                    hrefLang={l}
                    lang={l}
                    aria-current={l === locale ? "true" : undefined}
                    className={`inline-flex min-h-10 min-w-20 items-center justify-center rounded-full px-4 transition-colors duration-150 ${
                      l === locale ? "bg-white text-navy" : "text-white/80"
                    }`}
                  >
                    {l === "en" ? "🇬🇧 English" : "🇪🇬 العربية"}
                  </Link>
                ))}
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                dir="ltr"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-white/80"
              >
                <MailIcon size={18} />
                <span className="sr-only">{footer.contactTitle}:</span>
                {SUPPORT_EMAIL}
              </a>
            </div>

            {status === "authenticated" && user ? (
              <div className="mt-6 flex items-center justify-between gap-4 rounded-btn border border-white/20 px-4 py-2">
                <Link href={`/${locale}/account`} onClick={close} className="inline-flex min-h-10 items-center gap-2 truncate text-white">
                  <UserIcon size={20} className="shrink-0" />
                  <span className="truncate">{fmt(t.hello, { name: user.firstName })}</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    close();
                    await signOut();
                  }}
                  className="min-h-10 shrink-0 text-sm font-medium text-white underline underline-offset-4"
                >
                  {t.signOut}
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href={`/${locale}/signin`} onClick={close} className={buttonClass("outline-light", "w-full")}>
                  {t.signIn}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  onClick={close}
                  className={buttonClass("outline-light", "w-full border-turquoise font-semibold text-turquoise")}
                >
                  {t.createAccount}
                </Link>
              </div>
            )}

            <Link
              href={`/${locale}/request`}
              onClick={close}
              className={buttonClass("primary", "group/btn mt-3 min-h-14 w-full text-lg")}
            >
              {t.cta}
              <ArrowIcon size={22} />
            </Link>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/60">
              {[
                { href: `/${locale}/terms`, label: footer.terms },
                { href: `/${locale}/refund-policy`, label: footer.refund },
                { href: `/${locale}/privacy-policy`, label: footer.privacy },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className="inline-flex min-h-10 items-center hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
