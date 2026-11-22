import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import '../../../../../../../i18n';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import ShadowWorld from '../../../../../../common/manipulations/geometry/ShadowWorld';
import ManipulationWorkspace from '../../../../../../common/manipulations/ManipulationWorkspace';
import * as SW from '../../../../../../common/manipulations/logic/shadowWorld';
import { FIG_SHADOW } from './figures';
import { SHADOW_WORLD, SHADOW_STEPS } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 (« ساحة الحيّ », 2026-10-13) : la figure qui relie la Place à la géométrie dit VRAI, les quatre égalités de
 * l'étape 2 sont jugées par les nombres de la figure (une seule est vraie), le calcul de la palmeraie est exact, le workspace
 * monte le monde aux deux niveaux avec les props écrites dans content/textbook.js, et la config les déclare.
 */
const P = FIG_SHADOW.points;
const d = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);

it('la figure est valide et vraie : (AM) // (BE), O E M alignés, angles droits au sol', () => {
  expect(validateGeoFigure(FIG_SHADOW)).toEqual([]);
  expect(P.A[0]).toBe(P.M[0]); // deux verticales
  expect(P.B[0]).toBe(P.E[0]);
  const cross = (P.E[0] - P.O[0]) * (P.M[1] - P.O[1]) - (P.E[1] - P.O[1]) * (P.M[0] - P.O[0]);
  expect(Math.abs(cross)).toBeLessThan(1e-9); // le rayon (OM) passe par E
});

it('étape 2 : seule OB/OA = BE/AM est vraie sur la figure ; l’inverse, le segment AB et la différence sont faux', () => {
  const ok = d('O', 'B') / d('O', 'A');
  expect(ok).toBeCloseTo(d('B', 'E') / d('A', 'M'), 9);
  expect(d('O', 'B') / d('O', 'A')).not.toBeCloseTo(d('A', 'M') / d('B', 'E'), 3);
  expect(d('O', 'B') / d('A', 'B')).not.toBeCloseTo(d('B', 'E') / d('A', 'M'), 3);
  expect(d('O', 'A') - d('O', 'B')).not.toBeCloseTo(d('A', 'M') - d('B', 'E'), 3);
});

it("étape 3 : le palmier (ombre 9,3 m ; lampadaire de 2,75 m d'ombre 3,3 m) mesure 7,75 m — le monde dit la même chose à 14:00", () => {
  // depuis le 2026-11-10 (lecteur de mission) : 3 m et 4,5 m étaient des nombres de la مسألة du module 5 (content/forbidden.js)
  expect(LIN.fracText(TH.fourthProportional('3,3', '2,75', '9,3'))).toBe('31/4');
  expect(SHADOW_STEPS.answers.palm).toBe(31 / 4);
  // les deux réponses fausses reconnues : multiplier par 1,2 au lieu de diviser ; retrancher l'écart 3,3 − 2,75
  expect(SHADOW_STEPS.wrong.times).toBeCloseTo(9.3 * 1.2, 9);
  expect(SHADOW_STEPS.wrong.minus).toBeCloseTo(9.3 - (3.3 - 2.75), 9);
  ['2{,}75', '3{,}3', '9{,}3'].forEach((n) => expect(SHADOW_STEPS.calc).toContain(n));
  expect(SHADOW_STEPS.calcLine).toContain('7{,}75');
  const s = SW.setHour(SW.init(SHADOW_WORLD.beginner), 3); // 14:00
  expect(SW.HOURS[3]).toBe('14:00');
  expect(SW.shadowAt(275, 3)).toBe(330);
  expect(SW.shadowAt(775, 3)).toBe(930);
  expect(s.minaret).toBe(500);
});

it('les deux niveaux montent le même monde (minaret 5 puis 6,5) dans un workspace, sans clé brute', () => {
  const html = renderToString(
    <ManipulationWorkspace levels={{
      beginner: () => <ShadowWorld level="beginner" {...SHADOW_WORLD.beginner} />,
      advanced: () => <ShadowWorld level="advanced" {...SHADOW_WORLD.advanced} />,
    }} />,
  );
  expect(html).toContain('data-shadow-world');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(() => SW.init(SHADOW_WORLD.advanced)).not.toThrow();
});

it('la config déclare les deux niveaux du module 1 comme shadow-world, et plus de faisceau', () => {
  const m1 = LESSON_CONFIG.resources.filter((r) => r.kind === 'manipulation' && r.module === 1);
  expect(m1.map((r) => [r.type, r.level])).toEqual([['shadow-world', 'beginner'], ['shadow-world', 'advanced']]);
  expect(new Set(m1.map((r) => r.code)).size).toBe(2);
});
