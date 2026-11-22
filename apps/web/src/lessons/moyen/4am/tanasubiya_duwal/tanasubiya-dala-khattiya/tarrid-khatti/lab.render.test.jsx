import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as proportional from '@smarter-academy/core/arithmetic/proportional.js';
import '../../../../../../i18n';
import OriginLine from '../../../../../common/manipulations/proportion/OriginLine';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as L from '../../../../../common/manipulations/logic/originLine';
import { LAB, METHOD_SPRING, ACT_4 } from './content/textbook';

/**
 * Le laboratoire du module 1 (origin-line, écrit par la leçon 3 « التمثيل البياني لدالة خطية »,
 * réutilisé ici par ses seules props) rendu avec EXACTEMENT les props que le module étale
 * (content/textbook.js › LAB), dans le workspace à deux niveaux — et la mathématique que le module
 * suppose : les pylônes donnent a = 0,5, le ressort a = 0,3, 10 g → 3 cm, 2,1 cm → 7 g.
 */
const split = (s) => s.split('|').map((p) => p.split(':'));
const workspace = (defaultLevel) => (
  <ManipulationWorkspace
    defaultLevel={defaultLevel}
    levels={{
      beginner: () => <OriginLine level="beginner" {...LAB.beginner} />,
      advanced: () => <OriginLine {...LAB.advanced} />,
    }}
  />
);

it('les deux niveaux se rendent dans le workspace, en mode fit, avec leurs mondes et sans clé brute', () => {
  for (const lvl of ['beginner', 'advanced']) {
    const html = renderToString(workspace(lvl));
    expect((html.match(/data-origin-line/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('data-mode="fit"');
    expect(html).toContain('data-theme="cablecar"');
    expect(html).toContain('data-theme="spring"');
    expect(html).toContain('الكتلة x (g)');
    expect(html).toContain('data-ol-plane');
    expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
  }
});

it('la mathématique que le module suppose', () => {
  const ratio = (spec) => {
    const pts = split(spec);
    const r = proportional.tableRatios(pts.map((p) => p[0]), pts.map((p) => p[1]));
    expect(r.proportional).toBe(true);
    return Number(r.a.n) / Number(r.a.d);
  };
  expect(ratio(LAB.beginner.points)).toBe(0.5);
  expect(ratio(LAB.advanced.points)).toBeCloseTo(0.3, 12);
  // Les points du ressort sont ceux du tableau complété du manuel, lus et non retapés.
  expect(split(LAB.advanced.points)).toEqual(METHOD_SPRING.completed.x.map((x, i) => [x, METHOD_SPRING.completed.y[i]]));
  // Les deux lectures de la طريقة : image de 10 = 3, nombre dont l'image est 2,1 = 7.
  const img = proportional.image('0,3', '10');
  expect(Number(img.n) / Number(img.d)).toBe(METHOD_SPRING.numbers.y10);
  const ant = proportional.antecedent('0,3', '2,1');
  expect(Number(ant.n) / Number(ant.d)).toBe(METHOD_SPRING.numbers.x21);
  expect(LAB.advanced.reads).toBe('x:10|y:2,1');
  // نشاط 4 : les points des pommes de terre donnent a = 50.
  const pot = proportional.tableRatios(ACT_4.potatoes.map((p) => p[0]), ACT_4.potatoes.map((p) => p[1]));
  expect(pot.proportional).toBe(true);
  expect(Number(pot.a.n) / Number(pot.a.d)).toBe(ACT_4.numbers.a);
});

it('le laboratoire peut atteindre la droite qui passe par tous les points, à chaque niveau', () => {
  for (const lab of [LAB.beginner, LAB.advanced]) {
    const s = L.init({ mode: 'fit', points: lab.points, reads: lab.reads, xMin: lab.xMin, xMax: lab.xMax, yMin: lab.yMin, yMax: lab.yMax });
    expect(L.fitPossible(s)).toBe(true);
  }
});
