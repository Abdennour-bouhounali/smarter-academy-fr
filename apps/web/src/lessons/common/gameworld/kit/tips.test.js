import { describe, it, expect } from 'vitest';
import { divisionTip, productTip, ruleTip } from './tips';

/** Every equality written between dollar signs in a tip is re-computed: a tip never writes something false. */
function verify(tip) {
  for (const m of tip.matchAll(/\$([^$]+)\$/g)) {
    const sides = m[1]
      .replaceAll('\\times', '*')
      .split('=')
      .map((x) => x.trim());
    if (sides.length < 2) continue;
    // eslint-disable-next-line no-new-func
    const values = sides.map((expr) => Function(`"use strict"; return (${expr});`)());
    for (const v of values) expect(v, `${m[1]} in « ${tip} »`).toBe(values[0]);
  }
}

describe('Astuce — the calculation shortcuts', () => {
  it("gives the owner's example: 180 ÷ 19 through 19 × 10", () => {
    const t = divisionTip(180, 19);
    expect(t).toContain('19 \\times 10 = 190');
    expect(t).toContain('190 - 19 = 171');
    expect(t).toContain('De 171 à 180, il reste 9\u00a0: le reste est 9.');
  });

  it('leans on a round product: up, down, or a round part then the rest', () => {
    expect(divisionTip(756, 36)).toContain('36 \\times 20 = 720');
    expect(divisionTip(756, 36)).toContain('720 + 36 = 756');
    expect(divisionTip(756, 36)).toContain('le reste est 0');
    expect(divisionTip(360, 24)).toContain('24 \\times 10 = 240');
    expect(divisionTip(360, 24)).toContain('24 \\times 5 = 120');
    expect(divisionTip(756, 32)).toContain('le reste est');
    expect(divisionTip(152, 19)).toContain('190 - 19 = 171'); // 8 = 10 − 2: two steps down
    expect(divisionTip(152, 19)).toContain('171 - 19 = 152');
  });

  it('never writes a false equality, and states the true remainder', () => {
    let given = 0;
    for (let b = 2; b <= 40; b += 1)
      for (let a = b; a <= 1000; a += 7) {
        const t = divisionTip(a, b);
        if (!t) continue;
        given += 1;
        verify(t);
        expect(t).not.toMatch(/undefined|NaN/);
        if (t.includes('le reste'))
          expect(t.endsWith(`le reste est ${a % b}.`) || t.endsWith(`= ${a % b}$.`), `${a} ÷ ${b}: ${t}`).toBe(true);
      }
    expect(given).toBeGreaterThan(1000);
    for (let x = 11; x <= 99; x += 1)
      for (const y of [36, 150, 180, 1850, 4500]) {
        const t = productTip(x, y);
        if (t) {
          verify(t);
          expect(t).toContain(String(x * y));
        }
      }
  });

  it('stays silent when no shortcut is clearly simpler', () => {
    expect(divisionTip(42, 6)).toBe(null); // a product of the table: nothing to add
    expect(divisionTip(47, 7)).toBe(null);
    expect(divisionTip(5, 9)).toBe(null);
    expect(productTip(7, 150)).toBe(null);
    expect(productTip(20, 150)).toBe(null);
  });

  it('recalls a rule of divisibility when the divisor has one', () => {
    expect(ruleTip(756, 9)).toContain('7 + 5 + 6 = 18');
    expect(ruleTip(756, 9)).toContain('donc 756 est divisible par 9');
    expect(ruleTip(143, 3)).toContain('donc 143 n’est pas divisible par 3');
    expect(ruleTip(135, 5)).toContain('c’est 0 ou 5, donc 135 est divisible par 5');
    expect(ruleTip(48, 7)).toBe(null);
    expect(divisionTip(48, 9)).toContain('4 + 8 = 12'); // a small quotient, but a rule exists for 9
  });

  it('writes the product of an invoice the way it is done in the head', () => {
    expect(productTip(21, 1850)).toBe(
      'Je décompose 21 en 20 + 1\u00a0: $20 \\times 1850 + 1 \\times 1850 = 37000 + 1850 = 38850$.',
    );
    expect(productTip(19, 150)).toBe('$19 \\times 150 = 20 \\times 150 - 1 \\times 150 = 3000 - 150 = 2850$.');
  });
});
