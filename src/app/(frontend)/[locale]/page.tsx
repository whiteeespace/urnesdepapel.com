import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import Logo from "@/components/Logo";
import { Page, PageHeader } from "@/components/Page";
import UrnFigure from "@/components/UrnFigure";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { asMedia, asModel } from "@/lib/content";
import { getModels, getPage, getUrns } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

import styles from "./home.module.scss";

type Props = PageProps<"/[locale]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return pageMetadata({ locale, href: "/" });
}

const HomePage = async ({ params }: Props) => {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [t, home, models, urns] = await Promise.all([
    getTranslations("common"),
    getPage("home-page", locale),
    getModels(locale),
    getUrns(locale),
  ]);

  const countFor = (modelId: number) => urns.filter((urn) => asModel(urn.model)?.id === modelId).length;

  return (
    <Page>
      {/* Title and collections sit close together; the page's larger gap comes after. */}
      <div className={styles.top}>
        <PageHeader
          title={
            <>
              <span className="visually-hidden">Urnes de Papel</span>
              <Logo variant="name" decorative className={styles.wordmarkArt} />
              <Logo variant="stacked-name" decorative className={styles.wordmarkStacked} />
            </>
          }
          titleClassName={styles.wordmark}
        >
          {home.intro && <p className={styles.intro}>{home.intro}</p>}
        </PageHeader>

        <section aria-labelledby="collections-label">
          <h2 id="collections-label" className="visually-hidden">
            {t("collections")}
          </h2>
          <ul className={styles.models}>
            {models.map((model, index) => (
              <li key={model.id}>
                <Link
                  href={{ pathname: "/collections/[model]", params: { model: model.slug } }}
                  className={styles.model}
                >
                  <UrnFigure
                    media={asMedia(model.cover)}
                    shape={model.shape}
                    sizes="(max-width: 600px) 100vw, 33vw"
                    priority={index === 0}
                    className={styles.figure}
                  />
                  <span className={styles.name}>{model.name}</span>
                  <span className={styles.count}>{t("urnCount", { count: countFor(model.id) })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
};

export default HomePage;
