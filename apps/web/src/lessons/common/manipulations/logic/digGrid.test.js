import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import * as L from './digGrid';
import { LEVELS } from '../levels';

const B = () => L.init(LEVELS['dig-grid'].beginner.numbers);
const A = () => L.init(LEVELS['dig-grid'].advanced.numbers);
const rd = (s, id) => R.pointText(L.readingOf(s, id));

describe('dig-grid — logique', () => {
  it('chaque tâche d’un niveau est bien formée ; d4 n’a aucun piquet, d1–d3 en ont un seul', () => {
    const s = B();
    expect(s.tasks.map((t) => t.answer && R.pointText(t.answer))).toEqual(['(3 ; 3)', '(5 ; 3)', '(3 ; 3)', null]);
    expect(s.tasks.map((t) => t.none)).toEqual([false, false, false, true]);
    // exhaustif : sur les 10 × 8 croisements, d1–d3 ont exactement un piquet qui rend tous les relevés vrais, d4 aucun
    for (const [i, t] of s.tasks.entries()) {
      const good = [];
      for (let c = 0; c <= L.COLS; c += 1) for (let r = 0; r <= L.ROWS; r += 1) {
        const u = L.setStake({ ...L.init({ tasks: LEVELS['dig-grid'].beginner.numbers.tasks.slice(i, i + 1) }) }, c, r);
        if (L.notebook(u).every((n) => n.ok)) good.push([c, r]);
      }
      const start = L.init({ tasks: [LEVELS['dig-grid'].beginner.numbers.tasks[i]] });
      const startOk = L.notebook(start).every((n) => n.ok);
      expect(good.length + (startOk ? 1 : 0) >= 0).toBe(true);
      if (t.none) expect(good).toEqual([]);
      else expect(good).toEqual([[Number(t.answer.x / 100n), Number(t.answer.y / 100n)]]);
    }
  });
  it('d1 : amener le piquet en (3 ; 3) rend la tâche faite ; le carnet lit (2 ; 1)', () => {
    let s = B();
    expect(L.stakeLocked(s)).toBe(false);
    expect(rd(s, 'jar')).toBe('(4 ; 3)');
    s = L.setStake(s, 3, 3);
    expect(rd(s, 'jar')).toBe('(2 ; 1)');
    expect(L.taskDone(s)).toBe(true);
    expect(s.last).toMatchObject({ kind: 'stake', ok: true });
    expect(L.stakeLocked(s)).toBe(true);
    expect(L.setStake(s, 0, 0)).toBe(s);
  });
  it('un relevé échangé est reconnu (swap) : la jarre lue (1 ; 2)', () => {
    const s = L.setStake(B(), 4, 2);
    expect(rd(s, 'jar')).toBe('(1 ; 2)');
    expect(s.last).toMatchObject({ ok: false, model: 'swap' });
    expect(L.taskDone(s)).toBe(false);
  });
  it('d2 : le piquet en (5 ; 3) met le qandil à (−3 ; 2) ; les bornes de la fouille sont tenues', () => {
    let s = L.nextTask(L.setStake(B(), 3, 3));
    expect(L.taskOf(s).id).toBe('d2');
    s = L.setStake(s, 5, 3);
    expect(rd(s, 'lamp')).toBe('(-3 ; 2)');
    expect(L.taskDone(s)).toBe(true);
    expect(L.stakeCells(L.setStake(L.init({}), 99, -4))).toEqual({ c: L.COLS, r: 0 });
  });
  it('d3 : un seul piquet pour les deux relevés', () => {
    let s = B(); s = { ...s, ti: 2 }; s = { ...s, stake: R.point(1, 1) };
    s = L.setStake(s, 3, 3);
    expect(L.taskDone(s)).toBe(true);
  });
  it('d4 : « لا يوجد موضع » est juste ; refusé ailleurs avec le bon piquet en fantôme', () => {
    const s4 = { ...B(), ti: 3 };
    const ok = L.pressNone({ ...s4, stake: R.point(1, 1) });
    expect(ok.last).toMatchObject({ kind: 'none', ok: true });
    expect(L.taskDone(ok)).toBe(true);
    const s1 = L.pressNone(B());
    expect(s1.last).toMatchObject({ kind: 'none', ok: false });
    expect(L.taskDone(s1)).toBe(false);
    expect(R.pointText(s1.ghost.at)).toBe('(3 ; 3)');
    // aucune position du piquet ne termine d4 seul
    let u = { ...s4, stake: R.point(1, 1) };
    for (let c = 0; c <= L.COLS; c += 1) for (let r = 0; r <= L.ROWS; r += 1) u = L.setStake(u, c, r);
    expect(L.taskDone(u)).toBe(false);
  });
  it('p1 : trois relevés écrits, chaque modèle d’erreur est reconnu', () => {
    let s = A();
    expect(L.stakeLocked(s)).toBe(true);
    expect(L.judgeTyped(s, '3 ; -1').ok).toBe(true);
    expect(L.judgeTyped(s, '3 ; 1').model).toBe('signAxis');
    expect(L.judgeTyped(s, '-3 ; -1').model).toBe('signLeft');
    expect(L.judgeTyped(s, '-1 ; 3').model).toBe('swap');
    expect(L.judgeTyped(s, 'x').model).toBe('format');
    s = L.answerTyped(s, '3;−1');
    s = L.answerTyped(s, '1;3');
    expect(L.currentFind(s)).toBe('bead');
    const bad = L.answerTyped(s, '-2;0');
    expect(bad.last).toMatchObject({ ok: false, model: 'onAxis' });
    expect(bad.ghost.kind).toBe('typed');
    expect(L.judgeTyped(s, '0;-2').ok).toBe(true);
    s = L.answerTyped(s, '0 ; −2');
    expect(L.taskDone(s)).toBe(true);
  });
  it('p2 : toucher au demi-mètre ; la bague (2,5 ; −1,5) est en monde (5,5 ; 1,5)', () => {
    let s = { ...A(), ti: 1 }; s = { ...s, stake: R.point(3, 3), ai: 0 };
    expect(L.currentTarget(s).name).toBe('ring');
    const no = L.tapAt(s, 5, 1.5);
    expect(no.last.ok).toBe(false);
    s = L.tapAt(s, 5.5, 1.5);
    expect(s.last).toMatchObject({ ok: true, target: 'ring' });
    s = L.tapAt(s, 1.5, 3);
    expect(L.taskDone(s)).toBe(true);
  });
  it('p3 : la place miroir de la pièce (3 ; −1) est (3 ; 1)', () => {
    const s = { ...A(), ti: 2, stake: R.point(3, 3), ai: 0 };
    expect(L.judgeTyped(s, '3 ; 1').ok).toBe(true);
    expect(L.judgeTyped(s, '3 ; -1').model).toBe('same');
    expect(L.judgeTyped(s, '-3 ; -1').model).toBe('symMix');
    expect(L.judgeTyped(s, '-3 ; 1').model).toBe('bothSigns');
  });
  it('m1 (معارف) : le piquet en (4 ; 2) donne (1 ; 2), (−2 ; 3), (−2 ; −1)', () => {
    const s = L.init({ tasks: [{ id: 'm1', kind: 'typed', stake: '4;2', finds: ['jar', 'lamp', 'plate'] }] });
    expect(['jar', 'lamp', 'plate'].map((f) => rd(s, f))).toEqual(['(1 ; 2)', '(-2 ; 3)', '(-2 ; -1)']);
  });
  it('« جرّب أعدادك » : un point, ni plus de 6, region', () => {
    expect(L.parseFree('−2 ; 3,5')).toEqual(R.point(-2, 3.5));
    expect(L.parseFree('7 ; 1')).toBeNull();
    const s = L.setFree(B(), '-2 ; 3');
    expect(L.isFree(s)).toBe(true);
    expect(L.regionKey(s.free.p)).toBe('q2');
    expect(L.isFree(L.toGuided(s))).toBe(false);
  });
  it('les tâches mal formées sont refusées', () => {
    expect(() => L.init({ tasks: [{ id: 'x', kind: 'stake', notes: [{ find: 'jar', want: '2;1' }], none: true }] })).toThrow();
    expect(() => L.init({ tasks: [{ id: 'x', kind: 'stake', notes: [{ find: 'ghost', want: '2;1' }] }] })).toThrow();
  });
});
