import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../revalidate";

export const SHAPES = ["anemone", "papillon", "tulipe"] as const;
export type Shape = (typeof SHAPES)[number];

export const Models: CollectionConfig = {
  slug: "models",
  labels: {
    singular: { fr: "Collection", en: "Collection" },
    plural: { fr: "Collections", en: "Collections" },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "order"],
    group: { fr: "Catalogue", en: "Catalogue" },
    description: {
      fr: "Les formes d’urnes : Papillon, Anémone, Tulipe.",
      en: "The urn shapes: Papillon, Anémone, Tulipe.",
    },
  },
  defaultSort: "order",
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
      name: "name",
      type: "text",
      required: true,
      label: { fr: "Nom", en: "Name" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { fr: "Adresse (slug)", en: "URL slug" },
      admin: {
        position: "sidebar",
        description: {
          fr: "Utilisé dans l’adresse de la page, par ex. papillon.",
          en: "Used in the page address, e.g. papillon.",
        },
      },
    },
    {
      name: "shape",
      type: "select",
      required: true,
      defaultValue: "anemone",
      label: { fr: "Silhouette", en: "Silhouette" },
      options: [
        { label: "Anémone", value: "anemone" },
        { label: "Papillon", value: "papillon" },
        { label: "Tulipe", value: "tulipe" },
      ],
      admin: {
        position: "sidebar",
        description: {
          fr: "Dessin affiché tant qu’aucune photo n’est ajoutée.",
          en: "Drawing shown until a photo is added.",
        },
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: { fr: "Ordre", en: "Order" },
      admin: { position: "sidebar" },
    },
    {
      name: "intro",
      type: "textarea",
      localized: true,
      label: { fr: "Présentation", en: "Introduction" },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: { fr: "Photo de couverture", en: "Cover photo" },
    },
  ],
};
