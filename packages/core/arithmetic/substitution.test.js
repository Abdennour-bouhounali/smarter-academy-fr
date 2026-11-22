import { describe, it, expect } from 'vitest';
import { rat, parseRat, eq, ratText } from './powers.js';
import * as S from './substitution.js';

const P = S.parseExpression;
const v = (t) => parseRat(t);
const val = (expr, env) => ratText(S.evaluate(P(expr), Object.fromEntries(Object.entries(env).map(([k, t]) => [k, v(t)]))));
const tokensOf = (tree, env, choices) => S.tokensText(S.writeLine(tree, env, choices));

describe('substitution — parseExpression & evaluate', () => {
  it('evaluates the lab tasks exactly', () => {
    expect(val('4x+7', { x: '3' })).toBe('19');
    expect(val('4x+7', { x: '-2' })).toBe('-1');
    expect(val('x²-3x', { x: '-2' })).toBe('10');
    expect(val('5-2x²', { x: '-3' })).toBe('-13');
    expect(val('6x-1', { x: '-1/2' })).toBe('-4');
    expect(val('3x-2y', { x: '-1', y: '4' })).toBe('-11');
    expect(val('3x-2y', { x: '2', y: '-1' })).toBe('8');
  });
  it('lesson numbers: module 2, problems, bank-free textbook-like values', () => {
    expect(val('2x²-5x+1', { x: '3' })).toBe('4');
    expect(val('2x²-5x+1', { x: '-1' })).toBe('8');
    expect(val('(4-x)(y+2)', { x: '-1,5', y: '-7' })).toBe('-55/2');
    expect(val('(2x+3)(x-4)', { x: '1' })).toBe('-15');
    expect(val('20x-5x²', { x: '1,5' })).toBe('75/4');
    expect(val('15-6x', { x: '-0,04' })).toBe('381/25');
  });
  it('unary minus binds after the power; a leading negative literal is a number', () => {
    expect(val('-x²', { x: '3' })).toBe('-9');
    expect(val('-3x', { x: '2' })).toBe('-6');
    expect(val('5-(x-2)', { x: '1' })).toBe('6');
    expect(val('x^3', { x: '-2' })).toBe('-8');
  });
  it('accepts Arabic-Indic digits, the real minus and the multiplication sign', () => {
    expect(val('٣x−٤', { x: '2' })).toBe('2');
    expect(val('3×x', { x: '2' })).toBe('6');
  });
  it('refuses what the grammar does not know', () => {
    for (const bad of ['', 'x+', '3x2', 'x^4', 'z+1', '4x+7+4x+7+4x+7+4x+7+4x+7+4x', '((x)']) expect(() => P(bad), bad).toThrow();
  });
  it('round-trips through treeText / treeTex', () => {
    expect(S.treeText(P('4x+7'))).toBe('4x + 7');
    expect(S.treeText(P('5-2x²'))).toBe('5 − 2x²');
    expect(S.treeText(P('(x-1)(x+2)'))).toBe('(x − 1)(x + 2)');
    expect(S.treeText(P('5-(x-2)'))).toBe('5 − (x − 2)');
    expect(S.treeTex(P('4x+7'))).toBe('4x+7');
    expect(S.letters(P('3x-2y'))).toEqual(['x', 'y']);
    for (const e of ['4x+7', 'x²-3x', '(4-x)(y+2)', '-x²', '5-(x-2)']) {
      const t = P(e);
      const again = P(S.treeText(t));
      for (const x of ['-3', '0', '1/2', '5']) {
        const env = { x: v(x), y: v('2') };
        expect(eq(S.evaluate(t, env), S.evaluate(again, env)), `${e} @ ${x}`).toBe(true);
      }
    }
  });
});

describe('substitution — slots, trace', () => {
  it('slots: where a × can be written', () => {
    expect(S.slots(P('4x+7')).map((s) => s.needsTimes)).toEqual([true]);
    expect(S.slots(P('x²-3x')).map((s) => [s.underPow, s.needsTimes])).toEqual([[true, false], [false, true]]);
    expect(S.slots(P('5-2x²')).map((s) => [s.underPow, s.needsTimes])).toEqual([[true, true]]);
    expect(S.slots(P('3x-2y')).map((s) => s.name)).toEqual(['x', 'y']);
    expect(S.slots(P('x+7')).map((s) => s.needsTimes)).toEqual([false]);
  });
  it('trace lists the operations bottom-up with their values', () => {
    const steps = S.trace(P('x²-3x'), { x: v('-2') });
    expect(steps.map((s) => [s.op, ratText(s.value)])).toEqual([['pow', '4'], ['mul', '-6'], ['sub', '10']]);
    expect(steps.map((s) => s.id)).toEqual([0, 1, 2]);
  });
  it('needsBrackets: a negative value, or a fraction under a power', () => {
    const t = P('x²-3x');
    expect(S.needsBrackets(t, 0, v('-2'))).toBe(true);
    expect(S.needsBrackets(t, 0, v('2'))).toBe(false);
    expect(S.needsBrackets(t, 0, v('2/3'))).toBe(true);
    expect(S.needsBrackets(t, 1, v('2/3'))).toBe(false);
  });
});

describe('substitution — readLine: the four refusals and the accepted lines', () => {
  const read = (expr, env, choices) => S.readLine(S.writeLine(P(expr), env, choices));
  const E = (o) => Object.fromEntries(Object.entries(o).map(([k, t]) => [k, v(t)]));
  it('fused digits: 4x+7 at 3 without × reads 50', () => {
    const r = read('4x+7', E({ x: '3' }), [{}]);
    expect(r.ok).toBe(true); expect(ratText(r.value)).toBe('50');
    expect(ratText(read('4x+7', E({ x: '3' }), [{ times: true }]).value)).toBe('19');
  });
  it('syntax: 4 × −2 is unreadable; with brackets it reads −1', () => {
    expect(read('4x+7', E({ x: '-2' }), [{ times: true }])).toMatchObject({ ok: false, reason: 'syntax' });
    expect(ratText(read('4x+7', E({ x: '-2' }), [{ times: true, brackets: true }]).value)).toBe('-1');
  });
  it('power before the leading minus: x²−3x at −2 without brackets reads 2', () => {
    const bare = read('x²-3x', E({ x: '-2' }), [{}, { times: true, brackets: true }]);
    expect(bare.ok).toBe(true); expect(ratText(bare.value)).toBe('2');
    const good = read('x²-3x', E({ x: '-2' }), [{ brackets: true }, { times: true, brackets: true }]);
    expect(ratText(good.value)).toBe('10');
  });
  it('a fraction under a power needs its brackets; a juxtaposed bracket is a product', () => {
    expect(ratText(read('x²', E({ x: '2/3' }), [{}]).value)).toBe('2/9');
    expect(ratText(read('x²', E({ x: '2/3' }), [{ brackets: true }]).value)).toBe('4/9');
    expect(ratText(read('4x+7', E({ x: '-2' }), [{ brackets: true }]).value)).toBe('-1');
  });
  it('a hole is unreadable', () => {
    expect(read('4x+7', {}, [{}])).toMatchObject({ ok: false });
  });
  it('line text', () => {
    const t = P('x²-3x');
    expect(tokensOf(t, E({ x: '-2' }), [{ brackets: true }, { times: true, brackets: true }])).toBe('(−2)² − 3 × (−2)');
    expect(tokensOf(P('6x-1'), E({ x: '-1/2' }), [{ times: true, brackets: true }])).toBe('6 × (−1/2) − 1');
  });
});

describe('substitution — judgeLine on every task of the lab', () => {
  const E = (o) => Object.fromEntries(Object.entries(o).map(([k, t]) => [k, v(t)]));
  const full = (n) => Array.from({ length: n }, () => ({ times: true, brackets: true }));
  it('r1 4x+7 at 3', () => {
    const t = P('4x+7'); const env = E({ x: '3' });
    expect(S.judgeLine(t, env, [{ times: true }])).toMatchObject({ ok: true });
    const fused = S.judgeLine(t, env, [{}]);
    expect(fused).toMatchObject({ ok: false, reason: 'fused', slot: 0 });
    expect(ratText(fused.lineValue)).toBe('50'); expect(ratText(fused.runValue)).toBe('19');
    expect(fused.stationInfo.op).toBe('mul');
  });
  it('r2 4x+7 at −2', () => {
    const t = P('4x+7'); const env = E({ x: '-2' });
    expect(S.judgeLine(t, env, [{ times: true, brackets: true }])).toMatchObject({ ok: true });
    expect(S.judgeLine(t, env, [{ times: true }])).toMatchObject({ ok: false, reason: 'syntax' });
    expect(S.judgeLine(t, env, [{ brackets: true }])).toMatchObject({ ok: true }); // 4(−2) is a product
  });
  it('r3 x²−3x at −2: the copier is where the line parts', () => {
    const t = P('x²-3x'); const env = E({ x: '-2' });
    expect(S.judgeLine(t, env, [{ brackets: true }, { times: true, brackets: true }])).toMatchObject({ ok: true });
    const j = S.judgeLine(t, env, [{}, { times: true, brackets: true }]);
    expect(j).toMatchObject({ ok: false, reason: 'unbracketed', slot: 0, station: 0 });
    expect(j.stationInfo.op).toBe('pow'); expect(ratText(j.stationInfo.lineValue)).toBe('-4'); expect(ratText(j.stationInfo.value)).toBe('4');
    expect(ratText(j.lineValue)).toBe('2');
  });
  it('r4 5−2x² at −3 (the copier stands before the press)', () => {
    const t = P('5-2x²'); const env = E({ x: '-3' });
    expect(S.judgeLine(t, env, [{ times: true, brackets: true }])).toMatchObject({ ok: true });
    expect(ratText(S.evaluate(t, env))).toBe('-13');
    const j = S.judgeLine(t, env, [{ times: true }]);
    expect(j.ok).toBe(false);
    expect(S.trace(t, env).map((s) => s.op)).toEqual(['pow', 'mul', 'sub']);
  });
  it('r5 6x−1 at −1/2 and r6 3x−2y at (−1, 4)', () => {
    expect(S.judgeLine(P('6x-1'), E({ x: '-1/2' }), full(1))).toMatchObject({ ok: true, runValue: rat(-4) });
    expect(S.judgeLine(P('6x-1'), E({ x: '-1/2' }), [{ times: true }])).toMatchObject({ ok: false });
    const j = S.judgeLine(P('3x-2y'), E({ x: '-1', y: '4' }), [{ times: true, brackets: true }, { times: true }]);
    expect(j).toMatchObject({ ok: true, runValue: rat(-11) });
    expect(S.judgeLine(P('3x-2y'), E({ x: '-1', y: '4' }), [{ times: true }, { times: true }])).toMatchObject({ ok: false, reason: 'syntax' });
  });
  it('wrongly swapped values still run (free trial) and read the same way', () => {
    expect(S.judgeLine(P('3x-2y'), E({ x: '4', y: '-1' }), full(2)).runValue).toEqual(rat(14));
  });
});

describe('substitution — toTerms, samePolynomial, witness (the twins)', () => {
  it('polynomial normal forms', () => {
    expect(S.toTerms(P('(x+2)(x+3)'))).toEqual([{ c: 1, p: 2 }, { c: 5, p: 1 }, { c: 6, p: 0 }]);
    expect(S.toTerms(P('3(x²-x)+3(x-4)'))).toEqual([{ c: 3, p: 2 }, { c: -12, p: 0 }]);
    expect(S.toTerms(P('(x-2)(3x+6)'))).toEqual([{ c: 3, p: 2 }, { c: -12, p: 0 }]);
    expect(S.toTerms(P('x/2'.replace('/2', '')))).toEqual([{ c: 1, p: 1 }]);
    expect(S.toTerms(P('3x-2y'))).toBe(null);
  });
  it('the three twin pairs of the lab', () => {
    const pairs = [['(x+2)(x+3)', 'x²+6', false], ['2x²+2', 'x²+x+2', false], ['(x-2)(3x+3)', '3(x²-1)-3(x+1)', true]];
    for (const [a, b, equal] of pairs) expect(S.samePolynomial(P(a), P(b)), a).toBe(equal);
    const rack = [-3, -2, -1, 0, 1, 2, 3].map((n) => rat(n));
    expect(S.witness(P('(x+2)(x+3)'), P('x²+6'), [rat(0)])).toBe(null);
    expect(ratText(S.witness(P('(x+2)(x+3)'), P('x²+6'), [rat(0), rat(1)]))).toBe('1');
    expect(S.witness(P('(x-2)(3x+3)'), P('3(x²-1)-3(x+1)'), rack)).toBe(null);
    const at = (a, b, x) => { const r = S.pairAt(P(a), P(b), rat(x)); return [ratText(r.left), ratText(r.right)]; };
    expect(at('(x+2)(x+3)', 'x²+6', 0)).toEqual(['6', '6']);
    expect(at('(x+2)(x+3)', 'x²+6', 1)).toEqual(['12', '7']);
    expect(at('(x+2)(x+3)', 'x²+6', -1)).toEqual(['2', '7']);
    expect(at('2x²+2', 'x²+x+2', 0)).toEqual(['2', '2']);
    expect(at('2x²+2', 'x²+x+2', 1)).toEqual(['4', '4']);
    expect(at('2x²+2', 'x²+x+2', 2)).toEqual(['10', '8']);
    expect(at('2x²+2', 'x²+x+2', -1)).toEqual(['4', '2']);
    expect(['-1', '0', '1', '2', '3'].map((x) => at('(x-2)(3x+3)', '3(x²-1)-3(x+1)', x)[0])).toEqual(['0', '-6', '-6', '0', '12']);
  });
});
