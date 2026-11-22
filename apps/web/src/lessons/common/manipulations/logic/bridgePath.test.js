import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as L from './bridgePath';
import { LEVELS } from '../levels';

/**
 * bridge-path — la logique du plus court passage sur les nombres des DEUX niveaux de levels.js (la gorge du Rhummel ;
 * la وضعية du manuel avec les nombres de l'extraction : A(−3 ; 5), B(4 ; −3), bande 0 ≤ y ≤ 2, minimum √85 + 2).
 * Balayé, pas échantillonné : chaque place de la réglette, chaque nœud du cadre pour l'épingle.
 */
const ADV = LEVELS['bridge-path'].advanced.numbers;
const BEG = LEVELS['bridge-path'].beginner.numbers;
const n = LIN.toNumber;

describe('bridge-path — la réglette du passage', () => {
  it.each([['advanced', ADV], ['beginner', BEG]])('%s : la place optimale est une graduation, le départ ne l’est pas', (_, nums) => {
    const s = L.init(nums);
    expect(Number.isInteger(s.iStar)).toBe(true);
    expect(s.iStar).toBeGreaterThan(s.iMin);
    expect(s.iStar).toBeLessThan(s.iMax);
    expect(s.i).not.toBe(s.iStar);
    expect(L.aligned(s, s.iStar)).toBe(true);
  });

  it('la وضعية : M(1/2 ; 2) au pas d’un demi-carreau, minimum √85 + 2 ≈ 11,22', () => {
    const s = L.init(ADV);
    expect(n(s.step)).toBe(0.5);
    expect(n(L.xAt(s, s.iStar))).toBe(0.5);
    expect(L.minimum(s)).toMatchObject({ latex: '\\sqrt{85} + 2' });
    expect(L.dec(L.minimum(s).number)).toBe('11,22');
    expect(L.dec(L.partsAt(s, s.iStar).total)).toBe('11,22');
  });

  it.each([['advanced', ADV], ['beginner', BEG]])('%s : balayage — la seule place alignée est la plus courte, toutes les autres sont plus longues', (_, nums) => {
    const s = L.init(nums);
    const min = L.minimum(s).number;
    for (let i = s.iMin; i <= s.iMax; i += 1) {
      const p = L.partsAt(s, i);
      expect(p.mn).toBe(n(s.w));
      if (i === s.iStar) {
        expect(L.aligned(s, i)).toBe(true);
        expect(Math.abs(p.total - min)).toBeLessThan(1e-12);
      } else {
        expect(L.aligned(s, i)).toBe(false);
        expect(p.total).toBeGreaterThan(min + 1e-6);
      }
    }
  });

  it('le passage devant A et la ligne droite [AB] ne sont pas le minimum (les distracteurs de la découverte)', () => {
    for (const nums of [ADV, BEG]) {
      const s = L.init(nums);
      const front = (n(s.A.x) - n(s.xLo)) / n(s.step);
      expect(L.partsAt(s, front).total).toBeGreaterThan(L.minimum(s).number + 1e-3);
      expect(L.abCrossing(s).total).toBeGreaterThan(L.minimum(s).number + 1e-3);
    }
  });
});

describe('bridge-path — les trois temps', () => {
  it('la translation ne s’ouvre qu’après deux places différentes, par le geste de l’élève', () => {
    let s = L.init(ADV);
    expect(L.canTranslate(s)).toBe(false);
    expect(L.openTranslate(s)).toBe(s);
    s = L.cross(s, 2);
    s = L.cross(s, 2);
    expect(L.canTranslate(s)).toBe(false);
    s = L.cross(s, 12);
    expect(L.canTranslate(s)).toBe(true);
    expect(s.stage).toBe('explore');
    s = L.openTranslate(s);
    expect(s.stage).toBe('translate');
  });

  it('l’épingle B′ : chaque nœud du cadre jugé par relation(BB′, NM) — un seul est accepté', () => {
    let s = L.init(ADV);
    s = L.openTranslate(L.cross(L.cross(s, 1), 3));
    const f = L.frame(s);
    const kinds = {};
    for (let x = Math.ceil(f.xMin); x <= Math.floor(f.xMax); x += 1) {
      for (let y = Math.ceil(f.yMin); y <= Math.floor(f.yMax); y += 1) {
        const k = L.pinKind(s, V.point(x, y));
        kinds[k] = (kinds[k] ?? 0) + 1;
        if (k === 'equal') expect([x, y]).toEqual([4, -1]);
      }
    }
    expect(kinds.equal).toBe(1);
    expect(kinds.zero).toBe(1);
    expect(L.pinKind(s, V.point(4, -5))).toBe('sense'); // MN au lieu de NM
    expect(L.pinKind(s, V.point(4, -2))).toBe('length'); // la moitié de la largeur
    expect(L.pinKind(s, V.point(4, -4))).toBe('senseLength');
    expect(L.pinKind(s, V.point(6, -1))).toBe('direction'); // oblique, même longueur verticale
  });

  it('une épingle refusée revient sur B ; acceptée, MB′BN est un متوازي أضلاع et NB = MB′ partout', () => {
    let s = L.openTranslate(L.cross(L.cross(L.init(ADV), 1), 3));
    s = L.placePin(s, { x: 4, y: -5 });
    expect(s.stage).toBe('translate');
    expect(V.vecEq(s.pin, s.B)).toBe(true);
    expect(s.last.pin.kind).toBe('sense');
    s = L.placePin(s, { x: 4.3, y: -0.8 }); // aimanté sur le nœud (4 ; −1)
    expect(s.stage).toBe('straight');
    expect(V.vecEq(s.bp, V.point(4, -1))).toBe(true);
    for (let i = s.iMin; i <= s.iMax; i += 1) {
      const p = L.partsAt(s, i);
      // MB′ = NB toujours ; un vrai متوازي أضلاع sauf quand le passage est en face de B (M, B′, B alignés : aplati)
      expect(V.vecEq(V.vec(p.M, s.bp), V.vec(p.N, s.B))).toBe(true);
      expect(V.isParallelogram(p.M, s.bp, s.B, p.N)).toBe(LIN.toNumber(p.M.x) !== LIN.toNumber(s.B.x));
      expect(Math.abs(p.mbp - p.nb)).toBeLessThan(1e-12);
    }
  });

  it('la ligne brisée AMB′ refusée, puis la place alignée : découverte avec contraste', () => {
    let s = L.openTranslate(L.cross(L.cross(L.init(ADV), 1), 3));
    s = L.placePin(s, { x: 4, y: -1 });
    s = L.cross(s, s.iStar + 3);
    expect(s.last.kind).toBe('bent');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.cross(s, s.iStar);
    expect(s.last.kind).toBe('straight');
    expect(s.solved).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ stage: 'straight', d: '4,5', total: '11,22', optimal: true });
  });

  it('trouver la place au temps 1 ne suffit pas : la découverte attend la translation', () => {
    let s = L.init(ADV);
    s = L.cross(s, s.iStar);
    s = L.cross(s, 1);
    expect(s.trials[0].optimal).toBe(true);
    expect(s.solved).toBe(false);
    expect(L.discoveryReady(s)).toBe(false);
  });
});

describe('bridge-path — la scène', () => {
  it.each([280, 320, 640, 1000])('largeur %i : carreaux carrés, tout dans le cadre donné', (w) => {
    for (const nums of [ADV, BEG]) {
      const s = L.init(nums);
      const G = L.layout(s, { width: w, height: 360 });
      expect(G.width).toBeLessThanOrEqual(w + 1);
      expect(G.height).toBeLessThanOrEqual(361);
      expect(G.X(1) - G.X(0)).toBeCloseTo(G.Y(0) - G.Y(1), 9);
      const back = G.fromPx(G.X(2), G.Y(-1));
      expect(back.x).toBeCloseTo(2, 9);
      expect(back.y).toBeCloseTo(-1, 9);
      for (const P of [s.A, s.B, s.best.Bp]) {
        expect(G.X(P.x)).toBeGreaterThan(0); expect(G.X(P.x)).toBeLessThan(G.width);
        expect(G.Y(P.y)).toBeGreaterThan(0); expect(G.Y(P.y)).toBeLessThan(G.height);
      }
    }
  });

  it('écritures : virgule décimale, fractions exactes', () => {
    expect(L.dec(11.2195)).toBe('11,22');
    expect(L.numText(LIN.frac(1, 2))).toBe('0,5');
    expect(L.numText(LIN.frac(-1, 3))).toBe('−1/3');
    expect(L.numTex(LIN.frac(5, 2))).toBe('2{,}5');
  });
});

describe('bridge-path — défaut et « جرّب كل الإمكانيات »', () => {
  it('le départ du passage n\'est jamais la place optimale, et n\'est pas un essai', () => {
    for (const nums of [ADV, BEG]) {
      const s = L.init(nums);
      expect(L.defaultIsSolution(s)).toBe(false);
      expect(s.trials).toHaveLength(0);
    }
  });
  it('la balade parcourt toute la réglette au temps 1 et donne les mêmes essais que la main', () => {
    let s = L.init(ADV);
    const n0 = s.iMax - s.iMin + 1;
    expect(L.untriedPlaces(s)).toHaveLength(n0);
    let hand = L.init(ADV);
    for (let i = s.iMin; i <= s.iMax; i += 1) hand = L.cross(hand, i);
    while (L.untriedPlaces(s).length) s = L.cross(s, L.untriedPlaces(s)[0]);
    expect(s.trials.map((t) => t.i)).toEqual(hand.trials.map((t) => t.i));
    expect(L.canTranslate(s)).toBe(true);
    expect(s.solved).toBe(false);
  });
  it('au temps « poser B′ », rien à parcourir', () => {
    let s = L.init(ADV);
    s = L.cross(L.cross(s, 1), 2);
    s = L.openTranslate(s);
    expect(L.untriedPlaces(s)).toEqual([]);
  });
});
