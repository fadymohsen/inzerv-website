import Link from "next/link";
import type { Dict } from "@/dictionaries/en";
import { SUPPORT_EMAIL, SUPPORT_PHONE_LANDLINE, SUPPORT_PHONE_MOBILE, SUPPORT_PHONE_MOBILE_2 } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { Logo } from "./Logo";

const telHref = (number: string) => `tel:+20${number.replace(/^0/, "")}`;
const waHref = (number: string) => `https://wa.me/20${number.replace(/^0/, "")}`;

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
            {[SUPPORT_PHONE_MOBILE, SUPPORT_PHONE_MOBILE_2].map((num) => (
              <span key={num} className="flex items-center gap-2">
                <a href={telHref(num)} className={link}>
                  <span className="text-white/50">{t.mobile}:</span> <span dir="ltr">{num}</span>
                </a>
                <a href={waHref(num)} target="_blank" rel="noopener" aria-label={`WhatsApp ${num}`} className="inline-flex items-center text-white/60 transition-colors hover:text-[#25D366]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </span>
            ))}
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
