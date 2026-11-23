// The forge's last step (`RuleForge.jsx › UseLines`): a power is typed in its own shape — the token
// `{ pow: { base, exp } }` (forgeBlocks.js › powerBox / givenPower) is ONE block, the base then the exponent RAISED after
// it (a `sup`), as live text; a typed exponent is a box named « exposant », after the base in the keyboard's order; a
// printed power is drawn in the same shape. A line without a power draws as before. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { UseLines } from './RuleForge';
import { givenPower, line, powerBox } from './authoring/forgeBlocks';
import { slot } from './forge';

globalThis.window = globalThis.window ?? {};

const draw = (lines, vals = {}) =>
  renderToString(<UseLines lines={lines} vals={vals} onType={() => {}} />).replaceAll('<!-- -->', '');

describe('the forge’s last step — a power in its own shape', () => {
  it('1 400 = 2^□ × 5^□ × 7: each exponent a raised box named « exposant », its base printed before it', () => {
    const html = draw([line(['1 400', '=', powerBox(2, 'e2'), '×', powerBox(5, 'e5'), '×', '7'])], { e2: '3' });
    const blocks = html.match(/<span class="rf-pow(?: rf-pow--typed)?"[^>]*>/g);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain('data-rf-pow="2^e2"');
    expect(blocks[0]).toContain('rf-pow--typed');
    expect(blocks[0]).toContain('dir="ltr"');
    // the base, then the exponent in a raised `sup` holding the box: live DOM text, not a picture, not « 2^3 »
    expect(html).toMatch(
      /<span class="rf-pow__base"><b>2<\/b><\/span><sup class="rf-pow__exp"><label><input[^>]*aria-label="exposant"[^>]*data-rf-use="e2"/,
    );
    expect(html).toContain('value="3"');
    expect(html.match(/aria-label="exposant"/g)).toHaveLength(2);
    expect(html).not.toContain('<small>exposant</small>'); // the name is the box's, never printed under a raised box
    expect(html).not.toMatch(/<b>[^<]*(\^|\*\*)[^<]*<\/b>/); // never « 2^3 » as text
    // reading order = keyboard order: e2 before e5, each after its base
    expect(html.indexOf('data-rf-use="e2"')).toBeLessThan(html.indexOf('data-rf-use="e5"'));
    expect(html.indexOf('<b>5</b>')).toBeLessThan(html.indexOf('data-rf-use="e5"'));
  });

  it('a typed base and a typed exponent: the base’s box first; a printed power is the same shape with no box', () => {
    const html = draw([line(['72', '=', powerBox(slot('p', 'le facteur', 1), 'k'), '×', givenPower(3, 2)])]);
    const p = html.indexOf('data-rf-use="p"');
    const sup = html.indexOf('rf-pow__exp');
    const k = html.indexOf('data-rf-use="k"');
    expect(p).toBeGreaterThan(-1);
    expect(p).toBeLessThan(sup);
    expect(sup).toBeLessThan(k);
    expect(html).toContain('aria-label="le facteur"');
    expect(html).toContain('data-rf-pow="p^k"');
    expect(html).toContain('data-rf-pow="3^2"');
    expect(html).toMatch(
      /<span class="rf-pow" dir="ltr" data-rf-pow="3\^2"><span class="rf-pow__base"><b>3<\/b><\/span><sup class="rf-pow__exp"><b>2<\/b><\/sup><\/span>/,
    );
  });

  it('a one-line step keeps the label under a lone box beside powers; lines without a power draw as before', () => {
    const one = draw([line([slot('n', 'le nombre', 4), '=', givenPower(2, 3), '×', '7'])]);
    expect(one).toContain('<small>le nombre</small>');
    const plain = draw([
      line(['78', '=', slot('q', 'le quotient', 2)]),
      line(['PGCD(66 ; 78)', '=', slot('g', 'PGCD', 2)]),
    ]);
    expect(plain).not.toContain('rf-pow');
    expect(plain).toContain('<b>78</b><b>=</b><label><input');
  });
});

// A ladder of divisions is read from top to bottom: a forge that asks its four lines in ONE column (`use.column`) gets
// `data-rf-column`, which the two-column grid of four lines leaves alone (first French lesson, the ladder of 126).
describe('the forge’s last step — four lines in one column when the forge asks it', () => {
  const four = [0, 1, 2, 3].map((i) =>
    line([i ? slot(`n${i + 1}`, 'ce qui reste', 2) : '126', '|', slot(`d${i + 1}`, 'la planche', 2)]),
  );
  it('by default four lines are laid in two columns; `column` keeps them in one', () => {
    const two = renderToString(<UseLines lines={four} vals={{}} onType={() => {}} />);
    expect(two).toContain('data-rf-lines="4"');
    expect(two).not.toContain('data-rf-column');
    const one = renderToString(<UseLines lines={four} vals={{}} onType={() => {}} column />);
    expect(one).toContain('data-rf-column');
    const css = readFileSync(fileURLToPath(new URL('./ruleForge.css', import.meta.url)), 'utf8');
    expect(css).toMatch(
      /\.rf-uselines\[data-rf-lines='4'\]:not\(\[data-rf-column\]\) \{\s*grid-template-columns: 1fr 1fr;/,
    );
  });
});
