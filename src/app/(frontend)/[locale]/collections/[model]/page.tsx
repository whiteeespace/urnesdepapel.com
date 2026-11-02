import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Page, PageHeader } from "@/components/Page";
import UrnCard from "@/components/UrnCard";
import { routing, type Locale } from "@/i18n/routing";
import { asModel } from "@/lib/content";
import { getModels, getUrns } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

import styles from "./styles.module.scss";

type Props = PageProps<"/[locale]/collections/[model]">;

export const dynamicParams = true;

export async function generateStaticParams() {
  const models = await getModels(routing.defaultLocale);
  return routing.locales.flatMap((locale) => models.map((model) => ({ locale, model: model.slug })));
}

const findModel = async (slug: string, locale: Locale) =>
  (await getModels(locale)).find((model) => model.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, model: slug } = (await params) as { locale: Locale; model: string };
  const model = await findModel(slug, locale);
  if (!model) return {};
  return pageMetadata({
    locale,
    href: { pathname: "/collections/[model]", params: { model: slug } },
    title: model.name,
    description: model.intro,
  });
}

const CollectionPage = async ({ params }: Props) => {
  const { locale, model: slug } = (await params) as { locale: Locale; model: string };
  setRequestLocale(locale);

  const model = await findModel(slug, locale);
  if (!model) notFound();

  const [t, urns] = await Promise.all([getTranslations("common"), getUrns(locale)]);
  const modelUrns = urns.filter((urn) => asModel(urn.model)?.id === model.id);

  return (
    <Page>
      <PageHeader title={model.name}>
        {model.intro ? (
          <p className={styles.intro}>{model.intro}</p>
        ) : (
          <p className={styles.todo}>{t("toBeWritten")}</p>
        )}
      </PageHeader>

      <ul className={styles.grid}>
        {modelUrns.map((urn) => (
          <li key={urn.id}>
            <UrnCard urn={urn} sizes="(max-width: 600px) 100vw, (max-width: 860px) 50vw, 33vw" />
          </li>
        ))}
      </ul>
    </Page>
  );
};

export default CollectionPage;
