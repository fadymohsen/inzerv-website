import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

// Approved asset: public/brand/logo-white.jpg (black background, so it sits on navy via mix-blend lighten).
export function Logo({ locale, height = 44 }: { locale: Locale; height?: number }) {
  const width = Math.round(height * (1600 / 533));
  return (
    <Link href={`/${locale}`} aria-label="Inzerv" className="inline-flex shrink-0 items-center">
      <Image
        src="/brand/logo-white.jpg"
        alt="Inzerv"
        width={width}
        height={height}
        priority
        className="logo-on-navy h-auto"
        style={{ height, width }}
      />
    </Link>
  );
}
