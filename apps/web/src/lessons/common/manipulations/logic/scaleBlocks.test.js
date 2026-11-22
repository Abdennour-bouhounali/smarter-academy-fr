import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './scaleBlocks';
import { LEVELS } from '../levels';

const { frac, eq, toNumber, fracText } = Lin;
const B = LEVELS['scale-blocks'].beginner.numbers;
const A = LEVELS['scale-blocks'].advanced.numbers;
const go = (lab, k, pick) => L.build(L.predict(L.setK(lab, k), pick));

describe('scale-blocks — les rapports proposés', () => {
  it('مبتدئ (le cube d’arête 1) : 1/2 … 3, cadre = 3', () => {
    expect(L.kList(B).map(fracText)).toEqual(['1/2', '3/5', '1', '3/2', '2', '3']);
    expect(L.frameSize(B)).toEqual([3, 3, 3]);
  });
  it('متقدم (le نشاط 6, 5 × 4 × 3) : 1/2 … 2 (3 sortirait du cadre du plus grand rapport visé), cadre 10 × 8 × 6', () => {
    expect(L.kList(A).map(fracText)).toEqual(['1/2', '3/5', '1', '3/2', '2']);
    expect(L.frameSize(A)).toEqual([10, 8, 6]);
  });
  it('pas à pas et poignée : on reste dans la liste, la poignée se pose sur le rapport le plus proche', () => {
    let lab = L.init(A);
    lab = L.stepK(lab, -1); expect(fracText(lab.k)).toBe('3/5');
    lab = L.stepK(lab, -1); expect(fracText(lab.k)).toBe('1/2');
    lab = L.stepK(lab, -1); expect(fracText(lab.k)).toBe('1/2');
    expect(fracText(L.snapK(lab, 0.62))).toBe('3/5');
    expect(fracText(L.snapK(lab, 1.8))).toBe('2');
    expect(fracText(L.snapK(lab, 9))).toBe('2');
  });
});

describe('scale-blocks — le نشاط 6 (pavé 5 × 4 × 3 réduit de 3/5)', () => {
  it('lectures exactes : 3 ; 2,4 ; 1,8 — 𝒜 = 94 → 33,84 — 𝒱 = 60 → 12,96 (= 60 × 27/125)', () => {
    const r = L.readings(L.setK(L.init(A), '3/5'));
    expect(r.dims2.map(L.decText)).toEqual(['3', '2,4', '1,8']);
    expect(L.decText(r.area)).toBe('94');
    expect(L.decText(r.area2)).toBe('33,84');
    expect(L.decText(r.volume)).toBe('60');
    expect(L.decText(r.volume2)).toBe('12,96');
    expect(fracText(r.ratio.area)).toBe('9/25');
    expect(fracText(r.ratio.volume)).toBe('27/125');
    expect(r.kind).toBe('reduction');
  });
  it('les trois volumes proposés : 36 ; 21,6 ; 12,96 — un seul juste', () => {
    const o = L.options(L.setK(L.init(A), '3/5'));
    expect(o.map((x) => x.id).sort()).toEqual(['k', 'k2', 'k3']);
    expect(Object.fromEntries(o.map((x) => [x.id, L.decText(x.value)]))).toEqual({ k: '36', k2: '21,6', k3: '12,96' });
    expect(o.filter((x) => x.correct)).toHaveLength(1);
    expect(o.filter((x) => !x.correct).every((x) => x.misconceptionId === 'MISC-TAKBIR-HAJM-K')).toBe(true);
  });
  it('l’ordre des propositions dépend de k (la bonne n’est pas toujours au même endroit)', () => {
    const where = (k) => L.options(L.setK(L.init(A), k)).findIndex((x) => x.correct);
    expect(new Set(['1/2', '3/5', '3/2', 2].map(where)).size).toBeGreaterThan(1);
  });
  it('« × k » et « × k² » sont réfutés par le décompte ; « × k³ » est accepté', () => {
    let lab = go(L.init(A), '3/5', 'k');
    expect(lab.built.verdict).toBe('k');
    expect(L.decText(lab.built.volume)).toBe('12,96');
    expect(L.decText(lab.built.predicted)).toBe('36');
    lab = go(lab, 2, 'k2');
    expect(lab.built.verdict).toBe('k2');
    expect(L.decText(lab.built.volume)).toBe('480');
    // même k, nouvelle prédiction : on peut rebâtir (l'élève réessaie) — cette fois le décompte confirme
    lab = go(lab, 2, 'k3');
    expect(lab.built.verdict).toBe('ok');
    expect(lab.builds).toHaveLength(3);
  });
  it('on ne bâtit pas sans prédiction (sauf k = 1), ni deux fois le même bâti', () => {
    let lab = L.setK(L.init(A), 2);
    expect(L.canBuild(lab)).toBe('noPrediction');
    expect(L.build(lab)).toBe(lab);
    lab = L.build(L.predict(lab, 'k3'));
    expect(L.canBuild(lab)).toBe('already');
    const id = L.build(L.init(A));
    expect(id.built.verdict).toBe('identity');
    expect(L.options(L.init(A))).toBeNull();
  });
  it('« + 1 cm » : 6 × 5 × 4, rapports 6/5 ; 5/4 ; 4/3 différents → pas un agrandissement', () => {
    const p = L.plusReading(A.dims);
    expect(p.image.map(fracText)).toEqual(['6', '5', '4']);
    expect(p.ratios.map(fracText)).toEqual(['6/5', '5/4', '4/3']);
    expect(p.enlargement).toBe(false);
    // pour un cube, ajouter 1 cm partout EST un agrandissement (le même rapport (a + 1)/a sur les trois arêtes)
    expect(L.plusReading([1, 1, 1]).enlargement).toBe(true);
  });
  it('la découverte : 3/5 et 2 bâtis après une prédiction ET le contraste essayé (au niveau du نشاط 6)', () => {
    let lab = go(L.init(A), '3/5', 'k');
    expect(L.discoveryReady(lab)).toBe(false);
    lab = go(lab, 2, 'k3');
    expect(L.discoveryReady(lab)).toBe(false);
    lab = L.plusOne(lab);
    expect(lab.plus).toBe(true);
    expect(L.evidenceOf(lab)).toMatchObject({ kind: 'plus', enlargement: false, ratios: ['1,2', '1,25', '4/3'] });
    expect(L.discoveryReady(lab)).toBe(true);
  });
});

describe('scale-blocks — le cube d’arête 1 (مبتدئ)', () => {
  it('k = 2 : 8 cubes ; k = 3 : 27 cubes — la découverte après les deux (pas de contraste « + 1 » pour un cube)', () => {
    let lab = go(L.init(B), 2, 'k2');
    expect(L.decText(lab.built.volume)).toBe('8');
    expect(L.decText(lab.built.predicted)).toBe('4');
    expect(L.evidenceOf(lab)).toMatchObject({ kind: 'build', k: '2', ok: false, verdict: 'k2', predicted: '4', volume: '8' });
    expect(L.discoveryReady(lab)).toBe(false);
    lab = go(lab, 3, 'k3');
    expect(L.decText(lab.built.volume)).toBe('27');
    expect(L.discoveryReady(lab)).toBe(true);
  });
});

describe('scale-blocks — les cubes dessinés disent le volume (balayé)', () => {
  const levels = [B, A];
  it.each(levels.flatMap((lv) => L.kList(lv).map((k) => [lv.dims.join('×'), fracText(k), lv, k])))('%s, k = %s', (_n, _k, lv, k) => {
    const lay = L.blockLayout(lv.dims, k);
    const V = L.readings(L.setK(L.init(lv), k)).volume2;
    // n cubes d'arête s : n·s³ = V′ exactement (à la précision du dessin)
    expect(lay.cubes.length * lay.size ** 3).toBeCloseTo(toNumber(V), 9);
    // k entier : uniquement des cubes unités, k³ par cube d'origine (un paquet = une couleur)
    if (Number.isInteger(toNumber(k)) && toNumber(k) > 1) {
      expect(lay.unit).toBe(true);
      expect(lay.size).toBe(1);
      expect(lay.cubes.length).toBe(lv.dims.reduce((p, d) => p * d, 1) * toNumber(k) ** 3);
    } else {
      expect(lay.cubes.length).toBe(lv.dims.reduce((p, d) => p * d, 1));
    }
    // aucun cube hors du solide image, aucun doublon
    const [a, b, c] = lv.dims.map((d) => d * toNumber(k));
    const seen = new Set();
    for (const cb of lay.cubes) {
      cb.at.forEach((x, i) => { expect(x).toBeGreaterThanOrEqual(-1e-9); expect(x + lay.size).toBeLessThanOrEqual([a, b, c][i] + 1e-9); });
      const key = cb.at.map((x) => x.toFixed(6)).join(',');
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
  it('k = 2 sur le pavé : 480 cubes unités, 60 paquets de 8', () => {
    const lay = L.blockLayout(A.dims, 2);
    expect(lay.cubes).toHaveLength(480);
    expect(eq(L.volumes(L.setK(L.init(A), 2)).k3, frac(480))).toBe(true);
  });
});
