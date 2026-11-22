import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import GearCrank, { discoveryOptions, Formal } from './GearCrank';
import { LEVELS } from '../levels';
import * as L from '../logic/gearCrank';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<GearCrank {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, (m) => m.replace(/<(?!\/?text)[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.gearCrank.${key}`, o);
const LV = LEVELS['gear-crank'];
const HOOKS = ['data-gear-crank', 'data-gc-glance', 'data-gc-stage', 'data-gc-crank', 'data-gc-teeth-less', 'data-gc-teeth-more', 'data-gc-pedal', 'data-gc-wheel', 'data-gc-flag', 'data-gc-verdict', 'data-gc-free', 'data-gc-free-f', 'data-gc-free-r', 'data-gc-free-target', 'role="slider"'];

describe('gear-crank — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, la scène, deux compteurs, le panneau libre ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of HOOKS) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-gc-next');
      expect(out).not.toContain('data-gc-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 't', 'F', 'R'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('نموذج m1 : le plateau de 48 dents et le pignon de 24 sont dessinés avec leurs dents', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-gc-gear="48"');
    expect(out).toContain('data-gc-gear="24"');
    expect(out).toContain('data-gc-valve');
  });

  it('مبتدئ : les compteurs sont lisibles en direct (0) ; متقدم : la manivelle est bloquée et la prédiction attendue', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).toContain('data-veiled="false"');
    expect(b).not.toContain('data-gc-predict');
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(a).toContain('data-gc-predict');
    expect(a).toContain('data-gc-predict-num');
    expect(a).toContain('data-gc-predict-den');
    expect(a).toContain('data-gc-go');
    expect(a).toContain('data-locked="true"');
    expect(a).toContain('data-gc-lock');
    expect(a).toContain('disabled');
  });

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain('على درّاجة النادي صحنٌ أمامي فيه 48 سنًّا وترسٌ خلفي فيه 24 سنًّا');
    expect(t).toContain('العلم على بُعد 3 دورات للعجلة');
    expect(t).toContain(k('question.ride'));
    // ni titre visible : le titre du shell est sr-only
    expect(out).toMatch(/<h3 class="sr-only">/);
  });

  it('dit chaque chose UNE fois : la consigne, les titres des compteurs et la question ne se répètent pas', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.ride'))).toBe(1);
    expect(count(k('counter.pedal'))).toBe(1);
    expect(count(k('counter.wheel'))).toBe(1);
    expect(count(k('idle.ride'))).toBe(1);
    expect(count('على درّاجة النادي')).toBe(1);
    expect(count(k('free.title'))).toBe(1);
  });

  it('le monde `reverse` : les deux tâches, jamais de découverte, le contexte « نقلت لينا السلسلة » à la 2e', () => {
    const out = html({ ...L.PRESETS.reverse, levels: false });
    expect(out).toContain('data-world="reverse"');
    expect(out).toContain('data-gc-step="1"');
    expect(out).not.toContain('data-gc-formal');
    expect(out).not.toMatch(RAW);
    expect(text(out)).toContain('العلم على بُعد دورة واحدة للعجلة');
    expect(k('context.moved', { F: 24, R: 40, turns: 'x' })).toContain('نقلت لينا السلسلة');
  });

  it('les grammaires du nombre de tours : دورة واحدة / دورتين / n دورات / n دورة / fraction', () => {
    const one = html({ tasks: [{ id: 't', F: 24, R: 24, target: '1' }], levels: false });
    expect(text(one)).toContain('العلم على بُعد دورة واحدة للعجلة');
    const frac = html({ tasks: [{ id: 't', F: 36, R: 48, target: '9/2' }], levels: false });
    expect(text(frac)).toContain('9/2 دورة للعجلة');
    const two = html({ tasks: [{ id: 't', F: 24, R: 24, target: '2' }], levels: false });
    expect(text(two)).toContain('دورتين للعجلة');
  });

  it('les réfutations de la découverte citent SES tâches (m1 : 3 → 3/2, m2 : 6 → 8, 6 × 3/4 = 9/2)', () => {
    let s = L.init(LV.beginner.numbers);
    for (let i = 0; i < 3; i += 1) { s = L.release(L.turnTo(s, L.taskOf(s).goalTeeth)); s = L.nextTask(s); }
    expect(L.discoveryReady(s)).toBe(true);
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ').replace(/[⁦⁩]/g, '');
    expect(wrong).toContain('3 دورات');
    expect(wrong).toContain('3/2 دورة');
    expect(wrong).toContain('5 دورات');
    expect(wrong).toContain('9/2');
    const formal = renderToString(<Formal lab={s} k={k} />);
    expect(formal).toContain('data-gc-formal');
    expect(formal).toContain('frac');
  });
});

describe('gear-crank — questions pendant le labo (LabCheckpoint)', () => {
  it('m1 · m2 · m3 : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./GearCrank');
    let s = L.init(LV.beginner.numbers);
    for (let i = 0; i < 3; i += 1) { s = L.release(L.turnTo(s, L.taskOf(s).goalTeeth)); if (i < 2) s = L.nextTask(s); }
    for (const tk of s.tasks) {
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
    expect(QUESTIONS.read(s, s.tasks[1], k).expected).toBe('8');
    expect(QUESTIONS.read(s, s.tasks[2], k).expected).toBe('4/3');
    expect(QUESTIONS.compare(s, s.tasks[0], k).options[0].correct).toBe(true);   // 3/2 < 3 : la pédale tourne MOINS
  });
});

describe('gear-crank — questions des mondes `reverse` et متقدم (lot 5)', () => {
  it('chaque question des suites r1 r2 et a1 … a4b : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./GearCrank');
    for (const [tag, numbers] of [['reverse', { ...L.PRESETS.reverse }], ['advanced', LV.advanced.numbers]]) {
      const base = L.init(numbers);
      const s0 = { ...base, done: Object.fromEntries(base.tasks.map((_, i) => [i, true])) };
      base.tasks.forEach((tk, i) => {
        const s = { ...s0, ti: i };
        expect(CHAINS[tk.id], `${tag}.${tk.id}`).toBeTruthy();
        for (const qid of CHAINS[tk.id]) {
          const q = QUESTIONS[qid](s, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tag}.${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tag}.${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
        }
      });
    }
    const rv = L.init({ ...L.PRESETS.reverse });
    const sr = { ...rv, done: { 0: true, 1: true }, ti: 1 };
    expect(QUESTIONS.read({ ...sr, ti: 0 }, rv.tasks[0], k).expected).toBe('3/5');
    expect(QUESTIONS.read(sr, rv.tasks[1], k).expected).toBe('5/3');
    expect(QUESTIONS.compare({ ...sr, ti: 1 }, rv.tasks[1], k).options[1].correct).toBe(true);   // 5/3 > 1 : la pédale tourne PLUS
  });
});

describe('gear-crank — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ, `reverse` et متقدم (questions) : ni la progression ni le bouton d’indice ; des tâches hors `CHAINS` (sans questions) : les deux restent', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    for (const numbers of [{ ...L.PRESETS.reverse, levels: false }, { ...LV.advanced.numbers, level: 'advanced' }]) {
      const out = html(numbers);
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', F: 24, R: 32, target: '6' }], levels: false });
    expect(r).toContain('data-manipulation-progress');
    expect(r).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
