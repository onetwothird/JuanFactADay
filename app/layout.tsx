import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader, { preloadHeadScript } from "@/components/Preloader";
import Motion from "@/components/Motion";
import { LangProvider } from "@/components/LangProvider";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";
import { SITE } from "@/lib/util";
import "./globals.css";

// Poppins (SIL Open Font License), self-hosted so builds never depend on Google Fonts being reachable.
const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = tr(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name}: ${t.meta.tagline}`, template: `%s | ${SITE.name}` },
    description: t.meta.description,
    openGraph: { siteName: SITE.name, locale: lang === "en" ? "en_PH" : "fil_PH", type: "website" },
    twitter: { card: "summary_large_image" },
    alternates: { types: { "application/rss+xml": "/rss.xml" } },
  };
}

export const viewport: Viewport = { themeColor: "#0F1A3C", viewportFit: "cover" };

// Sets the saved theme before paint (dark is the default), so there's no flash.
const themeScript = `try{var t=localStorage.getItem('jfad-theme');if(t==='light')document.documentElement.dataset.theme='light'}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = tr(lang);
  return (
    <html lang={lang === "en" ? "en" : "fil"} className={poppins.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: preloadHeadScript }} />
      </head>
      <body id="top">
        <Preloader tag={t.preload} />
        <a href="#main" className="skip">
          {t.skip}
        </a>
        <LangProvider lang={lang}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <Motion />
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
