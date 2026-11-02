import type { CollectionAfterChangeHook, CollectionConfig } from "payload";

import { siteUrl } from "@/lib/site-url";

import { authenticated } from "../access";

const TYPE_LABELS: Record<string, string> = {
  order: "Commander une urne",
  customize: "Personnaliser une urne",
  question: "Poser une question",
};

// Emails the studio when a visitor sends a request: to the address set for requests, or the public
// email when none is set. Replies go straight to the visitor. Sending never blocks saving the request.
const notifyStudio: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== "create") return doc;

  try {
    const settings = await req.payload.findGlobal({ slug: "site-settings", depth: 0, req });
    const to = settings.notificationEmail || settings.email;
    if (!to) {
      req.payload.logger.warn("No address set to receive requests (Site settings); none was emailed.");
      return doc;
    }

    // The request is saved with ids only; look up the urn's collection and number, and the options.
    const urnId = typeof doc.urn === "object" && doc.urn ? doc.urn.id : doc.urn;
    const urn = urnId
      ? await req.payload.findByID({ collection: "urns", id: urnId, depth: 1, locale: "fr", req })
      : undefined;
    const model = urn && typeof urn.model === "object" ? urn.model : undefined;
    const urnLabel = urn
      ? [model?.name, `#${String(urn.number).padStart(2, "0")}`, urn.colour].filter(Boolean).join(" · ")
      : "—";

    const optionIds = ((doc.options ?? []) as (number | { id: number })[]).map((o) =>
      typeof o === "object" ? o.id : o
    );
    const options = optionIds.length
      ? (
          await req.payload.find({
            collection: "pricing-options",
            where: { id: { in: optionIds } },
            depth: 0,
            locale: "fr",
            limit: optionIds.length,
            req,
          })
        ).docs.map((option) => option.name)
      : [];

    const adminUrl = `${siteUrl}/admin/collections/requests/${doc.id}`;
    const lines = [
      `Type : ${TYPE_LABELS[doc.type as string] ?? doc.type}`,
      `Urne : ${urnLabel}`,
      `Options : ${options.length ? options.join(", ") : "—"}`,
      `Estimation : ${doc.estimate || "—"}`,
      `Date souhaitée : ${doc.preferredDate ? String(doc.preferredDate).slice(0, 10) : "—"}`,
      "",
      `Nom : ${doc.name}`,
      `Courriel : ${doc.email}`,
      `Téléphone : ${doc.phone || "—"}`,
      `Langue : ${doc.locale === "en" ? "anglais" : "français"}`,
      "",
      doc.message || "(aucun message)",
      "",
      `Voir dans l’admin : ${adminUrl}`,
    ];

    await req.payload.sendEmail({
      to,
      replyTo: doc.email as string,
      subject: `Nouvelle demande : ${doc.name}`,
      text: lines.join("\n"),
    });
  } catch (error) {
    req.payload.logger.error({ err: error, msg: "Could not send request notification" });
  }

  return doc;
};

export const Requests: CollectionConfig = {
  slug: "requests",
  labels: {
    singular: { fr: "Demande", en: "Request" },
    plural: { fr: "Demandes", en: "Requests" },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "urn", "status", "createdAt"],
    group: { fr: "Demandes", en: "Requests" },
  },
  defaultSort: "-createdAt",
  // Visitors never write here directly: the site's server action creates requests.
  access: {
    read: authenticated,
    create: () => false,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [notifyStudio],
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      label: { fr: "Statut", en: "Status" },
      options: [
        { label: { fr: "Nouvelle", en: "New" }, value: "new" },
        { label: { fr: "En cours", en: "In progress" }, value: "in-progress" },
        { label: { fr: "Terminée", en: "Done" }, value: "done" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "locale",
      type: "select",
      label: { fr: "Langue", en: "Language" },
      options: [
        { label: "Français", value: "fr" },
        { label: "English", value: "en" },
      ],
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "type",
      type: "select",
      required: true,
      label: { fr: "Type de demande", en: "Request type" },
      options: [
        { label: { fr: "Commander une urne", en: "Order an urn" }, value: "order" },
        { label: { fr: "Personnaliser une urne", en: "Customize an urn" }, value: "customize" },
        { label: { fr: "Poser une question", en: "Ask a question" }, value: "question" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "urn",
          type: "relationship",
          relationTo: "urns",
          label: { fr: "Urne", en: "Urn" },
        },
        {
          name: "options",
          type: "relationship",
          relationTo: "pricing-options",
          hasMany: true,
          label: { fr: "Options", en: "Options" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "preferredDate",
          type: "date",
          label: { fr: "Date souhaitée", en: "Preferred date" },
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" } },
        },
        {
          name: "estimate",
          type: "text",
          label: { fr: "Estimation affichée", en: "Estimate shown" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, label: { fr: "Nom", en: "Name" } },
        { name: "email", type: "email", required: true, label: { fr: "Courriel", en: "Email" } },
        { name: "phone", type: "text", label: { fr: "Téléphone", en: "Phone" } },
      ],
    },
    {
      name: "contactPreference",
      type: "radio",
      defaultValue: "email",
      label: { fr: "Contact préféré", en: "Preferred contact" },
      options: [
        { label: { fr: "Courriel", en: "Email" }, value: "email" },
        { label: { fr: "Téléphone", en: "Phone" }, value: "phone" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      label: { fr: "Message", en: "Message" },
    },
  ],
};
