import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import CourtyardDrone, { CHAINS, QUESTIONS, ruleOptions, askText } from './CourtyardDrone';
import { LEVELS } from '../levels';
import * as L from '../logic/courtyardDrone';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<CourtyardDrone {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.courtyardDrone.${key}`, o);
const LV = LEVELS['courtyard-drone'];
const taskById = (id) => [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks].find((x) => x.id === id);

describe('courtyard-drone — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : plan, drone, carnet, télécommande ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-courtyard-drone', 'data-cd-glance', 'data-cd-stage', 'data-cd-svg', 'data-cd-knob', 'data-cd-drone', 'data-cd-axes', 'data-cd-pole', 'data-cd-ask', 'data-cd-reads', 'data-cd-left', 'data-cd-right', 'data-cd-up', 'data-cd-down',
        'data-cd-lock', 'data-cd-record', 'data-cd-free', 'data-cd-free-x', 'data-cd-free-y', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-cd-kidchip']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-cd-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(out).not.toContain('undefined');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'O'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ b1 : papier quadrillé, ticks entiers sur les deux axes, le lieu est dit par ses DEUX nombres (jamais une position)', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('data-kind="fly"');
    expect(b).toContain('data-paper="squared"');
    expect(b).toContain('data-phase="x"');
    expect(b).toContain('data-cd-grid');
    expect(b).toContain('data-cd-tick="x-5"');
    expect(b).toContain('data-cd-tick="x5"');
    expect(b).toContain('data-cd-tick="y-4"');
    expect(b).toContain('data-cd-tick="y4"');
    expect(b).toContain('data-cd-read="0"');
    expect(b).toContain('data-cd-read="1"');
    expect(b).toContain('النافورة');
    expect(b).toContain('data-cd-guide="x"');
    expect(b).not.toContain('data-cd-thing="fountain"');   // le lieu n'est pas dessiné avant la photo
    expect(b).not.toContain('data-cd-unlock');
    expect(b).not.toContain('data-cd-refused');
  });
  it('b3 `read` : les objets sont dessinés, la cible entourée ; a2 / a3 : papier sans carreaux', () => {
    const read = html({ tasks: [taskById('b3')], level: 'beginner', levels: false });
    expect(read).toContain('data-cd-thing="gate"');
    expect(read).toContain('data-cd-thing="kiosk"');
    expect(read).toContain('data-state="target"');
    expect(read).toContain('البوابة');
    const plain = html({ tasks: [taskById('a2')], level: 'advanced', levels: false });
    expect(plain).toContain('data-paper="plain"');
    expect(plain).not.toContain('data-cd-grid');
    expect(plain).toContain('data-cd-axes');
    for (const out of [read, plain]) { expect(out).not.toMatch(RAW); expect(out).not.toContain('{{'); }
  });
  it('une tâche posée seule avec un id inconnu se rend avec les textes par défaut', () => {
    const out = html({ tasks: [{ id: 'm1', kind: 'fly', reads: [{ x: 20, y: -30, what: 'tap' }] }], levels: false });
    expect(out).toContain('data-cd-knob');
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
  it('askText : les nombres dits ou l\'objet désigné, jamais la position', () => {
    const [b1, , b3] = L.normalizeTasks(LV.beginner.numbers.tasks);
    expect(askText(k, b1, b1.reads[0])).toContain('النافورة');
    expect(askText(k, b1, b1.reads[0])).toContain('(3\\,;\\,-2)');
    expect(askText(k, b3, b3.reads[0])).toContain('البوابة');
    expect(askText(k, b3, b3.reads[0])).not.toMatch(/\d/);
  });
});

describe('courtyard-drone — mode guidé (L9)', () => {
  it('les questions actives : ni progression « جرّب › اكتشف › صِغ » ni « إظهار التلميح »', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain('إظهار التلميح');
  });
});

describe('courtyard-drone — questions pendant le labo (LabCheckpoint)', () => {
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
  it('b1 « هل يصل المسيّر إلى المكان نفسه إذا بدّلنا العددين ؟ » : non, il atterrit en (−2 ; 3) ; b3 « ما إحداثيا البوابة ؟ » : (−3 ; 2) juste, (2 ; −3) réfuté', () => {
    const s = L.init({ tasks: [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks] });
    const sw = QUESTIONS.swapped(s, s.tasks[0], k);
    expect(renderToString(<div>{sw.prompt}</div>)).toContain('بدّلنا العددين');
    const right = renderToString(<div>{sw.options.find((o) => o.correct).text}</div>);
    expect(right).toContain('لا');
    expect(right).toMatch(/-2[\s\S]*3/);
    const g = QUESTIONS.gate(s, s.tasks[2], k);
    expect(renderToString(<div>{g.prompt}</div>)).toContain('البوابة');
    const ok = renderToString(<div>{g.options.find((o) => o.correct).text}</div>).replace(/<[^>]+>/g, ' ');
    expect(ok).toMatch(/-3/);
    const wrong = renderToString(<div>{g.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>).replace(/<[^>]+>/g, ' ');
    expect(wrong).toMatch(/-3/);   // (3 ; 2)
  });
  it('les suites : la règle à la fin de chaque niveau', () => {
    expect(CHAINS.b1).toEqual(['swapped', 'firstAxis']);
    expect(CHAINS.b3.at(-1)).toBe('ruleA');
    expect(CHAINS.a3.at(-1)).toBe('ruleB');
  });
});
