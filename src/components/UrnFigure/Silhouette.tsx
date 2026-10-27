import type { Shape } from "@/payload/collections/Models";

import styles from "./styles.module.scss";

// Outlines traced from the hand-drawn site canvas.
const PATHS: Record<Shape, React.ReactNode> = {
  anemone: (
    <>
      <path
        className={styles.body}
        d="M50 38 C50 46 22 54 20 82 C18 112 36 138 44 146 L76 146 C84 138 102 112 100 82 C98 54 70 46 70 38 Z"
      />
      <path className={styles.body} d="M50 22 L50 38 L70 38 L70 22" />
      <ellipse className={styles.line} cx="60" cy="22" rx="13" ry="3.5" />
    </>
  ),
  papillon: (
    <>
      <path className={styles.body} d="M32 28 L88 28 C82 66 82 102 92 146 L28 146 C38 102 38 66 32 28 Z" />
      <path className={styles.line} d="M32 28 L44 20 L98 20 L88 28 M98 20 C93 60 93 100 100 138 L92 146" />
      <path className={styles.line} d="M60 36 C59 80 61 110 60 140" opacity=".35" />
    </>
  ),
  tulipe: (
    <>
      <path
        className={styles.body}
        d="M30 18 C42 60 52 92 47 120 C45 134 40 140 40 146 L80 146 C80 140 75 134 73 120 C68 92 78 60 90 18 Z"
      />
      <ellipse className={styles.line} cx="60" cy="18" rx="30" ry="4.5" />
    </>
  ),
};

const Silhouette = ({ shape, className }: { shape: Shape; className?: string }) => (
  <svg viewBox="0 0 120 160" className={className} aria-hidden="true">
    {PATHS[shape]}
  </svg>
);

export default Silhouette;
