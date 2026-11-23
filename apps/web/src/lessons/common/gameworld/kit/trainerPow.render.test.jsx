// « Entraîne-toi » — the POWER template of an exam form (`Trainer.jsx › FormLines`, a token `{ pow: { base, exp } }`):
// the base, then the exponent RAISED after it in a `sup` — the forge's shape (`RuleForge.jsx › UseLines`,
// `span.rf-pow > span.rf-pow__base + sup.rf-pow__exp`) with the trainer's own classes (`di-pow`). A typed exponent keeps
// the hooks of every box; a printed power is printed in the same shape; a line without a power draws as before. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FormLines } from './Trainer';
import { UseLines } from './RuleForge';
import { givenPower, powerBox } from './authoring/forgeBlocks';

globalThis.window = globalThis.window ?? {};

const draw = (lines, v = {}) =>
  renderToString(<FormLines lines={lines} v={v} set={() => () => {}} locked={false} />).replaceAll('<!-- -->', '');
const box = (num, label, w) => ({ num, label, ...(w ? { w } : {}) });
const typedPow = (p) => ({ pow: { base: String(p), exp: box(`e${p}`, `exposant de ${p}`, 2) } });

describe('the power template of the trainer’s sheet', () => {
  it('a typed exponent: ONE block — the printed base, then the exponent’s box in a sup, in that order', () => {
    const html = draw([{ ltr: true, tokens: ['72', '=', typedPow(2), '×', typedPow(3)] }], { e2: '3' });
    const blocks = html.match(/<span class="di-pow(?: [^"]*)?"[^>]*>/g);
    expect(blocks).toHaveLength(2);
    for (const b of blocks) {
      expect(b).toContain('di-pow--typed');
      expect(b).toContain('dir="ltr"');
    }
    expect(html).toContain('data-di-pow="2^e2"');
    expect(html).toContain('data-di-pow="3^e3"');
    // the same DOM as the forge: base span, then sup; the base printed, the exponent a box with its hooks
    expect(html).toMatch(
      /<span class="di-pow__base"><b>2<\/b><\/span><sup class="di-pow__exp"><input[^>]*data-di-tr="e2"[^>]*><\/sup>/,
    );
    expect(html).toContain('aria-label="exposant de 3"');
    expect(html).toContain('value="3"');
    // the box takes the width the lesson asks (w: 2 → 3.4ch), the line's other boxes keep theirs
    expect(html).toContain('width:3.4ch');
    // never the flat « 2 [ ] » of before, never « 2^3 » as text
    expect(html).not.toMatch(/<b[^>]*>2<\/b><input/);
    expect(html.replace(/<[^>]*>/g, '')).not.toContain('^');
  });

  it('a printed power: the same shape, nothing to type', () => {
    const html = draw([{ ltr: true, tokens: ['A', '=', { pow: { base: '2', exp: '3' } }] }]);
    expect(html).toMatch(
      /<span class="di-pow" dir="ltr" data-di-pow="2\^3"><span class="di-pow__base"><b>2<\/b><\/span><sup class="di-pow__exp"><b>3<\/b><\/sup><\/span>/,
    );
    expect(html).not.toContain('<input');
  });

  it('the same structure as the forge’s last step draws for powerBox / givenPower', () => {
    const forge = renderToString(
      <UseLines
        lines={[{ tokens: ['72', '=', powerBox('2', 'e2'), '×', givenPower(3, 2)] }]}
        vals={{}}
        onType={() => {}}
      />,
    );
    // forge: span.rf-pow > span.rf-pow__base + sup.rf-pow__exp — the trainer: span.di-pow > span.di-pow__base + sup.di-pow__exp
    const shape = (html, k) =>
      [...html.matchAll(new RegExp(`class="${k}(?:__(base|exp))?[^"]*"`, 'g'))].map((m) => m[1] ?? 'root');
    const sheet = draw([{ ltr: true, tokens: ['72', '=', typedPow(2), '×', { pow: { base: '3', exp: '2' } }] }]);
    expect(shape(sheet, 'di-pow')).toEqual(shape(forge, 'rf-pow'));
    expect(shape(sheet, 'di-pow')).toEqual(['root', 'base', 'exp', 'root', 'base', 'exp']);
    expect(forge.match(/<sup class="rf-pow__exp">/g)).toHaveLength(2);
    expect(sheet.match(/<sup class="di-pow__exp">/g)).toHaveLength(2);
  });

  it('inside a sentence (not ltr) the power is a block between the words; a line without a power is unchanged', () => {
    const html = draw([{ tokens: ['On écrit', typedPow(5), 'ici'] }]);
    expect(html).toMatch(/^<div class="di-sheet__line">On écrit <span class="di-pow di-pow--typed"/);
    const plain = draw([{ ltr: true, tokens: ['PGCD(66 ; 78)', '=', box('g', 'le diviseur')] }]);
    expect(plain).not.toContain('di-pow');
    expect(plain).toContain('width:4.4ch');
  });
});
