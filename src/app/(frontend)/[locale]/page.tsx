import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

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
      {/* The page opens on the intro: the name is in the header's logo, so the title is for screen
          readers. */}
      <div className={styles.top}>
        <PageHeader>
          <h1 className="visually-hidden">Urnes de Papel</h1>
          {home.intro && <p className={styles.intro}>{home.intro}</p>}
        </PageHeader>

        {/* On wide screens the cards start scattered; the row is pinned under the header while they
            slide into line as the page scrolls. */}
        <section aria-labelledby="collections-label" className={styles.collections}>
          <h2 id="collections-label" className="visually-hidden">
            {t("collections")}
          </h2>
          <div className={styles.stage}>
            <ul className={styles.models}>
              {models.map((model, index) => {
                const count = countFor(model.id);
                return (
                  <li key={model.id} className={styles.slot}>
                    <Link
                      href={{ pathname: "/collections/[model]", params: { model: model.slug } }}
                      className={styles.model}
                    >
                      <UrnFigure
                        media={asMedia(model.cover)}
                        shape={model.shape}
                        sizes="(max-width: 860px) 80vw, 33vw"
                        priority={index === 0}
                        className={styles.figure}
                      />
                      <span className={styles.heading}>
                        <span className={styles.name}>{model.name}</span>
                        <span className={styles.count} aria-hidden="true">
                          {count}
                        </span>
                        <span className="visually-hidden">{t("urnCount", { count })}</span>
                      </span>
                      <span className={model.intro ? styles.description : styles.todo}>
                        {model.intro || t("toBeWritten")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </Page>
  );
};

export default HomePage;
