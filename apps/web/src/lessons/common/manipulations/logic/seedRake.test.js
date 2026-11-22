import { describe, it, expect } from 'vitest';
import * as L from './seedRake';
import { LEVELS } from '../levels';

/* Arithmétique de contrôle en BigInt (indépendante de fractions3.js) : les zones sont entières ⇔ N est un multiple commun des dénominateurs. */
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm2 = (a, b) => (a * b) / gcd(a, b);
const den = (p) => { const [n, d] = p.split('/').map(Number); return d / gcd(n, d); };
const works = (terms, N) => terms.every((t) => (Number(t.p.split('/')[0]) * N) % Number(t.p.split('/')[1]) === 0);

const plantAt = (s, N) => L.plant(L.setN(s, N));

describe('seed-rake — logique', () => {
  it('chaque tâche des deux niveaux est bien construite : espacements qui conviennent = multiples communs ≤ 60 ; le plus large = ppcm', () => {
    for (const lv of ['beginner', 'advanced']) {
      for (const raw of L.PRESETS[lv].tasks) {
        const t = L.buildTask(raw);
        const want = [];
        for (let N = 2; N <= 60; N += 1) if (works(raw.terms, N)) want.push(N);
        expect(t.working, raw.id).toEqual(want);
        expect(t.widestN, raw.id).toBe(raw.terms.map((x) => den(x.p)).reduce(lcm2));
      }
    }
  });

  it('les nombres du plan : g1 5/12 (12 : 3 + 2 ; 24 : 10), g2 13/15, g3 7/12, a1 29/24, a2 13/30, a3 13/12, a4 19/24', () => {
    const totals = Object.fromEntries([...L.PRESETS.beginner.tasks, ...L.PRESETS.advanced.tasks].map((r) => [r.id, L.buildTask(r).totalText]));
    expect(totals).toEqual({ g1: '5/12', g2: '13/15', g3: '7/12', a1: '29/24', a2: '13/30', a3: '13/12', a4: '19/24' });
    let s = L.init(L.PRESETS.beginner);
    expect(L.resultAt(L.setN(s, 12)).counts).toEqual([3, 2]);
    expect(L.resultAt(L.setN(s, 12)).signedN).toBe(5);
    expect(L.resultAt(L.setN(s, 24)).signedN).toBe(10);
    s = L.nextTask({ ...s, done: { 0: true } });
    expect(L.resultAt(L.setN(s, 15)).signedN).toBe(13);
    s = L.nextTask({ ...s, done: { 0: true, 1: true } });
    expect(L.resultAt(L.setN(s, 12)).counts).toEqual([9, 2]);
    expect(L.resultAt(L.setN(s, 12)).signedN).toBe(7);
  });

  it('g1 : refus à 1/10 (le plant tombe sur la frontière des tomates), pas de total ; deux espacements + un refus finissent la tâche et le même total', () => {
    let s = L.init(L.PRESETS.beginner);
    s = plantAt(s, 10);
    expect(s.planted.ok).toBe(false);
    expect(s.planted.borderAt).toBe(0);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'refused', reason: 'border', N: 10, zone: 0 });
    expect(L.taskDone(s)).toBe(false);
    s = plantAt(s, 12);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'plant', N: 12, ok: true, signed: 5, total: '5/12' });
    expect(L.taskDone(s)).toBe(false);
    s = plantAt(s, 24);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'solved' });
    expect(L.taskDone(s)).toBe(true);
    const totals = s.trials.filter((e) => e.kind === 'plant').map((e) => e.total);
    expect(new Set(totals).size).toBe(1);
  });

  it('une tâche finie reste jouable (l\'étoile ouvre la chasse) : un seul `solved`, le râteau n\'est pas bloqué', () => {
    let s = L.init(L.PRESETS.beginner);
    s = plantAt(plantAt(plantAt(s, 10), 12), 24);
    expect(L.taskDone(s)).toBe(true);
    expect(L.canRake(s)).toBe(true);
    expect(L.starVisible(s)).toBe(true);
    s = plantAt(plantAt(s, 36), 10);
    expect(s.trials.filter((e) => e.kind === 'solved')).toHaveLength(1);
    expect(s.record.g1.works).toEqual([12, 24, 36]);
    expect(L.widestFound(s)).toBe(12);
  });

  it('refus : 1/8 (multiple de 4 seulement) sur la 2e zone ; 1/6 (le plus grand dénominateur) sur la 1re ; 1/4 + 1/6 ≠ 2/10 : rien n\'est compté', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.resultAt(L.setN(s, 8))).toMatchObject({ ok: false, borderAt: 1 });
    expect(L.resultAt(L.setN(s, 6))).toMatchObject({ ok: false, borderAt: 0 });
    expect(L.resultAt(L.setN(s, 6)).signed).toBe(null);
    s = plantAt(s, 8);
    expect(s.planted.counts[0]).toBe(2);   // les tomates tiennent dans 2 cases, le piment non
    expect(s.planted.counts[1]).toBe(null);
  });

  it('l\'étoile n\'apparaît qu\'après DEUX espacements différents (jamais avant : elle dirait la réponse)', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.starVisible(s)).toBe(false);
    s = plantAt(s, 24);
    expect(L.starVisible(s)).toBe(false);
    s = plantAt(s, 24);
    expect(L.starVisible(s)).toBe(false);
    s = plantAt(s, 36);
    expect(L.starVisible(s)).toBe(true);
    expect(L.widestFound(s)).toBe(24);
    s = L.star(s);
    expect(s.hunt).toBe(true);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'hunt' });
  });

  it('g3 (récolte) : 3/4 − 1/6 sur 12 : 9 plants puis 2 retirés = 7 ; 1/8 refusé (la récolte tombe sur une case)', () => {
    let s = L.nextTask({ ...L.init(L.PRESETS.beginner), done: { 0: true, 1: true }, ti: 1 });
    s = L.nextTask({ ...s, done: { 0: true, 1: true } });
    expect(L.resultAt(L.setN(s, 8)).ok).toBe(false);
    s = plantAt(s, 12);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'solved', total: '7/12' });
  });

  it('le résultat négatif est refusé (hors de cette leçon)', () => {
    expect(() => L.buildTask({ terms: [{ p: '1/6' }, { p: '3/4', sub: true }] })).toThrow();
    expect(() => L.buildTask({ terms: [{ p: '1/6', sub: true }, { p: '3/4' }] })).toThrow();
    expect(() => L.buildTask({ terms: [{ p: '1/61' }] })).toThrow();
  });

  it('متقدم : le râteau est bloqué ; l\'engagement N + total est jugé exactement ; un total faux est réfuté par les plants', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.canRake(s)).toBe(false);
    expect(L.predictReady(s)).toBe(false);
    s = L.setPredNum(L.setPredDen(L.setPredN(s, '٢٤'), '24'), '28');
    expect(s.predN).toBe('24');
    s = L.attempt(s);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'predict', N: 24, value: '28/24', ok: false, why: 'value' });
    expect(L.taskDone(s)).toBe(false);
    expect(s.planted.counts).toEqual([20, 9]);
    s = L.setPredNum(s, '58'); s = L.setPredDen(s, '48');
    s = L.attempt(s);
    expect(s.trials.at(-2)).toMatchObject({ kind: 'predict', ok: true, value: '58/48' });
    expect(L.taskDone(s)).toBe(true);
  });

  it('متقدم : N à cheval est réfuté (border) ; N hors 2…60 ou fraction invalide est refusé', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.setPredDen(L.setPredNum(L.setPredN(s, '20'), '29'), '24');
    s = L.attempt(s);
    expect(s.trials.at(-1)).toMatchObject({ ok: false, why: 'border', N: 20 });
    expect(s.planted.ok).toBe(false);
    s = L.setPredN(s, '99');
    s = L.attempt(s);
    expect(s.refusal).toBe('fields');
    s = L.setPredDen(L.setPredN(s, '24'), '0');
    expect(L.attempt(s).refusal).toBe('fields');
  });

  it('a4 « أوسع مسافة » : 48 est accepté (même longueur) mais la tâche reste ouverte avec wider ; 24 la finit', () => {
    let s = L.init(L.PRESETS.advanced);
    s = { ...s, ti: 3 };
    s = L.setPredDen(L.setPredNum(L.setPredN(s, '48'), '38'), '48');
    s = L.attempt(s);
    expect(s.trials.at(-1)).toMatchObject({ ok: true, why: 'wider' });
    expect(L.taskDone(s)).toBe(false);
    expect(s.wiser).toBe(true);
    s = L.setPredN(s, '24'); s = L.setPredNum(s, '19'); s = L.setPredDen(s, '24');
    s = L.attempt(s);
    expect(L.taskDone(s)).toBe(true);
  });

  it('« جرّب أعدادك » : validation, essais `custom` jamais comptés, longueur prédite quelconque (2/10) dessinée sans jugement', () => {
    expect(L.validateFree([{ a: '1', b: '4' }, { a: '1', b: '6' }], false)).toMatchObject({ ok: true });
    expect(L.validateFree([{ a: '', b: '' }], false)).toMatchObject({ ok: false, why: 'empty' });
    expect(L.validateFree([{ a: '1', b: '13' }], false)).toMatchObject({ ok: false, why: 'range' });
    expect(L.validateFree([{ a: '1', b: '6' }, { a: '3', b: '4' }], true)).toMatchObject({ ok: false, why: 'negative' });
    expect(L.validateFree([{ a: '11', b: '12' }, { a: '11', b: '12' }, { a: '11', b: '12' }], false)).toMatchObject({ ok: false, why: 'total' });
    expect(L.validateFree([{ a: '1', b: '11' }, { a: '1', b: '12' }, { a: '1', b: '7' }], false)).toMatchObject({ ok: false, why: 'lcm' });
    expect(L.validateFree([{ a: '3', b: '4' }], true)).toMatchObject({ ok: false, why: 'range' });
    let s = L.init(L.PRESETS.beginner);
    const v = L.validateFree([{ a: '1', b: '4' }, { a: '1', b: '6' }], false);
    s = L.setFree(s, v.cfg);
    s = L.setFreePred(s, '2', '10');
    expect(L.freePrediction(s)).toMatchObject({ text: '2/10', ratio: 0.2 });
    s = plantAt(s, 12);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'custom', free: true, ok: false });
    expect(Object.keys(s.done)).toHaveLength(0);
    expect(L.coachOf(s)).toBe(null);
    expect(L.toGuided(s).free).toBe(null);
  });

  it('LabCoach : on suit coachOf jusqu\'au bout de chaque niveau (rake → plant → border / rake → … → free), jamais le nombre N', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(L.PRESETS[lv]);
      const seen = new Set();
      for (let guard = 0; guard < 60 && !L.allDone(s); guard += 1) {
        const c = L.coachOf(s);
        if (c) seen.add(c.id);
        const t = L.taskOf(s);
        if (t.kind === 'predict') {
          const N = t.widestN;
          s = L.attempt(L.setPredDen(L.setPredNum(L.setPredN(s, String(N)), String(Number(t.totalValue.n) * (N / Number(t.totalValue.d)))), String(N)));
        } else {
          const bad = [...Array(55).keys()].map((i) => i + 5).find((N) => !t.working.includes(N));
          for (const N of [bad, ...t.working.slice(0, 2)]) { if (!L.taskDone(s)) s = plantAt(s, N); }
        }
        if (L.canNext(s)) s = L.nextTask(s);
      }
      expect(L.allDone(s), lv).toBe(true);
      expect(seen.has(lv === 'advanced' ? 'predict' : 'rake'), lv).toBe(true);
    }
    expect(L.coachOf(L.init(L.PRESETS.advanced))).toMatchObject({ id: 'predict' });
    expect(L.coachOf(L.init(L.PRESETS.beginner))).toMatchObject({ id: 'rake' });
    let s = L.setN(L.init(L.PRESETS.beginner), 10);
    expect(L.coachOf(s)).toMatchObject({ id: 'plant' });
    expect(L.coachOf(L.plant(s))).toMatchObject({ id: 'border' });
  });

  it('formalOf cite SES essais de g1 et réfute avec des nombres exacts', () => {
    let s = L.init(L.PRESETS.beginner);
    s = plantAt(plantAt(plantAt(s, 10), 12), 24);
    const f = L.formalOf(s);
    expect(f.works).toEqual([12, 24]);
    expect(f.bad).toBe(10);
    expect(f.badResult.ok).toBe(false);
    expect(f.sumDen).toBe(10);
    expect(f.sumDenWorks).toBe(false);
    expect(f.witnessBigger).toBe(25);
    expect(f.witnessResult.ok).toBe(false);
  });

  it('le test des niveaux : متقدم a plus de tâches, toutes en prédiction ; مبتدئ aucune', () => {
    const lv = LEVELS['seed-rake'];
    expect(lv.advanced.numbers.tasks.length).toBeGreaterThan(lv.beginner.numbers.tasks.length);
    expect(lv.advanced.numbers.tasks.every((t) => t.kind === 'predict')).toBe(true);
    expect(lv.beginner.numbers.tasks.some((t) => t.kind === 'predict')).toBe(false);
  });
});
