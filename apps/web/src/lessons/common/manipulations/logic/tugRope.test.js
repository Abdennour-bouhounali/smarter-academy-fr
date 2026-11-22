import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import * as L from './tugRope';
import { LEVELS } from '../levels';

const B = () => L.init(LEVELS['tug-rope'].beginner.numbers);
const A = () => L.init(LEVELS['tug-rope'].advanced.numbers);
/** Arrange correctement tous les enfants de l'étape courante : retourne les « − », envoie selon le signe. */
const arrange = (s0, order) => {
  let s = s0;
  const ids = order ?? s.kids.map((k) => k.i);
  for (const i of ids) {
    const k = s.kids[i];
    if (k.op === '-') s = L.turn(s, i);
    const c = L.bib(s.kids[i]);
    s = L.send(s, i, c < 0n ? 'left' : 'right');
  }
  return s;
};

describe('tug-rope — logique', () => {
  it('t1 : (+7)+(−3)+(+5)+(−6) : 12 / 9, ruban à +3', () => {
    let s = arrange(B());
    expect(L.teams(s)).toMatchObject({ right: 1200n, left: 900n, mark: 300n });
    s = L.whistle(s);
    expect(s.pulled).toMatchObject({ ok: true, mark: 300n });
    expect(s.phase).toBe('read');
    s = L.answer(s, '3');
    expect(L.taskDone(s)).toBe(true);
  });
  it('t2 : deux retournements, 5 / 17, ruban à −12 ; sans retourner, le ruban va ailleurs avec un fantôme', () => {
    const bad = L.nextTask({ ...B(), done: { 0: true } });
    expect(L.taskOf(bad).id).toBe('t2');
    let s = bad;
    for (const k of s.kids) s = L.send(s, k.i, L.bib(k) < 0n ? 'left' : 'right');
    expect(L.badKids(s).map((b) => b.why)).toEqual(['noTurn', 'noTurn']);
    s = L.whistle(s);
    expect(s.pulled.ok).toBe(false);
    expect(s.ghost).toMatchObject({ kind: 'noTurn', at: -1200n });
    expect(s.pulled.mark).toBe(-1600n);
    expect(s.phase).toBe('act');
    s = arrange(L.retryTask({ ...bad, done: {} }));
    expect(L.teams(s)).toMatchObject({ right: 500n, left: 1700n });
    s = L.whistle(s);
    expect(s.pulled.mark).toBe(-1200n);
  });
  it('turnAll : retourner un terme ajouté est signalé', () => {
    let s = B();
    s = L.turn(s, 0);
    expect(L.badKids(s)[0]).toEqual({ i: 0, why: 'turnAll' });
    expect(L.scoreboard(s).red[0]).toBe(true);
  });
  it('t3 : deux paires opposées, ruban à −3 ; l’ordre d’envoi ne change rien', () => {
    const t3 = L.nextTask(L.nextTask({ ...B(), done: { 0: true, 1: true } }));
    expect(L.taskOf(t3).id).toBe('t3');
    const orders = [[0, 1, 2, 3, 4], [4, 3, 2, 1, 0], [2, 0, 4, 1, 3]];
    for (const o of orders) {
      const s = L.whistle(arrange(t3, o));
      expect(s.pulled.mark).toBe(-300n);
    }
  });
  it('a1 : 22,5 / 15 → +7,5 ; la position est écrite avant', () => {
    let s = A();
    expect(s.phase).toBe('predict');
    expect(L.gesturesOpen(s)).toBe(false);
    s = L.predict(s, '7');
    expect(s.phase).toBe('predict');
    expect(s.ghost).toMatchObject({ kind: 'other' });
    s = L.predict(s, '-7,5');
    expect(s.ghost).toMatchObject({ kind: 'flipSign' });
    s = L.predict(s, '7,5');
    expect(s.phase).toBe('act');
    s = arrange(s);
    expect(L.teams(s)).toMatchObject({ right: 2250n, left: 1500n });
    s = L.whistle(s);
    expect(L.taskDone(s)).toBe(true);
  });
  it('a2 : le petit équipage se règle d’abord (+5), puis −(+5) et 12 : +7 ; erreur BRACKETDROP = +17', () => {
    const s0 = L.nextTask({ ...A(), done: { 0: true } });
    expect(L.taskOf(s0).id).toBe('a2');
    expect(L.judgeValue(L.taskOf(s0), '17').model).toBe('bracketDrop');
    expect(L.judgeValue(L.taskOf(s0), '12').model).toBe('other');
    let s = L.predict(s0, '7');
    expect(s.kids).toHaveLength(3);
    s = L.whistle(arrange(s));
    expect(s.stage).toBe(1);
    expect(s.innerDone).toBe(500n);
    expect(s.kids).toHaveLength(2);
    expect(s.kids[1]).toMatchObject({ op: '-', v: 500n, fromGroup: true });
    s = L.whistle(arrange(s));
    expect(L.taskDone(s)).toBe(true);
    expect(s.pulled.mark).toBe(700n);
  });
  it('a3 : écriture simplifiée −15+4+8+3 : 15 / 15 → 0', () => {
    let s = L.predict(L.nextTask(L.nextTask({ ...A(), done: { 0: true, 1: true } })), '0');
    s = L.whistle(arrange(s));
    expect(s.pulled.mark).toBe(0n);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('noTurn typé : −22 pour t2 est la somme des nombres imprimés', () => {
    const t2 = L.normalizeTasks([{ id: 'x', chain: '(-8)-(+3)+(-6)-(-5)' }])[0];
    expect(t2.noTurn).toBe(-800n + 300n - 600n - 500n);
    expect(L.judgeValue(t2, '-16').model).toBe('noTurn');
    expect(L.judgeValue(t2, '12').model).toBe('flipSign');
    expect(L.judgeValue(t2, 'x').model).toBe('format');
  });
  it('balayage : n’importe quelle chaîne arrangée juste donne la somme algébrique exacte', () => {
    let seed = 3;
    const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
    for (let k = 0; k < 200; k += 1) {
      const n = 2 + rnd(5);
      const txt = Array.from({ length: n }, (_, i) => {
        const v = rnd(41) - 20 + (rnd(3) === 0 ? 0.5 : 0);
        return `${i ? (rnd(2) ? '+' : '-') : ''}(${v < 0 ? '-' : '+'}${R.text(BigInt(Math.round(Math.abs(v) * 100)))})`;
      }).join('');
      let s = L.init({ tasks: [{ id: 'x', chain: txt }] });
      const ids = s.kids.map((q) => q.i).sort(() => rnd(3) - 1);
      s = L.whistle(arrange(s, ids));
      expect(s.pulled.mark, txt).toBe(R.algebraicSum(R.terms(txt)));
      expect(s.pulled.ok, txt).toBe(true);
    }
  });
  it('« جرّب أعدادك » : 2 à 6 termes, |terme| ≤ 20', () => {
    expect(L.parseFree('-5 - 3 + 2')).not.toBeNull();
    expect(L.parseFree('5')).toBeNull();
    expect(L.parseFree('21 + 1')).toBeNull();
    expect(L.parseFree('(+1)-[(+2)+(+3)]')).toBeNull();
    let s = L.setFree(B(), '-5 - 3 + 2');
    expect(L.isFree(s)).toBe(true);
    s = arrange(s);
    s = L.whistle(s);
    expect(s.pulled.mark).toBe(-600n);
    expect(L.taskDone(s)).toBe(false);
  });
});
