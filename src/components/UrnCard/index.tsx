import classNames from "classnames";
import { getTranslations } from "next-intl/server";

import UrnFigure from "@/components/UrnFigure";
import { Link } from "@/i18n/navigation";
import { asMedia, asModel, padNumber, shapeOf } from "@/lib/content";
import type { Urn } from "@/payload-types";

import styles from "./styles.module.scss";

interface Props {
  urn: Urn;
  sizes: string;
}

const UrnCard = async ({ urn, sizes }: Props) => {
  const t = await getTranslations("common");
  const number = t("urnNumber", { number: urn.number });
  const photo = asMedia(urn.images?.[0]);

  return (
    <Link
      href={{ pathname: "/urnes/[number]", params: { number: String(urn.number) } }}
      className={styles.card}
      data-reveal
    >
      <span className={styles.media}>
        <UrnFigure
          media={photo}
          shape={shapeOf(asModel(urn.model))}
          tint={urn.tint}
          label={`${t("photo")} · ${number}`}
          sizes={sizes}
          className={styles.figure}
        />
        {urn.colour && (
          <span className={classNames(styles.colour, photo?.url && styles.onPhoto)}>{urn.colour}</span>
        )}
      </span>
      <span className={styles.caption}>
        <span className={styles.title}>
          <span className={styles.number}>{t("urnNumber", { number: padNumber(urn.number) })}</span>
          <span className={styles.name}>{asModel(urn.model)?.name}</span>
        </span>
        <span className={styles.description}>{urn.description}</span>
      </span>
    </Link>
  );
};

export default UrnCard;
