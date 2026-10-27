"""Outline helpers for building the title font from the logo's letters.

Outlines are skia-pathops Paths in font units (y up, baseline at 0, cap height 700).
"""

from __future__ import annotations

import re
from pathlib import Path as FilePath

import pathops
from pathops import Path, PathOp, op

ROOT = FilePath(__file__).resolve().parents[2]
PATHS_TS = ROOT / "src/components/Logo/paths.ts"

CAP_HEIGHT = 700
# In the logo artwork the capitals run from y 193.8 (top) to 210.8 (baseline), SVG units.
SVG_TOP = 193.8
SVG_BASELINE = 210.8
SCALE = CAP_HEIGHT / (SVG_BASELINE - SVG_TOP)

# The logo's lettering, left to right.
LOGO_ORDER = ["U", "R", "N", "E1", "S", "D", "E2", "P1", "A", "P2", "E3", "L"]


def _parse_svg_path(d: str) -> Path:
    """Parses an absolute M/L/C/Z path (as written by pdftocairo) into font units."""
    path = Path()
    tokens = re.findall(r"[MLCZ]|-?\d+\.?\d*", d)
    i = 0
    pen = path.getPen()

    def point() -> tuple[float, float]:
        nonlocal i
        x, y = float(tokens[i]), float(tokens[i + 1])
        i += 2
        return x * SCALE, (SVG_BASELINE - y) * SCALE

    cmd = ""
    open_contour = False
    while i < len(tokens):
        if tokens[i] in "MLCZ":
            cmd = tokens[i]
            i += 1
            if cmd == "Z":
                if open_contour:
                    pen.closePath()
                    open_contour = False
                continue
        if cmd == "M":
            if open_contour:
                pen.closePath()
            pen.moveTo(point())
            open_contour = True
            cmd = "L"
        elif cmd == "L":
            pen.lineTo(point())
        elif cmd == "C":
            pen.curveTo(point(), point(), point())
    if open_contour:
        pen.closePath()
    return path


def _logo_paths() -> dict[str, Path]:
    """The twelve letters of URNES DE PAPEL where the logo places them."""
    source = PATHS_TS.read_text()
    block = re.search(r"LOGO_NAME_PATHS = \[\n(.*?)\n\];", source, re.S)
    assert block, "LOGO_NAME_PATHS not found"
    ds = re.findall(r'"(.+?)"', block.group(1))
    paths = [_parse_svg_path(d) for d in ds]
    paths.sort(key=lambda p: p.bounds[0])
    assert len(paths) == len(LOGO_ORDER)
    return dict(zip(LOGO_ORDER, paths))


def logo_letters() -> dict[str, Path]:
    """The twelve letters of URNES DE PAPEL, each moved so its left edge is at x = 0."""
    return {name: translate(path, -path.bounds[0], 0) for name, path in _logo_paths().items()}


def logo_lefts() -> dict[str, float]:
    """Where each letter of URNES DE PAPEL starts in the logo, for measuring its spacing."""
    return {name: path.bounds[0] for name, path in _logo_paths().items()}


# --- transforms -------------------------------------------------------------------------


def transform(path: Path, a: float, b: float, c: float, d: float, e: float, f: float) -> Path:
    """Affine transform: x' = a*x + c*y + e, y' = b*x + d*y + f."""
    out = Path()
    pen = out.getPen()

    def tp(pt):
        x, y = pt
        return (a * x + c * y + e, b * x + d * y + f)

    for verb, pts in path.segments:
        if verb == "moveTo":
            pen.moveTo(tp(pts[0]))
        elif verb == "lineTo":
            pen.lineTo(tp(pts[0]))
        elif verb == "curveTo":
            pen.curveTo(*[tp(p) for p in pts])
        elif verb == "qCurveTo":
            pen.qCurveTo(*[tp(p) for p in pts])
        elif verb == "closePath":
            pen.closePath()
        elif verb == "endPath":
            pen.endPath()
    # Mirroring flips contour direction; let pathops fix winding.
    if a * d - b * c < 0:
        out = simplify(out)
    return out


def translate(path: Path, dx: float, dy: float) -> Path:
    return transform(path, 1, 0, 0, 1, dx, dy)


def scale(path: Path, sx: float, sy: float | None = None, origin=(0.0, 0.0)) -> Path:
    sy = sx if sy is None else sy
    ox, oy = origin
    return transform(path, sx, 0, 0, sy, ox - sx * ox, oy - sy * oy)


def mirror_x(path: Path, axis: float) -> Path:
    """Mirrors left-right around the vertical line x = axis."""
    return transform(path, -1, 0, 0, 1, 2 * axis, 0)


def mirror_y(path: Path, axis: float) -> Path:
    """Mirrors top-bottom around the horizontal line y = axis."""
    return transform(path, 1, 0, 0, -1, 0, 2 * axis)


def rotate180(path: Path, cx: float, cy: float) -> Path:
    return transform(path, -1, 0, 0, -1, 2 * cx, 2 * cy)


def skew_rotate(path: Path, radians: float, cx: float, cy: float) -> Path:
    import math

    cos, sin = math.cos(radians), math.sin(radians)
    return transform(path, cos, sin, -sin, cos, cx - cos * cx + sin * cy, cy - sin * cx - cos * cy)


# --- boolean operations -----------------------------------------------------------------


def simplify(path: Path) -> Path:
    out = Path(path)
    out.simplify(fix_winding=True, keep_starting_points=False)
    return out


def union(*paths: Path) -> Path:
    result = Path()
    for p in paths:
        result = op(result, p, PathOp.UNION, fix_winding=True, keep_starting_points=False)
    return result


def difference(a: Path, *bs: Path) -> Path:
    result = a
    for b in bs:
        result = op(result, b, PathOp.DIFFERENCE, fix_winding=True, keep_starting_points=False)
    return result


def intersect(a: Path, b: Path) -> Path:
    return op(a, b, PathOp.INTERSECTION, fix_winding=True, keep_starting_points=False)


def rect(x0: float, y0: float, x1: float, y1: float) -> Path:
    path = Path()
    pen = path.getPen()
    pen.moveTo((x0, y0))
    pen.lineTo((x1, y0))
    pen.lineTo((x1, y1))
    pen.lineTo((x0, y1))
    pen.closePath()
    return path


def polygon(points: list[tuple[float, float]]) -> Path:
    path = Path()
    pen = path.getPen()
    pen.moveTo(points[0])
    for pt in points[1:]:
        pen.lineTo(pt)
    pen.closePath()
    return simplify(path)


def ellipse(cx: float, cy: float, rx: float, ry: float) -> Path:
    k = 0.5522847498
    path = Path()
    pen = path.getPen()
    pen.moveTo((cx + rx, cy))
    pen.curveTo((cx + rx, cy + k * ry), (cx + k * rx, cy + ry), (cx, cy + ry))
    pen.curveTo((cx - k * rx, cy + ry), (cx - rx, cy + k * ry), (cx - rx, cy))
    pen.curveTo((cx - rx, cy - k * ry), (cx - k * rx, cy - ry), (cx, cy - ry))
    pen.curveTo((cx + k * rx, cy - ry), (cx + rx, cy - k * ry), (cx + rx, cy))
    pen.closePath()
    return path


def clip(path: Path, x0: float, y0: float, x1: float, y1: float) -> Path:
    """Keeps only the part of `path` inside the rectangle."""
    return intersect(path, rect(x0, y0, x1, y1))


def bounds(path: Path) -> tuple[float, float, float, float]:
    return path.bounds


def to_svg_d(path: Path) -> str:
    parts = []
    for verb, pts in path.segments:
        if verb == "moveTo":
            parts.append("M%.1f %.1f" % pts[0])
        elif verb == "lineTo":
            parts.append("L%.1f %.1f" % pts[0])
        elif verb == "curveTo":
            parts.append("C" + " ".join("%.1f %.1f" % p for p in pts))
        elif verb == "qCurveTo":
            parts.append("Q" + " ".join("%.1f %.1f" % p for p in pts))
        elif verb in ("closePath", "endPath"):
            parts.append("Z")
    return "".join(parts)
