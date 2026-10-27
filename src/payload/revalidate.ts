import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

// Every page reads shared content (settings, urns, prices), so any edit refreshes the whole site.
const revalidateSite = (context: Record<string, unknown>) => {
  if (context.disableRevalidate) return;
  try {
    revalidatePath("/[locale]", "layout");
  } catch {
    // Outside a Next.js request (e.g. the seed script) there is nothing to revalidate.
  }
};

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSite(req.context);
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context);
  return doc;
};
