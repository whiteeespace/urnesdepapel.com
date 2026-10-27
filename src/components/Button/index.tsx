import classNames from "classnames";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

import styles from "./styles.module.scss";

type Variant = "primary" | "secondary";

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  classNames(styles.button, styles[variant], className);

export const Button = ({
  variant,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) => (
  <button type={type} className={buttonClass(variant, className)} {...props} />
);

export const ButtonLink = ({
  variant,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) => (
  <Link className={buttonClass(variant, className)} {...props} />
);

export const TextLink = ({ className, ...props }: ComponentProps<typeof Link>) => (
  <Link className={classNames(styles.text, className)} {...props} />
);
