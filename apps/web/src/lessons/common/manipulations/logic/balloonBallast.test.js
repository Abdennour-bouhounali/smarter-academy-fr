import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import * as L from './balloonBallast';
import { LEVELS } from '../levels';

const B = () => L.init(LEVELS['balloon-ballast'].beginner.numbers);
const A = () => L.init(LEVELS['balloon-ballast'].advanced.numbers);
const times = (s, n, f) => { let x = s; for (let i = 0; i < n; i += 1) x = f(x); return x; };

describe('balloon-ballast — logique', () => {
  it('t1 : (+6)+(−4) = attacher 4 sacs, 4 paires verrouillées, altitude +2', () => {
    let s = B();
    expect(L.altitude(s)).toBe(6);
    s = times(s, 4, (x) => L.tie(x, 'bag'));
    expect(L.altitude(s)).toBe(2);
    expect(L.lockedPairs(s)).toBe(4);
    expect(L.gestureOk(s)).toBe(true);
    s = L.answer(s, '2');
    expect(L.taskDone(s)).toBe(true);
  });
  it('la réponse juste ne suffit pas si les gestes ne sont pas ceux de la carte', () => {
    let s = B();
    s = L.answer(s, '2');
    expect(s.last).toMatchObject({ ok: false, model: 'wrongGesture' });
    expect(L.taskDone(s)).toBe(false);
    s = times(s, 4, (x) => L.tie(x, 'token'));
    s = times(s, 4, (x) => L.throwOut(x, 'token'));
    expect(L.gestureOk(s)).toBe(false);
  });
  it('un geste inverse annule le précédent du journal', () => {
    let s = L.tie(B(), 'bag');
    s = L.throwOut(s, 'bag');
    expect(s.log).toEqual([]);
    expect(L.altitude(s)).toBe(6);
  });
  it('chaque modèle d’erreur de t3 et a1 est reconnu', () => {
    const s = L.nextTask(L.nextTask(L.answer(L.answer(times(times(B(), 4, (x) => L.tie(x, 'bag')), 0, (x) => x), '2'), '2')));
    expect(s).toBeTruthy();
    const t3 = L.normalizeTasks([LEVELS['balloon-ballast'].beginner.numbers.tasks[2]])[0];
    expect(L.judgeValue(t3, '-14').model).toBe('addDist');
    expect(L.judgeValue(t3, '4').model).toBe('signFirst');
    expect(L.judgeValue(t3, '-4').ok).toBe(true);
    const t2 = L.normalizeTasks([LEVELS['balloon-ballast'].beginner.numbers.tasks[1]])[0];
    expect(L.judgeValue(t2, '8').model).toBe('signLost');
    expect(L.judgeValue(t2, '-2').model).toBe('subDist');
    const a1 = L.normalizeTasks([LEVELS['balloon-ballast'].advanced.numbers.tasks[0]])[0];
    expect(L.judgeValue(a1, '-10').model).toBe('subNoFlip');
    expect(L.judgeValue(a1, '4').model).toBe('flipBoth');
    expect(L.judgeValue(a1, '٤-').model).toBe('format');
  });
  it('a2 : on ne peut pas jeter un sac absent', () => {
    let s = L.nextTask({ ...A(), done: { 0: true } });
    expect(L.taskOf(s).id).toBe('a2');
    s = L.predict(s, '12');
    expect(s.phase).toBe('act');
    const refused = L.throwOut(s, 'bag');
    expect(refused.refused).toBe(1);
    expect(refused.last.refused).toBe(true);
    expect(L.altitude(refused)).toBe(5);
    expect(L.nextTask(s)).toBe(s);
  });
  it('a2 complet', () => {
    let s = A();
    s = L.nextTask({ ...s, done: { 0: true } });
    expect(L.taskOf(s).id).toBe('a2');
    s = L.predict(s, '-2');
    expect(s.phase).toBe('predict');
    expect(s.ghost).toMatchObject({ kind: 'subNoFlip' });
    s = L.predict(s, '12');
    s = times(s, 7, L.tiePair);
    s = times(s, 7, (x) => L.throwOut(x, 'bag'));
    expect(L.altitude(s)).toBe(12);
    expect(L.taskDone(s)).toBe(true);
  });
  it('a4 : (+6)−(+7) : une paire neutre puis 7 flammes jetées → −1', () => {
    let s = { ...A(), ti: 3, done: { 0: true, 1: true, 2: true } };
    s = { ...L.retryTask(s), done: { 0: true, 1: true, 2: true } };
    s = L.predict(s, '-1');
    s = L.tiePair(s);
    s = times(s, 7, (x) => L.throwOut(x, 'token'));
    expect(L.altitude(s)).toBe(-1);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('balayage : altitude = flammes − sacs après toute suite de gestes, la tâche réussie ⇔ journal et valeur justes', () => {
    for (let a = -12; a <= 12; a += 3) for (let b = -12; b <= 12; b += 4) for (const op of ['+', '-']) {
      const [tk] = L.normalizeTasks([{ id: 'x', a: String(a), op, b: String(b) }]);
      expect(tk.expected).toBe(op === '+' ? R.add(a, b) : R.sub(a, b));
      let s = L.init({ tasks: [{ id: 'x', a: String(a), op, b: String(b) }] });
      const n = tk.need;
      if (n.g === 'throw') {
        const have = n.object === 'token' ? s.t : s.s;
        s = times(s, Math.max(0, n.n - have), L.tiePair);
      }
      s = times(s, n.n, (x) => L.apply(x, n.g, n.object));
      expect(L.altitude(s)).toBe(Number(tk.expected / 100n));
      s = L.answer(s, String(Number(tk.expected / 100n)));
      expect(L.taskDone(s), `${a} ${op} ${b}`).toBe(true);
    }
  });
  it('« جرّب أعدادك » : entiers jusqu’à 12 seulement', () => {
    expect(L.parseFree('-5', '-', '3')).toMatchObject({ op: '-' });
    expect(L.parseFree('13', '+', '3')).toBeNull();
    expect(L.parseFree('1,5', '+', '3')).toBeNull();
    const s = L.setFree(B(), '-5', '-', '3');
    expect(L.isFree(s)).toBe(true);
    expect(L.altitude(s)).toBe(-5);
    expect(L.altitude(L.throwOut(s, 'token'))).toBe(-5);
  });
});
