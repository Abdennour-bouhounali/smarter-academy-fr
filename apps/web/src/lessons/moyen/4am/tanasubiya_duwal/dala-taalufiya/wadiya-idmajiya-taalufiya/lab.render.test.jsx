import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as A from '@smarter-academy/core/arithmetic/affine.js';
import * as linearSystem from '@smarter-academy/core/arithmetic/linearSystem.js';
import '../../../../../../i18n';
import PlanCompare from '../../../../../common/manipulations/affine/PlanCompare';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import { LAB, NUMBERS, TEST } from './content/textbook';

/**
 * Le laboratoire du module 7 de la synthèse (plan-compare, réutilisé de « حل مشكلات وترييض وضعيات
 * بتوظيف الدالة التآلفية », monde `rental`) rendu avec EXACTEMENT les props que le module étale
 * (content/textbook.js › LAB), dans le workspace à deux niveaux ouvert sur متقدم — puis TOUTE la
 * mathématique que les modules 1 et 4 supposent, recalculée avec packages/core (affine.js, linearSystem.js).
 */
const num = (f) => Number(f.n) / Number(f.d);
const plans = (s) => s.split('|').map((r) => A.affine(r));
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <PlanCompare level="beginner" {...LAB.beginner} />,
      advanced: () => <PlanCompare level="advanced" {...LAB.advanced} />,
    }}
  />
);

it('les deux niveaux se rendent dans le workspace, monde « rental », sans clé i18n brute', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-manipulation="plan-compare"/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect((html.match(/data-pc-glance/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect((html.match(/data-theme="rental"/g) ?? []).length).toBeGreaterThanOrEqual(2);
  // chaque niveau : ses formules, son étape d'ouverture, ses droites
  expect(html).toContain(`data-plans="${LAB.advanced.plans}"`);
  expect(html).toContain(`data-plans="${LAB.beginner.plans}"`);
  expect(html).toMatch(/data-stage="compare"/);
  expect(html).toMatch(/data-stage="model"/);
  for (const id of ['A', 'B', 'C']) expect(html).toContain(`data-pc-line="${id}"`);
  // le décor de la plage, et les mots du monde (pas ceux du stade)
  expect(html).toContain('data-deco="rental"');
  expect(html).toContain('ساعات الكراء');
  expect(html).not.toContain('مقابلة');
});

it('les props du laboratoire : 2 tarifs de vélo, 3 tarifs de kayak, fenêtres qui contiennent les croisements', () => {
  const [card, hourly] = plans(LAB.beginner.plans);
  const bike = A.comparePlans(card, hourly);
  expect(bike.kind).toBe('cross');
  expect(num(bike.x)).toBe(4);
  expect(num(bike.y)).toBe(400);
  expect(num(bike.x)).toBeLessThan(Number(LAB.beginner.xMax));
  expect(num(A.imageOf(hourly, Number(LAB.beginner.xMax)))).toBeLessThanOrEqual(Number(LAB.beginner.yMax));

  const [pa, pb, pc] = plans(LAB.advanced.plans);
  expect(LAB.advanced.plans).toBe(`${NUMBERS.kayak.A}|${NUMBERS.kayak.B}|${NUMBERS.kayak.C}`);
  expect(A.kindOf(pa).linear).toBe(true);
  expect(A.kindOf(pc).constant).toBe(true);
  const ab = A.comparePlans(pa, pb); const bc = A.comparePlans(pb, pc); const ac = A.comparePlans(pa, pc);
  expect([num(ab.x), num(ab.y)]).toEqual([3, 450]);
  expect([num(bc.x), num(bc.y)]).toEqual([6, 600]);
  expect([num(ac.x), num(ac.y)]).toEqual([4, 600]);
  // trois plages : أ avant 3 h, ب entre 3 et 6 h, ج après 6 h ; 5 h → ب à 550 DA
  expect(A.cheapestAt([pa, pb, pc], 2)).toEqual([0]);
  expect(A.cheapestAt([pa, pb, pc], 4)).toEqual([1]);
  expect(A.cheapestAt([pa, pb, pc], 7)).toEqual([2]);
  expect(A.cheapestAt([pa, pb, pc], NUMBERS.hours)).toEqual([1]);
  expect(num(A.imageOf(pb, NUMBERS.hours))).toBe(NUMBERS.kayakBest);
  expect(num(A.imageOf(pa, Number(LAB.advanced.xMax)))).toBeLessThanOrEqual(Number(LAB.advanced.yMax));
});

it('la situation du module 7 : participants, bus, reste', () => {
  const n = NUMBERS;
  const d1 = A.lineFromEquation(linearSystem.eq2(`x+y=${n.persons}`));
  const d2 = A.lineFromEquation(linearSystem.eq2(`${n.pupilPays}x+${n.adultPays}y=${n.collected}`));
  expect([num(d2.a), num(d2.b)]).toEqual([-0.5, 20]);
  const p = A.intersect(d1, d2);
  expect([num(p.x), num(p.y)]).toEqual([n.pupils, n.adults]);

  const f = A.affine(n.amal);
  expect(num(A.imageOf(f, n.pupils))).toBe(n.amal32);
  expect(num(A.antecedentOf(f, n.collected).x)).toBe(n.maxPupils);
  const { x1, y1, x2, y2 } = n.nawras;
  const g = A.fromTwoPoints(x1, y1, x2, y2);
  expect([num(g.a), num(g.b)]).toEqual([200, 5000]);
  expect(num(A.imageOf(A.affine(n.nawrasRule), x2))).toBe(y2);
  expect(num(A.imageOf(g, n.pupils))).toBe(n.nawras32);
  const bus = A.comparePlans(f, g);
  expect([num(bus.x), num(bus.y)]).toEqual([n.busCross.x, n.busCross.y]);
  expect(bus.cheaperAfter).toBe('f');
  expect(n.collected - n.amal32).toBe(n.remaining);
  expect(2 * n.kayakBest).toBe(n.twoKayaks);
  expect(n.twoKayaks).toBeLessThanOrEqual(n.remaining);
});

it('la sortie de « إختبار أولي » (autres nombres)', () => {
  const t = TEST.numbers;
  const p = A.intersect(
    A.lineFromEquation(linearSystem.eq2(`x+y=${t.persons}`)),
    A.lineFromEquation(linearSystem.eq2(`${t.pupilPays}x+${t.adultPays}y=${t.collected}`)),
  );
  expect([num(p.x), num(p.y)]).toEqual([t.pupils, t.adults]);
  const h = A.affine(t.fajr);
  const k = A.fromTwoPoints(t.mawj.x1, t.mawj.y1, t.mawj.x2, t.mawj.y2);
  expect([num(k.a), num(k.b)]).toEqual([180, 4000]);
  expect(num(A.imageOf(h, t.pupils))).toBe(10720);
  expect(num(A.imageOf(k, t.pupils))).toBe(10480);
  const c = A.comparePlans(h, k);
  expect(num(c.x)).toBe(40);
  expect(c.cheaperBefore).toBe('g');
  const boats = plans(`${t.boat.A}|${t.boat.B}|${t.boat.C}`);
  expect(A.cheapestAt(boats, t.hours)).toEqual([2]);
  const xMax = num(A.antecedentOf(k, t.collected).x);
  expect(Math.floor(xMax)).toBe(t.maxPupils);
  expect(num(A.imageOf(k, t.maxPupils + 1))).toBeGreaterThan(t.collected);
});
