import classNames from "classnames";

import {
  LOGO_MARK_PATHS,
  LOGO_MARK_VIEWBOX,
  LOGO_NAME_PATHS,
  LOGO_NAME_VIEWBOX,
  LOGO_TAGLINE_PATHS,
  LOGO_VIEWBOX,
} from "./paths";
import styles from "./styles.module.scss";

type Variant = "full" | "mark" | "name" | "stacked-name";

interface Props {
  /**
   * "full": the whole lockup; "mark": the U and its fibres; "name": the URNES DE PAPEL lettering;
   * "stacked-name": the same lettering on two lines, URNES over DE PAPEL.
   */
  variant?: Variant;
  /** Hides the drawing from assistive tech when the surrounding element already names it. */
  decorative?: boolean;
  className?: string;
}

// The stacked name moves the lettering's own words rather than redrawing them. URNES spans x 0–93.12
// and DE PAPEL x 106.93–242.02 of the artwork; both sit on y 193.41–211.37. The second line follows
// at the page titles' line height (1.1 em on 0.7 em capitals: 17.96 × 1.1 / 0.7 = 28.22).
const STACKED_LINES = [
  { paths: [LOGO_NAME_PATHS[11], ...LOGO_NAME_PATHS.slice(0, 4)], transform: "translate(0 -193.41)" },
  { paths: LOGO_NAME_PATHS.slice(4, 11), transform: "translate(-106.93 -165.19)" },
];

const VIEWBOX: Record<Variant, string> = {
  full: LOGO_VIEWBOX,
  mark: LOGO_MARK_VIEWBOX,
  name: LOGO_NAME_VIEWBOX,
  "stacked-name": "0 0 135.09 46.18",
};

const PATHS: Record<Exclude<Variant, "stacked-name">, string[]> = {
  full: [...LOGO_MARK_PATHS, ...LOGO_NAME_PATHS, ...LOGO_TAGLINE_PATHS],
  mark: LOGO_MARK_PATHS,
  name: LOGO_NAME_PATHS,
};

// The brand's vertical lockup. It inherits `color`, so hover and gold variants are plain CSS.
const Logo = ({ variant = "full", decorative = false, className }: Props) => (
  <svg
    viewBox={VIEWBOX[variant]}
    className={classNames(styles.logo, styles[variant], className)}
    {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Urnes de Papel" })}
  >
    {variant === "stacked-name"
      ? STACKED_LINES.map((line, index) => (
          <g key={index} transform={line.transform}>
            {line.paths.map((d, pathIndex) => (
              <path key={pathIndex} d={d} />
            ))}
          </g>
        ))
      : PATHS[variant].map((d, index) => <path key={index} d={d} />)}
  </svg>
);

export default Logo;
