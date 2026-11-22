import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import '../../../../../../i18n';
import ShadowWorld from '../../../../../common/manipulations/geometry/ShadowWorld';
import ConeCylinder from '../../../../../common/manipulations/geometry/ConeCylinder';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as SW from '../../../../../common/manipulations/logic/shadowWorld';
import * as CC from '../../../../../common/manipulations/logic/coneCylinder';
import { LAB, CHALLENGE, SITUATION, TEST } from './content/textbook';

/**
 * Le workspace du module 7 de la synthèse — deux TYPES dans un workspace (shadow-world à مبتدئ, cone-cylinder à
 * متقدم) — rendu avec EXACTEMENT les props que le module étale (content/textbook.js › LAB) ; puis la mathématique
 * que les modules 7 et 8 supposent, recalculée avec packages/core (thales.js) et posée par la main dans la
 * logique des deux labs.
 */
const workspace = () => (
  <ManipulationWorkspace
    levels={{
      beginner: () => <ShadowWorld level="beginner" {...LAB.beginner} />,
      advanced: () => <ConeCylinder level="advanced" {...LAB.advanced} />,
    }}
  />
);
const t = LIN.fracText;

it('les deux labs se rendent dans le workspace, chacun son monde, sans clé i18n brute ni réponse affichée', () => {
  const html = renderToString(workspace());
  expect(html).toContain('data-shadow-world');
  expect(html).toContain('data-cone-cylinder');
  expect(html).toContain('data-sw-glance');
  expect(html).toContain('data-cc-glance');
  expect(html).toContain('data-world="minaret"');
  expect(html).toContain('data-world="cornet"');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('7,25');
  expect(html).not.toContain('91,125');
});

it('les props du LAB sont les nombres du تحدّ et de la وضعية (rien retapé)', () => {
  // la minaret de « ساحة الحيّ » EST celle du تحدّ : AM = 1 × 11,6 ÷ 1,6
  expect(t(TH.heightFromShadow(CHALLENGE.numbers))).toBe(t(LIN.parseNumber(LAB.beginner.minaret)));
  expect(LAB.advanced).toMatchObject(SITUATION.numbers);
});

it('le تحدّ dans la place : à 15:00 la main plante le bâton à 10 m, les ombres finissent à 11,6 m — 7,25 m', () => {
  expect(t(TH.heightFromShadow({ stick: 1, stickAt: 10, tip: '11,6' }))).toBe('29/4');
  let lab = SW.setHour(SW.init(LAB.beginner), SW.TEXTBOOK_HOUR);
  lab = SW.placeStick(lab, 900);
  expect(lab.last.hidden).toBe(true);
  lab = SW.placeStick(lab, 1000);
  expect(lab.last.meet).toBe(true);
  expect(SW.m(SW.minaretTip(lab))).toBe('11,6');
  lab = SW.answer(lab, '7,25');
  expect(SW.goals(lab).minaret).toBe(true);
});

it('la وضعية : deux cylindres inscrits, un refus, puis h = r = 4,5 et V = 91,125π ≈ 286,28', () => {
  const cone = TH.cylinderInCone({ H: 18, R: 6 });
  expect(t(cone.equalHR.r)).toBe('9/2');
  expect(t(cone.equalHR.volumeOverPi)).toBe('729/8');
  let lab = CC.init(LAB.advanced);
  lab = CC.setR(lab, CC.touchIndex(lab) + 1);
  expect(lab.last.kind).toBe('pierceR');
  lab = CC.setR(lab, CC.touchIndex(lab));
  lab = CC.setH(lab, 6);
  lab = CC.setR(lab, CC.touchIndex(lab));
  expect(CC.discoveryReady(lab)).toBe(true);
  expect(CC.goalFound(lab)).toBe(true);
  expect(CC.volumeApprox(CC.status(lab).vop)).toBe('286,28');
});

it('« وضعية الاختبار النهائي » (autres nombres) : r = 4, V = 64π ≈ 201,06 ; la minaret 10,5 m', () => {
  const cone = TH.cylinderInCone({ H: TEST.cone.H, R: TEST.cone.R });
  expect(t(cone.equalHR.r)).toBe('4');
  expect(t(cone.equalHR.volumeOverPi)).toBe('64');
  expect(CC.volumeApprox(cone.equalHR.volumeOverPi)).toBe('201,06');
  expect(TH.thalesText(TH.heightFromShadow({ stick: TEST.minaret.stick, stickAt: TEST.minaret.stickAt, tip: TEST.minaret.tip }))).toBe('10,5');
  // les distracteurs du test sont faux
  expect(CC.volumeApprox(LIN.frac(256))).toBe('804,25');
  expect(LIN.eq(cone.radiusFor(3), LIN.frac(3))).toBe(false);
});
