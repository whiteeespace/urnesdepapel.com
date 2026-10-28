import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../revalidate";

export const PricingOptions: CollectionConfig = {
  slug: "pricing-options",
  labels: {
    singular: { fr: "Option", en: "Option" },
    plural: { fr: "Options et tarifs", en: "Options and prices" },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "priceMin", "priceMax", "order"],
    group: { fr: "Catalogue", en: "Catalogue" },
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
      localized: true,
      label: { fr: "Nom", en: "Name" },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: { fr: "Description", en: "Description" },
    },
    {
      name: "summary",
      type: "text",
      localized: true,
      label: { fr: "Description courte", en: "Short description" },
      admin: {
        description: {
          fr: "Une ligne pour le formulaire de demande. La description complète reste sur la page des tarifs.",
          en: "One line for the request form. The full description stays on the pricing page.",
        },
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "priceMin",
          type: "number",
          required: true,
          min: 0,
          label: { fr: "Prix ($)", en: "Price ($)" },
        },
        {
          name: "priceMax",
          type: "number",
          min: 0,
          label: { fr: "Prix maximum ($)", en: "Maximum price ($)" },
          admin: {
            description: {
              fr: "Seulement pour une fourchette, par ex. 50–75 $.",
              en: "Only for a range, e.g. $50–75.",
            },
          },
        },
      ],
    },
    {
      name: "requires",
      type: "relationship",
      relationTo: "pricing-options",
      label: { fr: "Nécessite l’option", en: "Requires option" },
      admin: {
        description: {
          fr: "Par ex. la broderie n’est possible qu’avec la pochette.",
          en: "E.g. embroidery is only possible with the pouch.",
        },
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: { fr: "Photo", en: "Photo" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: { fr: "Ordre", en: "Order" },
      admin: { position: "sidebar" },
    },
  ],
};
