"""Writes review sheets of the constructed alphabet to public/_specimen (git-ignored)."""

from __future__ import annotations

import sys
from pathlib import Path as FilePath

sys.path.insert(0, str(FilePath(__file__).parent))

from glyphs import SIDE_BEARING, build  # noqa: E402
from geometry import ROOT, simplify, translate  # noqa: E402
from specimen import write_specimen, write_text_sample  # noqa: E402

OUT = ROOT / "public/_specimen"


def spaced(glyphs):
    out = {}
    for name, path in glyphs.items():
        path = simplify(path)
        x0, _, x1, _ = path.bounds
        out[name] = (translate(path, SIDE_BEARING - x0, 0), round(x1 - x0 + 2 * SIDE_BEARING))
    out["space"] = (None, 200)
    return out


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    glyphs = spaced(build())
    order = sorted(k for k in glyphs if k != "space")
    write_specimen({k: glyphs[k] for k in order}, OUT / "alphabet.svg", per_row=7)
    # Close-up of chosen letters: python review.py G K M
    focus = [name for name in sys.argv[1:] if name in glyphs]
    if focus:
        write_specimen({k: glyphs[k] for k in focus}, OUT / "focus.svg", per_row=len(focus))
    write_text_sample(
        glyphs,
        [
            "URNES DE PAPEL",
            "TARIFS L'ARTISANE",
            "PAPILLON ANEMONE TULIPE",
            "FAIRE UNE DEMANDE",
            "NOTRE MISSION NOS URNES",
            "THE QUICK BROWN FOX",
            "JUMPS OVER A LAZY DOG",
            "HYGIENE WAX KAYAK",
        ],
        OUT / "words.svg",
    )
    print("wrote", OUT)
