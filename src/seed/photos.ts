/**
 * The client's photo selection (content/photos) and where each photo is used. Files are named
 * after the urn they show; the first photo of an urn is its thumbnail.
 */
type Localized = { fr: string; en: string };

const urnAlt = (model: string, number: number, view?: Localized): Localized => ({
  fr: `Urne ${model} n° ${number}${view ? `, ${view.fr}` : ", vue de face"}`,
  en: `${model} urn no. ${number}${view ? `, ${view.en}` : ", front view"}`,
});

const detail = { fr: "détail de la texture", en: "texture detail" };

export const photos: Record<string, Localized> = {
  "anemone-20.jpg": urnAlt("Anémone", 20),
  "anemone-20-2.jpg": urnAlt("Anémone", 20, { fr: "vue de trois quarts", en: "three-quarter view" }),
  "anemone-24.jpg": urnAlt("Anémone", 24),
  "anemone-24-detail.jpg": urnAlt("Anémone", 24, {
    fr: "détail de la bande de texte",
    en: "detail of the text strip",
  }),
  "anemone-26.jpg": urnAlt("Anémone", 26),
  "anemone-29.jpg": urnAlt("Anémone", 29),
  "anemone-29-detail.jpg": urnAlt("Anémone", 29, detail),
  "anemone-36.jpg": urnAlt("Anémone", 36),
  "anemone-36-detail.jpg": urnAlt("Anémone", 36, detail),
  "anemone-37.jpg": urnAlt("Anémone", 37),
  "anemone-37-detail.jpg": urnAlt("Anémone", 37, {
    fr: "détail des tiges de vigne",
    en: "detail of the vine stems",
  }),
  "anemone-42.jpg": urnAlt("Anémone", 42),
  "anemone-42-side.jpg": urnAlt("Anémone", 42, { fr: "couchée sur le côté", en: "lying on its side" }),
  "papillon-23.jpg": urnAlt("Papillon", 23),
  "papillon-23-detail.jpg": urnAlt("Papillon", 23, detail),
  "papillon-30.jpg": urnAlt("Papillon", 30),
  "papillon-30-detail.jpg": urnAlt("Papillon", 30, detail),
  "papillon-38.jpg": urnAlt("Papillon", 38),
  "papillon-38-detail.jpg": urnAlt("Papillon", 38, {
    fr: "détail des feuilles en relief",
    en: "detail of the raised leaves",
  }),
  "tulipe-35.jpg": urnAlt("Tulipe", 35),
  "tulipe-35-detail.jpg": urnAlt("Tulipe", 35, detail),
  "tulipe-43.jpg": urnAlt("Tulipe", 43),
  "tulipe-43-detail.jpg": urnAlt("Tulipe", 43, detail),
  "tulipe-44.jpg": urnAlt("Tulipe", 44),
  "tulipe-44-detail.jpg": urnAlt("Tulipe", 44, {
    fr: "détail des feuilles en relief",
    en: "detail of the raised leaves",
  }),
  "option-pouch.jpg": {
    fr: "Urne enveloppée dans sa pochette de lin",
    en: "Urn wrapped in its linen pouch",
  },
  "option-pouch-label.jpg": {
    fr: "Pochette de lin avec l’étiquette Urnes de Papel",
    en: "Linen pouch with the Urnes de Papel label",
  },
  "option-pouch-embroidered.jpg": {
    fr: "Pochette de lin brodée d’un prénom, fermée par des boutons de nacre",
    en: "Linen pouch embroidered with a first name, closed with mother-of-pearl buttons",
  },
  "option-pouch-fitted.jpg": {
    fr: "Pochette de lin taillée selon la forme de l’urne",
    en: "Linen pouch cut to the shape of the urn",
  },
  "option-pouch-made-to-measure.jpg": {
    fr: "Pochette de lin sur mesure, fermée par des boutons",
    en: "Made-to-measure linen pouch, closed with buttons",
  },
  "option-additions-photo.jpg": {
    fr: "Urne personnalisée avec une photo du défunt",
    en: "Urn personalized with a photo of the deceased",
  },
  "option-additions-text.jpg": {
    fr: "Urne personnalisée avec l’ajout d’un texte",
    en: "Urn personalized with an added text",
  },
};

/** Photos per urn number, thumbnail first. Urns 21 and 22 have no photo yet. */
export const urnPhotos: Record<number, string[]> = {
  20: ["anemone-20.jpg", "anemone-20-2.jpg"],
  23: ["papillon-23.jpg", "papillon-23-detail.jpg"],
  24: ["anemone-24.jpg", "anemone-24-detail.jpg"],
  26: ["anemone-26.jpg"],
  29: ["anemone-29.jpg", "anemone-29-detail.jpg"],
  30: ["papillon-30.jpg", "papillon-30-detail.jpg"],
  35: ["tulipe-35.jpg", "tulipe-35-detail.jpg"],
  36: ["anemone-36.jpg", "anemone-36-detail.jpg"],
  37: ["anemone-37.jpg", "anemone-37-detail.jpg"],
  38: ["papillon-38.jpg", "papillon-38-detail.jpg"],
  42: ["anemone-42.jpg", "anemone-42-side.jpg"],
  43: ["tulipe-43.jpg", "tulipe-43-detail.jpg"],
  44: ["tulipe-44.jpg", "tulipe-44-detail.jpg"],
};

/** Cover photo per collection slug, shown on the home page. */
export const modelCovers: Record<string, string> = {
  papillon: "papillon-38.jpg",
  anemone: "anemone-37.jpg",
  tulipe: "tulipe-44.jpg",
};

/** Photo per add-on option slug (content/urns.json). Urn 42's paper is made from the deceased's jeans. */
export const optionPhotos: Record<string, string> = {
  pulp: "anemone-42.jpg",
  additions: "option-additions-photo.jpg",
  pouch: "option-pouch.jpg",
  "pouch-custom": "option-pouch-embroidered.jpg",
};

export const basePhoto = "anemone-29.jpg";
