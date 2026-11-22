import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import '../../../../../../i18n';
import Clinometer from '../../../../../common/manipulations/geometry/Clinometer';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as CL from '../../../../../common/manipulations/logic/clinometer';
import { LAB, LAB_EXPECT, SITUATION, TEST } from './content/textbook';

/**
 * Le workspace du module 7 de la synthèse — `clinometer` (leçon 4) réutilisé en mode `align`, monde `maqam`, deux
 * niveaux — rendu avec EXACTEMENT les props que le module étale (content/textbook.js › LAB) ; puis la mathématique
 * que les modules 7 et 8 supposent, recalculée avec packages/core (trigonometry.js) et posée par la main dans la
 * logique du lab (logic/clinometer.js).
 */
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <Clinometer level="beginner" {...LAB.beginner} />,
      advanced: () => <Clinometer level="advanced" {...LAB.advanced} />,
    }}
  />
);
const n = (p) => LIN.toNumber(p);

it('les deux niveaux se rendent dans le workspace, en alignement devant مقام الشهيد, sans clé brute ni réponse', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-mode="align"/g) ?? []).length).toBe(2);
  expect((html.match(/data-world="maqam"/g) ?? []).length).toBe(2);
  expect(html).toContain('data-cl-glance');
  expect(html).toContain('data-cl-hand=');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('92,09');
  expect(html).not.toContain('92{,}09');
  expect(html).not.toContain('43°');
});

it('les props du LAB sont les nombres de la وضعية (rien retapé) : total = PM + AP', () => {
  const { pole, poleAt, d } = SITUATION.numbers;
  expect(LAB.advanced.numbers).toMatchObject({ mode: 'align', pole, poleAt });
  expect(LAB.advanced.numbers.total).toBeCloseTo(poleAt + d, 10);
});

it('la وضعية : une place ratée, puis l’alignement à 2,45 m ; sin refusé, tan → h ≈ 92,09 m et x ≈ 43°', () => {
  let s = CL.init(LAB.advanced.numbers);
  expect(n(CL.valueAt(s, s.iStar))).toBeCloseTo(LAB_EXPECT.advanced.d, 10);
  expect(CL.alignKind(s)).not.toBe('aligned');
  s = CL.moveTo(s, s.iStar - 4);
  expect(CL.alignKind(s)).toBe('over');
  s = CL.moveTo(s, s.iStar);
  expect(CL.alignKind(s)).toBe('aligned');
  expect(CL.ratioVerdict('align', 'sin')).toMatchObject({ ok: false });
  s = CL.chooseRatio(s, 'tan');
  expect(CL.result(s)).toMatchObject({ H100: '92,09', H1: '92', x: String(LAB_EXPECT.advanced.x) });
  expect(CL.discoveryReady(s)).toBe(true);
  // la même chose sans le lab, comme le module l'écrit : h = 2,30 × 98,1 ÷ 2,45 ; tan x = 2,30 ÷ 2,45
  expect(TR.roundTo(2.3 * 98.1 / 2.45, 2)).toBe('92,09');
  expect(TR.roundTo(TR.angleDeg('tan', 2.3 / 2.45), 0)).toBe('43');
  // les distracteurs du module 7 : 95,65 au lieu de 98,1 ; tan arrondi à 0,9 ; l'angle complémentaire
  expect(TR.roundTo(2.3 * 95.65 / 2.45, 2)).toBe('89,79');
  expect(TR.roundTo(TR.angleDeg('tan', 0.9), 0)).toBe('42');
  expect(TR.roundTo(90 - TR.angleDeg('tan', 2.3 / 2.45), 0)).toBe('47');
});

it('le réverbère (مبتدئ) : 92 m de haut, l’alignement tombe à 3 m, tan x = 1, x = 45°', () => {
  let s = CL.init(LAB.beginner.numbers);
  expect(n(CL.valueAt(s, s.iStar))).toBeCloseTo(LAB_EXPECT.beginner.d, 10);
  s = CL.moveTo(s, s.iStar + 2);
  expect(CL.alignKind(s)).toBe('under');
  s = CL.moveTo(s, s.iStar);
  s = CL.chooseRatio(s, 'tan');
  expect(CL.result(s)).toMatchObject({ H1: '92', x: String(LAB_EXPECT.beginner.x) });
});

it('la brique `muthallath-fada` (module 7) : le pavé 3,15 × 2,35 × 1,55 — AC² = 15,445, AD² = 17,8475, 22° (23° si AD est arrondi d’abord)', () => {
  const AC = Math.hypot(3.15, 2.35); const AD = Math.hypot(AC, 1.55);
  expect(TR.roundTo(AC ** 2, 3)).toBe('15,445');
  expect(TR.roundTo(AD ** 2, 4)).toBe('17,8475');
  expect([TR.roundTo(AC, 0), TR.roundTo(AD, 0)]).toEqual(['4', '4']);
  expect(TR.roundTo(TR.angleDeg('sin', 1.55 / AD), 0)).toBe('22');
  expect(TR.roundTo(TR.angleDeg('sin', 1.55 / 4), 0)).toBe('23');
});

it('« إختبار أولي » (autres nombres) : la minaret 265 m, x ≈ 53° ; le conteneur ≈ 12,47 m', () => {
  const pole = Number(TEST.minaret.pole); const poleAt = Number(TEST.minaret.poleAt.replace(',', '.')); const d = Number(TEST.minaret.d);
  let s = CL.init({ mode: 'align', pole, poleAt, total: poleAt + d });
  s = CL.moveTo(s, s.iStar);
  s = CL.chooseRatio(s, 'tan');
  expect(CL.result(s)).toMatchObject({ H1: '265', x: '53' });
  // les distracteurs : 195,75 au lieu de 198,75 ; oubli de ÷ 3 ; l'autre angle
  expect(TR.roundTo(pole * poleAt / d, 0)).toBe('261');
  expect(pole * (poleAt + d)).toBe(795);
  expect(TR.roundTo(TR.angleDeg('tan', d / pole), 0)).toBe('37');
  const AB = 12; const BC = 2.4; const CD = 2.4;
  expect(TR.roundTo(Math.hypot(AB, BC, CD), 2)).toBe('12,47');
  expect(TR.roundTo(Math.hypot(AB, BC), 2)).toBe('12,24');
});
