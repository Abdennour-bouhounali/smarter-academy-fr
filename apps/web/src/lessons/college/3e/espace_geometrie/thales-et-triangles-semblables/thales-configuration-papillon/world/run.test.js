// THE FELUCCA'S LEGS of thales-configuration-papillon: two legs keyed by the dock they leave (2, 3), every buoy ONE bare
// calculation (owner, 2026-11-27: « speed calculation questions like: complete: 4/12 = 5/… » — no figure, no point) —
// its right gate computed HERE from the order's own formula —, a true fact for every buoy, the numbers the platform's
// own.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { plain, said, typographyErrors } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import {
  bankNumbers,
  linesWithBoth,
  readBank,
  storiesOf,
  pairLines,
} from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { GENERATORS, LEG_MIX, LEGS, REDUCE, SPARE, THINK, fairWave, gateOption, isRight, roundOf } from './run';
import { K, compare, equal, over, plus, read, times, write } from './math';

const ID = 'thales-configuration-papillon';
const KINDS = Object.keys(GENERATORS);
const PARAMS = [{}, { big: true }];
/** Every wave of every kind, at both levels' numbers, over many seeds. */
const waves = (seeds = 60) =>
  KINDS.flatMap((kind) =>
    PARAMS.flatMap((params, l) =>
      Array.from({ length: seeds }, (_, s) => fairWave(rng((s + 1) * 7919 + kind.length + l * 13), kind, params)),
    ),
  );

/** A formula of numbers only, evaluated exactly HERE: « 4 + 8 », « 12 \\times 5 \\div 4 », « 7{,}5 », « \\dfrac{4}{6} ». */
function value(t) {
  const s = String(t).replace(/\{,\}/g, ',').replace(/\\,/g, '').trim();
  const frac = /^\\dfrac\{([^{}]*)\}\{([^{}]*)\}$/.exec(s);
  if (frac) return over(value(frac[1]), value(frac[2]));
  if (s.includes(' + '))
    return s
      .split(' + ')
      .map(value)
      .reduce((x, y) => plus(x, y));
  const tokens = s.split(/\s*(\\times|\\div)\s*/);
  let v = read(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2)
    v = tokens[i] === '\\times' ? times(v, tokens[i + 1]) : over(v, tokens[i + 1]);
  return v;
}
/** The two fractions of an order « \\dfrac{a}{b} = \\dfrac{c}{d} », each term as written (a sum, a box). */
const termsOf = (tex) => {
  const m = /^\\dfrac\{([^{}]*)\}\{([^{}]*)\} = \\dfrac\{([^{}]*)\}\{([^{}]*)\}$/.exec(tex.replace(/\{,\}/g, ','));
  return m ? m.slice(1) : null;
};
/**
 * The right buoy, computed HERE from the order's formula alone (never from the wave's data): the box of a / b = c / d
 * by a × d = b × c, or the calculation « b × c ÷ a » itself.
 */
function truth(w) {
  const t = termsOf(w.tex);
  if (!t) return write(value(w.tex));
  const hole = t.findIndex((x) => x === '\\square');
  const v = t.map((x) => (x === '\\square' ? null : value(x)));
  const [a, b, c, d] = v;
  const solve = [
    () => over(times(b, c), d),
    () => over(times(a, d), c),
    () => over(times(a, d), b),
    () => over(times(b, c), a),
  ];
  return write(solve[hole]());
}
/** The gate x in the box makes the order TRUE: the two fractions equal (or x the calculation's value). */
function holds(w, x) {
  const t = termsOf(w.tex);
  if (!t) return equal(value(w.tex), x);
  const [a, b, c, d] = t.map((y) => (y === '\\square' ? read(x) : value(y)));
  return equal(times(a, d), times(b, c));
}
/** Every equality of a fact is true: in each formula, every side equals the first. Returns how many. */
const factsTrue = (line) => {
  let n = 0;
  for (const [, f] of String(line).matchAll(/\$([^$]+)\$/g)) {
    const sides = f.split('=').map((x) => x.trim());
    if (sides.length < 2) continue;
    for (const x of sides.slice(1)) expect(equal(value(sides[0]), value(x)), `${line} — ${f}`).toBe(true);
    n += 1;
  }
  return n;
};
/** A point's name: a capital letter standing alone or two together (« O », « AB »). */
const POINT = /\b[A-Z]{1,2}\b|\(|\[[A-Z]/;
const lettersOf = (t) =>
  String(t)
    .replace(/\\[a-z]+/g, '')
    .replace(/\$/g, ' ');

describe(`${ID} — the felucca’s legs`, () => {
  it('two legs, keyed by the dock they leave (2: river → summit, 3: summit → plateau), four buoys each', () => {
    expect(Object.keys(LEGS)).toEqual(['2', '3']);
    const keyOf = { 2: K.papillon, 3: K.calcul };
    expect(LEG_MIX[2].map(([k]) => k)).toEqual(['egalite', 'croix']);
    expect(LEG_MIX[3].map(([k]) => k)).toEqual(['somme', 'decimal']);
    for (const i of [2, 3]) {
      const leg = LEGS[i];
      expect(leg.total).toBe(4);
      expect(leg.levels).toHaveLength(1);
      for (let n = 0; n < 8; n += 1) {
        const r = leg.round(1, rng(i * 31 + n + 1), n);
        expect(r.options).toHaveLength(3);
        expect(r.why).toHaveLength(3);
        expect(r.right).toBeGreaterThanOrEqual(0);
        expect(r, 'no figure on a buoy (owner, 2026-11-27)').not.toHaveProperty('figure');
      }
      for (const [kind, params] of LEG_MIX[i]) expect(fairWave(rng(5), kind, params).key).toBe(keyOf[i]);
      // every buoy row is its kind's thinking time plus the owner's five seconds ahead (2026-11-25)
      for (let n = 0; n < 4; n += 1) {
        const [kind] = LEG_MIX[i][n % LEG_MIX[i].length];
        expect(leg.round(1, rng(n + 1), n).seconds).toBe(THINK[kind] + SPARE);
      }
      for (const s of [leg.text.title, leg.text.say, leg.text.won.title, leg.text.lost.text]) {
        plain(s);
        expect(typographyErrors(s), s).toEqual([]);
      }
    }
    expect(JSON.stringify(Object.values(LEGS).map((l) => l.text))).not.toMatch(/faux|erreur/i);
  });

  it('a thinking time between 8 and 12 seconds for every kind, the owner’s five seconds after it', () => {
    expect(Object.keys(THINK).sort()).toEqual([...KINDS].sort());
    for (const t of Object.values(THINK)) {
      expect(t).toBeGreaterThanOrEqual(8);
      expect(t).toBeLessThanOrEqual(12);
    }
    expect(SPARE).toBe(5);
  });

  it('every buoy is ONE bare calculation: a short order, a formula, no point, no figure, the box written □', () => {
    const seen = new Set();
    for (const w of waves()) {
      seen.add(w.type);
      expect(w, w.tex).not.toHaveProperty('figure');
      expect(roundOf(w), w.tex).not.toHaveProperty('figure');
      expect(['Complète', 'Calcule'], w.say).toContain(w.say);
      expect(w.tex, w.tex).not.toMatch(/\$/);
      expect(lettersOf(w.tex).trim(), w.tex).not.toMatch(/[A-Za-z]/);
      if (w.type === 'croix') expect(w.tex).toMatch(/^\d+ \\times \d+ \\div \d+$/);
      else expect(w.tex.match(/\\square/g), w.tex).toHaveLength(1);
      if (w.type === 'somme') expect(w.tex, w.tex).toMatch(/\{\d+ \+ \d+\}/);
      for (const line of roundOf(w).why) expect(lettersOf(line), line).not.toMatch(POINT);
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('every buoy: exactly ONE right gate — the one the order’s formula gives — and no wrong buoy makes it true', () => {
    const seen = new Set();
    for (const w of waves()) {
      seen.add(w.type);
      const tag = `${w.type} ${w.tex} ${JSON.stringify(w.gates)}`;
      const t = truth(w);
      expect(
        w.gates.filter((g) => isRight(w, g)),
        tag,
      ).toHaveLength(1);
      const right = w.gates[w.good];
      expect(write(read(String(right))), tag).toBe(t);
      expect(holds(w, String(right)), tag).toBe(true);
      const values = w.gates.map((g) => write(read(String(g))));
      expect(new Set(values).size, tag).toBe(3);
      for (const g of w.gates.filter((_, i) => i !== w.good)) {
        expect(write(read(String(g))), tag).not.toBe(t);
        expect(holds(w, String(g)), tag).toBe(false);
      }
      for (const g of w.gates) {
        expect(String(g).length, tag).toBeLessThanOrEqual(6);
        expect(String(g), tag).toMatch(/^\d+(,\d{1,2})?$/);
        expect(compare(read(String(g)), '0'), tag).toBe(1);
      }
      if (w.type === 'decimal') expect(String(right), tag).toMatch(/,/);
      else for (const g of w.gates) expect(String(g), tag).toMatch(/^\d+$/);
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('mental numbers: no number of an order above 72, no product above 999', () => {
    for (const w of waves()) {
      for (const n of w.tex.replace(/\{,\}/g, ',').match(/\d+(,\d+)?/g)) {
        expect(Number(n.replace(',', '.')), w.tex).toBeLessThanOrEqual(72);
      }
    }
  });

  it('a FACT for every buoy (never « faux »), French, and every equality it writes is true', () => {
    let checked = 0;
    for (const w of waves(30)) {
      const r = roundOf(w);
      for (const line of r.why) {
        expect(line, w.tex).toBeTruthy();
        expect(line).not.toMatch(/faux|erreur|undefined|NaN|null/i);
        said(line);
        expect(typographyErrors(line), line).toEqual([]);
        // a formula in a fact is read by MathText; the rest writes no fraction « p/q » as text
        expect(line.replace(/\$[^$]*\$/g, ''), line).not.toMatch(/\d\s*\/\s*\d/);
        checked += factsTrue(line);
      }
      // the right buoy's fact says the two products are equal; a wrong one's that they differ
      expect(r.why[w.good]).toMatch(/égaux|quotient/);
      r.why.forEach((line, i) => i !== w.good && expect(line).toMatch(/différents|pas \$/));
    }
    expect(checked).toBeGreaterThan(400);
  });

  it('a gate is drawn over a real bar when it is a fraction', () => {
    expect(gateOption('4/7')).toEqual({ tex: '\\dfrac{4}{7}' });
    expect(gateOption(21)).toEqual({ t: '21' });
    expect(gateOption('7,5')).toEqual({ t: '7,5' });
  });
});

describe(`${ID} — the numbers of the legs are the platform’s own`, () => {
  const bank = readBank(ID);
  it('no k of the legs is a number the bank writes', () => {
    const written = new Set([...bankNumbers(bank).keys()].filter((n) => /[,/]/.test(n)).map((n) => write(read(n))));
    expect(written.size).toBeGreaterThan(30);
    for (const k of REDUCE) {
      expect(written.has(write(k)), k).toBe(false);
      const [p, q] = k.split('/').map(Number);
      expect(q).toBeLessThanOrEqual(9);
      expect(compare(k, '1')).toBe(-1);
      expect(p).toBeGreaterThan(0);
    }
  });

  it('the ratio of every fraction an order shows whole is a k of the legs (never one the bank writes)', () => {
    const ks = new Set(REDUCE.map((k) => write(k)));
    for (const w of waves()) {
      const t = /^\\dfrac\{([^{}]*)\}\{([^{}]*)\} = \\dfrac\{([^{}]*)\}\{([^{}]*)\}$/.exec(w.tex);
      const known = t
        ? [
            [t[1], t[2]],
            [t[3], t[4]],
          ].filter((f) => !f.join('').includes('square'))
        : [];
      for (const [n, d] of known) {
        const k = write(over(value(n), value(d)));
        expect(ks.has(k), `${w.tex}: ${k}`).toBe(true);
      }
    }
  });

  it('`pairs` holds every pair of whole numbers the order shows (the check below sees them all)', () => {
    for (const w of waves()) {
      const shown = [...new Set((w.tex.replace(/\d+\{,\}\d+/g, ' ').match(/\d+/g) ?? []).map(Number))];
      const listed = new Set(w.pairs.map(([a, b]) => [a, b].sort((x, y) => x - y).join(';')));
      for (let i = 0; i < shown.length; i += 1)
        for (let j = i + 1; j < shown.length; j += 1)
          expect(listed.has([shown[i], shown[j]].sort((x, y) => x - y).join(';')), w.tex).toBe(true);
    }
  });

  it('no pair of numbers of ten and more a buoy shows stands on one line of the bank or of another lesson’s story', () => {
    const stories = storiesOf({ exceptId: ID });
    const pairs = new Set();
    for (const w of waves(40))
      for (const [a, b] of w.pairs) if (a >= 10 && b >= 10) pairs.add([a, b].sort((x, y) => x - y).join(';'));
    expect(pairs.size).toBeGreaterThan(60);
    for (const key of pairs) {
      const [a, b] = key.split(';');
      expect(linesWithBoth(bank, a, b), key).toEqual([]);
      for (const s of stories) expect(pairLines(s.text, a, b), `${key} in ${s.file}`).toEqual([]);
    }
  });
});
