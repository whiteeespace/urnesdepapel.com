import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: { fr: "Image", en: "Image" },
    plural: { fr: "Images", en: "Images" },
  },
  admin: {
    group: { fr: "Contenu", en: "Content" },
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      label: { fr: "Texte alternatif", en: "Alt text" },
      admin: {
        description: {
          fr: "Décrit l’image pour les personnes qui ne la voient pas, par ex. « Urne Papillon n° 23, vue de face ».",
          en: "Describes the image for people who can’t see it, e.g. “Papillon urn no. 23, front view”.",
        },
      },
    },
  ],
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumb", width: 480 },
      { name: "card", width: 960 },
      { name: "large", width: 1800 },
    ],
    adminThumbnail: "thumb",
    focalPoint: true,
  },
};
