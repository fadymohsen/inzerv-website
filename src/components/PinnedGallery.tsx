"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { stage: React.ReactNode; info: React.ReactNode };

/**
 * Pins the section and steps through slides as the page scrolls, two phones per step.
 * Server-renders every slide in a plain stacked layout; upgrades after mount unless
 * the visitor prefers reduced motion.
 */
export function PinnedGallery({
  title,
  sub,
  note,
  counterLabel,
  dotLabels,
  slides,
  background,
}: {
  title: string;
  sub: string;
  note: string;
  counterLabel: string;
  dotLabels: string[];
  slides: Slide[];
  background?: React.ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const [pinned, setPinned] = useState(false);
  const [idx, setIdx] = useState(0);
  const n = slides.length;

  const state = (i: number) => (!pinned ? "static" : i === idx ? "active" : i < idx ? "before" : "after");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = section.current;
    if (!s) return;

    setPinned(true);

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const span = s.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      s.style.setProperty("--p", p.toFixed(4));
      setIdx(Math.min(n - 1, Math.round(p * (n - 1))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  const goTo = useCallback(
    (i: number) => {
      const s = section.current;
      if (!s) return;
      const span = s.offsetHeight - window.innerHeight;
      const top = s.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (span * i) / Math.max(1, n - 1), behavior: "smooth" });
    },
    [n],
  );

  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <section
      ref={section}
      className="relative bg-navy text-white"
      style={
        pinned
          ? ({ height: `calc(100dvh + ${(n - 1) * 85}dvh)`, ["--p" as string]: 0 } as React.CSSProperties)
          : undefined
      }
    >
      <div className={pinned ? "sticky top-[4.5rem] h-[calc(100dvh-4.5rem)] overflow-hidden" : "relative overflow-hidden py-24 lg:py-32"}>
        {background}

        <div
          className={`relative mx-auto grid max-w-[100rem] items-center gap-x-10 gap-y-6 px-5 lg:grid-cols-[0.75fr_1.5fr] lg:px-12 ${
            pinned ? "h-full grid-rows-[auto_1fr_auto] py-6 lg:grid-rows-[1fr_1fr] lg:py-0" : "lg:grid-rows-[auto_1fr]"
          }`}
        >
          {/* title */}
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <h2 className="max-w-[16ch] text-[clamp(1.875rem,3.8vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3]">
              {title}
            </h2>
            <p className="mt-3 max-w-[40ch] text-base text-white/75 lg:mt-4 lg:text-lg">{sub}</p>
          </div>

          {/* stage */}
          <div
            className={`relative lg:col-start-2 lg:row-span-2 lg:row-start-1 ${
              pinned ? "h-full min-h-0" : "flex flex-col gap-16 py-10"
            }`}
          >
            {slides.map((sl, i) => (
              <div
                key={i}
                data-state={state(i)}
                aria-hidden={pinned && i !== idx ? true : undefined}
                className={`slide ${pinned ? "absolute inset-0" : "relative"} ${pinned && i !== idx ? "pointer-events-none" : ""}`}
              >
                {sl.stage}
              </div>
            ))}
          </div>

          {/* info + controls */}
          <div className="lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-6">
            <div className={pinned ? "relative min-h-[9.5rem] lg:min-h-[11.5rem]" : "flex flex-col gap-10"}>
              {slides.map((sl, i) => (
                <div
                  key={i}
                  data-state={state(i)}
                  aria-hidden={pinned && i !== idx ? true : undefined}
                  className={`slide-info ${pinned ? "absolute inset-x-0 top-0" : "relative"}`}
                >
                  {sl.info}
                </div>
              ))}
            </div>

            {pinned && (
              <div className="mt-5 flex items-center gap-5">
                <span className="tabular text-sm font-medium text-white/80" dir="ltr">
                  {pad(idx + 1)} / {pad(n)}
                </span>
                <div className="flex gap-2" role="group" aria-label={counterLabel}>
                  {dotLabels.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={label}
                      aria-current={i === idx ? "true" : undefined}
                      className="group/dot flex h-8 w-10 items-center"
                    >
                      <span
                        className={`h-[3px] w-full rounded-full transition-colors duration-300 ${
                          i === idx ? "bg-turquoise" : "bg-white/25 group-hover/dot:bg-white/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-3 text-sm text-white/60">{note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
