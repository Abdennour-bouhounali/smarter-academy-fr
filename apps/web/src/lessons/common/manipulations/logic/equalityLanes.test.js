import { describe, it, expect } from 'vitest';
import * as L from './equalityLanes';
import * as Q from '@smarter-academy/core/arithmetic/equalities.js';
import { LEVELS } from '../levels';

const LV = LEVELS['equality-lanes'];

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle (la suite d'opérations du but) donne les nombres. */
function play(s0, maxSteps = 300) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    if (c.id === 'who') { s = L.apply(L.setC(L.setWho(s, 'left'), 3)); s = L.undo(s); s = L.setWho(s, 'both'); continue; }
    if (c.id === 'undo') { s = L.undo(s); continue; }
    const plan = Q.findOps(s.cur, L.taskOf(s).target, 2) ?? [];
    const [op, cc] = plan[0] ?? ['add', 1];
    s = L.setOp(L.setC(s, cc), op);
    if (c.id === 'apply' || c.id === 'op' || c.id === 'grab') s = L.apply(s);
  }
  throw new Error(`coach sans fin : ${seen.join(' ')}`);
}

describe('equality-lanes — la logique', () => {
  it('les presets des niveaux sont jouables : chaque cible est atteinte en une ou deux opérations légales', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LV[lv].numbers);
      expect(Q.holds(s.start)).toBe(true);
      for (const t of s.tasks) expect(Q.findOps(s.start, t.target, 2)).not.toBeNull();
    }
    expect(L.init(LV.beginner.numbers).tasks.map((t) => Q.eqTex(t.target))).toEqual(['8 = 4x - 4', '12 = 4x', '30 = 12x - 6', '5 = 2x - 1']);
    expect(L.init(LV.advanced.numbers).tasks.map((t) => Q.eqTex(t.target))).toEqual(['-10 = 6x - 2', '7 = -6x - 1', '-\\dfrac{4}{3} = x']);
  });

  it('une égalité de départ fausse est refusée', () => {
    expect(() => L.init({ left: '3', right: '2x-4', x: '1' })).toThrow();
  });

  it('les deux coureurs : ensemble ils restent à la même graduation ; seul, l’un s’éloigne du poids de c', () => {
    let s = L.init(LV.beginner.numbers);
    expect(L.equal(s)).toBe(true);
    s = L.apply(L.setC(s, -2));
    expect(s.last).toMatchObject({ ok: true, reached: true, who: 'both', after: { left: '8', right: '8' } });
    expect(L.taskDone(s)).toBe(true);
    s = L.init(LV.beginner.numbers);
    s = L.apply(L.setWho(L.setC(s, 4), 'left'));
    expect(s.last).toMatchObject({ ok: false, broke: true, after: { left: '14', right: '10' } });
    expect(s.oneSide).toBe(true);
    expect(Q.sameEq(L.undo(s).cur, L.init(LV.beginner.numbers).start)).toBe(true);
  });

  it('÷ 0 est refusé (aucun essai ne change l’égalité) ; × 0 garde l’égalité vraie mais la vide', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.apply(L.setOp(L.setC(s, 0), 'div'));
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'zero' });
    expect(Q.eqTex(s.cur)).toBe('10 = 4x - 2');
    s = L.apply(L.setOp(L.setC(s, 0), 'mul'));
    expect(s.last).toMatchObject({ ok: true, lost: true });
    expect(Q.eqTex(s.cur)).toBe('0 = 0');
  });

  it('la tâche suivante repart de l’égalité de départ ; la découverte attend un essai d’un seul côté', () => {
    let s = L.init(LV.beginner.numbers);
    for (const [op, c] of [['add', -2], ['add', 2], ['mul', 3], ['div', 2]]) {
      s = L.apply(L.setOp(L.setC(s, c), op));
      expect(L.taskDone(s)).toBe(true);
      expect(L.discoveryReady(s)).toBe(false);
      if (L.canNext(s)) s = L.nextTask(s);
    }
    s = L.apply(L.setWho(L.setC(s, 2), 'right'));
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.witnesses(s).one).toMatchObject({ who: 'right', c: 2 });
    expect(L.witnesses(s).both).toMatchObject({ who: 'both' });
  });

  it('« جرّب أعدادك » : les deux coureurs partent de n, aucune tâche cochée, retour à la tâche', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.setFree(s, '2,5');
    expect(s.free).toEqual({ n: '5/2' });
    s = L.apply(L.setC(s, 3));
    expect(s.last).toMatchObject({ free: true, ok: true, after: { left: '11/2', right: '11/2' } });
    expect(Object.keys(s.done)).toEqual([]);
    expect(L.coachOf(s)).toBeNull();
    expect(L.setFree(s, 'abc')).toBe(s);
    expect(L.toGuided(s).free).toBeNull();
  });

  it('le coach suit la leçon jusqu’au bout, aux deux niveaux', () => {
    for (const lv of ['beginner', 'advanced']) {
      const { s, seen } = play(L.init(LV[lv].numbers));
      expect(L.discoveryReady(s)).toBe(true);
      expect(seen).toContain('who');
      expect(seen[0]).toBe('grab');
    }
  });

  it('le mur contient toujours 0 et les deux coureurs, après chaque opération de −9 à 9', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s0 = L.init(LV[lv].numbers);
      for (const op of L.OPS) for (let c = -9; c <= 9; c += 1) for (const who of L.WHO) {
        const s = L.apply(L.setWho(L.setOp(L.setC(s0, c), op), who));
        if (s.last.kind === 'refused') continue;
        const t = L.trackOf(s);
        const v = L.values(s);
        for (const x of [0, Q.numFloat(v.left), Q.numFloat(v.right)]) expect(t.lo <= x && x <= t.hi).toBe(true);
      }
    }
  });
});
