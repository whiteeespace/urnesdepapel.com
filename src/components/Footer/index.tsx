import { getLocale, getTranslations } from "next-intl/server";

import Logo from "@/components/Logo";
import { getSettings } from "@/lib/payload";

import LocaleSwitcher from "./LocaleSwitcher";
import styles from "./styles.module.scss";

const Footer = async () => {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const settings = await getSettings(locale);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
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
          <LocaleSwitcher />
        </span>
        <span className={styles.rights}>{t("footer.rights", { year: new Date().getFullYear() })}</span>
      </div>
      {/* The name drawn from the logo, across the full width, to close the page. The header's logo
          already names the site, so this one is decorative. */}
      <div className={styles.mark}>
        <Logo variant="name" decorative className={styles.wordmark} />
        <Logo variant="stacked-name" decorative className={styles.wordmarkStacked} />
      </div>
    </footer>
  );
};

export default Footer;
