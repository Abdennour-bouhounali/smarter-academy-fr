import { describe, it, expect } from 'vitest';
import { expand, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';
import * as L from './turfFactoring';

/**
 * turf-factoring — la logique du LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 3 `tahlil-ibara`) : verdicts, essais nouveaux, prédictions,
 * guide, boîtes, questions bâties (vérifiées par l'algèbre) et le balayage `shownValues`. Les nombres sont RECALCULÉS, jamais recopiés.
 */
const rowsAt = (expr, ...rs) => rs.reduce((s, r) => L.setRows(s, r), L.initRows({ expr }));
const split = (b, c, right) => {
  let s = L.initSquare({ b, c });
  for (let i = 0; i < right; i += 1) s = L.place(s, 'stock', 'right');
  for (let i = 0; i < b - right; i += 1) s = L.place(s, 'stock', 'bottom');
  return s;
};
const termsOf = (tex) => L.parseTerms(tex);

describe('turf-factoring player — verdicts and trials', () => {
  it('rows: groups = r, exact = nothing left outside; r = 1 is not a trial', () => {
    const s = L.initRows({ expr: '8x+6' });
    expect(L.verdictOf(s, { r: 2, valid: L.rowsLayout(s, 2).valid })).toEqual({ groups: 2, exact: true });
    expect(L.verdictOf(s, { r: 3, valid: L.rowsLayout(s, 3).valid })).toEqual({ groups: 3, exact: false });
    expect(L.verdictOf(s, { r: 1, valid: true })).toBeNull();
  });
  it('square: groups = strips on the right, exact = closed', () => {
    const s = L.close(split(6, 9, 3));
    expect(L.verdictOf(s, s.trials.at(-1))).toEqual({ groups: 3, exact: true });
    const t = L.close(split(6, 9, 2));
    expect(L.verdictOf(t, t.trials.at(-1))).toEqual({ groups: 2, exact: false });
  });
  it('the same r twice / the same split twice is not a new trial', () => {
    const s = rowsAt('8x+6', 3);
    expect(L.isNewRows(s, 3)).toBe(false);
    expect(L.isNewRows(s, 4)).toBe(true);
    const q = L.close(split(6, 9, 2));
    expect(L.isNewSplit(q)).toBe(false);
    expect(L.isNewSplit(L.place(q, 'bottom', 'right'))).toBe(true);
  });
});

describe('turf-factoring player — rows mode draws and refuses NEGATIVE counts (council L3.9: 9x² − 6x in the free round)', () => {
  it('9x² − 6x: r = 3 is valid, 3x(3x − 2); r = 2 leaves one x² outside; the gcd is 3', () => {
    const s = L.initRows({ expr: '9x^2-6x' });
    expect(L.rowsGcd(s)).toBe(3);
    expect(L.rowsRange(s)).toEqual({ min: 1, max: 9 });
    expect(L.rowsLayout(s, 3)).toMatchObject({ valid: true, perRow: [{ c: 3, p: 2 }, { c: -2, p: 1 }] });
    expect(L.rowsEquationTex(s, 3)).toBe('9x^2 - 6x = 3x(3x - 2)');
    expect(L.rowsLayout(s, 2)).toMatchObject({ valid: false, leftover: [{ c: 1, p: 2 }] });
    const bp = L.buildFactorParts(s);
    expect(samePolynomial(expand([bp.common], bp.inner), s.terms)).toBe(true);
    expect(bp.sign).toBe('-');
  });
});

describe('turf-factoring player — predictions', () => {
  it('options hold the truth, the truth comes from the lab', () => {
    const r2 = L.initRows({ expr: '6x^2+2x' });
    expect(L.predictTruth(r2, 'rowHeight')).toBe('x');
    expect(L.predictOptions(r2, 'rowHeight')).toEqual(['1', '2', 'x']);
    expect(L.predictTruth(r2, 'maxRows')).toBe(2);
    expect(L.predictOptions(r2, 'maxRows')).toEqual([6, 2, 1]);
    const sq = L.initSquare({ b: 6, c: 9 });
    expect(L.predictOptions(sq, 'sideStrips')).toEqual([3, 6, 9]);
    expect(L.predictTruth(sq, 'sideStrips')).toBe(3);
    expect(L.predictTruth(L.initSquare({ b: 0, c: 25 }), 'closes')).toBe('no');
    expect(L.predictTruth(sq, 'closes')).toBe('yesSquare');
  });
  it('judged by the terrain: the gcd seen valid; a closed square; any close', () => {
    const r2 = L.initRows({ expr: '6x^2+2x' });
    expect(L.judgedPredictions(r2, ['rowHeight', 'maxRows'])).toEqual([]);
    expect(L.judgedPredictions(L.setRows(r2, 3), ['maxRows'])).toEqual([]);
    expect(L.judgedPredictions(L.setRows(r2, 2), ['rowHeight', 'maxRows'])).toEqual(['rowHeight', 'maxRows']);
    expect(L.judgedPredictions(L.close(split(6, 9, 2)), ['sideStrips'])).toEqual([]);
    expect(L.judgedPredictions(L.close(split(6, 9, 3)), ['sideStrips'])).toEqual(['sideStrips']);
    expect(L.judgedPredictions(L.close(L.initSquare({ b: 0, c: 25 })), ['closes'])).toEqual(['closes']);
  });
});

describe('turf-factoring player — the guide never points at the answer', () => {
  it('rows: handle → (first refusal) look at what lit up → another r', () => {
    const s = L.initRows({ expr: '8x+6' });
    expect(L.coachOf(s, { r: 3 }).id).toBe('drag');
    expect(L.coachOf(L.setRows(s, 1), { r: 1 }).id).toBe('drag');
    expect(L.coachOf(L.setRows(s, 3), { r: 3 })).toMatchObject({ id: 'look', target: '[data-turf-leftover]' });
    expect(L.coachOf(L.setRows(s, 2), { r: 2 }).id).toBe('another');
    expect(L.coachOf(rowsAt('8x+6', 3, 2), { r: 2 }).id).toBe('another');
    expect(L.coachOf(s, { done: true })).toBeNull();
  });
  it('square: stock → close → look at the corner → move a strip; closed → reopen', () => {
    const s = L.initSquare({ b: 6, c: 9 });
    expect(L.coachOf(s).id).toBe('stock');
    expect(L.coachOf(L.place(s, 'stock', 'right')).id).toBe('place');
    expect(L.coachOf(split(6, 9, 2)).id).toBe('close');
    const refused = L.close(split(6, 9, 2));
    expect(L.coachOf(refused).id).toBe('lookCorner');
    expect(L.coachOf(L.close(L.place(L.place(refused, 'right', 'bottom'), 'bottom', 'bottom'))).id).toBe('move');
    expect(L.coachOf(L.close(split(6, 9, 3))).id).toBe('reopen');
    expect(L.coachOf(L.initSquare({ b: 0, c: 25 })).id).toBe('close');
    for (const c of [L.coachOf(s), L.coachOf(refused), L.coachOf(L.initRows({ expr: '8x+6' }), { r: 3 })]) {
      expect(c.target).toMatch(/^\[data-turf-[a-z]+\]$/);
    }
  });
});

describe('turf-factoring player — the built equalities are checked by algebra', () => {
  for (const expr of ['8x+6', '4x+2', '6x^2+2x', '4x^2+2x', '6x+3', '9x^2-6x']) {
    it(`${expr}: factor × row = the sum; the decoy (last term not divided) never; no other arrangement of the tiles equals the sum`, () => {
      const s = L.initRows({ expr });
      const bp = L.buildFactorParts(s);
      expect(samePolynomial(expand([bp.common], bp.inner), s.terms)).toBe(true);
      expect(samePolynomial(expand([bp.common], [bp.inner[0], bp.decoy]), s.terms)).toBe(false);
      // every way of placing 3 of the 4 tiles in « ▢(▢ ± ▢) »
      const tiles = [...bp.expected, bp.decoyTex];
      const toTerm = (tex) => termsOf(tex)[0];
      const sign = bp.sign === '-' ? -1 : 1;
      const right = [bp.expected, ...bp.accept].map((a) => a.join('|'));
      for (let a = 0; a < 4; a += 1) for (let b = 0; b < 4; b += 1) for (let c = 0; c < 4; c += 1) {
        if (new Set([a, b, c]).size < 3) continue;
        const [k, i1, i2] = [toTerm(tiles[a]), toTerm(tiles[b]), toTerm(tiles[c])];
        const equal = samePolynomial(expand([k], [i1, { ...i2, c: sign * i2.c }]), s.terms);
        expect(equal, `${tiles[a]}(${tiles[b]} ${bp.sign} ${tiles[c]})`).toBe(right.includes([tiles[a], tiles[b], tiles[c]].join('|')));
      }
    });
  }
  it('square: (x + b/2)² is the sum, the decoy (x + c)² is not', () => {
    // x² + 2x + 1 (the easier round, no chain) is left out: there c = b/2 = 1, the decoy would be the side itself
    for (const [b, c] of [[6, 9], [8, 16], [4, 4]]) {
      const s = L.initSquare({ b, c });
      const bp = L.buildSquareParts(s);
      const sum = [{ c: 1, p: 2 }, { c: b, p: 1 }, { c, p: 0 }];
      expect(samePolynomial(expand(bp.side, bp.side), sum)).toBe(true);
      const decoy = [{ c: 1, p: 1 }, { c, p: 0 }];
      expect(samePolynomial(expand(decoy, decoy), sum)).toBe(false);
    }
  });
  it('fill chips: the row content and the full height are read from the lab', () => {
    expect(L.rowFillParts(L.initRows({ expr: '8x+6' }))).toMatchObject({ expected: '4', options: ['4', '8', '3'] });
    expect(L.heightFillParts(L.initRows({ expr: '6x^2+2x' }))).toEqual({ expected: '2x', options: ['2', 'x', '2x'] });
  });
});

describe('turf-factoring player — boxes and the scan', () => {
  it('the widest row and the tallest stack are computed', () => {
    const s = L.initRows({ expr: '6x^2+2x' });
    expect(L.rowsBox(s, 1).w).toBeCloseTo(6 * L.XU + 2);
    expect(L.rowsBox(s, 6).h).toBeCloseTo(6 * L.XU);
    expect(L.rowsBox(s, 2).left).toBe(0);
    expect(L.rowsBox(s, 3).left).toBe(2);
  });
  it('shownValues lists every r of the ruler, its verdict values, and the chain tiles', () => {
    const v = L.shownValues({ mode: 'rows', expr: '8x+6', chains: 'build' });
    const of = (role) => v.filter((x) => x.role === role).map((x) => x.v);
    expect(of('tick')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    expect(of('common')).toEqual(['1', '2']);
    expect(of('eq')).toContain('8x+6=2(4x+3)');
    expect(of('leftover')).toContain('3:x×2');
    expect(of('tile')).toEqual(['2', '4x', '3', '6']);
    expect(of('decoy-eq')).toContain('8x+12');
    const sq = L.shownValues({ mode: 'square', b: 6, c: 9, chains: 'full', predict: ['sideStrips'] });
    expect(sq.filter((x) => x.role === 'corner').map((x) => x.v)).toContain('2|4:8');
    expect(sq.filter((x) => x.role === 'eq').map((x) => x.v)).toEqual(['x^2+6x+9=(x+3)^2']);
  });
});
