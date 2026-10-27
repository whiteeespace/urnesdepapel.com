"use server";

import { getLocale } from "next-intl/server";

import { getPayloadClient } from "@/lib/payload";
import { formatPrice } from "@/lib/price";
import { requestSchema, type RequestFormValues } from "@/lib/request-schema";

export type SubmitRequestResult = { ok: true } | { ok: false; error: "invalid" | "server" };

export default async function submitRequest(values: RequestFormValues): Promise<SubmitRequestResult> {
  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const data = parsed.data;
  // Bots fill the hidden field: pretend it worked and store nothing.
  if (data.website) return { ok: true };

  try {
    const [payload, locale] = await Promise.all([getPayloadClient(), getLocale()]);

    const urnNumber = Number.parseInt(data.urn, 10);
    const urn = Number.isFinite(urnNumber)
      ? (
          await payload.find({
            collection: "urns",
            where: { and: [{ number: { equals: urnNumber } }, { visible: { equals: true } }] },
            limit: 1,
            depth: 0,
          })
        ).docs[0]
      : undefined;

    const optionIds = data.options.map(Number).filter(Number.isFinite);
    const options = optionIds.length
      ? (
          await payload.find({
            collection: "pricing-options",
            where: { id: { in: optionIds } },
            limit: optionIds.length,
            depth: 0,
          })
        ).docs
      : [];

    // Recompute the estimate from stored prices rather than trusting the browser.
    const pricing = await payload.findGlobal({ slug: "pricing-page", depth: 0 });
    const hasUrn = Boolean(urn) || data.type !== "question" || options.length > 0;
    const base = hasUrn ? (urn?.price ?? pricing.basePrice ?? 350) : 0;
    const min = base + options.reduce((sum, option) => sum + option.priceMin, 0);
    const max = base + options.reduce((sum, option) => sum + (option.priceMax ?? option.priceMin), 0);

    await payload.create({
      collection: "requests",
      data: {
        status: "new",
        type: data.type,
        urn: urn?.id,
        options: options.map((option) => option.id),
        preferredDate: data.preferredDate || undefined,
        estimate: min > 0 ? formatPrice("fr", min, max) : undefined,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        contactPreference: data.contactPreference,
        message: data.message || undefined,
        locale,
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("Could not save request", error);
    return { ok: false, error: "server" };
  }
}
