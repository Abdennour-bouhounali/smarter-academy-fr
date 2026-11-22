import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import ShadeMatch, { discoveryOptions, Formal } from './ShadeMatch';
import { LEVELS } from '../levels';
import * as L from '../logic/shadeMatch';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<ShadeMatch {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, (m) => m.replace(/<(?!\/?text)[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.shadeMatch.${key}`, o);
const LV = LEVELS['shade-match'];
const HOOKS = ['data-shade-match', 'data-sm-glance', 'data-sm-stage', 'data-sm-svg', 'data-sm-lever', 'data-sm-drain', 'data-sm-meter', 'data-sm-swatch="ref"', 'data-sm-swatch="second"', 'data-sm-blue', 'data-sm-white', 'data-sm-verdict', 'data-sm-free', 'data-sm-free-a', 'data-sm-free-b', 'data-sm-free-d', 'data-sm-lamp'];

describe('shade-match — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, la scène, le mesureur, le panneau libre ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of HOOKS) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-sm-next');
      expect(out).not.toContain('data-sm-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 't', 'd'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('مبتدئ : le mesureur est visible (aiguille), pas de champs des voisins ; متقدم : le mesureur est voilé, les champs des deux voisins et « أثبّت » sont là', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('data-veiled="false"');
    expect(b).not.toContain('data-sm-below');
    expect(b).not.toContain('data-sm-commit');
    expect(b).toContain('data-sm-impossible');
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a).toContain('data-veiled="true"');
    expect(a).toContain('data-sm-cover');
    expect(a).toContain('data-sm-commit');
    expect(a).toContain('data-sm-below');
    expect(a).toContain('data-sm-above');
  });

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain('في دلو المرجع 3 طلقات أزرق مع 4 علب أبيض، وفي الدلو الثاني 8 علب أبيض.');
    expect(t).toContain(k('question.mix'));
    expect(t).toContain(k('lead'));
    expect(out).toMatch(/<h3 class="sr-only">/);
  });

  it('dit chaque chose UNE fois : la consigne, les compteurs, la question et la phrase d\'attente ne se répètent pas', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.mix'))).toBe(1);
    expect(count(k('counter.blue'))).toBe(1);
    expect(count(k('idle.mix'))).toBe(1);
    expect(count('في دلو المرجع')).toBe(1);
    expect(count(k('free.title'))).toBe(1);
  });

  it('le monde `equal` : quatre seaux candidats, jamais de découverte', () => {
    const out = html({ ...L.PRESETS.equal, levels: false });
    expect(out).toContain('data-world="equal"');
    expect((out.match(/data-sm-candidate=/g) ?? []).length).toBe(4);
    expect(out).not.toContain('data-sm-lever');
    expect(out).not.toContain('data-sm-formal');
    expect(out).not.toMatch(RAW);
    expect(text(out)).toContain('وأمامك أربعة دلاء جاهزة');
  });

  it('a4 compare : deux boutons de prédiction, le mesureur voilé', () => {
    const out = html({ tasks: [LV.advanced.numbers.tasks[3]], levels: false });
    expect(out).toContain('data-sm-pick="first"');
    expect(out).toContain('data-sm-pick="second"');
    expect(out).toContain('data-veiled="true"');
    expect(out).not.toContain('data-sm-lever');
    expect(text(out)).toContain('الدلوان جاهزان: في الأول 7 طلقات أزرق مع 9 علب أبيض');
  });

  it('les grammaires du nombre : طلقة واحدة / طلقتين / n طلقات / n طلقة ; علبة واحدة / علبتين', () => {
    const one = html({ tasks: [{ id: 't', a: 1, b: 2, d: 6 }], levels: false });
    expect(text(one)).toContain('طلقة واحدة أزرق مع علبتين أبيض');
    const many = html({ tasks: [{ id: 't', a: 11, b: 12, d: 13 }], levels: false });
    expect(text(many)).toContain('11 طلقة أزرق مع 12 علبة أبيض');
  });

  it('les réfutations de la découverte citent SES tâches (« +5 » sur s1, 6 < 8 bleus)', () => {
    let s = L.init(LV.beginner.numbers);
    for (let i = 0; i < 3; i += 1) {
      const t = L.taskOf(s);
      s = t.impossible ? L.claimImpossible(L.release(L.dose(L.release(L.dose(s, t.below)), 1))) : L.release(L.dose(s, t.goal));
      s = L.nextTask(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ').replace(/[⁦⁩]/g, '');
    expect(wrong).toContain('7 طلقات');
    expect(wrong).toContain('6 طلقات');
    const formal = renderToString(<Formal lab={s} k={k} />);
    expect(formal).toContain('data-sm-formal');
    expect(formal).toContain('frac');
  });
});

describe('shade-match — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque tâche : chaque question a un texte, une seule bonne réponse, deux indices, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./ShadeMatch');
    const tasks = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks, ...L.PRESETS.equal.tasks];
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
    expect(QUESTIONS.factor(s, byId('s1'), k).expected).toBe('2');          // 3/4 = 6/8
    expect(QUESTIONS.product(s, byId('s2'), k).expected).toBe('18');        // 2 × 9
    expect(QUESTIONS.blueFromProd(s, byId('a1'), k).expected).toBe('15');   // 5 × 18 ÷ 6
    expect(QUESTIONS.reduceRef(s, byId('a3'), k).expected).toBe('3');       // 9/12 = 3/4
    expect(QUESTIONS.crossA(s, byId('a4'), k).expected).toBe('91');
    expect(QUESTIONS.crossB(s, byId('a4'), k).expected).toBe('90');
  });
});

describe('shade-match — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ (questions) : ni la progression ni le bouton d’indice ; les étapes sont un LabStepper', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(b).toContain('data-lab-stepper');
    expect(b).toContain('data-sm-step');
  });
});
