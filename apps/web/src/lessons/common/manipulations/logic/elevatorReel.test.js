import { describe, it, expect } from 'vitest';
import * as L from './elevatorReel';

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle (le but) dit seulement dans quel sens. */
function followCoach(s0, max = 300) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < max; i += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    const t = L.taskOf(s);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    if (c.id === 'cards') { s = L.choose(s, t.options.find((o) => o !== t.key)); s = L.choose(s, t.key); continue; }
    if (c.id === 'grab') { s = L.release(s, s.step); continue; }
    if (c.id === 'left') { s = L.step(s, -1); continue; }
    if (c.id === 'lever') { s = L.flipSense(s); continue; }
    if (t.kind === 'both') {
      // l'oracle de la mission `both` : un temps qui convient pour la vitesse courante, sinon on change la vitesse
      const g = L.timeFor(L.rOf(s), t.floor, s.step);
      if (g != null) s = L.release(s, g); else s = L.setR(s, L.rOf(s) > 0 ? 2 : -2);
      continue;
    }
    const goal = L.timeFor(t.r, t.floor, s.step);
    s = L.step(s, goal > L.tOf(s) ? 1 : goal < L.tOf(s) ? -1 : 0);
  }
  throw new Error(`coach sans fin : ${seen.join(' ')}`);
}

describe('elevator-reel — le modèle', () => {
  it('floorAt, timeFor : la cabine est à r × t ; t est unique sur le rail', () => {
    expect(L.floorAt(-2, -2)).toBe(4);
    expect(L.timeFor(-2, -6, 1)).toBe(3);
    expect(L.timeFor(-2, 4, 1)).toBe(-2);
    expect(L.timeFor(3, 6, 1)).toBe(2);
    expect(L.timeFor(3, -9, 1)).toBe(-3);
    expect(L.timeFor(-2, 3, 0.5)).toBe(-1.5);
    expect(L.timeFor(2, -5, 0.5)).toBe(-2.5);
    expect(L.timeFor(-2, 3, 1)).toBeNull(); // -1,5 n'est pas sur le rail entier
    expect(L.timeFor(1, 9, 1)).toBeNull(); // hors du rail
    expect(L.timeFor(0, 3)).toBeNull();
    for (const r of [-3, -2, -1, 1, 2, 3]) for (let k = -6; k <= 6; k += 1) {
      const t = k / 2;
      expect(L.timeFor(r, r * t, 0.5)).toBe(t);
    }
  });

  it('les flèches : |t| flèches de r étages ; solides si t > 0, pointillées (chemin restant) si t < 0 ; demi-flèche pour une demi-minute', () => {
    expect(L.arrowsOf(-2, 3)).toEqual([
      { from: 0, to: -2, dashed: false, half: false }, { from: -2, to: -4, dashed: false, half: false }, { from: -4, to: -6, dashed: false, half: false },
    ]);
    const back = L.arrowsOf(-2, -2); // la cabine est à +4, il lui reste 2 minutes de descente pour atteindre 0
    expect(back.map((a) => [a.from, a.to, a.dashed])).toEqual([[4, 2, true], [2, 0, true]]);
    const half = L.arrowsOf(-2, -1.5);
    expect(half.map((a) => a.half)).toEqual([false, true]);
    expect(half.at(-1).to).toBe(0);
    expect(L.arrowsOf(0, 3)).toEqual([]);
    for (const r of [-3, -1, 2]) for (const t of [-3, -2.5, -1, 0.5, 2, 3]) {
      const a = L.arrowsOf(r, t);
      expect(a.at(-1).to).toBe(t > 0 ? r * t : 0);
    }
  });

  it('calcTex / calcText écrivent le calcul avec des parenthèses autour des négatifs', () => {
    expect(L.calcTex(-2, 2)).toBe('(-2) \\times 2 = -4');
    expect(L.calcText(-2, -1.5)).toBe('(−2) × (−1,5) = 3');
  });
});

describe('elevator-reel — les missions', () => {
  it('les presets sont jouables : chaque étage est sur le rail', () => {
    const b = L.init(L.PRESETS.beginner);
    expect(b.tasks.map((t) => t.kind)).toEqual(['floor', 'predict', 'floor', 'floor', 'floor']);
    expect(b.tasks.filter((t) => t.kind === 'floor').map((t) => L.timeFor(t.r, t.floor, b.step))).toEqual([3, -2, 2, -3]);
    const a = L.init(L.PRESETS.advanced);
    expect(a.advanced).toBe(true);
    expect(a.tasks.map((t) => t.kind)).toEqual(['predict', 'both', 'floor', 'floor']);
    expect(() => L.init({ step: '1', tasks: [{ r: '-2', floor: '3' }] })).toThrow();
    expect(() => L.init({ step: '1', tasks: [{ r: '3', floor: '12' }] })).toThrow();
  });

  it('un arrêt faux est un essai refusé qui porte le calcul ; le bon réussit', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.release(s, 2);
    expect(s.last).toMatchObject({ r: -2, t: 2, floor: -4, ok: false });
    expect(L.taskDone(s)).toBe(false);
    s = L.step(s, 1);
    expect(s.last).toMatchObject({ t: 3, floor: -6, ok: true });
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    // p1 : la prédiction AVANT de voir — le −2 (les deux signes « −− » écrits « − ») porte sa conviction ; le 2 est juste
    expect(L.canPlay(s)).toBe(false);
    s = L.choose(s, '-2');
    expect(s.last).toMatchObject({ kind: 'predict', ok: false, misc: 'MISC-JIDAA-NEGNEG', floor: 2 });
    expect(L.choose(s, '-3').last.misc).toBe('MISC-JIDAA-ADD');
    expect(L.choose(s, '-1').last.misc).toBe('MISC-JIDAA-SUB');
    s = L.choose(s, '2');
    expect(L.taskDone(s)).toBe(true);
    expect(s.below).toBe(false); // une carte n'est pas la main au temps négatif
    expect(L.canPlay(s)).toBe(true);
    s = L.nextTask(s);
    s = L.release(s, 2); // m2 : de l'autre côté de la rue — la question « avant ou après ? », pas le calcul
    expect(L.wrongSide(s.last)).toBe(true);
    s = L.release(s, -2); // m2 : (−2) × (−2) = 4
    expect(s.last).toMatchObject({ floor: 4, ok: true });
    expect(s.below).toBe(true);
  });

  it('preview ne crée aucun essai, release en crée un même sans changement', () => {
    const s = L.init(L.PRESETS.beginner);
    const p = L.preview(s, 2);
    expect(p.t).toBe(2);
    expect(p.trials.length).toBe(0);
    expect(L.release(p).trials.length).toBe(1);
    expect(L.preview(s, 99).t).toBe(3);
    expect(L.preview(s, -99).t).toBe(-3);
  });

  it('a1 : les cartes — 6 juste, −6 / −5 / 1 portent leur conviction ; a2 : monter ET descendre ; a3, a4 au demi', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.cardsOpen(s)).toBe(true);
    s = L.choose(s, '-6');
    expect(s.last).toMatchObject({ kind: 'predict', ok: false, misc: 'MISC-JIDAA-NEGNEG', floor: 6 });
    expect(L.choose(s, '-5').last.misc).toBe('MISC-JIDAA-ADD');
    expect(L.choose(s, '1').last.misc).toBe('MISC-JIDAA-SUB');
    s = L.choose(s, '6');
    expect(L.taskDone(s)).toBe(true);
    s = L.nextTask(s);
    // a2 : (2, −3) monte, puis (−3, 2) descend
    expect(L.speedEditable(s)).toBe(true);
    s = L.release(s, -3);
    expect(s.last).toMatchObject({ r: 2, floor: -6, ok: true });
    expect(L.taskDone(s)).toBe(false);
    s = L.setR(s, -3);
    s = L.release(s, 2);
    expect(s.last).toMatchObject({ r: -3, t: 2, floor: -6, ok: true });
    expect(L.taskDone(s)).toBe(true);
    expect(L.recordRows(s).map((x) => [x.r, x.t, x.floor])).toEqual([[-3, -2, 6], [2, -3, -6], [-3, 2, -6]]);
  });

  it('une vitesse nulle ne bouge pas la cabine : a × 0 = 0 ; « جرّب أعدادك » ne coche rien', () => {
    expect(L.parseFree('0', '2')).toEqual({ r: 0, t: 2 });
    expect(L.parseFree('٢', '−1,5')).toEqual({ r: 2, t: -1.5 });
    expect(L.parseFree('4', '1')).toBeNull();
    expect(L.parseFree('1', '0,3')).toBeNull();
    expect(L.parseFree('1,5', '1')).toBeNull();
    let s = L.init(L.PRESETS.beginner);
    s = L.setFree(s, '0', '3');
    expect(L.floorOf(s)).toBe(0);
    s = L.release(s, 2);
    expect(s.last).toMatchObject({ free: true, floor: 0 });
    expect(L.taskDone(s)).toBe(false);
    expect(L.coachOf(s)).toBeNull();
    s = L.toGuided(s);
    expect(L.rOf(s)).toBe(-2);
  });

  it('LabCoach : suivi jusqu’au bout des deux niveaux ; il ne montre que des contrôles', () => {
    for (const lv of ['beginner', 'advanced']) {
      const { s, seen } = followCoach(L.init(L.PRESETS[lv]));
      expect(L.discoveryReady(s)).toBe(true);
      for (const id of seen) expect(['cards', 'grab', 'left', 'lever', 'try', 'next']).toContain(id);
    }
    expect(followCoach(L.init(L.PRESETS.beginner)).seen).toContain('left');
    expect(followCoach(L.init(L.PRESETS.advanced)).seen).toContain('cards');
    const targets = ['[data-er-cards]', '[data-er-knob]', '[data-er-left]', '[data-er-speed]', '[data-er-stepper]', '[data-er-next]'];
    for (const lv of ['beginner', 'advanced']) expect(targets).toContain(L.coachOf(L.init(L.PRESETS[lv])).target);
  });

  it('le témoin de la distance vient de son سجلّ et réfute la somme ET la différence', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.release(s, 3); // m1 : (−2) × 3 = −6
    const w = L.distanceWitness(s);
    expect(w).toMatchObject({ a: 2, b: 3, product: 6, sum: 5, diff: 1 });
    expect(L.distanceWitness(L.init(L.PRESETS.beginner)).product).toBeGreaterThan(0);
  });
});

describe('elevator-reel — le conseil du 2026-10-27', () => {
  it('sideOf / wrongSide : le côté de la rue ; un arrêt du même côté, au départ ou juste n’est pas « de l’autre côté »', () => {
    expect([L.sideOf(4), L.sideOf(-1), L.sideOf(0)]).toEqual(['above', 'below', 'at']);
    let s = L.init(L.PRESETS.beginner); // m1 : étage −6
    s = L.release(s, 1);
    expect(L.wrongSide(s.last)).toBe(false); // −2, du même côté que −6
    s = L.release(s, -1);
    expect(L.wrongSide(s.last)).toBe(true); // 2, au-dessus de la rue
    s = L.release(s, 0);
    expect(L.wrongSide(s.last)).toBe(false); // l'étage 0
    expect(L.wrongSide(null)).toBe(false);
  });
  it('canPlay : le film attend la prédiction ; avant toute mission predict, et en libre, il est permis', () => {
    const s = L.init(L.PRESETS.beginner);
    expect(L.canPlay(s)).toBe(false); // m1 : la prédiction p1 est plus loin, le film montrerait sa réponse
    expect(L.canPlay(L.init(L.PRESETS.advanced))).toBe(false); // a1 est une prédiction
    expect(L.canPlay(L.setFree(L.init(L.PRESETS.advanced), '-2', '1'))).toBe(true);
  });
  it('le guide se pose AU-DESSUS de la ligne du temps et de −/+, jamais dessus', () => {
    const s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s)).toMatchObject({ id: 'grab', prefer: 'above', noFlip: true });
    expect(L.coachOf(L.release(s, 1))).toMatchObject({ id: 'try', prefer: 'above', noFlip: true });
  });
});
