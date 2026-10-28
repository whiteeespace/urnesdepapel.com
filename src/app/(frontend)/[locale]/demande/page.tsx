import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Page } from "@/components/Page";
import type { Locale } from "@/i18n/routing";
import { asMedia, asModel, shapeOf } from "@/lib/content";
import { getModels, getPage, getPricingOptions, getSettings, getUrns } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

import RequestForm, { type FormOption, type FormUrn } from "./_components/RequestForm";

type Props = PageProps<"/[locale]/demande">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getPage("request-page", locale),
  ]);
  return pageMetadata({ locale, href: "/demande", title: t("request"), description: page.intro });
}

const RequestPage = async ({ params, searchParams }: Props) => {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const { urn: requestedUrn } = await searchParams;

  const [t, models, urns, options, pricing, settings] = await Promise.all([
    getTranslations("meta"),
    getModels(locale),
    getUrns(locale),
    getPricingOptions(locale),
    getPage("pricing-page", locale),
    getSettings(locale),
  ]);

  // Urns grouped in collection order, as plain data for the client form.
  const formUrns: FormUrn[] = models.flatMap((model) =>
    urns
      .filter((urn) => asModel(urn.model)?.id === model.id)
      .map((urn) => ({
        number: urn.number,
        modelName: model.name,
        colour: urn.colour,
        description: urn.description,
        price: urn.price,
        shape: shapeOf(model),
        tint: urn.tint ?? null,
        photo: asMedia(urn.images?.[0]),
        modelCover: asMedia(model.cover),
      }))
  );

  const formOptions: FormOption[] = options.map((option) => ({
    id: String(option.id),
    name: option.name,
    // The form shows the one-line summary; the full description is for the pricing page.
    description: option.summary || option.description || "",
    priceMin: option.priceMin,
    priceMax: option.priceMax ?? null,
    requires:
      option.requires == null
        ? null
        : String(typeof option.requires === "object" ? option.requires.id : option.requires),
  }));

  const initialUrn =
    typeof requestedUrn === "string" && formUrns.some((urn) => String(urn.number) === requestedUrn)
      ? requestedUrn
      : "";

  return (
    <Page>
      {/* The form asks one question at a time, so the page title is for screen readers only. */}
      <h1 className="visually-hidden">{t("request")}</h1>
      <RequestForm
        urns={formUrns}
        options={formOptions}
        basePrice={pricing.basePrice ?? 350}
        initialUrn={initialUrn}
        phone={settings.phone ?? ""}
      />
    </Page>
  );
};

export default RequestPage;
