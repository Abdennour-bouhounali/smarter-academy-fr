"""Recadre les captures brutes de capture-methode.mjs en WebP pour /methode.

Les boîtes sont en pixels de capture (deviceScaleFactor 2, viewport 1280).
Si la leçon « qasim-adad-tabii » change de mise en page, relancer la capture
et revoir ces boîtes à l'œil.
"""
import os, tempfile
from pathlib import Path
from PIL import Image

RAW = Path(tempfile.gettempdir()) / 'methode-capture'
OUT = Path(__file__).resolve().parent.parent / 'public/images/methode/lesson'
CROPS = {
    'situation':  ('1-situation.png', None),
    'manipulate': ('2-manipulate.png', (0, 470, None, 1824)),
    'observe':    ('4-sixteen.png', (0, 520, None, 1990)),
    'question':   ('5-question.png', None),
    'discover':   ('6-discover.png', (0, 1290, None, 2700)),
    'understand': ('7-maarif-full.png', (242, 2594, 1809, 3826)),
    'practice':   ('8-awazzif-full.png', (228, 1160, 1820, 2594)),
    'apply':      ('9-masala-full.png', (222, 916, 1829, 2700)),
}

OUT.mkdir(parents=True, exist_ok=True)
for name, (src, box) in CROPS.items():
    im = Image.open(RAW / src).convert('RGB')
    if box:
        x0, y0, x1, y1 = box
        im = im.crop((x0, y0, x1 or im.width, min(y1, im.height)))
    if im.width > 1400:
        im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=86, method=6)
    print(name, im.size)
