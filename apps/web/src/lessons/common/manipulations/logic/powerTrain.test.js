import { describe, it, expect } from 'vitest';
import * as L from './powerTrain';
import { LEVELS } from '../levels';

const LV = LEVELS['power-train'];

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle (le but de la tâche) dit seulement dans quel sens. */
function followCoach(s0, maxSteps = 200) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    const goal = L.taskOf(s).goal;
    // le premier geste naturel : tirer la queue d'un wagon vers la droite
    if (c.id === 'grab' || c.id === 'grabB') { s = L.release(s, s.n + 1); continue; }
    if (c.id === 'divide') { s = L.step(s, -1); continue; }
    s = L.step(s, goal > s.n ? 1 : goal < s.n ? -1 : 0);
  }
  throw new Error(`coach sans fin : ${seen.join(' ')}`);
}

describe('power-train — la logique', () => {
  it('les presets des niveaux sont jouables : chaque charge cible a un exposant sur le rail', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LV[lv].numbers);
      expect(s.world).toBe('build');
      for (const t of s.tasks) expect(Number.isInteger(t.goal)).toBe(true);
    }
    expect(L.init(LV.beginner.numbers).tasks.map((t) => t.goal)).toEqual([4, 5, 0]);
    expect(L.init(LV.advanced.numbers).tasks.map((t) => t.goal)).toEqual([3, 4, -2, -3]);
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init({ world: 'couple', ...L.PRESETS.couple[lv] });
      for (const t of s.tasks) expect(t.goal).toBeGreaterThanOrEqual(L.RANGE.couple[0]);
    }
  });

  it('une charge impossible ou une base nulle est refusée à la construction', () => {
    expect(() => L.init({ world: 'build', base: '-2', targets: ['3'] })).toThrow();
    expect(() => L.init({ world: 'build', base: '0', targets: ['0'] })).toThrow();
    expect(() => L.init({ world: 'couple', base: '2', tasks: [{ m: 6, target: -6, op: 'times' }] })).toThrow();
  });

  it('build : le train porte aⁿ ; le signe change à chaque wagon d’une base négative ; 0 wagon → 1', () => {
    let s = L.init(LV.beginner.numbers);
    expect(L.loadOf(s)).toEqual({ n: 1n, d: 1n });
    s = L.release(s, 3);
    expect(L.loadsOf(s)).toEqual(['-2', '4', '-8']);
    expect(s.last).toMatchObject({ n: 3, load: '-8', ok: false });
    s = L.step(s, 1);
    expect(s.last).toMatchObject({ n: 4, load: '16', ok: true });
    expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
  });

  it('build : les wagons « ÷ » sous zéro — (−3)⁻² = 1/9, (−3)⁻³ = −1/27 ; le rail borne l’exposant', () => {
    let s = L.init(LV.advanced.numbers);
    s = L.release(s, -2);
    expect(L.loadsOf(s)).toEqual(['-1/3', '1/9']);
    expect(s.below).toBe(true);
    s = L.release(s, -99);
    expect(s.n).toBe(L.RANGE.build[0]);
    s = L.release(s, 99);
    expect(s.n).toBe(L.RANGE.build[1]);
  });

  it('preview ne crée aucun essai ; release en crée un, même sans changement', () => {
    const s = L.init(LV.beginner.numbers);
    const p = L.preview(s, 2);
    expect(p.n).toBe(2);
    expect(p.trials.length).toBe(0);
    expect(L.release(p).trials.length).toBe(1);
  });

  it('couple : l’exposant attelé est m + n (ou m − n en division) ; × et ÷ s’annulent', () => {
    let s = L.init({ world: 'couple', ...L.PRESETS.couple.beginner });
    s = L.release(s, 4);
    expect(L.exponentShown(s)).toBe(7);
    expect(s.last.ok).toBe(true);
    s = L.nextTask(s);
    s = L.release(s, -6);
    expect(L.exponentShown(s)).toBe(-2);
    expect(L.coupledOf(s).cancelled).toBe(4);
    expect(L.loadOf(s)).toEqual({ n: 1n, d: 4n });
    s = L.nextTask(s);
    s = L.release(s, 3);
    expect(L.exponentShown(s)).toBe(2);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('« جرّب أعدادك » : une base entière non nulle de −9 à 9, chiffres arabes acceptés ; rien n’est coché', () => {
    expect(L.parseFreeBase('−4')).toBe('-4');
    expect(L.parseFreeBase('٧')).toBe('7');
    expect(L.parseFreeBase('0')).toBeNull();
    expect(L.parseFreeBase('12')).toBeNull();
    expect(L.parseFreeBase('1/2')).toBeNull();
    let s = L.init(LV.beginner.numbers);
    s = L.setFree(s, '-5');
    expect(L.baseOf(s)).toBe('-5');
    s = L.release(s, 4);
    expect(s.last).toMatchObject({ free: true, load: '625' });
    expect(L.taskDone(s)).toBe(false);
    expect(L.coachOf(s)).toBeNull();
    s = L.toGuided(s);
    expect(L.baseOf(s)).toBe('-2');
  });

  it('LabCoach : suivi jusqu’au bout de chaque tâche, de chaque niveau et de chaque monde ; il ne montre jamais un nombre', () => {
    const cases = [
      L.init(LV.beginner.numbers),
      L.init(LV.advanced.numbers),
      L.init({ world: 'couple', ...L.PRESETS.couple.beginner }),
      L.init({ world: 'couple', ...L.PRESETS.couple.advanced }),
    ];
    for (const s0 of cases) {
      const { s, seen } = followCoach(s0);
      expect(L.discoveryReady(s)).toBe(true);
      expect(seen[0]).toMatch(/^grab/);
      for (const id of seen) expect(['grab', 'grabB', 'try', 'tryB', 'divide', 'next']).toContain(id);
    }
    // le niveau avancé montre une fois le bouton − pour passer sous 0
    expect(followCoach(L.init(LV.advanced.numbers)).seen).toContain('divide');
    // les cibles du coach sont des contrôles, jamais une charge
    for (const s0 of cases) {
      const c = L.coachOf(s0);
      expect(['[data-pt-knob]', '[data-pt-stepper]', '[data-pt-less]', '[data-pt-next]']).toContain(c.target);
    }
  });

  it('les témoins de la découverte viennent des essais de l’élève', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 4); s = L.release(s, 5);
    const w = L.parityWitness(s);
    expect(w.even).toMatchObject({ n: 4, load: '16' });
    expect(w.odd).toMatchObject({ n: 5, load: '-32' });
    let a = L.init(LV.advanced.numbers);
    a = L.release(a, -2);
    expect(L.inverseWitness(a)).toMatchObject({ k: 2, divide: '1/9', times: '9', opposite: '-9' });
    let c = L.init({ world: 'couple', ...L.PRESETS.couple.beginner });
    c = L.release(c, 4);
    expect(L.coupleWitness(c)).toMatchObject({ m: 3, n: 4, sum: 7, product: 12 });
  });
});
