import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import CoopCalculator, { CHAINS, QUESTIONS } from './CoopCalculator';
import { LEVELS } from '../levels';
import * as L from '../logic/coopCalculator';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<CoopCalculator {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, (m) => m.replace(/<(?!\/?text)[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.coopCalculator.${key}`, o);
const LV = LEVELS['coop-calculator'];
const HOOKS = ['data-coop-calculator', 'data-coop-glance', 'data-coop-stage', 'data-coop-calc', 'data-coop-display', 'data-coop-keys', 'data-coop-equals', 'data-coop-tape', 'data-coop-verdict', 'data-coop-free', 'data-coop-free-key="="'];

describe('coop-calculator — rendu', () => {
  it('مبتدئ : la scène, la ligne pré-tapée avec ses intervalles, le clavier, le ruban et le panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of [...HOOKS, 'data-coop-gap="0"', 'data-coop-gap="5"', 'data-coop-tok="0"', 'data-coop-key="("', 'data-coop-back', 'data-coop-clear']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-coop-next');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['DA', 'AC', 'ERROR', 'Syntax'].includes(w));
    expect(words).toEqual([]);
  });
  it('متقدم : la ligne est vide, la barre de fraction est sur la carte', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    for (const hook of [...HOOKS, 'data-coop-card="bar"']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-coop-tok="0"');
    expect(out).not.toMatch(RAW);
  });
  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible, et ne dévoile pas la vérité', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain(k('story.k1'));
    expect(t).toContain(k('question.k1'));
    expect(out).not.toContain('data-coop-truth');
    expect(out).toMatch(/<h3 class="sr-only">/);
  });
  it('dit chaque chose UNE fois', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.k1'))).toBe(1);
    expect(count(k('free.title'))).toBe(1);
    expect(count(k('idle.gap'))).toBe(1);
  });
  it('le monde de معارف : un seul exercice, 5 × 20 − 3', () => {
    const out = html({ ...L.PRESETS.alone, levels: false });
    expect(out).toContain('data-coop-tok="4"');
    expect(text(out)).toContain(k('story.m1'));
  });
  it('chaque tâche des deux niveaux a son histoire, sa question, sa carte-vérité et ses messages de refus', () => {
    for (const lv of ['beginner', 'advanced']) for (const tk of LV[lv].numbers.tasks) {
      for (const key of [`story.${tk.id}`, `question.${tk.id}`, `truth.${tk.id}`, `refute.${tk.id}.any`, ...(tk.traps ?? []).map((tp) => `refute.${tk.id}.${tp.key}`)]) expect(k(key), key).not.toMatch(RAW);
    }
    expect(k('refute.m1.any')).not.toMatch(RAW);
  });
});

describe('coop-calculator — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question de chaque tâche : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LV[lv].numbers);
      s.tasks.forEach((tk, i) => {
        for (const qid of CHAINS[tk.id] ?? []) {
          const q = QUESTIONS[qid]({ ...s, ti: i }, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
            q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, `${tk.id}.${qid}`).toBeTruthy());
          } else expect(q.expected, `${tk.id}.${qid}`).toBeTruthy();
        }
      });
    }
  });
  it('les clés numériques sont exactes (k2 → 15) et la vraie option est unique', () => {
    const s = L.init(LV.beginner.numbers);
    expect(QUESTIONS.paid(s, s.tasks[1], k).expected).toBe('15');
    expect(Object.keys(CHAINS)).toEqual(['k2', 'k3', 'k4', 'a1']);
  });
  it('mode guidé : ni la progression ni l\'indice quand une suite de questions existe ; l\'exercice seul garde les deux', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    const r = html({ ...L.PRESETS.alone, levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
