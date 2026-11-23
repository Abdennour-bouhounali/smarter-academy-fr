/**
 * The narrow no-break space of French numbers (« 1 400 », U+202F) is drawn wide enough to be SEEN: Inter and Space
 * Grotesk draw it 0.14 em, and after a « 1 » the reader saw « 1400 » (the first French lesson's screenshots,
 * 2026-11-23). `scripts/brand/build-narrow-space.py` writes one @font-face per family and weight, holding only U+202F,
 * AFTER the Google Fonts links (the face declared last wins for its range). This test guards that block.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const html = readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');
// the page itself, comments out (the explanation above the block names the links it follows)
const page = html.replace(/<!--[\s\S]*?-->/g, '');

describe('the narrow no-break space is seen (index.html)', () => {
  const faces = [...page.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

  it('one face per family and per weight the page fetches, for U+202F alone, a real woff2', () => {
    const fetched = page.match(
      /fonts\.googleapis\.com\/css2\?family=Space\+Grotesk:wght@([\d;]+)&family=Inter:wght@([\d;]+)/,
    );
    expect(fetched).toBeTruthy();
    const want = { 'Space Grotesk': fetched[1].split(';'), Inter: fetched[2].split(';') };
    for (const [family, weights] of Object.entries(want))
      for (const w of weights) {
        const face = faces.find((f) => f.includes(`font-family: '${family}'`) && f.includes(`font-weight: ${w};`));
        expect(face, `${family} ${w}`).toBeTruthy();
        expect(face).toMatch(/unicode-range: U\+202F;/);
        const b64 = face.match(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/)[1];
        expect(Buffer.from(b64, 'base64').subarray(0, 4).toString('latin1')).toBe('wOF2');
      }
  });

  it('stands AFTER the stylesheet of Google Fonts: the face declared last draws its range', () => {
    const link = page.indexOf('fonts.googleapis.com/css2?family=Space+Grotesk');
    const block = page.indexOf('@font-face');
    expect(link).toBeGreaterThan(-1);
    expect(block).toBeGreaterThan(link);
    expect(page.lastIndexOf('fonts.googleapis.com/css2?family=Space+Grotesk')).toBeLessThan(block);
  });
});
