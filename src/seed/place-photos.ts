/**
 * Puts the client's photos on the pages without touching any text, for a site whose copy has
 * already been edited in the admin. Uploads the photos in content/photos that the media library
 * doesn't have yet, then fills the artisan portrait and studio photos and the about banner and
 * section photos, but only where they are empty, so photos the client chose stay. Safe to re-run.
 * Run with `npm run seed:photos`.
 */
import { getPayload } from "payload";

import config from "@payload-config";

import { context, uploadPhotos } from "./media";
import { aboutPhotos, artisanPhotos } from "./photos";

const placePhotos = async () => {
  const payload = await getPayload({ config });
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
  payload.logger.info(
    `About page: ${aboutData.image ? "set the banner, " : ""}set ${missing} section photo(s)`
  );

  payload.logger.info("Photos placed.");
  process.exit(0);
};

await placePhotos();
