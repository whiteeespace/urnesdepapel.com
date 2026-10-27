"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

import styles from "./styles.module.scss";

const LocaleSwitcher = () => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    startTransition(() => {
      // Same page in the other language, keeping dynamic segments like the urn number.
      router.replace(
        // @ts-expect-error -- params always match the current pathname
        { pathname, params },
        { locale: next, scroll: false }
      );
    });
  };

  return (
    <div className={styles.locales} role="group" aria-label={t("language")} aria-busy={isPending}>
      {routing.locales.map((target, index) => (
        <span key={target} className={styles.localeItem}>
          {index > 0 && <span aria-hidden="true">/</span>}
          <button
            type="button"
            lang={target}
            className={styles.locale}
            aria-pressed={target === locale}
            onClick={() => switchTo(target)}
          >
            {target}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LocaleSwitcher;
