import { describe, it, expect } from 'vitest';
import {
  rodOf,
  zoomNeed,
  MAX_ZOOM,
  MAX_RODS,
  MAX_CELL,
  initCalc,
  calcReducer,
  calcResult,
  rowNow,
  zoomTex,
} from './calc';
import { outcome, rootOf, write, read } from './logic';
import { longestCell } from './test/calcTable';

/** What a ten-digit calculator shows for the side of a court: the root rounded to ten significant digits (exact). */
function calculator(area, digits = 10) {
  const isqrt = (v) => {
    if (v < 2n) return v;
    let x = BigInt(Math.floor(Math.sqrt(Number(v))));
    while (x * x > v) x -= 1n;
    while ((x + 1n) * (x + 1n) <= v) x += 1n;
    return x;
  };
  const whole = String(isqrt(BigInt(area))).length;
  const m = digits - whole; // decimals shown
  const r = isqrt(BigInt(area) * 10n ** BigInt(2 * (m + 1))); // one digit more, to round
  const shown = (r + 5n) / 10n;
  return write(`${shown}/${10n ** BigInt(m)}`);
}

const SPEC = { kind: 'calc', a: '30', rods: [{ q: '5' }, { q: '5,5' }, { calc: '5,477225575' }], wall: true, text: {} };
const play = (actions, from = initCalc(SPEC), spec = SPEC) => actions.reduce((s, a) => calcReducer(spec, s, a), from);
const zoomAll = (s, spec = SPEC) => {
  let at = s;
  while (at.stage === 'zoom') at = calcReducer(spec, at, { type: 'zoom' });
  return at;
};

describe('calc — the rods and the magnifier', () => {
  it('reads a rod of the spec as the world lowers it', () => {
    expect(rodOf({ q: '5.50' })).toEqual({ q: '5,5' });
    expect(rodOf({ calc: '5,477225575' })).toEqual({ q: '5,477225575' });
    expect(rodOf({ root: '30' })).toEqual({ root: '30' });
  });

  it('the calculator of the test is a real one: ten digits, rounded', () => {
    expect(calculator(30)).toBe('5,477225575');
    expect(calculator(2)).toBe('1,414213562');
    expect(calculator(200)).toBe('14,14213562');
    expect(calculator(36)).toBe('6');
  });

  it('asks the number of presses the gap needs: none for a wide band, one per power of ten for a thin one', () => {
    expect(zoomNeed({ q: '5' }, '30')).toBe(0);
    expect(zoomNeed({ q: '6' }, '30')).toBe(0);
    expect(zoomNeed({ q: '5,5' }, '30')).toBe(1);
    expect(zoomNeed({ q: '5,47' }, '30')).toBe(2);
    expect(zoomNeed({ q: '5,477225575' }, '30')).toBe(10);
    expect(zoomNeed({ q: '6' }, '36')).toBe(0);
    expect(zoomNeed({ root: '30' }, '30')).toBe(0);
  });

  it('for every court of 2 to 400 tiles with no whole side, the calculator rod misses — and the magnifier reaches it', () => {
    let most = 0;
    for (let a = 2; a <= 400; a += 1) {
      const shows = calculator(a);
      const o = outcome({ q: shows }, String(a));
      if (rootOf(a) != null) {
        expect(o.kind).toBe('ride');
        expect(shows).toBe(rootOf(a));
        continue;
      }
      expect(o.kind).not.toBe('ride');
      const k = zoomNeed({ q: shows }, String(a));
      // ten digits: the gap is far too thin for the eye, and never beyond the magnifier
      expect(k).toBeGreaterThanOrEqual(7);
      expect(k).toBeLessThan(MAX_ZOOM);
      most = Math.max(most, k);
      // the whole and the half-tile rods around the side are seen with at most two presses
      const whole = Math.floor(Math.sqrt(a));
      expect(zoomNeed({ q: String(whole) }, String(a))).toBeLessThanOrEqual(2);
    }
    expect(most).toBeLessThanOrEqual(12);
  });

  it('writes the zoom as the court lens does: whole up to 10 000, then a power of ten', () => {
    expect(zoomTex(1)).toBe('\\times 10');
    expect(zoomTex(4)).toBe('\\times 10000');
    expect(zoomTex(10)).toBe('\\times 10^{10}');
  });
});

describe('calc — the state machine, played through', () => {
  it('opens on the first rod, asking before anything is lowered', () => {
    const s = initCalc(SPEC);
    expect(s).toMatchObject({ stage: 'say', i: 0, rod: { q: '5' }, calc: null, rows: [], wall: false, zooms: 0 });
    expect(rowNow(s)).toBe(null);
  });

  it('a wide band is seen at once; a thin overhang waits for his presses', () => {
    let s = play([{ type: 'say', v: false }]);
    expect(s.stage).toBe('build');
    s = play([{ type: 'built' }], s);
    expect(s.stage).toBe('seen');
    expect(rowNow(s)).toEqual({
      a: '30',
      s: { q: '5' },
      kind: 'band',
      covers: '25',
      diff: '5',
      predicted: false,
      zoom: 0,
    });
    s = play([{ type: 'next' }, { type: 'say', v: true }, { type: 'built' }], s);
    expect(s.stage).toBe('zoom');
    expect(rowNow(s)).toMatchObject({ kind: 'jam', covers: '30,25', diff: '0,25', predicted: true });
    s = play([{ type: 'zoom' }], s);
    expect(s).toMatchObject({ stage: 'seen', zk: 1, zooms: 1 });
    expect(rowNow(s).zoom).toBe(1);
  });

  it('the calculator rod is lowered exactly, and ten presses show its sliver', () => {
    let s = play([{ type: 'say', v: false }, { type: 'built' }, { type: 'next' }]);
    s = zoomAll(play([{ type: 'say', v: true }, { type: 'built' }], s));
    s = play([{ type: 'next' }], s);
    expect(s).toMatchObject({ stage: 'say', i: 2, rod: { q: '5,477225575' }, calc: '5,477225575' });
    s = play([{ type: 'say', v: true }, { type: 'built' }], s);
    expect(s.stage).toBe('zoom');
    expect(rowNow(s)).toMatchObject({
      kind: 'band',
      covers: '29,999999999434080625',
      diff: '0,000000000565919375',
      calc: '5,477225575',
    });
    for (let k = 1; k < 10; k += 1) {
      s = play([{ type: 'zoom' }], s);
      expect(s.stage).toBe('zoom');
    }
    s = play([{ type: 'zoom' }], s);
    expect(s).toMatchObject({ stage: 'seen', zk: 10, zooms: 11 });
  });

  it('then the wall: clamped corner to corner, its rod rides, and the experiment ends', () => {
    let s = play([{ type: 'say', v: false }, { type: 'built' }, { type: 'next' }]);
    s = zoomAll(play([{ type: 'say', v: false }, { type: 'built' }], s));
    s = play([{ type: 'next' }], s);
    s = zoomAll(play([{ type: 'say', v: true }, { type: 'built' }], s));
    s = play([{ type: 'next' }], s);
    expect(s).toMatchObject({ stage: 'wall', rod: null, i: 3 });
    s = play([{ type: 'clamp' }], s);
    expect(s.stage).toBe('clamping');
    s = play([{ type: 'clamped' }], s);
    expect(s).toMatchObject({ stage: 'say', rod: { root: '30' }, wall: true });
    s = play([{ type: 'say', v: true }, { type: 'built' }], s);
    expect(s.stage).toBe('seen');
    expect(rowNow(s)).toEqual({
      a: '30',
      s: { root: '30' },
      kind: 'ride',
      covers: '30',
      diff: '0',
      predicted: true,
      zoom: 0,
    });
    s = play([{ type: 'next' }], s);
    expect(s.done).toBe(true);
    const r = calcResult(s);
    expect(r.wall).toBe(true);
    expect(r.zooms).toBe(11);
    expect(r.rows.map((x) => [x.s.q ?? `wall ${x.s.root}`, x.kind, x.predicted, x.zoom])).toEqual([
      ['5', 'band', false, 0],
      ['5,5', 'jam', false, 1],
      ['5,477225575', 'band', true, 10],
      ['wall 30', 'ride', true, 0],
    ]);
    expect(r.rows[2].calc).toBe('5,477225575');
    expect('calc' in r.rows[0]).toBe(false);
  });

  it('a move that does not belong to the stage changes nothing', () => {
    const s0 = initCalc(SPEC);
    for (const a of [
      { type: 'built' },
      { type: 'zoom' },
      { type: 'next' },
      { type: 'clamp' },
      { type: 'clamped' },
      { type: 'say' },
      { type: 'say', v: 'yes' },
      { type: '??' },
    ])
      expect(calcReducer(SPEC, s0, a)).toBe(s0);
    const b = play([{ type: 'say', v: true }]);
    for (const a of [{ type: 'say', v: false }, { type: 'zoom' }, { type: 'next' }])
      expect(calcReducer(SPEC, b, a)).toBe(b);
    const seen = play([{ type: 'built' }], b);
    for (const a of [{ type: 'zoom' }, { type: 'built' }, { type: 'clamp' }])
      expect(calcReducer(SPEC, seen, a)).toBe(seen);
    // pressing « Agrandis » once the sliver is seen does nothing more
    const z = zoomAll(play([{ type: 'next' }, { type: 'say', v: true }, { type: 'built' }], seen));
    expect(calcReducer(SPEC, z, { type: 'zoom' })).toBe(z);
  });

  it('without a wall it ends on the last rod; with no rod it opens on the wall; a court of 36 is ridden by 6', () => {
    const spec = { ...SPEC, a: '36', rods: [{ q: '6' }], wall: false };
    let s = play([{ type: 'say', v: true }, { type: 'built' }, { type: 'next' }], initCalc(spec), spec);
    expect(s.done).toBe(true);
    expect(calcResult(s)).toEqual({
      rows: [{ a: '36', s: { q: '6' }, kind: 'ride', covers: '36', diff: '0', predicted: true, zoom: 0 }],
      wall: false,
      zooms: 0,
    });
    const only = { ...SPEC, rods: [], wall: true };
    s = initCalc(only);
    expect(s.stage).toBe('wall');
    s = play(
      [{ type: 'clamp' }, { type: 'clamped' }, { type: 'say', v: false }, { type: 'built' }, { type: 'next' }],
      s,
      only,
    );
    expect(s.done).toBe(true);
    expect(calcResult(s).rows[0]).toMatchObject({ kind: 'ride', predicted: false });
  });

  it('refuses a spec it cannot lay out', () => {
    expect(() => initCalc({ ...SPEC, rods: [], wall: false })).toThrow();
    expect(() => initCalc({ ...SPEC, a: 'trente' })).toThrow();
    expect(() =>
      initCalc({ ...SPEC, rods: Array.from({ length: MAX_RODS + 1 }, (_, k) => ({ q: String(k) })) }),
    ).toThrow();
  });

  it('a cell of the table holds at most MAX_CELL characters: 21 for a ten-digit calculator on any court of 2 to 999', () => {
    // the table is laid out for MAX_CELL (calc.js › CALC_LAYOUT.table; screenshot review 2026-11-21: a row of the
    // calculator ran past its column) — the longest number a lesson's court can produce is bound here
    let longest = 0;
    for (let a = 2; a <= 999; a += 1)
      if (rootOf(String(a)) == null) {
        const spec = { ...SPEC, a: String(a), rods: [{ q: '1' }, { calc: calculator(a) }] };
        expect(() => initCalc(spec), String(a)).not.toThrow();
        longest = Math.max(longest, longestCell(spec));
      }
    expect(longest).toBe(MAX_CELL);
    expect(longestCell(SPEC)).toBe(21); // the court of 30: « 29,999999999434080625 »
    // a court under one tile asked of a ten-digit calculator writes 22 characters: refused, never drawn past its column
    expect(() => initCalc({ ...SPEC, a: '0,5', rods: [{ calc: '0,7071067812' }] })).toThrow(/21 characters/);
  });

  it('the experiment is exact on every court a lesson may give: no number rod rides a court with no whole side', () => {
    for (const a of ['2', '30', '50', '0,5', '2/3', '1000'])
      for (const q of ['1', '1,4', '1,41', '5', '5,47', '7', '7,07', '0,7', '0,8165', '31,62'])
        if (rootOf(a) == null) {
          const s = play([{ type: 'say', v: true }, { type: 'built' }], initCalc({ ...SPEC, a, rods: [{ q }] }), {
            ...SPEC,
            a,
            rods: [{ q }],
          });
          expect(s.rows[0].kind).not.toBe('ride');
          expect(read(s.rows[0].diff).n > 0n).toBe(true);
        }
  });
});
