import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import GapCaliper, { CHAINS, QUESTIONS, ruleOptions } from './GapCaliper';
import { LEVELS } from '../levels';
import * as L from '../logic/gapCaliper';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<GapCaliper {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.gapCaliper.${key}`, o);
const LV = LEVELS['gap-caliper'];
const M1 = { id: 'm1', anchor: '-4', target: '3' };

describe('gap-caliper — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, thermomètre, compas, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-gap-caliper', 'data-gc-glance', 'data-gc-stage', 'data-gc-svg', 'data-gc-free', 'data-gc-free-input', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-gc-kid', 'data-gc-controls', 'data-gc-caliper']) expect(out, hook).toContain(hook);
      expect(out).toContain(level === 'beginner' ? 'data-gc-screw' : 'data-gc-answer');
      expect(out).not.toContain('data-gc-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'M', 'N', 'AB', 'BA', 'CD', 'DC'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : la vis, − / +, « ثبّت » ; متقدم : l’ouverture est écrite avant la vis (vis verrouillée)', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of ['data-gc-less', 'data-gc-more', 'data-gc-fix', 'data-gc-dial', 'data-gc-bead="a"', 'data-gc-bead="b"']) expect(b, hook).toContain(hook);
    expect(b).not.toContain('data-gc-answer');
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a).toContain('data-locked="true"');
    expect(a).toContain('data-gc-answer');
    expect(a).not.toContain('data-gc-screw');
  });
  it('معارف : le labo posé seul (m1) ne montre aucune clé brute', () => {
    const out = html({ tasks: [M1], levels: false });
    expect(out).toContain('data-gc-screw');
    expect(out).not.toMatch(RAW);
    expect(CHAINS.m1).toEqual(['calcM', 'ruleA']);
  });
  it('ruleOptions : une seule bonne réponse', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('gap-caliper — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(out, tag).not.toContain('undefined');
    expect(q.hints, tag).toHaveLength(2);
    expect(q.options.filter((o) => o.correct), tag).toHaveLength(1);
    expect(q.options.filter((o) => !o.correct).every((o) => o.why), tag).toBe(true);
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse', () => {
    const all = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks, M1];
    const s = L.init({ tasks: all });
    for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
  });
});
