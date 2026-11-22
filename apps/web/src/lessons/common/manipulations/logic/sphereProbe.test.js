import { describe, it, expect } from 'vitest';
import * as L from './sphereProbe';
import { LEVELS } from '../levels';

/**
 * sphere-probe — la logique sur les nombres du درس : R = 3 et les sondes (1 ; 2 ; 2), (1 ; 1 ; 1), (2 ; 2 ; 2) (OM = 3, √3,
 * 2√3) ; R = 4 et les placements M, P, Q de معارف 1, le قطر, les دوائر كبرى / صغرى. Chaque verdict vient de space.js.
 */
const B = LEVELS['sphere-probe'].beginner.numbers;
const A = LEVELS['sphere-probe'].advanced.numbers;

const goTo = (s, p) => L.moveM(s, p);

describe('sphere-probe — la sonde, مبتدئ (R = 3)', () => {
  it('lit OM² et OM exactement aux trois sondes', () => {
    expect(L.reading(3, [1, 2, 2])).toMatchObject({ where: 'surface', OM2: 9, R2: 9, OMTex: '3', sumTex: '1^2 + 2^2 + 2^2 = 9' });
    expect(L.reading(3, [1, 1, 1])).toMatchObject({ where: 'inside', OM2: 3, OMTex: '\\sqrt{3}' });
    expect(L.reading(3, [2, 2, 2])).toMatchObject({ where: 'outside', OM2: 12, OMTex: '2\\sqrt{3}' });
    expect(L.reading(3, [-1, 0, 2]).sumTex).toBe('(-1)^2 + 0^2 + 2^2 = 5');
  });

  it('la sonde reste sur les nœuds du cube et ne part jamais d’un point remarquable', () => {
    let s = L.init(B);
    expect(s.mode).toBe('classify');
    expect(s.probes.map((p) => p.name)).toEqual(['A', 'B', 'C']);
    expect(L.probeAt(s)).toBe(null);
    expect(L.reading(s.R, s.M).where).toBe('outside');
    s = L.moveM(s, [9.4, -0.6, 2.51]);
    expect(s.M).toEqual([s.bound, -1, 3]);
    s = L.stepM(s, 2, -5);
    expect(s.M[2]).toBe(-2);
  });

  it('juge chaque déclaration par la comparaison exacte de OM² et R² ; un refus garde la vraie position', () => {
    let s = goTo(L.init(B), [1, 1, 1]);
    expect(L.probeAt(s)).toBe('B');
    s = L.classify(s, 'surface');
    expect(s.last).toMatchObject({ ok: false, claimed: 'surface', truth: 'inside', name: 'B', OMTex: '\\sqrt{3}' });
    expect(s.refusals).toBe(1);
    s = L.classify(s, 'inside');
    expect(s.last.ok).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
  });

  it('la découverte attend les trois positions (le contraste كرة / جلة)', () => {
    let s = L.init(B);
    s = L.classify(goTo(s, [1, 2, 2]), 'surface');
    s = L.classify(goTo(s, [2, 2, 2]), 'outside');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.classify(goTo(s, [1, 1, 1]), 'inside');
    expect(L.discoveryReady(s)).toBe(true);
    expect([...L.probesDone(s)].sort()).toEqual(['A', 'B', 'C']);
  });

  it('un verdict devient périmé dès que M bouge', () => {
    let s = L.classify(goTo(L.init(B), [1, 2, 2]), 'surface');
    expect(L.isStale(s)).toBe(false);
    s = L.stepM(s, 0, 1);
    expect(L.isStale(s)).toBe(true);
  });

  it('balaye tout le cube : le verdict est celui de OM² comparé à R² (aucun flottant)', () => {
    const s = L.init(B);
    for (let x = -s.bound; x <= s.bound; x += 1) for (let y = -s.bound; y <= s.bound; y += 1) for (let z = -s.bound; z <= s.bound; z += 1) {
      const d = x * x + y * y + z * z;
      const want = d === 9 ? 'surface' : d < 9 ? 'inside' : 'outside';
      expect(L.reading(3, [x, y, z]).where).toBe(want);
    }
  });
});

describe('sphere-probe — متقدم (R = 4) : M, P, Q puis le قطر et les دوائر', () => {
  it('place M sur la كرة, P dans la جلة, Q dehors — dans l’ordre des tâches', () => {
    let s = L.init(A);
    expect(s.mode).toBe('tasks');
    expect(L.currentTask(s)).toBe('surface');
    s = L.place(goTo(s, [2, 2, 2])); // √12 < 4
    expect(s.last).toMatchObject({ ok: false, task: 'surface', truth: 'inside', name: 'M' });
    s = L.place(goTo(s, [0, 0, 4]));
    expect(s.last.ok).toBe(true);
    expect(s.anchor).toEqual([0, 0, 4]);
    expect(L.currentTask(s)).toBe('inside');
    s = L.place(s); // le même nœud : déjà pris par M
    expect(s.last).toMatchObject({ ok: false, reason: 'taken', other: 'M' });
    s = L.place(goTo(s, [3, 3, 2])); // √22 > 4
    expect(s.last).toMatchObject({ ok: false, truth: 'outside', name: 'P' });
    s = L.place(goTo(s, [2, 2, 1]));
    expect(s.last.ok).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.place(goTo(s, [4, 0, 0])); // OQ = R : sur la كرة, pas dehors
    expect(s.last).toMatchObject({ ok: false, truth: 'surface', name: 'Q' });
    s = L.place(goTo(s, [3, 3, 2]));
    expect(s.last.ok).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(s.placed.map((p) => `${p.name}:${p.kind}`)).toEqual(['M:surface', 'P:inside', 'Q:outside']);
  });

  it('le قطر : M′ sur la كرة ET O milieu de [MM′] ; une corde est refusée avec sa longueur', () => {
    let s = L.init(A);
    for (const p of [[0, 0, 4], [2, 2, 1], [3, 3, 2]]) s = L.place(goTo(s, p));
    expect(L.canOpenCircles(s)).toBe(true);
    s = L.openCircles(s);
    expect(s.stage).toBe('circles');
    expect(L.currentTask(s)).toBe('diameter');
    s = L.claimDiameter(L.movePrime(s, [0, 0, 4]));
    expect(s.last.reason).toBe('same');
    s = L.claimDiameter(L.movePrime(s, [0, 1, -4]));
    expect(s.last).toMatchObject({ ok: false, reason: 'notOnSphere', truth: 'outside' });
    s = L.claimDiameter(L.movePrime(s, [4, 0, 0]));
    expect(s.last).toMatchObject({ ok: false, reason: 'notMidpoint', chordTex: '4\\sqrt{2}' });
    s = L.claimDiameter(L.movePrime(s, [0, 0, -4]));
    expect(s.last).toMatchObject({ ok: true, chordTex: '8' });
    expect(L.currentTask(s)).toBe('great-circle');
  });

  it('les sections : grand cercle seulement si le plan passe par O ; tangence et vide refusés', () => {
    let s = L.init(A);
    for (const p of [[0, 0, 4], [2, 2, 1], [3, 3, 2]]) s = L.place(goTo(s, p));
    s = L.claimDiameter(L.movePrime(L.openCircles(s), [0, 0, -4]));
    s = L.claimSection(L.setPlane(s, 2));
    expect(s.last).toMatchObject({ ok: false, reason: 'isSmall', radiusTex: '2\\sqrt{3}' });
    s = L.claimSection(L.setPlane(s, 0));
    expect(s.last).toMatchObject({ ok: true, radiusTex: '4' });
    expect(L.currentTask(s)).toBe('small-circle');
    s = L.claimSection(L.setPlane(s, -4));
    expect(s.last.reason).toBe('tangent');
    s = L.claimSection(L.setPlane(s, 9));
    expect(s.h).toBe(5);
    expect(s.last.reason).toBe('none');
    s = L.claimSection(L.setPlane(s, 0));
    expect(s.last.reason).toBe('isGreat');
    s = L.claimSection(L.setPlane(s, -3));
    expect(s.last).toMatchObject({ ok: true, radiusTex: '\\sqrt{7}' });
    expect(L.allDone(s)).toBe(true);
  });

  it('la preuve envoyée à la leçon ne contient que le geste jugé', () => {
    const s = L.place(goTo(L.init(A), [0, 0, 4]));
    expect(L.evidenceOf(s.last)).toMatchObject({ n: 1, ok: true, type: 'place', name: 'M', at: [0, 0, 4], where: 'surface', OM2: 16 });
  });
});

describe('sphere-probe — le départ n’est jamais la réponse de la première tâche (A-bis)', () => {
  it('quelle que soit la première tâche, M ne s’ouvre pas sur sa réponse, et rien n’est mémorisé', () => {
    for (const task of ['surface', 'inside', 'outside']) {
      for (const R of [2, 3, 4, 5]) {
        const lab = L.init({ R, bound: R + 1, tasks: [task, 'inside', 'outside'] });
        expect(L.reading(R, lab.M).where, `${task} R=${R}`).not.toBe(task);
        expect(lab.trials.length).toBe(0);
        expect(lab.placed.length).toBe(0);
      }
    }
    expect(L.init(A).M).not.toEqual([0, 0, 0]);
  });
});
