import { describe, it, expect } from 'vitest';
import * as L from './pitchExpansion';
import { samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';

/**
 * pitch-expansion — la logique PURE du lecteur de mission (rollout 2026-11-11, unité 3 leçon 1 ; conseil du 2026-11-11, « The One Thing to Do
 * First ») : les collisions d'aires, ce qu'une zone montre (`zoneText`), le balayage de CHAQUE x atteignable, et le GEL des défauts de la page
 * (lesson 2 `mutatabiqat-shahira` et la synthèse `wadiya-idmajiya-harfi` jouent ce labo en mode page : rien n'y change).
 */
const play = (expr, ids = null, { simplify = true } = {}) => {
  let s = L.init({ expr, simplify });
  (ids ?? s.cells.map((c) => c.id)).forEach((id) => { s = L.collect(s, id); });
  return s;
};

describe('area collisions (two zones of DIFFERENT degree with the same area at x)', () => {
  it('finds the council\'s fatal case: (3x − 1)(3 + x) at x = 3 shows 27, 27, −3, −3', () => {
    expect(L.areaCollisions('3x-1|3+x', 3)).toEqual([['0-0', '0-1'], ['1-0', '1-1']]);
    expect(L.areaCollisions('3x-1|3+x', 2)).toEqual([]);
  });
  it('3(x + 5) at x = 5: 15 and 15 ; 2(x + 1) at x = 1 ; (x − 1)(x + 2) at x = 2', () => {
    expect(L.areaCollisions('3|x+5', 5)).toHaveLength(1);
    expect(L.areaCollisions('2|x+1', 1)).toHaveLength(1);
    expect(L.areaCollisions('x-1|x+2', 2).length).toBeGreaterThan(0);
  });
  it('same-degree twins are never a collision: (x + 4)² has two 4x strips', () => {
    expect(L.areaCollisions('x+4|x+4', 5)).toEqual([]);
    expect(L.areaCollisions('x+4|x+4', 4).length).toBeGreaterThan(0);   // x² = 16 = 4x : different degrees
  });
});

describe('playerXs: the ruler skips every collision in area mode, and only there', () => {
  it('the council settings: r1 1..9 without 5, r2 1..6 without 3, r1e 2..7, r2e 3..7', () => {
    expect(L.playerXs({ expr: '3|x+5', span: 8, labels: 'area' })).toEqual([1, 2, 3, 4, 6, 7, 8, 9]);
    expect(L.playerXs({ expr: '3x-1|3+x', span: 5, labels: 'area' })).toEqual([1, 2, 4, 5, 6]);
    expect(L.playerXs({ expr: '2|x+1', span: 6, labels: 'area' })).toEqual([2, 3, 4, 5, 6, 7]);
    expect(L.playerXs({ expr: 'x-1|x+2', span: 5, labels: 'area' })).toEqual([3, 4, 5, 6, 7]);
    // terms mode: the whole ruler
    expect(L.playerXs({ expr: '3x-1|3+x', span: 5 })).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('the start x is reachable, and the explicit start wins when it is', () => {
    expect(L.startXOf({ expr: '3|x+5', span: 8, labels: 'area', start: 3 })).toBe(3);
    expect(L.startXOf({ expr: '3x-1|3+x', span: 5, labels: 'area', start: 2 })).toBe(2);
    expect(L.startXOf({ expr: '3x-1|3+x', span: 5, labels: 'area' })).not.toBe(3);
    expect(L.startXOf({ expr: '3x-1|3+x', span: 5, labels: 'area', start: 3 })).not.toBe(3);
  });
  it('snapX lands on a reachable x, in the direction of the move', () => {
    const xs = [1, 2, 4, 5, 6];
    expect(L.snapX(xs, 3, 1)).toBe(4);
    expect(L.snapX(xs, 3, -1)).toBe(2);
    expect(L.snapX(xs, 5.4, 1)).toBe(5);
  });
  it('SWEEP: no reachable x of any area-mode configuration is a collision (every degree mix up to 2x ± 5)', () => {
    const side = ['x', '2x', '3x', 'x+1', 'x+2', 'x+3', 'x+5', 'x-1', 'x-2', '2x-1', '2x+1', '3x-1', '3+x', '2', '3', '4'];
    let n = 0;
    side.forEach((a) => side.forEach((b) => {
      const expr = `${a}|${b}`;
      let xs;
      try { xs = L.playerXs({ expr, span: 8, labels: 'area' }); } catch { return; }
      xs.forEach((x) => { n += 1; expect(L.areaCollisions(expr, x), `${expr} @ ${x}`).toEqual([]); });
    }));
    expect(n).toBeGreaterThan(500);
  });
});

describe('zoneText — one source for the zone, the Descartes cell and the tray chip', () => {
  const s = L.init({ expr: '3x-1|3+x' });
  const [c9x, c3x2, cm3, cmx] = s.cells.map((c) => c.term);
  it('terms mode shows the letter term, with its sign', () => {
    expect(L.zoneText(c9x, 2).tex).toBe('9x');
    expect(L.zoneText(c3x2, 2).tex).toBe('3x^2');
    expect(L.zoneText(cm3, 2)).toMatchObject({ kind: 'term', tex: '-3', removed: true });
    expect(L.zoneText(cmx, 2)).toMatchObject({ tex: '-x', removed: true });
  });
  it('area mode shows a NUMBER at x — negative for a removed zone — and never the letter', () => {
    expect(L.zoneText(c9x, 2, 'area')).toMatchObject({ kind: 'area', tex: '18', value: 18, removed: false });
    expect(L.zoneText(c3x2, 2, 'area').tex).toBe('12');
    expect(L.zoneText(cm3, 2, 'area')).toMatchObject({ tex: '-3', removed: true });
    expect(L.zoneText(cmx, 2, 'area')).toMatchObject({ tex: '-2', removed: true });
    [c9x, c3x2, cm3, cmx].forEach((t) => expect(L.zoneText(t, 4, 'area').tex).not.toMatch(/x/));
  });
  it('a restored zone ((−a)(−b)) is positive in both modes', () => {
    const r = L.init({ expr: 'x-2|2x-1' }).cells.find((c) => c.id === '1-1').term;
    expect(L.zoneText(r, 5).tex).toBe('2');
    expect(L.zoneText(r, 5, 'area')).toMatchObject({ value: 2, removed: false });
  });
});

describe('page defaults are FROZEN (lesson 2 and the synthesis play this lab as a page)', () => {
  it('init / verify / discoveryReady keep their shape and meaning', () => {
    const s = L.init({ expr: '3x-1|3+x' });
    expect(Object.keys(s).sort()).toEqual(['cells', 'collected', 'expr', 'factors', 'kind', 'lastRefusal', 'simplify', 'trials', 'tray'].sort());
    expect(s.simplify).toBe(true);
    const full = play('3x-1|3+x');
    const v = L.verify(full, 2);
    expect(v.trials).toEqual([{ x: 2, ok: true, product: 25, sum: 25, missing: [], sig: L.trayKey(full) }]);
    expect(L.discoveryReady(L.verify(v, 4))).toBe(false);   // simplify: 9x and −x not merged yet
  });
  it('the page start x (min + 2) and the page range are unchanged', () => {
    expect(L.xRange(L.parseExpr('3|x+5'), 9)).toEqual({ min: 1, max: 10 });
    expect(L.xRange(L.parseExpr('3x-1|3+x'), 5)).toEqual({ min: 1, max: 6 });
    expect(L.startXOf({ expr: '3x-1|3+x', span: 5 })).toBe(3);
  });
  it('the synthesis\'s three-term side x+10+x still parses and draws', () => {
    const s = L.init({ expr: 'x+10+x|x' });
    expect(s.factors[0]).toHaveLength(3);
    expect(L.zones(s, 4).width).toBe(18);
    expect(L.kindOf(s.factors)).toBe('distributive');
  });
  it('lesson 2\'s identities keep their kind', () => {
    expect(L.init({ expr: 'x+3' }).kind).toBe('square-sum');
    expect(L.init({ expr: 'x-3' }).kind).toBe('square-diff');
    expect(L.init({ expr: 'x+3|x-3' }).kind).toBe('sum-diff');
  });
});

describe('player verdicts, same move twice, discovery', () => {
  it('a check is a verdict { groups: x, exact }', () => {
    const s = L.verify(play('3|x+5', ['0-0']), 3);
    expect(L.verdictOf(s.trials[0])).toEqual({ groups: 3, exact: false });
    const t = L.verify(play('3|x+5'), 3);
    expect(L.verdictOf(t.trials[0])).toEqual({ groups: 3, exact: true });
  });
  it('the same x with the same tray is the same trial; carrying one more zone makes it new', () => {
    let s = L.verify(play('3|x+5', ['0-0']), 3);
    expect(L.sameTrial(s, 3)).toBe(true);
    s = L.collect(s, '0-1');
    expect(L.sameTrial(s, 3)).toBe(false);
  });
  it('discovery needs every zone, the reduced sum (if asked) and two x', () => {
    let s = play('3|x+5', null, { simplify: false });
    s = L.verify(s, 2);
    expect(L.playerDiscovery(s)).toBe(false);
    expect(L.firstOk(s)).toBe(true);
    expect(L.playerDiscovery(L.verify(s, 4))).toBe(true);
  });
});

describe('predictions: truths computed, judged by the move that settles them', () => {
  it('r2 « the two unhatched zones alone? » is no; « another x? » is yes; terms left after merging = 3', () => {
    const s = L.init({ expr: '3x-1|3+x', simplify: false });
    expect(L.unhatchedIds(s)).toEqual(['0-0', '0-1']);
    expect(L.predictTruth(s, 'unhatched')).toBe('no');
    expect(L.predictTruth(s, 'otherX')).toBe('yes');
    expect(L.predictTruth(L.init({ expr: 'x-2|2x-1' }), 'termsLeft')).toBe('3');
    expect(L.predictOptions(L.init({ expr: 'x-2|2x-1' }), 'termsLeft')).toEqual(['2', '3', '4']);
  });
  it('« unhatched » is judged by a check with exactly those two zones; « otherX » at the second x; termsLeft when reduced', () => {
    const preds = [{ key: 'p1', kind: 'unhatched' }, { key: 'p2', kind: 'otherX' }];
    let s = play('3x-1|3+x', ['0-0'], { simplify: false });
    s = L.verify(s, 2);
    expect(L.judgedPredictions(s, preds)).toEqual([]);
    s = L.verify(L.collect(s, '0-1'), 2);
    expect(L.judgedPredictions(s, preds)).toEqual(['p1']);
    s = L.verify(L.collect(L.collect(s, '1-0'), '1-1'), 2);
    s = L.verify(s, 4);
    // the full check at x = 2 REPLACES the partial one: the component has already heard p1 (it keeps what it heard)
    expect(L.judgedPredictions(s, preds)).toEqual(['p2']);
    expect(L.judgedPredictions(L.init({ expr: 'x-2|2x-1' }), [{ key: 'p', kind: 'termsLeft' }], true)).toEqual(['p']);
    let r = play('x-2|2x-1');
    expect(L.judgedPredictions(r, [{ key: 'p', kind: 'termsLeft' }])).toEqual([]);
    r = L.merge(r, 't0-1', 't1-0');
    expect(L.judgedPredictions(r, [{ key: 'p', kind: 'termsLeft' }])).toEqual(['p']);
  });
});

describe('the coach: the gesture, never the answer', () => {
  it('carry an unhatched zone → the next → check → after a refusal a lit zone → the ruler after one ok x → nothing when done', () => {
    let s = L.init({ expr: '3x-1|3+x', simplify: false });
    expect(L.coachOf(s, { x: 2 })).toMatchObject({ id: 'carry', target: '[data-pitch-zone="0-0"]' });
    s = L.collect(s, '0-0');
    expect(L.coachOf(s, { x: 2 })).toMatchObject({ id: 'carryMore', target: '[data-pitch-zone="0-1"]' });
    s = L.collect(s, '0-1');
    // never a hatched zone before a refusal: the check comes first
    expect(L.coachOf(s, { x: 2 })).toMatchObject({ id: 'check' });
    s = L.verify(s, 2);
    expect(L.coachOf(s, { x: 2 })).toMatchObject({ id: 'missing', target: '[data-pitch-zone="1-0"]' });
    s = L.collect(L.collect(s, '1-0'), '1-1');
    expect(L.coachOf(s, { x: 2 })).toMatchObject({ id: 'check' });
    s = L.verify(s, 2);
    expect(L.coachOf(s, { x: 2 })).toMatchObject({ id: 'ruler' });
    expect(L.coachOf(s, { x: 2, done: true })).toBeNull();
  });
  it('a reducible tray points at a chip', () => {
    const s = play('x-2|2x-1');
    expect(L.coachOf(s, { x: 5 })).toMatchObject({ id: 'merge', target: '[data-tray-chip]' });
  });
});

describe('shownValues lists everything a round screen can show', () => {
  it('areas, sums, sides, factor and terms, the reduced form and the wrong forms', () => {
    const v = L.shownValues({ expr: '3|x+5', span: 8, labels: 'area' });
    const has = (role, x) => v.some((o) => o.role === role && o.v === String(x));
    expect(has('x', 5)).toBe(false);          // skipped (collision)
    expect(has('x', 9)).toBe(true);
    expect(has('side', 14)).toBe(true);       // x + 5 at x = 9
    expect(has('area', 27)).toBe(true);       // 3x at x = 9
    expect(has('sum', 42)).toBe(true);
    expect(has('expansion', '3x + 15')).toBe(true);
    expect(has('expansion', '3x + 5')).toBe(true);   // the « last term not multiplied » decoy
    expect(has('term', '5')).toBe(true);             // the BUILD decoy tile
  });
  it('the reduced form is a real expansion (guard)', () => {
    const s = play('x-2|2x-1');
    expect(samePolynomial(s.tray.map((c) => c.term), [{ c: 2, p: 2 }, { c: -5, p: 1 }, { c: 2, p: 0 }])).toBe(true);
  });
});
