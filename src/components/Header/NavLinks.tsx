"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import type { Pathname } from "@/i18n/routing";

import styles from "./styles.module.scss";

const LINKS = [
  { href: "/urnes-de-papel", key: "about" },
  { href: "/tarifs", key: "pricing" },
  { href: "/artisane", key: "artisan" },
] as const satisfies readonly { href: Pathname; key: string }[];

// Inline links on wide screens; behind a Menu button on narrow ones.
const NavLinks = () => {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className={styles.menu} onKeyDown={(event) => event.key === "Escape" && close()}>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t("close") : t("menu")}
      </button>
      <div id="site-menu" className={styles.panel} data-open={open}>
        <ul className={styles.links}>
          {LINKS.map(({ href, key }) => (
            <li key={href}>
              <Link
                href={href}
                className={styles.link}
                aria-current={pathname === href ? "page" : undefined}
                onClick={close}
              >
                {t(key)}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/demande"
              className={styles.link}
              aria-current={pathname === "/demande" ? "page" : undefined}
              onClick={close}
            >
              {t("request")}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavLinks;
