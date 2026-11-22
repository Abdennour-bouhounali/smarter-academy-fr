// The forge's last step (`RuleForge.jsx › UseLines`): a fraction is typed in its own shape — the token
// `{ frac: { n, d } }` (forgeBlocks.js › fractionBox / givenFraction) is ONE stacked block, numerator box, a real bar,
// denominator box, with the hooks every box has; a given fraction is printed in the same shape; a line without a fraction
// draws as before. Server render.
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import RuleForge, { UseLines } from './RuleForge';
import { boxesOf, fractionBox, givenFraction, line } from './authoring/forgeBlocks';
import { slot } from './forge';

globalThis.window = globalThis.window ?? {};
// the sound switch reads the game's store (useSyncExternalStore), which a server render cannot: it is not under test here
vi.mock('./parts', async (importOriginal) => ({ ...(await importOriginal()), SoundToggle: () => null }));

const draw = (lines, vals = {}) =>
  renderToString(<UseLines lines={lines} vals={vals} onType={() => {}} />).replaceAll('<!-- -->', '');

describe('the forge’s last step — a fraction in its own shape', () => {
  it('66/78 = □/□: a printed fraction and a typed one, each a stacked block over a real bar, numerator first', () => {
    const typedBox = fractionBox('n', 'd', { w: 2 });
    const html = draw([line([givenFraction(66, 78), '=', typedBox])], { n: '11' });
    const blocks = html.match(/<span class="di-frac rf-frac[^"]*"[^>]*>/g);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain('data-rf-frac="66/78"');
    expect(blocks[0]).not.toContain('di-frac--typed');
    expect(blocks[1]).toContain('data-rf-frac="n/d"');
    expect(blocks[1]).toContain('di-frac--typed');
    for (const b of blocks) expect(b).toContain('dir="ltr"');
    expect(html.match(/class="di-frac__bar"/g)).toHaveLength(2);
    // printed: 66 over its bar over 78 — never « 66/78 » as text
    expect(html).toMatch(/<b>66<\/b><span class="di-frac__bar"[^>]*><\/span><b>78<\/b>/);
    // typed: the numerator's box, the bar, the denominator's box — the hooks of every box, no label under them
    const n = html.indexOf('data-rf-use="n"');
    const bar = html.indexOf('di-frac__bar', html.indexOf('di-frac--typed'));
    const d = html.indexOf('data-rf-use="d"');
    expect(n).toBeGreaterThan(-1);
    expect(n).toBeLessThan(bar);
    expect(bar).toBeLessThan(d);
    // each box carries its own label (forgeBlocks.js › fractionBox) as its name, never printed under it
    const { n: num, d: den } = typedBox.frac;
    expect(num.label).toBeTruthy();
    expect(html).toContain(`aria-label="${num.label}"`);
    expect(html).toContain(`aria-label="${den.label}"`);
    expect(html).toContain('value="11"');
    expect(html).not.toContain(`<small>${num.label}</small>`);
  });

  it('a box beside fractions keeps its label on a one-line step; lines without a fraction draw as before', () => {
    const one = draw([line(['PGCD', '=', slot('g', 'PGCD', 2), givenFraction(5, 39), '=', fractionBox()])]);
    expect(one).toContain('<small>PGCD</small>');
    const plain = draw([
      line(['78', '=', slot('q', 'le quotient', 2)]),
      line(['PGCD(66 ; 78)', '=', slot('g', 'PGCD', 2)]),
    ]);
    expect(plain).not.toContain('di-frac');
    expect(plain).toContain('data-rf-lines="2"');
    expect(plain).toContain('<b>78</b><b>=</b><label><input');
  });

  it('the boxes of a line, in reading order: a fraction gives its numerator’s box, then its denominator’s', () => {
    const tokens = [
      givenFraction(5, 39),
      '+',
      slot('a', 'x', 2),
      '=',
      fractionBox('s', 'w'),
      '=',
      fractionBox('n', 'd'),
    ];
    expect(boxesOf(tokens).map((t) => t.slot)).toEqual(['a', 's', 'w', 'n', 'd']);
    expect(boxesOf([givenFraction(1, 3)])).toEqual([]);
    expect(fractionBox('n', 'd', { nw: 2, dw: 3 }).frac.d.w).toBe(3);
  });
});

// The rule a student writes is the forge's `frame` + one tile per slot, IN SLOT ORDER, read left to right (French): the
// frame first, slot 1 on the left of slot 2 — nothing placed in the Arabic word order, nothing reversed.
describe('the forge’s rule — frame and tiles in reading order, left to right', () => {
  const forge = {
    key: 'toy',
    slots: [
      { id: 'q', label: 'Ce que je lis', options: [{ id: 'r', label: 'le reste' }] },
      { id: 'c', label: 'Ce qu’il doit être', options: [{ id: 'zero', label: 'est égal à 0' }] },
    ],
    text: {
      title: 'Le miroir',
      sub: 'Forge ta règle',
      log: 'Tes essais',
      frame: 'Le pont tient quand',
      buildLead: '…',
    },
    caseId: (c) => c.id,
    evidence: (rows) => rows ?? [],
    predictCases: () => [],
  };
  const game = {
    subscribe: () => () => {},
    getState: () => ({ sound: false }),
    setSound: () => {},
    audio: { play: () => {} },
  };
  const parts = { Mirror: () => null, Line: () => null };
  const draw = () => renderToString(<RuleForge forge={forge} parts={parts} game={game} log={[]} onSeal={() => {}} />);

  it('opens on the tiles (no case to predict) and writes the frame, then slot 1, then slot 2', () => {
    const html = draw();
    expect(html).toContain('data-rf="build"');
    const frame = html.indexOf('Le pont tient quand');
    const first = html.indexOf('data-rf-slot="q"');
    const second = html.indexOf('data-rf-slot="c"');
    expect(frame).toBeGreaterThan(-1);
    expect(frame).toBeLessThan(first);
    expect(first).toBeLessThan(second);
    // the tiles of slot 1 come before those of slot 2
    expect(html.indexOf('data-rf-slot-tiles="q"')).toBeLessThan(html.indexOf('data-rf-slot-tiles="c"'));
  });

  it('no right-to-left anywhere: no dir="rtl", no reversed row, and the forge’s words are French', () => {
    const html = draw();
    expect(html).not.toContain('dir="rtl"');
    expect(html).not.toMatch(/row-reverse|direction:\s*rtl/);
    expect(html).toContain('Écris ta règle');
    expect(html).toContain('Aide-moi, Zéro');
    expect(html).not.toMatch(/\p{Script=Arabic}/u);
    const css = readFileSync(fileURLToPath(new URL('./ruleForge.css', import.meta.url)), 'utf8');
    expect(css).not.toMatch(/row-reverse|direction:\s*rtl/);
  });
});
