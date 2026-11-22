import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ChainCutter, { CHAINS, QUESTIONS } from './ChainCutter';
import { LEVELS } from '../levels';
import * as L from '../logic/chainCutter';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<ChainCutter {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.chainCutter.${key}`, o);
const LV = LEVELS['chain-cutter'];
const HOOKS = ['data-cutter="true"', 'data-cutter-glance', 'data-cutter-board', 'data-cutter-free', 'data-cutter-free-input', 'data-cutter-verdict'];

describe('chain-cutter — rendu', () => {
  it('مبتدئ : le ruban, « ثبّت », les autocollants, la phrase et le panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of [...HOOKS, 'data-cutter-strip', 'data-cutter-pin', 'data-cutter-sticker="مجموع"', 'data-cutter-sentence', 'data-cutter-tok="0"']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-cutter-staple=');
    expect(out).not.toContain('data-cutter-scissors');
    expect(out).not.toContain('data-cutter-next');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []);
    expect(words).toEqual([]);
  });
  it('متقدم : la première tâche coupe à agrafes cachées, ciseaux disponibles', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    for (const hook of [...HOOKS, 'data-cutter-scissors']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-cutter-staple=');
    expect(out).not.toContain('data-cutter-pin');
    expect(out).not.toMatch(RAW);
  });
  it('le collage : cartes, opérations, deux mshbaks, ألصق et تراجع', () => {
    const out = html({ tasks: L.PRESETS.advanced.tasks.slice(2, 3), levels: false });
    for (const hook of ['data-cutter-block="n0"', 'data-cutter-op-chip="÷"', 'data-cutter-clip="l"', 'data-cutter-clip="r"', 'data-cutter-glue', 'data-cutter-undo']) expect(out, hook).toContain(hook);
    expect(out).not.toMatch(RAW);
  });
  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible, et ne dévoile pas la racine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain(k('question.c1'));
    expect(out).toMatch(/<h3 class="sr-only">/);
    expect(out).not.toContain('data-cutter-named');
  });
  it('dit chaque chose UNE fois', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.c1'))).toBe(1);
    expect(count(k('free.title'))).toBe(1);
  });
  it('le monde de معارف : un seul ruban', () => {
    const out = html({ ...L.PRESETS.alone, levels: false });
    expect(out).toContain('data-cutter-tok="6"');
    expect(text(out)).toContain(k('question.m1'));
  });
  it('chaque tâche des deux niveaux a son histoire et sa question', () => {
    for (const lv of ['beginner', 'advanced']) for (const tk of LV[lv].numbers.tasks) for (const key of [`story.${tk.id}`, `question.${tk.id}`]) expect(k(key), key).not.toMatch(RAW);
    for (const key of ['v.cutOk', 'v.staple', 'v.stapleSame', 'v.name', 'v.glueNo', 'free.why.negative', 'coach.cut', 'pocket.divisor']) expect(k(key), key).not.toMatch(RAW);
  });
});

describe('chain-cutter — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    const s = L.init(LV.beginner.numbers);
    for (const tid of Object.keys(CHAINS)) for (const qid of CHAINS[tid]) {
      const q = QUESTIONS[qid](s, s.tasks[0], k);
      const out = renderToString(<div>{q.prompt}{q.options.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, qid).not.toMatch(RAW);
      expect(out, qid).not.toContain('{{');
      expect(q.hints, qid).toHaveLength(2);
      expect(q.options.filter((o) => o.correct), qid).toHaveLength(1);
      q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy());
    }
    expect(Object.keys(CHAINS)).toEqual(['c1', 'c4', 'c5', 'c6', 'a3']);
  });
  it('mode guidé : ni la progression ni l\'indice quand une suite existe ; l\'exercice seul garde les deux', () => {
    expect(html({ ...LV.beginner.numbers, level: 'beginner' })).not.toContain('data-manipulation-progress');
    expect(html({ ...L.PRESETS.alone, levels: false })).toContain('data-manipulation-progress');
  });
});
