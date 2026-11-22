import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import LetterDial, { CHAINS, QUESTIONS, ruleOptions, tokTex, chainTex, varsOf } from './LetterDial';
import { LEVELS } from '../levels';
import * as L from '../logic/letterDial';
import * as R from '@smarter-academy/core/arithmetic/letterRule.js';
import { angleOf } from './letterDial/art';
import { valueAtAngle } from './letterDial/art';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<LetterDial {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.letterDial.${key}`, o);
const LV = LEVELS['letter-dial'];

describe('letter-dial — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, boutique, carte de règle, bande, cadrans ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-letter-dial', 'data-ld-glance', 'data-ld-stage', 'data-ld-svg', 'data-ld-board', 'data-ld-tape', 'data-ld-row="0"', 'data-ld-dials', 'data-ld-free', 'data-ld-free-input', 'data-lab-stepper',
        'data-lab-context', 'data-lab-question', 'data-ld-kid', 'data-ld-knob-svg']) expect(out, hook).toContain(hook);
      expect(out).toContain(level === 'beginner' ? 'data-ld-dial="n"' : 'data-ld-dial="a"');
      expect(out).not.toContain('data-ld-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(out).not.toContain('undefined');
      expect(out).not.toContain('NaN');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'O', 'kg', 'P', 'DA'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('b1 : la règle imprimée porte la lettre, la bande porte « 5 × 0 + 20 » (jamais 50 ni 5 collé) ; le cadran est à 0', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('الثمن');
    expect(b).toContain('data-ld-slot="n"');
    expect(b).toContain('data-value="0"');
    expect(b).toContain('data-phase="turn"');
  });
  it('a1 : deux cadrans a et b ; a3 : le comparateur affiche « = » au départ (4 = 4)', () => {
    const a1 = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a1).toContain('data-ld-dial="a"');
    expect(a1).toContain('data-ld-dial="b"');
    const a3 = html({ tasks: [LV.advanced.numbers.tasks[2]], level: 'advanced', levels: false });
    expect(a3).toContain('data-ld-compare');
    expect(a3).toContain('data-eq="true"');
    expect(a3).toContain('data-ld-tapes');
  });
  it('une tâche posée seule avec un id inconnu se rend avec les textes par défaut', () => {
    const out = html({ tasks: [{ id: 'z1', kind: 'set', name: 'price', formula: '4*n+15', dials: { n: { max: 20 } }, target: { n: 9 } }], levels: false });
    expect(out).toContain('data-ld-dial="n"');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
  });
  it('ruleOptions : une seule bonne réponse, les autres réfutées', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
  it('les écritures : la substitution, la chaîne, jamais 512', () => {
    const t = L.normalizeTasks(LV.beginner.numbers.tasks);
    const env = { n: R.Q(12) };
    expect(chainTex(R.steps(t[0].tree, env))).toBe('5\\times 12+20=60+20=80');
    expect(tokTex(R.substitute(t[0].tree, env))).toBe('5\\times 12+20');
    expect(chainTex(R.steps(t[2].tree, { n: R.Q(10) }))).toBe('5\\times 10+20-10=50+20-10=70-10=60');
    expect(chainTex(R.steps(R.parse('2x'), { x: R.Q(3) }))).toBe('2\\times 3=6');
  });
  it('la géométrie du cadran : minimum à −150°, maximum à +150°, zone morte en bas collée aux extrémités', () => {
    expect(angleOf(0, 0, 30)).toBe(-150);
    expect(angleOf(30, 0, 30)).toBe(150);
    expect(angleOf(15, 0, 30)).toBe(0);
    expect(valueAtAngle(0, 0, 30)).toBe(15);
    expect(valueAtAngle(-170, 0, 30)).toBe(0);
    expect(valueAtAngle(175, 0, 30)).toBe(30);
    expect(valueAtAngle(-150, 0, 30)).toBe(0);
  });
});

describe('letter-dial — mode guidé (L9)', () => {
  it('les questions actives : ni progression « جرّب › اكتشف › صِغ » ni « إظهار التلميح »', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain('إظهار التلميح');
  });
});

describe('letter-dial — questions pendant le labo (LabCheckpoint)', () => {
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
  /** Une partie jouée : chaque tâche est menée à son terme avec ses valeurs. */
  const solvedLab = () => {
    let s = L.init({ tasks: [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks] });
    const go = (vals) => { for (const [l, v] of Object.entries(vals)) s = L.turn(s, l, v); s = L.release(s); if (L.canNext(s)) s = L.nextTask(s); };
    go({ n: 12 }); go({ n: 15 }); go({ n: 10 }); go({ a: 15, b: 8 }); go({ a: 8, b: 15 });
    return s;
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse', () => {
    const all = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks];
    let s = L.init({ tasks: all });
    // on rend chaque tâche gagnée pour que les valeurs de l'élève soient lues dans l'essai
    const wins = { b1: { n: 12 }, b2: { n: 15 }, b3: { n: 10 }, a1: { a: 15, b: 8 }, a2: { a: 8, b: 15 }, a3: { a: 3, b: 4 } };
    for (const task of all) {
      for (const [l, v] of Object.entries(wins[task.id])) s = L.turn(s, l, v);
      s = L.release(s);
      if (L.canNext(s)) s = L.nextTask(s);
    }
    for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
  });
  it('b1 : « كم يدفع من يصوّر 12 ورقة ؟ » — 80 est juste, 60 (sans le 20) et 532 (5 collé à 12) sont réfutés', () => {
    const s = solvedLab();
    const q = QUESTIONS.pay(s, s.tasks[0], k);
    expect(renderToString(<div>{q.prompt}</div>)).toContain('12');
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
    expect(right).toContain('80');
    const wrong = renderToString(<div>{q.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>);
    expect(wrong).toContain('60');
    expect(wrong).toContain('532');
  });
  it('a3 : le contre-exemple de l\'élève ; a1 : les distracteurs 38 (sans parenthèses) et 23 (sans ×2) ; a2 : 46', () => {
    const s = solvedLab();
    const v1 = varsOf(s, s.tasks[3]);
    expect(v1).toMatchObject({ value: '46', nobr: '38', sumAB: '23' });
    expect(varsOf(s, s.tasks[4]).value).toBe('46');
    const v2 = varsOf(s, s.tasks[1]);
    expect(v2).toMatchObject({ value: '95', cnt19: '19', sub20: '75' });
    expect(varsOf(s, s.tasks[2])).toMatchObject({ value: '60', once: '70', plus: '80' });
  });
  it('les suites : la règle à la fin de chaque niveau', () => {
    expect(CHAINS.b3.at(-1)).toBe('ruleA');
    expect(CHAINS.a3.at(-1)).toBe('ruleB');
    expect(CHAINS.b1).toEqual(['pay', 'slot']);
  });
});
