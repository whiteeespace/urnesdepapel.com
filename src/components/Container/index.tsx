import classNames from "classnames";
import type { ElementType, PropsWithChildren } from "react";

import styles from "./styles.module.scss";

interface Props {
  as?: ElementType;
  className?: string;
}

const Container = ({ as: Tag = "div", className, children }: PropsWithChildren<Props>) => (
  <Tag className={classNames(styles.container, className)}>{children}</Tag>
);

export default Container;
