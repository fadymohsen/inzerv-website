import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDictionary } from "@/lib/dictionaries";
import { dirOf, hasLocale, locales } from "@/lib/i18n";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.title, template: "%s | Inzerv" },
    description: t.meta.description,
    alternates: {
      languages: { en: "/en", ar: "/ar" },
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={`${inter.variable} ${plexArabic.variable}`}
    >
      <body suppressHydrationWarning className="flex min-h-dvh flex-col bg-white text-navy">
        <Header locale={lang} t={t.nav} footer={t.footer} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={lang} t={t.footer} nav={t.nav} />
      </body>
    </html>
  );
}
