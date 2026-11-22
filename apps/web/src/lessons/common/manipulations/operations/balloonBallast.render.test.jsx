import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import BalloonBallast, { CHAINS, QUESTIONS, ruleOptions, cardTex } from './BalloonBallast';
import { LEVELS } from '../levels';
import * as L from '../logic/balloonBallast';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<BalloonBallast {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.balloonBallast.${key}`, o);
const LV = LEVELS['balloon-ballast'];
const M = [{ id: 'm1', a: '-8', op: '+', b: '3' }, { id: 'm2', a: '4', op: '-', b: '-6', predict: true }];

describe('balloon-ballast — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, scène, rayon, carte ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-balloon-ballast', 'data-bb-glance', 'data-bb-stage', 'data-bb-svg', 'data-bb-balloon', 'data-bb-basket', 'data-bb-shelf="token"', 'data-bb-shelf="bag"', 'data-bb-answer', 'data-bb-free', 'data-bb-log', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-bb-kid']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-bb-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'm', 'T', 'S', 'P', 'Shift'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : pas de paire neutre ; متقدم : la paire neutre et l’altitude écrite d’abord', () => {
    expect(html({ ...LV.beginner.numbers, level: 'beginner' })).not.toContain('data-bb-shelf="pair"');
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a).toContain('data-bb-shelf="pair"');
    expect(a).toContain('disabled=""');
  });
  it('معارف : le labo posé seul (m1, m2) ne montre aucune clé brute', () => {
    const out = html({ tasks: M, levels: false });
    expect(out).toContain('data-bb-answer');
    expect(out).not.toMatch(RAW);
    expect(CHAINS.m1.length + CHAINS.m2.length).toBeGreaterThan(1);
  });
  it('ruleOptions : une seule bonne réponse', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
  it('cardTex : (+6)+(-4)', () => { expect(cardTex(600n, '+', -400n)).toBe('${(+6)+(-4)}$'); });
});

describe('balloon-ballast — questions pendant le labo (LabCheckpoint)', () => {
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
