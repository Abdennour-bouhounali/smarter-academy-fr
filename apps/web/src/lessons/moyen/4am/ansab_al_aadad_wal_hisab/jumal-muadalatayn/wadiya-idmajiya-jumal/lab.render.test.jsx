import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as linearSystem from '@smarter-academy/core/arithmetic/linearSystem.js';
import '../../../../../../i18n';
import StoryModeller from '../../../../../common/manipulations/systems/StoryModeller';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as L from '../../../../../common/manipulations/logic/storyModeller';
import { LAB, SITUATION, WARMUP } from './content/textbook';

/**
 * Le laboratoire du module 7 de la synthèse (story-modeller, réutilisé de « حل مشكلات
 * بتوظيف جمل معادلتين ») rendu avec EXACTEMENT les props que le module étale
 * (content/textbook.js › LAB), dans le workspace à deux niveaux ouvert sur متقدم — et
 * la mathématique que le module suppose : le حفل donne (25 ; 50), la رحلة القسم (30 ; 50),
 * deux informations d'ARGENT à quantités différentes, la bonne phrase finale en option 0.
 */
const workspace = (extra = {}) => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <StoryModeller level="beginner" {...LAB.beginner} {...extra} />,
      advanced: () => <StoryModeller level="advanced" {...LAB.advanced} {...extra} />,
    }}
  />
);

it('les deux niveaux se rendent dans le workspace, monde « party », sans clé i18n brute', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-story-modeller/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect(html).toContain('data-theme="party"');
  // متقدم : les inconnues sont à nommer ; مبتدئ : déjà placées, on commence par le modèle.
  expect(html).toContain('data-stage="name"');
  expect(html).toContain('data-stage="model"');
  for (const w of ['سعر علبة العصير', 'سعر قطعة الحلوى']) expect(html, w).toContain(w);
  expect(html).not.toMatch(/manipulation\.storyModeller\./);
});

it('« solve » : le modèle déjà placé, l’élève choisit la méthode', () => {
  const html = renderToString(workspace({ startWith: 'solve' }));
  expect(html).toContain('data-stage="solve"');
  expect(html).toContain('data-sm-method');
});

it('la mathématique que le module suppose', () => {
  const solve = (spec) => {
    const [a, b] = spec.split('|');
    const r = linearSystem.classify(linearSystem.system(a, b));
    expect(r.kind).toBe('unique');
    return [Number(r.x.n) / Number(r.x.d), Number(r.y.n) / Number(r.y.d)];
  };
  expect(solve(LAB.advanced.system)).toEqual([25, 50]);
  expect(solve(LAB.beginner.system)).toEqual([30, 50]);

  // les nombres du manuel, lus dans la situation et non retapés
  for (const [lab, { bought, paid, juiceLeft, cakesLeft, leftCost }] of [[LAB.advanced, SITUATION.numbers], [LAB.beginner, WARMUP.numbers]]) {
    expect(lab.system).toBe(`${bought}x+${bought}y=${paid}|${juiceLeft}x+${cakesLeft}y=${leftCost}`);
    expect(lab.chips.map((c) => c.value)).toEqual([bought, bought, paid, juiceLeft, cakesLeft, leftCost].map(String));
    // deux informations d'argent : aucune n'est un nombre de personnes
    expect(lab.facts.map((f) => f.kind)).toEqual(['money', 'money']);
    expect(lab.theme).toBe('party');
  }
  expect(LAB.advanced.named).toBe(false);
  expect(LAB.beginner.named).toBe(true);

  // la phrase juste porte la solution, les autres non (ordre inversé, prix égaux)
  expect(LAB.advanced.answer.options[LAB.advanced.answer.correct]).toMatch(/العصير 25 دج.*الحلوى 50 دج/);
  expect(LAB.beginner.answer.options[LAB.beginner.answer.correct]).toMatch(/العصير 30 دج.*الحلوى 50 دج/);
  const [s1, s2] = LAB.beginner.system.split('|');
  const sys = linearSystem.system(s1, s2);
  expect(linearSystem.isSolution(sys, 50, 30)).toBe(false);
  expect(linearSystem.isSolution(sys, 40, 40)).toBe(false);
  const [t1, t2] = LAB.advanced.system.split('|');
  const big = linearSystem.system(t1, t2);
  expect(linearSystem.isSolution(big, 50, 25)).toBe(false);
  expect(linearSystem.isSolution(big, '37.5', '37.5')).toBe(false);
});

it('le laboratoire accepte le modèle de chaque niveau et refuse les quantités échangées', () => {
  for (const lab of [LAB.beginner, LAB.advanced]) {
    const model = L.parseModel(lab);                     // lève une erreur si un nombre n'a pas de jeton
    let st = L.init(model, { named: true });
    const slots = L.targetSlots(model, st.naming);
    for (const row of [1, 2]) for (const s of L.SLOTS) st = L.fill(st, slots[row][s], L.slotId(row, s));
    expect(L.checkModel(st, model).verdict.ok).toBe(true);
    // « 3x + 2y = 210 » / « 30x + 24y = 2100 » : le nombre de gâteaux porté sur le prix du jus
    const swapped = L.fill(L.fill(st, slots[2].b, L.slotId(2, 'a')), slots[2].a, L.slotId(2, 'b'));
    const v = L.checkModel(swapped, model).verdict;
    expect(v.ok).toBe(false);
    expect(v.rows[1].reason).toBe('swapped');
    // les deux méthodes mènent à la même ثنائية
    const sys = L.studentSystem(st, model);
    for (const m of ['sub', 'add']) {
      const plan = L.solvePlan(sys, model.ids, m);
      expect(plan.lines.at(-1).key).toBe('pair');
    }
  }
});
