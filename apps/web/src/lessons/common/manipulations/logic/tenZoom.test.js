import { describe, it, expect } from 'vitest';
import * as L from './tenZoom';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';
import { LEVELS } from '../levels';

const cur = (s) => L.taskOf(s);
/** Mène l'état jusqu'à n crans exactement (sans prédiction en attente). */
const goTo = (s, n) => L.stepTo(s, n);
const solve = (s) => {
  const t = cur(s);
  let r = s;
  if (L.predictionPending(r)) r = L.choosePrediction(r, t.predict.correct);
  r = goTo(r, t.target);
  return L.dock(r);
};

describe('ten-zoom — les tâches', () => {
  it('chaque carte désigne exactement la cible, pour les trois jeux de tâches', () => {
    for (const key of ['beginner', 'advanced', 'prefixes']) {
      for (const raw of L.PRESETS[key].tasks) {
        const t = L.buildTask(raw);
        expect(L.cardExponent(t.card), `${key} ${t.id}`).toBe(t.target);
      }
    }
    expect(() => L.buildTask({ id: 'x', target: 4, card: { dec: 3 } })).toThrow();
    expect(() => L.buildTask({ id: 'x', target: 13, card: { dec: 13 } })).toThrow();
  });

  it('les niveaux de levels.js sont les presets de la logique', () => {
    expect(LEVELS['ten-zoom'].beginner.numbers).toEqual({ world: 'zoom', tally: true, discovery: 'count', tasks: L.PRESETS.beginner.tasks });
    expect(LEVELS['ten-zoom'].advanced.numbers).toEqual({ world: 'zoom', tally: false, discovery: 'rank', tasks: L.PRESETS.advanced.tasks });
  });

  it('les prédictions : une seule option juste, et c’est le nombre de crans que la main fera', () => {
    for (const key of ['beginner', 'advanced']) {
      for (const t of L.PRESETS[key].tasks.filter((x) => x.predict)) {
        expect(t.predict.options[t.predict.correct], t.id).toBe(Math.abs(t.target));
        expect(new Set(t.predict.options).size, t.id).toBe(t.predict.options.length);
      }
    }
  });
});

describe('ten-zoom — la bague', () => {
  it('chaque cran déplace n d’une unité et laisse un essai ; la plaque lit le décimal', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    expect(L.sideText(s.n)).toBe('1');
    s = L.notch(s, 1); s = L.notch(s, 1); s = L.notch(s, 1);
    expect(s.n).toBe(3);
    expect(L.sideText(s.n)).toBe('1 000');
    expect(s.trials.filter((e) => e.kind === 'notch').map((e) => e.n)).toEqual([1, 2, 3]);
    expect(s.notches).toBe(3);
    s = L.stepTo(s, -3);
    expect(s.n).toBe(-3);
    expect(L.sideText(s.n)).toBe('0,001');
  });

  it('les crans à 0 m : 10⁰ = 1 (aucun cran = la table)', () => {
    const s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    expect(s.n).toBe(0);
    expect(L.sideText(0)).toBe('1');
    expect(L.tallyOf(0)).toBe('1');
  });

  it('la tally écrit les opérations de la main', () => {
    expect(L.tallyOf(3)).toBe('1 × 10 × 10 × 10');
    expect(L.tallyOf(-2)).toBe('1 ÷ 10 ÷ 10');
  });

  it('la plaque est toujours la puissance de 10 exacte : n crans = n zéros ou le 1 au rang |n|', () => {
    for (let n = L.N_MIN; n <= L.N_MAX; n += 1) {
      const txt = L.sideText(n).replace(/ /g, '');
      if (n >= 0) expect(txt, String(n)).toBe(`1${'0'.repeat(n)}`);
      else expect(txt, String(n)).toBe(`0,${'0'.repeat(-n - 1)}1`);
      expect(T.exponentOfPow10(L.sideText(n))).toBe(n);
    }
  });

  it('au bout de la bague le cran est refusé (limite), sans changer n', () => {
    let s = L.init({ world: 'zoom', tasks: [{ id: 'a', target: 12, card: { dec: 12 } }] });
    s = goTo(s, 12);
    const before = s.n;
    s = L.notch(s, 1);
    expect(s.n).toBe(before);
    expect(s.last.kind).toBe('limit');
  });

  it('la prédiction en attente bloque la bague, une prédiction fixée ne se change pas', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = solve(s); s = L.nextTask(s);
    expect(cur(s).id).toBe('z2');
    expect(L.predictionPending(s)).toBe(true);
    const blocked = L.notch(s, 1);
    expect(blocked.n).toBe(0);
    s = L.choosePrediction(s, 1);
    expect(L.predictionPending(s)).toBe(false);
    expect(L.choosePrediction(s, 0).pick).toBe(1);
    expect(L.notch(s, 1).n).toBe(1);
  });
});

describe('ten-zoom — le verdict (« ثبّت الإطار »)', () => {
  it('verdict pur : trop grand, trop petit, mauvais sens, exact', () => {
    expect(L.verdict(3, 3)).toEqual({ ok: true });
    expect(L.verdict(4, 3)).toMatchObject({ ok: false, reason: 'over', k: 1 });
    expect(L.verdict(1, 3)).toMatchObject({ ok: false, reason: 'under', k: 2 });
    expect(L.verdict(2, -3)).toMatchObject({ ok: false, reason: 'direction' });
    expect(L.verdict(-1, 3)).toMatchObject({ ok: false, reason: 'direction' });
    expect(L.verdict(0, -3)).toMatchObject({ ok: false, reason: 'over', k: 3 });
    expect(L.verdict(-2, 0)).toMatchObject({ ok: false, reason: 'under', k: 2 });
  });

  it('un côté faux est refusé avec sa raison et ne ticke pas la tâche', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = goTo(s, 4); s = L.dock(s);
    expect(L.taskDone(s)).toBe(false);
    expect(s.last).toMatchObject({ kind: 'refused', reason: 'over', n: 4, target: 3 });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'refused', reason: 'over' });
    s = goTo(s, 1); s = L.dock(s);
    expect(s.last.reason).toBe('under');
    s = goTo(s, -1); s = L.dock(s);
    expect(s.last.reason).toBe('direction');
    s = goTo(s, 3); s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'solved', n: 3 });
  });

  it('une tâche réussie se verrouille : plus de cran avant « المهمة التالية »', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = solve(s);
    expect(L.notch(s, 1)).toBe(s);
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(s.n).toBe(0);
    expect(s.done[0]).toBe(true);
  });

  it('prédiction fausse : le côté juste est accepté, la prédiction est marquée fausse avec le compte de la bague', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = solve(s); s = L.nextTask(s);
    s = L.choosePrediction(s, 1); // « 7 »
    s = goTo(s, 6); s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.find((e) => e.kind === 'predict')).toMatchObject({ choice: 7, ok: false });
    expect(s.wobble).toEqual({ count: 6, choice: 7 });
  });

  it('prédiction juste : pas de secousse', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = solve(s); s = L.nextTask(s);
    s = solve(s);
    expect(s.trials.find((e) => e.kind === 'predict')).toMatchObject({ choice: 6, ok: true });
    expect(s.wobble).toBeNull();
  });

  it('la mission 4 du مبتدئ part de la fin de la mission 3 (n = −3) et demande de revenir à la table', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    for (let i = 0; i < 3; i += 1) { s = solve(s); s = L.nextTask(s); }
    expect(cur(s).id).toBe('z4');
    expect(s.n).toBe(-3);
    s = solve(s);
    expect(s.n).toBe(0);
    expect(L.allDone(s)).toBe(true);
    expect(L.discoveryKind(s)).toBe('count');
  });

  it('chaque niveau se termine par ses quatre tampons (jamais en cassant la bague) ; la découverte du متقدم est « rank »', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(LEVELS['ten-zoom'].beginner.numbers && LEVELS['ten-zoom'][lv].numbers);
      for (let i = 0; i < s.tasks.length; i += 1) { s = solve(s); if (i < s.tasks.length - 1) s = L.nextTask(s); }
      expect(L.allDone(s), lv).toBe(true);
      expect(s.trials.filter((e) => e.kind === 'solved')).toHaveLength(4);
    }
    const adv = L.init(LEVELS['ten-zoom'].advanced.numbers);
    expect(L.discoveryKind(adv)).toBeNull();
  });

  it('le monde prefixes : cinq unités, plaque avec le nom', () => {
    let s = L.init({ ...L.PRESETS.prefixes });
    const names = [];
    for (let i = 0; i < s.tasks.length; i += 1) {
      s = goTo(s, cur(s).target);
      names.push(L.unitPill(s.n, 'prefixes'));
      s = L.dock(s);
      expect(L.taskDone(s)).toBe(true);
      if (i < s.tasks.length - 1) s = L.nextTask(s);
    }
    expect(names).toEqual(['كيلومتر', 'ميليمتر', 'ميكرومتر', 'نانومتر', 'ميغامتر']);
    expect(L.discoveryKind(s)).toBeNull();
  });

  it('les noms de la plaque dans le monde zoom : quatre seulement', () => {
    expect([3, -3, -6, -9].map((n) => L.unitPill(n, 'zoom'))).toEqual(['كيلومتر', 'ميليمتر', 'ميكرومتر', 'نانومتر']);
    for (const n of [6, 9, 1, 0, -1, -2, 4, -7]) expect(L.unitPill(n, 'zoom'), String(n)).toBeNull();
  });
});

describe('ten-zoom — « جرّب أعدادك »', () => {
  it('une puissance de 10 en décimal ou un nom devient une carte ; le reste est refusé en une ligne', () => {
    expect(L.validateFree('1 000 000')).toEqual({ ok: true, n: 6 });
    expect(L.validateFree('0,0001')).toEqual({ ok: true, n: -4 });
    expect(L.validateFree('0,0001 م')).toEqual({ ok: true, n: -4 });
    expect(L.validateFree('ألف مليار')).toEqual({ ok: true, n: 12 });
    expect(L.validateFree('جزء من مليار')).toEqual({ ok: true, n: -9 });
    expect(L.validateFree('')).toMatchObject({ ok: false, why: 'empty' });
    expect(L.validateFree('2 000')).toMatchObject({ ok: false, why: 'notpow' });
    expect(L.validateFree('6 000 000')).toMatchObject({ ok: false, why: 'notpow' });
    expect(L.validateFree('-100')).toMatchObject({ ok: false });
    expect(L.validateFree('abc')).toMatchObject({ ok: false, why: 'format' });
    expect(L.validateFree('10 000 000 000 000')).toMatchObject({ ok: false, why: 'range' });
  });

  it('les essais libres portent free:true, ne ticken aucune tâche, et « عُد إلى مهامّك » ramène', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = L.setFree(s, '100 000');
    expect(L.isFree(s)).toBe(true);
    expect(cur(s).target).toBe(5);
    s = goTo(s, 5); s = L.dock(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.done.some(Boolean)).toBe(false);
    expect(s.trials.every((e) => e.free === true)).toBe(true);
    expect(L.discoveryKind(s)).toBeNull();
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
    expect(cur(s).id).toBe('z1');
  });
});

describe('ten-zoom — le guide (coachOf)', () => {
  it('chaque tâche des deux niveaux et du monde prefixes est suivie jusqu’au bout : jamais de sans-étape tant que la tâche n’est pas finie', () => {
    for (const nums of [LEVELS['ten-zoom'].beginner.numbers, LEVELS['ten-zoom'].advanced.numbers, { ...L.PRESETS.prefixes }]) {
      let s = L.init(nums);
      const seen = new Set();
      for (let i = 0; i < s.tasks.length; i += 1) {
        const t = cur(s);
        if (t.predict) {
          expect(L.coachOf(s).id).toBe('predict');
          s = L.choosePrediction(s, t.predict.correct);
        }
        expect(L.coachOf(s).id).toBe('ring');
        seen.add('ring');
        const dir = t.target >= s.n ? 1 : -1;
        s = L.notch(s, dir);
        const c1 = L.coachOf(s);
        if (Math.abs(t.target - (dir === 1 ? s.n - 1 : s.n + 1)) >= 0) expect(['plate', 'dock']).toContain(c1.id);
        s = goTo(s, t.target);
        expect(['plate', 'dock', 'ring']).toContain(L.coachOf(s).id);
        s = L.dock(s);
        expect(L.taskDone(s)).toBe(true);
        const c = L.coachOf(s);
        if (i < s.tasks.length - 1) { expect(c.id).toBe('next'); s = L.nextTask(s); } else expect(c === null || c.id === 'free').toBe(true);
      }
    }
  });
  it('le guide est muet en mode libre et pendant la découverte', () => {
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    s = L.setFree(s, '10');
    expect(L.coachOf(s)).toBeNull();
    s = L.toGuided(s);
    for (let i = 0; i < 4; i += 1) { s = solve(s); if (i < 3) s = L.nextTask(s); }
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
  });
  it('les cibles du guide sont des éléments du contrat DOM', () => {
    const dom = ['[data-tz-next]', '[data-tz-free]', '[data-tz-predict-card]', '[data-tz-ring]', '[data-tz-plate]', '[data-tz-dock]'];
    let s = L.init(LEVELS['ten-zoom'].beginner.numbers);
    for (const step of [L.coachOf(s), L.coachOf(L.notch(s, 1)), L.coachOf(goTo(s, 2))]) expect(dom).toContain(step.target);
  });
});
