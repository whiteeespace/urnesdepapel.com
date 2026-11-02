import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ButtonLink, TextLink } from "@/components/Button";
import { Page } from "@/components/Page";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { asMedia, asModel, padNumber, shapeOf } from "@/lib/content";
import { getUrn, getUrns } from "@/lib/payload";
import { formatPrice } from "@/lib/price";
import { pageMetadata } from "@/lib/seo";

import Gallery from "./_components/Gallery";
import styles from "./styles.module.scss";

type Props = PageProps<"/[locale]/urnes/[number]">;

export const dynamicParams = true;

export async function generateStaticParams() {
  const urns = await getUrns(routing.defaultLocale);
  return routing.locales.flatMap((locale) => urns.map((urn) => ({ locale, number: String(urn.number) })));
}

const parse = async (params: Props["params"]) => {
  const { locale, number } = (await params) as { locale: Locale; number: string };
  return { locale, number: Number.parseInt(number, 10) };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, number } = await parse(params);
  const urn = Number.isFinite(number) ? await getUrn(number, locale) : undefined;
  if (!urn) return {};
  const t = await getTranslations({ locale, namespace: "common" });
  return pageMetadata({
    locale,
    href: { pathname: "/urnes/[number]", params: { number: String(number) } },
    title: `${asModel(urn.model)?.name ?? ""} ${t("urnNumber", { number: urn.number })}`.trim(),
    description: urn.description,
  });
}

const UrnPage = async ({ params }: Props) => {
  const { locale, number } = await parse(params);
  setRequestLocale(locale);

  const urn = Number.isFinite(number) ? await getUrn(number, locale) : undefined;
  if (!urn) notFound();

  const [t, tCommon] = await Promise.all([getTranslations("urn"), getTranslations("common")]);
  const model = asModel(urn.model);
  const shape = shapeOf(model);
  const images = (urn.images ?? []).map(asMedia).filter((media) => media !== undefined);
  // Back to the urn's collection, or to the home page's collections if it has none.
  const backHref = model ? { pathname: "/collections/[model]" as const, params: { model: model.slug } } : "/";
  // The request opens the form with this urn chosen, at the personalizations.
  const requestHref = { pathname: "/demande" as const, query: { urn: urn.number } };

  return (
    <Page className={styles.page}>
      {/* Laid out like a shop's product page: the details on the left and the price and actions on
          the right both stay in view while the photos scroll between them. */}
      <div className={styles.detail}>
        <div className={styles.info}>
          <h1 className={styles.heading}>
            <span>{model?.name}</span>{" "}
            <span className={styles.number}>{tCommon("urnNumber", { number: padNumber(urn.number) })}</span>
          </h1>
          <p className={styles.description}>{urn.description}</p>
          {/* The details fold away, each opening on its own. */}
          <div className={styles.specs}>
            {[
              { label: t("colour"), value: urn.colour },
              { label: t("fibres"), value: urn.fibres },
              { label: t("materials"), value: urn.materials },
            ].map(({ label, value }) =>
              value ? (
                <details key={label} className={styles.spec}>
                  <summary>{label}</summary>
                  <p>{value}</p>
                </details>
              ) : null
            )}
          </div>
        </div>

        <div className={styles.photos}>
          <Gallery images={images} shape={shape} tint={urn.tint} />
        </div>

        <div className={styles.buy}>
          <p className={styles.price}>
            {formatPrice(locale, urn.price)}
            <span className={styles.priceLabel}>{t("basePrice")}</span>
          </p>
          <ButtonLink href={requestHref} className={styles.action}>
            {t("request")}
          </ButtonLink>
          <TextLink href="/tarifs" className={styles.options}>
            {tCommon("customizationOptions")}
          </TextLink>
          <p className={styles.note}>{t("unique")}</p>
          <Link href={backHref} className={styles.back}>
            ← {t("back")}
          </Link>
        </div>
      </div>
    </Page>
  );
};

export default UrnPage;
