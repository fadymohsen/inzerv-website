import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { Faq } from "@/components/Faq";
import { ArrowIcon } from "@/components/Icons";
import { IPhone, type Shot } from "@/components/IPhone";
import { HeroWords, ScrollWords } from "@/components/Motion";
import { PinnedGallery } from "@/components/PinnedGallery";
import { PointerStage } from "@/components/PointerStage";
import { Rings } from "@/components/Rings";
import { getCatalog } from "@/lib/catalog";
import { fmt, getDictionary, money, num } from "@/lib/dictionaries";
import { firstSentence, pad2, processingTime, serviceDescription, serviceName } from "@/lib/format";
import { hasLocale } from "@/lib/i18n";

const storyShots: { shot: Shot; panel: string }[] = [
  { shot: "details", panel: "bg-[#DDF3F4]" },
  { shot: "track", panel: "bg-navy" },
  { shot: "home", panel: "bg-bg-light" },
];

const showcasePairs: Shot[][] = [
  ["home", "catalog"],
  ["details", "track"],
  ["requests", "account"],
];

const vars = (o: Record<string, string>) => o as React.CSSProperties;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { services, destinations } = await getCatalog();

  const cheapestDelivery = Math.min(...destinations.map((d) => d.deliveryFee));
  const first = services[0];

  const titleWords = t.home.hero.title.split(" ").length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="hero-rings pointer-events-none absolute -end-[16rem] top-[48%] w-[62rem] -translate-y-1/2 sm:-end-[10rem] lg:end-[-4rem] lg:w-[68rem]">
          <Rings className="w-full" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-6 px-5 pt-14 lg:min-h-[47rem] lg:grid-cols-[1.08fr_1fr] lg:px-8 lg:pt-24">
          <div className="flex flex-col pb-10 lg:justify-center lg:pb-16">
            <h1 className="text-[clamp(2.6rem,5vw,4.6rem)] font-semibold leading-[1] tracking-[-0.04em] rtl:leading-[1.2]">
              <HeroWords text={t.home.hero.title} />{" "}
              <HeroWords text={t.home.hero.titleAccent} accent startDelay={titleWords * 80} />
            </h1>
            <p
              className="fade-up mt-6 max-w-[46ch] text-base leading-relaxed text-white/80 sm:mt-8 sm:text-xl"
              style={vars({ "--d": "650ms" })}
            >
              {t.home.hero.sub}
            </p>
            <div className="fade-up mt-10 flex flex-wrap gap-3" style={vars({ "--d": "800ms" })}>
              <ButtonLink href={`/${lang}/checkout`} className="min-h-14 flex-1 px-6 text-base sm:flex-none sm:px-8 sm:text-lg">
                {t.home.hero.primary}
                <ArrowIcon size={22} />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="outline-light" className="min-h-14 flex-1 px-6 text-base sm:flex-none sm:px-8 sm:text-lg">
                {t.home.hero.secondary}
              </ButtonLink>
            </div>
          </div>

          {/* iPhone cluster */}
          <PointerStage className="relative -mx-5 h-[25rem] overflow-hidden sm:mx-0 sm:h-[36rem] sm:overflow-visible lg:h-auto">
            <div
              className="rise absolute left-1/2 top-0 z-20 w-[13.25rem] -translate-x-1/2 sm:w-[17.5rem] lg:w-[19rem]"
              style={vars({ "--rise-from": "90px", "--rise-delay": "250ms" })}
            >
              <div className="hero-par" style={vars({ "--par": "5rem" })}>
                <div className="tilt">
                  <IPhone
                    shot="track"
                    locale={lang}
                    t={t.app}
                    priority
                    sizes="(min-width: 1024px) 19rem, 17.5rem"
                    className="drop-shadow-[0_2.5rem_3rem_rgba(0,0,0,0.45)]"
                  />
                </div>
              </div>
            </div>

            <div
              className="rise absolute start-[-1.75rem] top-[5.5rem] z-10 w-[8.75rem] sm:start-[-1rem] sm:top-[8rem] sm:w-[12.5rem] lg:start-[-2.5rem] lg:top-[9rem] lg:w-[14rem]"
              style={vars({ "--rise-from": "70px", "--rise-delay": "450ms" })}
            >
              <div className="hero-par" style={vars({ "--par": "9rem" })}>
                <div className="depth-a">
                  <div className="-rotate-[7deg] origin-bottom">
                    <IPhone shot="home" locale={lang} t={t.app} sizes="14rem" className="drop-shadow-[0_2rem_2.5rem_rgba(0,0,0,0.4)]" />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="rise absolute end-[-1.75rem] top-[7.5rem] z-10 w-[8.75rem] sm:end-[-1rem] sm:top-[11rem] sm:w-[12.5rem] lg:end-[-2.5rem] lg:top-[12rem] lg:w-[14rem]"
              style={vars({ "--rise-from": "70px", "--rise-delay": "550ms" })}
            >
              <div className="hero-par" style={vars({ "--par": "7rem" })}>
                <div className="depth-b">
                  <div className="rotate-[7deg] origin-bottom">
                    <IPhone shot="catalog" locale={lang} t={t.app} sizes="14rem" className="drop-shadow-[0_2rem_2.5rem_rgba(0,0,0,0.4)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* callouts built from live data */}
            <div
              className="rise absolute start-2 top-[16rem] z-30 hidden sm:start-[-1.5rem] sm:block lg:start-[-3rem] lg:top-[19rem]"
              style={vars({ "--rise-from": "28px", "--rise-delay": "950ms" })}
            >
              <div className="hero-par" style={vars({ "--par": "3rem" })}>
                <div className="depth-c rounded-2xl bg-white p-4 text-navy shadow-[0_1.5rem_2.5rem_-1rem_rgba(0,0,0,0.45)]">
                  <span className="inline-block rounded-full bg-[#E3F4E8] px-3 py-1 text-sm font-medium text-success">
                    {t.home.hero.chipStatus}
                  </span>
                  <p className="mt-2 max-w-[13ch] text-sm leading-snug text-ink-muted">{t.home.hero.chipStatusSub}</p>
                </div>
              </div>
            </div>
            {first && (
              <div
                className="rise absolute end-2 top-[25rem] z-30 hidden sm:end-[-1rem] sm:block lg:end-[-2rem] lg:top-[28rem]"
                style={vars({ "--rise-from": "28px", "--rise-delay": "1100ms" })}
              >
                <div className="hero-par" style={vars({ "--par": "2rem" })}>
                  <div className="depth-a rounded-2xl bg-white p-4 text-navy shadow-[0_1.5rem_2.5rem_-1rem_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-ink-muted">{t.home.hero.chipPrice}</p>
                    <p className="tabular mt-1 text-lg font-semibold leading-tight">
                      {serviceName(first, lang)}
                      <span className="block text-base font-medium text-ink-muted">
                        {money(first.servicePrice, lang)} + {money(cheapestDelivery, lang)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </PointerStage>
        </div>
      </section>

      {/* Statement */}
      <section className="layer bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-44">
          <p className="max-w-[22ch] text-[clamp(2.25rem,5.4vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-navy rtl:leading-[1.35]">
            <ScrollWords text={t.home.statement.text} />
          </p>
          <div className="reveal mt-12 flex max-w-[52ch] gap-5">
            <span aria-hidden className="mt-2 h-1.5 w-14 shrink-0 rounded-full bg-turquoise" />
            <p className="text-xl leading-snug text-ink-muted sm:text-2xl">{t.home.statement.sub}</p>
          </div>
        </div>
      </section>

      {/* Story rows */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
          <div className="flex flex-col gap-6 lg:gap-8">
            {t.home.benefits.items.map((b, i) => {
              const s = storyShots[i];
              const reverse = i % 2 === 1;
              return (
                <article key={b.title} className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
                  <div
                    className={`reveal-start flex flex-col justify-center px-2 py-6 sm:px-6 lg:px-14 ${reverse ? "lg:order-2" : ""}`}
                  >
                    <span className="tabular text-sm font-medium text-ink-muted">{pad2(i + 1, lang)}</span>
                    <h3 className="mt-5 max-w-[13ch] text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] rtl:leading-[1.3]">
                      {b.title}
                    </h3>
                    <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-ink-muted">{b.text}</p>
                  </div>
                  <div
                    className={`reveal-scale relative flex items-center justify-center overflow-hidden rounded-[2rem] py-14 sm:py-16 ${s.panel} ${reverse ? "lg:order-1" : ""}`}
                  >
                    <div
                      className="par pointer-events-none absolute left-1/2 top-1/2 w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-70"
                      style={vars({ "--par-from": "-2rem", "--par-to": "2rem" })}
                    >
                      <Rings className="w-full" />
                    </div>
                    <div className="par relative w-[15.5rem] sm:w-[17.5rem]" style={vars({ "--par-from": "1.75rem", "--par-to": "-1.75rem" })}>
                      <IPhone shot={s.shot} locale={lang} t={t.app} sizes="17.5rem" className="drop-shadow-[0_2rem_2.5rem_rgba(3,26,48,0.4)]" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="layer mt-12 bg-bg-light lg:mt-32">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-36">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-[clamp(2.25rem,4.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3]">
                {t.home.services.title}
              </h2>
              <p className="mt-4 text-lg text-ink-muted">{t.home.services.sub}</p>
            </div>
            <Link
              href={`/${lang}/services`}
              className="group/btn inline-flex items-center gap-2 font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-8"
            >
              {t.home.services.all}
              <ArrowIcon size={18} />
            </Link>
          </div>

          <ul className="mt-14 border-t border-navy/15">
            {services.map((s) => (
              <li
                key={s.type}
                className="row-hover reveal grid items-center gap-x-10 gap-y-4 border-b border-navy/15 py-8 md:grid-cols-[1.7fr_1fr_auto_auto]"
              >
                <div>
                  <h3 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">{serviceName(s, lang)}</h3>
                  <p className="mt-2 line-clamp-2 max-w-[52ch] leading-relaxed text-ink-muted">
                    {firstSentence(serviceDescription(s, lang))}
                  </p>
                </div>
                <p className="text-sm text-ink-muted">
                  <span className="block">{t.home.services.time}</span>
                  <span className="text-base font-medium text-navy">{processingTime(s, lang)}</span>
                </p>
                <p className="tabular text-3xl font-semibold tracking-tight">
                  {money(s.servicePrice, lang)}
                  <span className="ms-1.5 text-sm font-normal text-ink-muted">{t.common.perCopy}</span>
                </p>
                <ButtonLink href={`/${lang}/checkout?service=${s.type}`} className="min-h-12 text-[0.9375rem]">
                  {t.common.orderThis}
                  <ArrowIcon size={18} />
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.3fr] lg:gap-24 lg:px-8 lg:py-36">
          <div className="reveal-start self-start lg:sticky lg:top-28">
            <h2 className="max-w-[13ch] text-[clamp(2.25rem,4.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3]">
              {t.home.features.title}
            </h2>
            <p className="mt-6 max-w-[40ch] text-lg text-ink-muted">{t.home.features.sub}</p>
          </div>
          <ul className="border-t border-line">
            {t.home.features.items.map((item, i) => (
              <li key={item} className="reveal flex items-center gap-6 border-b border-line py-7">
                <span className="tabular w-8 shrink-0 text-sm font-medium text-ink-muted">{pad2(i + 1, lang)}</span>
                <span className="text-xl leading-snug sm:text-2xl">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* App showcase: pinned, two screens per scroll step */}
      <PinnedGallery
        title={t.home.showcase.title}
        sub={t.home.showcase.sub}
        note={t.app.note}
        counterLabel={t.home.showcase.title}
        dotLabels={showcasePairs.map((_, i) =>
          fmt(t.home.showcase.step, { a: num(i * 2 + 1, lang), b: num(i * 2 + 2, lang) }),
        )}
        background={
          <Rings className="pointer-events-none absolute -end-[18rem] top-1/2 w-[60rem] -translate-y-1/2 opacity-80" />
        }
        slides={showcasePairs.map((pair) => ({
          stage: (
            <div className="flex h-full items-center justify-center gap-4 pb-8 sm:gap-8 lg:gap-10 lg:pb-0">
              {pair.map((shot, k) => (
                <div
                  key={shot}
                  className={`ph w-[min(clamp(6.5rem,18dvh,16.5rem),34vw)] lg:w-[clamp(9rem,38dvh,24rem)] ${k === 0 ? "-translate-y-[3%]" : "translate-y-[2%] lg:translate-y-[6%]"}`}
                >
                  <IPhone shot={shot} locale={lang} t={t.app} sizes="24rem" className="drop-shadow-[0_2rem_2.5rem_rgba(0,0,0,0.4)]" />
                </div>
              ))}
            </div>
          ),
          info: (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-5 xl:grid-cols-2">
              {pair.map((shot) => (
                <div key={shot}>
                  <p className="text-lg font-semibold">{t.app.shots[shot].name}</p>
                  <p className="mt-1 max-w-[26ch] text-[0.9375rem] leading-snug text-white/70">{t.app.shots[shot].caption}</p>
                </div>
              ))}
            </div>
          ),
        }))}
      />

      {/* Steps */}
      <section id="how-it-works" className="layer bg-bg-light">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-40">
          <h2 className="max-w-[15ch] text-[clamp(2.25rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3]">
            {t.home.steps.title}
          </h2>
          <p className="mt-6 max-w-[48ch] text-lg text-ink-muted">{t.home.steps.sub}</p>

          <div className="relative mt-20 h-px bg-navy/15">
            <span aria-hidden className="grow-x absolute inset-x-0 -top-px h-[3px] bg-turquoise" />
          </div>
          <ol className="mt-10 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {t.home.steps.items.map((s, i) => (
              <li key={s.title} className="reveal">
                <span className="tabular block text-[4.5rem] font-semibold leading-none tracking-[-0.04em] text-navy">
                  {pad2(i + 1, lang)}
                </span>
                <h3 className="mt-8 text-xl font-semibold leading-snug">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="layer bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.7fr] lg:gap-24 lg:px-8 lg:py-40">
          <div className="reveal-start self-start lg:sticky lg:top-28">
            <h2 className="max-w-[13ch] text-[clamp(2.25rem,4.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3]">
              {t.home.faq.title}
            </h2>
            <p className="mt-6 max-w-[36ch] text-lg text-ink-muted">{t.home.faq.sub}</p>
            <Link
              href={`/${lang}/contact`}
              className="group/btn mt-7 inline-flex items-center gap-2 font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-8"
            >
              {t.nav.contact}
              <ArrowIcon size={18} />
            </Link>
          </div>
          <Faq items={t.home.faq.items} />
        </div>
      </section>

      {/* FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.home.faq.items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* CTA */}
      <section className="layer relative overflow-hidden bg-turquoise">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-16 lg:min-h-[32rem] lg:justify-center lg:px-8 lg:py-36">
          <h2 className="max-w-[12ch] text-[clamp(2.5rem,5.6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-navy rtl:leading-[1.2]">
            <ScrollWords text={t.home.cta.title} />
          </h2>
          <p className="reveal max-w-[38ch] text-xl text-navy/85">{t.home.cta.sub}</p>
          <ButtonLink href={`/${lang}/checkout`} variant="navy" className="reveal min-h-14 px-8 text-lg">
            {t.home.cta.button}
            <ArrowIcon size={22} />
          </ButtonLink>
        </div>
        <div aria-hidden className="pointer-events-none absolute bottom-0 end-[6%] hidden w-[17.5rem] lg:block xl:end-[12%]">
          <div className="par" style={vars({ "--par-from": "6rem", "--par-to": "-2rem" })}>
            <IPhone shot="home" locale={lang} t={t.app} sizes="17.5rem" className="translate-y-[24%] drop-shadow-[0_2rem_2.5rem_rgba(3,26,48,0.35)]" />
          </div>
        </div>
      </section>
    </>
  );
}
