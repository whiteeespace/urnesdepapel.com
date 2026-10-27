import { getTranslations } from "next-intl/server";

import Logo from "@/components/Logo";
import { Link } from "@/i18n/navigation";

import NavLinks from "./NavLinks";
import styles from "./styles.module.scss";

// Layout from the client's canvas: the logo at the top left, the navigation on the right.
const Header = async () => {
  const t = await getTranslations("nav");

  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skip}>
        {t("skip")}
      </a>
      <div className={styles.inner}>
        <Link href="/" className={styles.home} aria-label={t("home")}>
          <Logo variant="mark" className={styles.logo} />
        </Link>
        <nav aria-label={t("label")} className={styles.nav}>
          <NavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;
