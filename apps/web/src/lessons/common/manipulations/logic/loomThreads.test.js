import { describe, it, expect } from 'vitest';
import * as L from './loomThreads';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { LEVELS } from '../levels';

const LV = LEVELS['loom-threads'];
const grid = (lo, hi, m) => { const out = []; for (let n = lo * m; n <= hi * m; n += 1) out.push(Lin.frac(n, m)); return out; };
const halves = grid(-5, 5, 2);
const withPair = (a, b, step = '1/2') => L.setFree(L.init({ step, tasks: [{ id: 'x', kind: 'swap', a: '0', b: '1' }] }), Lin.fracText(a), Lin.fracText(b));

/** Cherche un plan (liste d'étapes) qui atteint le but de la tâche courante, sur la grille légale de l'outil. */
function solve(s) {
  const tries = [];
  for (const tool of L.TOOLS) for (const c of grid(...L.RANGE[tool], Lin.toNumber(s.step) === 1 ? 1 : 2)) tries.push([tool, c]);
  for (const [t1, c1] of tries) {
    let s1 = L.dragKnot(L.setTool(s, t1), c1);
    if (L.reached(s1)) return [[t1, c1]];
    if (L.canStage(s1)) {
      s1 = L.addStage(s1);
      for (const [t2, c2] of tries) {
        const s2 = L.dragKnot(L.setTool(s1, t2), c2);
        if (L.reached(s2)) return [[t1, c1], [t2, c2]];
      }
    }
  }
  return null;
}
const play = (s, plan) => {
  plan.forEach(([tool, c], i) => {
    if (i > 0) s = L.addStage(s);
    s = L.dragKnot(L.setTool(s, tool), c);
  });
  return L.tie(s);
};

describe('loom-threads — la logique', () => {
  it('les presets sont jouables : chaque tâche a une solution légale et seulement les bonnes', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LV[lv].numbers);
      for (let i = 0; i < s.tasks.length; i += 1) expect(solve({ ...s, ti: i }), `${lv} ${i}`).not.toBeNull();
    }
    const adv = L.init(LV.advanced.numbers);
    expect(solve(adv)).toHaveLength(2);
  });

  it('les clés exactes du plan : T1 swap = clou négatif ; T2 −3 ; T3 0 ; reach2 deux routes ; bande ; −1/2', () => {
    const b = L.init(LV.beginner.numbers);
    const keys = [];
    for (const c of grid(-3, 3, 1)) {
      const s = L.dragKnot(L.setTool(b, 'nail'), c);
      keys.push([Lin.fracText(c), L.reached(s)]);
    }
    expect(keys.filter(([, ok]) => ok).map(([c]) => c)).toEqual(['-3', '-2', '-1']);
    for (const c of grid(-6, 6, 1)) expect(L.reached(L.dragKnot(L.setTool(b, 'comb'), c)), `comb ${Lin.fracText(c)}`).toBe(false);
    const t2 = { ...b, ti: 1 };
    expect(grid(-3, 3, 1).filter((c) => L.reached(L.dragKnot(L.setTool(t2, 'nail'), c))).map(Lin.fracText)).toEqual(['-3']);
    const t3 = { ...b, ti: 2 };
    expect(grid(-3, 3, 1).filter((c) => L.reached(L.dragKnot(L.setTool(t3, 'nail'), c))).map(Lin.fracText)).toEqual(['0']);
    const a = L.init(LV.advanced.numbers);
    const r1 = play(a, [['nail', Lin.frac(-2)], ['comb', Lin.frac(2)]]);
    expect(r1.last).toMatchObject({ reached: true, a2: '5', b2: '0' });
    const r2 = play(a, [['comb', Lin.frac(-1)], ['nail', Lin.frac(-2)]]);
    expect(r2.last.reached).toBe(true);
    const band = { ...a, ti: 1 };
    expect(play(band, [['nail', Lin.frac(-2)]]).last).toMatchObject({ reached: true, edge: '-6', side: 'right' });
    expect(play(band, [['nail', Lin.frac(-1)], ['comb', Lin.frac(-3)]]).last.reached).toBe(true);
    expect(play(band, [['nail', Lin.frac(2)]]).last).toMatchObject({ reached: false, edge: '6', side: 'left' });
    expect(play(band, [['comb', Lin.frac(-6)]]).last).toMatchObject({ reached: false, edge: '-3', side: 'left' });
    const t3a = { ...a, ti: 2 };
    expect(play(t3a, [['nail', Lin.frac(-1, 2)]]).last).toMatchObject({ reached: true, a2: '-1', b2: '-3/2' });
  });

  it('BALAYAGE : pour toute paire a < b (demis, −5…5) et tout c de chaque portée, croisement ⇔ clou c < 0 ; le peigne ne croise jamais ; × 0 écrase', () => {
    let n = 0;
    for (const a of halves) for (const b of halves) {
      if (Lin.cmp(a, b) >= 0) continue;
      const base = withPair(a, b);
      for (const c of grid(-6, 6, 2)) {
        const comb = L.crossed(L.dragKnot(L.setTool(base, 'comb'), c));
        expect(comb, `comb ${Lin.fracText(a)} ${Lin.fracText(b)} ${Lin.fracText(c)}`).toBe(false);
      }
      for (const c of grid(-3, 3, 2)) {
        const s = L.dragKnot(L.setTool(base, 'nail'), c);
        expect(L.crossed(s), `nail ${Lin.fracText(a)} ${Lin.fracText(b)} ${Lin.fracText(c)}`).toBe(Lin.cmp(c, 0) < 0);
        expect(L.collapsed(s)).toBe(Lin.cmp(c, 0) === 0);
        const [x, y] = L.images(s);
        expect(L.relOf(x, y)).toBe(Lin.cmp(c, 0) < 0 ? '>' : Lin.cmp(c, 0) === 0 ? '=' : '<');
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(2000);
  });

  it('la bande x < 3 : le bord et le côté sont ceux de imageRay pour toute étape de la portée', () => {
    const a = { ...L.init(LV.advanced.numbers), ti: 1 };
    for (const c of grid(-3, 3, 2)) {
      const b = L.bandImage(L.dragKnot(L.setTool(a, 'nail'), c));
      if (Lin.cmp(c, 0) === 0) expect(b.collapsed).toBe(true);
      else { expect(Lin.eq(b.bound, Lin.mul(3, c))).toBe(true); expect(b.rel).toBe(Lin.cmp(c, 0) < 0 ? '>' : '<'); }
    }
    for (const c of grid(-6, 6, 2)) {
      const b = L.bandImage(L.dragKnot(L.setTool(a, 'comb'), c));
      expect(b.rel).toBe('<');
      expect(Lin.eq(b.bound, Lin.add(3, c))).toBe(true);
    }
  });

  it('le nœud suit le pas et la portée de l\'outil ; changer d\'outil le remet à l\'identité', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.setTool(s, 'nail');
    expect(Lin.fracText(s.v)).toBe('1');
    s = L.dragKnot(s, 7.4);
    expect(Lin.fracText(s.v)).toBe('3');
    s = L.setTool(s, 'comb');
    expect(Lin.fracText(s.v)).toBe('0');
    s = L.dragKnot(s, -9);
    expect(Lin.fracText(s.v)).toBe('-6');
    const half = L.init(LV.advanced.numbers);
    expect(Lin.fracText(L.dragKnot(L.setTool(half, 'nail'), -0.4).v)).toBe('-1/2');
    expect(Lin.fracText(L.nudge(L.setTool(half, 'nail'), -1).v)).toBe('1/2');
  });

  it('en libre : a et b sont des demis de −5 à 5, a ≠ b ; aucune tâche cochée ; les essais sont marqués libres', () => {
    let s = L.init(LV.beginner.numbers);
    expect(L.setFree(s, '9', '2')).toBe(s);
    expect(L.setFree(s, '1', '1')).toBe(s);
    expect(L.setFree(s, '1,3', '2')).toBe(s);
    s = L.setFree(s, '3', '-1,5');
    expect(Lin.fracText(s.free.a)).toBe('-3/2');
    s = L.tie(L.dragKnot(L.setTool(s, 'nail'), -2));
    expect(s.last).toMatchObject({ free: true, crossed: true, a2: '3', b2: '-6' });
    expect(L.taskDone(s)).toBe(false);
    expect(s.negTried).toBe(false);
    s = L.tie(L.dragKnot(L.setTool(L.toGuided(s), 'comb'), -4));
    expect(s.negTried).toBe(true);
  });

  it('la découverte exige TOUTES les tâches et l\'essai du peigne négatif ; les témoins sont ses essais', () => {
    let s = L.init(LV.beginner.numbers);
    for (let i = 0; i < s.tasks.length; i += 1) {
      s = { ...s, ti: i };
      s = play(s, solve(s));
    }
    expect(s.tasks.every((_, i) => s.done[i])).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.tie(L.dragKnot(L.setTool({ ...s, ti: 0 }, 'comb'), -4));
    expect(L.discoveryReady(s)).toBe(true);
    s = L.tie(L.dragKnot(L.setTool(s, 'nail'), 2));
    const w = L.witnesses(s);
    expect(w.combNeg).toMatchObject({ c: '-4', crossed: false, a2: '-3', b2: '-1' });
    expect(w.nailBig).toMatchObject({ c: '2', crossed: false });
    expect(w.nailNeg.crossed).toBe(true);
  });

  it('le coach suit l\'onboarding jusqu\'au bout, sur les deux niveaux', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(LV[lv].numbers);
      const seen = [];
      let plan = solve(s);
      for (let i = 0; i < 200; i += 1) {
        const c = L.coachOf(s);
        if (!c) break;
        seen.push(c.id);
        if (c.id === 'next') { s = L.nextTask(s); plan = solve(s); continue; }
        if (c.id === 'tool') { s = L.setTool(s, plan[0][0]); continue; }
        if (c.id === 'tryNeg') { s = L.tie(L.dragKnot(L.setTool(s, 'comb'), -4)); continue; }
        if (c.id === 'tie') { s = L.tie(s); continue; }
        if (c.id === 'stage') { s = L.addStage(s); continue; }
        const [tool, c1] = plan[s.stages.length];
        s = L.dragKnot(L.setTool(s, tool), c1);
        s = L.tie(s);
      }
      expect(L.discoveryReady(s), `${lv} ${seen.join(' ')}`).toBe(true);
      expect(L.coachOf(s)).toBeNull();
      expect(seen).toContain('drag');
      expect(seen).toContain('next');
      if (lv === 'beginner') expect(seen).toContain('tryNeg');
      if (lv === 'advanced') expect(seen).toContain('stage');
    }
  });
});
