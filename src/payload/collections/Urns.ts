import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { authenticated, visibleOrAuthenticated } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../revalidate";

// Keeps a readable title ("Papillon n° 23") for admin lists and relationship pickers.
const setTitle: CollectionBeforeValidateHook = async ({ data, req, originalDoc }) => {
  if (!data) return data;
  const modelRef = (data.model ?? originalDoc?.model) as number | { id: number } | undefined;
  const number = (data.number ?? originalDoc?.number) as number | undefined;
  if (!modelRef || number === undefined) return data;

  const modelId = typeof modelRef === "object" ? modelRef.id : modelRef;
  const model = await req.payload.findByID({ collection: "models", id: modelId, depth: 0, req });
  return { ...data, title: `${model.name} n° ${number}` };
};

export const Urns: CollectionConfig = {
  slug: "urns",
  labels: {
    singular: { fr: "Urne", en: "Urn" },
    plural: { fr: "Urnes", en: "Urns" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "model", "colour", "price", "visible"],
    group: { fr: "Catalogue", en: "Catalogue" },
    listSearchableFields: ["title", "number"],
  },
  defaultSort: "number",
  access: {
    read: visibleOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [setTitle],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: { fr: "Titre", en: "Title" },
      admin: { readOnly: true, hidden: true },
    },
    {
      type: "row",
      fields: [
        {
          name: "number",
          type: "number",
          required: true,
          unique: true,
          index: true,
          label: { fr: "Numéro", en: "Number" },
        },
        {
          name: "model",
          type: "relationship",
          relationTo: "models",
          required: true,
          label: { fr: "Collection", en: "Collection" },
        },
        {
          name: "price",
          type: "number",
          required: true,
          defaultValue: 350,
          min: 0,
          label: { fr: "Prix de base ($)", en: "Base price ($)" },
        },
      ],
    },
    {
      name: "visible",
      type: "checkbox",
      defaultValue: true,
      label: { fr: "Afficher sur le site", en: "Show on the site" },
      admin: { position: "sidebar" },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      localized: true,
      label: { fr: "Description", en: "Description" },
    },
    {
      name: "colour",
      type: "text",
      required: true,
      localized: true,
      label: { fr: "Couleur", en: "Colour" },
    },
    {
      name: "fibres",
      type: "text",
      localized: true,
      label: { fr: "Fibres", en: "Fibres" },
    },
    {
      name: "materials",
      type: "textarea",
      localized: true,
      label: { fr: "Matériaux", en: "Materials" },
    },
    {
      name: "tint",
      type: "text",
      label: { fr: "Teinte de remplacement", en: "Placeholder tint" },
      admin: {
        position: "sidebar",
        description: {
          fr: "Couleur pâle (#e9e1d1) affichée tant qu’il n’y a pas de photo.",
          en: "Pale colour (#e9e1d1) shown until there is a photo.",
        },
      },
      validate: (value: string | null | undefined) =>
        !value || /^#[0-9a-f]{6}$/i.test(value) || "Format: #rrggbb",
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: { fr: "Photos", en: "Photos" },
      admin: {
        description: {
          fr: "La première photo sert de vignette.",
          en: "The first photo is used as the thumbnail.",
        },
      },
    },
  ],
};
