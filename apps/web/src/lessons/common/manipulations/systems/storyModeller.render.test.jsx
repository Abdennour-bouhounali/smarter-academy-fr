import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import StoryModeller, { CHAINS, QUESTIONS, chainOf, makeCtx } from './StoryModeller';
import * as L from '../logic/storyModeller';
import i18n from '../../../../i18n';

/**
 * story-modeller se rend pour ses TROIS mondes (stade : le niveau débutant ; musée : نشاط 3 ;
 * fête : la synthèse, avec exactement les props qu'elle passe), à chaque étape d'entrée
 * (المجاهيل, الترجمة, الحل), sans clé i18n brute.
 */
// aucune clé brute « manipulation.… » dans le TEXTE rendu (les attributs data-manipulation ne contiennent pas de point)
const RAW = /manipulation\.[a-zA-Z]/;

const PARTY = {
  system: '150x+150y=11250|24x+30y=2100',
  theme: 'party',
  unknowns: [{ id: 'x', noun: 'سعر علبة عصير' }, { id: 'y', noun: 'سعر قطعة حلوى' }],
  named: false,
  facts: [
    { quote: 'اقتنت البلدية 150 علبة عصير و 150 قطعة حلوى ودفعت 11250 DA', kind: 'money' },
    { quote: 'بقيت 24 علبة عصير و 30 قطعة حلوى ثمنها معا 2100 DA', kind: 'money' },
  ],
  chips: [
    { value: '150', label: 'علبة عصير' }, { value: '150', label: 'قطعة حلوى' }, { value: '11250', label: 'DA' },
    { value: '24', label: 'علبة عصير' }, { value: '30', label: 'قطعة حلوى' }, { value: '2100', label: 'DA' },
  ],
  answer: { options: ['سعر علبة العصير 25DA وسعر قطعة الحلوى 50DA.', 'سعر علبة العصير 50DA.', 'سعر قطعة الحلوى 25DA.'], correct: 0 },
};

it('le musée (نشاط 3, défaut) ouvre sur le choix des inconnues : lettres, noms mêlés aux données', () => {
  const html = renderToString(<StoryModeller />);
  expect(html).toContain('data-story-modeller');
  expect(html).toContain('data-theme="museum"');
  expect(html).toContain('data-stage="name"');
  expect(html).toContain('data-drag-source="unk:x"');
  expect(html).toContain('data-sm-noun="x"');
  expect(html).toContain('data-sm-noun="known:c0"');
  expect(html).toContain('عدد البالغين');
  expect(html).toContain('استقبل المتحف 140 زائرا');
  expect(html).toContain('data-deco');
  // la règle « d'un seul regard » : l'énoncé est un bloc repliable, l'instrument un cœur mesurable
  expect(html).toContain('data-lab-fold="story-modeller.story"');
  expect(html).toContain('data-sm-core');
  expect(html).not.toMatch(RAW);
});

it('le derby (débutant, inconnues déjà nommées) ouvre sur la traduction : deux rangs, six cases, le jeton « 1 »', () => {
  const html = renderToString(<StoryModeller system="x+y=20|300x+150y=4800" theme="stadium" named />);
  expect(html).toContain('data-stage="model"');
  expect(html).toContain('data-theme="stadium"');
  for (const z of ['slot:1:a', 'slot:1:b', 'slot:1:c', 'slot:2:a', 'slot:2:b', 'slot:2:c']) expect(html).toContain(`data-drop-zone="${z}"`);
  expect(html).toContain('data-drag-source="chip:one"');
  expect(html).toContain('data-sm-check');
  expect(html).toContain('عدد تذاكر الكبار');
  expect(html).not.toMatch(RAW);
});

it('la fête de la synthèse, avec SES props : deux informations d’argent, six jetons', () => {
  const html = renderToString(<StoryModeller {...PARTY} />);
  expect(html).toContain('data-theme="party"');
  expect(html).toContain('data-stage="name"');
  expect(html).toContain('سعر قطعة حلوى');
  expect(html).toContain('data-sm-noun="known:c5"');
  expect(html).not.toMatch(RAW);
  const solve = renderToString(<StoryModeller {...PARTY} startWith="solve" />);
  expect(solve).toContain('data-stage="solve"');
  expect(solve).toContain('data-sm-method="sub"');
  expect(solve).toContain('data-sm-method="add"');
  expect(solve).not.toMatch(RAW);
});

it('« startWith="solve" » épingle la résolution, le modèle du manuel déjà posé', () => {
  const html = renderToString(<StoryModeller startWith="solve" />);
  expect(html).toContain('data-stage="solve"');
  expect(html).toContain('data-sm-named');
  expect(html).not.toContain('data-sm-back');
  expect(html).not.toMatch(RAW);
});

it('une histoire dont un nombre n’a pas de jeton est une erreur de contenu', () => {
  expect(() => renderToString(<StoryModeller system="x+y=140|300x+150y=30300" chips={[{ value: '140', label: '' }]} />)).toThrow();
});

/* ── L8 : les questions pendant le labo (primitives/LabCheckpoint) et le mode guidé ── */
const kS = (key, o) => i18n.t(`lesson:manipulation.storyModeller.${key}`, o);

function check(q, label) {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, label).not.toMatch(RAW);
  expect(out, label).not.toContain('{{');
  expect(out, label).not.toContain('undefined');
  expect(q.hints, label).toHaveLength(2);
  if (q.kind === 'choice') {
    expect(q.options.filter((o) => o.correct), label).toHaveLength(1);
    q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, `${label} why`).toBeTruthy());
  } else expect(q.expected, label).toBeTruthy();
}

/** L'histoire intégrée d'un thème, comme le composant la lit (`themes.<id>`). */
function defOf(themeId, system) {
  const b = i18n.t(`lesson:manipulation.storyModeller.themes.${themeId}`, { returnObjects: true });
  const unknowns = b.unknowns.map((noun, i) => ({ id: ['x', 'y'][i], noun }));
  return { unknowns, facts: b.facts, chips: b.chips, answer: b.answer, system: system ?? L.THEME_SYSTEMS[themeId] };
}

describe('story-modeller — questions pendant le labo', () => {
  it.each([['stadium'], ['museum'], ['party']])('%s : chaque étape pose des questions complètes (2 indices, une bonne réponse)', (themeId) => {
    const def = defOf(themeId);
    const model = L.parseModel({ system: def.system, unknowns: def.unknowns, facts: def.facts, chips: def.chips });
    for (const method of ['sub', 'add']) {
      let lab = L.init(model, { named: true });
      lab = { ...lab, slots: L.targetSlots(model, lab.naming) };
      lab = L.checkModel(lab, model);
      expect(lab.verdict.ok).toBe(true);
      const at = (stage, plan, sys) => makeCtx({ model, def, lab, plan, sys, k: kS });
      for (const q of chainOf('model', lab, at('model'))) check(QUESTIONS[q](lab, kS, at('model')), `${themeId}.model.${q}`);
      lab = L.openSolve(lab);
      const sys = L.studentSystem(lab, model);
      lab = L.chooseMethod(lab, method);
      const plan = L.solvePlan(sys, model.ids, method);
      while (L.canReveal(lab, plan) || lab.revealed < plan.lines.length) { lab = L.claimHalf(L.reveal(lab, plan), 'more'); if (lab.revealed >= plan.lines.length) break; }
      expect(L.solved(lab, plan)).toBe(true);
      for (const q of chainOf('solve', lab, makeCtx({ model, def, lab, plan, sys, k: kS }))) check(QUESTIONS[q](lab, kS, makeCtx({ model, def, lab, plan, sys, k: kS })), `${themeId}.${method}.solve.${q}`);
      lab = L.openVerify(lab, plan);
      for (const id of model.ids) lab = L.gate(lab, lab.naming[id], L.gateId(id));
      lab = L.replay(lab, model, plan.values);
      expect(lab.replay.ok).toBe(true);
      const ctx = makeCtx({ model, def, lab, plan, sys, k: kS });
      for (const q of chainOf('verify', lab, ctx)) check(QUESTIONS[q](lab, kS, ctx), `${themeId}.verify.${q}`);
      lab = L.chooseAnswer(L.openAnswer(lab), def.answer.correct ?? 0, def.answer.correct ?? 0);
      expect(L.discoveryReady(lab)).toBe(true);
      const c2 = makeCtx({ model, def, lab, plan, sys, k: kS });
      for (const q of chainOf('answer', lab, c2)) check(QUESTIONS[q](lab, kS, c2), `${themeId}.answer.${q}`);
    }
    // l'étape « name » : sur une histoire nommée à la main
    let lab = L.init(model, {});
    lab = L.name(L.name(lab, 'x', 'x'), 'y', 'y');
    expect(L.namingDone(lab)).toBe(true);
    const c0 = makeCtx({ model, def, lab, k: kS });
    for (const q of chainOf('name', lab, c0)) check(QUESTIONS[q](lab, kS, c0), `${themeId}.name.${q}`);
    expect(Object.keys(CHAINS)).toEqual(['name', 'model', 'solve', 'verify', 'answer']);
  });
  it('le musée : la réponse de solveFirst / solveSecond est calculée sur la jumla (62 ; 78)', () => {
    const def = defOf('museum');
    const model = L.parseModel({ system: def.system, unknowns: def.unknowns, facts: def.facts, chips: def.chips });
    let lab = L.init(model, { named: true, startWith: 'solve' });
    const sys = L.studentSystem(lab, model);
    lab = L.chooseMethod(lab, 'sub');
    const plan = L.solvePlan(sys, model.ids, 'sub');
    const ctx = makeCtx({ model, def, lab, plan, sys, k: kS });
    expect([QUESTIONS.solveFirst(lab, kS, ctx).expected, QUESTIONS.solveSecond(lab, kS, ctx).expected].sort()).toEqual(['62', '78']);
  });
  it('mode guidé : ni la progression ni « إظهار التلميح », les étapes sont là', () => {
    const html = renderToString(<StoryModeller />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    const off = renderToString(<StoryModeller checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
  });
});
