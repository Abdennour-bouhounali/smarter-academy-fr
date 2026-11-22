import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as ST from '@smarter-academy/core/arithmetic/statistics.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import '../../../../../../i18n';
import GroupTanks from '../../../../../common/manipulations/stats/GroupTanks';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as L from '../../../../../common/manipulations/logic/groupTanks';
import { LAB, CHALLENGE, CARS, METHOD } from './content/textbook';
import { EX19_CHART, EX14_TABLE } from './content/exercises';

/**
 * Le laboratoire du module 1 (group-tanks, écrit par cette leçon) rendu avec EXACTEMENT les props que le
 * module étale (content/textbook.js › LAB), dans le workspace à deux niveaux — et la mathématique que les
 * modules supposent, recalculée par statistics.js.
 */
it('le module 1 se rend aux deux niveaux, sans clé brute', () => {
  const html = renderToString(
    <ManipulationWorkspace defaultLevel="advanced" levels={{
      beginner: () => <GroupTanks level="beginner" {...LAB.m1.beginner} />,
      advanced: () => <GroupTanks {...LAB.m1.advanced} />,
    }} />,
  );
  expect((html.match(/data-group-tanks/g) ?? []).length).toBe(2);
  expect(html).toContain('data-world="quiz"');
  expect(html).toContain('data-world="school"');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
});

it('le تحدّ : 384 sur 33 dans les deux classes ; le quiz : 9', () => {
  const s = L.init(LAB.m1.advanced);
  expect([LIN.fracText(L.water(s, 0)), LIN.fracText(L.water(s, 1))]).toEqual([String(CHALLENGE.numbers.sumA), String(CHALLENGE.numbers.sumB)]);
  expect(ST.approx(L.level(s, 0), 2)).toBe(CHALLENGE.numbers.approx);
  expect(LIN.fracText(L.level(L.init(LAB.m1.beginner), 0))).toBe('9');
});

it('les graphiques, le tableau et la méthode disent vrai', () => {
  expect(CARS.bars.reduce((a, b) => a + b.value, 0)).toBe(CARS.numbers.total);
  const [ab, bd, , d] = EX19_CHART.bars.map((b) => b.value);
  expect([ab - (bd - d), bd - d, d]).toEqual([400, 550, 700]);
  const A = EX14_TABLE.rows[0].slice(1).map(Number);
  expect(LIN.fracText(ST.mean(A))).toBe('19/2');
  expect(LIN.fracText(ST.median(A))).toBe('10');
  expect(LIN.fracText(ST.range(A))).toBe('35');
  const B = EX14_TABLE.rows[1].slice(1).map(Number);
  expect([LIN.fracText(ST.mean(B)), LIN.fracText(ST.median(B)), LIN.fracText(ST.range(B))]).toEqual(['53/4', '14', '17']);
  expect(LIN.fracText(ST.countFromRemoval('11,5', 19, '11,25'))).toBe('31');
  const a = [2, 9, 4, 8, 7]; const b = [6, 5, 7, 6, 6];
  expect([ST.mean(a), ST.median(a), ST.range(a), ST.mean(b), ST.median(b), ST.range(b)].map(LIN.fracText))
    .toEqual([METHOD.numbers.meanA, METHOD.numbers.medianA, METHOD.numbers.rangeA, METHOD.numbers.meanB, METHOD.numbers.medianB, METHOD.numbers.rangeB].map(String));
});
