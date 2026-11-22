import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import SignMachine, { discoveryOptions, calcText, chainsOf, QUESTIONS } from './SignMachine';
import { LEVELS } from '../levels';
import * as L from '../logic/signMachine';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<SignMachine {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.signMachine.${key}`, o);
const LV = LEVELS['sign-machine'];
const cases = { beginner: { ...LV.beginner.numbers, level: 'beginner' }, advanced: { ...LV.advanced.numbers, level: 'advanced' } };
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('sign-machine — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, nine columns, the factor card, the free card; no raw key, no Latin prose`, () => {
      const out = html(props);
      const hands = name === 'beginner' ? ['data-sm-knob', 'role="slider"', 'data-sm-less', 'data-sm-more'] : ['data-sm-cards'];
      for (const m of ['data-sign-machine', 'data-sm-glance', 'data-sm-board', 'data-sm-factor', ...hands, 'data-sm-free', 'data-sm-verdict=""']) expect(out).toContain(m);
      expect((out.match(/data-sm-col=/g) ?? []).length).toBe(9);
      expect(out).not.toContain('data-sm-next');
      expect(out).not.toContain('data-sm-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('beginner: only the column 4 is lit, the four negative columns are locked « ؟ »; the first factor is −3', () => {
    const out = html(cases.beginner);
    expect((out.match(/data-lit="true"/g) ?? []).length).toBe(1);
    expect(out).toMatch(/data-sm-col="4" data-lit="true"[^>]*data-product="-12"/);
    expect((out.match(/data-locked="true"/g) ?? []).length).toBe(4);
    expect(out).toContain('data-sm-a-value="-3"');
    expect(out).not.toContain('data-sm-a=""'); // le signe de a n'est pas à la main en مبتدئ
    expect(out).not.toContain('data-sm-gap=');
  });

  it('advanced opens on the prediction cards of a1 (4 cards); the knob is disabled', () => {
    const out = html(cases.advanced);
    for (const c of ['8', '-8', '-6', '-2']) expect(out).toContain(`data-sm-card="${c}"`);
    expect(out).toMatch(/aria-disabled="true"[^>]*data-sm-knob/);
  });

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    const q = k('question.fill', { from: '4', to: '0' });
    expect(t).toContain(q);
    expect(t.indexOf(k('context.machine').slice(0, 20))).toBeLessThan(t.indexOf(q));
    expect(out).toContain('class="sr-only"');
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated in a hint', () => {
    const t = text(html(cases.beginner));
    expect(t.split(k('idle.move')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) expect(k(`hints.${h}`)).not.toContain('اسحب');
  });

  it('the coach never states the rule; a wrong card never shows the answer', () => {
    for (const id of ['grab', 'cards', 'sign', 'try', 'next']) expect(k(`coach.${id}`)).not.toMatch(/موجب|سالب|الإشارة|جداء|\\times/);
    expect(k('v.predictWrong', { pick: '−3' })).not.toMatch(/\{\{|calc/);
  });

  it('calcText: negative factors in brackets, a real minus, never −0', () => {
    expect(calcText(-3, -1)).toBe('(−3) × (−1) = 3');
    expect(calcText(-3, 0)).toBe('(−3) × 0 = 0');
    expect(calcText(2, -3)).toBe('2 × (−3) = −6');
  });

  it('the discovery: one correct option, the two others refuted with the student’s columns', () => {
    for (const lv of ['beginner', 'advanced']) {
      const opts = discoveryOptions(L.init(LV[lv].numbers), k);
      expect(opts.filter((o) => o.correct).length).toBe(1);
      expect(opts.filter((o) => o.why).length).toBe(2);
    }
  });
});

/** Résout toutes les missions d'un niveau par la logique (la main de l'élève). */
function solveAll(numbers) {
  let s = L.init(numbers);
  for (let i = 0; i < s.tasks.length; i += 1) {
    const tk = L.taskOf(s);
    if (tk.kind === 'predict') s = L.choose(s, tk.key);
    else if (tk.kind === 'fill') for (let b = tk.from; b >= tk.to; b -= 1) s = L.release(s, b);
    else if (tk.kind === 'both') { s = L.release(s, L.bFor(s.a, tk.product)); s = L.flipSign(s); s = L.release(s, L.bFor(s.a, tk.product)); }
    else s = L.release(s, L.bFor(tk.a, tk.product));
    if (i < s.tasks.length - 1) s = L.nextTask(s);
  }
  return s;
}

describe('sign-machine — questions pendant le labo (LabCheckpoint)', () => {
  for (const name of ['beginner', 'advanced']) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const s = solveAll(LV[name].numbers);
      expect(L.discoveryReady(s)).toBe(true);
      const chains = chainsOf(s);
      for (const tk of s.tasks) {
        expect(chains[tk.id].length, tk.id).toBeGreaterThanOrEqual(1);
        for (const qid of chains[tk.id]) {
          const q = QUESTIONS[qid](s, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
            expect(new Set(q.options.map((o) => renderToString(<>{o.text}</>))).size, `${tk.id}.${qid} distinct`).toBe(q.options.length);
          } else expect(Number(q.expected), `${tk.id}.${qid}`).toBeGreaterThanOrEqual(0);
        }
      }
      expect(chains[s.tasks.at(-1).id].at(-1)).toBe('rule');
    });
  }
  it('les nombres viennent de la mission résolue', () => {
    const s = solveAll(LV.beginner.numbers);
    expect(chainsOf(s)).toEqual({ m1: ['gap', 'zero'], p1: ['continue', 'next'], m2: ['column', 'rule'] });
    expect(QUESTIONS.next(s, s.tasks[1], k).expected).toBe('6');
    expect(QUESTIONS.gap(s, s.tasks[0], k).options[0].correct).toBe(true);   // a = −3 : le produit MONTE de 3
  });
});

describe('sign-machine — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html(cases.beginner);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...cases.beginner, checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
