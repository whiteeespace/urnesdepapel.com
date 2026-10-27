import classNames from "classnames";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { PropsWithChildren } from "react";

import { ButtonLink } from "@/components/Button";
import { Page, PageHeader } from "@/components/Page";
import UrnFigure from "@/components/UrnFigure";
import type { Locale } from "@/i18n/routing";
import { asMedia } from "@/lib/content";
import { getPage, getPricingOptions, getSettings } from "@/lib/payload";
import { formatPrice } from "@/lib/price";
import { pageMetadata } from "@/lib/seo";

import styles from "./styles.module.scss";

type Props = PageProps<"/[locale]/tarifs">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, href: "/tarifs", title: t("pricing") });
}

interface PriceCardProps {
  name: string | null | undefined;
  price: string;
  description: string | null | undefined;
  detailsLabel: string;
  className?: string;
}

// The photo fills the card; the name and price sit on it, and the description opens under them.
const PriceCard = ({
  name,
  price,
  description,
  detailsLabel,
  className,
  children,
}: PropsWithChildren<PriceCardProps>) => (
  <article className={classNames(styles.card, className)}>
    {children}
    <div className={styles.overlay}>
      <div className={styles.top}>
        <h2 className={styles.name}>{name}</h2>
        <span className={styles.price}>{price}</span>
      </div>
      {description && (
        <details className={styles.details}>
          <summary className={styles.summary}>{detailsLabel}</summary>
          <p className={styles.description}>{description}</p>
        </details>
      )}
    </div>
  </article>
);

const PricingPage = async ({ params }: Props) => {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [t, page, options, settings] = await Promise.all([
    getTranslations(),
    getPage("pricing-page", locale),
    getPricingOptions(locale),
    getSettings(locale),
  ]);

  return (
    <Page>
      <PageHeader title={t("meta.pricing")}>
        {settings.leadTimeNote && <p className={styles.note}>{settings.leadTimeNote}</p>}
      </PageHeader>

      <div className={styles.pricing}>
        <PriceCard
          className={styles.base}
          name={page.baseTitle}
          price={formatPrice(locale, page.basePrice ?? 350)}
          description={page.baseDescription}
          detailsLabel={t("pricing.details")}
        >
          <UrnFigure
            media={asMedia(page.baseImage)}
            shape="anemone"
            sizes="(max-width: 860px) 100vw, 40vw"
            priority
            className={styles.media}
          />
        </PriceCard>

        <section className={styles.addOns} aria-label={t("pricing.options")}>
          {options.map((option) => (
            <PriceCard
              key={option.id}
              name={option.name}
              price={formatPrice(locale, option.priceMin, option.priceMax)}
              description={option.description}
              detailsLabel={t("pricing.details")}
            >
              <UrnFigure
                media={asMedia(option.image)}
                sizes="(max-width: 600px) 100vw, (max-width: 860px) 50vw, 28vw"
                className={styles.media}
              />
            </PriceCard>
          ))}
        </section>
      </div>

      <div>
        <ButtonLink href="/demande">{t("pricing.startRequest")} →</ButtonLink>
      </div>
    </Page>
  );
};

export default PricingPage;
