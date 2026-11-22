import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import DigGrid, { CHAINS, QUESTIONS, ruleOptions } from './DigGrid';
import { LEVELS } from '../levels';
import * as L from '../logic/digGrid';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<DigGrid {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.digGrid.${key}`, o);
const LV = LEVELS['dig-grid'];

describe('dig-grid — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, fouille, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-dig-grid', 'data-dg-glance', 'data-dg-stage', 'data-dg-svg', 'data-dg-stake', 'data-dg-free', 'data-dg-free-input', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-dg-kid', 'data-dg-cord="x"', 'data-dg-cord="y"']) expect(out, hook).toContain(hook);
      expect(out).toContain(level === 'beginner' ? 'data-dg-notebook' : 'data-dg-answer');
      expect(out).not.toContain('data-dg-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : le carnet et « لا يوجد موضع » ; متقدم : coordonnées voilées avant d’écrire', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('data-dg-none');
    expect(b).toContain('data-dg-note="0"');
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a).not.toContain('data-coords');
    expect(a).not.toContain('data-dg-none');
  });
  it('معارف : le labo posé seul (m1) ne montre aucune clé brute', () => {
    const out = html({ tasks: [{ id: 'm1', kind: 'typed', stake: '4;2', finds: ['jar', 'lamp', 'plate'] }], levels: false });
    expect(out).toContain('data-dg-answer');
    expect(out).not.toMatch(RAW);
    expect(CHAINS.m1).toEqual(['south', 'ruleB']);
  });
  it('ruleOptions : une seule bonne réponse', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('dig-grid — questions pendant le labo (LabCheckpoint)', () => {
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
    const all = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks, { id: 'm1', kind: 'typed', stake: '4;2', finds: ['jar', 'lamp', 'plate'] }];
    const s = L.init({ tasks: all });
    for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
  });
});
