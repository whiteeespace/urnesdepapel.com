import type { Field, GlobalConfig } from "payload";

import { anyone } from "../access";
import { revalidateGlobal } from "../revalidate";

const group = { fr: "Pages", en: "Pages" };

const paragraphsHint = {
  fr: "Laissez une ligne vide entre les paragraphes.",
  en: "Leave a blank line between paragraphs.",
};

const page = (slug: string, label: GlobalConfig["label"], fields: Field[]): GlobalConfig => ({
  slug,
  label,
  admin: { group },
  access: { read: anyone },
  hooks: { afterChange: [revalidateGlobal] },
  fields,
});

export const HomePage = page("home-page", { fr: "Accueil", en: "Home" }, [
  { name: "intro", type: "textarea", localized: true, label: { fr: "Introduction", en: "Introduction" } },
  {
    name: "values",
    type: "array",
    label: { fr: "Valeurs", en: "Values" },
    maxRows: 4,
    fields: [
      { name: "label", type: "text", required: true, localized: true, label: { fr: "Texte", en: "Text" } },
    ],
  },
]);

export const AboutPage = page(
  "about-page",
  { fr: "Urnes de Papel (à propos)", en: "Urnes de Papel (about)" },
  [
    {
      name: "statement",
      type: "textarea",
      localized: true,
      label: { fr: "Énoncé de fondation", en: "Founding statement" },
    },
    { name: "image", type: "upload", relationTo: "media", label: { fr: "Photo", en: "Photo" } },
    {
      name: "sections",
      type: "array",
      label: { fr: "Sections", en: "Sections" },
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
          localized: true,
          label: { fr: "Titre", en: "Heading" },
        },
        {
          name: "body",
          type: "textarea",
          required: true,
          localized: true,
          label: { fr: "Texte", en: "Text" },
          admin: { description: paragraphsHint },
        },
        {
          name: "linkToPricing",
          type: "checkbox",
          label: { fr: "Ajouter un lien vers les tarifs", en: "Add a link to pricing" },
        },
      ],
    },
  ]
);

export const PricingPage = page("pricing-page", { fr: "Tarifs", en: "Pricing" }, [
  {
    name: "baseTitle",
    type: "text",
    localized: true,
    label: { fr: "Titre de l’urne de base", en: "Basic urn title" },
  },
  {
    name: "baseDescription",
    type: "textarea",
    localized: true,
    label: { fr: "Description de l’urne de base", en: "Basic urn description" },
  },
  {
    name: "basePrice",
    type: "number",
    defaultValue: 350,
    label: { fr: "Prix de l’urne de base ($)", en: "Basic urn price ($)" },
  },
  {
    name: "baseImage",
    type: "upload",
    relationTo: "media",
    label: { fr: "Photo de l’urne de base", en: "Basic urn photo" },
  },
]);

export const ArtisanPage = page("artisan-page", { fr: "L’artisane", en: "The artisan" }, [
  { name: "name", type: "text", label: { fr: "Nom", en: "Name" } },
  {
    name: "bio",
    type: "textarea",
    localized: true,
    label: { fr: "Biographie", en: "Biography" },
    admin: { description: paragraphsHint },
  },
  { name: "portrait", type: "upload", relationTo: "media", label: { fr: "Portrait", en: "Portrait" } },
]);

export const RequestPage = page("request-page", { fr: "Faire une demande", en: "Make a request" }, [
  { name: "intro", type: "textarea", localized: true, label: { fr: "Introduction", en: "Introduction" } },
]);
