# Urnes de Papel — project brief

Knowledge base for the urnesdepapel.com redesign. Source files are in `docs/source/`, brand assets in `brand/`, and structured content in `content/`.

## The business

- **Name:** URNES DE PAPEL
- **Tagline:** *De la vie à la vie* (EN: "From life to life". There is no official EN version, so we keep the FR tagline in both languages.)
- **Descriptor:** Urnes funéraires biodégradables fabriquées à la main / Handmade biodegradable funeral urns
- **Founder / artisan:** Suzanne Desbiens, a visual artist and member of the IAPMA (International Association of Paper Maker Artists). Founded in 2013.
- **Location:** Québec (514 area code = Montréal). Prices are in $, presumably CAD.
- **Contact:** 514 978 0118
- **Previous sales channel:** an Etsy shop. The site does not link to it.
- **Footer:** © 2026 Tous droits réservés Urnes de papel
- **Values (mission):** empathy, respect, creativity, know-how. Eco-responsible, made with natural and non-toxic materials. The urns degrade in soil or water without leaving toxic waste.

## Site map (from the hand-drawn canvas, 2026-09-26)

Main navigation (canvas page 1): **URNES DE PAPEL · TARIFS · L'ARTISANE**. The logo sits top-left, separated from the nav by a horizontal rule.

| # | Page | Content |
|---|------|---------|
| 1 | Home / Collections | Three large photo cards, one per shape: **Papillon**, **Anémone**, **Tulipe** |
| 2 | Papillon | Grid of urns #23, #30, #38, each with a photo, number and description |
| 3 | Anémone | 2×3 grid: #20, #24, #26, #29, #37, #42 |
| 4 | Tulipe | Row of four: #22, #35, #43, #44 |
| 5 | Urnes de Papel (about) | Founding statement (narrow column), *Notre mission*, *Nos urnes*, *Des urnes personnalisées* |
| 6 | Tarifs | Basic urn (large photo, $350) + 2×2 grid of options with photos and prices. Note on canvas: "photos sélectionnées" |
| 7 | L'artisane | Suzanne Desbiens bio in two columns, followed by a contact block: vertical logo, tagline, descriptor, phone. © line at the bottom |

The canvas lays text out in narrow, justified-looking columns separated by thin rules. It is a quiet, editorial, print-like layout.

**New, requested by us:** a simple interactive **request form** so visitors can ask for an urn, a customization or information. There is no checkout; the business works by request, and production lead times apply.

## Collections and urns

There are three shapes (models), and every urn is a unique numbered piece. The full bilingual data is in `content/urns.json`.

| Model | Urns in canvas | Extra urns in product sheet only |
|-------|----------------|----------------------------------|
| Papillon | 23, 30, 38 | — |
| Anémone | 20, 24, 26, 29, 37, 42 | **21, 36** |
| Tulipe | 22, 35, 43, 44 | — |

Each urn has these fields: number, model, fibres, colour, materials, description and base price ($350), all in FR and EN.

## Pricing (Tarifs)

> Note: des délais de fabrication s'appliquent / Manufacturing lead times apply.

| Item (FR / EN) | Price |
|---|---|
| Urne de base / Basic urn | 350 $ |
| Personnalisation pulpe de base / Basic pulp customization (urn molded from the deceased's clothing) | 100 $ |
| Personnalisation par ajouts / Customization by adding elements (photo, button, book page, letter, small object) | 50 $ |
| Pochette de lin et soie / Linen and silk pouch (remains as a keepsake) | 100 $ |
| Personnalisation de la pochette / Pouch customization (embroidered name, motif or quote) | 50–75 $ |

## Brand (Pinabel, 2014)

- **Logo type:** Fedra Serif Book, capitals
- **Signature and secondary info:** Helvetica Neue Thin 35, tracked (*interlettré*) capitals
- **Colours:**
  - Gold: Pantone 617U / CMYK C28 M24 Y65 K5. The screen value is about `#BFB277`; sample `brand/logos/logo_Urnes_RGB.jpg` to confirm.
  - Grey: Noir 80 % (about `#575756`)
  - Black: Noir 100 % (vertical logo variant)
- **Logo variants** (`brand/logos/`):
  - horizontal and vertical layouts
  - gold (RGB), Noir 80 % and Noir 100 %
  - each with or without the *infos* descriptor line
- **Motif:** a tall serif "U" crossed by two thin, wavering hand-drawn lines, like paper fibres or threads. This is a good source for a graphic accent (dividers, loaders, hover states).
- `brand/brand-guide-2014.pdf` is the official sheet. The 2014 Pinabel *maquettes* (green concepts) were rejected explorations; ignore them.
- **Vector logos** are extracted from Pinabel's `Logo_Urnes de papel_presentation.pdf` (pages 1–2) as SVGs in `brand/logos/`, named after the matching JPGs: `logo_Urnes_RGB`, `logo_Urnes_RGB_infos`, `logo_Urnes_noir80_infos` and their `logo_vertical_…` counterparts. The PDF's exact colours are gold `#BBB276` and Noir 80 % `#4F4C4D`. There is no vector source for the Noir 80 % logos without *infos* or for any Noir 100 % logo; recolour another SVG if one is needed. The raster JPGs (4187×3000) remain for reference.

## Style inspiration: papierzeichen.de/books

- Pure white background, lots of air, a narrow centered content column (~900px)
- Header: the name in a lowercase **monospace** typeface (Cutive Mono) on the left and lowercase mono nav (`work books about me`) on the right. The active item is darker and underlined, the others are grey `#878787`. A thin rule sits under the header.
- Section headings are small lowercase mono in grey (`my books`)
- Body text in Source Sans Pro 18px, black
- Rows alternate a large image on the left with a text block on the right: a small italic grey date line, a title in tracked capitals inside » « guillemets, then the details. Small buttons have a thin grey outline (`zur Leseprobe`).
- Footer: tiny centered links (`kontakt | impressum | datenschutz`)
- Feel: artisanal, archival, typewriter-label, unhurried

**Translating it to Urnes de Papel:** keep the white space, single column, thin rules and image-plus-caption rows. We could substitute the brand fonts for the mono: a Fedra-Serif-like serif for headings and a thin tracked sans, close to Helvetica Neue Thin, for labels and nav. A mono accent could still be used for urn numbers (`n° 23`). Gold is used sparingly, for the logo and accents only.

## Technical direction

- **Part 1 (design):** layouts for every page above as a skeleton with placeholder imagery and copy, plus an interactive request form. Desktop and mobile.
- **Part 2 (build):** a bilingual FR/EN site in Next.js, hosted on Vercel, with an admin/backend where the client can edit urns (products), prices and page copy. The CMS choice is still open.

## Open questions and inconsistencies to confirm with the client

1. **Anémone #21 and #36** are in the product sheet but not on the canvas. Should they be shown?
2. **#22 and #43** (Tulipe) share an identical description, and so do **#38 and #44**. Is that intentional?
3. **#23** colour cell reads "Blanc neutre / Neutral White" plus stray "Sand", "French Green". Which is correct?
4. **#29** colour is identical to #30 (warm white, pale green, gold). Is that a copy-paste error?
5. **#35** description ends with "?": "Effet de légèreté d'un envol ?". Is the question mark intended?
6. Typos to fix in the EN text: "moldage" → "molding", "dead-lines times" → "lead times", "Embroder" → "Embroider", "handmade manufacture". In FR, "embosses" should be "embossés" (#44).
7. **Currency:** is it CAD? Are taxes included? Is shipping or delivery offered?
8. **Request form:** who receives it (which email)? Which fields are needed: urn number, options, deadline, delivery method? Does it need to work in both languages?
9. **Etsy:** decided. The site no longer links to Etsy; requests go through the site's form.
10. **Photography:** are there existing photos per urn and for each option (pulp, pouch, etc.)?
11. **Domain/email:** urnesdepapel.com. What contact email should be shown?
12. **Fonts:** is a Fedra Serif web licence available? If not, which substitute should we use?
13. The EN about text is a single document. Its FR counterparts are split into PAGE 1 (artisane) and PAGE 2 (about). The two versions map 1:1 apart from small differences in the first EN paragraph.
