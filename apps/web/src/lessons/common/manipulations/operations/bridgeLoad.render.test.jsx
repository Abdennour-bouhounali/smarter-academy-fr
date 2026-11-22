import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import BridgeLoad, { CHAINS, QUESTIONS, ruleOptions } from './BridgeLoad';
import { LEVELS } from '../levels';
import * as L from '../logic/bridgeLoad';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<BridgeLoad {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.bridgeLoad.${key}`, o);
const LV = LEVELS['bridge-load'];
const NUMS = [LV.beginner.numbers, LV.advanced.numbers, { tasks: [L.K1_TASK] }];

describe('bridge-load — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : le dépôt, le camion, l’écran, la barrière, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-bridge-load');
      const hooks = ['data-bl-glance', 'data-bl-scene', 'data-bl-depot="cement"', 'data-bl-sack', 'data-bl-bed', 'data-bl-weigh', 'data-bl-screen', 'data-bl-barrier', 'data-bl-sign', 'data-bl-free', 'data-bl-free-start', 'data-lab-stepper', 'data-bl-load'];
      for (const hook of hooks) expect(out, hook).toContain(hook);
      expect(out).toContain('data-open="false"');
      expect(out).not.toContain('data-bl-next');
      expect(out).not.toContain('data-bl-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x', 'y', 'kg', 'A', 'B'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('b1 d’abord : un seul compte (ciment) ; b2 : deux (ciment et sable) ; b3 / a1 : deux voies, UNE charge', () => {
    const one = html({ tasks: [L.PRESETS.beginner.tasks[0]], levels: false });
    expect(one).toContain('data-bl-row="x"');
    expect(one).not.toContain('data-bl-row="y"');
    expect(one).not.toContain('data-bl-depot="sand"');
    const two = html({ tasks: [L.PRESETS.beginner.tasks[1]], levels: false });
    expect(two).toContain('data-bl-row="y"');
    expect(two).toContain('data-bl-depot="sand"');
    for (const task of [L.PRESETS.beginner.tasks[2], L.PRESETS.advanced.tasks[0]]) {
      const twin = html({ tasks: [task], levels: false });
      expect(twin).toContain('data-bl-bed="A"');
      expect(twin).toContain('data-bl-bed="B"');
      expect(twin).toContain('data-bl-screen="A"');
      expect(twin).toContain('data-bl-screen="B"');
      expect(twin.match(/data-bl-row="/g)).toHaveLength(1);
    }
  });
  it('chaque tâche se rend (consigne puis UNE question, sans titre)', () => {
    for (const nums of NUMS) {
      for (const task of nums.tasks) {
        const out = html({ tasks: [task], levels: false });
        expect(out, task.id).toContain('data-bl-context');
        expect(out, task.id).toContain('data-bl-prompt');
        expect(out, task.id).not.toMatch(RAW);
        expect(out, task.id).not.toContain('{{');
        // la ligne du camion à vide est peinte sur la benne
        expect(text(out), task.id).toContain(String(L.buildTask(task).laneInfo?.[0].empty ?? L.buildTask(task).empty));
      }
    }
  });
  it('ouvre sur son CONTEXTE puis UNE question (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('حمّل الشاحنة ثمّ اعبر')).toBeGreaterThan(t.indexOf('لافتة الجسر'));
  });
  it('ruleOptions : une seule bonne réponse, deux réfutations, aux deux niveaux', () => {
    for (const adv of [false, true]) {
      const o = ruleOptions(k, adv);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
  it('la tâche du module 2 (K1) se rend seule', () => {
    const out = html({ tasks: [L.K1_TASK], levels: false });
    expect(out).toContain('data-bl-weigh');
    expect(out).not.toMatch(RAW);
  });
});

describe('bridge-load — l’écran et la barrière à partir de l’état de la logique', () => {
  it('le DOM de l’état pesé : la ligne, la comparaison, `data-holds`', () => {
    // le rendu serveur part de l’état initial : l’écran est vide, la barrière baissée, `data-holds` vide
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toMatch(/data-bl-screen="A"[^>]*data-holds=""/);
    expect(out).toContain('data-bl-cmp');
    expect(out).toContain('data-bl-status');
  });
});

describe('bridge-load — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), tag).toHaveLength(1); expect(q.options[0].correct, `${tag} : la bonne réponse n'est jamais la première`).toBeFalsy(); }
    else expect(q.expected, tag).toBeTruthy();
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse jamais première, ni clé brute ni {{', () => {
    for (const nums of NUMS) {
      const s = L.init(nums);
      for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
    }
  });
  it('les chaînes de l’interface FIGÉE et les réponses attendues', () => {
    expect(CHAINS).toEqual({ b1: ['line', 'why20'], b2: ['unknowns'], b3: ['which', 'twenty'], a1: ['howmany'], a2: ['rule'], a3: ['diff'], k1: ['line'] });
    const b = L.init(LV.beginner.numbers);
    expect(QUESTIONS.line(b, b.tasks[0], k).expected).toBe('4750');
    expect(QUESTIONS.which(b, b.tasks[2], k).expected).toBe('30');
    const k1 = L.init({ tasks: [L.K1_TASK] });
    expect(QUESTIONS.line(k1, k1.tasks[0], k).expected).toBe('4600');
    for (const t of b.tasks.concat(L.init(LV.advanced.numbers).tasks)) expect(CHAINS[t.id], t.id).toBeTruthy();
  });
});

describe('bridge-load — mode guidé', () => {
  it('ni la progression ni l’indice sur les tâches à questions ; une tâche hors CHAINS les garde', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', rule: '4000+50x<5000', loads: [15] }], levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
