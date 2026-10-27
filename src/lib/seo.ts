import type { Metadata } from "next";
import type { ComponentProps } from "react";

import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/site-url";

type Href = ComponentProps<typeof getPathname>["href"];

interface PageMetadataInput {
  locale: Locale;
  href: Href;
  title?: string;
  description?: string | null;
}

// Canonical URL plus hreflang alternates for every locale.
export const pageMetadata = ({ locale, href, title, description }: PageMetadataInput): Metadata => {
  const url = (target: Locale) => `${siteUrl}${getPathname({ locale: target, href })}`;
  const languages = Object.fromEntries(routing.locales.map((target) => [target, url(target)]));

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: url(locale),
      languages: { ...languages, "x-default": url(routing.defaultLocale) },
    },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: url(locale),
      siteName: "Urnes de Papel",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
};
