/**
 * Loads the client's catalogue and page copy into Payload. Safe to re-run: it updates
 * existing documents by slug or urn number. Run with `npm run seed`.
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { getPayload, type Payload } from "payload";

import config from "@payload-config";

import * as copy from "./copy";
import { basePhoto, modelCovers, optionPhotos, photos, urnPhotos } from "./photos";

type Localized = { fr: string; en: string };
interface CatalogueUrn {
  number: number;
  model: string;
  price: number;
  inCanvas: boolean;
  fibres: Localized;
  colour: Localized;
  materials: Localized;
  description: Localized;
}
interface CatalogueOption {
  slug: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  name: Localized;
  description: Localized;
  summary?: Localized;
}
interface Catalogue {
  urns: CatalogueUrn[];
  options: CatalogueOption[];
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const context = { disableRevalidate: true };

const loadCatalogue = async (): Promise<Catalogue> =>
  JSON.parse(await readFile(path.resolve(dirname, "../../content/urns.json"), "utf8")) as Catalogue;

// Creates or updates one document, writing the French values first and then the English ones.
const upsert = async (
  payload: Payload,
  collection: "models" | "urns" | "pricing-options",
  where: Record<string, { equals: unknown }>,
  fr: Record<string, unknown>,
  en: Record<string, unknown>
): Promise<{ id: number }> => {
  const existing = await payload.find({ collection, where, limit: 1, depth: 0, context });
  const current = existing.docs[0];
  const doc = current
    ? await payload.update({ collection, id: current.id, data: fr as never, locale: "fr", context })
    : await payload.create({ collection, data: fr as never, locale: "fr", context });
  await payload.update({ collection, id: doc.id, data: en as never, locale: "en", context });
  return doc;
};

// Uploads each photo once (matched by filename) and returns the media ids by filename.
const uploadPhotos = async (payload: Payload): Promise<Record<string, number>> => {
  const ids: Record<string, number> = {};
  for (const [filename, alt] of Object.entries(photos)) {
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      context,
    });
    const doc =
      existing.docs[0] ??
      (await payload.create({
        collection: "media",
        data: { alt: alt.fr },
        filePath: path.resolve(dirname, "../../content/photos", filename),
        locale: "fr",
        context,
      }));
    await payload.update({ collection: "media", id: doc.id, data: { alt: alt.fr }, locale: "fr", context });
    await payload.update({ collection: "media", id: doc.id, data: { alt: alt.en }, locale: "en", context });
    ids[filename] = doc.id;
  }
  return ids;
};

const seed = async () => {
  const payload = await getPayload({ config });
  const catalogue = await loadCatalogue();

  payload.logger.info("Uploading photos…");
  const mediaIds = await uploadPhotos(payload);
  const media = (filename: string | undefined) => (filename ? mediaIds[filename] : undefined);

  payload.logger.info("Seeding collections…");
  const modelIds: Record<string, number> = {};
  for (const model of copy.models) {
    const cover = media(modelCovers[model.slug]);
    const doc = await upsert(payload, "models", { slug: { equals: model.slug } }, { ...model, cover }, {});
    modelIds[model.slug] = doc.id;
  }

  for (const urn of catalogue.urns) {
    const shared = {
      number: urn.number,
      model: modelIds[urn.model],
      price: urn.price,
      // Urns 21 and 36 are in the product sheet but not on the site canvas: hidden until confirmed.
      // Urns without a photo yet (22) are hidden too.
      visible: urn.inCanvas && Boolean(urnPhotos[urn.number]),
      tint: copy.tints[urn.number],
      images: (urnPhotos[urn.number] ?? []).map(media),
    };
    const pick = (lang: "fr" | "en") => ({
      description: urn.description[lang],
      colour: urn.colour[lang],
      fibres: urn.fibres[lang],
      materials: urn.materials[lang],
    });
    await upsert(
      payload,
      "urns",
      { number: { equals: urn.number } },
      { ...shared, ...pick("fr") },
      pick("en")
    );
  }

  // The basic urn lives on the pricing page; the rest are add-on options.
  const optionIds: Record<string, number> = {};
  const addOns = catalogue.options.filter((option) => option.slug !== "base");
  for (const [index, option] of addOns.entries()) {
    const doc = await upsert(
      payload,
      "pricing-options",
      { order: { equals: index + 1 } },
      {
        name: option.name.fr,
        description: option.description.fr,
        summary: option.summary?.fr,
        priceMin: option.price ?? option.priceMin,
        priceMax: option.priceMax ?? null,
        image: media(optionPhotos[option.slug]),
        order: index + 1,
      },
      { name: option.name.en, description: option.description.en, summary: option.summary?.en }
    );
    optionIds[option.slug] = doc.id;
  }
  if (optionIds["pouch-custom"] && optionIds.pouch) {
    await payload.update({
      collection: "pricing-options",
      id: optionIds["pouch-custom"],
      data: { requires: optionIds.pouch },
      context,
    });
  }

  payload.logger.info("Seeding pages…");
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "fr",
    context,
    data: {
      phone: copy.settings.phone,
      etsyUrl: copy.settings.etsyUrl,
      descriptor: copy.settings.descriptor.fr,
      leadTimeNote: copy.settings.leadTimeNote.fr,
      seoDescription: copy.settings.seoDescription.fr,
    },
  });
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "en",
    context,
    data: {
      descriptor: copy.settings.descriptor.en,
      leadTimeNote: copy.settings.leadTimeNote.en,
      seoDescription: copy.settings.seoDescription.en,
    },
  });

  await payload.updateGlobal({ slug: "home-page", locale: "fr", context, data: { intro: copy.home.intro.fr } });
  await payload.updateGlobal({ slug: "home-page", locale: "en", context, data: { intro: copy.home.intro.en } });

  const aboutFr = await payload.updateGlobal({
    slug: "about-page",
    locale: "fr",
    context,
    data: {
      statement: copy.about.statement.fr,
      sections: copy.about.sections.map((s) => ({
        heading: s.heading.fr,
        body: s.body.fr,
        linkToPricing: "linkToPricing" in s ? s.linkToPricing : false,
      })),
    },
  });
  await payload.updateGlobal({
    slug: "about-page",
    locale: "en",
    context,
    data: {
      statement: copy.about.statement.en,
      sections: (aboutFr.sections ?? []).map((row, i) => ({
        ...row,
        heading: copy.about.sections[i]?.heading.en ?? "",
        body: copy.about.sections[i]?.body.en ?? "",
      })),
    },
  });

  for (const locale of ["fr", "en"] as const) {
    await payload.updateGlobal({
      slug: "pricing-page",
      locale,
      context,
      data: {
        baseTitle: copy.pricing.baseTitle[locale],
        baseDescription: copy.pricing.baseDescription[locale],
        basePrice: copy.pricing.basePrice,
        baseImage: media(basePhoto),
      },
    });
    await payload.updateGlobal({
      slug: "artisan-page",
      locale,
      context,
      data: { name: copy.artisan.name, bio: copy.artisan.bio[locale] },
    });
    await payload.updateGlobal({
      slug: "request-page",
      locale,
      context,
      data: { intro: copy.request.intro[locale] },
    });
  }

  payload.logger.info("Seed complete.");
  process.exit(0);
};

await seed();
