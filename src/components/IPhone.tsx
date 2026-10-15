import Image from "next/image";
import type { Dict } from "@/dictionaries/en";
import { fmt } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

export type Shot = keyof Dict["app"]["shots"];

// Screens whose top area is white need a dark status bar.
const darkStatus: Shot[] = ["track"];

const body = "#2A3643";
const edge = "#5B6D80";

function StatusIcons() {
  return (
    <svg viewBox="0 0 66 12" aria-hidden className="h-[3.4cqw] w-auto" fill="currentColor">
      <rect x="0" y="7.5" width="2.6" height="4" rx="0.8" />
      <rect x="4" y="5.5" width="2.6" height="6" rx="0.8" />
      <rect x="8" y="3.2" width="2.6" height="8.3" rx="0.8" />
      <rect x="12" y="0.5" width="2.6" height="11" rx="0.8" />
      <path d="M26.5 3.2a7.6 7.6 0 0 1 10 0l-1.3 1.4a5.7 5.7 0 0 0-7.4 0zM28.9 5.8a4.2 4.2 0 0 1 5.2 0L31.5 8.6z" />
      <rect x="43.5" y="0.7" width="18.4" height="10.6" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <rect x="45.2" y="2.4" width="15" height="7.2" rx="1.9" />
      <path d="M63.4 4.2v3.6c.8-.3 1.4-1.1 1.4-1.8s-.6-1.5-1.4-1.8z" fillOpacity="0.5" />
    </svg>
  );
}

export function IPhone({
  shot,
  locale,
  t,
  priority = false,
  className = "",
  sizes = "18rem",
}: {
  shot: Shot;
  locale: Locale;
  t: Dict["app"];
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const tone = darkStatus.includes(shot) ? "text-[#0B1520]" : "text-white";

  return (
    <div className={className} style={{ containerType: "inline-size" }}>
      <div className="relative">
        {/* side buttons */}
        <span aria-hidden className="absolute -start-[0.5cqw] top-[17%] h-[3.6%] w-[0.9cqw] rounded-s-[0.5cqw]" style={{ background: body }} />
        <span aria-hidden className="absolute -start-[0.5cqw] top-[23.5%] h-[7%] w-[0.9cqw] rounded-s-[0.5cqw]" style={{ background: body }} />
        <span aria-hidden className="absolute -start-[0.5cqw] top-[32.5%] h-[7%] w-[0.9cqw] rounded-s-[0.5cqw]" style={{ background: body }} />
        <span aria-hidden className="absolute -end-[0.5cqw] top-[27%] h-[11%] w-[0.9cqw] rounded-e-[0.5cqw]" style={{ background: body }} />

        {/* titanium frame */}
        <div
          className="rounded-[15.5cqw] p-[1.5cqw]"
          style={{ background: body, boxShadow: `inset 0 0 0 0.35cqw ${edge}, inset 0 0 0 0.7cqw #101820` }}
        >
          {/* black bezel */}
          <div className="rounded-[14cqw] bg-black p-[1cqw]">
            {/* screen */}
            <div className="relative overflow-hidden rounded-[13cqw] bg-bg-light">
              <Image
                src={`/app/${locale}-${shot}.v3.webp`}
                alt={fmt(t.frameLabel, { name: t.shots[shot].name })}
                width={780}
                height={1688}
                sizes={sizes}
                priority={priority}
                className="block h-auto w-full"
              />

              {/* status bar */}
              <div
                aria-hidden
                dir="ltr"
                className={`pointer-events-none absolute inset-x-0 top-0 flex h-[13cqw] items-center justify-between px-[8.5cqw] ${tone}`}
              >
                <span className="text-[4.3cqw] font-semibold leading-none tracking-tight">9:41</span>
                <StatusIcons />
              </div>

              {/* dynamic island */}
              <span
                aria-hidden
                className="absolute left-1/2 top-[2.6cqw] h-[8.6cqw] w-[28cqw] -translate-x-1/2 rounded-full bg-black"
              />

              {/* home indicator */}
              <span
                aria-hidden
                className="absolute bottom-[1.6cqw] left-1/2 h-[1.2cqw] w-[32cqw] -translate-x-1/2 rounded-full bg-[#0B1520]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
