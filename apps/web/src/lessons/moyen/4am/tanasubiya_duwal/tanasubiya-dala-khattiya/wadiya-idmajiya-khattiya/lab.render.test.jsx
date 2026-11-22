import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as proportional from '@smarter-academy/core/arithmetic/proportional.js';
import '../../../../../../i18n';
import OriginLine from '../../../../../common/manipulations/proportion/OriginLine';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import { LAB, SITUATION, FAMILY } from './content/textbook';

/**
 * Le laboratoire du module 7 de la synthèse (origin-line, réutilisé de « التمثيل البياني لدالة خطية »,
 * mode `read`, monde `budget`) rendu avec EXACTEMENT les props que le module étale
 * (content/textbook.js › LAB), dans le workspace à deux niveaux ouvert sur متقدم — et la mathématique
 * que le module suppose : la famille du manuel paie 3,8x (plus grand prix entier 526 DA), l'autre
 * famille 3x (500 DA pile sur 1500 DA, 533 DA sur 1600 DA).
 */
const num = (f) => Number(f.n) / Number(f.d);
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <OriginLine level="beginner" {...LAB.beginner} />,
      advanced: () => <OriginLine level="advanced" {...LAB.advanced} />,
    }}
  />
);

it('les deux niveaux se rendent dans le workspace, monde « budget », sans clé i18n brute', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-origin-line/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect(html).toContain('data-theme="budget"');
  expect(html).toContain('data-mode="read"');
  // chaque niveau : sa droite de coût et sa ligne de budget
  expect(html).toContain('data-ol-line="3,8"');
  expect(html).toContain('data-ol-cap="2000"');
  expect(html).toContain('data-ol-line="3"');
  expect(html).toContain('data-ol-cap="1500"');
  expect(html).toContain('سعر تذكرة البالغ');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
});

it('la mathématique que le module suppose', () => {
  const { adults, children, discount, budget } = SITUATION.numbers;
  // la famille du manuel : 2 adultes + 3 enfants à −40 % → 3,8x (lu dans la situation, non retapé)
  const a = adults + children * (1 - discount / 100);
  expect(a).toBeCloseTo(3.8, 10);
  expect(LAB.advanced.a).toBe('3,8');
  expect(Number(LAB.advanced.cap)).toBe(budget);
  const xMax = num(proportional.antecedent(LAB.advanced.a, LAB.advanced.cap));
  expect(xMax).toBeCloseTo(10000 / 19, 10);
  expect(Math.floor(xMax)).toBe(526);
  expect(num(proportional.image('3,8', 526))).toBeLessThanOrEqual(2000);
  expect(num(proportional.image('3,8', 527))).toBeGreaterThan(2000);
  // l'intersection est dans la fenêtre, entre deux nœuds
  expect(xMax).toBeLessThan(Number(LAB.advanced.xMax));
  expect(budget).toBeLessThan(Number(LAB.advanced.yMax));

  // l'autre famille : 2 adultes + 2 enfants à −50 % → 3x ; 1500 DA → 500 pile ; 1600 DA → 533
  const f = FAMILY.numbers;
  expect(f.adults + f.children * (1 - f.discount / 100)).toBe(3);
  expect(LAB.beginner.a).toBe('3');
  expect(Number(LAB.beginner.cap)).toBe(f.budget);
  expect(num(proportional.antecedent(LAB.beginner.a, LAB.beginner.cap))).toBe(500);
  expect(Math.floor(num(proportional.antecedent('3', f.budget2)))).toBe(533);
  expect(num(proportional.image('3', 534))).toBeGreaterThan(f.budget2);
  expect(f.budget).toBeLessThan(Number(LAB.beginner.yMax));
});
