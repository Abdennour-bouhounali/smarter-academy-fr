import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import StrideStamp, { CHAINS, QUESTIONS, ruleOptions, askText } from './StrideStamp';
import { LEVELS } from '../levels';
import * as L from '../logic/strideStamp';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<StrideStamp {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.strideStamp.${key}`, o);
const LV = LEVELS['stride-stamp'];
const taskById = (id) => [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks].find((x) => x.id === id);

describe('stride-stamp — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, route, carnet, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-stride-stamp', 'data-ss-glance', 'data-ss-stage', 'data-ss-svg', 'data-ss-knob', 'data-ss-ask', 'data-ss-record', 'data-ss-less', 'data-ss-more', 'data-ss-free', 'data-ss-free-input',
        'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-ss-kidchip']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-ss-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(out).not.toContain('undefined');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'O'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ b1 : la route ne porte que le zéro ; la foulée est choisie sur la glissière ; la lecture est dite EN MOTS', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('data-kind="stamp"');
    expect(b).toContain('data-ss-rail');
    expect(b).toContain('data-ss-stride="0"');
    expect(b).toContain('data-ss-stride="2"');
    expect(b).toContain('data-ss-tick="0"');
    expect(b).not.toContain('data-ss-tick="−1"');
    expect(b).not.toContain('data-ss-tick="1"');
    expect(b).toContain('data-ss-read="0"');
    expect(b).toContain('data-ss-read="1"');
    expect(b).toContain('باب المدرسة');
    expect(b).toContain('شرق المحطّة');
    expect(b).toContain('data-ss-mosque');
    expect(b).toContain('data-ss-school');
    expect(b).not.toContain('data-ss-less-tenth');
  });
  it('b2 : les cotes de distance ; b3 : le pas d\'un dixième ; a1 : le drapeau et les graduations écrites ; a3 : le cadre', () => {
    const twin = html({ tasks: [taskById('b2')], level: 'beginner', levels: false });
    expect(twin).toContain('data-ss-twin');
    expect(twin).toContain('data-ss-distance');
    expect(twin).toContain('data-ss-tick="−4"');
    expect(twin).toContain('data-ss-tick="4"');
    const place = html({ tasks: [taskById('b3')], level: 'beginner', levels: false });
    expect(place).toContain('data-ss-less-tenth');
    expect(place).toContain('data-ss-more-tenth');
    expect(place).toContain('غرب المحطّة');
    const origin = html({ tasks: [taskById('a1')], level: 'advanced', levels: false });
    expect(origin).toContain('data-ss-flag');
    expect(origin).toContain('data-ss-given="−3"');
    expect(origin).toContain('data-ss-given="3"');
    expect(origin).not.toContain('data-ss-reads');
    const bound = html({ tasks: [taskById('a3')], level: 'advanced', levels: false });
    expect(bound).toContain('data-ss-frame');
    expect(bound).toContain('data-ss-house="bound-0"');
    for (const out of [twin, place, origin, bound]) { expect(out).not.toMatch(RAW); expect(out).not.toContain('{{'); }
  });
  it('une tâche posée seule avec un id inconnu se rend avec les textes par défaut', () => {
    const out = html({ tasks: [{ id: 'm1', kind: 'place', reads: [{ x: -15 }, { x: 22 }] }], levels: false });
    expect(out).toContain('data-ss-knob');
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
  it('askText : les mots, jamais une position', () => {
    const [b1, b2, b3] = L.normalizeTasks(LV.beginner.numbers.tasks);
    expect(askText(k, b1, b1.reads[0])).toContain('شرق');
    expect(askText(k, b1, b1.reads[0])).toContain('3');
    expect(askText(k, b1, b1.reads[1])).toContain('غرب');
    expect(askText(k, b2, b2.reads[0])).toContain('الجهة الأخرى');
    expect(askText(k, b3, b3.reads[1])).toContain('2,7');
    expect(askText(k, b3, b3.reads[0])).toContain('غرب');
  });
});

describe('stride-stamp — mode guidé (L9)', () => {
  it('les questions actives : ni progression « جرّب › اكتشف › صِغ » ni « إظهار التلميح »', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain('إظهار التلميح');
  });
});

describe('stride-stamp — questions pendant le labo (LabCheckpoint)', () => {
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
  it('b1 : « لماذا نحمل الوحدة نفسها في الجهتين ؟ » ; b3 : « ما فاصلة البيت الأخضر ؟ » — −3 est juste, 3 et −4 sont réfutés', () => {
    const s = L.init({ tasks: [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks] });
    const same = QUESTIONS.sameUnit(s, s.tasks[0], k);
    expect(renderToString(<div>{same.prompt}</div>)).toContain('الوحدة نفسها');
    const q = QUESTIONS.green(s, s.tasks[2], k);
    expect(renderToString(<div>{q.prompt}</div>)).toContain('البيت الأخضر');
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>).replace(/<[^>]+>/g, '');
    expect(right).toMatch(/[−-]3/);
    const wrong = renderToString(<div>{q.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>).replace(/<[^>]+>/g, '');
    expect(wrong).toMatch(/[−-]4/);
  });
  it('b3 between : −1,5 est entre −2 et −1 ; a2 : une graduation vaut 2 donc −2 est à une graduation de l\'origine', () => {
    const s = L.init({ tasks: [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks] });
    const q = QUESTIONS.between(s, s.tasks[2], k);
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>).replace(/<[^>]+>/g, ' ');
    expect(right).toMatch(/[−-]2/);
    expect(right).toMatch(/[−-]1/);
    const t = QUESTIONS.originTick(s, s.tasks[4], k);
    const rt = renderToString(<div>{t.options.find((o) => o.correct).text}</div>).replace(/<[^>]+>/g, ' ');
    expect(rt).toContain('1');
  });
  it('les suites : la règle à la fin de chaque niveau', () => {
    expect(CHAINS.b1).toEqual(['sameUnit', 'westSign']);
    expect(CHAINS.b3.at(-1)).toBe('ruleA');
    expect(CHAINS.a3.at(-1)).toBe('ruleB');
  });
});
