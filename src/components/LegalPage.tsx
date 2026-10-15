import Link from "next/link";
import type { Dict, LegalDoc } from "@/dictionaries/en";
import { LEGAL_IS_DRAFT, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/config";
import { digits } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { HeroWords } from "./Motion";
import { Rings } from "./Rings";
import { LegalToc } from "./LegalToc";
import { ArrowIcon, MailIcon } from "./Icons";

export type LegalKey = "terms" | "refund" | "privacy";

const hrefs: Record<LegalKey, string> = {
  terms: "terms",
  refund: "refund-policy",
  privacy: "privacy-policy",
};

function split(heading: string) {
  const m = heading.match(/^(\d+)\.\s*(.*)$/);
  return m ? { n: m[1], text: m[2] } : { n: "", text: heading };
}

export function LegalPage({
  doc,
  current,
  t,
  footer,
  locale,
}: {
  doc: LegalDoc;
  current: LegalKey;
  t: Dict["legal"];
  footer: Dict["footer"];
  locale: Locale;
}) {
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${LEGAL_UPDATED}T00:00:00Z`));

  const labels: Record<LegalKey, string> = { terms: footer.terms, refund: footer.refund, privacy: footer.privacy };
  const sections = doc.sections.map((s, i) => {
    const { n, text } = split(s.h);
    return { ...s, id: `s${i + 1}`, n: digits(n.padStart(2, "0"), locale), text };
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute -end-[18rem] top-1/2 hidden w-[52rem] -translate-y-1/2 lg:block">
          <Rings className="w-full" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <nav aria-label={footer.legal} className="flex flex-wrap gap-2">
            {(Object.keys(hrefs) as LegalKey[]).map((k) => (
              <Link
                key={k}
                href={`/${locale}/${hrefs[k]}`}
                aria-current={k === current ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-5 text-sm font-medium transition-colors duration-150 ${
                  k === current
                    ? "bg-turquoise text-navy"
                    : "border border-white/25 text-white/85 hover:border-white hover:text-white"
                }`}
              >
                {labels[k]}
              </Link>
            ))}
          </nav>

          <h1 className="mt-10 max-w-[16ch] text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1] tracking-[-0.035em] rtl:leading-[1.25]">
            <HeroWords text={doc.title} />
          </h1>
          <p className="fade-up mt-7 max-w-[56ch] text-xl leading-relaxed text-white/80" style={{ ["--d" as string]: "450ms" } as React.CSSProperties}>
            {doc.intro}
          </p>

          <div className="fade-up mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75" style={{ ["--d" as string]: "600ms" } as React.CSSProperties}>
            <span>
              {t.updated}: <time dateTime={LEGAL_UPDATED} className="font-medium text-white">{digits(date, locale)}</time>
            </span>
            {LEGAL_IS_DRAFT && (
              <span role="note" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-medium text-warning">
                {t.draftTitle}
              </span>
            )}
          </div>
          {LEGAL_IS_DRAFT && <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-white/65">{t.draftText}</p>}
        </div>
      </section>

      {/* Body */}
      <section className="layer bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[16rem_1fr] lg:gap-20 lg:px-8 lg:py-28">
          <LegalToc title={t.toc} items={sections.map((s) => ({ id: s.id, n: s.n, label: s.text }))} />

          <article className="min-w-0">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className={`scroll-mt-28 py-10 first:pt-0 lg:py-14 ${i > 0 ? "border-t border-line" : ""}`}
              >
                <div className="flex items-baseline gap-5">
                  <span className="tabular text-sm font-medium text-ink-muted">{s.n}</span>
                  <h2 className="text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.15] tracking-[-0.02em] rtl:leading-[1.4]">
                    {s.text}
                  </h2>
                </div>

                <div className="mt-6 max-w-[66ch] ps-0 sm:ps-12">
                  {s.p?.map((para) => (
                    <p key={para} className="mt-4 text-[1.0625rem] leading-[1.85] text-ink-muted first:mt-0">
                      {para}
                    </p>
                  ))}
                  {s.ul && (
                    <ul className="mt-5 flex flex-col gap-3.5 first:mt-0">
                      {s.ul.map((li) => (
                        <li key={li} className="flex gap-4 text-[1.0625rem] leading-[1.75] text-ink-muted">
                          <span aria-hidden className="mt-[0.7rem] size-1.5 shrink-0 rounded-[2px] bg-turquoise" />
                          {li}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            {/* Contact */}
            <div className="mt-6 rounded-card bg-bg-light p-7 sm:p-10">
              <p className="text-xl font-semibold">{t.questions}</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                dir="ltr"
                className="group/btn mt-4 inline-flex items-center gap-3 text-lg font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-8"
              >
                <MailIcon size={22} />
                {SUPPORT_EMAIL}
                <ArrowIcon size={18} />
              </a>
              <div className="mt-8 border-t border-line pt-5">
                <a href="#" className="text-sm font-medium text-ink-muted hover:text-navy">
                  ↑ {t.top}
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
