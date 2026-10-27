import type { MetadataRoute } from "next";
import type { ComponentProps } from "react";

import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getModels, getUrns } from "@/lib/payload";
import { siteUrl } from "@/lib/site-url";

type Href = ComponentProps<typeof getPathname>["href"];

const entry = (href: Href, priority: number): MetadataRoute.Sitemap[number] => {
  const url = (locale: (typeof routing.locales)[number]) => `${siteUrl}${getPathname({ locale, href })}`;
  return {
    url: url(routing.defaultLocale),
    priority,
    alternates: { languages: Object.fromEntries(routing.locales.map((locale) => [locale, url(locale)])) },
  };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [models, urns] = await Promise.all([
    getModels(routing.defaultLocale),
    getUrns(routing.defaultLocale),
  ]);

  return [
    entry("/", 1),
    ...models.map((model) => entry({ pathname: "/collections/[model]", params: { model: model.slug } }, 0.9)),
    ...urns.map((urn) => entry({ pathname: "/urnes/[number]", params: { number: String(urn.number) } }, 0.7)),
    entry("/tarifs", 0.8),
    entry("/urnes-de-papel", 0.6),
    entry("/artisane", 0.6),
    entry("/demande", 0.8),
  ];
}
