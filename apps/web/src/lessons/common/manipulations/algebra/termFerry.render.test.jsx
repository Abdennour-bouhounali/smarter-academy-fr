import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import TermFerry, { discoveryOptions } from './TermFerry';
import { LEVELS } from '../levels';
import * as L from '../logic/termFerry';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<TermFerry {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.termFerry.${key}`, o);
const LV = LEVELS['term-ferry'];

describe('term-ferry — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, les rives, les caisses, les quais et « جرّب أعدادك » ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-term-ferry');
      expect(out).toContain('data-tf-glance');
      expect(out.match(/data-tf-bank="/g)?.length).toBe(2);
      expect(out.match(/data-tf-dock="/g)?.length).toBe(4);
      expect(out).toContain('data-tf-crate=');
      for (const hook of ['data-tf-paper', 'data-tf-divide', 'data-tf-stepper', 'data-tf-divide-go', 'data-tf-undo', 'data-tf-check', 'data-tf-free', 'data-tf-verdict=""']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-tf-next');
      expect(out).not.toContain('data-tf-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'x', 'n'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9)', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
  });

  it('les réfutations de la découverte citent SES essais', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.move(s, 'R:x', false);
    s = L.move(s, 'R:x', true);
    const opts = discoveryOptions(s, false, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ');
    expect(wrong).toContain('الحلّ الخفيّ');
    const adv = discoveryOptions(L.init(LV.advanced.numbers), true, k);
    expect(adv.filter((o) => o.correct)).toHaveLength(1);
  });
});

describe('term-ferry — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question des suites des deux niveaux : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./TermFerry');
    const plays = {
      beginner: [['R:x', 'L:n', 2], ['R:x', 'L:n', 2]],
      advanced: [['R:x', 'L:n', 4], ['R:x', 'L:n', -5], ['R:x', 'L:n', null]],
    };
    for (const level of ['beginner', 'advanced']) {
      let s = L.init(LV[level].numbers);
      plays[level].forEach(([a, b, c], i) => {
        s = L.move(s, a, true); s = L.move(s, b, true);
        if (c != null) { s = L.divide(L.setC(s, c)); }
        expect(L.taskDone(s), `${level} ${i}`).toBe(true);
        for (const qid of CHAINS[level][i]) {
          const q = QUESTIONS[qid](s, L.taskOf(s), k, level === 'advanced');
          if (qid === 'divideBy' || qid === 'negDivide') expect(q, `${level}.${i}.${qid}`).toBeTruthy();
          if (!q) continue;
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${level}.${i}.${qid}`).not.toMatch(RAW);
          expect(out, `${level}.${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${level}.${i}.${qid}`).toHaveLength(2);
          expect(q.options.filter((o) => o.correct), `${level}.${i}.${qid}`).toHaveLength(1);
          expect(q.options.length, `${level}.${i}.${qid}`).toBeGreaterThanOrEqual(2);
        }
        if (i < plays[level].length - 1) s = L.nextTask({ ...s, checked: true });
      });
    }
  });
});

describe('term-ferry — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ et متقدم : ni la progression ni le bouton d’indice, un LabStepper ; une seule tâche libre : les deux restent', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
    }
    const r = html({ tasks: [{ left: '3x+2', right: 'x+8' }], levels: false });
    expect(r).toContain('data-manipulation-progress');
    expect(r).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
