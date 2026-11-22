import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import WaxCells, { CHAINS, QUESTIONS, ruleOptions } from './WaxCells';
import { LEVELS } from '../levels';
import * as L from '../logic/waxCells';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<WaxCells {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.waxCells.${key}`, o);
const LV = LEVELS['wax-cells'];

describe('wax-cells — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : le rucher, le plateau, le compteur, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-wax-cells');
      for (const hook of ['data-wc-glance', 'data-wc-scene', 'data-wc-tray', 'data-wc-counter', 'data-wc-frame', 'data-wc-free', 'data-wc-free-start', 'data-lab-stepper']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-wc-next');
      expect(out).not.toContain('data-wc-formal');
      expect(out).not.toContain('data-wc-table');       // le tableau n'apparaît qu'à partir de la troisième cellule
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('ouvre sur son CONTEXTE puis UNE question (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('ابنِ صفّ خلية واحدة')).toBeGreaterThan(t.indexOf('يصنع ياسين'));
  });
  it('ruleOptions : une seule bonne réponse, deux réfutations', () => {
    const o = ruleOptions(k);
    expect(o.filter((x) => x.correct)).toHaveLength(1);
    expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
  });
});

describe('wax-cells — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), tag).toHaveLength(1);
    else expect(q.expected, tag).toBeTruthy();
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const nums of [LV.beginner.numbers, LV.advanced.numbers]) {
      const s = L.init(nums);
      for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
    }
    const exp = (lv, id, qid) => { const s = L.init(LV[lv].numbers); const t = s.tasks.find((x) => x.id === id); return QUESTIONS[qid](s, t, k).expected; };
    expect(exp('beginner', 'w1', 'second')).toBe('5');
    expect(exp('beginner', 'w2', 'alone')).toBe('1');
    expect(exp('beginner', 'w3', 'far')).toBe('201');
    expect(exp('advanced', 'a1', 'shared')).toBe('5');
    expect(exp('advanced', 'a3', 'val')).toBe('66');
  });
});

describe('wax-cells — mode guidé', () => {
  it('ni la progression ni l’indice sur les tâches à questions ; une tâche hors CHAINS les garde', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', kind: 'build', targets: [1, 2] }], levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
