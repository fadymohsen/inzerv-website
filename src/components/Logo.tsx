import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

// The source image (1600×534) includes the slogan in the bottom ~28%.
// We crop it away with overflow-hidden so only the wordmark shows.
const FULL_W = 1600;
const FULL_H = 534;
const CROP_RATIO = 0.72; // show top 72% (wordmark only)

export function Logo({ locale, height = 44 }: { locale: Locale; height?: number }) {
  const visibleH = height;
  const imgH = Math.round(visibleH / CROP_RATIO);
  const imgW = Math.round(imgH * (FULL_W / FULL_H));
  return (
    <Link href={`/${locale}`} aria-label="Inzerv" className="inline-flex shrink-0 items-center">
      <span className="overflow-hidden" style={{ height: visibleH, width: Math.round(visibleH * (FULL_W / (FULL_H * CROP_RATIO))) }}>
        <Image
          src="/brand/logo-white.png"
          alt="Inzerv"
          width={imgW}
          height={imgH}
          priority
          style={{ width: imgW, height: imgH }}
        />
      </span>
    </Link>
  );
}
