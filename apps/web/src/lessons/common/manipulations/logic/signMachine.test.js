import { describe, it, expect } from 'vitest';
import * as L from './signMachine';
import { LEVELS } from '../levels';

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle (le but) dit seulement dans quel sens. */
function followCoach(s0, max = 200) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < max; i += 1) {
    const c = L.coachOf(s);
    if (!c) return { s, seen };
    seen.push(c.id);
    const t = L.taskOf(s);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    if (c.id === 'cards') { s = L.choose(s, t.options.find((o) => o !== t.key)); s = L.choose(s, t.key); continue; }
    if (c.id === 'sign') { s = L.flipSign(s); continue; }
    if (c.id === 'grab') { s = L.release(s, L.bOf(s)); continue; }
    if (t.kind === 'fill') { s = L.step(s, -1); continue; }
    const goal = t.kind === 'both' ? L.bFor(s.a, t.product) : L.bFor(t.a, t.product);
    if (goal == null) { s = L.step(s, -1); continue; }
    s = L.step(s, goal > s.b ? 1 : goal < s.b ? -1 : 0);
  }
  throw new Error(`coach sans fin : ${seen.join(' ')}`);
}

/** Termine les missions 0 … i (par le coach), et s'arrête sur la mission i réussie. */
function followTo(s0, i) {
  let s = s0;
  for (let n = 0; n < 200 && !(s.ti === i && L.taskDone(s)); n += 1) {
    const c = L.coachOf(s);
    const t = L.taskOf(s);
    if (c.id === 'next') s = L.nextTask(s);
    else if (c.id === 'cards') s = L.choose(s, t.key);
    else if (c.id === 'sign') s = L.flipSign(s);
    else if (t.kind === 'fill') s = L.step(s, -1);
    else {
      const goal = L.bFor(t.kind === 'both' ? s.a : t.a, t.product);
      s = goal == null ? L.step(s, -1) : L.release(s, goal);
    }
  }
  return s;
}

describe('sign-machine — le modèle', () => {
  it('bFor : b unique dans −4 … 4 ; stepDown : descendre d’une colonne ajoute −a', () => {
    expect(L.bFor(-3, 12)).toBe(-4);
    expect(L.bFor(-3, -12)).toBe(4);
    expect(L.bFor(2, -6)).toBe(-3);
    expect(L.bFor(-3, 5)).toBeNull();
    expect(L.bFor(1, 9)).toBeNull();
    expect(L.bFor(0, 0)).toBeNull();
    for (const a of [-4, -3, -1, 2, 4]) for (const b of L.COLUMNS.slice(1)) expect(a * (b - 1) - a * b).toBe(L.stepDown(a));
  });

  it('les presets des niveaux sont ceux de levels.js et s’initialisent', () => {
    expect(LEVELS['sign-machine'].beginner.numbers).toEqual(L.PRESETS.beginner);
    expect(LEVELS['sign-machine'].advanced.numbers).toEqual(L.PRESETS.advanced);
    for (const lv of ['beginner', 'advanced']) expect(() => L.init(L.PRESETS[lv])).not.toThrow();
    expect(() => L.init({ a: -3, tasks: [{ kind: 'reach', product: 5 }] })).toThrow();
    expect(() => L.init({ a: -3, tasks: [{ kind: 'predict', b: -1, options: [3, -3], key: -3 }] })).toThrow();
  });

  it('مبتدئ : la colonne 4 est allumée au départ ; le côté négatif est verrouillé tant que la prédiction attend', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.litColumns(s)).toEqual([4]);
    expect(L.negLocked(s)).toBe(true);
    s = L.release(s, -3);
    expect(s.b).toBe(0); // bloqué au 0
    expect(L.litColumns(s)).toEqual([0, 4]);
  });

  it('m1 (fill) : descendre de 4 à 0 allume cinq colonnes, et les pastilles d’écart disent +3 entre voisines', () => {
    let s = L.init(L.PRESETS.beginner);
    for (let i = 0; i < 4; i += 1) s = L.step(s, -1);
    expect(L.taskDone(s)).toBe(true);
    expect(L.litColumns(s)).toEqual([0, 1, 2, 3, 4]);
    expect(L.stepPills(s).map((p) => p.diff)).toEqual([3, 3, 3, 3]);
    expect(s.solved[0].product).toBe(0);
  });

  it('p1 : chaque carte fausse porte sa conviction ; la bonne allume (−3) × (−1) = 3 et déverrouille', () => {
    let s = L.nextTask(followTo(L.init(L.PRESETS.beginner), 0));
    expect(L.cardsOpen(s)).toBe(true);
    expect(L.release(s, 2)).toBe(s); // pas de geste pendant les cartes
    s = L.choose(s, -3);
    expect(s.last).toMatchObject({ ok: false, misc: 'MISC-JIDAA-NEGNEG' });
    expect(L.choose(s, -4).last.misc).toBe('MISC-JIDAA-ADD');
    s = L.choose(s, 3);
    expect(L.taskDone(s)).toBe(true);
    expect(s.lit[-1]).toBe(true);
    expect(L.negLocked(s)).toBe(false);
    // après la réussite, bouger le curseur est une exploration, jamais un refus
    const moved = L.step(s, 1);
    expect(moved.last).toMatchObject({ look: true, ok: false, b: 0, product: 0 });
    expect(L.taskDone(moved)).toBe(true);
  });

  it('m2 (reach) : le produit 12 n’est atteint qu’en b = −4 ; un essai faux ne clôt rien', () => {
    let s = followTo(L.init(L.PRESETS.beginner), 1);
    s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('m2');
    expect(s.b).toBe(4);
    s = L.release(s, -2);
    expect(s.last).toMatchObject({ ok: false, product: 6 });
    s = L.release(s, -4);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.stepPills(s).every((p) => p.diff === 3)).toBe(true);
  });

  it('both (متقدم a2) : 8 avec a > 0 PUIS avec a < 0 ; retourner le signe de a renverse le tableau', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.choose(s, 8);
    s = L.nextTask(s);
    expect(L.aEditable(s)).toBe(true);
    expect(s.a).toBe(-4);
    expect(s.b).toBe(4); // la réponse n'est pas déjà sous la main
    const before = L.litColumns(s).map((b) => s.a * b);
    s = L.flipSign(s);
    expect(s.a).toBe(4);
    expect(L.litColumns(s).map((b) => s.a * b)).toEqual(before.map((p) => -p));
    s = L.release(s, 2);
    expect(L.taskDone(s)).toBe(false);
    s = L.flipSign(s);
    s = L.release(s, -2);
    expect(L.taskDone(s)).toBe(true);
    expect(s.solved[1].also).toEqual({ a: -4, b: -2 });
  });

  it('a3 : un nouveau a (2) rallume le tableau depuis 4', () => {
    let s = followTo(L.init(L.PRESETS.advanced), 1);
    s = L.nextTask(s);
    expect(s.a).toBe(2);
    expect(L.litColumns(s)).toEqual([4]);
  });

  it('« جرّب أعدادك » : a de −4 à 4, tout le tableau allumé, jamais une mission cochée', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.parseFree('5')).toBeNull();
    expect(L.parseFree('−2')).toBe(-2);
    expect(L.parseFree('0')).toBe(0);
    s = L.setFree(s, '-2');
    expect(L.isFree(s)).toBe(true);
    expect(L.litColumns(s)).toEqual([...L.COLUMNS]);
    expect(L.minB(s)).toBe(-4);
    s = L.release(s, -4);
    expect(s.last).toMatchObject({ free: true, product: 8, ok: false });
    expect(s.done).toEqual({});
    expect(L.coachOf(s)).toBeNull();
    expect(L.isFree(L.toGuided(s))).toBe(false);
  });

  it('witness : une paire de colonnes opposées allumées, a × b + a × (−b) = 0', () => {
    const w = L.witness(followCoach(L.init(L.PRESETS.beginner)).s);
    expect(w.pos + w.neg).toBe(0);
    expect(w.step).toBe(3);
    expect(w.one).toBe(3);
  });
});

describe('sign-machine — onboarding (LabCoach)', () => {
  for (const lv of ['beginner', 'advanced']) {
    it(`${lv} : suivre le coach termine toutes les missions`, () => {
      const { s, seen } = followCoach(L.init(L.PRESETS[lv]));
      expect(L.discoveryReady(s)).toBe(true);
      expect(seen[0]).toBe(lv === 'beginner' ? 'grab' : 'cards');
      if (lv === 'advanced') expect(seen).toContain('sign');
      expect(L.coachOf(s)).toBeNull();
    });
  }
});
