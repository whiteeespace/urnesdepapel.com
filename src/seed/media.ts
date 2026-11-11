import path from "path";
import { fileURLToPath } from "url";

import type { Payload } from "payload";

import { photos } from "./photos";

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
