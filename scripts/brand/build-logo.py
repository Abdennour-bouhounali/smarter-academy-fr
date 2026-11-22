#!/usr/bin/env python3
"""Build every Smarter Academy logo file from code — the single source of the brand mark.

The mark: an open ring (two fingers) holding a small isometric cube — the student's
hand holding an idea to try it. Adopted by the owner on 2026-10-21; it replaced the
star + figure + open book emblem everywhere. Contract: docs/architecture/BRAND.md.

Deterministic SVG (geometry + the wordmark's Manrope outlines, no font needed to
display), then rasters (favicons, PWA icons, e-mail logo, JSON-LD logo, the books
share card) rendered by headless Chrome and resized with Pillow.

Usage:
    python3 scripts/brand/build-logo.py            # SVG + rasters
    python3 scripts/brand/build-logo.py --svg-only

Requires fontTools + Pillow; rasters need google-chrome (or $CHROME) on PATH.
"""
from __future__ import annotations

import argparse
import math
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "apps/web/public"
BRAND = PUBLIC / "brand"
FONT = Path(__file__).with_name("fonts") / "Manrope.ttf"

NAVY, BLUE, INDIGO, INK = "#0b2a6f", "#3b5bdb", "#4f46e5", "#0b1b3f"
ACADEMY = "#4f5bd5"


# ── wordmark: Manrope outlines ────────────────────────────────────────────────
_fonts: dict[int, TTFont] = {}


def text_path(s: str, weight: int, size: float, x: float, y: float, track: float = -0.025):
    if weight not in _fonts:
        _fonts[weight] = instancer.instantiateVariableFont(TTFont(FONT), {"wght": weight})
    f = _fonts[weight]
    glyphs, cmap = f.getGlyphSet(), f.getBestCmap()
    sc = size / f["head"].unitsPerEm
    out, cx = [], x
    for ch in s:
        g = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[g].draw(TransformPen(pen, (sc, 0, 0, -sc, cx, y)))
        out.append(pen.getCommands())
        cx += glyphs[g].width * sc + track * size
    return " ".join(out), cx - x - track * size


def wordmark(x, y, size, c1, c2, stacked=True):
    p1, w1 = text_path("Smarter", 800, size, x, y)
    gap = size * 0.28
    if stacked:
        p2, w2 = text_path("Academy", 500, size, x, y + size * 0.98)
        width = max(w1, w2)
    else:
        p2, w2 = text_path("Academy", 500, size, x + w1 + gap, y)
        width = w1 + gap + w2
    return f'<path d="{p1}" fill="{c1}"/><path d="{p2}" fill="{c2}"/>', width


# ── the mark, in a 200×200 box ────────────────────────────────────────────────
def _pts(*pts):
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in pts)


def mark(mode="color", tx=0.0, ty=0.0, scale=1.0, uid="m"):
    """mode: color | white | ink. Returns (defs, group)."""
    r, sw, cx, cy = 60, 22, 100, 104
    a0, a1 = math.radians(-2), math.radians(-88)
    p0 = (cx + r * math.cos(a0), cy + r * math.sin(a0))
    p1 = (cx + r * math.cos(a1), cy + r * math.sin(a1))
    ring = f"M{p0[0]:.2f},{p0[1]:.2f} A{r},{r} 0 1 1 {p1[0]:.2f},{p1[1]:.2f}"
    am = math.radians(-45)
    ccx, ccy, u = cx + r * math.cos(am) + 4, cy + r * math.sin(am) - 6, 34

    def iso(x, y, z):
        return ccx + (x - y) * u * 0.866, ccy + (x + y) * u * 0.5 - z * u

    top = _pts(iso(-.5, -.5, .5), iso(.5, -.5, .5), iso(.5, .5, .5), iso(-.5, .5, .5))
    right = _pts(iso(.5, -.5, -.5), iso(.5, .5, -.5), iso(.5, .5, .5), iso(.5, -.5, .5))
    left = _pts(iso(-.5, .5, -.5), iso(.5, .5, -.5), iso(.5, .5, .5), iso(-.5, .5, .5))
    if mode == "color":
        defs = (
            f'<linearGradient id="{uid}r" gradientUnits="userSpaceOnUse" x1="40" y1="170" x2="160" y2="40">'
            f'<stop offset="0" stop-color="{NAVY}"/><stop offset="1" stop-color="{BLUE}"/></linearGradient>'
            f'<linearGradient id="{uid}t" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient>'
        )
        body = (
            f'<path d="{ring}" fill="none" stroke="url(#{uid}r)" stroke-width="{sw}" stroke-linecap="round"/>'
            f'<polygon points="{left}" fill="{NAVY}"/><polygon points="{right}" fill="{INDIGO}"/>'
            f'<polygon points="{top}" fill="url(#{uid}t)"/>'
        )
    else:
        c = "#ffffff" if mode == "white" else INK
        defs = ""
        body = (
            f'<path d="{ring}" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round"/>'
            f'<polygon points="{left}" fill="{c}" fill-opacity=".55"/>'
            f'<polygon points="{right}" fill="{c}" fill-opacity=".8"/><polygon points="{top}" fill="{c}"/>'
        )
    return defs, f'<g transform="translate({tx:.2f},{ty:.2f}) scale({scale})">{body}</g>'


def svg(w, h, defs, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" width="{w:g}" height="{h:g}">'
            f"<defs>{defs}</defs>{body}</svg>\n")


TILE = ('<linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b2a6f"/>'
        '<stop offset=".55" stop-color="#3b4fe0"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>')


def app_icon(rounded=True, mark_scale=1.6):
    """512×512 tile + white mark; rounded=False is full-bleed (iOS / maskable)."""
    d, b = mark("white", 256 - 100 * mark_scale - 4, 256 - 104 * mark_scale + 6, mark_scale)
    rx = ' rx="112"' if rounded else ""
    return svg(512, 512, TILE + d, f'<rect width="512" height="512"{rx} fill="url(#tile)"/>{b}')


def build_svgs():
    BRAND.mkdir(parents=True, exist_ok=True)
    out = {}
    for m in ("color", "white", "ink"):
        d, b = mark(m)
        out[f"mark-{m}.svg"] = svg(200, 200, d, b)
    for m, c1, c2 in (("color", INK, ACADEMY), ("white", "#ffffff", "#c7d2fe"), ("ink", INK, INK)):
        d, b = mark(m)
        wm, ww = wordmark(212, 92, 64, c1, c2)
        out[f"logo-horizontal-{m}.svg"] = svg(round(212 + ww + 8), 200, d, b + wm)
    for m, c1, c2 in (("color", INK, ACADEMY), ("white", "#ffffff", "#c7d2fe")):
        wm, ww = wordmark(0, 0, 56, c1, c2, stacked=False)
        w = round(max(ww, 200)) + 40
        d, b = mark(m, (w - 200) / 2, 0, 1)
        out[f"logo-stacked-{m}.svg"] = svg(w, 290, d, b + f'<g transform="translate({(w - ww) / 2:.1f},262)">{wm}</g>')
    # One line, for narrow headers (workspace sidebars): the mark at 160 px, the
    # name large enough to read at 32 px high.
    for m, c1, c2 in (("color", INK, ACADEMY), ("white", "#ffffff", "#c7d2fe")):
        d, b = mark(m, 0, 0, 0.8)
        wm, ww = wordmark(184, 112, 88, c1, c2, stacked=False)
        out[f"logo-inline-{m}.svg"] = svg(round(184 + ww + 6), 160, d, b + wm)
    out["app-icon.svg"] = app_icon()
    for name, text in out.items():
        (BRAND / name).write_text(text)
    return out


# ── rasters ───────────────────────────────────────────────────────────────────
def chrome_png(html: str, w: int, h: int, dest: Path, scale: int = 1):
    chrome = os.environ.get("CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
    if not chrome:
        raise SystemExit("google-chrome (or $CHROME) is required for rasters; use --svg-only")
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "p.html"
        page.write_text(f'<!doctype html><html><body style="margin:0;background:transparent">{html}</body></html>')
        subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                        "--default-background-color=00000000", f"--force-device-scale-factor={scale}",
                        f"--window-size={w},{h}", f"--screenshot={dest}", page.as_uri()],
                       check=True, capture_output=True)


def raster(svg_text: str, w: int, h: int, dest: Path, size=None, rgb=False, colors=None):
    big = dest.with_suffix(".tmp.png")
    chrome_png(f'<div style="width:{w}px;height:{h}px">{svg_text.replace("<svg ", f"<svg style=\'width:{w}px;height:{h}px;display:block\' ", 1)}</div>',
               w, h, big, scale=2)
    im = Image.open(big).convert("RGBA")
    big.unlink()
    if size:
        im = im.resize(size, Image.LANCZOS)
    if rgb:
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(bg, im).convert("RGB")
    if colors:
        im = im.quantize(colors=colors, method=Image.FASTOCTREE)
    im.save(dest, optimize=True)
    return dest


def build_rasters(svgs):
    mark_color = svgs["mark-color.svg"]
    # Favicons: the mark alone, transparent.
    for px in (16, 32):
        raster(mark_color, 256, 256, PUBLIC / f"favicon-{px}x{px}.png", size=(px, px))
    big = raster(mark_color, 256, 256, BRAND / "_favicon.png", size=(256, 256))
    Image.open(big).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    big.unlink()
    # Home-screen / PWA icons.
    raster(app_icon(rounded=False), 512, 512, PUBLIC / "apple-touch-icon.png", size=(180, 180), rgb=True)
    raster(svgs["app-icon.svg"], 512, 512, PUBLIC / "icon-512.png", colors=256)
    raster(svgs["app-icon.svg"], 512, 512, PUBLIC / "icon-192.png", size=(192, 192))
    raster(app_icon(rounded=False, mark_scale=1.25), 512, 512, PUBLIC / "icon-maskable-512.png", colors=256)
    # E-mail header (Gmail shows neither SVG nor WebP): 3× its 200-px display width.
    h = svgs["logo-horizontal-color.svg"]
    vw = float(h.split('viewBox="0 0 ')[1].split()[0])
    raster(h, 600, round(600 * 200 / vw), PUBLIC / "email/logo.png")
    # JSON-LD Organization logo (index.html).
    s = svgs["logo-stacked-color.svg"]
    sw = float(s.split('viewBox="0 0 ')[1].split()[0])
    raster(s, 512, round(512 * 290 / sw), BRAND / "logo-stacked-color.png")
    # Books store share card fallback (features/books/shareCards.json): ≤ 300 KB.
    card = (f'<div style="width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;'
            f'justify-content:center;gap:34px;background:linear-gradient(160deg,#ffffff 40%,#eef2ff);'
            f"font-family:Cairo,sans-serif\">{s.replace('<svg ', '<svg style=\"width:560px;height:auto\" ', 1)}"
            f'<div dir="rtl" style="font-size:40px;font-weight:700;color:#0b1b3f">تعلّم الرياضيات بالفهم، لا بالحفظ</div></div>')
    tmp = PUBLIC / "og/_card.png"
    chrome_png(card, 1200, 630, tmp)
    Image.open(tmp).convert("RGB").quantize(colors=256, method=Image.MEDIANCUT).save(PUBLIC / "og/smarter-academy.png", optimize=True)
    tmp.unlink()


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--svg-only", action="store_true")
    a = ap.parse_args()
    svgs = build_svgs()
    if not a.svg_only:
        build_rasters(svgs)
    print(f"brand files written to {BRAND.relative_to(ROOT)}" + ("" if a.svg_only else " + public icons"))


if __name__ == "__main__":
    main()
