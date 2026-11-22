import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import WindowBlinds, { CHAINS, QUESTIONS, ruleOptions } from './WindowBlinds';
import { LEVELS } from '../levels';
import * as L from '../logic/windowBlinds';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<WindowBlinds {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.windowBlinds.${key}`, o);
const LV = LEVELS['window-blinds'];

describe('window-blinds — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, fenêtre, deux poignées, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-window-blinds');
      expect(out).toContain('data-wb-glance');
      for (const hook of ['data-wb-scene', 'data-wb-curtain', 'data-wb-blind', 'role="slider"', 'data-wb-ask', 'data-wb-free', 'data-wb-free-a', 'data-wb-free-d', 'data-lab-stepper', 'data-wb-factor="curtain"', 'data-wb-factor="blind"', 'data-wb-less-c', 'data-wb-more-b']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-wb-next');
      expect(out).not.toContain('data-wb-formal');
      expect(out).not.toContain('data-wb-lines');       // jamais de guides avant les deux tirages
      expect(out).not.toContain('data-wb-pane');
      expect(out).not.toContain('data-wb-frame');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : tirages libres, pas de zone d’écriture avant la vérification', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-locked="false"');
    expect(out).not.toContain('data-wb-write');
    expect(out).toContain('data-wb-verdict=""');
  });
  it('متقدم : les tirages sont verrouillés tant que le produit n’est pas écrit', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-locked="true"');
    expect(out).toContain('data-wb-write');
    expect(out).toContain('data-wb-input');
  });
  it('ouvre sur son CONTEXTE puis UNE question (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('اسحب الستارة إلى')).toBeGreaterThan(t.indexOf('تريد المعلّمة'));
  });
  it('ruleOptions : une seule bonne réponse, des réfutations avec les nombres de l’élève', () => {
    for (const tasks of [LV.beginner.numbers.tasks, [{ id: 'k1', curtain: '3/4', blind: '2/5' }]]) {
      const o = ruleOptions(L.init({ tasks }), k);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('window-blinds — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), tag).toHaveLength(1);
    else expect(q.expected, tag).toBeTruthy();
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    const sets = [LV.beginner.numbers, LV.advanced.numbers, { tasks: [{ id: 'k1', curtain: '3/4', blind: '2/5' }] }];
    for (const nums of sets) {
      const s = L.init(nums);
      for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
    }
    const exp = (lv, id, qid) => { const s = L.init(LV[lv].numbers); const t = s.tasks.find((x) => x.id === id); return QUESTIONS[qid](s, t, k).expected; };
    expect(exp('beginner', 'w1', 'panes')).toBe('12');
    expect(exp('beginner', 'w1', 'dark')).toBe('6');
    expect(exp('advanced', 'a1', 'darkPanes')).toBe('6');
  });
});

describe('window-blinds — mode guidé', () => {
  it('ni la progression ni l’indice sur les tâches à questions ; une tâche hors CHAINS les garde', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', curtain: '1/2', blind: '1/2' }], levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
