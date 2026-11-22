import { describe, it, expect } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { makeRng } from '../../../../lessons/common/stats/randomUtils.js';
import {
  DIE_FACE_VALUES, THROW_PHASES, coinOrientation, coinTopFace, dieNormalOf, dieOrientation, dieTopFace,
  planThrow, randomThrowSpec,
} from './dieOrientation.js';

/**
 * Le contrat physique : le résultat commande la face. Pour CHAQUE valeur, et
 * quel que soit le mouvement, l'objet finit avec la bonne face en haut — lu
 * sur l'orientation réelle, pas supposé.
 */

const angleBetween = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(a.clone().normalize().dot(b.clone().normalize()))));

describe('les faces du dé', () => {
  it('portent 1 à 6 une fois chacune, et les faces opposées font 7', () => {
    expect([...DIE_FACE_VALUES].sort()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(DIE_FACE_VALUES[0] + DIE_FACE_VALUES[1]).toBe(7);
    expect(DIE_FACE_VALUES[2] + DIE_FACE_VALUES[3]).toBe(7);
    expect(DIE_FACE_VALUES[4] + DIE_FACE_VALUES[5]).toBe(7);
  });

  it('font un dé occidental : 1 en haut, 2 devant, 3 à droite', () => {
    expect(dieNormalOf(1).toArray()).toEqual([0, 1, 0]);
    expect(dieNormalOf(2).toArray()).toEqual([0, 0, 1]);
    expect(dieNormalOf(3).toArray()).toEqual([1, 0, 0]);
    expect(() => dieNormalOf(7)).toThrow();
  });
});

describe('résultat → orientation → face lue', () => {
  it('pour chaque valeur et douze lacets, la face en haut est la valeur demandée', () => {
    for (const value of [1, 2, 3, 4, 5, 6]) {
      for (let k = 0; k < 12; k += 1) {
        const yaw = (k / 12) * 2 * Math.PI;
        const q = dieOrientation(value, yaw);
        expect(dieTopFace(q), `valeur ${value}, lacet ${k}`).toBe(value);
        // La normale de la face, tournée, pointe EXACTEMENT vers le haut.
        const up = dieNormalOf(value).applyQuaternion(q);
        expect(up.y).toBeCloseTo(1, 9);
      }
    }
  });

  it('lit la face d’une orientation quelconque — celle qui regarde le plus vers le haut', () => {
    // Un dé posé sur le 6 (1 en bas) : la face en haut est 6.
    const q = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI);
    expect(dieTopFace(q)).toBe(6);
    // Un dé légèrement penché garde sa face.
    const tilted = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.3).multiply(dieOrientation(4));
    expect(dieTopFace(tilted)).toBe(4);
  });

  it('la pièce : « وجه » et « ظهر », pour tout lacet', () => {
    for (let k = 0; k < 8; k += 1) {
      const yaw = (k / 8) * 2 * Math.PI;
      expect(coinTopFace(coinOrientation(true, yaw))).toBe('heads');
      expect(coinTopFace(coinOrientation(false, yaw))).toBe('tails');
    }
  });
});

describe('le lancer planifié', () => {
  const rest = (value) => ({ position: new Vector3(0, 0.5, 0), quaternion: dieOrientation(value, 0.4) });

  it('part de la pose de repos et finit EXACTEMENT sur l’orientation du résultat, pour chaque valeur et chaque mouvement', () => {
    const rng = makeRng(2026);
    for (const from of [1, 2, 3, 4, 5, 6]) {
      for (const value of [1, 2, 3, 4, 5, 6]) {
        const spec = randomThrowSpec('die', new Vector3(0, 0, 0), rng);
        const to = dieOrientation(value, rng() * 2 * Math.PI);
        const plan = planThrow(rest(from), to, spec);
        const first = plan.at(0);
        const last = plan.at(1);
        expect(angleBetween(first.quaternion, rest(from).quaternion)).toBeLessThan(1e-9);
        expect(angleBetween(last.quaternion, to)).toBeLessThan(1e-9);
        expect(dieTopFace(last.quaternion), `de ${from} vers ${value}`).toBe(value);
        // Dès l'atterrissage (phase L), la face est déjà la bonne et ne bouge plus.
        for (const u of [THROW_PHASES.L, 0.8, 0.9, 0.97]) {
          expect(dieTopFace(plan.at(u).quaternion)).toBe(value);
          expect(angleBetween(plan.at(u).quaternion, to)).toBeLessThan(1e-9);
        }
      }
    }
  });

  it('tourne vraiment en vol : plusieurs tours, jamais un simple glissement', () => {
    const rng = makeRng(7);
    const spec = { ...randomThrowSpec('die', new Vector3(), rng), turns: 3 };
    const plan = planThrow(rest(1), dieOrientation(6), spec);
    // Le chemin est continu (petits pas) et cumule bien plus qu'un demi-tour.
    let travelled = 0;
    let previous = plan.at(0).quaternion;
    for (let i = 1; i <= 400; i += 1) {
      const q = plan.at(i / 400).quaternion;
      const step = angleBetween(q, previous);
      expect(step).toBeLessThan(0.35);
      travelled += step;
      previous = q;
    }
    expect(travelled).toBeGreaterThan(2 * Math.PI * 2);
  });

  it('décrit une trajectoire : creux, envol, atterrissage, rebonds, repos', () => {
    const rng = makeRng(11);
    const spec = randomThrowSpec('die', new Vector3(0, 0, 0), rng);
    const from = { position: new Vector3(0, 0.5, 0), quaternion: dieOrientation(2) };
    const plan = planThrow(from, dieOrientation(5), spec);
    const { A, L, B1, B2 } = THROW_PHASES;
    expect(plan.at(A / 2).position.y).toBeLessThan(0.5);
    expect(plan.at((A + L) / 2).position.y).toBeGreaterThan(0.5 + spec.height * 0.9);
    expect(plan.at(L).position.y).toBeCloseTo(0.5, 9);
    expect(plan.at((L + B1) / 2).position.y).toBeGreaterThan(0.5);
    expect(plan.at((B1 + B2) / 2).position.y).toBeGreaterThan(0.5);
    expect(plan.at((L + B1) / 2).position.y).toBeGreaterThan(plan.at((B1 + B2) / 2).position.y);
    expect(plan.at(1).position.y).toBeCloseTo(0.5, 9);
    // Elle part de sa place, s'écarte en vol (jamais de téléportation) et revient près de sa place.
    expect(plan.at(0).position.x).toBe(0);
    const mid = plan.at((A + L) / 2).position;
    expect(Math.hypot(mid.x, mid.z)).toBeGreaterThan(0.4);
    expect(Math.abs(plan.at(1).position.x)).toBeLessThan(0.4);
    expect(plan.at(1.7).position.y).toBeCloseTo(0.5, 9);
  });

  it('la pièce : retournée autant de fois qu’on veut, elle finit sur le côté demandé', () => {
    const rng = makeRng(99);
    for (const fromHeads of [true, false]) {
      for (const toHeads of [true, false]) {
        for (let k = 0; k < 6; k += 1) {
          const spec = randomThrowSpec('coin', new Vector3(), rng);
          const from = { position: new Vector3(0, 0.08, 0), quaternion: coinOrientation(fromHeads, rng()) };
          const to = coinOrientation(toHeads, rng() * 2 * Math.PI);
          const plan = planThrow(from, to, spec);
          expect(coinTopFace(plan.at(1).quaternion)).toBe(toHeads ? 'heads' : 'tails');
          expect(coinTopFace(plan.at(0).quaternion)).toBe(fromHeads ? 'heads' : 'tails');
          expect(spec.spinAxis.y).toBe(0);
        }
      }
    }
  });

  it('varie d’un lancer à l’autre, dans des plages crédibles', () => {
    const rng = makeRng(5);
    const specs = Array.from({ length: 20 }, () => randomThrowSpec('die', new Vector3(), rng));
    for (const spec of specs) {
      expect(spec.turns).toBeGreaterThanOrEqual(2);
      expect(spec.turns).toBeLessThanOrEqual(4);
      expect(spec.duration).toBeGreaterThanOrEqual(700);
      expect(spec.duration).toBeLessThanOrEqual(1200);
    }
    const axes = new Set(specs.map((s) => s.spinAxis.toArray().map((n) => n.toFixed(2)).join(',')));
    expect(axes.size).toBeGreaterThan(15);
  });
});
