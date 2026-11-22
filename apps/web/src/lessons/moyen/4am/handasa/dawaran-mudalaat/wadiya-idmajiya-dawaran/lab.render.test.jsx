import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as ROT from '@smarter-academy/core/arithmetic/rotation.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import '../../../../../../i18n';
import LampRing from '../../../../../common/manipulations/rotation/LampRing';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as LR from '../../../../../common/manipulations/logic/lampRing';
import { LEVELS } from '../../../../../common/manipulations/levels';
import { LAB, LAB_EXPECT } from './content/textbook';
import * as FIG from './content/figures';

/**
 * Le workspace du module 7 de la synthèse — `lamp-ring`, deux niveaux (4 poteaux sur 2 m ; la وضعية, 6 sur 3 m) — rendu avec
 * EXACTEMENT les props que le module étale (content/textbook.js › LAB) ; puis la mathématique que les modules 7 et 8 supposent,
 * recalculée avec packages/core (rotation.js, trigonometry.js) et posée par la main dans la logique du lab (logic/lampRing.js).
 */
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <LampRing level="beginner" {...LAB.beginner} />,
      advanced: () => <LampRing level="advanced" {...LAB.advanced} />,
    }}
  />
);
const sx = (x) => TR.roundTo(x, 2);

it('les deux niveaux se rendent dans le workspace, sans clé brute ni réponse', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-lamp-ring="true"/g) ?? []).length).toBe(2);
  expect(html).toContain('data-lr-glance');
  expect(html).toContain('data-n="4"');
  expect(html).toContain('data-n="6"');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(html).not.toContain('{{');
  for (const leak of ['2\\sqrt{2}', '60^\\circ', 'data-lr-card']) expect(html.replace(/<ol[^>]*data-manipulation-hints[\s\S]*?<\/ol>/g, '')).not.toContain(leak);
});

it('les props du LAB sont les nombres de levels.js (une seule source)', () => {
  expect(LAB.beginner.numbers).toEqual(LEVELS['lamp-ring'].beginner.numbers);
  expect(LAB.advanced.numbers).toEqual(LEVELS['lamp-ring'].advanced.numbers);
});

it.each([['advanced'], ['beginner']])('%s : la main — un « أشعل » refusé, le دوران par P₂, le tour fermé, la bonne carte', (lv) => {
  const { n, r } = LAB[lv].numbers;
  const exp = LAB_EXPECT[lv];
  let s = LR.light(LR.init({ n, r }));
  expect(s.last.kind).toBe('handUnequal');
  s = LR.moveP2(LR.openRotate(s), s.rot.p1 + exp.alpha);
  for (let k = 0; k < n; k += 1) s = LR.rotateOnce(s);
  expect(s.rotLit).toBe(true);
  s = LR.pickFormula(s, 'sin');
  expect(LR.discoveryReady(s)).toBe(true);
  expect(LR.gapTex(n, r)).toBe(exp.gapTex);
  expect(sx(LR.gap(n, r).number)).toBe(exp.approx);
  expect(sx(LR.edge(n, r))).toBe(exp.edge);
});

it('le module 7 : 60°, triangle équilatéral, d = 3 m ; sin 30° × 3 = 1,5 ; le bord π ≈ 3,14 ; 4 poteaux ≈ 4,24 ; câble 18 m', () => {
  expect(ROT.centralAngle(6)).toEqual({ n: 60, d: 1 });
  expect(TR.surdText(ROT.sideFromRadius(6, 3).exact)).toBe('3');
  expect(ROT.interiorAngle(6)).toEqual({ n: 120, d: 1 });
  expect(3 * ROT.chordOfArc(1, 60) / 2).toBeCloseTo(1.5, 9);
  expect(sx(ROT.arcLength(3, 60))).toBe('3,14');
  expect(TR.surdText(ROT.sideFromRadius(4, 3).exact)).toBe('3√2');
  expect(sx(ROT.sideFromRadius(4, 3).number)).toBe('4,24');
  expect(ROT.perimeter(6, 3).number).toBeCloseTo(18, 9);
  // le plan : six sommets, chacun image du précédent par 60°, P₁P₂ = 3
  const P = FIG.PLAN.points;
  expect(Math.hypot(P['P₁'][0] - P['P₂'][0], P['P₁'][1] - P['P₂'][1])).toBeCloseTo(3, 2);
});

it('« وضعية الاختبار النهائي » (Oran) : 45°, 22,5°, ≈ 3,83 m, arc ≈ 3,93, 2r sin 45° ≈ 7,07, câble ≈ 30,61 (30,64 en arrondissant trop tôt)', () => {
  expect(ROT.centralAngle(8)).toEqual({ n: 45, d: 1 });
  expect(ROT.interiorAngle(8)).toEqual({ n: 135, d: 1 });
  expect(sx(ROT.sideFromRadius(8, 5).number)).toBe('3,83');
  expect(sx(ROT.arcLength(5, 45))).toBe('3,93');
  expect(sx(ROT.chordOfArc(5, 90))).toBe('7,07');
  expect(sx(ROT.perimeter(8, 5).number)).toBe('30,61');
  expect(sx(8 * 3.83)).toBe('30,64');
  expect(sx(10 * Math.PI)).toBe('31,42');
  const T = FIG.TEST_FIGURE.points;
  expect(ROT.angleAt(T['P₁'], T.O, T['P₂'])).toBeCloseTo(45, 1);
  expect(Math.hypot(T['P₁'][0], T['P₁'][1])).toBeCloseTo(5, 2);
  // les réponses du test ne sont pas des nombres du lab : l'extra est 12 poteaux (30°, ≈ 1,55 m), jamais 8
  const extra = LAB.advanced.numbers.extra;
  expect(extra).toBe(12);
  expect(ROT.centralAngle(extra)).toEqual({ n: 30, d: 1 });
  expect(sx(ROT.sideFromRadius(extra, 3).number)).toBe('1,55');
  for (const lv of ['beginner', 'advanced']) {
    const { n, r } = LAB[lv].numbers;
    for (const k of [n, LAB[lv].numbers.extra].filter(Boolean)) {
      expect(ROT.centralAngle(k).n / ROT.centralAngle(k).d, `${lv} ${k}`).not.toBe(45);
      for (const v of ['3,83', '30,61']) {
        expect(sx(ROT.sideFromRadius(k, r).number)).not.toBe(v);
        expect(sx(ROT.perimeter(k, r).number)).not.toBe(v);
      }
    }
  }
});
