import { getLocale, getTranslations } from "next-intl/server";

import Container from "@/components/Container";
import { getSettings } from "@/lib/payload";

import styles from "./styles.module.scss";

const Footer = async () => {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const settings = await getSettings(locale);

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
        <span className={styles.contact}>
          {settings.phone && (
            <span className={styles.phone}>{settings.phone.trim().replace(/\s+/g, "-")}</span>
          )}
          {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          {settings.etsyUrl && (
            <a href={settings.etsyUrl} target="_blank" rel="noopener">
              {t("common.etsy")} ↗
            </a>
          )}
        </span>
      </Container>
    </footer>
  );
};

export default Footer;
