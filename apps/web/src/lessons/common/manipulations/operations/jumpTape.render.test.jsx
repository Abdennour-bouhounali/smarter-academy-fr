import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import JumpTape, { CHAINS, QUESTIONS, ruleOptions } from './JumpTape';
import { LEVELS } from '../levels';
import * as L from '../logic/jumpTape';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<JumpTape {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.jumpTape.${key}`, o);
const LV = LEVELS['jump-tape'];

describe('jump-tape — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, fosse, ruban, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-jump-tape', 'data-jt-glance', 'data-jt-stage', 'data-jt-svg', 'data-jt-free', 'data-jt-free-input', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-jt-kid', 'data-jt-controls']) expect(out, hook).toContain(hook);
      expect(out).toContain(level === 'beginner' ? 'data-jt-knob' : 'data-jt-cursor');
      expect(out).not.toContain('data-jt-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'O'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : la fenêtre ne montre que O et la marque « 1 » ; pas de petite graduation avant l’unité', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of ['data-jt-lock', 'data-jt-less', 'data-jt-more', 'data-jt-mark="0"', 'data-jt-mark="1"']) expect(b, hook).toContain(hook);
    expect(b).not.toContain('data-jt-mark="2"');
    expect(b).not.toContain('data-jt-tick=');
    expect(b).not.toContain('data-jt-tray');
  });
  it('متقدم : drapeaux plantés, curseur, graduations à chaque dixième ; un ruban sans origine', () => {
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    for (const hook of ['data-jt-flag="A"', 'data-jt-flag="B"', 'data-jt-flag="C"', 'data-jt-chip="A"', 'data-jt-exact', 'data-jt-bounds', 'data-jt-tick="0,1"', 'data-jt-tick="2,9"']) expect(a, hook).toContain(hook);
    const hidden = html({ tasks: [LV.advanced.numbers.tasks[1]], level: 'advanced', levels: false });
    expect(hidden).toContain('data-jt-mark="9"');
    expect(hidden).toContain('data-jt-tick="9,1"');
    expect(hidden).not.toMatch(RAW);
    const cents = html({ tasks: [LV.advanced.numbers.tasks[2]], level: 'advanced', levels: false });
    expect(cents).toContain('data-jt-tick="4,01"');
  });
  it('la tâche posée seule (levels={false}) avec un id inconnu se rend avec les textes par défaut', () => {
    const out = html({ tasks: [{ id: 'm1', kind: 'plant', jumps: ['1,6', '2,2'], from: '0', step: '1', unit: 'free' }], levels: false });
    expect(out).toContain('data-jt-knob');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
  });
  it('ruleOptions : une seule bonne réponse', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('jump-tape — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(out, tag).not.toContain('undefined');
    expect(out, tag).not.toContain('NaN');
    expect(q.hints, tag).toHaveLength(2);
    expect(q.options.filter((o) => o.correct), tag).toHaveLength(1);
    expect(q.options.filter((o) => !o.correct).every((o) => o.why), tag).toBe(true);
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse', () => {
    const all = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks];
    const s = L.init({ tasks: all });
    for (const task of s.tasks) {
      const ids = [`${task.id}u`, task.id].filter((id) => CHAINS[id]);
      for (const id of ids) for (const qid of CHAINS[id]) check(QUESTIONS[qid](s, task, k), `${id}.${qid}`);
    }
  });
  it('la suite de b1 finit sur « العلم الأزرق » : 3,1 est la bonne réponse, 1,3 et 3 sont réfutées', () => {
    const s = L.init(LV.beginner.numbers);
    const q = QUESTIONS.flagBlue(s, s.tasks[0], k);
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
    expect(right).toContain('3,1');
    const wrong = renderToString(<div>{q.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>);
    expect(wrong).toContain('1,3');
  });
  it('les suites : l’unité de b1 (10 graduations, 1/10), la règle à la fin de chaque niveau', () => {
    expect(CHAINS.b1u).toEqual(['ticks', 'gap']);
    expect(CHAINS.b1).toEqual(['flagBlue', 'steps']);
    expect(CHAINS.b3.at(-1)).toBe('ruleA');
    expect(CHAINS.a3.at(-1)).toBe('ruleB');
  });
});
