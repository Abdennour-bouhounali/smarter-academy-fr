import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import NumberLinePegs, { discoveryOptions, Formal } from './NumberLinePegs';
import { LEVELS } from '../levels';
import * as L from '../logic/numberLinePegs';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<NumberLinePegs {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.numberLinePegs.${key}`, o);
const LV = LEVELS['number-line-pegs'];
const HOOKS = ['data-number-line-pegs', 'data-npp-glance', 'data-npp-stage', 'data-npp-svg', 'data-npp-rope', 'data-npp-basket', 'data-npp-card', 'data-npp-check', 'data-npp-verdict', 'data-npp-free', 'data-npp-free-a', 'data-npp-kid', 'data-npp-int'];

describe('number-line-pegs — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, la scène, le panneau libre ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of HOOKS) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-npp-next');
      expect(out).not.toContain('data-npp-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 't', 'd', 'N'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('مبتدئ : douzièmes marqués ; متقدم : aucune graduation entre les entiers', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect((b.match(/data-npp-tw/g) ?? []).length).toBeGreaterThan(20);
    expect((a.match(/data-npp-tw/g) ?? []).length).toBe(0);
    expect((b.match(/data-npp-int=/g) ?? []).length).toBe(5);       // w1 : −2 … 2
    expect(b).toContain('data-snap="12"');
    expect(a).toContain('data-snap="48"');
  });

  it('les cartes du panier portent leur écriture, la 1re tâche en a quatre', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect((out.match(/data-npp-card="true"/g) ?? []).length).toBe(4);
    expect(out).toContain('frac');
  });

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain('في سلّة نور');
    expect(t).toContain(k('question.hang'));
    expect(t).toContain(k('lead'));
    expect(out).toMatch(/<h3 class="sr-only">/);
  });

  it('dit chaque chose UNE fois', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.hang'))).toBe(1);
    expect(count(k('free.title'))).toBe(1);
    expect(count('في سلّة نور')).toBe(1);
  });

  it('le monde `writings` : cinq cartes, pas de découverte', () => {
    const out = html({ ...L.PRESETS.writings, levels: false });
    expect(out).toContain('data-world="writings"');
    expect((out.match(/data-npp-card="true"/g) ?? []).length).toBe(5);
    expect(text(out)).toContain(k('question.writings'));
    expect(out).not.toContain('data-npp-formal');
    expect(out).not.toMatch(RAW);
  });

  it('la découverte et la règle écrivent leurs réfutations avec les cartes de w1', () => {
    const opts = discoveryOptions(k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ');
    expect(wrong).toContain('frac');
    expect(wrong.replace(/[⁦⁩]/g, '')).toContain('6');
    const formal = renderToString(<Formal lab={L.init(LV.beginner.numbers)} k={k} />);
    expect(formal).toContain('data-npp-formal');
  });
});

describe('number-line-pegs — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque tâche : chaque question a un texte, une seule bonne réponse, deux indices, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./NumberLinePegs');
    const tasks = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks, ...L.PRESETS.writings.tasks];
    for (const raw of tasks) {
      let s = L.init({ tasks: [raw], world: raw.id === 'k1' ? 'writings' : 'rope' });
      const tk = s.tasks[0];
      expect(CHAINS[tk.id], tk.id).toBeTruthy();
      for (const qid of CHAINS[tk.id]) {
        const q = QUESTIONS[qid](s, tk, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
        expect(out, `${tk.id}.${qid}`).not.toContain('{{');
        expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
        else expect(q.expected).toBeTruthy();
      }
    }
    const s = L.init(LV.beginner.numbers);
    expect(QUESTIONS.stackCount(s, s.tasks[1], k).expected).toBe('3');       // −7/3, 7/(−3), −14/6
    expect(QUESTIONS.pegCount(L.init({ ...L.PRESETS.writings }), L.init({ ...L.PRESETS.writings }).tasks[0], k).expected).toBe('2');
    const a = L.init(LV.advanced.numbers);
    expect(QUESTIONS.commonDen(a, a.tasks[2], k).expected).toBe('12');       // −3/4, −3/4, −5/6
  });
});

describe('number-line-pegs — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ (questions) : ni la progression ni le bouton d’indice ; les étapes sont un LabStepper', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(b).toContain('data-lab-stepper');
    expect(b).toContain('data-npp-step');
  });
});
