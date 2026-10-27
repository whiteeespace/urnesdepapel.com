import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ButtonLink, TextLink } from "@/components/Button";
import { Page } from "@/components/Page";
import UrnFigure from "@/components/UrnFigure";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { asMedia, asModel, padNumber, shapeOf } from "@/lib/content";
import { getUrn, getUrns } from "@/lib/payload";
import { formatPrice } from "@/lib/price";
import { pageMetadata } from "@/lib/seo";

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

  const [t, tCommon, urns] = await Promise.all([
    getTranslations("urn"),
    getTranslations("common"),
    getUrns(locale),
  ]);
  const model = asModel(urn.model);
  const shape = shapeOf(model);
  const siblings = urns.filter((other) => asModel(other.model)?.id === model?.id);
  const index = siblings.findIndex((other) => other.id === urn.id);
  const previous = siblings[(index - 1 + siblings.length) % siblings.length];
  const next = siblings[(index + 1) % siblings.length];
  const images = (urn.images ?? []).map(asMedia);
  const views = [t("views.front"), t("views.detail"), t("views.opening")];
  const label = tCommon("urnNumber", { number: urn.number });
  const urnHref = (n: number) => ({ pathname: "/urnes/[number]" as const, params: { number: String(n) } });

  return (
    <Page>
      <div className={styles.detail}>
        <div className={styles.gallery}>
          <UrnFigure
            media={images[0]}
            shape={shape}
            tint={urn.tint}
            label={`${tCommon("photo")} · ${views[0]}`}
            ratio="square"
            sizes="(max-width: 860px) 100vw, 58vw"
            priority
            className={styles.main}
          />
          {views.map((view, i) => (
            <UrnFigure
              key={view}
              media={images[i + 1]}
              tint={urn.tint}
              label={view}
              ratio="square"
              sizes="(max-width: 860px) 33vw, 20vw"
            />
          ))}
        </div>

        <div className={styles.info}>
          <h1 className={styles.heading}>
            <span className={styles.number}>{tCommon("urnNumber", { number: padNumber(urn.number) })}</span>
            <span>{model?.name}</span>
          </h1>
          <div className={styles.crumbs}>
            <Link href="/">{tCommon("collections")}</Link> /{" "}
            {model && (
              <>
                <Link href={{ pathname: "/collections/[model]", params: { model: model.slug } }}>
                  {model.name.toLowerCase()}
                </Link>{" "}
                /{" "}
              </>
            )}
            {label}
          </div>
          <p className={styles.description}>{urn.description}</p>
          <dl className={styles.specs}>
            <div>
              <dt>{t("colour")}</dt>
              <dd>{urn.colour}</dd>
            </div>
            {urn.fibres && (
              <div>
                <dt>{t("fibres")}</dt>
                <dd>{urn.fibres}</dd>
              </div>
            )}
            {urn.materials && (
              <div>
                <dt>{t("materials")}</dt>
                <dd>{urn.materials}</dd>
              </div>
            )}
            <div className={styles.price}>
              <dt>{t("basePrice")}</dt>
              <dd>{formatPrice(locale, urn.price)}</dd>
            </div>
          </dl>
          <p className={styles.note}>{t("unique")}</p>
          <div className={styles.actions}>
            <ButtonLink href={{ pathname: "/demande", query: { urn: urn.number } }}>
              {t("request")}
            </ButtonLink>
            <TextLink href="/tarifs">{tCommon("customizationOptions")}</TextLink>
          </div>
        </div>
      </div>

      {previous && next && siblings.length > 1 && (
        <nav className={styles.pager} aria-label={model?.name}>
          <Link href={urnHref(previous.number)} rel="prev" aria-label={t("previous")}>
            ← {tCommon("urnNumber", { number: previous.number })}
          </Link>
          <Link href={urnHref(next.number)} rel="next" aria-label={t("next")}>
            {tCommon("urnNumber", { number: next.number })} →
          </Link>
        </nav>
      )}
    </Page>
  );
};

export default UrnPage;
