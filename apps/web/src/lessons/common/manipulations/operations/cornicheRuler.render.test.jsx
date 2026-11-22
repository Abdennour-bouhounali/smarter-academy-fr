import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import CornicheRuler, { CHAINS, QUESTIONS, ruleOptions } from './CornicheRuler';
import { LEVELS } from '../levels';
import * as L from '../logic/cornicheRuler';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<CornicheRuler {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.cornicheRuler.${key}`, o);
const LV = LEVELS['corniche-ruler'];

describe('corniche-ruler — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, planche, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of ['data-corniche-ruler', 'data-cr-glance', 'data-cr-stage', 'data-cr-svg', 'data-cr-free', 'data-cr-free-input', 'data-lab-stepper', 'data-lab-context', 'data-lab-question', 'data-cr-kid']) expect(out, hook).toContain(hook);
      expect(out).toContain(level === 'beginner' ? 'data-cr-pin' : 'data-cr-lever');
      expect(out).not.toContain('data-cr-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'm', 'cm', 'A', 'B', 'C', 'D'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : pas de levier ; متقدم : planche sans nombres avant de fixer la graduation', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).not.toContain('data-cr-lever');
    expect(b).toContain('data-cr-answer');
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a).toContain('data-cr-confirm');
    expect(a).not.toContain('data-cr-answer');
    expect(a).not.toContain('data-cr-cell=');
  });
  it('معارف : le labo posé seul (tâche m1) ne montre aucune clé brute', () => {
    const out = html({ tasks: [{ id: 'm1', kind: 'read', pin: '-20', ask: ['lamp', 'palm', 'bus'] }], levels: false });
    expect(out).toContain('data-cr-answer');
    expect(out).not.toMatch(RAW);
    expect(CHAINS.m1).toEqual(['count', 'ruleB']);
  });
  it('ruleOptions : une seule bonne réponse', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(L.init(LV[adv ? 'advanced' : 'beginner'].numbers), k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('corniche-ruler — questions pendant le labo (LabCheckpoint)', () => {
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
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(LV[lv].numbers);
      for (let i = 0; i < s.tasks.length; i += 1) {
        const task = s.tasks[i];
        // une tâche faite : on pose le dernier essai gagnant comme le fait le labo
        if (task.kind === 'opp') s = L.setPin({ ...s, ti: i, pin: 0n }, -1000);
        else s = { ...s, ti: i };
        if (task.kind === 'move') s = { ...s, pin: task.target };
        if (task.kind === 'read' || task.kind === 'move') for (const id of task.ask) s = L.answerRead({ ...s, ai: task.ask.indexOf(id) }, R_TEXT(s, id));
        for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
      }
    }
  });
  it('les nombres de la suite b1 : 3 graduations, 10 m', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.answerRead(L.answerRead(s, '30'), '-20');
    const q = QUESTIONS.count(s, s.tasks[0], k);
    expect(renderToString(<div>{q.options[0].text}</div>)).toContain('3');
  });
});

function R_TEXT(s, id) { return String(Number(L.abscissa(s, id)) / 100).replace('.', ','); }
