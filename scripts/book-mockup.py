#!/usr/bin/env python3
"""3D mockup of a printed book, rendered from its REAL cover art (deterministic, no image model).

The cover file is the full wrap exported for print (back · spine · front). We cut the front and the spine,
then project them onto a 3D box seen from a camera turned a few degrees, so the spine shows. Marketing
surface only (outside lessons/) — see the "Images" section of CLAUDE.md.

    python3 scripts/book-mockup.py "Book Cover Final.pdf" --front 0:701 --spine 701:729 --unit 1429 \
        -o apps/web/public/images/books/smart-protocol/book-3d.webp

--front / --spine : horizontal ranges in the cover's own units (--unit = full width in the same units).
The spine is on the RIGHT of the front for a right-bound (Arabic) book, which is what this renders.
"""
import argparse
import math
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT_W, OUT_H = 1600, 1200


def load_cover(path):
    path = Path(path)
    if path.suffix.lower() == ".pdf":
        tmp = Path(tempfile.mkdtemp())
        subprocess.run(["pdftoppm", "-r", "250", "-png", "-singlefile", str(path), str(tmp / "cover")], check=True)
        path = tmp / "cover.png"
    return Image.open(path).convert("RGB")


def crop(img, rng, unit):
    a, b = (float(v) for v in rng.split(":"))
    s = img.width / unit
    return img.crop((round(a * s), 0, round(b * s), img.height))


def coeffs(dst, src):
    """Perspective coefficients mapping OUTPUT quad `dst` back to INPUT quad `src` (PIL convention)."""
    m, v = [], []
    for (x, y), (u, w) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); v.append(u)
        m.append([0, 0, 0, x, y, 1, -w * x, -w * y]); v.append(w)
    return np.linalg.solve(np.array(m, float), np.array(v, float)).tolist()


def project(p, yaw, pitch, dist, scale, cx, cy):
    x, y, z = p
    # yaw around the vertical axis, then a small pitch so the camera looks slightly down.
    x, z = x * math.cos(yaw) + z * math.sin(yaw), -x * math.sin(yaw) + z * math.cos(yaw)
    y, z = y * math.cos(pitch) - z * math.sin(pitch), y * math.sin(pitch) + z * math.cos(pitch)
    f = dist / (dist + z)
    return (cx + x * f * scale, cy - y * f * scale)


def paste_face(canvas, tex, quad, shade=1.0):
    w, h = tex.size
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    face = tex.convert("RGBA")
    if shade != 1.0:
        face = Image.blend(face, Image.new("RGBA", face.size, (0, 0, 0, 255)), 1 - shade)
    warped = face.transform(canvas.size, Image.PERSPECTIVE, coeffs(quad, src), Image.BICUBIC)
    mask = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(mask).polygon(quad, fill=255)
    canvas.paste(warped, (0, 0), mask)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("cover")
    p.add_argument("--front", required=True)
    p.add_argument("--spine", required=True)
    p.add_argument("--unit", type=float, required=True)
    p.add_argument("--yaw", type=float, default=26, help="degrees; positive turns the front left so the right-hand spine shows")
    p.add_argument("--thickness", type=float, default=1.6, help="spine depth multiplier (mockups read better a little thicker)")
    p.add_argument("-o", "--output", required=True)
    a = p.parse_args()

    art = load_cover(a.cover)
    front, spine = crop(art, a.front, a.unit), crop(art, a.spine, a.unit)
    w = front.width / front.height          # box: height 1, width w, thickness t
    t = spine.width / spine.height * a.thickness
    yaw, pitch = math.radians(a.yaw), math.radians(9)
    P = lambda q: project(q, yaw, pitch, 4.2, 860, OUT_W / 2 - 40, OUT_H / 2)

    # Box centred on the origin. Front face at z = -t/2 (towards the camera), spine at x = +w/2.
    x0, x1, y0, y1, zf, zb = -w / 2, w / 2, -0.5, 0.5, -t / 2, t / 2
    front_q = [P((x0, y1, zf)), P((x1, y1, zf)), P((x1, y0, zf)), P((x0, y0, zf))]
    spine_q = [P((x1, y1, zf)), P((x1, y1, zb)), P((x1, y0, zb)), P((x1, y0, zf))]
    top_q = [P((x0, y1, zb)), P((x1, y1, zb)), P((x1, y1, zf)), P((x0, y1, zf))]

    canvas = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))

    # Contact shadow under the book.
    sh = Image.new("L", (OUT_W, OUT_H), 0)
    bottom = [P((x0, y0, zf)), P((x1, y0, zf)), P((x1, y0, zb)), P((x0, y0, zb))]
    xs = [q[0] for q in bottom]; yb = max(q[1] for q in bottom)
    ImageDraw.Draw(sh).ellipse([min(xs) - 30, yb - 28, max(xs) + 90, yb + 34], fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    canvas.paste(Image.new("RGBA", canvas.size, (10, 20, 50, 255)), (0, 0), sh)

    # Page block on top (cream, with faint page lines) — only a sliver shows at this pitch.
    pages = Image.new("RGB", (front.width, max(8, spine.width)), (244, 240, 230))
    pd = ImageDraw.Draw(pages)
    for i in range(0, pages.height, 3):
        pd.line([(0, i), (pages.width, i)], fill=(225, 220, 208))
    paste_face(canvas, pages, top_q)
    paste_face(canvas, spine, spine_q, shade=0.78)
    paste_face(canvas, front, front_q)

    # Soft sheen across the front + a thin hinge shadow near the spine.
    sheen = Image.new("L", (OUT_W, OUT_H), 0)
    sd = ImageDraw.Draw(sheen)
    fx0 = min(q[0] for q in front_q); fx1 = max(q[0] for q in front_q)
    for i in range(int(fx1 - fx0)):
        tt = i / max(1, fx1 - fx0)
        sd.line([(fx0 + i, 0), (fx0 + i, OUT_H)], fill=int(38 * max(0, 1 - abs(tt - 0.28) / 0.28)))
    fm = Image.new("L", (OUT_W, OUT_H), 0); ImageDraw.Draw(fm).polygon(front_q, fill=255)
    sheen = Image.composite(sheen, Image.new("L", sheen.size, 0), fm)
    canvas.paste(Image.new("RGBA", canvas.size, (255, 255, 255, 255)), (0, 0), sheen)

    bbox = canvas.getbbox()
    pad = 40
    canvas = canvas.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(OUT_W, bbox[2] + pad), min(OUT_H, bbox[3] + pad)))
    Path(a.output).parent.mkdir(parents=True, exist_ok=True)
    canvas.save(a.output, "WEBP", quality=88, method=6)
    print(f"Saved {a.output} {canvas.size}")


if __name__ == "__main__":
    main()
