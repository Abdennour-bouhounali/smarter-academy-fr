// THE FELUCCA'S LEGS of triangles-semblables: two legs keyed by the dock they leave (1, 3), every buoy ONE bare
// calculation (owner, 2026-11-27) — no letter of a point, no figure —, its right gate recomputed HERE from the
// calculation the order writes, a true fact for every buoy, the numbers the platform's own.
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rng } from '../../../../../../common/gameworld/kit/random';
import {
  plain,
  said,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import {
  linesWithBoth,
  pairLines,
  readBank,
  storiesOf,
} from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { GENERATORS, LEG_MIX, LEGS, SPARE, THINK, fairWave, gateOption, isRight, roundOf } from './run';
import { K, equal, minus, over, plus, times, write } from './math';

const ID = 'triangles-semblables';
const KINDS = Object.keys(GENERATORS);
const here = dirname(fileURLToPath(import.meta.url));
const PRACTICE = join(here, '../../../../../../../../../../content/practice/3e');
/** Every wave of every kind, both levels, over many seeds. */
const waves = (seeds = 60) =>
  KINDS.flatMap((kind) =>
    [{}, { hard: true }].flatMap((params, h) =>
      Array.from({ length: seeds }, (_, s) => fairWave(rng((s + 1) * 7919 + kind.length + h * 13), kind, params)),
    ),
  );

/**
 * The exact value of a calculation of numbers (« \dfrac{6}{9} », « 9 \div 6 », « 6 \times 1{,}5 », « 180 - 65 - 48 »),
 * computed HERE (never by `run.js`): + − × ÷ with their priorities, a fraction as a quotient. Throws on anything else.
 */
function calc(texText) {
  let s = String(texText)
    .replace(/\{,\}/g, ',')
    .replace(/\\,/g, '')
    .replace(/\^\\circ/g, '');
  for (let n = 0; n < 4; n += 1) s = s.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  s = s.replace(/\\times/g, '*').replace(/\\div/g, '/');
  const tokens = s.match(/\d+(?:,\d+)?|[-+*/()]|\S/g) ?? [];
  let i = 0;
  const atom = () => {
    const t = tokens[i++];
    if (t === '(') {
      const v = sum();
      if (tokens[i++] !== ')') throw new Error(`calc: ${texText}`);
      return v;
    }
    if (!/^\d+(,\d+)?$/.test(t ?? '')) throw new Error(`calc: « ${t} » in ${texText}`);
    return t;
  };
  const product = () => {
    let v = atom();
    while (tokens[i] === '*' || tokens[i] === '/') v = tokens[i++] === '*' ? times(v, atom()) : over(v, atom());
    return v;
  };
  const sum = () => {
    let v = product();
    while (tokens[i] === '+' || tokens[i] === '-') v = tokens[i++] === '+' ? plus(v, product()) : minus(v, product());
    return v;
  };
  const v = sum();
  if (i !== tokens.length) throw new Error(`calc: ${texText}`);
  return write(v);
}
/** A gate written in a formula: « 1,5 » → « 1{,}5 ». */
const asTex = (g) => String(g).replace(',', '{,}');
/** Does the order hold with gate g? « Calcule »: the calculation is worth g; « Complète »: the box filled, both sides equal. */
function holds(w, g) {
  if (w.say === 'Calcule') return equal(calc(w.tex), String(g));
  const [l, r] = w.tex.replace('\\square', asTex(g)).split('=');
  return equal(calc(l), calc(r));
}
/** The numbers of ten and more a calculation writes, as pairs — recomputed HERE. */
const bigPairs = (t) => {
  const big = [...t.replace(/\{,\}/g, ',').matchAll(/\d+(?:,\d+)?/g)]
    .map((m) => Number(m[0].replace(',', '.')))
    .filter((x) => x >= 10);
  return big.flatMap((x, i) => big.slice(i + 1).map((y) => [x, y])).filter(([x, y]) => x !== y);
};

describe(`${ID} — the felucca’s legs`, () => {
  it('two legs, keyed by the dock they leave (1: workshop → summit, 3: summit → plateau), four buoys each', () => {
    expect(Object.keys(LEGS)).toEqual(['1', '3']);
    const keyOf = { 1: K.cotes, 3: K.angles };
    for (const i of [1, 3]) {
      const leg = LEGS[i];
      expect(leg.total).toBe(4);
      expect(leg.levels).toHaveLength(1);
      for (let n = 0; n < 8; n += 1) {
        const r = leg.round(1, rng(i * 31 + n + 1), n);
        expect(r.options).toHaveLength(3);
        expect(r.why).toHaveLength(3);
        expect(r.right).toBeGreaterThanOrEqual(0);
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

  it('leg 1 computes what the sides’ exercises compute, leg 3 what the angles’ do', () => {
    expect(LEG_MIX[1].map(([kind]) => kind)).toEqual(['quatrieme', 'coefficient']);
    expect(LEG_MIX[3].map(([kind]) => kind)).toEqual(['troisieme', 'complement']);
    const shape = {
      quatrieme: /^\\dfrac\{\d\}\{\d\} = \\dfrac\{\d+\}\{\\square\}$/,
      coefficient: /^\d \\div \d$/,
      cote: /^\d \\times \d\{,\}\d+$/,
      troisieme: /^180 - \d+ - \d+$/,
      complement: /^\d+ \+ \d+ \+ \\square = 180$/,
    };
    expect(Object.keys(shape).sort()).toEqual([...KINDS].sort());
    for (const w of waves(20)) {
      expect(w.tex, w.type).toMatch(shape[w.type]);
      expect(w.key, w.type).toBe(['troisieme', 'complement'].includes(w.type) ? K.angles : K.cotes);
    }
  });

  it('the second level is harder: angles whose sum does not end in 0, a fraction across, a coefficient of hundredths', () => {
    const angles = (w) => [...w.tex.matchAll(/\d+/g)].map(Number).filter((x) => x !== 180);
    for (let s = 1; s <= 40; s += 1) {
      for (const kind of ['troisieme', 'complement']) {
        const [a, b] = angles(fairWave(rng(s), kind, {}));
        const [c, d] = angles(fairWave(rng(s), kind, { hard: true }));
        expect((a + b) % 10).toBe(0);
        expect((c + d) % 10).not.toBe(0);
      }
      const [a, , c] = fairWave(rng(s), 'quatrieme', { hard: true }).tex.match(/\d+/g).map(Number);
      expect(c % a).not.toBe(0);
      const [x, , z] = fairWave(rng(s), 'quatrieme', {}).tex.match(/\d+/g).map(Number);
      expect(z % x).toBe(0);
      expect(String(fairWave(rng(s), 'coefficient', {}).gates.find((g, i, all) => i === all.length))).toBe('undefined');
      const easy = fairWave(rng(s), 'coefficient', {});
      expect(String(easy.gates[easy.good])).toMatch(/^\d+(,5)?$/);
      const hard = fairWave(rng(s), 'coefficient', { hard: true });
      expect(String(hard.gates[hard.good])).not.toMatch(/^\d+(,5)?$/);
    }
  });

  it('every buoy is ONE bare calculation: an order of one word, no letter of a point, no figure, a short thinking time', () => {
    for (const w of waves()) {
      expect(['Complète', 'Calcule'], w.say).toContain(w.say);
      expect(w.say === 'Complète', w.tex).toBe(w.tex.includes('\\square'));
      // no letter in the calculation once its commands (\dfrac, \times, \div, \square) are set aside
      expect(w.tex.replace(/\\[a-zA-Z]+/g, ''), w.tex).not.toMatch(/[A-Za-z]/);
      expect(w.tex, w.tex).not.toMatch(/\$|\?/);
      expect(w.figure, w.tex).toBeUndefined();
      expect('figure' in roundOf(w), w.tex).toBe(false);
      expect(THINK[w.type]).toBeGreaterThanOrEqual(8);
      expect(THINK[w.type]).toBeLessThanOrEqual(12);
      expect(w.seconds).toBe(THINK[w.type] + SPARE);
    }
    expect(SPARE).toBe(5);
  });

  it('every buoy: exactly ONE right gate — the one the calculation itself gives — and no wrong buoy holds', () => {
    const seen = new Set();
    for (const w of waves()) {
      seen.add(w.type);
      const tag = `${w.type} ${w.tex} ${JSON.stringify(w.gates)}`;
      expect(
        w.gates.filter((g) => isRight(w, g)),
        tag,
      ).toHaveLength(1);
      expect(
        w.gates.map((g) => holds(w, g)),
        tag,
      ).toEqual(w.gates.map((_, i) => i === w.good));
      if (w.say === 'Calcule') expect(write(String(w.gates[w.good])), tag).toBe(calc(w.tex));
      expect(new Set(w.gates.map((g) => write(String(g)))).size, tag).toBe(3);
      for (const g of w.gates) {
        expect(String(g), tag).toMatch(/^\d+(,\d+)?$/);
        expect(String(g).length, tag).toBeLessThanOrEqual(6);
        expect(gateOption(g)).toEqual({ t: String(g) });
      }
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('a FACT for every buoy (never « faux »), French, every equality it writes true — and a wrong one never writes the answer', () => {
    let checked = 0;
    for (const w of waves(30)) {
      const r = roundOf(w);
      const right = write(String(w.gates[w.good]));
      r.why.forEach((line, i) => {
        expect(line, w.tex).toBeTruthy();
        expect(line).not.toMatch(/faux|erreur|undefined|NaN|null/i);
        said(line);
        expect(typographyErrors(line), line).toEqual([]);
        expect(line.replace(/\$[^$]*\$/g, ''), line).not.toMatch(/\d\s*\/\s*\d/);
        trueEqualities(line);
        const formulas = [...line.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
        expect(formulas.length, line).toBeGreaterThan(0);
        for (const f of formulas) {
          const sides = f.split('=').map(calc);
          for (const v of sides.slice(1)) expect(v, `${f} — ${line}`).toBe(sides[0]);
          checked += sides.length - 1;
          // the hint of a wrong buoy (the trainer shows it before the answer) never writes the right number alone
          if (i !== w.good && sides.length > 1)
            for (const side of f.split('=')) expect(side.trim(), line).not.toBe(right.replace(',', '{,}'));
        }
      });
    }
    expect(checked).toBeGreaterThan(300);
  });
});

describe(`${ID} — the numbers of the legs are the platform’s own`, () => {
  it('no pair of numbers of ten and more a calculation shows (180 too) stands on one line of any bank or of another lesson’s story', () => {
    const stories = storiesOf({ exceptId: ID });
    const banks = readdirSync(PRACTICE, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => readBank(d.name));
    const pairs = new Set();
    for (const w of waves(40)) {
      // the wave's own `pairs` are the ones its calculation shows
      expect(w.pairs, w.tex).toEqual(bigPairs(w.tex));
      for (const [a, b] of bigPairs(w.tex)) pairs.add([a, b].sort((x, y) => x - y).join(';'));
    }
    // the angles' buoys show three each (180 and two angles): every one is read
    expect(pairs.size).toBeGreaterThan(30);
    expect([...pairs].some((p) => p.endsWith(';180'))).toBe(true);
    for (const key of pairs) {
      const [a, b] = key.split(';');
      for (const bank of banks) expect(linesWithBoth(bank, a, b), `${key} in ${bank.id}`).toEqual([]);
      for (const s of stories) expect(pairLines(s.text, a, b), `${key} in ${s.file}`).toEqual([]);
    }
  });
});
