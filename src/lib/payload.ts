import "server-only";

import { getPayload } from "payload";
import { cache } from "react";

import type { Locale } from "@/i18n/routing";
import config from "@payload-config";

export const getPayloadClient = cache(() => getPayload({ config }));

// The Local API skips access control, so every public query filters hidden urns itself.
const visible = { visible: { equals: true } } as const;

export const getSettings = cache(async (locale: Locale) => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings", locale, depth: 0 });
});

export const getPage = cache(
  async <T extends "home-page" | "about-page" | "pricing-page" | "artisan-page" | "request-page">(
    slug: T,
    locale: Locale
  ) => {
    const payload = await getPayloadClient();
    return payload.findGlobal({ slug, locale, depth: 1 });
  }
);

export const getModels = cache(async (locale: Locale) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "models", locale, depth: 1, limit: 50, sort: "order" });
  return docs;
});

export const getUrns = cache(async (locale: Locale) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "urns",
    locale,
    depth: 1,
    limit: 500,
    sort: "number",
    where: visible,
  });
  return docs;
});

export const getUrn = cache(async (number: number, locale: Locale) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "urns",
    locale,
    depth: 1,
    limit: 1,
    where: { and: [visible, { number: { equals: number } }] },
  });
  return docs[0];
});

export const getPricingOptions = cache(async (locale: Locale) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "pricing-options",
    locale,
    depth: 1,
    limit: 50,
    sort: "order",
  });
  return docs;
});
