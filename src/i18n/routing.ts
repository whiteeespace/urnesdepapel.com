import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
  // Folder names are the French slugs; English gets its own.
  pathnames: {
    "/": "/",
    "/collections/[model]": "/collections/[model]",
    "/urnes/[number]": { fr: "/urnes/[number]", en: "/urns/[number]" },
    "/urnes-de-papel": { fr: "/urnes-de-papel", en: "/about" },
    "/tarifs": { fr: "/tarifs", en: "/pricing" },
    "/artisane": { fr: "/artisane", en: "/artisan" },
    "/demande": { fr: "/demande", en: "/request" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathname = keyof typeof routing.pathnames;
