#!/usr/bin/env python3
"""Give the narrow no-break space (U+202F) a width a reader SEES, in the interface's two fonts.

French groups the thousands of a number with a narrow no-break space (« 1 400 », FRENCH_LANGUAGE_CONTRACT.md §5;
`packages/core/numberFormat.js › formatFr`). Inter and Space Grotesk (fetched from Google Fonts) draw that space
0.14 em wide: after a « 1 », whose glyph already carries room on its right, the space is lost and « 1 400 » reads
« 1400 » on screen (seen 2026-11-23 on the first French lesson's screenshots: « 56 divise-t-il 1400 ? »).

This script builds a font of ONE empty glyph — U+202F, WIDTH/1000 em wide — and writes it, as a data URL, into one
@font-face per family and per weight the page fetches, between the markers of `apps/web/index.html`. The block stands
AFTER the Google Fonts links: among faces of the same family and weight, the one declared last is tried first for the
characters of its `unicode-range` (CSS Fonts 4 § 4.5), so this face draws U+202F and Google's draws everything else.
A face with a weight RANGE (100 900) is not chosen over Google's exact weight: one face per weight is needed.

Usage:  python3 scripts/brand/build-narrow-space.py        (requires fontTools + brotli)
Checked by apps/web/src/test/narrowSpace.test.js.
"""
from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

WIDTH = 220  # thousandths of an em: KaTeX's « \, » is 167, a word space 250 — wide enough to be seen after a « 1 »
FAMILIES = ['Inter', 'Space Grotesk']
WEIGHTS = [300, 400, 500, 600, 700]  # the weights index.html fetches
INDEX = Path(__file__).resolve().parents[2] / 'apps/web/index.html'
START = '<!-- narrow-space:start (scripts/brand/build-narrow-space.py — do not edit by hand) -->'
END = '<!-- narrow-space:end -->'


def font_b64() -> str:
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(['.notdef', 'nnbsp'])
    fb.setupCharacterMap({0x202F: 'nnbsp'})
    pen = TTGlyphPen(None)  # Chrome's font sanitizer refuses a font whose glyphs are all empty: .notdef is a box
    pen.moveTo((50, 0))
    pen.lineTo((50, 700))
    pen.lineTo((450, 700))
    pen.lineTo((450, 0))
    pen.closePath()
    fb.setupGlyf({'.notdef': pen.glyph(), 'nnbsp': TTGlyphPen(None).glyph()})
    fb.setupHorizontalMetrics({'.notdef': (500, 50), 'nnbsp': (WIDTH, 0)})
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    fb.setupNameTable({'familyName': 'SA Narrow Space', 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
    fb.setupPost()
    fb.font.flavor = 'woff2'
    buf = io.BytesIO()
    fb.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


def block() -> str:
    url = f'data:font/woff2;base64,{font_b64()}'
    faces = [
        f"    @font-face {{ font-family: '{family}'; font-style: normal; font-weight: {w}; font-display: swap; "
        f"unicode-range: U+202F; src: url({url}) format('woff2'); }}"
        for family in FAMILIES
        for w in WEIGHTS
    ]
    return '\n'.join([START, '  <style>', *faces, '  </style>', '  ' + END])


def main() -> None:
    html = INDEX.read_text(encoding='utf8')
    pattern = re.compile(re.escape(START) + r'.*?' + re.escape(END), re.S)
    if not pattern.search(html):
        raise SystemExit(f'{INDEX}: the markers are missing — place {START} … {END} after the Google Fonts links')
    INDEX.write_text(pattern.sub(lambda _: block(), html), encoding='utf8')
    print(f'{INDEX}: U+202F is {WIDTH / 1000} em in {", ".join(FAMILIES)} ({len(FAMILIES) * len(WEIGHTS)} faces)')


if __name__ == '__main__':
    main()
