"""Builds "Urnes Titling", the site's title typeface, from the logo's lettering.

    python scripts/title-font/build.py

Requires fonttools, skia-pathops and brotli (see requirements.txt). Writes the WOFF2 used by
the site to src/app/(frontend)/[locale]/_fonts/urnes-titling.woff2.
"""

from __future__ import annotations

import sys
from pathlib import Path as FilePath

sys.path.insert(0, str(FilePath(__file__).parent))

from fontTools.fontBuilder import FontBuilder  # noqa: E402
from fontTools.pens.t2CharStringPen import T2CharStringPen  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402

from geometry import CAP_HEIGHT, LOGO_ORDER, ROOT, logo_lefts, rect, simplify, translate  # noqa: E402
from glyphs import SIDE_BEARING, build, cmap_for  # noqa: E402

FAMILY = "Urnes Titling"
PS_NAME = "UrnesTitling-Regular"
UPM = 1000
ASCENT, DESCENT = 1000, -250
OUT = ROOT / "src/app/(frontend)/[locale]/_fonts/urnes-titling.woff2"
# The site sets titles at letter-spacing 0.11 em (see the titling mixin); the logo's spacing is
# measured with it included.
TRACKING = 110
# Logo letters that start a word: URNES | DE | PAPEL.
WORD_STARTS = {"D", "P1"}


def logo_spacing(glyphs: dict[str, tuple]) -> tuple[dict[tuple[str, str], int], int]:
    """Kerns and a word space that set URNES DE PAPEL exactly like the logo.

    The even side bearings can't reproduce the logo's hand spacing (A tucked under P, R close to
    N, a wider gap after U), so each neighbouring pair gets the kern that puts its second letter
    where the logo has it. Other pairs keep the even spacing.
    """
    lefts = logo_lefts()
    kerns: dict[tuple[str, str], int] = {}
    spaces = []
    for a, b in zip(LOGO_ORDER, LOGO_ORDER[1:]):
        # E1, P2 and so on are all set with the one E and P glyph.
        glyph = a.rstrip("123")
        distance = lefts[b] - lefts[a]
        advance = glyphs[glyph][1]
        if b in WORD_STARTS:
            spaces.append(distance - advance - 2 * TRACKING)
        else:
            kerns[(glyph, b.rstrip("123"))] = round(distance - advance - TRACKING)
    return kerns, round(sum(spaces) / len(spaces))


def main() -> None:
    raw = build()
    glyphs: dict[str, tuple] = {}
    for name, path in raw.items():
        path = simplify(path)
        x0, _, x1, _ = path.bounds
        path = translate(path, SIDE_BEARING - x0, 0)
        glyphs[name] = (path, round(x1 - x0 + 2 * SIDE_BEARING))

    kerns, space_width = logo_spacing(glyphs)
    notdef = (rect(50, 0, 450, CAP_HEIGHT), 500)
    order = [".notdef", "space", *sorted(glyphs)]

    charstrings, metrics = {}, {}
    for name in order:
        if name == "space":
            pen = T2CharStringPen(space_width, None)
            charstrings[name] = pen.getCharString()
            metrics[name] = (space_width, 0)
            continue
        path, advance = notdef if name == ".notdef" else glyphs[name]
        pen = T2CharStringPen(advance, None)
        path.draw(pen)
        charstrings[name] = pen.getCharString()
        metrics[name] = (advance, round(path.bounds[0]))

    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap_for(order))
    fb.setupCFF(PS_NAME, {"FullName": f"{FAMILY} Regular", "FamilyName": FAMILY, "Weight": "Regular"}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT)
    fb.setupNameTable(
        {
            "familyName": FAMILY,
            "styleName": "Regular",
            "uniqueFontIdentifier": f"{PS_NAME};1.000",
            "fullName": f"{FAMILY} Regular",
            "psName": PS_NAME,
            "version": "Version 1.000",
            "copyright": "Capitals constructed from the Urnes de Papel logo lettering (Pinabel, 2014).",
        }
    )
    fb.setupOS2(
        sTypoAscender=ASCENT,
        sTypoDescender=DESCENT,
        sTypoLineGap=0,
        usWinAscent=ASCENT,
        usWinDescent=-DESCENT,
        sCapHeight=CAP_HEIGHT,
        sxHeight=CAP_HEIGHT,
        usWeightClass=400,
    )
    fb.setupPost()
    pairs = "\n".join(f"    pos {a} {b} {value};" for (a, b), value in kerns.items())
    fb.addOpenTypeFeatures(f"languagesystem DFLT dflt;\nlanguagesystem latn dflt;\nfeature kern {{\n{pairs}\n}} kern;\n")

    otf = OUT.with_suffix(".otf")
    fb.save(str(otf))
    font = TTFont(str(otf))
    font.flavor = "woff2"
    font.save(str(OUT))
    otf.unlink()
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes, {len(order)} glyphs)")
    print(f"space {space_width}; kerns " + ", ".join(f"{a}{b} {value:+d}" for (a, b), value in kerns.items()))


if __name__ == "__main__":
    main()
