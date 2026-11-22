import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import TugRope, { CHAINS, QUESTIONS, ruleOptions } from './TugRope';
import { LEVELS } from '../levels';
import * as L from '../logic/tugRope';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<TugRope {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.tugRope.${key}`, o);
const LV = LEVELS['tug-rope'];
const M = [{ id: 'm1', chain: '(-11)-(+6)-(-9)-(+4)' }];

describe('tug-rope — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, terrain, file, tableau ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-tug-rope', 'data-tr-glance', 'data-tr-stage', 'data-tr-queue', 'data-tr-child="0"', 'data-tr-team="left"', 'data-tr-team="right"', 'data-tr-ribbon', 'data-tr-scoreboard', 'data-tr-whistle', 'data-tr-answer', 'data-tr-free', 'data-lab-stepper', 'data-tr-kid']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-tr-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'm', 'T', 'Backspace'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('معارف : le labo posé seul ne montre aucune clé brute', () => {
    const out = html({ tasks: M, levels: false });
    expect(out).toContain('data-tr-turn');
    expect(out).not.toMatch(RAW);
  });
  it('ruleOptions : une seule bonne réponse', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('tug-rope — questions pendant le labo (LabCheckpoint)', () => {
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
    for (const numbers of [LV.beginner.numbers, LV.advanced.numbers, { tasks: M }]) {
      const s = L.init(numbers);
      s.tasks.forEach((task) => { for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`); });
    }
  });
});
