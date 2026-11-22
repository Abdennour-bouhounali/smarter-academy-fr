import { describe, it, expect } from 'vitest';
import * as L from './sizeLadder';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';
import { LEVELS } from '../levels';

const run = (s, ...fns) => fns.reduce((acc, f) => f(acc), s);
const hang = (s, n, c) => run(s, (x) => L.moveRung(x, n), L.dockRung, (x) => L.moveCell(x, c), L.dockCell);

describe('size-ladder — logique', () => {
  it('les presets sont ceux de levels.js et leurs cartes tiennent sur l’échelle', () => {
    expect(LEVELS['size-ladder'].beginner.numbers.tasks).toEqual(L.PRESETS.beginner.tasks);
    expect(LEVELS['size-ladder'].advanced.numbers.tasks).toEqual(L.PRESETS.advanced.tasks);
    for (const lv of ['beginner', 'advanced']) for (const raw of L.PRESETS[lv].tasks) {
      const t = L.buildTask(raw);
      for (const c of t.cards) {
        expect(c.n).toBeGreaterThanOrEqual(L.RUNG_MIN); expect(c.n).toBeLessThanOrEqual(L.RUNG_MAX);
        expect(c.n).toBe(T.bracketOf(c.value));
      }
    }
  });
  it('les huit cartes du plan : barreau, case, écriture scientifique, rang de grandeur', () => {
    const exp = { c1: [2, 2, '2,65', 3, 2], c2: [6, 1, '1,95', 2, 6], c3: [-4, 1, '1', 1, -4], c5: [6, 1, '1,2', 1, 6], c6: [-5, 4, '4,8', 5, -5], c7: [7, 1, '1,2742', 1, 7] };
    for (const lv of ['beginner', 'advanced']) for (const raw of L.PRESETS[lv].tasks) {
      if (!exp[raw.id]) continue;
      const c = L.buildTask(raw).cards[0];
      expect([c.n, c.cell, c.sci.a, c.order.a1, c.order.n1]).toEqual(exp[raw.id]);
    }
    const c8 = L.buildTask(L.PRESETS.advanced.tasks[3]).cards;
    expect(c8.map((c) => c.n)).toEqual([-5, -4]);
    expect(T.compareDec(c8[0].value, c8[1].value)).toBe(-1);
    const c4 = L.buildTask(L.PRESETS.beginner.tasks[3]).cards;
    expect(c4.map((c) => c.n)).toEqual([-4, -4]);
    expect(c4.map((c) => c.cell)).toEqual([6, 1]);
  });
  it('barreau : refus avec le calcul, puis accrochage', () => {
    let s = L.init(L.PRESETS.beginner);
    s = run(s, (x) => L.moveRung(x, 3), L.dockRung);
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'below', rung: 3 });
    expect(L.activeState(s).hover).toBeNull();
    expect(L.activeState(s).phase).toBe('rung');
    s = run(s, (x) => L.moveRung(x, 1), L.dockRung);
    expect(s.last).toMatchObject({ reason: 'above', rung: 1 });
    s = run(s, (x) => L.moveRung(x, 2), L.dockRung);
    expect(L.activeState(s).phase).toBe('cell');
    expect(s.trials.filter((t) => t.kind === 'refused')).toHaveLength(2);
  });
  it('case : refus avant / après, puis accrochage ; l’aimant arrondit 2,65 à 3', () => {
    let s = L.init(L.PRESETS.beginner);
    s = run(s, (x) => L.moveRung(x, 2), L.dockRung, (x) => L.moveCell(x, 3), L.dockCell);
    expect(s.last).toMatchObject({ reason: 'cell-before', cell: 3, bound: '300' });
    s = run(s, (x) => L.moveCell(x, 1), L.dockCell);
    expect(s.last).toMatchObject({ reason: 'cell-after', cell: 1, bound: '200' });
    s = run(s, (x) => L.moveCell(x, 2), L.dockCell);
    expect(L.activeState(s).phase).toBe('placed');
    expect(L.taskDone(s)).toBe(false); // l’aimant est requis
    s = L.toggleMagnet(s);
    expect(s.last).toMatchObject({ kind: 'magnet', a1: 3, n1: 2 });
    expect(L.taskDone(s)).toBe(true);
    expect(s.done[0]).toBe(true);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'solved', sci: '2,65|2', order: '3|2' });
    expect(L.canNext(s)).toBe(true);
  });
  it('compare : deux cartes, puis le choix ; mauvais choix = calcul', () => {
    let s = L.init(L.PRESETS.beginner);
    s = { ...s, ti: 3, cs: L.PRESETS.beginner.tasks[3].cards.map(() => ({ phase: 'rung', hover: null, hoverCell: null, rung: null, cell: null, magnet: false, magnetUsed: false, typedOk: true })) };
    s = hang(s, -4, 6);
    expect(L.activeIndex(s)).toBe(1);
    s = hang(s, -4, 1);
    expect(L.pickPending(s)).toBe(true);
    s = L.pickBigger(s, 1);
    expect(s.last).toMatchObject({ reason: 'compare', same: true });
    s = L.pickBigger(s, 0);
    expect(L.taskDone(s)).toBe(true);
    expect(s.crown).toBe(0);
  });
  it('compare sur deux barreaux (9,8 × 10⁻⁵ contre 1,2 × 10⁻⁴)', () => {
    let s = L.init(L.PRESETS.advanced);
    s = { ...s, ti: 3, cs: [0, 1].map(() => ({ phase: 'rung', hover: null, hoverCell: null, rung: null, cell: null, magnet: false, magnetUsed: false, typedOk: true })) };
    s = hang(hang(s, -5, 9), -4, 1);
    s = L.pickBigger(s, 0);
    expect(s.last).toMatchObject({ reason: 'compare', same: false, rungs: [-5, -4] });
    s = L.pickBigger(s, 1);
    expect(L.taskDone(s)).toBe(true);
  });
  it('saisie (متقدم) : valeur fausse, forme fausse, juste', () => {
    let s = L.init(L.PRESETS.advanced); // c5 : 1 200 km = 1 200 000 m
    expect(L.activeState(s).phase).toBe('type');
    s = L.submitTyped(s, '12', '5');
    expect(s.last).toMatchObject({ reason: 'typed-form' });
    s = L.submitTyped(s, '1,2', '3');
    expect(s.last).toMatchObject({ reason: 'typed-value', got: '1\u00a0200', want: '1\u00a0200\u00a0000' });
    s = L.submitTyped(s, '120', '4');
    expect(s.last).toMatchObject({ reason: 'typed-form' });
    s = L.submitTyped(s, '1,2', '6');
    expect(L.activeState(s).phase).toBe('rung');
    expect(s.trials.filter((t) => t.kind === 'typed').map((t) => t.ok)).toEqual([false, false, false, true]);
  });
  it('la faute type de la virgule : 0,048 × 10⁻³ saisi 4,8 × 10⁻¹ est refusé avec sa valeur', () => {
    let s = L.init(L.PRESETS.advanced);
    s = { ...s, ti: 1, cs: [{ phase: 'type', hover: null, hoverCell: null, rung: null, cell: null, magnet: false, magnetUsed: false, typedOk: false }] };
    s = L.submitTyped(s, '4,8', '-1');
    expect(s.last).toMatchObject({ reason: 'typed-value', got: '0,48', want: '0,000048' });
    s = L.submitTyped(s, '4,8', '−5');
    expect(L.activeState(s).phase).toBe('rung');
  });
  it('aimant : la retenue 9,7 × 10³ → 1 × 10⁴ (carte libre)', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.setFree(s, '9,7 × 10^3');
    expect(L.isFree(s)).toBe(true);
    const c = L.activeCard(s);
    expect([c.n, c.cell, c.order]).toEqual([3, 9, { a1: 1, n1: 4 }]);
    s = hang(s, 3, 9);
    expect(L.taskDone(s)).toBe(true);
    s = L.toggleMagnet(s);
    expect(s.last).toMatchObject({ a1: 1, n1: 4 });
  });
  it('carte libre : refus et plages', () => {
    expect(L.parseFree('0').why).toBe('zero');
    expect(L.parseFree('-5').why).toBe('neg');
    expect(L.parseFree('abc').why).toBe('invalid');
    expect(L.parseFree('1 × 10^13').why).toBe('range');
    expect(L.parseFree('5 × 10^-13').why).toBe('range');
    expect(L.parseFree('0,0000000001').why).toBe('range');
    expect(L.parseFree('1234567890123456').why).toBe('digits');
    expect(L.parseFree('35,2 × 10^4').ok).toBe(true);
    expect(L.parseFree('35,2 x 10^4').ok).toBe(true);
    expect(L.parseFree('0,00045').ok).toBe(true);
  });
  it('coachOf accompagne jusqu’à la fin', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s).id).toBe('card');
    s = L.moveRung(s, 0);
    expect(L.coachOf(s).id).toBe('rung');
    s = run(s, (x) => L.moveRung(x, 2), L.dockRung);
    expect(L.coachOf(s).id).toBe('cell');
    s = run(s, (x) => L.moveCell(x, 2), L.dockCell);
    expect(L.coachOf(s).id).toBe('magnet');
    s = L.toggleMagnet(s);
    expect(L.coachOf(s).id).toBe('next');
    let a = L.init(L.PRESETS.advanced);
    expect(L.coachOf(a).id).toBe('type');
  });
  it('un parcours complet mène à la découverte', () => {
    let s = L.init(L.PRESETS.beginner);
    for (let ti = 0; ti < 3; ti += 1) {
      const c = L.activeCard(s);
      s = hang(s, c.n, c.cell);
      s = L.toggleMagnet(s);
      s = L.nextTask(s);
    }
    s = hang(hang(s, -4, 6), -4, 1);
    s = L.pickBigger(s, 0);
    expect(L.allDone(s)).toBe(true);
    expect(L.discoveryKind(s)).toBe('order');
    expect(L.coachOf(s)).toBeNull();
  });
});
