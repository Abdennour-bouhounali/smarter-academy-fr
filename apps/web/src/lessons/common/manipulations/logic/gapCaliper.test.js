import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import * as L from './gapCaliper';
import { LEVELS } from '../levels';

const run = (s, ...fns) => fns.reduce((acc, f) => f(acc), s);
const open = (d) => (s) => L.setOpen(s, R.parse(d));

describe('gap-caliper — logique', () => {
  it('les tâches des deux niveaux sont bien formées', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LEVELS['gap-caliper'][lv].numbers);
      expect(s.tasks.length).toBeGreaterThan(0);
    }
    expect(() => L.init({ tasks: [{ id: 'x', anchor: '-4', target: '-4' }] })).toThrow();
    expect(() => L.init({ tasks: [{ id: 'x', kind: 'swing', anchor: '11', d: '4' }] })).toThrow();
  });
  it('g1 : −4 et +9, le compas traverse le zéro ; 5 reste court (subDist), 13 touche', () => {
    let s = L.init(LEVELS['gap-caliper'].beginner.numbers);
    expect(L.jawAt(s)).toBe(-400n);
    s = run(s, open('5'), L.fix);
    expect(s.last).toMatchObject({ kind: 'fix', ok: false, model: 'subDist', landed: '1' });
    expect(s.ghost.kind).toBe('miss');
    s = run(s, open('13'), L.fix);
    expect(s.last).toMatchObject({ ok: true, landed: '9' });
    expect(s.phase).toBe('say');
    s = L.answerGap(s, '-13');
    expect(s.last).toMatchObject({ ok: false, model: 'neg' });
    expect(s.ghost.kind).toBe('crossed');
    s = L.answerGap(s, '13');
    expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
  });
  it('g2 : −7 et −2, 9 dépasse le zéro (addSame) ; la distance est 5', () => {
    let s = L.nextTask(run(L.init(LEVELS['gap-caliper'].beginner.numbers), open('13'), L.fix, (x) => L.answerGap(x, '13')));
    expect(L.taskOf(s).id).toBe('g2');
    s = run(s, open('9'), L.fix);
    expect(s.last).toMatchObject({ ok: false, model: 'addSame', landed: '2' });
    s = run(s, open('5'), L.fix);
    expect(s.last.ok).toBe(true);
  });
  it('la vis ne dépasse pas le thermomètre et reste ≥ 0', () => {
    let s = L.init(LEVELS['gap-caliper'].beginner.numbers);
    s = L.setOpen(s, 5000n);
    expect(L.jawAt(s)).toBe(L.MAX);
    s = L.setOpen(s, -300n);
    expect(s.d).toBe(0n);
  });
  it('avancé : la prédiction précède la vis ; un négatif est refusé ; a3 ouvre vers le bas', () => {
    let s = L.init(LEVELS['gap-caliper'].advanced.numbers);
    expect(s.phase).toBe('predict');
    expect(L.screwOpen(s)).toBe(false);
    s = L.answerGap(s, '-8,5');
    expect(s.last).toMatchObject({ kind: 'predict', ok: false, model: 'neg' });
    expect(s.phase).toBe('predict');
    s = L.answerGap(s, '8,5');
    expect(s.phase).toBe('open');
    s = run(s, open('8.5'), L.fix);
    expect(L.taskDone(s)).toBe(true);
    // a2 : deux réponses
    s = L.nextTask(s);
    expect(s.phase).toBe('swing');
    s = L.answerFound(s, '5,5');
    expect(s.found).toEqual({ up: true, down: false });
    s = L.setDir(s, 'down');
    s = L.answerFound(s, '2,5');
    expect(s.last.model).toBe('signSwap');
    s = L.answerFound(s, '-2,5');
    expect(L.taskDone(s)).toBe(true);
    // a3 : serré sur la graine du haut, ouvert vers le bas
    s = L.nextTask(s);
    expect(L.taskOf(s).dir).toBe('down');
    s = L.answerGap(s, '9,5');
    s = run(s, open('9.5'), L.fix);
    expect(L.taskDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('mode libre : deux lectures, la distance et les deux parties autour du zéro', () => {
    let s = L.init(LEVELS['gap-caliper'].beginner.numbers);
    s = L.setFree(s, '-3 ; 5,5');
    expect(L.freeInfo(s)).toMatchObject({ gap: 850n, crosses: true, below: 300n, above: 550n });
    expect(L.setFree(s, '-30 ; 2')).toBe(s);
    expect(L.freeInfo(L.setFree(s, '4 ; 9'))).toMatchObject({ gap: 500n, crosses: false });
    s = L.toGuided(s);
    expect(s.free).toBeNull();
  });
});
