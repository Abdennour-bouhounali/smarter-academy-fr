import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import * as L from './zeroProbe';
import { LEVELS } from '../levels';

const LV = LEVELS['zero-probe'];

/** Le but de la tâche (l'oracle du test, jamais du coach) : une longueur et un côté qui conviennent, la plus proche de la position. */
function goalFor(s) {
  const t = L.taskOf(s);
  const sols = R.solutions(t, BigInt(s.step));
  const credit = L.creditOf(s);
  const wanted = t.both ? sols.filter((x) => !credit[x.side]) : sols;
  return wanted.length ? wanted.reduce((b, x) => (Math.abs(Number(x.d) - s.dh) < Math.abs(Number(b.d) - s.dh) ? x : b)) : null;
}

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle dit seulement dans quel sens. */
function followCoach(s0, maxSteps = 600) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    const g = goalFor(s);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    if (c.id === 'grab') { s = L.release(s, s.dh + s.step * 2); continue; }
    if (c.id === 'decide') { s = L.pressNone(s); continue; }
    if (c.id === 'side') { s = L.setSide(s, g ? g.side : (s.side === 'above' ? 'below' : 'above')); continue; }
    // try : −/+ vers le but ; côté libre : on le bascule si le but est de l'autre côté
    if (!g) { s = L.stepBy(s, 1); continue; }
    if (g.side !== s.side && !L.sideLocked(s)) { s = L.setSide(s, g.side); continue; }
    s = L.stepBy(s, Number(g.d) > s.dh ? 1 : -1);
  }
  throw new Error(`coach sans fin : ${seen.slice(-8).join(' ')}`);
}

describe('zero-probe — la logique', () => {
  it('les presets des niveaux sont jouables et identiques à PRESETS', () => {
    expect(LV.beginner.numbers.tasks).toEqual(L.PRESETS.beginner);
    expect(LV.advanced.numbers.tasks).toEqual(L.PRESETS.advanced);
    const b = L.init(LV.beginner.numbers);
    expect(b.step).toBe(100);
    expect(b.tasks.map((t) => t.impossible)).toEqual([false, false, false, true]);
    const a = L.init(LV.advanced.numbers);
    expect(a.step).toBe(10);
    expect(a.tasks.map((t) => t.impossible)).toEqual([false, false, false]);
  });

  it('la main tient la DISTANCE : le côté est une conséquence ; le câble s’arrête à 0 et à 10', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.preview(s, 540);
    expect(s.dh).toBe(500);
    expect(L.valueText(s)).toBe('-5');
    expect(L.preview(s, -300).dh).toBe(0);
    expect(L.preview(s, 5000).dh).toBe(1000);
    expect(L.stepBy(L.init(LV.beginner.numbers), -1).dh).toBe(0);
  });

  it('un essai = un relâchement : l’aller-retour pendant le glisser n’en est pas un', () => {
    let s = L.init(LV.beginner.numbers);
    for (const v of [100, 300, 500, 200, 400]) s = L.preview(s, v);
    expect(s.trials).toHaveLength(0);
    s = L.release(s);
    expect(s.trials).toHaveLength(1);
    expect(s.last).toMatchObject({ kind: 'release', task: 0, tk: 'beat', a: '-3', side: 'below', d: '4', value: '-4', ok: true, free: false });
    expect(L.taskDone(s)).toBe(true);
  });

  it('beat A=-3 below lower : PLUS de câble rend B plus bas — l’inverse du naturel', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 200);
    expect(s.last).toMatchObject({ value: '-2', ok: false, order: 1 }); // -2 est plus HAUT que -3
    s = L.stepBy(s, 1);
    expect(s.last).toMatchObject({ value: '-3', ok: false, order: 0 });
    s = L.stepBy(s, 1);
    expect(s.last).toMatchObject({ value: '-4', ok: true, order: -1 });
  });

  it('un côté imposé ne se change pas ; un côté libre se change, la longueur reste, et c’est un essai', () => {
    const b = L.init(LV.beginner.numbers);
    expect(L.sideLocked(b)).toBe(true);
    expect(L.setSide(b, 'above')).toBe(b);
    let a = L.init(LV.advanced.numbers);
    expect(L.sideLocked(a)).toBe(false);
    a = L.release(a, 40);
    expect(a.side).toBe('above');
    a = L.setSide(a, 'below');
    expect(a.dh).toBe(40);
    expect(a.trials.map((t) => t.kind)).toEqual(['release', 'side', 'release']);
    expect(a.last).toMatchObject({ side: 'below', d: '0,4', value: '-0,4' });
  });

  it('la tâche impossible se fait par le bouton ; une longueur qui convient existe : le bouton est refusé et en MONTRE une', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.pressNone(s);
    expect(s.last).toMatchObject({ kind: 'none', ok: false, show: { side: 'below', d: '4', value: '-4' } });
    expect(L.taskDone(s)).toBe(false);
    s = { ...s, ti: 3, dh: 0 };
    for (const v of [100, 500, 1000]) s = L.release(s, v);
    expect(L.taskDone(s)).toBe(false);
    s = L.pressNone(s);
    expect(s.last).toMatchObject({ kind: 'none', ok: true });
    expect(L.taskDone(s)).toBe(true);
  });

  it('both : il faut réussir une fois de chaque côté ; le zéro ne crédite aucun côté', () => {
    let s = { ...L.init(LV.advanced.numbers), ti: 1 };
    s = L.release(s, 0);
    expect(s.last.ok).toBe(false);
    s = L.release(s, 90);
    expect(s.last.ok).toBe(true);
    expect(L.taskDone(s)).toBe(false);
    expect(L.creditOf(s)).toEqual({ above: true });
    s = L.setSide(s, 'below');
    expect(s.last.ok).toBe(true);
    expect(L.taskDone(s)).toBe(true);
  });

  it('between : une seule dixième atteint la zone étroite', () => {
    let s = L.init(LV.advanced.numbers);
    s = L.setSide(L.release(s, 440), 'below');
    expect(s.last).toMatchObject({ tk: 'between', lo: '-4,5', hi: '-4,3', value: '-4,4', ok: true });
    for (const bad of [430, 450]) { const t = L.release({ ...L.init(LV.advanced.numbers), side: 'below' }, bad); expect(t.last.ok).toBe(false); }
  });

  it('nextTask, restartTask, et le côté imposé suit la tâche', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 400);
    s = L.nextTask(s);
    expect(s).toMatchObject({ ti: 1, dh: 0, side: 'below', last: null });
    expect(L.nextTask(L.init(LV.beginner.numbers)).ti).toBe(0);
  });

  it('« جرّب أعدادك » : A change, le même câble, les essais libres ne comptent jamais', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.setFree(s, '−7,5');
    expect(s.free).toEqual({ a: '-7,5' });
    expect(L.marksOf(s)).toEqual([{ id: 'a', text: '-7,5' }]);
    s = L.release(s, 300);
    expect(s.last).toMatchObject({ free: true, a: '-7,5', value: '-3', ok: false, order: 1 });
    expect(L.taskDone(s)).toBe(false);
    s = L.release(s, 800);
    expect(s.last).toMatchObject({ ok: false, order: -1 });
    expect(L.taskDone(s)).toBe(false);
    expect(L.setFree(s, '12')).toBe(s);
    expect(L.toGuided(s).free).toBeNull();
    expect(L.coachOf(s)).toBeNull();
  });

  it('les événements sont ceux du contrat', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 500);
    expect(L.trialEvidence(s.last)).toEqual({ kind: 'release', task: 0, tk: 'beat', a: '-3', side: 'below', d: '5', value: '-5', ok: true, free: false });
    s = L.pressNone(L.nextTask(s));
    expect(L.trialEvidence(s.last)).toEqual({ kind: 'none', task: 1, ok: false, free: false });
    const a = L.setSide(L.init(LV.advanced.numbers), 'below');
    expect(a.trials.map(L.trialEvidence)[0]).toEqual({ kind: 'side', task: 0, side: 'below' });
  });

  for (const lv of ['beginner', 'advanced']) {
    it(`le coach suivi jusqu’au bout termine chaque tâche du niveau ${lv}, sans jamais donner le sens`, () => {
      const { s, seen } = followCoach(L.init(LV[lv].numbers));
      expect(L.discoveryReady(s)).toBe(true);
      expect(s.tasks.every((_, i) => s.done[i])).toBe(true);
      expect(seen[0]).toBe('grab');
      expect(seen).toContain('next');
      if (lv === 'beginner') expect(seen).toContain('decide');
      else { expect(seen).toContain('side'); expect(seen).not.toContain('decide'); }
      expect(L.coachOf(s)).toBeNull();
    });
  }

  it('decide n’arrive qu’après 3 longueurs essayées en vain dans la tâche où aucune ne convient', () => {
    let s = { ...L.init(LV.beginner.numbers), ti: 3, dh: 0 };
    expect(L.coachOf(s).id).toBe('grab');
    s = L.release(s, 100); expect(L.coachOf(s).id).toBe('try');
    s = L.release(s, 300); expect(L.coachOf(s).id).toBe('try');
    s = L.release(s, 300); expect(L.coachOf(s).id).toBe('try'); // la même longueur ne compte pas deux fois
    s = L.release(s, 700); expect(L.coachOf(s)).toMatchObject({ id: 'decide', target: '[data-zp-none]' });
    // et dans une tâche qui a des solutions le coach ne désigne jamais ce bouton
    let u = L.init(LV.beginner.numbers);
    for (const v of [100, 200, 300]) u = L.release(u, v);
    expect(L.coachOf(u).id).toBe('try');
  });

  it('les témoins de découverte viennent de SES essais, avec des repli sûrs', () => {
    const fresh = L.init(LV.beginner.numbers);
    expect(L.belowWitness(fresh)).toMatchObject({ a: '-3', b: '-5' });
    const { s } = followCoach(L.init(LV.beginner.numbers));
    const w = L.belowWitness(s);
    expect(R.cmp(w.b, w.a)).toBe(-1);
    expect(R.distance(w.b) > R.distance(w.a)).toBe(true);
    const ab = L.aboveWitness(s);
    expect(R.cmp(ab.a, ab.b)).toBe(1);
    const adv = followCoach(L.init(LV.advanced.numbers)).s;
    const m = L.mixWitness(adv);
    expect(R.cmp(m.near, m.pos)).toBe(-1);
    expect(R.cmp(m.far, m.pos)).toBe(-1);
    expect(R.distance(m.far) > R.distance(m.pos)).toBe(true);
    expect(R.distance(m.near) < R.distance(m.pos)).toBe(true);
  });
});
