import type { PropsWithChildren } from "react";

import styles from "./template.module.scss";

// Remounts on every navigation, so each page fades up into place as it opens.
const Template = ({ children }: PropsWithChildren) => <div className={styles.enter}>{children}</div>;

export default Template;
