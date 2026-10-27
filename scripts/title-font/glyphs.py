"""Builds a full set of capitals from the nine letters of the logo (U R N E S D P A L).

Every new letter is assembled from parts of the logo's own letters: stems, serifs, arms, bowls
and diagonals are cut out, mirrored, rotated or rescaled, so the whole alphabet keeps the
logo's stroke weights, contrast and serif shapes. Coordinates are font units, cap height 700.
"""

from __future__ import annotations

from pathops import Path

from geometry import (
    CAP_HEIGHT,
    clip,
    difference,
    ellipse,
    logo_letters,
    mirror_x,
    mirror_y,
    polygon,
    rect,
    rotate180,
    scale,
    simplify,
    translate,
    union,
)

SIDE_BEARING = 45
INF = 5000

src = {name: simplify(path) for name, path in logo_letters().items()}
U, R, N, E, S, D, P, A, L = (src[k] for k in ["U", "R", "N", "E2", "S", "D", "P2", "A", "L"])

# Measured on the logo (font units).
STEM = 70  # thick stem, e.g. L at 107-177
L_STEM_CENTER = 142
E_STEM_CENTER = 148
ARM = 46  # horizontal arms of E and L
E_MID_ARM = (327, 376)
A_CROSSBAR = (292, 336)


def spans(path: Path, y: float) -> list[tuple[float, float]]:
    """Left-to-right x extents where the shape crosses the horizontal line y."""
    band = clip(path, -INF, y - 0.5, INF, y + 0.5)
    return sorted((c.bounds[0], c.bounds[2]) for c in band.contours)


def left(path: Path) -> float:
    return path.bounds[0]


def place(path: Path, x: float = 0) -> Path:
    """Moves a shape so its left edge sits at x."""
    return translate(path, x - left(path), 0)


def stroke(top: tuple[float, float], bottom: tuple[float, float], width: float) -> Path:
    """A straight stroke between two points with the given horizontal width."""
    (tx, ty), (bx, by) = top, bottom
    w = width / 2
    return polygon([(tx - w, ty), (tx + w, ty), (bx + w, by), (bx - w, by)])


# --- shared parts -------------------------------------------------------------------------

# I: the L's stem and top serif, with its bottom-left serif mirrored to make a symmetric foot.
_l_top = clip(L, -INF, 330, L_STEM_CENTER + 200, INF)
_l_foot_left = clip(L, -INF, -INF, L_STEM_CENTER, 330)
I_SHAPE = simplify(union(_l_top, _l_foot_left, mirror_x(_l_foot_left, L_STEM_CENTER)))
I_CENTER = L_STEM_CENTER

# Top serif and foot of a thick stem, centred on x = 0, for reuse on any stroke.
CAP = translate(clip(I_SHAPE, -INF, 600, INF, INF), -I_CENTER, 0)
FOOT = translate(clip(I_SHAPE, -INF, -INF, INF, 100), -I_CENTER, 0)


def stem(cx: float, y0: float = 0, y1: float = CAP_HEIGHT, cap: bool = True, foot: bool = True) -> Path:
    """A thick vertical stem centred on cx, with the logo's serifs at either end."""
    parts = [rect(cx - STEM / 2, y0 + (90 if foot else 0), cx + STEM / 2, y1 - (90 if cap else 0))]
    if cap:
        parts.append(translate(CAP, cx, y1 - CAP_HEIGHT))
    if foot:
        parts.append(translate(FOOT, cx, y0))
    return union(*parts)


# E's arms, cut to the right of its stem.
E_TOP_ARM = union(clip(E, 190, 520, INF, INF), clip(E, E_STEM_CENTER, 650, INF, INF))
E_BOTTOM_ARM = union(clip(E, 190, -INF, INF, 180), clip(E, E_STEM_CENTER, -INF, INF, 50))
E_MID = clip(E, E_STEM_CENTER, 250, INF, 450)

# D's bowl, right of the point where its flat top starts to curve.
D_BOWL_START = 350

# R's leg below the bowl.
R_LEG = clip(R, 300, -INF, INF, 330)


# --- glyph construction -----------------------------------------------------------------


def build() -> dict[str, Path]:
    g: dict[str, Path] = {}

    # Letters taken straight from the logo.
    g["U"], g["R"], g["N"], g["E"], g["S"] = U, R, N, E, S
    g["D"], g["P"], g["A"], g["L"] = D, P, A, L

    g["I"] = I_SHAPE

    # F: the E without its bottom arm, standing on a symmetric foot.
    g["F"] = union(
        clip(E, -INF, 200, INF, INF),
        translate(clip(I_SHAPE, -INF, -INF, INF, 200), E_STEM_CENTER - I_CENTER, 0),
    )

    # T: E's top arm mirrored into a symmetric bar over a stem.
    bar_half = E_TOP_ARM
    bar = union(bar_half, mirror_x(bar_half, E_STEM_CENTER))
    t_stem = stem(E_STEM_CENTER, cap=False)
    g["T"] = union(bar, clip(t_stem, -INF, -INF, INF, 660))

    # H: two stems joined by the E's middle arm thickness.
    h_left, h_right = 142, 142 + 440
    g["H"] = union(
        stem(h_left),
        stem(h_right),
        rect(h_left, E_MID_ARM[0] + 5, h_right, E_MID_ARM[1] - 5),
    )

    # O: the D's bowl mirrored on itself.
    bowl = clip(D, D_BOWL_START, -INF, INF, INF)
    o = union(bowl, mirror_x(bowl, D_BOWL_START))
    g["O"] = o

    # Q: the O with the end of R's leg as its tail.
    o_left, o_bottom, o_right, _ = o.bounds
    tail = clip(R, 470, -INF, INF, 140)
    g["Q"] = union(o, translate(tail, (o_left + o_right) / 2 - 460, -95))

    # C: the O opened on the right.
    o_cx = (o_left + o_right) / 2
    c = difference(o, polygon([(o_cx + 40, 260), (o_right + 10, 150), (o_right + 10, 560), (o_cx + 40, 450)]))
    c = difference(c, rect(o_right - 90, 230, o_right + 10, 480))
    g["C"] = c

    # G: the O opened above mid-height, with a short stem and an arm-weight bar on the right.
    g_open = difference(o, polygon([(o_cx + 40, 330), (o_right + 10, 330), (o_right + 10, 560), (o_cx + 40, 450)]))
    g_open = difference(g_open, rect(o_right - 90, 300, o_right + 10, 480))
    g["G"] = union(
        g_open,
        rect(o_right - 90, 60, o_right - 20, 330),
        rect(o_right - 180, 330 - ARM, o_right - 20, 330),
    )

    # B: R's closed bowl on top and a slightly larger copy below, on a full stem.
    r_bowl = clip(R, -INF, 330, INF, INF)
    top_bowl = scale(r_bowl, 1.0, 0.98, origin=(0, CAP_HEIGHT))
    lower = mirror_y(clip(R, R.bounds[0], 330, INF, INF), 350)
    lower = scale(lower, 1.08, 1.0, origin=(L_STEM_CENTER, 0))
    lower = clip(lower, L_STEM_CENTER - 10, -INF, INF, 360)
    g["B"] = union(stem(135.5, cap=True, foot=True), clip(top_bowl, 120, 330, INF, INF), lower)

    # J: a stem whose foot turns into the left half of the U's bowl.
    g["J"] = difference(U, rect(-INF, 190, 273, INF))

    # V: the A turned upside down, without its crossbar.
    below, above = A_CROSSBAR[0] - 12, A_CROSSBAR[1] + 12
    (_, lb_inner), (rb_inner, _) = spans(A, below)[:2]
    (_, la_inner), (ra_inner, _) = spans(A, above)[:2]
    a_no_bar = difference(A, polygon([(lb_inner, below), (rb_inner, below), (ra_inner, above), (la_inner, above)]))
    v = rotate180(a_no_bar, A.bounds[2] / 2, CAP_HEIGHT / 2)
    v = translate(v, 0, -v.bounds[1] - 16)
    g["V"] = v

    # W: two narrower Vs crossing in the middle.
    v_narrow = scale(v, 0.78, 1.0)
    vw = v_narrow.bounds[2] - v_narrow.bounds[0]
    g["W"] = union(v_narrow, translate(v_narrow, vw * 0.58, 0))

    # K: a stem, a thin arm with a narrow serif, and the R's leg branching from the arm.
    k_arm_top = (540, CAP_HEIGHT)
    k_arm_bottom = (205, 250)
    k_leg = translate(R_LEG, 215 - R_LEG.bounds[0] - 5, 0)
    g["K"] = union(
        stem(135.5),
        stroke(k_arm_top, k_arm_bottom, 54),
        translate(scale(CAP, 0.6, 1.0), k_arm_top[0] - 10, 0),
        clip(k_leg, -INF, -INF, INF, 330),
    )

    # M: the N's thin left stem, a thick diagonal down, a thin diagonal up and a thick stem.
    n_stem = clip(N, -INF, -INF, 175, INF)
    m_right = 640
    m_mid = 395
    g["M"] = clip(
        union(
            n_stem,
            stroke((205, CAP_HEIGHT), (m_mid, 0), 100),
            stroke((m_right - 20, CAP_HEIGHT), (m_mid + 25, 0), 46),
            stem(m_right),
        ),
        -INF, -12, INF, INF,
    )

    # X: the N's diagonal crossed by a thin stroke, with stem serifs at the four ends.
    g["X"] = union(
        stroke((170, 700), (560, 0), 100),
        stroke((560, 700), (170, 0), 46),
        translate(clip(CAP, -INF, -INF, INF, INF), 170, 0),
        translate(CAP, 560, 0),
        translate(FOOT, 170, 0),
        translate(FOOT, 560, 0),
    )

    # Y: two diagonals meeting at mid-height above a stem.
    g["Y"] = union(
        stroke((150, 700), (350, 330), 100),
        stroke((560, 700), (350, 330), 46),
        translate(CAP, 150, 0),
        translate(CAP, 560, 0),
        stem(350, 0, 360, cap=False),
    )

    # Z: E's top arm mirrored (beak on the left), a thick diagonal, and E's bottom arm.
    z_top = mirror_x(E_TOP_ARM, 300)
    z_bottom = translate(E_BOTTOM_ARM, -100, 0)
    zt_l, _, zt_r, _ = z_top.bounds
    zb_l, _, zb_r, _ = z_bottom.bounds
    g["Z"] = clip(
        union(z_top, z_bottom, stroke((zt_r - 48, 700), (zb_l + 48, 0), 96)),
        -INF, 0, INF, CAP_HEIGHT,
    )

    add_accents(g)
    add_punctuation(g)
    return g


# --- accents and punctuation ---------------------------------------------------------------

ACCENT_Y = 770


def acute(cx: float) -> Path:
    return polygon([(cx - 40, ACCENT_Y), (cx - 5, ACCENT_Y), (cx + 95, ACCENT_Y + 140), (cx + 35, ACCENT_Y + 150)])


def grave(cx: float) -> Path:
    return mirror_x(acute(cx), cx)


def circumflex(cx: float) -> Path:
    return union(
        polygon([(cx - 120, ACCENT_Y), (cx - 85, ACCENT_Y), (cx + 10, ACCENT_Y + 120), (cx - 20, ACCENT_Y + 140)]),
        polygon([(cx + 85, ACCENT_Y), (cx + 120, ACCENT_Y), (cx + 20, ACCENT_Y + 140), (cx - 10, ACCENT_Y + 120)]),
    )


def dieresis(cx: float) -> Path:
    return union(ellipse(cx - 95, ACCENT_Y + 45, 40, 40), ellipse(cx + 95, ACCENT_Y + 45, 40, 40))


def cedilla(cx: float) -> Path:
    hook = difference(ellipse(cx + 10, -105, 70, 60), ellipse(cx - 5, -105, 40, 34))
    hook = clip(hook, cx - 20, -INF, INF, INF)
    return union(rect(cx - 15, -60, cx + 15, 8), hook)


def visual_center(path: Path) -> float:
    x0, _, x1, _ = path.bounds
    return (x0 + x1) / 2


ACCENTED = {
    "Agrave": ("A", grave),
    "Acircumflex": ("A", circumflex),
    "Ccedilla": ("C", None),
    "Egrave": ("E", grave),
    "Eacute": ("E", acute),
    "Ecircumflex": ("E", circumflex),
    "Edieresis": ("E", dieresis),
    "Icircumflex": ("I", circumflex),
    "Idieresis": ("I", dieresis),
    "Ocircumflex": ("O", circumflex),
    "Ugrave": ("U", grave),
    "Ucircumflex": ("U", circumflex),
    "Udieresis": ("U", dieresis),
    "Ydieresis": ("Y", dieresis),
}


def add_accents(g: dict[str, Path]) -> None:
    for name, (base, mark) in ACCENTED.items():
        letter = g[base]
        cx = visual_center(letter)
        # The A's apex sits right of centre; E and I accents sit over the stem side less.
        if base == "A":
            cx = 357
        g[name] = union(letter, cedilla(cx) if mark is None else mark(cx))

    # Œ: a narrower O joined to the E's arms.
    o_narrow = scale(g["O"], 0.82, 1.0)
    o_right = o_narrow.bounds[2]
    e_arms = clip(g["E"], 113, -INF, INF, INF)
    g["OE"] = union(o_narrow, translate(e_arms, o_right - 90 - 113, 0))


def add_punctuation(g: dict[str, Path]) -> None:
    dot = ellipse(45, 45, 45, 45)
    comma = union(ellipse(45, 45, 45, 45), polygon([(55, 30), (90, 50), (40, -110), (15, -105)]))
    g["period"] = dot
    g["comma"] = comma
    g["colon"] = union(dot, translate(dot, 0, 380))
    g["quoteright"] = translate(comma, 0, CAP_HEIGHT - 90)
    g["hyphen"] = rect(0, 255, 250, 255 + ARM)
    g["endash"] = rect(0, 255, 500, 255 + ARM)
    g["exclam"] = union(polygon([(10, CAP_HEIGHT), (80, CAP_HEIGHT), (58, 200), (32, 200)]), dot)


# Unicode code points for each glyph; lowercase maps to the same capitals.
def cmap_for(names: list[str]) -> dict[int, str]:
    by_char = {
        "Agrave": "À", "Acircumflex": "Â", "Ccedilla": "Ç", "Egrave": "È", "Eacute": "É",
        "Ecircumflex": "Ê", "Edieresis": "Ë", "Icircumflex": "Î", "Idieresis": "Ï",
        "Ocircumflex": "Ô", "Ugrave": "Ù", "Ucircumflex": "Û", "Udieresis": "Ü", "Ydieresis": "Ÿ",
        "OE": "Œ", "period": ".", "comma": ",", "colon": ":", "quoteright": "’",
        "hyphen": "-", "endash": "–", "exclam": "!", "space": " ",
    }
    cmap: dict[int, str] = {}
    for name in names:
        char = name if len(name) == 1 else by_char.get(name)
        if not char:
            continue
        cmap[ord(char)] = name
        lower = char.lower()
        if lower != char and len(lower) == 1:
            cmap[ord(lower)] = name
    cmap[ord("'")] = "quoteright"
    cmap[0x00A0] = "space"
    return cmap
