#!/usr/bin/env python3
"""Render a branded OG / social share card with correctly shaped Arabic text.

Deterministic: the same arguments always produce the same PNG, so cards can be
regenerated in CI and diffed. Nothing here calls an image model — see the
"Images" section of CLAUDE.md for why lesson visuals are drawn, not generated.

Usage:
    python3 scripts/og-card.py "قابلية القسمة على ٣"
    python3 scripts/og-card.py "الأعداد الطبيعية" --eyebrow "الرياضيات · 4 متوسط" \
        --theme violet -o public/og/aadad.png
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont, features
except ImportError:
    sys.exit("Pillow is required: pip install --user Pillow")

# OG spec: 1200x630. Rendered at 2x then downsampled for clean edges.
W, H = 1200, 630
SS = 2

# Brand palette — accent.* in tailwind.config.js, --sa-premium in index.css.
THEMES = {
    "violet": ((0x1A, 0x17, 0x2E), (0x8B, 0x5C, 0xF6), (0x7C, 0x3A, 0xED)),
    "blue":   ((0x12, 0x1A, 0x2E), (0x3B, 0x82, 0xF6), (0x06, 0xB6, 0xD4)),
    "cyan":   ((0x0E, 0x1F, 0x24), (0x06, 0xB6, 0xD4), (0x3B, 0x82, 0xF6)),
}
CREAM = (0xF5, 0xF0, 0xE6)
MUTED = (0xA8, 0xA4, 0xB8)

FONT_DIRS = [
    Path.home() / "snap/code/264/.local/share/fonts",
    Path.home() / ".local/share/fonts",
    Path("/usr/share/fonts/truetype/noto"),
    Path("/usr/share/fonts"),
]
# Cairo matches the app (index.css: 'Inter', 'Cairo', 'Tajawal'); Noto is fallback.
FONT_CANDIDATES = {
    "bold": ["Cairo-Bold.ttf", "NotoSansArabic-Bold.ttf", "NotoKufiArabic-Bold.ttf"],
    "regular": ["Cairo-Regular.ttf", "NotoSansArabic-Regular.ttf", "NotoKufiArabic-Regular.ttf"],
}


def find_font(weight):
    for name in FONT_CANDIDATES[weight]:
        for directory in FONT_DIRS:
            hit = next(directory.rglob(name), None) if directory.is_dir() else None
            if hit:
                return hit
    sys.exit(
        f"No Arabic {weight} font found. Install Cairo or Noto Sans Arabic:\n"
        "  sudo apt install fonts-noto-core"
    )


def load(weight, size):
    return ImageFont.truetype(str(find_font(weight)), size * SS)


def has_arabic(text):
    # Arabic, Arabic Supplement, Extended-A, and the presentation forms.
    return any(
        "؀" <= c <= "ۿ" or "ݐ" <= c <= "ݿ"
        or "ࢠ" <= c <= "ࣿ" or "ﭐ" <= c <= "﻿"
        for c in text
    )


def text_opts(text):
    """Only force RTL on Arabic-bearing strings.

    Passing direction="rtl" for a Latin string reverses it, and forcing it on a
    mixed string ("الرياضيات · 4 متوسط") overrides the bidi algorithm so the
    Latin run and its punctuation land in the wrong order. Letting raqm apply
    the default bidi handles both runs correctly.
    """
    if not features.check("raqm") or not has_arabic(text):
        return {}
    return {"language": "ar"}


def draw_text(d, xy, text, font, fill, anchor):
    d.text(xy, text, font=font, fill=fill, anchor=anchor, **text_opts(text))


def measure(d, text, font):
    box = d.textbbox((0, 0), text, font=font, **text_opts(text))
    return box[2] - box[0]


def wrap(d, text, font, max_w):
    """Greedy wrap on whitespace. Arabic words stay intact; shaping is per-line."""
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if measure(d, trial, font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def fit_font(d, text, max_w, start, floor=44):
    """Pick the largest size that sets the title well.

    Prefers a single line: a slightly smaller one-liner reads better than a big
    two-liner with an orphan word ("...لعدد / طبيعي"). Only if the text cannot
    fit on one line at a reasonable size do we accept two lines, and then we
    rebalance so the lines are of similar length.
    """
    one_line_floor = max(floor, int(start * 0.62))
    for size in range(start, one_line_floor - 1, -2):
        font = load("bold", size)
        if len(wrap(d, text, font, max_w)) == 1:
            return font

    for size in range(start, floor - 1, -2):
        font = load("bold", size)
        if len(wrap(d, text, font, max_w)) <= 2:
            return font
    return load("bold", floor)


def balanced_wrap(d, text, font, max_w):
    """Wrap, then even out a 2-line split so neither line is a lone word."""
    lines = wrap(d, text, font, max_w)
    if len(lines) != 2:
        return lines
    words = text.split()
    if len(words) < 4:
        return lines
    best, best_score = lines, None
    for cut in range(1, len(words)):
        a, b = " ".join(words[:cut]), " ".join(words[cut:])
        wa, wb = measure(d, a, font), measure(d, b, font)
        if wa > max_w or wb > max_w:
            continue
        score = abs(wa - wb)
        if best_score is None or score < best_score:
            best, best_score = [a, b], score
    return best


def gradient_bg(base, accent, glow):
    """Vertical base gradient plus a soft radial accent bloom, mirroring the app."""
    w, h = W * SS, H * SS
    img = Image.new("RGB", (w, h), base)
    top = tuple(min(255, c + 18) for c in base)
    grad = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        grad.putpixel((0, y), tuple(round(top[i] + (base[i] - top[i]) * t) for i in range(3)))
    img = grad.resize((w, h))

    # Radial bloom, drawn small and blurred up — cheap and smooth.
    bloom = Image.new("L", (w // 8, h // 8), 0)
    bd = ImageDraw.Draw(bloom)
    cx, cy, r = int(w * 0.80 / 8), int(h * 0.22 / 8), int(w * 0.30 / 8)
    bd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=150)
    cx2, cy2, r2 = int(w * 0.12 / 8), int(h * 0.88 / 8), int(w * 0.24 / 8)
    bd.ellipse([cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2], fill=90)
    bloom = bloom.filter(ImageFilter.GaussianBlur(r // 2)).resize((w, h), Image.BICUBIC)

    img.paste(Image.new("RGB", (w, h), accent), mask=bloom.point(lambda v: int(v * 0.55)))
    edge = Image.new("RGB", (w, h), glow)
    img.paste(edge, mask=bloom.point(lambda v: int(v * 0.18)))
    return img


def main():
    p = argparse.ArgumentParser(description="Render a branded Arabic OG share card.")
    p.add_argument("title", help="Card headline (Arabic or Latin).")
    p.add_argument("--eyebrow", default="", help="Small label above the title.")
    # The brand name is always Latin, never transliterated — it appears this way
    # inside Arabic copy throughout the app (i18n/locales/ar/common.json appName).
    p.add_argument("--footer", default="Smarter Academy", help="Bottom-right wordmark.")
    p.add_argument("--theme", default="violet", choices=sorted(THEMES))
    p.add_argument("-o", "--output", default="og-card.png", help="Output PNG path.")
    args = p.parse_args()

    base, accent, glow = THEMES[args.theme]
    img = gradient_bg(base, accent, glow)
    d = ImageDraw.Draw(img)

    margin = 92 * SS
    right = W * SS - margin
    # Keep the longest line clear of the margins: a title that runs the full
    # measure reads as crowded even though it technically fits.
    max_w = int((W * SS - margin * 2) * 0.92)

    title_font = fit_font(d, args.title, max_w, start=96)
    lines = balanced_wrap(d, args.title, title_font, max_w)
    line_h = int(title_font.size * 1.30)

    # Centre the title block optically: `y` is the first baseline, so shift by
    # roughly one cap-height rather than a whole line.
    block_h = line_h * (len(lines) - 1)
    y = (H * SS - block_h) // 2 + int(title_font.size * 0.34)

    if args.eyebrow:
        ef = load("regular", 30)
        first_top = d.textbbox(
            (right, y), lines[0], font=title_font, anchor="rm", **text_opts(lines[0]),
        )[1]
        draw_text(d, (right, first_top - int(title_font.size * 0.30)),
                  args.eyebrow, ef, accent_tint(accent), "rb")

    for i, line in enumerate(lines):
        draw_text(d, (right, y + i * line_h), line, title_font, CREAM, "rm")

    # Accent rule below the true ink of the last line. Arabic descenders (ي, ج,
    # ع) drop far below the baseline, so measure rather than assume.
    last_bottom = d.textbbox(
        (right, y + block_h), lines[-1], font=title_font, anchor="rm",
        **text_opts(lines[-1]),
    )[3]
    rule_y = last_bottom + int(title_font.size * 0.30)
    d.rounded_rectangle(
        [right - 150 * SS, rule_y, right, rule_y + 7 * SS], radius=4 * SS, fill=accent
    )

    if args.footer:
        ff = load("bold", 28)
        draw_text(d, (right, H * SS - margin + 14 * SS), args.footer, ff, MUTED, "rm")

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.resize((W, H), Image.LANCZOS).save(out, "PNG", optimize=True)

    shaped = "shaped" if features.check("raqm") else "UNSHAPED — install libraqm"
    print(f"Saved {out}  ({W}x{H}, {args.theme}, Arabic {shaped})")


def accent_tint(accent):
    """Lighten the accent so the eyebrow reads on a dark field."""
    return tuple(min(255, c + 60) for c in accent)


if __name__ == "__main__":
    main()
