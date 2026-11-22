import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as affine from '@smarter-academy/core/arithmetic/affine.js';
import '../../../../../../i18n';
import PlanCompare from '../../../../../common/manipulations/affine/PlanCompare';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as L from '../../../../../common/manipulations/logic/planCompare';
import { LAB, ACT_4, TICKET, METHOD, TAXI } from './content/textbook';

/**
 * Les laboratoires des modules 1 et 2 (plan-compare, écrit par cette leçon) rendus avec EXACTEMENT les props
 * que les modules étalent (content/textbook.js › LAB), dans le workspace à deux niveaux — et la
 * mathématique que les modules supposent.
 */
const workspace = (pair, defaultLevel) => (
  <ManipulationWorkspace defaultLevel={defaultLevel} levels={{
    beginner: () => <PlanCompare level="beginner" {...pair.beginner} />,
    advanced: () => <PlanCompare {...pair.advanced} />,
  }} />
);

it('les deux modules se rendent, les deux niveaux, avec leurs mondes et sans clé brute', () => {
  const m1 = renderToString(workspace(LAB.m1, 'advanced'));
  expect((m1.match(/data-plan-compare/g) ?? []).length).toBe(2);
  expect(m1).toContain('data-theme="stadium"');
  expect(m1).toContain('data-theme="gaming"');
  expect(m1).toContain('data-pc-budget="4800"');
  const m2 = renderToString(workspace(LAB.m2, 'beginner'));
  expect(m2).toContain('data-stage="compare"');
  expect(m2).toContain('data-pc-line="C"');
  for (const html of [m1, m2]) expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
});

it('la mathématique de نشاط 4 et du billet', () => {
  const f = affine.affine(LAB.m1.advanced.plans);
  expect(L.numText(affine.imageOf(f, ACT_4.numbers.matches))).toBe(String(ACT_4.numbers.seven));
  expect(L.numText(affine.antecedentOf(f, ACT_4.numbers.budget).x)).toBe(String(ACT_4.numbers.matches4800));
  const [pass, ticket] = LAB.m2.beginner.plans.split('|').map((s) => affine.affine(s));
  const c = affine.comparePlans(pass, ticket);
  expect([L.numText(c.x), L.numText(c.y)]).toEqual([String(TICKET.numbers.cross), String(TICKET.numbers.costAtCross)]);
  expect(c.cheaperBefore).toBe('g');
});

it('les trois formules de la salle de jeux : changements à 10 h et 30 h, 18 h « au-dessus »', () => {
  const s = L.init({ plans: LAB.m2.advanced.plans, mode: 'compare', xMax: LAB.m2.advanced.xMax });
  expect(s.env.breaks.map((b) => [L.numText(b.x), L.numText(b.y)])).toEqual([['10', '1000'], ['30', '1800']]);
  expect(s.env.segments.map((g) => g.plan)).toEqual([0, 1, 2]);
  expect(L.judgePin(s, 18, 1800).kind).toBe('crossAbove');
});

it('la méthode et le graphique des taxis disent vrai', () => {
  const s = L.init({ plans: '50x+600|200x', mode: 'compare' });
  expect(L.numText(s.env.breaks[0].x)).toBe(String(METHOD.numbers.cross));
  expect(L.numText(s.env.breaks[0].y)).toBe(String(METHOD.numbers.cost));
  const c = affine.comparePlans(affine.affine(`${TAXI.A.a}x+${TAXI.A.b}`), affine.affine(`${TAXI.B.a}x`));
  expect([L.numText(c.x), L.numText(c.y)]).toEqual([String(TAXI.cross), String(TAXI.costAtCross)]);
});
