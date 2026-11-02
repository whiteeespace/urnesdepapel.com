import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { en } from "@payloadcms/translations/languages/en";
import { fr } from "@payloadcms/translations/languages/fr";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./payload/collections/Media";
import { Models } from "./payload/collections/Models";
import { PricingOptions } from "./payload/collections/PricingOptions";
import { Requests } from "./payload/collections/Requests";
import { Urns } from "./payload/collections/Urns";
import { Users } from "./payload/collections/Users";
import { AboutPage, ArtisanPage, HomePage, PricingPage, RequestPage } from "./payload/globals/pages";
import { SiteSettings } from "./payload/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Urnes de Papel" },
  },
  collections: [Requests, Urns, Models, PricingOptions, Media, Users],
  globals: [HomePage, AboutPage, PricingPage, ArtisanPage, RequestPage, SiteSettings],
  localization: {
    locales: [
      { code: "fr", label: "Français" },
      { code: "en", label: "English" },
    ],
    defaultLocale: "fr",
    fallback: true,
  },
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: "fr",
  },
  secret: process.env.PAYLOAD_SECRET ?? "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL ?? "" },
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ?? "demandes@urnesdepapel.com",
        defaultFromName: "Urnes de Papel",
      })
    : undefined,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Keep the plugin's columns even where Blob is off (locally), so the database schema and the
      // migrations are the same everywhere.
      alwaysInsertFields: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
