// THE FELUCCA'S LEGS of thales-configuration-papillon: two legs keyed by the dock they leave (2, 3), every buoy fair —
// its right gate computed HERE by the proportion itself —, a fact for every buoy, the numbers the platform's own.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import {
  plain,
  said,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import {
  bankNumbers,
  linesWithBoth,
  readBank,
  storiesOf,
  pairLines,
} from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { chainHolds, sameRatio } from '../../../../../../common/gameworld/kit/authoring/test/ratios';
import { GENERATORS, LEG_MIX, LEGS, REDUCE, SPARE, THINK, fairWave, gateOption, isRight, roundOf } from './run';
import { K, compare, read, write, times, over } from './math';
import { runFigure } from '../../../../../../common/gameworld/kit/trainerFigure';

const ID = 'thales-configuration-papillon';
const KINDS = Object.keys(GENERATORS);
/** Every wave of every kind, over many seeds. */
const waves = (seeds = 60) =>
  KINDS.flatMap((kind) =>
    Array.from({ length: seeds }, (_, s) => fairWave(rng((s + 1) * 7919 + kind.length), kind, {})),
  );
/** The numbers of a wave's order, read from its formula « OA = 6 \\quad OE = 14 … ». */
const given = (w) => Object.fromEntries([...w.tex.matchAll(/([A-Z]{2}) = (\d+)/g)].map(([, seg, n]) => [seg, n]));
/** k written in the order: « \\dfrac{3}{7} ». */
const kGiven = (w) => {
  const f = /\\dfrac\{(\d+)\}\{(\d+)\}/.exec(w.tex);
  return `${f[1]}/${f[2]}`;
};
/**
 * The right buoy, computed HERE from what the order shows, by the proportion itself (never by `truthOf`): the value x for
 * which the ratios of the figure are equal.
 */
function truth(w) {
  const g = given(w);
  switch (w.type) {
    case 'rapport':
      return write(times(g.OF, kGiven(w)));
    case 'longueur':
      return write(over(times(g.OE, g.OB), g.OA));
    case 'travers': {
      const OE = String(Number(g.AE) - Number(g.OA));
      return write(over(times(OE, g.OB), g.OA));
    }
    case 'traversInconnu':
      return String(Number(g.OB) + Number(write(over(times(g.OE, g.OB), g.OA))));
    case 'emboite':
      return write(over(times(Number(g.AM) + Number(g.MB), g.AN), g.AM));
    default:
      return null;
  }
}
/** The right buoy makes the order a PROPORTION of the figure, exactly. */
function proportion(w, x) {
  const g = given(w);
  switch (w.type) {
    case 'rapport':
      return sameRatio([x, g.OF], [read(kGiven(w)).n, read(kGiven(w)).d]);
    case 'longueur':
      return chainHolds([g.OA, g.OE], [g.OB, x]);
    case 'travers':
      return chainHolds([g.OA, String(Number(g.AE) - Number(g.OA))], [g.OB, x]);
    case 'traversInconnu':
      return Number(x) > Number(g.OB) && chainHolds([g.OA, g.OE], [g.OB, String(Number(x) - Number(g.OB))]);
    case 'emboite':
      return sameRatio([g.AM, String(Number(g.AM) + Number(g.MB))], [g.AN, x]);
    default:
      return false;
  }
}

describe(`${ID} — the felucca’s legs`, () => {
  it('two legs, keyed by the dock they leave (2: river → summit, 3: summit → plateau), four buoys each', () => {
    expect(Object.keys(LEGS)).toEqual(['2', '3']);
    const keyOf = { 2: K.papillon, 3: K.calcul };
    for (const i of [2, 3]) {
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

  it('leg 3 is across the vertex: its orders give or ask a length that passes through O', () => {
    for (const [kind] of LEG_MIX[3]) {
      const w = fairWave(rng(9), kind, {});
      expect(w.say).toMatch(/O est sur \[(AE|BF)\]/);
    }
  });

  it('every buoy: exactly ONE right gate — the one the proportion gives — and no wrong buoy equals it', () => {
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
      expect(write(String(right)), tag).toBe(t);
      expect(proportion(w, String(right)), tag).toBe(true);
      const values = w.gates.map((g) => write(String(g)));
      expect(new Set(values).size, tag).toBe(3);
      for (const g of w.gates.filter((_, i) => i !== w.good)) {
        expect(write(String(g)), tag).not.toBe(t);
        expect(proportion(w, String(g)), tag).toBe(false);
      }
      for (const g of w.gates) expect(String(g).length, tag).toBeLessThanOrEqual(6);
      plain(w.say);
      expect(typographyErrors(w.say), w.say).toEqual([]);
      expect(w.tex, tag).not.toMatch(/\$/);
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
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
        checked += trueEqualities(line);
      }
    }
    expect(checked).toBeGreaterThan(400);
  });

  it('a gate is drawn over a real bar when it is a fraction', () => {
    expect(gateOption('4/7')).toEqual({ tex: '\\dfrac{4}{7}' });
    expect(gateOption(21)).toEqual({ t: '21' });
  });
});

describe(`${ID} — every buoy carries its FIGURE (owner, 2026-11-25: « a schema that show A B C »)`, () => {
  /** The two letters of a segment, in order: « AC » for { from: 'C', to: 'A' }. */
  const ends = (s) => [s.from, s.to].sort().join('');
  const sorted = (name) => name.split('').sort().join('');
  it('its letters, its lengths given (across the vertex too), « ? » on the asked one, the chevrons, at 12 px in the panel', () => {
    const seen = new Set();
    // many seeds: a fat butterfly fits at no turn of its first angle (`buoyFigure` narrows it)
    for (const w of waves(300)) {
      const r = roundOf(w);
      const tag = `${w.type} ${w.say} ${w.tex}`;
      seen.add(w.type);
      const f = r.figure;
      expect(f, tag).toBeTruthy();
      // every letter the order names is a point of the figure
      const letters = new Set(`${w.say} ${w.tex}`.replace(/\\[a-z]+/g, '').match(/[A-Z]/g));
      for (const l of letters) expect(Object.keys(f.points), tag).toContain(l);
      // « ? » on the length asked, and on it alone
      const asked = w.say.match(/[A-Z]{2}/g).at(-1);
      const unknown = f.segments.filter((s) => s.label === '?' || /= \?$/.test(s.label ?? ''));
      expect(unknown.map(ends), tag).toEqual([sorted(asked)]);
      // every length the order gives is written on its segment; a ratio given (« OA / OE = p / q ») stays in the order
      for (const [, seg, n] of w.tex.matchAll(/([A-Z]{2}) = (\d+)/g)) {
        const on = f.segments.filter((s) => ends(s) === sorted(seg) && (s.label === n || s.label === `${seg} = ${n}`));
        expect(on, `${tag} — ${seg}`).toHaveLength(1);
      }
      // nothing else written: the lengths given and the one asked
      expect(
        f.segments.filter((s) => s.label != null),
        tag,
      ).toHaveLength([...w.tex.matchAll(/[A-Z]{2} = \d/g)].length + 1);
      expect(
        f.segments.filter((s) => s.arrows),
        tag,
      ).toHaveLength(2);
      const t = runFigure(f);
      expect(t.fits, tag).toBe(true);
      expect(t.label, tag).toBeGreaterThanOrEqual(12);
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });
  it('the legs hand it to the rail (`roundOf`)', () => {
    for (const i of [2, 3])
      expect(Object.keys(LEGS[i].round(1, rng(3), 0).figure.points).sort()).toEqual(['A', 'B', 'E', 'F', 'O']);
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
