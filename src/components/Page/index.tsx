import classNames from "classnames";
import type { CSSProperties, PropsWithChildren, ReactNode } from "react";

import Container from "@/components/Container";

import styles from "./styles.module.scss";

interface PageProps {
  className?: string;
  /** At least as tall as the screen under the header, so the footer only shows on scrolling. */
  fill?: boolean;
}

export const Page = ({ children, className, fill }: PropsWithChildren<PageProps>) => (
  <Container className={classNames(styles.page, fill && styles.fill, className)}>{children}</Container>
);

interface HeaderProps {
  title?: ReactNode;
  titleClassName?: string;
  className?: string;
}

export const PageHeader = ({
  title,
  titleClassName,
  className,
  children,
}: PropsWithChildren<HeaderProps>) => (
  <header className={classNames(styles.header, className)}>
    {title && (
      <h1
        className={classNames(styles.title, titleClassName)}
        // The title's length, so on phones it can be sized to fit on one line.
        style={typeof title === "string" ? ({ "--title-chars": title.length } as CSSProperties) : undefined}
      >
        {title}
      </h1>
    )}
    {children}
  </header>
);
