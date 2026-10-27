import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TextLink } from "@/components/Button";
import { Page, PageHeader } from "@/components/Page";
import Paragraphs from "@/components/Paragraphs";
import UrnFigure from "@/components/UrnFigure";
import type { Locale } from "@/i18n/routing";
import { asMedia } from "@/lib/content";
import { getPage } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

import styles from "./styles.module.scss";

type Props = PageProps<"/[locale]/urnes-de-papel">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [t, about] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getPage("about-page", locale),
  ]);
  return pageMetadata({ locale, href: "/urnes-de-papel", title: t("about"), description: about.statement });
}

const AboutPage = async ({ params }: Props) => {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [t, about] = await Promise.all([getTranslations("common"), getPage("about-page", locale)]);

  return (
    <Page>
      <PageHeader title="Urnes de Papel">
        {about.statement && <p className={styles.statement}>{about.statement}</p>}
      </PageHeader>
      <UrnFigure
        media={asMedia(about.image)}
        label={`${t("photo")} · atelier`}
        ratio="banner"
        sizes="100vw"
        priority
      />
      {about.sections && about.sections.length > 0 && (
        <div className={styles.sections}>
          {about.sections.map((section) => (
            <section key={section.id} className={styles.section}>
              <h2 className={styles.heading}>{section.heading}</h2>
              <Paragraphs text={section.body} />
              {section.linkToPricing && <TextLink href="/tarifs">{t("customizationOptions")} →</TextLink>}
            </section>
          ))}
        </div>
      )}
    </Page>
  );
};

export default AboutPage;
