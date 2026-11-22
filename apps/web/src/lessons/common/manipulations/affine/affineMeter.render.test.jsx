import { it, expect, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import AffineMeter, { chainOf, QUESTIONS } from './AffineMeter';
import * as L from '../logic/affineMeter';
import ManipulationWorkspace from '../ManipulationWorkspace';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';
import source from './AffineMeter.jsx?raw';

/**
 * affine-meter se rend à ses deux niveaux (la course en taxi-application, la paie du نشاط 1), seul et
 * dans un workspace, sans clé i18n brute, avec la poignée de x, −/+, le compteur (bloc b + tuiles), le
 * bloc « d'un seul regard » et le décor.
 */
it('affine-meter se rend aux deux niveaux, sans clé brute', () => {
  const cases = [
    { rule: '40x+100', mode: 'image', theme: 'ride' },
    { rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775', marks: '5|8|10|12|15', theme: 'payroll' },
  ];
  for (const c of cases) {
    const html = renderToString(<AffineMeter {...c} />);
    expect(html, c.rule).toContain('data-affine-meter');
    expect(html).toContain(`data-rule="${c.rule}"`);
    expect(html).toContain('data-am-glance');
    expect((html.match(/data-stretch-handle/g) ?? []).length).toBe(1); // les boutons a et b n'existent qu'à l'étape classify
    expect(html).toContain('data-am-handle');
    expect(html).toContain('data-am-less');
    expect(html).toContain('data-am-more');
    expect(html).toContain('data-am-meter');
    expect(html).toContain('data-am-base');
    expect(html).toContain('data-am-screen');
    expect(html).toContain(`data-world="${c.theme}"`);
    expect(html).toContain('data-lab-fold="affine-meter.trials"');
    expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
    if (c.theme === 'payroll') {
      expect(html).toContain('data-deco="timecard"');
      expect(html).toContain('data-am-stages');
      expect(html).toContain('data-am-step="2"');
      expect(html).toContain('data-am-mark="15"');
      expect(html).toContain('aria-valuemax="20"');
    } else {
      expect(html).toContain('data-deco="car"');
      expect(html).toContain('data-deco="street"');
      expect(html).not.toContain('data-am-stages');
      expect(html).toContain('aria-valuemax="12"');
    }
  }
});

it('affine-meter se rend dans un workspace à deux niveaux', () => {
  const html = renderToString(
    <ManipulationWorkspace
      defaultLevel="advanced"
      levels={{
        beginner: () => <AffineMeter level="beginner" rule="40x+100" mode="image" theme="ride" />,
        advanced: () => <AffineMeter level="advanced" rule="185x+35000" mode="image|antecedent|classify" target="37775" marks="5|8|10|12|15" theme="payroll" />,
      }}
    />,
  );
  expect(html).toContain('data-rule="40x+100"');
  expect(html).toContain('data-rule="185x+35000"');
});

it('une cible sans antécédent entier est une faute de la leçon (erreur au rendu)', () => {
  expect(() => renderToString(<AffineMeter rule="185x+35000" mode="image|antecedent" target="37000" />)).toThrow();
});

it('chaque clé que le composant lit existe (aucune clé brute à l’écran)', () => {
  const ns = manipulationAr.affineMeter;
  const own = [...source.matchAll(/\bk\('([a-zA-Z0-9_]+)'/g)].map((m) => m[1]);
  expect(own.length).toBeGreaterThan(15);
  for (const key of own) expect(ns[key], `manipulation.affineMeter.${key}`).toBeTypeOf('string');
  const dyn = ['stage_image', 'stage_antecedent', 'stage_classify', 'vStage_image', 'vStage_antecedent', 'vStage_classify',
    'vKnobs_affine', 'vKnobs_linear', 'vKnobs_constant', 'kind_affine', 'kind_linear', 'kind_constant',
    'knobLess_a', 'knobMore_a', 'knobLess_b', 'knobMore_b', 'next_image', 'next_antecedent', 'dRight', 'dRightInverse',
    'hint2', 'hint2Marks', 'hint3', 'hint3Target', 'dWhyPropZero', 'dWhyPropDouble', 'vBelow', 'vAbove'];
  for (const key of dyn) expect(ns[key], key).toBeTypeOf('string');
  const worldKeys = [...source.matchAll(/\bw\('([a-zA-Z0-9_]+)'/g)].map((m) => m[1]);
  for (const world of ['ride', 'payroll']) {
    for (const key of [...worldKeys.filter((key) => key !== 'units'), 'mission', 'missionMulti', 'less', 'more']) expect(ns.worlds[world][key], `${world}.${key}`).toBeTypeOf('string');
    for (const form of ['zero', 'one', 'two', 'few', 'many', 'other']) expect(ns.worlds[world][`units_${form}`]).toBeTypeOf('string');
  }
});

it('affine-meter : le compteur n\'est jamais vide à l\'ouverture et « جرّب كل الإمكانيات » est offert (2026-10-09)', () => {
  const out = renderToString(<AffineMeter rule="40x+100" />);
  expect(out).not.toContain('data-am-x=""');
  expect(out).not.toContain('data-fx=""');
  expect(out).toContain('data-manipulation-autocomplete="ready"');
});

describe('affine-meter — questions pendant le labo (LabCheckpoint)', () => {
  const RAW = /manipulation\.[a-zA-Z]/;
  const k = (key, o) => i18n.t(`lesson:manipulation.affineMeter.${key}`, o);
  const wOf = (theme) => (key, o) => i18n.t(`lesson:manipulation.affineMeter.worlds.${theme}.${key}`, o);
  const check = (lab, stage, w, FN) => {
    for (const qid of chainOf(lab, stage)) {
      const q = QUESTIONS[qid](lab, k, w, FN);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${stage}.${qid}`).not.toMatch(RAW);
      expect(out, `${stage}.${qid}`).not.toContain('{{');
      expect(q.hints, `${stage}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${stage}.${qid}`).toHaveLength(1);
      else expect(q.expected).toBeTruthy();
    }
  };
  it('niveau مبتدئ : fixed · step · règle, avec les nombres de l’élève', () => {
    let lab = L.init({ rule: '40x+100', mode: 'image' });
    for (const x of [0, 3, 6]) lab = L.commit(lab, x);
    expect(chainOf(lab, 'image')).toEqual(['fixed', 'step', 'rule']);
    check(lab, 'image', wOf('ride'), 'f');
    expect(QUESTIONS.fixed(lab, k, wOf('ride'), 'f').expected).toBe('100');
    expect(QUESTIONS.step(lab, k, wOf('ride'), 'f').expected).toBe('40');
  });
  it('niveau متقدم : image (double), antécédent (règle), classify', () => {
    let lab = L.init({ rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775', marks: '5|8|10|12|15' });
    for (const x of [5, 8, 10, 12, 15]) lab = L.commit(lab, x);
    expect(L.stageDone(lab, 'image')).toBe(true);
    expect(chainOf(lab, 'image')).toEqual(['fixed', 'step']);
    check(lab, 'image', wOf('payroll'), 'S');
    expect(QUESTIONS.fixed(lab, k, wOf('payroll'), 'S').expected).toBe('35000');
    lab = L.setStage(lab, 'antecedent');
    lab = L.commit(lab, 15);
    expect(chainOf(lab, 'antecedent')).toEqual(['first', 'rest', 'rule']);
    check(lab, 'antecedent', wOf('payroll'), 'S');
    expect(QUESTIONS.rest(lab, k, wOf('payroll'), 'S').expected).toBe('2775');
    lab = L.setStage(lab, 'classify');
    expect(chainOf(lab, 'classify')).toEqual(['linear', 'constant']);
    check(lab, 'classify', wOf('payroll'), 'S');
  });
  it('mode guidé : ni la progression ni le bouton d’indice (questions actives)', () => {
    const out = renderToString(<AffineMeter rule="40x+100" mode="image" theme="ride" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-manipulation-sound');
  });
});
