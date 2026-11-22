import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import FrostGauge, { CHAINS, QUESTIONS, ruleOptions, askText } from './FrostGauge';
import { LEVELS } from '../levels';
import * as L from '../logic/frostGauge';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<FrostGauge {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.frostGauge.${key}`, o);
const LV = LEVELS['frost-gauge'];

describe('frost-gauge — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, jauge, carnet, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-frost-gauge', 'data-fg-glance', 'data-fg-stage', 'data-fg-svg', 'data-fg-knob', 'data-fg-reads', 'data-fg-record', 'data-fg-less', 'data-fg-more', 'data-fg-free', 'data-fg-free-input',
        'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-fg-kid', 'data-fg-zero', 'data-fg-tick="0"']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-fg-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(out).not.toContain('undefined');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'O'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ b1 : le carnet dit la lecture EN MOTS et jamais la graduation ; le signe n\'apparaît que sous le zéro', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('data-fg-read="0"');
    expect(b).toContain('data-fg-read="4"');
    expect(b).toContain('data-state="current"');
    expect(b).toContain('data-fg-ask');
    expect(b).toContain('فوق الصفر'); // la première lecture : 5 درجات فوق الصفر
    expect(b).not.toContain('الثلاثاء —'); // seule la lecture en cours est dite en mots
    expect(b).toContain('data-fg-reading="0°"'); // le niveau part du zéro : pas de signe
    expect(b).not.toContain('data-fg-shadow');
    expect(b).toContain('data-scene="frost"');
  });
  it('b3 : l\'ombre et la cote de distance sont dessinées ; a2 : les étages ; b2 : l\'altitude en mètres', () => {
    const taskById = (id) => [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks].find((x) => x.id === id);
    const mirror = html({ tasks: [taskById('b3')], level: 'beginner', levels: false });
    expect(mirror).toContain('data-fg-shadow');
    expect(mirror).toContain('data-scene="frost"');
    const floors = html({ tasks: [taskById('a2')], level: 'advanced', levels: false });
    expect(floors).toContain('data-scene="floors"');
    expect(floors).toContain('الطابق السفلي الثاني');
    const alt = html({ tasks: [taskById('b2')], level: 'beginner', levels: false });
    expect(alt).toContain('data-scene="altitude"');
    expect(alt).toContain('تحت سطح البحر');
    const pair = html({ tasks: [taskById('a1')], level: 'advanced', levels: false });
    expect(pair).toContain('تبعد');
    expect(pair).not.toMatch(RAW);
  });
  it('une tâche posée seule avec un id inconnu se rend avec les textes par défaut', () => {
    const out = html({ tasks: [{ id: 'm1', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [-1, 2] }], levels: false });
    expect(out).toContain('data-fg-knob');
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
  it('askText : les mots, jamais un nombre de graduation', () => {
    const [b1, b2] = L.normalizeTasks(LV.beginner.numbers.tasks);
    expect(askText(k, b1, b1.reads[0])).toContain('5');
    expect(askText(k, b1, b1.reads[1])).toContain('درجتان');
    expect(askText(k, b1, b1.reads[3])).toBe(k('ask.frost.zero'));
    expect(askText(k, b2, b2.reads[0])).toContain('40');
  });
});

describe('frost-gauge — mode guidé (L9)', () => {
  it('les questions actives : ni progression « جرّب › اكتشف › صِغ » ni « إظهار التلميح »', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain('إظهار التلميح');
  });
});

describe('frost-gauge — questions pendant le labo (LabCheckpoint)', () => {
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
    for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
  });
  it('b1 : le plus froid n\'est pas le plus grand nombre — la bonne réponse est le mardi à −3 et « الأحد » est réfuté par son nombre', () => {
    const s = L.init(LV.beginner.numbers);
    const q = QUESTIONS.coldest(s, s.tasks[0], k);
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
    expect(right).toContain('الثلاثاء');
    expect(right.replace(/<[^>]+>/g, '')).toMatch(/[−-]3/);
    const wrong = renderToString(<div>{q.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>);
    expect(wrong).toContain('الأحد');
  });
  it('b3 : « ما العدد المعاكس لـ −4 ؟ » — 4 est juste, −4 et −5 sont réfutés', () => {
    const s = L.init(LV.beginner.numbers);
    const q = QUESTIONS.opp(s, s.tasks[2], k);
    const prompt = renderToString(<div>{q.prompt}</div>);
    expect(prompt.replace(/<[^>]+>/g, '')).toMatch(/[−-]4/);
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
    expect(right.replace(/<[^>]+>/g, '')).not.toMatch(/[−-]/);
    const wrong = renderToString(<div>{q.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>);
    expect(wrong.replace(/<[^>]+>/g, '')).toMatch(/[−-]5/);
  });
  it('les suites : la règle à la fin de chaque niveau', () => {
    expect(CHAINS.b1).toEqual(['sign', 'coldest', 'dist']);
    expect(CHAINS.b3.at(-1)).toBe('ruleA');
    expect(CHAINS.a3.at(-1)).toBe('ruleB');
  });
});
