import Link from "next/link";
import { Inter } from "next/font/google";
import { buttonClass } from "@/components/Button";
import { ArrowIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootNotFound() {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="flex min-h-dvh flex-col bg-white text-navy">
        <header className="border-b border-line-navy bg-navy">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-5 md:h-18 lg:px-8">
            <Logo locale="en" />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-5">
          <div className="text-center">
            <p className="text-8xl font-semibold text-turquoise">404</p>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Page not found
            </h1>
            <p className="mt-4 max-w-[44ch] text-lg text-ink-muted">
              The page you&#39;re looking for doesn&#39;t exist or has been moved.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/en" className={buttonClass("primary", "group/btn min-h-12 px-6")}>
                Go home
                <ArrowIcon size={18} />
              </Link>
              <Link href="/en/services" className={buttonClass("outline", "min-h-12 px-6")}>
                Browse services
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
