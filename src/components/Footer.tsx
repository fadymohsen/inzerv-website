import Link from "next/link";
import type { Dict } from "@/dictionaries/en";
import { SUPPORT_EMAIL, SUPPORT_PHONE_LANDLINE, SUPPORT_PHONE_MOBILE } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { Logo } from "./Logo";

const telHref = (number: string) => `tel:+20${number.replace(/^0/, "")}`;

export function Footer({ locale, t, nav }: { locale: Locale; t: Dict["footer"]; nav: Dict["nav"] }) {
  const explore = [
    { href: `/${locale}/services`, label: nav.services },
    { href: `/${locale}/about`, label: nav.about },
    { href: `/${locale}/contact`, label: nav.contact },
    { href: `/${locale}/request`, label: t.checkout },
  ];
  const legal = [
    { href: `/${locale}/terms`, label: t.terms },
    { href: `/${locale}/refund-policy`, label: t.refund },
    { href: `/${locale}/privacy-policy`, label: t.privacy },
  ];

  const colTitle = "mb-3 text-sm font-medium text-white/60";
  const link = "inline-flex min-h-10 items-center text-sm text-white/85 transition-colors duration-150 hover:text-turquoise";

  return (
    <footer className="layer bg-navy-deep text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:px-8 lg:py-16">
        <div className="col-span-2 flex flex-col items-start gap-5 lg:col-span-1">
          <Logo locale={locale} height={52} />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">{t.tagline}</p>
        </div>

        <nav aria-label={t.explore}>
          <p className={colTitle}>{t.explore}</p>
          <ul className="flex flex-col">
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
          <ul className="flex flex-col">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-1">
          <p className={colTitle}>{t.contactTitle}</p>
          <div className="flex flex-col items-start gap-1">
            <a href={`mailto:${SUPPORT_EMAIL}`} className={link} dir="ltr">
              {SUPPORT_EMAIL}
            </a>
            <a href={telHref(SUPPORT_PHONE_MOBILE)} className={link}>
              <span className="text-white/50">{t.mobile}:</span> <span dir="ltr">{SUPPORT_PHONE_MOBILE}</span>
            </a>
            <a href={telHref(SUPPORT_PHONE_LANDLINE)} className={link}>
              <span className="text-white/50">{t.landline}:</span> <span dir="ltr">{SUPPORT_PHONE_LANDLINE}</span>
            </a>
            <p className="max-w-xs pt-1 text-sm leading-relaxed text-white/70">{t.address}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-line-navy">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {t.year} {t.rights}
          </p>
          <p>
            {t.poweredBy}{" "}
            <a
              href="https://veliq.co"
              target="_blank"
              rel="noopener"
              className="font-semibold text-turquoise transition-opacity duration-150 hover:opacity-80"
            >
              VELIQ
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
