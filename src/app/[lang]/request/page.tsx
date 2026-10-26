import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnonStrip } from "@/components/auth/AnonStrip";
import { ArrowIcon } from "@/components/Icons";
import { getCatalog } from "@/lib/catalog";
import { getDictionary, money } from "@/lib/dictionaries";
import { firstSentence, pad2, processingTime, serviceDescription, serviceName } from "@/lib/format";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/request">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).request.title };
}

export default async function RequestPage({ params }: PageProps<"/[lang]/request">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { services } = await getCatalog();

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
        <ol className="mb-12 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-ink-muted sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-2" aria-label={t.request.title}>
          {t.request.steps.map((s, i) => (
            <li key={s} className={`flex items-center gap-2 ${i === 0 ? "font-semibold text-navy" : ""}`}>
              <span className="tabular flex size-6 items-center justify-center rounded-full border border-line text-xs">
                {pad2(i + 1, lang).slice(1)}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <h1 className="max-w-[16ch] text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3]">
          {t.request.title}
        </h1>
        <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-muted">{t.request.sub}</p>
        <AnonStrip lang={lang} text={t.request.anonText} signIn={t.nav.signIn} create={t.nav.createAccount} />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {services.map((s, i) => (
            <li key={s.type} className="flex">
              <Link
                href={`/${lang}/checkout?service=${s.type}`}
                className="group/btn flex w-full flex-col rounded-card border border-line bg-white p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-navy hover:shadow-[0_12px_32px_-12px_rgba(6,37,68,0.25)] lg:p-7"
              >
                <span className="tabular flex size-10 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                  {pad2(i + 1, lang)}
                </span>
                <span className="mt-6 block text-2xl font-semibold leading-tight tracking-[-0.02em] rtl:leading-snug">
                  {serviceName(s, lang)}
                </span>
                <span className="mt-3 line-clamp-3 block leading-relaxed text-ink-muted">
                  {firstSentence(serviceDescription(s, lang))}
                </span>

                <span className="mt-auto block pt-7">
                  <span className="flex items-end justify-between gap-4 border-t border-line pt-5">
                    <span className="block text-sm text-ink-muted">
                      {t.request.time}
                      <span className="mt-0.5 block text-base font-medium text-navy">{processingTime(s, lang)}</span>
                    </span>
                    <span className="tabular block text-end text-3xl font-semibold leading-none tracking-tight">
                      {money(s.servicePrice, lang)}
                      <span className="mt-1.5 block text-xs font-normal tracking-normal text-ink-muted">
                        {t.common.perCopy}
                      </span>
                    </span>
                  </span>
                  <span className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-turquoise px-6 text-[0.9375rem] font-medium text-navy transition-colors duration-150 group-hover/btn:bg-navy group-hover/btn:text-white">
                    {t.request.select}
                    <ArrowIcon size={18} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
