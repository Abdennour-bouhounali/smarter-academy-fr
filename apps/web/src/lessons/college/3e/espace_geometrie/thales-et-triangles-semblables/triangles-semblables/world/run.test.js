// THE FELUCCA'S LEGS of triangles-semblables: two legs keyed by the dock they leave (1, 3), every buoy fair — its right gate
// computed HERE by the proportion itself —, a fact for every buoy, a figure of TWO TRIANGLES APART for every buoy, the
// numbers the platform's own.
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
import { sameRatio } from '../../../../../../common/gameworld/kit/authoring/test/ratios';
import { runFigure } from '../../../../../../common/gameworld/kit/trainerFigure';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { GENERATORS, LEG_MIX, LEGS, SPARE, THINK, fairWave, gateOption, isRight, roundOf } from './run';
import { K, over, read, times, write } from './math';

const ID = 'triangles-semblables';
const KINDS = Object.keys(GENERATORS);
const here = dirname(fileURLToPath(import.meta.url));
const PRACTICE = join(here, '../../../../../../../../../../content/practice/3e');
/** Every wave of every kind, over many seeds. */
const waves = (seeds = 60) =>
  KINDS.flatMap((kind) =>
    Array.from({ length: seeds }, (_, s) => fairWave(rng((s + 1) * 7919 + kind.length), kind, {})),
  );
/** The numbers of a wave's order, read from its formula « AB = 6 \\quad DE = 9 … » (the angles of `troisieme` aside). */
const given = (w) => Object.fromEntries([...w.tex.matchAll(/([A-Z]{2}) = (\d+)/g)].map(([, seg, n]) => [seg, n]));
/**
 * The right buoy, computed HERE from what the order shows, by the proportion itself (never by `truthOf`): the value x for
 * which the quotients of the figure are equal.
 */
function truth(w) {
  const g = given(w);
  switch (w.type) {
    case 'rapport':
      return write(over(g.DE, g.AB));
    case 'longueur':
      return write(over(times(g.BC, g.DE), g.AB));
    case 'cote':
      return write(over(times(g.AC, g.DE), g.AB));
    case 'troisieme': {
      const [x, y] = [...w.tex.matchAll(/(\d+)\^\\circ/g)].map((m) => Number(m[1])).slice(0, 2);
      return String(180 - x - y);
    }
    default:
      return null;
  }
}
/** The right buoy makes the order a PROPORTION of the figure, exactly (the three quotients, or the sum of the angles). */
function proportion(w, x) {
  const g = given(w);
  switch (w.type) {
    case 'rapport':
      return sameRatio([g.DE, g.AB], [read(x).n.toString(), read(x).d.toString()]);
    case 'longueur':
      return sameRatio([g.DE, g.AB], [x, g.BC]);
    case 'cote':
      return sameRatio([g.DE, g.AB], [x, g.AC]);
    case 'troisieme': {
      const [a, b] = [...w.tex.matchAll(/(\d+)\^\\circ/g)].map((m) => Number(m[1]));
      return a + b + Number(x) === 180;
    }
    default:
      return false;
  }
}

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

  it('leg 3 is the angles: the third angle of a triangle, a side from two equal angles read from the letters', () => {
    expect(LEG_MIX[3].map(([kind]) => kind)).toEqual(['troisieme', 'cote']);
    const w = fairWave(rng(9), 'cote', {});
    expect(w.tex).toMatch(/\\widehat\{A\} = \\widehat\{E\}/);
  });

  it('no sides’ buoy pairs two sides by their LETTERS: the order says their rank, and the figure agrees', () => {
    /** The length of side XY on the figure (its points), and the rank of XY among the three sides of its triangle. */
    const len = (f, s) => Math.hypot(f.points[s[0]][0] - f.points[s[1]][0], f.points[s[0]][1] - f.points[s[1]][1]);
    const rankOf = (f, side, [p, q, r]) => {
      const sides = [p + q, q + r, r + p].map((x) => len(f, x)).sort((a, b) => a - b);
      const l = len(f, side);
      expect(new Set(sides.map((x) => x.toFixed(3))).size, side).toBe(3);
      return sides.findIndex((x) => Math.abs(x - l) < 1e-6);
    };
    let checked = 0;
    for (const w of waves(60).filter((x) => x.type === 'rapport' || x.type === 'longueur')) {
      const f = roundOf(w).figure;
      const tag = `${w.type} ${w.say} ${w.tex}`;
      // the order states the rank of the second triangle's side it gives (DE, its shortest)
      expect(w.say, tag).toMatch(/plus petits? côtés?/);
      expect(rankOf(f, 'DE', 'DEF'), tag).toBe(0);
      if (w.type === 'rapport') {
        // both sides it gives are said to be the shortest — and they are
        expect(w.say, tag).toMatch(/Leurs plus petits côtés sont AB et DE/);
        expect(rankOf(f, 'AB', 'ABC'), tag).toBe(0);
      } else {
        expect(w.say, tag).toMatch(/Même forme, DE plus petit côté de DEF/);
        // the three sides of ABC are given: their ranks are read from the numbers, and the one paired with DE is AB
        const g = given(w);
        expect(Object.keys(g).sort(), tag).toEqual(['AB', 'BC', 'CA', 'DE']);
        expect(Number(g.AB), tag).toBeLessThan(Math.min(Number(g.BC), Number(g.CA)));
        expect(Number(g.BC), tag).toBeGreaterThan(Number(g.CA));
        // the asked side is the longest of DEF
        expect(rankOf(f, 'EF', 'DEF'), tag).toBe(2);
      }
      // never the pairing by the order of the names alone: the bare « same shape » order of before
      expect(w.say, tag).not.toMatch(/^ABC et DEF ont la même forme : /);
      checked += 1;
    }
    expect(checked).toBe(120);
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
      expect(write(String(right)), tag).toBe(write(t));
      expect(proportion(w, String(right)), tag).toBe(true);
      const values = w.gates.map((g) => write(String(g)));
      expect(new Set(values).size, tag).toBe(3);
      for (const g of w.gates.filter((_, i) => i !== w.good)) {
        expect(write(String(g)), tag).not.toBe(write(t));
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
    expect(checked).toBeGreaterThan(300);
  });

  it('a gate is drawn over a real bar when it is a fraction; a coefficient is written as a fraction, never as « 1,5 »', () => {
    expect(gateOption('3/2')).toEqual({ tex: '\\dfrac{3}{2}' });
    expect(gateOption(21)).toEqual({ t: '21' });
    for (let s = 1; s <= 30; s += 1) {
      const w = fairWave(rng(s * 11), 'rapport', {});
      for (const g of w.gates) expect(String(g), w.tex).not.toMatch(/,/);
    }
  });
});

describe(`${ID} — every buoy carries its FIGURE: two triangles APART, never a shared vertex`, () => {
  /** The two letters of a segment, in order: « AC » for { from: 'C', to: 'A' }. */
  const ends = (s) => [s.from, s.to].sort().join('');
  const sorted = (name) => name.split('').sort().join('');
  it('six points, the lengths it gives written, « ? » on the asked side, drawn at 12 px in the panel', () => {
    const seen = new Set();
    for (const w of waves(120)) {
      const r = roundOf(w);
      const tag = `${w.type} ${w.say} ${w.tex}`;
      seen.add(w.type);
      const f = r.figure;
      expect(f, tag).toBeTruthy();
      expect(validateGeoFigure(f), tag).toEqual([]);
      expect(Object.keys(f.points), tag).toHaveLength(6);
      const t = runFigure(f);
      expect(t.fits, tag).toBe(true);
      expect(t.label, tag).toBeGreaterThanOrEqual(12);
      // no angle is written on it: the order gives them (an angle written at 12 would not stand in the rail's room)
      for (const g of f.angles ?? []) expect(g.label, tag).toBeUndefined();
      if (w.type === 'troisieme') {
        expect(f.angles, tag).toHaveLength(6);
        expect(
          f.angles.filter((g) => g.tone === 'rose'),
          tag,
        ).toHaveLength(1);
        continue;
      }
      // every length the order gives is written on its segment, and no other (the asked one is « ? »)
      for (const [, seg, n] of w.tex.matchAll(/([A-Z]{2}) = (\d+)/g)) {
        const on = f.segments.filter((s) => ends(s) === sorted(seg));
        if (w.type === 'rapport' || seg === 'CA' || seg === 'BC' || seg === 'AC' || seg === 'AB' || seg === 'DE')
          expect(
            on.map((s) => s.label),
            `${tag} — ${seg}`,
          ).toContain(n);
      }
      if (w.type !== 'rapport') {
        const unknown = f.segments.filter((s) => s.label === '?');
        expect(unknown.map(ends), tag).toEqual(['EF']);
      }
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });
  it('the legs hand it to the rail (`roundOf`)', () => {
    for (const i of [1, 3])
      expect(Object.keys(LEGS[i].round(1, rng(3), 0).figure.points).sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });
});

describe(`${ID} — the numbers of the legs are the platform’s own`, () => {
  it('no pair of numbers of ten and more a buoy shows stands on one line of any bank or of another lesson’s story', () => {
    const stories = storiesOf({ exceptId: ID });
    const banks = readdirSync(PRACTICE, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => readBank(d.name));
    const pairs = new Set();
    for (const w of waves(40))
      for (const [a, b] of w.pairs) if (a >= 10 && b >= 10) pairs.add([a, b].sort((x, y) => x - y).join(';'));
    expect(pairs.size).toBeGreaterThan(10);
    for (const key of pairs) {
      const [a, b] = key.split(';');
      for (const bank of banks) expect(linesWithBoth(bank, a, b), `${key} in ${bank.id}`).toEqual([]);
      for (const s of stories) expect(pairLines(s.text, a, b), `${key} in ${s.file}`).toEqual([]);
    }
  });
});
