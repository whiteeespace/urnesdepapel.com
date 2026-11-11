import type { GlobalConfig } from "payload";

import { anyone } from "../access";
import { revalidateGlobal } from "../revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: { fr: "Réglages du site", en: "Site settings" },
  admin: { group: { fr: "Réglages", en: "Settings" } },
  access: { read: anyone },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "phone", type: "text", label: { fr: "Téléphone", en: "Phone" } },
        { name: "email", type: "email", label: { fr: "Courriel public", en: "Public email" } },
      ],
    },
    {
      name: "notificationEmail",
      type: "email",
      label: { fr: "Recevoir les demandes à", en: "Send requests to" },
      admin: {
        description: {
          fr: "Chaque nouvelle demande du formulaire est envoyée à cette adresse (ou au courriel public si elle est vide).",
          en: "Each new request from the form is emailed to this address (or to the public email if left empty).",
        },
      },
    },
    {
      name: "descriptor",
      type: "text",
      localized: true,
      label: { fr: "Descriptif", en: "Descriptor" },
    },
    {
      name: "leadTimeNote",
      type: "text",
      localized: true,
      label: { fr: "Note sur les délais", en: "Lead time note" },
    },
    {
      name: "seoDescription",
      type: "textarea",
      localized: true,
      label: { fr: "Description pour les moteurs de recherche", en: "Search engine description" },
    },
  ],
};
