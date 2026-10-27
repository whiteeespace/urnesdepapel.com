import classNames from "classnames";
import Image from "next/image";
import type { CSSProperties } from "react";

import type { Shape } from "@/payload/collections/Models";
import type { Media } from "@/payload-types";

import Silhouette from "./Silhouette";
import styles from "./styles.module.scss";

interface Props {
  media?: Media;
  /** Drawn while there is no photo; omit for a plain paper placeholder. */
  shape?: Shape;
  tint?: string | null;
  /** Small caption on the placeholder, e.g. "photo · n° 23". */
  label?: string;
  ratio?: "portrait" | "square" | "wide" | "banner";
  sizes: string;
  priority?: boolean;
  className?: string;
}

// Shows the uploaded photo, or a paper-textured placeholder with the urn's silhouette.
const UrnFigure = ({ media, shape, tint, label, ratio = "portrait", sizes, priority, className }: Props) => {
  const style = tint ? ({ "--tint": tint } as CSSProperties) : undefined;

  return (
    <div className={classNames(styles.figure, styles[ratio], className)} style={style}>
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          style={
            media.focalX != null && media.focalY != null
              ? { objectPosition: `${media.focalX}% ${media.focalY}%` }
              : undefined
          }
        />
      ) : (
        <>
          {shape && <Silhouette shape={shape} className={styles.silhouette} />}
          {label && (
            <span className={styles.label} aria-hidden="true">
              {label}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default UrnFigure;
