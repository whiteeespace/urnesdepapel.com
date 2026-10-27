import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Page, PageHeader } from "@/components/Page";
import type { Locale } from "@/i18n/routing";
import { asModel, shapeOf } from "@/lib/content";
import { getModels, getPage, getPricingOptions, getSettings, getUrns } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

import RequestForm, { type FormOption, type FormUrn } from "./_components/RequestForm";
import styles from "./styles.module.scss";

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

  const [t, page, models, urns, options, pricing, settings] = await Promise.all([
    getTranslations("meta"),
    getPage("request-page", locale),
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
      }))
  );

  const formOptions: FormOption[] = options.map((option) => ({
    id: String(option.id),
    name: option.name,
    description: option.description ?? "",
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
      <PageHeader title={t("request")}>
        {page.intro && <p className={styles.intro}>{page.intro}</p>}
      </PageHeader>
      <RequestForm
        urns={formUrns}
        options={formOptions}
        basePrice={pricing.basePrice ?? 350}
        initialUrn={initialUrn}
        phone={settings.phone ?? ""}
        leadTimeNote={settings.leadTimeNote ?? ""}
      />
    </Page>
  );
};

export default RequestPage;
