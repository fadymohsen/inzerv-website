import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

// Approved logo with a transparent background (derived from logo-white.jpg), so it works on any dark surface.
export function Logo({ locale, height = 44 }: { locale: Locale; height?: number }) {
  const width = Math.round(height * (1600 / 533));
  return (
    <Link href={`/${locale}`} aria-label="Inzerv" className="inline-flex shrink-0 items-center">
      <Image
        src="/brand/logo-white.png"
        alt="Inzerv"
        width={width}
        height={height}
        priority
        className="h-auto"
        style={{ height, width }}
      />
    </Link>
  );
}
