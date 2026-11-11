import path from "path";
import { fileURLToPath } from "url";

import type { Payload } from "payload";

import { aboutPhotos, artisanPhotos, photos } from "./photos";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// A fresh context for every call: Payload hooks (the Blob storage plugin among them) keep per-call
// state on it, so sharing one object between calls leaks one upload's file into the next.
export const context = () => ({ disableRevalidate: true });

/**
 * Uploads each photo in content/photos once (matched by filename) and returns the media ids by
 * filename. With `refreshAlt`, photos already in the library get the seed's alt text again;
 * without it, their alt text is left as the client wrote it.
 */
export const uploadPhotos = async (
  payload: Payload,
  { refreshAlt }: { refreshAlt: boolean }
): Promise<Record<string, number>> => {
  const ids: Record<string, number> = {};
  for (const [filename, alt] of Object.entries(photos)) {
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      context: context(),
    });
    let doc = existing.docs[0];
    if (!doc) {
      payload.logger.info(`Uploading ${filename}`);
      doc = await payload.create({
        collection: "media",
        data: { alt: alt.fr },
        filePath: path.resolve(dirname, "../../content/photos", filename),
        locale: "fr",
        context: context(),
      });
    }
    if (!existing.docs[0] || refreshAlt) {
      await payload.update({ collection: "media", id: doc.id, data: { alt: alt.fr }, locale: "fr", context: context() });
      await payload.update({ collection: "media", id: doc.id, data: { alt: alt.en }, locale: "en", context: context() });
    }
    ids[filename] = doc.id;
  }
  return ids;
};

/**
 * Puts the client's photos on the pages without touching any text: uploads the photos the media
 * library doesn't have yet, then fills the artisan portrait and studio photos and the about banner
 * and section photos, only where they are empty, so photos chosen in the admin stay. Safe to re-run.
 */
export const placePhotos = async (payload: Payload): Promise<void> => {
  const ids = await uploadPhotos(payload, { refreshAlt: false });
  const media = (filename: string) => ids[filename];

  const artisan = await payload.findGlobal({ slug: "artisan-page", depth: 0, context: context() });
  const artisanData: Record<string, unknown> = {};
  if (!artisan.portrait) artisanData.portrait = media(artisanPhotos.portrait);
  if (!artisan.gallery?.length) artisanData.gallery = artisanPhotos.gallery.map(media);
  if (Object.keys(artisanData).length > 0) {
    await payload.updateGlobal({ slug: "artisan-page", data: artisanData, context: context() });
  }
  payload.logger.info(`Artisan page: set ${Object.keys(artisanData).join(", ") || "nothing (already has photos)"}`);

  // Section rows keep their ids, so their text in both languages stays as it is.
  const about = await payload.findGlobal({ slug: "about-page", locale: "fr", depth: 0, context: context() });
  const sections = about.sections ?? [];
  const missing = sections.filter((row, i) => !row.image && aboutPhotos.sections[i]).length;
  const aboutData: Record<string, unknown> = {};
  if (!about.image) aboutData.image = media(aboutPhotos.banner);
  if (missing > 0) {
    aboutData.sections = sections.map((row, i) => ({
      ...row,
      image: row.image ?? (aboutPhotos.sections[i] ? media(aboutPhotos.sections[i]) : null),
    }));
  }
  if (Object.keys(aboutData).length > 0) {
    await payload.updateGlobal({ slug: "about-page", locale: "fr", data: aboutData, context: context() });
  }
  payload.logger.info(`About page: ${aboutData.image ? "set the banner, " : ""}set ${missing} section photo(s)`);
};
