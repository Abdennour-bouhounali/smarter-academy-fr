import { describe, it, expect } from 'vitest';
import * as L from './termFerry';
import * as Q from '@smarter-academy/core/arithmetic/equalities.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { LEVELS } from '../levels';

const LV = LEVELS['term-ferry'];

/** Joue la tâche courante : traverser en changeant de signe tout ce qui doit l'être, puis diviser. */
function solveTask(s0) {
  let s = s0;
  for (let g = 0; g < 8 && !L.shape(s); g += 1) {
    const cr = L.crates(s);
    const pick = cr.find((c) => c.kind === 'x' && c.side === 'R') ?? cr.find((c) => c.kind === 'n' && c.side === 'L');
    s = L.move(s, pick.id, true);
  }
  const a = Lin.toNumber(L.shape(s).a);
  s = L.divide(L.setC(s, a));
  return s;
}

/** Suit l'onboarding jusqu'au bout. */
function followCoach(s0, maxSteps = 200) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    if (c.id === 'check') { s = L.check(s); continue; }
    if (c.id === 'tryKeep') { const cr = L.crates(s)[0] ?? Q.crates(L.taskOf(s).eq)[0]; s = L.move(s, cr.id, false); continue; }
    if (c.id === 'divide') { s = L.setC(s, Lin.toNumber(L.shape(s).a)); continue; }
    if (c.id === 'go') { s = L.divide(s); continue; }
    const cr = L.crates(s);
    const pick = cr.find((k) => k.kind === 'x' && k.side === 'R') ?? cr.find((k) => k.kind === 'n' && k.side === 'L');
    s = L.move(s, pick.id, true);
  }
  throw new Error(`coach sans fin : ${seen.join(' ')}`);
}

describe('term-ferry — la logique', () => {
  it('les presets sont jouables et leurs solutions sont celles attendues', () => {
    expect(L.init(LV.beginner.numbers).tasks.map((t) => Lin.fracText(t.eq.x))).toEqual(['3', '5']);
    expect(L.init(LV.advanced.numbers).tasks.map((t) => Lin.fracText(t.eq.x))).toEqual(['-2', '3', '300']);
  });

  it('une équation sans solution unique ou de solution nulle est refusée', () => {
    expect(() => L.init({ tasks: [{ left: '2x+1', right: '2x+5' }] })).toThrow();
    expect(() => L.init({ tasks: [{ left: '2x', right: 'x' }] })).toThrow();
  });

  it('traverser en changeant le signe garde la solution ; garder le signe est refusé avec les valeurs en x*', () => {
    let s = L.init(LV.advanced.numbers);
    s = L.move(s, 'R:x', false);
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'sign', ok: false });
    expect(s.keepTried).toBe(true);
    expect(Q.eqTex(s.cur)).toBe('9x + 1 = 5x - 7');
    s = L.move(s, 'R:x', true);
    expect(s.last).toMatchObject({ kind: 'move', ok: true, op: '-5' });
    expect(Q.eqTex(s.cur)).toBe('4x + 1 = -7');
    expect(s.lines.op).toBe('9x + 1 - 5x = 5x - 7 - 5x');
  });

  it('x seul : « اقسم » est possible, ÷ 0 refusé ; ÷ a donne x = …, la tâche est faite ; undo revient en arrière', () => {
    let s = L.init(LV.advanced.numbers);
    s = L.move(L.move(s, 'R:x', true), 'L:n', true);
    expect(Q.eqTex(s.cur)).toBe('4x = -8');
    expect(L.canDivide(s)).toBe(true);
    s = L.divide(L.setC(s, 0));
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'zero' });
    s = L.divide(L.setC(s, 2));
    expect(Q.eqTex(s.cur)).toBe('2x = -4');
    expect(L.taskDone(s)).toBe(false);
    s = L.divide(L.setC(s, 2));
    expect(L.solved(s) && L.taskDone(s)).toBe(true);
    expect(s.last).toMatchObject({ solved: true, solution: '-2' });
    s = L.undo(s);
    expect(L.taskDone(s)).toBe(false);
    expect(Q.eqTex(s.cur)).toBe('2x = -4');
  });

  it('chaque tâche des deux niveaux se résout, et « عوّض » vérifie la solution dans l’équation de départ', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(LV[lv].numbers);
      for (let i = 0; i < s.tasks.length; i += 1) {
        s = solveTask(s);
        expect(L.solved(s), `${lv} ${i}`).toBe(true);
        s = L.check(s);
        expect(s.last).toMatchObject({ kind: 'check', ok: true });
        if (L.canNext(s)) s = L.nextTask(s);
      }
      expect(s.tasks.every((_, i) => s.done[i])).toBe(true);
    }
  });

  it('la découverte attend toutes les tâches ET un essai « كما هو » refusé', () => {
    let s = L.init(LV.beginner.numbers);
    for (let i = 0; i < 2; i += 1) { s = solveTask(s); if (L.canNext(s)) s = L.nextTask(s); }
    expect(L.discoveryReady(s)).toBe(false);
    s = L.move(s, Q.crates(s.cur).length ? 'L:x' : 'L:n', false);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.witnesses(s).refused).toMatchObject({ reason: 'sign' });
  });

  it('« جرّب أعدادك » : son équation, solution non nulle, aucune tâche cochée', () => {
    let s = L.init(LV.beginner.numbers);
    expect(L.parseFree('2x+9 = 5x-3').eq).toBeTruthy();
    expect(L.parseFree('2x = x').error).toBe('zero');
    expect(L.parseFree('2x+1 = 2x+3').error).toBe('bad');
    expect(L.parseFree('xx').error).toBe('bad');
    s = L.setFree(s, '2x+9 = 5x-3');
    expect(s.free).toBeTruthy();
    s = solveTask({ ...s, tasks: s.tasks });
    expect(Object.keys(s.done)).toEqual([]);
    expect(L.coachOf(s)).toBeNull();
    expect(L.toGuided(s).free).toBeNull();
  });

  it('le coach suit la leçon jusqu’au bout, aux deux niveaux', () => {
    for (const lv of ['beginner', 'advanced']) {
      const { s, seen } = followCoach(L.init(LV[lv].numbers));
      expect(L.discoveryReady(s)).toBe(true);
      expect(seen[0]).toBe('carry');
      expect(seen).toContain('check');
      expect(seen).toContain('tryKeep');
    }
  });
});
