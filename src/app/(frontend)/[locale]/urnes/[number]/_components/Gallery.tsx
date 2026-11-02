import Image from "next/image";

import UrnFigure from "@/components/UrnFigure";
import type { Shape } from "@/payload/collections/Models";
import type { Media } from "@/payload-types";

import styles from "./Gallery.module.scss";

interface Props {
  images: Media[];
  shape?: Shape;
  tint?: string | null;
}

// The urn's photos, every one shown whole at its own proportions: one under the other on wide
// screens, a row to swipe through on phones. Without photos, the urn's drawing stands in.
const Gallery = ({ images, shape, tint }: Props) => {
  if (images.length === 0) {
    return (
      <div className={styles.gallery}>
        <UrnFigure shape={shape} tint={tint} ratio="portrait" sizes="(max-width: 860px) 100vw, 50vw" />
      </div>
    );
  }

  return (
    <ul className={styles.gallery}>
      {images.map((media, index) =>
        media.url ? (
          <li key={media.id} className={styles.slide}>
            <Image
              src={media.url}
              alt={media.alt}
              width={media.width ?? 600}
              height={media.height ?? 800}
              sizes="(max-width: 860px) 85vw, 50vw"
              priority={index === 0}
              className={styles.image}
            />
          </li>
        ) : null
      )}
    </ul>
  );
};

export default Gallery;
