"""Renders glyph outlines to an SVG sheet for visual review (y flipped back to screen space)."""

from __future__ import annotations

from pathlib import Path as FilePath

from geometry import CAP_HEIGHT, to_svg_d


def write_specimen(glyphs: dict[str, tuple], out: FilePath, per_row: int = 10, cell: int = 900, guides=True):
    """glyphs: name -> (path, advance_width)."""
    names = list(glyphs)
    rows = (len(names) + per_row - 1) // per_row
    width, height = per_row * cell, rows * cell
    items = []
    for i, name in enumerate(names):
        path, advance = glyphs[name]
        col, row = i % per_row, i // per_row
        ox = col * cell + 100
        base = row * cell + 150 + CAP_HEIGHT
        g = f'<g transform="translate({ox} {base}) scale(1 -1)">'
        if guides:
            g += f'<rect x="0" y="0" width="{advance}" height="{CAP_HEIGHT}" fill="none" stroke="#c9d" stroke-width="3"/>'
        g += f'<path d="{to_svg_d(path)}" fill="#333"/></g>'
        g += f'<text x="{ox}" y="{base + 110}" font-size="70" font-family="Helvetica" fill="#c33">{name}</text>'
        items.append(g)
    out.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="100%" style="background:#fff">'
        f'<rect width="100%" height="100%" fill="#fff"/>{"".join(items)}</svg>'
    )


def write_text_sample(glyphs: dict[str, tuple], lines: list[str], out: FilePath, tracking: float = 0.16):
    """Sets words with the given letter spacing (in em of cap-height-based UPM 1000)."""
    upm = 1000
    line_h = 1100
    items, max_w = [], 0
    for li, line in enumerate(lines):
        x = 100
        base = 150 + CAP_HEIGHT + li * line_h
        for ch in line:
            if ch == " ":
                x += glyphs.get("space", (None, 260))[1] + tracking * upm
                continue
            if ch not in glyphs:
                x += 600
                continue
            path, adv = glyphs[ch]
            items.append(
                f'<g transform="translate({x:.0f} {base}) scale(1 -1)"><path d="{to_svg_d(path)}" fill="#333"/></g>'
            )
            x += adv + tracking * upm
        max_w = max(max_w, x + 100)
    height = 150 + len(lines) * line_h
    out.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {max_w:.0f} {height}" '
        f'width="100%"><rect width="100%" height="100%" fill="#fff"/>'
        f'{"".join(items)}</svg>'
    )
