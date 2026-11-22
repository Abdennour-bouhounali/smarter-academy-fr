import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import PinRails, { discoveryOptions, clipLine } from './PinRails';
import { LEVELS } from '../levels';
import * as L from '../logic/pinRails';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<PinRails {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.pinRails.${key}`, o);
const LV = LEVELS['pin-rails'];

describe('pin-rails — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, le repère, les extrémités de la règle ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-pin-rails');
      expect(out).toContain('data-pr-glance');
      expect(out).toContain('data-pr-plane');
      for (const hook of ['data-pr-end="0"', 'data-pr-end="1"', 'data-pr-readout', 'data-pr-free', 'data-pr-verdict=""', 'data-pr-node="0"']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-pr-next');
      expect(out).not.toContain('data-pr-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 'y', 'O'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('مبتدئ : le premier tableau a ses 4 punaises sur leurs rainures et son tableau de prix', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out.match(/data-pr-pin="/g)?.length).toBe(4);
    expect(out).toContain('data-pr-table');
    expect(out.match(/data-placed="false"/g)?.length).toBe(4);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
  });

  it('متقدم : une lecture montre la règle fixe et la punaise de lecture, sans tableau', () => {
    const out = html({ tasks: LV.advanced.numbers.tasks.slice(2), level: 'advanced' });
    expect(out).toContain('data-pr-read');
    expect(out).toContain('data-pr-rod');
    expect(out).not.toContain('data-pr-table');
  });

  it('clipLine : la droite découpée dans le cadre', () => {
    expect(clipLine(5, 0, 16, 80)).toEqual([[0, 0], [16, 80]]);
    const [p, q] = clipLine(2.5, 10, 16, 80);
    expect(p).toEqual([0, 10]); expect(q[0]).toBe(16); expect(q[1]).toBe(50);
    expect(clipLine(0, 100, 16, 80)).toBeNull();
  });

  it('les réfutations de la découverte citent SES essais', () => {
    let s = { ...L.init(LV.beginner.numbers) };
    s = [10, 30, 60, 70].reduce((st, y, c) => L.placePin(st, c, y), s);
    s = L.nextTask({ ...s, done: { 0: true } });
    s = L.setRodEnd(L.setRodEnd(s, 0, 0), 1, 1);
    s = L.setRodEnd(L.setRodEnd(s, 1, 4), 0, 1);
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ');
    expect(wrong).toContain('10');
  });
});

describe('pin-rails — questions pendant le labo (LabCheckpoint, lot 6)', () => {
  it('chaque tâche des deux niveaux : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./PinRails');
    for (const level of ['beginner', 'advanced']) {
      const base = L.init(LV[level].numbers);
      base.tasks.forEach((tk, i) => {
        let s = { ...base, ti: i, pins: tk.points.map((p) => p.y) };
        // un tableau déjà parcouru : une règle qui a tout touché, une qui a manqué, une alignée sans O
        s = { ...s, trials: [
          { kind: 'rod', task: i, ends: [0, 1], full: true, throughO: true, pinsHit: true, count: 5, total: 5, free: false, cuts: '0', slope: '5' },
          { kind: 'rod', task: i, ends: [1, 2], full: false, throughO: false, pinsHit: true, count: 4, total: 5, free: false, cuts: '10', slope: '2,5' },
          { kind: 'rod', task: i, ends: [2, 3], full: false, throughO: false, pinsHit: false, count: 3, total: 5, free: false, cuts: '8', slope: '3' },
        ] };
        const chain = chainOf(s);
        expect(chain.length, `${level}.${tk.id}`).toBeGreaterThanOrEqual(2);
        expect(chain.includes('rule'), `${level}.${tk.id} rule`).toBe(i === base.tasks.length - 1);
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${level}.${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${level}.${tk.id}.${qid}`).not.toContain('{{');
          expect(out, `${level}.${tk.id}.${qid}`).not.toContain('NaN');
          expect(out, `${level}.${tk.id}.${qid}`).not.toContain('undefined');
          expect(q.hints, `${level}.${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${level}.${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
        }
      });
    }
  });

  it('les réponses attendues viennent des nombres de la tâche : 5 · 1,5 · 10 · 4,5 · 1,5 × 7 · 15 ÷ 1,5', async () => {
    const { QUESTIONS } = await import('./PinRails');
    const b = L.init(LV.beginner.numbers);
    expect(QUESTIONS.unit(b, k).expected).toBe('5');
    expect(QUESTIONS.cuts({ ...b, ti: 1 }, k).expected).toBe('10');
    const a = L.init(LV.advanced.numbers);
    expect(QUESTIONS.unit(a, k).expected).toBe('1,5');
    expect(QUESTIONS.three({ ...a, ti: 2 }, k).expected).toBe('4,5');
    expect(QUESTIONS.numx({ ...a, ti: 3 }, k).expected).toBe('10,5');
    expect(QUESTIONS.numy({ ...a, ti: 4 }, k).expected).toBe('10');
  });

  it('« أعِد التجربة » : la tâche n’est plus jugée, la planche est propre', () => {
    let s = L.init(LV.advanced.numbers);
    s = { ...s, ti: 2 };
    s = L.placeRead(s, 1.5);
    expect(L.taskDone(s)).toBe(true);
    const r = L.retryTask(s);
    expect(L.taskDone(r)).toBe(false);
    expect(r.readPos).toBe(null);
    expect(r.trials).toHaveLength(1);
  });

  it('mode guidé : ni la progression ni le bouton d’indice ; LabStepper à 3 puis 5 pastilles', () => {
    for (const [level, n] of [['beginner', 3], ['advanced', 5]]) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
      expect([...out.matchAll(/data-pr-step="/g)]).toHaveLength(n);
    }
  });
});
