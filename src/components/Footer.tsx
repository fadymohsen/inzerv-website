import Link from "next/link";
import type { Dict } from "@/dictionaries/en";
import { SUPPORT_EMAIL } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { Logo } from "./Logo";

export function Footer({ locale, t, nav }: { locale: Locale; t: Dict["footer"]; nav: Dict["nav"] }) {
  const explore = [
    { href: `/${locale}/services`, label: nav.services },
    { href: `/${locale}/about`, label: nav.about },
    { href: `/${locale}/contact`, label: nav.contact },
    { href: `/${locale}/checkout`, label: t.checkout },
  ];
  const legal = [
    { href: `/${locale}/terms`, label: t.terms },
    { href: `/${locale}/refund-policy`, label: t.refund },
    { href: `/${locale}/privacy-policy`, label: t.privacy },
  ];

  const colTitle = "mb-4 text-sm font-medium text-white/60";
  const link = "text-sm text-white/85 transition-colors duration-150 hover:text-turquoise";

  return (
    <footer className="layer bg-navy-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <Logo locale={locale} height={52} />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">{t.tagline}</p>
        </div>

        <nav aria-label={t.explore}>
          <p className={colTitle}>{t.explore}</p>
          <ul className="flex flex-col gap-3">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.legal}>
          <p className={colTitle}>{t.legal}</p>
          <ul className="flex flex-col gap-3">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={colTitle}>{t.contactTitle}</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={link} dir="ltr">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      <div className="border-t border-line-navy">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-white/60 lg:px-8">
          © {t.year} {t.rights}
        </p>
      </div>
    </footer>
  );
}
