import Logo from "@/components/Logo";

import styles from "./styles.module.scss";

// Plays once per full page load (it lives in the layout, so moving between pages doesn't replay
// it): the full logo rises in on paper, then the paper lifts away to show the page.
const Intro = () => (
  <div className={styles.intro} aria-hidden="true">
    <Logo variant="full" decorative className={styles.logo} />
  </div>
);

export default Intro;
