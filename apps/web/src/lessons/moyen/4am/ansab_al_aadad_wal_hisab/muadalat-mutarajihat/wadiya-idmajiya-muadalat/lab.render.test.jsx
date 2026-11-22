import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../../../i18n';
import GrowthRace from '../../../../../common/manipulations/equations/GrowthRace';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as L from '../../../../../common/manipulations/logic/growthRace';
import { LAB } from './content/rounds';
import { SITUATION } from './content/textbook';

/**
 * Le laboratoire du module 7 de la synthèse (growth-race, réutilisé de « ترييض مشكلة ») rendu avec EXACTEMENT les props que la PAGE étale
 * (content/rounds.js › LAB), dans le workspace à deux niveaux — et la mathématique que le module suppose.
 * CHANGEMENT DÉLIBÉRÉ (2026-11-12, la synthèse dans le lecteur de mission) : la page ne montre plus les tarifs du défi 🏆 (75x contre 560 + 5x,
 * égalité à 8) ni l'ancien échauffement ; ses deux niveaux sont les tarifs FRÈRES des manches — قاعة الرياضة 60x contre 300 + 10x (égalité à 6,
 * meilleure à partir de 7) et نادي الرماية 45x contre 150 + 15x (égalité à 5, meilleure à partir de 6).
 */
const workspace = (extra = {}) => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <GrowthRace level="beginner" {...LAB.beginner} {...extra} />,
      advanced: () => <GrowthRace level="advanced" {...LAB.advanced} {...extra} />,
    }}
  />
);

it('les deux niveaux se rendent dans le workspace, monde « piscine » (deux tarifs), mots de la leçon', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-growth-race/g) ?? []).length).toBe(2);
  expect(html).toContain('data-stage="build"');
  expect(html).toContain('data-theme="pool"');
  expect(html).toContain('data-op="mul"');
  for (const w of ['الصيغة الأولى', 'الصيغة الثانية', 'الاشتراك السنوي', 'تذكرة الحصّة']) expect(html, w).toContain(w);
  expect(html).not.toMatch(/manipulation\.growthRace\./);
  expect(html).toContain('data-decor');
});

it('la course s’ouvre sur la règle et les colonnes (à 0 séance, la formule 1 est la moins chère)', () => {
  const html = renderToString(workspace({ startWith: 'race' }));
  expect(html).toContain('data-stage="race"');
  expect(html).toContain('data-gr-ruler');
  expect(html).toContain('data-rel="&lt;"');
});

it('la mathématique que le module suppose — et jamais les tarifs du défi', () => {
  const at = (p) => { const m = L.parseModel(p.left, p.right); return { m, a: L.answer(m, p.goal) }; };
  const b = at(LAB.beginner);
  expect([L.toNumber(b.a.sol.x), b.a.first, b.a.toInfinity]).toEqual([6, 7, true]);
  expect(L.valueText(L.trialAt(b.m, 6).left)).toBe('360');
  const v = at(LAB.advanced);
  expect([L.toNumber(v.a.sol.x), v.a.first, v.a.toInfinity]).toEqual([5, 6, true]);
  expect(L.valueText(L.trialAt(v.m, 5).right)).toBe('225');
  const { perSession1, yearly, perSession2 } = SITUATION.numbers;
  [LAB.beginner, LAB.advanced].forEach((p) => {
    expect(p.left).not.toBe(`${perSession1}x`);
    expect(p.right).not.toBe(`${yearly}+${perSession2}x`);
    expect(L.xRange(L.parseModel(p.left, p.right), p.maxX).max).toBeLessThanOrEqual(9);
  });
});

it('les demi-droites du manuel : crochet tourné vers le rouge quand la borne est une solution', async () => {
  const { NumberLine } = await import('./components/MuadalatFigures');
  // Le crochet : « M(cx + s) … » — s > 0 : son ouverture regarde la droite.
  const opening = (html) => {
    const m = html.match(/<path d="M([\d.]+) [\d.]+ L([\d.]+) /g).map((d) => d.match(/M([\d.]+) [\d.]+ L([\d.]+)/)).find((p) => Math.abs(Number(p[1]) - Number(p[2])) === 7);
    return Math.sign(Number(m[1]) - Number(m[2]));
  };
  expect(opening(renderToString(<NumberLine bound={-3} side="left" included label="x ≤ −3" />))).toBe(-1);   // ] vers la gauche, rouge à gauche
  expect(opening(renderToString(<NumberLine bound={-3} side="right" included={false} label="x > −3" />))).toBe(-1); // ] tourné vers l'extérieur
  expect(opening(renderToString(<NumberLine bound={-2} side="left" included={false} label="x < −2" />))).toBe(1);   // [ tourné vers l'extérieur
});
