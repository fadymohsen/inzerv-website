import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PLLSNHRL');`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="flex min-h-dvh flex-col bg-white text-navy">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PLLSNHRL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Header locale={lang} t={t.nav} footer={t.footer} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={lang} t={t.footer} nav={t.nav} />
      </body>
    </html>
  );
}
