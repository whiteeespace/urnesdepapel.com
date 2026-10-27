import { Analytics } from "@vercel/analytics/next";
import classNames from "classnames";
import type { Metadata } from "next";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/payload";
import { siteUrl } from "@/lib/site-url";

import "@/styles/global.scss";

const serif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

// Not in next/font/google yet; self-hosted from Fontsource (OFL, see _fonts/42dot-sans-OFL.txt).
const label = localFont({
  src: "./_fonts/42dot-sans-latin-400.woff2",
  weight: "400",
  variable: "--font-42dot",
  display: "swap",
});

// Built from the logo's own lettering by scripts/title-font (capitals only).
const titling = localFont({
  src: "./_fonts/urnes-titling.woff2",
  weight: "400",
  variable: "--font-urnes-titling",
  display: "swap",
});

type Props = LayoutProps<"/[locale]">;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getSettings(locale),
  ]);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${t("siteName")} · ${t("home")}`, template: `%s · ${t("siteName")}` },
    description: settings.seoDescription ?? undefined,
  };
}

const LocaleLayout = async ({ children, params }: Props) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={classNames(serif.variable, sans.variable, label.variable, titling.variable)}
    >
      <body>
        <NextIntlClientProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default LocaleLayout;
