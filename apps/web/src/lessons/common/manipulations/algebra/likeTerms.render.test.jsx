import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import LikeTerms, { Formal, discoveryOptions, numbersFor, bannerOf, chainOf, QUESTIONS, resultOptions } from './LikeTerms';
import { bundleLayout, fitUnit } from './likeTerms/pieceLayout';
import { LEVELS } from '../levels';
import * as L from '../logic/likeTerms';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<LikeTerms {...props} />);
/** Le texte VISIBLE : sans balises, sans <style>, sans les annotations TeX de KaTeX ni le MathML (doublons invisibles). */
const text = (out) => out
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<math[\s\S]*?<\/math>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[⁦⁩]/g, '')
  .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.likeTerms.${key}`, o);
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const k = (key, o) => say(key, o);

const LV = LEVELS['like-terms'];
const cases = {
  'collect مبتدئ': { level: 'beginner' },
  'collect متقدم': { level: 'advanced' },
  'brackets (defaults)': { world: 'brackets', levels: false },
};

describe('like-terms — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders, no raw key, no {{, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-like-terms');
      expect(out).toContain('data-lt-glance');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(text(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
    });
  }

  it('collect مبتدئ: five bundles on the table, the paper line, the two values equal at x = 3, the free panel open, no trays yet filled', () => {
    const out = html(cases['collect مبتدئ']);
    expect(out).toContain('data-world="collect"');
    expect(out).toContain('data-task="collect-1"');
    expect(out).toContain('data-solved="false"');
    expect(attrs(out, 'data-lt-bundle')).toEqual(['b0', 'b1', 'b2', 'b3', 'b4']);
    expect(attrs(out, 'data-lt-tray')).toEqual(['2', '1', '0']);
    expect(attrs(out, 'data-coef')).toEqual(['0', '0', '0']);
    expect(out).toContain('data-lt-x="3"');
    expect(out).toContain('data-lt-x-less');
    expect(out).toContain('data-lt-x-more');
    expect(attrs(out, 'data-lt-value')).toEqual(['written', 'table']);
    expect(attrs(out, 'data-v')).toEqual(['25', '25']);
    expect(out).toContain('data-lt-line');
    expect(out).not.toContain('data-lt-result');
    expect(out).toContain('data-lt-free');
    expect(attrs(out, 'data-lt-add')).toEqual(['2+', '1+', '0+', '2-', '1-', '0-']);
    expect(out).not.toContain('data-lt-target');
    expect(out).not.toContain('data-lt-exit');
    expect(out).not.toContain('data-lt-check');
    expect(attrs(out, 'data-lt-readout')).toEqual(['2', '1', '0']);
  });

  it('collect متقدم: x² bundles, no running readout, no coefficient setting before everything is sorted', () => {
    const out = html(cases['collect متقدم']);
    expect(out).toContain('data-task="collect-3"');
    expect(attrs(out, 'data-p')).toEqual(['2', '0', '1', '2', '1', '0']);
    expect(attrs(out, 'data-c')).toEqual(['4', '7', '-1', '-2', '5', '-9']);
    expect(out).not.toContain('data-lt-readout');
    expect(out).not.toContain('data-lt-coef=');
  });

  it('brackets: one crate « + » with its two bundles, the two exits, no trays, the line waiting', () => {
    const out = html(cases['brackets (defaults)']);
    expect(out).toContain('data-world="brackets"');
    expect(out).toContain('data-task="plus"');
    expect(attrs(out, 'data-lt-crate')).toEqual(['1']);
    expect(attrs(out, 'data-sign')).toEqual(['1']);
    expect(attrs(out, 'data-lt-exit')).toEqual(['keep', 'flip']);
    expect(out).not.toContain('data-lt-tray');
    expect(attrs(out, 'data-lt-target')).toEqual(['row', 'plus', 'minus']);
    expect(out).not.toContain('manipulation.level'); // never the level selector
  });

  it('opens on its CONTEXT then ONE question (no visible title), and the coach toggle sits before the stage', () => {
    const out = html(cases['collect مبتدئ']);
    const ctx = out.indexOf('data-lab-context');
    const q = out.indexOf('data-lab-question');
    const bench = out.indexOf('data-lt-table');
    expect(ctx).toBeGreaterThan(0);
    expect(q).toBeGreaterThan(ctx);
    expect(bench).toBeGreaterThan(q);
    expect(text(out)).toContain(say('context.collect'));
    expect(text(out)).toContain(say('question.collect'));
    expect(out).toMatch(/<h3 class="sr-only"/);
    expect(out.indexOf('data-lab-coach-toggle')).toBeLessThan(out.indexOf('data-manipulation-stage'));
    expect(say('question.collect').match(/؟/g) ?? []).toHaveLength(0);
    for (const key of ['collect', 'advanced', 'brackets', 'custom']) expect(say(`question.${key}`).split(/[.!؟]/).filter((x) => x.trim()).length).toBe(1);
  });

  it('says each thing ONCE: the gesture line is silent while the coach shows; the question is not repeated in the banner or a hint', () => {
    const lab = L.init({ world: 'collect' });
    expect(bannerOf(lab, k, true).text).toBe('');
    expect(bannerOf(lab, k, false).text).toBe(say('idle.collect'));
    const out = html(cases['collect مبتدئ']);
    const visible = text(out);
    expect(visible.split(say('question.collect')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) {
      expect(say(`hints.collect.${h}`)).not.toBe(say('idle.collect'));
      expect(say(`hints.collect.${h}`)).toMatch(/؟/); // a thinking question, never the gesture again
    }
    expect(say('coach.sort')).not.toBe(say('idle.collect'));
  });

  it('the coach is absent when coach={false}', () => {
    const out = html({ ...cases['collect مبتدئ'], coach: false });
    expect(out).not.toContain('data-lab-coach-toggle');
  });

  it('numbersFor: the preset object itself (the level matcher compares by reference), a lesson’s own tasks, brackets defaults', () => {
    expect(numbersFor({})).toBe(LV.beginner.numbers);
    expect(numbersFor({ level: 'advanced' })).toBe(LV.advanced.numbers);
    const own = [{ id: 'own', expr: [{ c: 1, p: 1 }] }];
    expect(numbersFor({ world: 'collect', tasks: own })).toEqual({ world: 'collect', tasks: own });
    expect(numbersFor({ world: 'brackets' }).tasks.map((t) => t.id)).toEqual(['plus', 'minus', 'both']);
    // the preset is exactly the brief's tasks (logic's defaults)
    expect(LV.beginner.numbers.tasks).toEqual(L.COLLECT_TASKS.beginner);
    expect(LV.advanced.numbers.tasks).toEqual(L.COLLECT_TASKS.advanced);
  });
});

describe('like-terms — strings', () => {
  it('counted pairs carry every plural form', () => {
    for (const f of ['zero', 'one', 'two', 'few', 'many', 'other']) expect(say(`pair_${f}`, { count: 3 })).not.toMatch(RAW);
    expect(say('pair', { count: 2 })).toBe('زوجان');
    expect(say('pair', { count: 4 })).toBe('4 أزواج');
  });
  it('every coach step of the logic has its sentence, and no coach sentence states the rule', () => {
    for (const id of ['sort', 'sortMore', 'x', 'exit', 'exitMore', 'coef', 'check', 'next']) {
      const s = say(`coach.${id}`);
      expect(s, id).not.toMatch(RAW);
      expect(s, id).not.toMatch(/متشابه|معاكس|معامل|نغيّر|تتغيّر إشارة|الجزء الحرفي/);
    }
  });
  it('nothing reachable before the discovery states the rule (questions, idle lines, hints, coach, refusals)', () => {
    const before = ['question.collect', 'question.advanced', 'question.brackets', 'idle.collect', 'idle.brackets', 'idle.coef',
      ...[0, 1, 2].flatMap((i) => [`hints.collect.${i}`, `hints.advanced.${i}`, `hints.brackets.${i}`])];
    for (const key of before) expect(say(key), key).not.toMatch(/متشابه|الجزء الحرفي|نجمع المعاملات|تتغيّر إشارة كلّ/);
  });
  it('every refusal of the logic writes its sentence with the student’s numbers', () => {
    let s = L.init({ world: 'collect' });
    s = L.refuseKind(s, 'b0', 0);
    const b1 = bannerOf(s, k);
    expect(b1.refused).toBe('kind');
    expect(b1.text).toContain('3');
    let r = L.init({ world: 'brackets' });
    r = L.exitTo(r, 'b1', true);
    const b2 = bannerOf(r, k);
    expect(b2.refused).toBe('sign');
    expect(b2.text).toMatch(/10/);
    expect(b2.text).toMatch(/-2/);
    let a = L.init({ world: 'collect', scaffold: false });
    for (const b of L.loose(a)) a = L.sort(a, b.id, b.p);
    a = L.check(a);
    const b3 = bannerOf(a, k);
    expect(b3.refused).toBe('check');
    expect(b3.text).not.toContain('{{');
  });
});

describe('like-terms — discovery and rule come from the student’s own work', () => {
  const solveAll = (s0) => {
    let s = s0;
    for (let guard = 0; guard < 80 && !L.allDone(s); guard += 1) {
      const c = L.coachOf(s);
      const id = c.target.match(/bundle="(b\d+)"/)?.[1];
      if (c.id === 'sort' || c.id === 'sortMore') s = L.sort(s, id, L.bundle(s, id).p);
      else if (c.id.startsWith('exit')) s = L.exitTo(s, id, L.crateOf(s, L.bundle(s, id).crate).sign < 0);
      else if (c.id === 'x') s = L.setX(s, 4);
      else if (c.id === 'coef') { const p = Number(c.target.match(/coef="(\d)"/)[1]); s = L.setCoef(s, p, L.trayCoef(s, p)); }
      else if (c.id === 'check') s = L.check(s);
      else if (c.id === 'next') s = L.nextTask(s);
    }
    return s;
  };
  it('collect: the wrong conjectures are refuted with values at the student’s x; the formal block has his lines', () => {
    const s = solveAll(L.init({ world: 'collect' }));
    expect(L.discoveryReady(s)).toBe(true);
    const opts = discoveryOptions(s, k);
    expect(opts.map((o) => !!o.correct)).toEqual([false, true, false]);
    const why0 = renderToString(opts[0].why);
    expect(why0).toContain('14'); // 3x + 2 at x = 4
    expect(why0).toContain('20'); // 5x at x = 4
    const out = renderToString(<Formal lab={s} k={k} />);
    expect(out).toContain('data-lt-formal="collect"');
    expect(out).toContain('data-lt-rule="sum"');
    expect(out).toContain('data-lt-rule="cancel"');
    expect(out).not.toContain('{{');
  });
  it('brackets: « only the first sign » refuted by a witness; the formal block shows the + and − lines', () => {
    const s = solveAll(L.init({ world: 'brackets' }));
    const opts = discoveryOptions(s, k);
    expect(opts.map((o) => !!o.correct)).toEqual([false, true, false]);
    expect(renderToString(opts[0].why)).toContain('-8');
    const out = renderToString(<Formal lab={s} k={k} />);
    expect(out).toContain('data-lt-rule="plus"');
    expect(out).toContain('data-lt-rule="minus"');
  });
});

describe('like-terms — the drawn pieces are honest', () => {
  it('every piece once, inside the frame, at every count and every x', () => {
    for (const p of [0, 1, 2]) {
      for (let n = 1; n <= 12; n += 1) {
        for (let x = 1; x <= 6; x += 1) {
          const l = bundleLayout({ n, p, x, u: 12 });
          expect(l.pieces).toHaveLength(n);
          for (const q of l.pieces) {
            expect(q.x).toBeGreaterThanOrEqual(0);
            expect(q.y).toBeGreaterThanOrEqual(0);
            expect(q.x + q.w).toBeLessThanOrEqual(l.w + 1e-9);
            expect(q.y + q.h).toBeLessThanOrEqual(l.h + 1e-9);
          }
          if (p === 1) expect(l.pieces[0].h).toBe(x * 12); // the rod IS x long
          if (p === 2) expect(l.pieces[0].w).toBe(x * 12); // the plate's side IS the rod
          if (p === 0) expect(l.pieces[0].w).toBe(12);
        }
      }
    }
  });
  it('the unit shrinks with the screen and stays in 7…18 px', () => {
    const cards = L.COLLECT_TASKS.advanced[0].expr.map((q) => ({ n: Math.abs(q.c), p: q.p }));
    const big = fitUnit({ cards, width: 700, height: 600, extra: 120 });
    const small = fitUnit({ cards, width: 460, height: 340, extra: 120 });
    expect(big).toBeGreaterThan(small);
    expect(small).toBeGreaterThanOrEqual(7);
    expect(big).toBeLessThanOrEqual(18);
  });
});

describe('like-terms — questions pendant le labo (LabCheckpoint)', () => {
  const kk = (key, o) => i18n.t(`lesson:manipulation.likeTerms.${key}`, o);
  const cases = [['beginner', { world: 'collect', scaffold: true, level: 'beginner' }], ['advanced', { world: 'collect', scaffold: false, level: 'advanced' }], ['brackets', { world: 'brackets' }]];
  for (const [name, init] of cases) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = L.init(init);
      lab.tasks.forEach((tk, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, tk.id).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, tk, kk);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${tk.id}.${qid}`).toBeTruthy();
        }
        const r = resultOptions(tk);
        expect(new Set([r.right, ...r.wrong]).size, tk.id).toBe(3);
      });
    });
  }
  it('les nombres viennent de la tâche ; la règle clôt la dernière tâche', () => {
    const b = L.init({ world: 'collect', scaffold: true, level: 'beginner' });
    expect(b.tasks.map((_, i) => chainOf(b, i))).toEqual([['trayCoef', 'result'], ['cancel', 'result', 'rule']]);
    expect(QUESTIONS.trayCoef(b, b.tasks[0], kk).expected).toBe('7');
    expect(QUESTIONS.cancel(b, b.tasks[1], kk).expected).toBe('3');
    const br = L.init({ world: 'brackets' });
    expect(br.tasks.map((_, i) => chainOf(br, i)[0])).toEqual(['plusCrate', 'minusCrate', 'plusCrate']);
    expect(resultOptions(br.tasks[1]).right).toBe('-4x + 14');
  });
});

describe('like-terms — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<LikeTerms {...LEVELS['like-terms'].beginner.numbers} level="beginner" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<LikeTerms {...LEVELS['like-terms'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
