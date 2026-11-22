import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import RewindBelt, { CHAINS, QUESTIONS, ruleOptions, cardTex, eqTex, solveTex, checkTex, varsOf } from './RewindBelt';
import { LEVELS } from '../levels';
import * as L from '../logic/rewindBelt';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<RewindBelt {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.rewindBelt.${key}`, o);
const LV = LEVELS['rewind-belt'];

describe('rewind-belt — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, tapis, machine, rack, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-rewind-belt', 'data-rb-glance', 'data-rb-stage', 'data-rb-svg', 'data-rb-crate', 'data-rb-rack', 'data-rb-card="add"', 'data-rb-card="sub"', 'data-rb-machine', 'data-rb-slot', 'data-rb-bin', 'data-rb-tray',
        'data-rb-free', 'data-rb-free-a', 'data-rb-free-b', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-rb-kid']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-rb-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(out).not.toContain('undefined');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'm', 'cm', 'A', 'B', 'C', 'D', 'O', 'kg'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('b1 : le contexte et la question sont dits en mots ; la machine porte « + 9 » ; la caisse est à la sortie avec 54 ; le bac attend □', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('دفاتر');
    expect(b).toContain('data-phase="rewind"');
    expect(b).toContain('data-value="54"');
    expect(b).toContain('data-pick=""');
    expect(b).toContain('□');
    expect(b).not.toContain('data-rb-eq');
  });
  it('b4 : la carte « a − » est dans le rack avec son carré vide ; a3 : la fraction s\'écrit', () => {
    const b4 = html({ tasks: [LV.beginner.numbers.tasks[3]], level: 'beginner', levels: false });
    expect(b4).toContain('data-rb-card="rsub"');
    expect(b4).not.toContain('data-rb-card="mul"');
    expect(b4).toContain('ورقة');
    const a3 = html({ tasks: [LV.advanced.numbers.tasks[2]], level: 'advanced', levels: false });
    expect(a3).toContain('data-rb-card="div"');
    expect(a3).toContain('لترًا');
  });
  it('une tâche posée seule avec un id inconnu se rend avec les textes par défaut', () => {
    const out = html({ tasks: [{ id: 'm1', kind: 'add', a: '18,6', out: '45,1', rack: ['add', 'sub', 'mul', 'div'] }], levels: false });
    expect(out).toContain('data-rb-crate');
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
  it('les écritures : égalité à trou, solution, contre-épreuve', () => {
    const [b1, b2, b3, b4] = L.normalizeTasks(LV.beginner.numbers.tasks);
    expect(eqTex(b1)).toBe('\\square+9=54');
    expect(solveTex(b1)).toBe('\\square=54-9=45');
    expect(checkTex(b1)).toBe('45+9=54');
    expect(solveTex(b2)).toBe('\\square=54+14=68');
    expect(solveTex(b3)).toBe('\\square=54\\div 6=9');
    expect(eqTex(b4)).toBe('80-\\square=54');
    expect(solveTex(b4)).toBe('\\square=80-54=26');
    expect(cardTex('rsub', b4.a)).toBe('80-\\square');
    const a3 = L.normalizeTasks(LV.advanced.numbers.tasks)[2];
    expect(solveTex(a3)).toBe('\\square=20\\div 7=\\frac{20}{7}');
    expect(checkTex(a3)).toBe('\\frac{20}{7}\\times 7=20');
  });
});

describe('rewind-belt — mode guidé (L9)', () => {
  it('les questions actives : ni progression « جرّب › اكتشف › صِغ » ni « إظهار التلميح »', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain('إظهار التلميح');
  });
});

describe('rewind-belt — questions pendant le labo (LabCheckpoint)', () => {
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
  it('b1 : « أيّ بطاقة تعيد الآلة إلى الوراء ؟ » — « − 9 » est juste, la carte de l\'Machine « + 9 » et « × 9 » sont réfutées', () => {
    const s = L.init(LV.beginner.numbers);
    const q = QUESTIONS.card(s, s.tasks[0], k);
    const prompt = renderToString(<div>{q.prompt}</div>);
    expect(prompt).toContain('أيّ بطاقة تعيد الآلة إلى الوراء');
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
    expect(right.replace(/<[^>]+>/g, '')).toMatch(/[−-]\s*9/);
    const wrong = renderToString(<div>{q.options.filter((o) => !o.correct).map((o, i) => <span key={i}>{o.text}</span>)}</div>);
    expect(wrong).toContain('9');
  });
  it('la vérification : « ماذا يخرج إذا أدخلنا العدد الذي وجدته ؟ » avec les nombres de la tâche', () => {
    const s = L.init(LV.beginner.numbers);
    const q = QUESTIONS.check(s, s.tasks[2], k);
    expect(renderToString(<div>{q.prompt}</div>)).toContain('تحقّق');
    const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
    expect(right.replace(/<[^>]+>/g, '')).toContain('54');
    const v = varsOf(s.tasks[2], k);
    expect(v.found).toBe('$9$');
    expect(v.twice).toBe('$324$');
  });
  it('les suites : la règle à la fin de chaque niveau', () => {
    expect(CHAINS.b1).toEqual(['card', 'check']);
    expect(CHAINS.b4.at(-1)).toBe('ruleA');
    expect(CHAINS.a3.at(-1)).toBe('ruleB');
  });
});
