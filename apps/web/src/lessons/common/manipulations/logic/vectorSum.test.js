import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as T from '@smarter-academy/core/arithmetic/trigonometry.js';
import { LEVELS } from '../levels';
import * as L from './vectorSum';

/**
 * vector-sum — la logique du lab sur les nombres de levels.js : l'enchaînement de la trottinette (علاقة شال, refus de
 * la même origine et du saut, les trois sommes : virage, même direction, retour à 0) et le nageur du تحدّ (30° exact,
 * 2√3, l'aval refusé, le balayage de tous les angles).
 */
const CH = LEVELS['vector-sum'].beginner.numbers;
const SW = LEVELS['vector-sum'].advanced.numbers;

describe('vector-sum — chasles (la trottinette)', () => {
  it('B est la fin du premier trajet AB = u', () => {
    const s = L.init(CH);
    expect(s.mode).toBe('chasles');
    expect(V.vecEq(V.vec(s.A, s.B), s.u)).toBe(true);
    expect(s.stations.map((st) => st.id)).toEqual(['A', 'B', 'P', 'Q']);
  });

  it('seule la queue posée en B est acceptée ; A = même origine, ailleurs = saut', () => {
    const s = L.init(CH);
    for (let leg = 0; leg < s.legs.length; leg += 1) {
      expect(L.canAttach(s, leg, 'B')).toBe(true);
      expect(L.canAttach(s, leg, 'A')).toBe('origin');
      expect(L.canAttach(s, leg, 'P')).toBe('gap');
      expect(L.canAttach(s, leg, 'Q')).toBe('gap');
    }
    const r = L.refuse(s, 0, 'A');
    expect(r.refusals).toHaveLength(1);
    expect(r.last).toMatchObject({ kind: 'refusal' });
    expect(L.attach(s, 0, 'A')).toBe(s);
  });

  it('les trois cartes : virage (AC < AB + BC), même direction (B sur [AC]), retour (AB + BA = 0)', () => {
    const s = L.init(CH);
    const kinds = s.legs.map((_, leg) => L.chainOf(s, leg).kind);
    expect(kinds).toEqual(['turn', 'line', 'zero']);
    const turn = L.chainOf(s, 0);
    expect(V.vecEq(turn.sum, V.vecAdd(s.u, s.legs[0]))).toBe(true);                // AB + BC = AC
    expect(T.surdNumber(turn.AC)).toBeLessThan(T.surdNumber(turn.AB) + T.surdNumber(turn.BC));
    const line = L.chainOf(s, 1);
    expect(Math.abs(T.surdNumber(line.AC) - (T.surdNumber(line.AB) + T.surdNumber(line.BC)))).toBeLessThan(1e-12);
    const zero = L.chainOf(s, 2);
    expect(zero.opposite).toBe(true);
    expect(V.isZeroVec(zero.sum)).toBe(true);
    expect(V.vecEq(zero.C, s.A)).toBe(true);
  });

  it('la découverte attend le virage ET le retour', () => {
    let s = L.init(CH);
    s = L.attach(s, 1, 'B');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.attach(s, 0, 'B');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.attach(s, 2, 'B');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ mode: 'chasles', kind: 'zero', head: 'A', straight: '0' });
  });

  it('l’évidence d’un virage : chemin parcouru ≈ 6,32 > distance ≈ 5,66', () => {
    const s = L.attach(L.init(CH), 0, 'B');
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'turn', head: 'C', path: '6,32', straight: '5,66' });
  });

  it('la carte contient toutes les stations et toutes les arrivées, à cases carrées, à plusieurs largeurs', () => {
    const s = L.init(CH);
    for (const [width, height] of [[280, 220], [360, 260], [640, 360], [900, 420]]) {
      const G = L.mapLayout(s, { width, height });
      expect(G.width).toBeLessThanOrEqual(width + 1e-9);
      expect(G.height).toBeLessThanOrEqual(height + 1e-9);
      const all = [...s.stations.map((st) => st.p), ...s.legs.map((v) => V.translate(s.B, v))];
      for (const p of all) {
        const [x, y] = V.coords(p);
        expect(G.X(x)).toBeGreaterThan(0); expect(G.X(x)).toBeLessThan(G.width);
        expect(G.Y(y)).toBeGreaterThan(0); expect(G.Y(y)).toBeLessThan(G.height);
      }
      expect(G.X(1) - G.X(0)).toBeCloseTo(G.Y(0) - G.Y(1), 9);
    }
  });
});

describe('vector-sum — parallelogram (le nageur du تحدّ)', () => {
  it('le تحدّ : 30° exact, vitesse réelle 2√3 ≈ 3,46', () => {
    const s = L.init(SW);
    expect(L.crossingResult(s)).toMatchObject({ angle: 30, speedTex: '2\\sqrt{3}', speedText: '3,46' });
  });

  it('viser droit sur B : emporté de 30 m vers l’aval (60 m de large, 2 contre 4)', () => {
    const s = L.launch(L.init(SW), 0);
    expect(s.last.trial).toMatchObject({ theta: 0, side: 'downstream', driftText: '30', speedText: '4,47' });
    expect(L.discoveryReady(s)).toBe(false);
  });

  it('30° : sur B, et la découverte s’ouvre après un essai manqué', () => {
    let s = L.launch(L.init(SW), 30);
    expect(s.last.trial.side).toBe('target');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.launch(s, 45);
    expect(s.last.trial.side).toBe('upstream');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ mode: 'parallelogram', theta: 45, side: 'upstream' });
  });

  it('balayé : la somme s + c est la diagonale, et seule θ = 30° la met sur (AB)', () => {
    const s = L.init(SW);
    for (let t = s.thetaMin; t <= s.thetaMax; t += 1) {
      const v = L.velocities(s, t);
      expect(v.r.y).toBeGreaterThan(0);                          // il traverse toujours
      expect(Math.hypot(v.s.x, v.s.y)).toBeCloseTo(4, 12);       // |s| = 4 quel que soit θ
      const side = L.launch(s, t).last.trial.side;
      expect(side, String(t)).toBe(t === 30 ? 'target' : t < 30 ? 'downstream' : 'upstream');
      if (t !== 30) expect(Math.sign(L.driftAt(s, t))).toBe(t < 30 ? 1 : -1);
    }
  });
});

describe('vector-sum — défaut et « جرّب كل الإمكانيات » (nageur)', () => {
  it('le départ θ n\'est jamais la solution et n\'est pas un essai', () => {
    for (const swim of [4, 5, 6, 10]) for (const current of [1, 2, 3]) {
      const s = L.init({ mode: 'parallelogram', swim, current, width: 60 });
      expect(s.trials).toHaveLength(0);
      expect(s.theta).not.toBe(s.crossing.angle);
    }
  });
  it('la balade parcourt la graduation, comprend l\'angle exact, et chaque pas est un départ ordinaire', () => {
    let s = L.init(SW);
    const all = L.sweepThetas(s);
    expect(all).toContain(30);
    expect(all.every((t) => t >= s.thetaMin && t <= s.thetaMax)).toBe(true);
    const hand = all.reduce((acc, t) => L.launch(acc, t), L.init(SW));
    for (let i = 0; i < all.length; i += 1) {
      expect(L.untriedThetas(s)).toHaveLength(all.length - i);
      s = L.launch(s, L.untriedThetas(s)[0]);
    }
    expect(L.untriedThetas(s)).toHaveLength(0);
    expect(s.trials).toEqual(hand.trials);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('chasles : pas de balade', () => {
    expect(L.sweepThetas(L.init(CH))).toEqual([]);
  });
});
