import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
        <ol className="mb-12 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-muted" aria-label={t.request.title}>
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

        <ul className="mt-14 border-t border-navy/15">
          {services.map((s, i) => (
            <li key={s.type} className="border-b border-navy/15">
              <Link
                href={`/${lang}/checkout?service=${s.type}`}
                className="group/btn row-hover grid items-center gap-x-10 gap-y-3 py-8 md:grid-cols-[3rem_1.7fr_1fr_auto_auto]"
              >
                <span className="tabular hidden text-sm font-medium text-ink-muted md:block">{pad2(i + 1, lang)}</span>
                <span>
                  <span className="block text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">
                    {serviceName(s, lang)}
                  </span>
                  <span className="mt-2 line-clamp-2 block max-w-[52ch] leading-relaxed text-ink-muted">
                    {firstSentence(serviceDescription(s, lang))}
                  </span>
                </span>
                <span className="text-sm text-ink-muted">
                  <span className="block">{t.request.time}</span>
                  <span className="text-base font-medium text-navy">{processingTime(s, lang)}</span>
                </span>
                <span className="tabular text-3xl font-semibold tracking-tight">
                  {money(s.servicePrice, lang)}
                  <span className="ms-1.5 text-sm font-normal text-ink-muted">{t.common.perCopy}</span>
                </span>
                <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-btn bg-turquoise px-6 text-[0.9375rem] font-medium text-navy">
                  {t.request.select}
                  <ArrowIcon size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
