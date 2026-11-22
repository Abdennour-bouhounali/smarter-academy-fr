import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import MarbleRun, { numbersFor, bannerOf, questionOf, contextOf, discoveryOptions, Formal, chainOf, QUESTIONS } from './MarbleRun';
import { LEVELS } from '../levels';
import * as L from '../logic/marbleRun';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<MarbleRun {...props} />);
/** Le texte VISIBLE : sans balises, sans <style>, sans les annotations TeX de KaTeX ni le MathML. */
const text = (out) => out
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<math[\s\S]*?<\/math>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[⁦⁩]/g, '')
  .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.marbleRun.${key}`, o);
const k = say;
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const M = (t) => L.marble(t);
const LV = LEVELS['marble-run'];

const cases = {
  'run مبتدئ': { level: 'beginner' },
  'run متقدم': { level: 'advanced' },
  'twins (defaults)': { world: 'twins', levels: false },
};

describe('marble-run — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders, no raw key, no {{, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-marble-run');
      expect(out).toContain('data-mr-glance');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const visible = text(out).replace(/\b[xy]\b/g, '');
      expect(visible.match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
    });
  }

  it('run مبتدئ: one reservoir, the rack −5…5, the line with its empty slot, no prediction panel, the free panel open', () => {
    const out = html(cases['run مبتدئ']);
    expect(out).toContain('data-world="run"');
    expect(out).toContain('data-task="r1"');
    expect(out).toContain('data-solved="false"');
    expect(attrs(out, 'data-mr-reservoir')).toEqual(['x']);
    expect(attrs(out, 'data-mr-marble')).toEqual(['-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5']);
    expect(attrs(out, 'data-mr-station').length).toBe(2); // mul, add
    expect(out).toContain('data-mr-basket');
    expect(out).toContain('data-mr-line');
    expect(out).not.toContain('data-mr-predict=');
    expect(out).not.toContain('data-mr-predict ');
    expect(out).toContain('data-mr-free');
    expect(attrs(out, 'data-mr-free-card').length).toBe(6);
    expect(out.match(/<button[^>]*data-mr-run[^>]*>/)[0]).toContain('disabled');
  });

  it('run متقدم: the rack adds the rational marbles; r4 has the copier before the press', () => {
    const out = html(cases['run متقدم']);
    expect(out).toContain('data-task="r4"');
    expect(attrs(out, 'data-mr-marble')).toEqual(expect.arrayContaining(['-1/2', '1/2', '-1/3', '2/3', '-1.5']));
    expect(attrs(out, 'data-op')).toEqual(['pow', 'mul', 'sub']);
  });

  it('twins: one reservoir, two walls, three claim buttons, the free pair open', () => {
    const out = html(cases['twins (defaults)']);
    expect(out).toContain('data-world="twins"');
    expect(out).toContain('data-task="tw1"');
    expect(attrs(out, 'data-mr-twin')).toEqual(['a', 'b']);
    expect(attrs(out, 'data-mr-claim')).toEqual(['counter', 'equal']);
    expect(out).toContain('data-mr-expand');
    expect(attrs(out, 'data-mr-reservoir')).toEqual(['x']);
    expect(out).toContain('data-mr-free');
    expect(out).not.toContain('manipulation.level');
  });

  it('opens on its CONTEXT then ONE question (no visible title), and the coach toggle sits before the stage', () => {
    for (const name of Object.keys(cases)) {
      const out = html(cases[name]);
      const ctx = out.indexOf('data-lab-context');
      const q = out.indexOf('data-lab-question');
      const scene = out.indexOf('data-mr-wall');
      expect(ctx, name).toBeGreaterThan(0);
      expect(q, name).toBeGreaterThan(ctx);
      expect(scene, name).toBeGreaterThan(q);
      expect(out).toMatch(/<h3 class="sr-only"/);
      expect(out.indexOf('data-lab-coach-toggle')).toBeLessThan(out.indexOf('data-manipulation-stage'));
    }
    for (const lab of [L.init({ world: 'run' }), L.init({ world: 'run', predict: true }), L.init({ world: 'twins' }), L.setFreeExpr(L.init({ world: 'run' }), '3x-4'), L.setFreeTwins(L.init({ world: 'twins' }), 'a', 'x+1')]) {
      const q = questionOf(lab, k).replace(/[⁦⁩]/g, '');
      expect(q.match(/؟/g) ?? [], q).toHaveLength(0);
      expect(q.split(/[.!؟]/).filter((x) => x.trim()).length, q).toBe(1);
    }
  });

  it('the question names the marble(s) the task asks for', () => {
    expect(questionOf(L.init({ world: 'run' }), k)).toContain('3');
    const r6 = L.init({ world: 'run', tasks: [LV.advanced.numbers.tasks[2]], predict: true });
    const q = questionOf(r6, k).replace(/[⁦⁩]/g, '');
    expect(q).toContain('−1'); expect(q).toContain('4'); expect(q).toContain('خزّان x'); expect(q).toContain('خزّان y');
    expect(contextOf(L.init({ world: 'run' }), k)).toContain('4x+7');
  });

  it('says each thing ONCE: the gesture line is silent while the coach shows; the question is not repeated in the banner or a hint', () => {
    const lab = L.init({ world: 'run' });
    expect(bannerOf(lab, k, true).text).toBe('');
    expect(bannerOf(lab, k, false).text).toBe(say('idle.rack'));
    const out = html(cases['run مبتدئ']);
    expect(text(out).split('ثم اكتب تحت المسار السطر الذي يحسبه حتى يتّفق مع سلّة النتيجة').length - 1).toBe(1);
    for (const key of ['beginner', 'advanced', 'twins']) for (const h of [0, 1, 2]) for (const idle of ['idle.rack', 'idle.predict', 'idle.write', 'idle.twins']) expect(say(`hints.${key}.${h}`)).not.toBe(say(idle));
    for (const id of ['rack', 'slots', 'times', 'run', 'predict', 'drop', 'claim', 'expand']) for (const idle of ['idle.rack', 'idle.predict', 'idle.write', 'idle.twins']) expect(say(`coach.${id}`)).not.toBe(say(idle));
  });

  it('the coach is absent when coach={false}', () => {
    expect(html({ ...cases['run مبتدئ'], coach: false })).not.toContain('data-lab-coach-toggle');
  });

  it('levels: both levels carry the same objective semantics (numbersFor reads the preset by reference)', () => {
    expect(numbersFor({ level: 'beginner' })).toBe(LV.beginner.numbers);
    expect(numbersFor({ level: 'advanced' })).toBe(LV.advanced.numbers);
    expect(numbersFor({ world: 'twins' }).tasks.map((t) => t.id)).toEqual(['tw1', 'tw2', 'tw3']);
  });

  it('banners carry the student numbers: fused 50, the copier −4, the syntax refusal, the stamp', () => {
    const E = (t) => L.marble(t);
    let s = L.run(L.drop(L.init({ world: 'run' }), 'x', E('3')));
    let b = bannerOf(s, k, false);
    expect(b).toMatchObject({ tone: 'rose', reason: 'fused' });
    expect(b.text.replace(/[⁦⁩]/g, '')).toContain('43'); expect(b.text).toContain('3'); expect(b.text).toContain('4');
    s = L.run(L.toggleTimes(s, 0));
    expect(bannerOf(s, k, false)).toMatchObject({ tone: 'emerald', reason: null });
    const r3 = L.init({ world: 'run', tasks: [LV.beginner.numbers.tasks[2]] });
    s = L.drop(r3, 'x', E('-2'));
    s = L.toggleTimes(L.toggleBrackets(s, 1), 1);
    b = bannerOf(L.run(s), k, false);
    expect(b).toMatchObject({ tone: 'rose', reason: 'unbracketed' });
    expect(b.text.replace(/[⁦⁩]/g, '')).toContain('−4'); expect(b.text.replace(/[⁦⁩]/g, '')).toContain('−2');
    const r2 = L.init({ world: 'run', tasks: [LV.beginner.numbers.tasks[1]] });
    b = bannerOf(L.run(L.toggleTimes(L.drop(r2, 'x', E('-2')), 0)), k, false);
    expect(b).toMatchObject({ tone: 'rose', reason: 'syntax' });
  });

  it('twins banners: same-value refusal with the two baskets, notenough, accepted', () => {
    let s = L.dropTwin(L.init({ world: 'twins' }), M('0'));
    const b = bannerOf(L.claim(s, 'counter'), k, false);
    expect(b).toMatchObject({ tone: 'rose', reason: 'same' });
    expect(b.text.replace(/[⁦⁩]/g, '')).toContain('6');
    expect(bannerOf(L.claim(s, 'equal'), k, false).reason).toBe('notenough');
    s = L.dropTwin(s, M('1'));
    expect(bannerOf(L.claim(s, 'counter'), k, false).tone).toBe('emerald');
  });

  it('discovery options: one right, two refutable; the formal rule lists the student lines', () => {
    const lab = L.run(L.drop(L.init({ world: 'run' }), 'x', M('3')));
    const opts = discoveryOptions(lab, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    expect(opts.filter((o) => !o.correct).every((o) => o.why)).toBe(true);
    const solved = L.run(L.toggleTimes(lab, 0));
    const out = renderToString(<Formal lab={solved} k={k} />);
    expect(out).toContain('data-mr-formal');
    expect(text(out)).toContain('4 × 3 + 7 = 19');
  });
});

describe('marble-run — questions pendant le labo (LabCheckpoint)', () => {
  const kk = (key, o) => i18n.t(`lesson:manipulation.marbleRun.${key}`, o);
  const RAWK = /manipulation\.[a-zA-Z]/;
  const cases = [['beginner', { world: 'run' }], ['advanced', { world: 'run', predict: true }], ['twins', { world: 'twins' }]];
  for (const [name, init] of cases) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = L.init(init);
      lab.tasks.forEach((tk, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, tk.id).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, tk, kk);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAWK);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${tk.id}.${qid}`).toBeTruthy();
        }
      });
    });
  }
  it('les nombres viennent de la tâche ; la règle clôt la dernière tâche du parcours', () => {
    const b = L.init({ world: 'run' });
    expect(b.tasks.map((_, i) => chainOf(b, i))).toEqual([['value', 'times'], ['value', 'brackets'], ['value', 'same', 'rule']]);
    expect(QUESTIONS.value(b, b.tasks[0], kk).expected).toBe('19');
    expect(QUESTIONS.value(b, b.tasks[2], kk).expected).toBe('10');
    const a = L.init({ world: 'run', predict: true });
    expect(a.tasks.map((_, i) => chainOf(a, i)[1])).toEqual(['square', 'brackets', 'letters']);
    expect(QUESTIONS.value(a, a.tasks[1], kk).expected).toBe('-4');
    const t = L.init({ world: 'twins' });
    expect(t.tasks.map((_, i) => chainOf(t, i))).toEqual([['atMarble', 'oneEnough'], ['atMarble', 'notProof'], ['expanded', 'noCounter']]);
  });
});

describe('marble-run — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<MarbleRun {...LEVELS['marble-run'].beginner.numbers} level="beginner" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<MarbleRun {...LEVELS['marble-run'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
