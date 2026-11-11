import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Page, PageHeader } from "@/components/Page";
import Paragraphs from "@/components/Paragraphs";
import UrnFigure from "@/components/UrnFigure";
import type { Locale } from "@/i18n/routing";
import { asMedia, toParagraphs } from "@/lib/content";
import { getPage } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

import styles from "./styles.module.scss";

type Props = PageProps<"/[locale]/artisane">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getPage("artisan-page", locale),
  ]);
  return pageMetadata({
    locale,
    href: "/artisane",
    title: t("artisan"),
    description: toParagraphs(page.bio)[0],
  });
}

const ArtisanPage = async ({ params }: Props) => {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [t, page] = await Promise.all([getTranslations(), getPage("artisan-page", locale)]);
  const gallery = (page.gallery ?? []).map(asMedia).filter((media) => media !== undefined);

  return (
    <Page>
      <PageHeader title={t("meta.artisan")} />
      <div className={styles.artisan}>
        <UrnFigure
          media={asMedia(page.portrait)}
          label={`${t("common.photo")} · portrait`}
          sizes="(max-width: 860px) 360px, 30vw"
          priority
          className={styles.portrait}
        />
        <section className={styles.bio} data-reveal>
          {page.name && <h2 className={styles.name}>{page.name}</h2>}
          <div className={styles.columns}>
            <Paragraphs text={page.bio} />
          </div>
        </section>
      </div>
      {gallery.length > 0 && (
        <section aria-labelledby="studio-heading" className={styles.studio} data-reveal>
          <h2 id="studio-heading" className={styles.studioHeading}>
            {t("artisan.studio")}
          </h2>
          <ul className={styles.gallery}>
            {gallery.map((media) => (
              <li key={media.id}>
                <UrnFigure media={media} sizes="(max-width: 860px) 100vw, 33vw" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  );
};

export default ArtisanPage;
