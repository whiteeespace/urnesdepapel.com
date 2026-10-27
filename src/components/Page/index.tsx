import classNames from "classnames";
import type { PropsWithChildren, ReactNode } from "react";

import Container from "@/components/Container";

import styles from "./styles.module.scss";

export const Page = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <Container className={classNames(styles.page, className)}>{children}</Container>
);

interface HeaderProps {
  /** Shown under the title, so every page title starts at the same height. */
  breadcrumbs?: ReactNode;
  title?: ReactNode;
  titleClassName?: string;
  className?: string;
}

export const PageHeader = ({
  breadcrumbs,
  title,
  titleClassName,
  className,
  children,
}: PropsWithChildren<HeaderProps>) => (
  <header className={classNames(styles.header, className)}>
    {title && <h1 className={classNames(styles.title, titleClassName)}>{title}</h1>}
    {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
    {children}
  </header>
);
