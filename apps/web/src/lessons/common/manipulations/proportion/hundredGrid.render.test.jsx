import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import HundredGrid, { discoveryOptions } from './HundredGrid';
import { LEVELS } from '../levels';
import * as L from '../logic/hundredGrid';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<HundredGrid {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.hundredGrid.${key}`, o);
const LV = LEVELS['hundred-grid'];

describe('hundred-grid — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, la grille de 100 cases, le panier fermé, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-hundred-grid');
      expect(out).toContain('data-hg-glance');
      expect(out.match(/data-hg-cell="/g)?.length).toBe(100);
      for (const hook of ['data-hg-grid', 'role="slider"', 'data-hg-basket', 'data-hg-paint', 'data-hg-go', 'data-hg-readout', 'data-hg-free', 'data-hg-less10', 'data-hg-more10', 'data-hg-clear']) expect(out, hook).toContain(hook);
      expect(out).toContain('data-hg-verdict=""');
      expect(out).not.toContain('data-hg-next');
      expect(out).not.toContain('data-hg-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 't'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible ; le panier est fermé', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out).toContain('data-revealed="false"');
    expect(out).toContain(k('legend.unknown'));
  });

  it('la tâche rate montre le panier en direct (sans réponse écrite)', () => {
    const out = html({ tasks: [{ kind: 'rate', x: '150', part: '60' }], level: 'beginner' });
    expect(out).toContain('data-revealed="true"');
    expect(out).not.toContain('data-hg-guess');
  });

  it('les réfutations de la découverte citent SES essais', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.go(L.setGuess(L.setT(s, 15), '36'));
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ');
    expect(wrong).toContain('240');
    expect(wrong).toContain('225');
  });
});

describe('hundred-grid — questions pendant le labo (LabCheckpoint, lot 6)', () => {
  it('chaque tâche des deux niveaux : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./HundredGrid');
    for (const level of ['beginner', 'advanced']) {
      const base = L.init(LV[level].numbers);
      base.tasks.forEach((tk, i) => {
        const s = { ...base, ti: i };
        const chain = chainOf(s);
        expect(chain.length, `${level}.${tk.id}`).toBeGreaterThanOrEqual(2);
        expect(chain.includes('rule'), `${level}.${tk.id} rule`).toBe(i === base.tasks.length - 1);
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${level}.${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${level}.${tk.id}.${qid}`).not.toContain('{{');
          expect(out, `${level}.${tk.id}.${qid}`).not.toContain('NaN');
          expect(q.hints, `${level}.${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${level}.${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
        }
      });
    }
  });

  it('les réponses attendues viennent des nombres de la tâche (la case 2,4 ; 72 ; 115 ; 80 ; 1,4)', async () => {
    const { QUESTIONS } = await import('./HundredGrid');
    const b = L.init(LV.beginner.numbers);
    expect(QUESTIONS.cell(b, k).expected).toBe('2,4');
    expect(QUESTIONS.double(b, k).expected).toBe('72');
    expect(QUESTIONS.cell({ ...b, ti: 1 }, k).expected).toBe('1,5');
    expect(QUESTIONS.fraction({ ...b, ti: 1 }, k).expected).toBe('40/100');
    expect(QUESTIONS.cells({ ...b, ti: 2 }, k).expected).toBe('115');
    expect(QUESTIONS.cells({ ...b, ti: 3 }, k).expected).toBe('80');
    const a = L.init(LV.advanced.numbers);
    expect(QUESTIONS.cell({ ...a, ti: 2 }, k).expected).toBe('1,4');
  });

  it('« أعِد التجربة » : la tâche n’est plus faite et le plateau est propre', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.setT(s, 15);
    s = L.setGuess(s, '36');
    s = L.go(s);
    expect(L.taskDone(s)).toBe(true);
    const r = L.retryTask(s);
    expect(L.taskDone(r)).toBe(false);
    expect(r.t).toBe(0);
    expect(r.guess).toBe('');
    expect(r.trials).toHaveLength(1);
  });

  it('mode guidé : ni la progression ni le bouton d’indice ; LabStepper à 4 puis 5 pastilles', () => {
    for (const [level, n] of [['beginner', 4], ['advanced', 5]]) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
      expect([...out.matchAll(/data-hg-step="/g)]).toHaveLength(n);
    }
  });
});
