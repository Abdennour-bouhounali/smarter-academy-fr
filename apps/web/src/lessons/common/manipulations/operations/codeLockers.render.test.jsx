import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import CodeLockers, { chainsOf, QUESTIONS } from './CodeLockers';
import { LEVELS } from '../levels';
import * as L from '../logic/codeLockers';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<CodeLockers {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩‎]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.codeLockers.${key}`, o);
const LV = LEVELS['code-lockers'];
const cases = { beginner: { ...LV.beginner.numbers, level: 'beginner' }, advanced: { ...LV.advanced.numbers, level: 'advanced' }, fraction: { world: 'fraction', levels: false } };
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('code-lockers — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, the hall, the locker, the wheels, the record; no raw key, no Latin prose`, () => {
      const out = html(props);
      for (const m of ['data-code-lockers', 'data-cl-glance', 'data-cl-hall', 'data-cl-locker', 'data-cl-rule', 'data-cl-wheels', 'data-cl-screen', 'data-cl-handle', 'data-cl-record', 'data-cl-free', 'data-cl-verdict=""']) expect(out).toContain(m);
      expect(out).not.toContain('data-cl-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['t', 'r', 'a', 'n', 'b', 'q'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('beginner: a sign wheel and two digit wheels, the rule on the brass plate, the screen multiplies live', () => {
    const out = html(cases.beginner);
    for (const w of ['s', 't', 'u']) expect(out).toContain(`data-cl-wheel="${w}"`);
    expect(out).not.toContain('data-cl-wheel="d1"');
    expect(out).not.toContain('data-cl-commit');
    const t = text(out);
    expect(t).toContain('(−6) × ? = 48');
    expect(t).toContain('(−6) × 0 = 0');
    expect((out.match(/data-cl-small="\d"/g) ?? []).length).toBe(4);
  });

  it('advanced: decimal wheels, the digit wheels are LOCKED until « ثبّت », the screen does not multiply yet', () => {
    const out = html(cases.advanced);
    for (const w of ['s', 'u', 'd1', 'd2']) expect(out).toContain(`data-cl-wheel="${w}"`);
    expect(out).toContain('data-cl-commit');
    expect(out).toMatch(/data-cl-wheel="u" data-value="0" data-locked="true"/);
    expect(out).toMatch(/data-cl-wheel="s" data-value="1" data-locked="false"/);
    expect(text(out)).toContain('(−8) × ? = ?');
  });

  it('fraction world alone: decimal wheels first, no switch before two pulls', () => {
    const out = html(cases.fraction);
    expect(out).toContain('data-cl-wheel="d2"');
    expect(out).not.toContain('data-cl-switch');
    expect(out).not.toContain('data-cl-wheel="ns"');
  });

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    const q = k('question.open');
    expect(t).toContain(q);
    expect(t.indexOf(k('context.goal').slice(0, 20))).toBeLessThan(t.indexOf(q));
    expect(out).toContain('class="sr-only"');
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated in a hint', () => {
    const t = text(html(cases.beginner));
    expect(t.split(k('idle.open')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) expect(k(`hints.${h}`)).not.toContain('اسحب');
  });

  it('the coach never states the rule nor the answer; every coach id has its text', () => {
    for (const id of ['digit', 'sign', 'commit', 'handle', 'switch', 'next']) {
      const v = k(`coach.${id}`);
      expect(v).not.toMatch(/موجب|سالب|الإشارة نفسها|قسمة|\\times/);
      expect(v).not.toMatch(/^lesson:/);
    }
    expect(L.coachOf(L.init(LV.beginner.numbers)).id).toBe('digit');
  });

  it('the textbook-free wording: no student string sends to the book, none states the sign rule', () => {
    const { cp, ...lab } = i18n.t('lesson:manipulation.codeLockers', { returnObjects: true });
    const all = JSON.stringify(lab);
    expect(all.length).toBeGreaterThan(500);
    expect(all).not.toMatch(/الكتاب ص\s*\d|ص \d|اقرأ ما يقوله/);
    expect(JSON.stringify(cp)).not.toMatch(/الكتاب ص\s*\d|ص \d|اقرأ ما يقوله/);
    // le labo n'énonce pas la règle ; seule la DERNIÈRE question du labo (`cp.signsRow`, l'ancienne q2 du module) la fait trouver, et
    // `cp.fracSign` (module 2) vient après qu'elle a été formalisée au module 1
    expect(all).not.toMatch(/نفس الإشارة|الإشارة نفسها|مختلفا الإشارة/);
    const early = Object.fromEntries(Object.entries(cp).filter(([key]) => !['signsRow', 'fracSign'].includes(key)));
    expect(JSON.stringify(early)).not.toMatch(/نفس الإشارة|الإشارة نفسها|مختلفا الإشارة/);
  });
});

describe('code-lockers — questions pendant le labo (LabCheckpoint)', () => {
  const sets = [['beginner', LV.beginner.numbers], ['advanced', LV.advanced.numbers], ['fraction', { world: 'fraction', tasks: L.FRACTION_TASKS }]];
  for (const [name, numbers] of sets) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const base = L.init(numbers);
      const s = { ...base, done: Object.fromEntries(base.tasks.map((_, i) => [i, true])) };
      const chains = chainsOf(s);
      for (const tk of s.tasks) {
        expect(chains[tk.id].length, tk.id).toBeGreaterThanOrEqual(1);
        for (const qid of chains[tk.id]) {
          const q = QUESTIONS[qid](s, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(/manipulation\.[a-zA-Z]/);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
            expect(new Set(q.options.map((o) => renderToString(<>{o.text}</>))).size, `${tk.id}.${qid} distinct`).toBe(3);
          } else expect(Number(String(q.expected).replace(',', '.')), `${tk.id}.${qid}`).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }
  it('les nombres viennent du casier', () => {
    const s = L.init(LV.beginner.numbers);
    expect(chainsOf(s)).toEqual({ m1: ['distance', 'sentence'], m2: ['sentence', 'flip'], m3: ['sentence', 'flip'], m4: ['sentence', 'signsRow'] });
    expect(QUESTIONS.distance(s, s.tasks[0], k).expected).toBe('8');
    const a = L.init(LV.advanced.numbers);
    expect(chainsOf(a).a4).toEqual(['zero']);
  });
});

describe('code-lockers — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html(cases.beginner);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...cases.beginner, checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
