import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as E from '@smarter-academy/core/arithmetic/expansion.js';
import AreaSplit, { Formal, discoveryOptions, numbersFor, bannerOf, chainOf, QUESTIONS, expandOptions } from './AreaSplit';
import { LEVELS } from '../levels';
import * as L from '../logic/areaSplit';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<AreaSplit {...props} />);
/** Le texte VISIBLE : sans balises, sans <style>, sans les annotations TeX de KaTeX ni le MathML (doublons invisibles). */
const text = (out) => out
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<math[\s\S]*?<\/math>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[⁦⁩]/g, '')
  .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.areaSplit.${key}`, o);
const k = (key, o) => say(key, o);
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const LV = LEVELS['area-split'];

const cases = {
  'plot مبتدئ': { level: 'beginner' },
  'plot متقدم': { level: 'advanced' },
  'arrows (defaults)': { world: 'arrows', levels: false },
};

describe('area-split — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders, no raw key, no {{, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-area-split');
      expect(out).toContain('data-as-glance');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(text(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
    });
  }

  it('plot مبتدئ: the lawn with its cut handle (w only, h is a constant), no patch cards yet, both meters, the free panel open', () => {
    const out = html(cases['plot مبتدئ']);
    expect(out).toContain('data-world="plot"');
    expect(out).toContain('data-task="p1"');
    expect(out).toContain('data-solved="false"');
    expect(attrs(out, 'data-as-cut')).toEqual(['w']);
    expect(out).not.toContain('data-as-patch=');
    expect(out).toContain('data-as-cards-wait');
    expect(attrs(out, 'data-as-meter')).toEqual(['whole', 'parts']);
    expect(out).toContain('data-as-x="6"');
    expect(out).toContain('data-as-x-less');
    expect(out).toContain('data-as-x-more');
    expect(out).toContain('data-as-free');
    expect(attrs(out, 'data-as-free-row')).toEqual(['h', 'w']);
    expect(out).toContain('data-as-line');
    expect(out).not.toContain('data-as-brace');
    expect(out).not.toContain('data-as-check');
    expect(attrs(out, 'data-v')).toContain('30'); // 3 × (6 + 4)
  });

  it('plot متقدم: two handles, no brace, no area pill, no coefficient setting before the signs', () => {
    const out = html(cases['plot متقدم']);
    expect(out).toContain('data-task="p3"');
    expect(attrs(out, 'data-as-cut')).toEqual(['w', 'h']);
    expect(out).not.toContain('data-as-area');
    expect(out).not.toContain('data-as-coef=');
  });

  it('arrows: the written expression in chips, the origins and the targets numbered over the line, no card before the first arrow', () => {
    const out = html(cases['arrows (defaults)']);
    expect(out).toContain('data-world="arrows"');
    expect(out).toContain('data-task="a1"');
    expect(attrs(out, 'data-as-origin')).toEqual(['0']);
    expect(attrs(out, 'data-as-target')).toEqual(['0', '1']);
    expect(out).toContain('data-as-cards-wait');
    expect(out).not.toContain('data-as-product=');
    expect(out).not.toContain('data-as-arrow=');
    expect(out).toContain('data-as-x="5"');
    expect(out).not.toContain('manipulation.level'); // never the level selector
  });

  it('opens on its CONTEXT then ONE question (no visible title), and the coach toggle sits before the stage', () => {
    for (const [name, key] of [['plot مبتدئ', 'beginner'], ['plot متقدم', 'advanced'], ['arrows (defaults)', 'arrows']]) {
      const out = html(cases[name]);
      const ctx = out.indexOf('data-lab-context');
      const q = out.indexOf('data-lab-question');
      const scene = out.indexOf(name.startsWith('arrows') ? 'data-as-arrows-scene' : 'data-as-plot');
      expect(ctx, name).toBeGreaterThan(0);
      expect(q, name).toBeGreaterThan(ctx);
      expect(scene, name).toBeGreaterThan(q);
      expect(text(out)).toContain(say(`question.${key}`));
      expect(out).toMatch(/<h3 class="sr-only"/);
      expect(out.indexOf('data-lab-coach-toggle')).toBeLessThan(out.indexOf('data-manipulation-stage'));
    }
    for (const key of ['beginner', 'advanced', 'arrows', 'custom.plot', 'custom.arrows']) {
      expect(say(`question.${key}`).match(/؟/g) ?? [], key).toHaveLength(0);
      expect(say(`question.${key}`).split(/[.!؟]/).filter((x) => x.trim()).length, key).toBe(1);
    }
  });

  it('says each thing ONCE: the gesture line is silent while the coach shows; the question is not repeated in the banner or a hint', () => {
    const lab = L.init({ world: 'plot' });
    expect(bannerOf(lab, k, true).text).toBe('');
    expect(bannerOf(lab, k, false).text).toBe(say('idle.plot.cut'));
    const out = html(cases['plot مبتدئ']);
    expect(text(out).split(say('question.beginner')).length - 1).toBe(1);
    for (const key of ['beginner', 'advanced', 'arrows']) {
      for (const h of [0, 1, 2]) {
        for (const idle of ['idle.plot.cut', 'idle.plot.sign', 'idle.plot.reduce', 'idle.arrows.arrow']) expect(say(`hints.${key}.${h}`)).not.toBe(say(idle));
      }
    }
    for (const id of ['cut', 'sign', 'arrow']) expect(say(`coach.${id}`)).not.toBe(say(`idle.${id === 'arrow' ? 'arrows' : 'plot'}.${id === 'arrow' ? 'arrow' : id}`));
  });

  it('the coach is absent when coach={false}', () => {
    expect(html({ ...cases['plot مبتدئ'], coach: false })).not.toContain('data-lab-coach-toggle');
  });

  it('a lead sentence from the lesson REPLACES the default context of the authored level only', () => {
    const out = html({ level: 'beginner', lead: 'جملة السياق من الدرس' });
    expect(text(out)).toContain('جملة السياق من الدرس');
  });

  it('numbersFor: the preset object itself (the level matcher compares by reference), a lesson’s own tasks, arrows defaults', () => {
    expect(numbersFor({})).toBe(LV.beginner.numbers);
    expect(numbersFor({ level: 'advanced' })).toBe(LV.advanced.numbers);
    const own = [{ id: 'own', h: { m: 0, n: 5 }, w: { m: 1, n: 1 } }];
    expect(numbersFor({ world: 'plot', tasks: own })).toEqual({ world: 'plot', tasks: own });
    expect(numbersFor({ world: 'arrows' }).tasks.map((t) => t.id)).toEqual(['a1', 'a2', 'a3', 'a4']);
    expect(LV.beginner.numbers.tasks).toEqual(L.PLOT_TASKS.beginner);
    expect(LV.advanced.numbers.tasks).toEqual(L.PLOT_TASKS.advanced);
  });
});

describe('area-split — strings', () => {
  it('every coach step of the logic has its sentence, and none states the rule', () => {
    for (const id of ['cut', 'sign', 'signMore', 'x', 'arrow', 'arrowMore', 'productSign', 'coef', 'check', 'next']) {
      const s = say(`coach.${id}`);
      expect(s, id).not.toMatch(RAW);
      expect(s, id).not.toMatch(/كلّ حدّ يضرب|جداء سالبين|نعيد|تُوزَّع|توزيع/);
    }
  });
  it('nothing reachable before the discovery states the rule (questions, idle lines, hints, coach, refusals)', () => {
    const before = ['question.beginner', 'question.advanced', 'question.arrows', 'idle.plot.cut', 'idle.plot.sign', 'idle.arrows.arrow',
      ...[0, 1, 2].flatMap((i) => [`hints.beginner.${i}`, `hints.advanced.${i}`, `hints.arrows.${i}`])];
    for (const key of before) expect(say(key), key).not.toMatch(/جداء عددين سالبين|كلّ حدّ في القوس الأول يضرب|نشر|توزيع/);
  });
  it('every refusal of the logic writes its sentence with the student’s numbers', () => {
    let s = L.cutTo(L.init({ world: 'plot' }), 'w', 8);
    const b1 = bannerOf(s, k);
    expect(b1.refused).toBe('cut');
    expect(b1.text).toContain('8');
    expect(b1.text).toContain('2');
    expect(b1.text).toContain('x + 4');
    s = L.decide(L.cutTo(L.init({ world: 'plot', tasks: [L.PLOT_TASKS.beginner[1]] }), 'w', 3), 'p01', 1);
    const b2 = bannerOf(s, k);
    expect(b2.refused).toBe('sign');
    expect(b2.text).toMatch(/6/);
    expect(b2.text).toMatch(/18/);
    let a = L.init({ world: 'arrows', tasks: [L.ARROW_TASKS[2]] });
    a = L.setProductSign(L.link(a, 0, 1), '0>1', 1);
    const b3 = bannerOf(a, k);
    expect(b3.refused).toBe('sign');
    expect(b3.text).toContain('-30');
    expect(b3.text).toContain('30');
    const b4 = bannerOf(L.link(L.link(a, 0, 1), 0, 1), k);
    expect(b4.refused).toBe('arrow');
    expect(b4.text).not.toContain('{{');
    let c = L.init({ world: 'plot', scaffold: false, level: 'advanced' });
    c = L.cutTo(L.cutTo(c, 'w', 6), 'h', 6);
    for (const p of c.patches) c = L.decide(c, p.id, p.sign);
    c = L.check(c);
    const b5 = bannerOf(c, k);
    expect(b5.refused).toBe('coef');
    expect(b5.text).not.toContain('{{');
  });
});

describe('area-split — discovery and rule come from the student’s own work', () => {
  const solveAll = (s0) => {
    let s = s0;
    for (let guard = 0; guard < 300 && !L.allDone(s); guard += 1) {
      const c = L.coachOf(s);
      if (!c) break;
      if (c.id.startsWith('cut')) s = L.cutTo(s, c.side, E.cutRight(L.sideOf(s, c.side), s.x));
      else if (c.id.startsWith('sign')) s = L.decide(s, c.patch, L.patchOf(s, c.patch).sign);
      else if (c.id === 'x') s = L.setX(s, s.x + 1);
      else if (c.id.startsWith('arrow')) s = L.link(s, c.from, c.to);
      else if (c.id === 'productSign') s = L.setProductSign(s, c.arrow, E.arrowSign(s.arrows.find((a) => a.id === c.arrow)));
      else if (c.id === 'coef') s = L.setCoef(s, c.power, E.coefOf(L.expansionTerms(s), c.power));
      else if (c.id === 'check') s = L.check(s);
      else if (c.id === 'next') s = L.nextTask(s);
    }
    return s;
  };
  it('plot: the wrong conjectures are refuted with the meters at two x; the formal block has his lines and the corner', () => {
    const s = solveAll(L.init({ world: 'plot', scaffold: false, level: 'advanced' }));
    expect(L.discoveryReady(s)).toBe(true);
    const opts = discoveryOptions(s, k);
    expect(opts.map((o) => !!o.correct)).toEqual([false, true, false]);
    const w = L.plotWitness(s);
    const why0 = renderToString(opts[0].why);
    expect(why0).toContain(String(w.a.whole));
    const out = renderToString(<Formal lab={s} k={k} />);
    expect(out).toContain('data-as-formal="plot"');
    for (const r of ['area', 'k', 'kk', 'each', 'corner', 'lines', 'value']) expect(out).toContain(`data-as-rule="${r}"`);
    expect(out).not.toContain('{{');
  });
  it('arrows: both wrong readings are refuted by a value at x; the formal block lists the four expansions', () => {
    const s = solveAll(L.init({ world: 'arrows' }));
    const opts = discoveryOptions(s, k);
    expect(opts.map((o) => !!o.correct)).toEqual([false, true, false]);
    const w = L.arrowWitness(s);
    expect(renderToString(opts[0].why)).toContain(String(w.first.wrong).replace('-', ''));
    const out = renderToString(<Formal lab={s} k={k} />);
    expect(out).toContain('data-as-formal="arrows"');
    expect(out).not.toContain('data-as-rule="corner"');
    expect(out).not.toContain('{{');
  });
});

describe('area-split — the x pill', () => {
  it('is a spin button with the live range, − / + and ← →', () => {
    const out = html(cases['plot مبتدئ']);
    expect(out).toContain('role="spinbutton"');
    expect(out).toContain('aria-valuenow="6"');
    expect(out).toContain('aria-valuemin="4"');
    expect(out).toContain('aria-valuemax="9"');
    expect(html(cases['arrows (defaults)'])).toContain('aria-valuemin="2"');
  });
});

describe('area-split — questions pendant le labo (LabCheckpoint)', () => {
  const kk = (key, o) => i18n.t(`lesson:manipulation.areaSplit.${key}`, o);
  const cases = [['beginner', { world: 'plot', scaffold: true, level: 'beginner' }], ['advanced', { world: 'plot', scaffold: false, level: 'advanced' }], ['arrows', { world: 'arrows' }]];
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
        const e = expandOptions(tk);
        expect(new Set([e.right, e.onlyFirst, e.other]).size, tk.id).toBe(3);
      });
    });
  }
  it('les nombres viennent de la tâche ; la règle clôt la dernière tâche', () => {
    const b = L.init({ world: 'plot', scaffold: true, level: 'beginner' });
    expect(chainOf(b, 1).at(-1)).toBe('rule');
    expect(QUESTIONS.value(b, b.tasks[0], kk).expected).toBe(String(3 * (b.x + 4)));
    expect(expandOptions(b.tasks[1]).right).toBe('2x - 6');
    const a = L.init({ world: 'arrows' });
    expect(QUESTIONS.arrows(a, a.tasks[2], kk).expected).toBe('4');
    expect(expandOptions(a.tasks[3]).right).toBe('-7x + 10');
  });
});

describe('area-split — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html({ ...LEVELS['area-split'].beginner.numbers, level: 'beginner' });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...LEVELS['area-split'].beginner.numbers, level: 'beginner', checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
