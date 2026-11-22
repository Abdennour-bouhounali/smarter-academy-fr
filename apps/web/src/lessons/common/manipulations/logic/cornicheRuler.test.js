import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import * as L from './cornicheRuler';
import { LEVELS } from '../levels';

const B = () => L.init(LEVELS['corniche-ruler'].beginner.numbers);
const A = () => L.init(LEVELS['corniche-ruler'].advanced.numbers);
const t = (h) => R.text(h);

describe('corniche-ruler — logique', () => {
  it('b1 : origine verrouillée sous la fontaine, +30 et −20', () => {
    let s = B();
    expect(L.pinLocked(s)).toBe(true);
    expect(t(L.abscissa(s, 'kiosk'))).toBe('30');
    expect(t(L.abscissa(s, 'bench'))).toBe('-20');
    s = L.answerRead(s, '30');
    expect(s.last.ok).toBe(true);
    expect(L.taskDone(s)).toBe(false);
    s = L.answerRead(s, '−20');
    expect(L.taskDone(s)).toBe(true);
  });
  it('chaque modèle d’erreur de lecture est reconnu', () => {
    const s = B();
    expect(L.judgeRead(s, 'kiosk', '3').model).toBe('unitIgnored');
    expect(L.judgeRead(s, 'kiosk', '-30').model).toBe('signSide');
    expect(L.judgeRead(s, 'kiosk', '17').model).toBe('other');
    expect(L.judgeRead(s, 'kiosk', 'abc').model).toBe('format');
    expect(L.judgeRead(s, 'kiosk', '٣٠').ok).toBe(true);
    const bad = L.answerRead(s, '3');
    expect(bad.ghost).toMatchObject({ kind: 'unit' });
    expect(L.taskDone(bad)).toBe(false);
  });
  it('b2 : lire seulement après avoir amené l’origine sous le banc ; l’ancienne abscisse est « originFixed »', () => {
    let s = L.nextTask(L.answerRead(L.answerRead(B(), '30'), '-20'));
    expect(L.taskOf(s).id).toBe('b2');
    expect(L.canRead(s)).toBe(false);
    for (let i = 0; i < 2; i += 1) s = L.movePin(s, -1);
    expect(t(s.pin)).toBe('-20');
    expect(L.canRead(s)).toBe(true);
    expect(t(L.abscissa(s, 'kiosk'))).toBe('50');
    expect(L.judgeRead(s, 'kiosk', '30').model).toBe('originFixed');
    expect(L.judgeRead(s, 'kiosk', '50').ok).toBe(true);
    expect(L.judgeRead(s, 'fountain', '20').ok).toBe(true);
  });
  it('b3 : une seule origine rend le lampadaire et le palmier opposés (−10)', () => {
    let s = L.init({ tasks: [LEVELS['corniche-ruler'].beginner.numbers.tasks[2]] });
    const good = [];
    for (let p = -60; p <= 60; p += 10) {
      const u = L.setPin(s, p * 100);
      if (L.taskDone(u)) good.push(p);
    }
    expect(good).toEqual([-10]);
    const u = L.setPin(s, -1000);
    expect(t(L.abscissa(u, 'lamp'))).toBe('-30');
    expect(t(L.abscissa(u, 'palm'))).toBe('30');
    expect(L.setPin(s, 1000).last.model).toBe('notOpposite');
  });
  it('b4 : l’arrêt de bus tombe entre deux graduations (−35)', () => {
    const s = L.init({ tasks: [LEVELS['corniche-ruler'].beginner.numbers.tasks[3]] });
    expect(t(L.abscissa(s, 'bus'))).toBe('-35');
    expect(L.judgeRead(s, 'bus', '-35').ok).toBe(true);
    expect(L.judgeRead(s, 'bus', '-3,5').model).toBe('unitIgnored');
  });
  it('متقدم : la plus petite graduation de chaque tâche est celle du plan', () => {
    const want = { a1: 2500n, a2: 10n, a3: 10000n };
    let s = A();
    for (const task of s.tasks) expect(task.best).toBe(want[task.id]);
    // a1 avec 20 : un point hors planche ; avec 25 : accepté, puis trois touches
    const idx = (v) => L.NOTCHES.indexOf(v);
    let u = L.setStep(s, idx('20'));
    u = L.confirmStep(u);
    expect(u.confirmed).toBe(false);
    expect(u.last).toMatchObject({ kind: 'step', ok: false, off: 1 });
    u = L.setStep(u, idx('25'));
    u = L.confirmStep(u);
    expect(u.confirmed).toBe(true);
    const cells = [-2, 3, 6];
    for (const c of cells) { u = L.tapCell(L.tapCell(u, c + 1), c); }
    expect(L.taskDone(u)).toBe(true);
    // a2 : 0,5 laisse des points entre deux graduations
    let v = L.nextTask(u); v = L.nextTask(L.nextTask(v) === v ? v : v);
    v = L.setStep(L.nextTask(u), idx('0,5'));
    expect(L.confirmStep(v).last.between).toBeGreaterThan(0);
  });
  it('balayage : le levier ne fixe que le plus petit cran qui convient', () => {
    for (const task of A().tasks) {
      const ok = L.NOTCHES.filter((n) => { const r = R.boardFit(task.marks.map((m) => m.x), n, L.HALF); return r.fits && r.between.length === 0; });
      expect(ok.length).toBeGreaterThan(0);
      expect(R.parse(ok[0])).toBe(task.best);
    }
  });
  it('« جرّب أعدادك » : quatre abscisses au plus, jamais comptées', () => {
    expect(L.parseFree('1 2 3 4 5')).toBeNull();
    expect(L.parseFree('abc')).toBeNull();
    const s = L.setFree(B(), '−35 20 0,5');
    expect(s.free.marks).toHaveLength(3);
    expect(L.isFit(s)).toBe(true);
    expect(L.fit(s).between.length).toBeGreaterThan(0);
    expect(s.last.free).toBe(true);
    expect(L.toGuided(s).free).toBeNull();
  });
  it('retryTask : la même tâche repart de zéro', () => {
    let s = L.answerRead(L.answerRead(B(), '30'), '-20');
    expect(L.taskDone(s)).toBe(true);
    s = L.retryTask(s);
    expect(L.taskDone(s)).toBe(false);
    expect(s.ai).toBe(0);
  });
});
