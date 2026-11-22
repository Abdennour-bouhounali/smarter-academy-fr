import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import JuiceLine, { CHAINS, QUESTIONS, ruleOptions } from './JuiceLine';
import { LEVELS } from '../levels';
import * as L from '../logic/juiceLine';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<JuiceLine {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.juiceLine.${key}`, o);
const LV = LEVELS['juice-line'];

describe('juice-line — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la معصرة, le réservoir, les bouteilles, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-juice-line');
      const hooks = ['data-jl-glance', 'data-jl-scene', 'data-jl-juice', 'data-jl-bottle', 'data-jl-free', 'data-jl-free-start', 'data-lab-stepper', level === 'beginner' ? 'data-jl-fill' : 'data-jl-slate', level === 'beginner' ? 'data-jl-mould' : 'data-jl-tank'];
      for (const hook of hooks) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-jl-next');
      expect(out).not.toContain('data-jl-formal');
      if (level === 'beginner') expect(out).not.toContain('data-jl-slate');   // l'ardoise s'ouvre après un essai (مبتدئ) ; d'emblée à متقدم (prédiction)
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'L'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('ouvre sur son CONTEXTE puis UNE question (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('اضبط سعة القالب')).toBeGreaterThan(t.indexOf('طلبت التعاونية'));
  });
  it('ruleOptions : une seule bonne réponse, deux réfutations, aux deux niveaux', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
  it('la tâche libre du labo seul (module 2) se rend', () => {
    const out = html({ tasks: [{ id: 'k1', kind: 'mould', total: 18, bottles: 12, tests: 2 }], levels: false });
    expect(out).toContain('data-jl-mould');
    expect(out).not.toMatch(RAW);
  });
});

describe('juice-line — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), tag).toHaveLength(1); expect(q.options[0].correct, `${tag} : la bonne réponse n'est jamais la première`).toBeFalsy(); }
    else expect(q.expected, tag).toBeTruthy();
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse jamais première, ni clé brute ni {{', () => {
    for (const nums of [LV.beginner.numbers, LV.advanced.numbers, { tasks: [{ id: 'k1', kind: 'mould', total: 18, bottles: 12, tests: 2 }] }]) {
      let s = L.init(nums);
      for (const task of s.tasks) {
        // un essai de l'élève pour que « ce qu'a dit le remplissage » ait ses propres nombres
        if (task.kind === 'mould') { s = L.pressFill(L.stretch({ ...s, ti: s.tasks.indexOf(task), w: { ...s.w, phase: 'test', testsLeft: 2 } }, 140)); }
        for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
      }
    }
    const s = L.init({ tasks: [{ id: 'k1', kind: 'mould', total: 18, bottles: 12, tests: 2 }] });
    expect(QUESTIONS.x(s, s.tasks[0], k).expected).toBe('1.5');
    const s1 = L.pressFill(L.stretch(L.init(LV.beginner.numbers), 140));
    expect(QUESTIONS.said(s1, s1.tasks[0], k).expected).toBe('12');
  });
});

describe('juice-line — mode guidé', () => {
  it('ni la progression ni l’indice sur les tâches à questions ; une tâche hors CHAINS les garde', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', kind: 'mould', total: 18, bottles: 12, tests: 2 }], levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
