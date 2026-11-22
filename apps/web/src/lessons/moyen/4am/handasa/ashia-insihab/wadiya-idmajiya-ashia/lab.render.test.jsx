import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import '../../../../../../i18n';
import BridgePath from '../../../../../common/manipulations/vectors/BridgePath';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as BP from '../../../../../common/manipulations/logic/bridgePath';
import { LAB, LAB_EXPECT, SITUATION } from './content/textbook';

/**
 * Le workspace du module 7 de la synthèse — `bridge-path`, deux niveaux (la passerelle du Rhummel ; la rue de l'école
 * du manuel) — rendu avec EXACTEMENT les props que le module étale (content/textbook.js › LAB) ; puis la mathématique
 * que les modules 7 et 8 supposent, recalculée avec packages/core (vectors.js) et posée par la main dans la logique
 * du lab (logic/bridgePath.js).
 */
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <BridgePath level="beginner" {...LAB.beginner} />,
      advanced: () => <BridgePath level="advanced" {...LAB.advanced} />,
    }}
  />
);
const n = (p) => LIN.toNumber(p);

it('les deux niveaux se rendent dans le workspace, sans clé brute ni réponse', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-bridge-path/g) ?? []).length).toBe(2);
  expect(html).toContain('data-world="bridge"');
  expect(html).toContain('data-world="crosswalk"');
  expect(html).toContain('data-bp-glance');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('11,22');
  expect(html).not.toContain('\\sqrt{85}');
});

it('les props du LAB متقدم sont les nombres de la وضعية (rien retapé)', () => {
  expect(LAB.advanced.numbers).toBe(SITUATION.numbers);
});

it.each([['advanced'], ['beginner']])('%s : la main — deux places, B′ refusé (MN) puis accepté, la ligne droite ; B′, M et le minimum attendus', (lv) => {
  const exp = LAB_EXPECT[lv];
  let s = BP.init(LAB[lv].numbers);
  s = BP.cross(s, s.iMin);
  s = BP.cross(s, s.iMax);
  s = BP.openTranslate(s);
  const B = s.B; const w = n(s.w);
  s = BP.placePin(s, { x: n(B.x), y: n(B.y) - w });
  expect(s.last.pin.kind).toBe('sense');
  s = BP.placePin(s, { x: exp.Bp[0], y: exp.Bp[1] });
  expect(s.stage).toBe('straight');
  s = BP.cross(s, s.iStar);
  expect(s.solved).toBe(true);
  expect(BP.discoveryReady(s)).toBe(true);
  expect(BP.numText(s.best.x)).toBe(exp.x);
  expect(`${TR.surdText(s.best.ABp)} + ${n(s.w)}`).toBe(exp.min);
  expect(BP.dec(BP.minimum(s).number)).toBe(exp.total);
});

it('le module 7 : AB′ = √85 (7 et 6 carreaux), AB = √113, √85 + 2 ≈ 11,22, AM = NB', () => {
  const A = V.point(-3, 5); const B = V.point(4, -3);
  const k = V.shortestCrossing({ A, B, width: 2 });
  expect(V.vecEq(V.vec(A, k.Bp), V.point(7, -6))).toBe(true);
  expect(TR.surdText(V.distance(A, k.Bp))).toBe('√85');
  expect(TR.surdText(V.distance(A, B))).toBe('√113');
  expect(TR.roundTo(TR.surdNumber(V.distance(A, B)), 2)).toBe('10,63');
  expect(TR.roundTo(TR.surdNumber(k.ABp) + 2, 2)).toBe('11,22');
  expect(TR.surdText(V.distance(A, k.M))).toBe(TR.surdText(V.distance(k.N, B)));
});

it('« وضعية الاختبار النهائي » (Oran, un carreau = 10 m) : 30√13 ≈ 108,2 ; 138,2 ; AB = 90√2 ≈ 127,3 ; MN au lieu de NM : 150', () => {
  const A = V.point(0, 5); const B = V.point(9, -4);
  const k = V.shortestCrossing({ A, B, width: 3 });
  expect(TR.surdText(k.ABp)).toBe('3√13'); // × 10 m
  expect(TR.roundTo(10 * TR.surdNumber(k.ABp), 1)).toBe('108,2');
  expect(TR.roundTo(10 * (TR.surdNumber(k.ABp) + 3), 1)).toBe('138,2');
  expect(TR.roundTo(10 * TR.surdNumber(V.distance(A, B)), 1)).toBe('127,3');
  expect(TR.roundTo(10 * TR.surdNumber(V.distance(A, V.translate(B, V.point(0, -3)))), 0)).toBe('150');
  expect(n(k.x)).toBe(3); // M à 30 m de la verticale de A — l'épreuve ne le demande pas, la figure ne le montre pas (M en x = 6)
});
