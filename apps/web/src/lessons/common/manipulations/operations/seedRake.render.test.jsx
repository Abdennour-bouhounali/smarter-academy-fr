import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import SeedRake, { discoveryOptions, discoveryPrompt, Formal } from './SeedRake';
import { LEVELS } from '../levels';
import * as L from '../logic/seedRake';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<SeedRake {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, (m) => m.replace(/<(?!\/?text)[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.seedRake.${key}`, o);
const LV = LEVELS['seed-rake'];
const HOOKS = ['data-seed-rake', 'data-sr-glance', 'data-sr-stage', 'data-sr-svg', 'data-sr-rake', 'data-sr-tooth', 'data-sr-bed', 'data-sr-zone', 'data-sr-sign', 'data-sr-ruler', 'data-sr-verdict', 'data-sr-free', 'data-sr-free-pred-n', 'data-sr-kid'];

describe('seed-rake — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, la scène, le panneau libre ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of HOOKS) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-sr-next');
      expect(out).not.toContain('data-sr-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 't', 'd', 'N'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('مبتدئ : le râteau est libre, ± et « ازرع » sont là, l\'étoile et les décomptes n\'y sont pas encore', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-sr-less');
    expect(out).toContain('data-sr-more');
    expect(out).toContain('data-sr-readout');
    expect(out).toContain('data-sr-plant-btn');
    expect(out).toContain('data-locked="false"');
    expect(out).not.toContain('data-sr-star');
    expect(out).not.toContain('data-sr-counts');
    expect(out).not.toContain('data-sr-borderline');
  });

  it('متقدم : le râteau est BLOQUÉ, les champs N et longueur sont là, aucun décompte', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-locked="true"');
    expect(out).toContain('data-sr-predict');
    expect(out).toContain('data-sr-pred-n');
    expect(out).toContain('data-sr-pred-num');
    expect(out).toContain('data-sr-pred-den');
    expect(out).not.toContain('data-sr-less');
    expect(out).not.toContain('data-sr-counts');
    expect(out).not.toContain('data-sr-second');
  });

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain('في حوض طوله');
    expect(t).toContain('للطماطم');
    expect(t).toContain('للفلفل');
    expect(t).toContain(k('question.plant'));
    expect(t).toContain(k('lead'));
    expect(out).toMatch(/<h3 class="sr-only">/);
  });

  it('dit chaque chose UNE fois : la consigne, la question, la phrase d\'attente et le titre du panneau libre', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.plant'))).toBe(1);
    expect(count(k('idle.plant'))).toBe(1);
    expect(count(k('free.title'))).toBe(1);
    expect(count('في حوض طوله')).toBe(1);
  });

  it('le monde `fewest` : une tâche « أوسع مسافة », pas de découverte', () => {
    const out = html({ ...L.PRESETS.fewest, levels: false });
    expect(out).toContain('data-world="fewest"');
    expect(text(out)).toContain(k('question.fewest'));
    expect(out).not.toContain('data-sr-formal');
    expect(out).not.toMatch(RAW);
  });

  it('une récolte et trois zones se disent avec leurs mots', () => {
    const harvest = html({ tasks: [{ id: 'h', terms: [{ p: '3/4' }, { p: '1/6', sub: true }] }], levels: false });
    expect(text(harvest)).toContain('ثم حُصد');
    const three = html({ tasks: [{ id: 't', kind: 'predict', terms: [{ p: '1/2' }, { p: '1/3' }, { p: '1/4' }] }], levels: false });
    expect(text(three)).toContain('للبصل');
    expect((three.match(/data-sr-sign=/g) ?? []).length).toBe(3);
  });

  it('la scène a N + 1 dents (N = 5 au départ) et un seul حوض tant que le total ≤ 1 m', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect((out.match(/data-sr-tooth=/g) ?? []).length).toBe(L.START_N + 1);
    expect((out.match(/data-sr-bed=/g) ?? []).length).toBe(1);
    const over = html({ tasks: [{ id: 'o', terms: [{ p: '5/6' }, { p: '3/8' }] }], levels: false });
    expect((over.match(/data-sr-bed=/g) ?? []).length).toBe(2);
  });

  it('les réfutations de la découverte citent SES essais de g1', () => {
    let s = L.init(LV.beginner.numbers);
    for (const N of [10, 12, 24]) s = L.plant(L.setN(s, N));
    s = L.nextTask(s);
    s = L.plant(L.setN(s, 15)); s = L.nextTask(s);
    s = L.plant(L.setN(s, 12));
    expect(L.discoveryReady(s)).toBe(true);
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ').replace(/[⁦⁩]/g, '');
    expect(wrong).toContain('25');
    expect(wrong).toContain('10');
    expect(text(renderToString(<span>{discoveryPrompt(s, k)}</span>))).toContain('1/12');
    const formal = renderToString(<Formal lab={s} k={k} />);
    expect(formal).toContain('data-sr-formal');
    expect(formal).toContain('frac');
  });
});

describe('seed-rake — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque tâche : chaque question a un texte, une seule bonne réponse, deux indices, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./SeedRake');
    const tasks = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks, ...L.PRESETS.fewest.tasks];
    const s = L.init({ tasks });
    for (const tk of s.tasks) {
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
    const byId = (id) => s.tasks.find((t) => t.id === id);
    expect(QUESTIONS.plantsTotal(s, byId('g1'), k).expected).toBe('5');     // 1/12 : 3 + 2
    expect(QUESTIONS.harvestLeft(s, byId('g3'), k).expected).toBe('7');     // 1/12 : 9 − 2
    expect(QUESTIONS.cells(s, byId('a1'), k).expected).toBe('20');          // 5/6 à 1/24
    expect(QUESTIONS.totalNum(s, byId('a2'), k).expected).toBe('13');       // 7/10 − 4/15 à 1/30
    expect(QUESTIONS.plantsAt(s, byId('f1'), k).expected).toBe('19');       // 9 + 10
  });
});

describe('seed-rake — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ (questions) : ni la progression ni le bouton d’indice ; les étapes sont un LabStepper', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(b).toContain('data-lab-stepper');
    expect(b).toContain('data-sr-step');
  });
});
