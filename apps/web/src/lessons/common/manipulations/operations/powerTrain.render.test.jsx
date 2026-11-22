import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import PowerTrain, { discoveryOptions, discoveryKey, CHAINS, QUESTIONS, chainOf } from './PowerTrain';
import { LEVELS } from '../levels';
import * as L from '../logic/powerTrain';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<PowerTrain {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.powerTrain.${key}`, o);
const LV = LEVELS['power-train'];
const cases = {
  'build beginner': { ...LV.beginner.numbers, level: 'beginner' },
  'build advanced': { ...LV.advanced.numbers, level: 'advanced' },
  couple: { world: 'couple', ...L.PRESETS.couple.beginner, levels: false },
};
/** Le texte visible sans KaTeX (le rendu serveur de MathText écrit aussi du MathML). */
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('power-train — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, the train, the knob slider and −/+; no raw key, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-power-train');
      expect(out).toContain(`data-world="${props.world}"`);
      expect(out).toContain('data-pt-glance');
      expect(out).toContain('data-pt-loco');
      expect(out).toContain('data-pt-knob');
      expect(out).toContain('role="slider"');
      expect(out).toContain('data-pt-less');
      expect(out).toContain('data-pt-more');
      expect(out).toContain('data-pt-readout');
      expect(out).toContain('data-pt-verdict=""');
      expect(out).not.toContain('data-pt-next');
      expect(out).not.toContain('data-pt-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'n', 'm'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title', () => {
    const out = html(cases['build beginner']);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain(k('question.build', { target: '16' }));
    expect(t.indexOf(k('context.build', { a: '−2' }).slice(0, 20))).toBeLessThan(t.indexOf(k('question.build', { target: '16' })));
    expect(out).toContain('class="sr-only"');
  });

  it('build: the empty train carries 1 (loco only), the free panel is always open; the couple world has no free panel', () => {
    const out = html(cases['build beginner']);
    const tag = out.match(/<div[^>]*data-pt-readout[^>]*>/)[0];
    expect(tag).toContain('data-load="1"');
    expect(tag).toContain('data-n="0"');
    expect(out).not.toContain('data-pt-wagon=');
    expect(out).toContain('data-pt-free');
    expect(out).toContain('data-active="false"');
    const c = html(cases.couple);
    expect(c).toContain('data-pt-merged');
    expect(c).toContain('data-exponent="3"');
    expect(c).toContain('data-pt-rail="A"');
    expect(c).not.toContain('data-pt-free');
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated as a hint or under the question', () => {
    const t = text(html(cases['build beginner']));
    const idle = k('idle.build');
    expect(t.split(idle).length - 1).toBe(1);
    for (const h of [0, 1, 2]) expect(k(`hints.build.${h}`)).not.toContain('اسحب');
  });

  it('the coach never states the rule, and discovery options refute with the student’s own trains', () => {
    for (const id of ['grab', 'grabB', 'try', 'tryB', 'divide', 'next']) {
      const s = k(`coach.${id}`);
      expect(s).not.toMatch(/زوجي|فردي|مقلوب|a\^|\\frac/);
    }
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 4); s = L.release(s, 5);
    const opts = discoveryOptions(s, false, k);
    expect(opts.filter((o) => o.correct).length).toBe(1);
    expect(discoveryKey(s, false)).toBe('sign');
    expect(discoveryKey(s, true)).toBe('inverse');
    expect(discoveryKey(L.init({ world: 'couple', ...L.PRESETS.couple.beginner }), false)).toBe('couple');
  });

  it('the textbook-free wording: no student string sends to the book', () => {
    const all = JSON.stringify(i18n.t('lesson:manipulation.powerTrain', { returnObjects: true }));
    expect(all.length).toBeGreaterThan(500);
    expect(all).not.toMatch(/الكتاب|ص \d/);
  });
});

describe('power-train — questions pendant le labo (LabCheckpoint)', () => {
  const worlds = [
    ['build.beginner', { ...LV.beginner.numbers }, false],
    ['build.advanced', { ...LV.advanced.numbers }, true],
    ['couple.beginner', { world: 'couple', ...L.PRESETS.couple.beginner }, false],
    ['couple.advanced', { world: 'couple', ...L.PRESETS.couple.advanced }, true],
  ];
  /** Un labo dont toutes les tâches sont réussies (chaque tâche lâchée sur son exposant). */
  const solvedLab = (numbers) => {
    let s = L.init(numbers);
    s.tasks.forEach((tk, i) => { s = L.release({ ...s, ti: i }, tk.goal); });
    return s;
  };
  it('chaque question de chaque tâche : texte, 2 indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const [tag, numbers, advanced] of worlds) {
      const lab = solvedLab(numbers);
      lab.tasks.forEach((tk, i) => {
        const chain = chainOf(lab, tk, advanced);
        expect(chain, `${tag}.${tk.id}`).toBeTruthy();
        const here = { ...lab, ti: i };
        for (const qid of chain) {
          const q = QUESTIONS[qid](here, tk, k, advanced);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tag}.${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tag}.${tk.id}.${qid}`).toHaveLength(1);
            expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${tag}.${tk.id}.${qid} why`).toBe(true);
            expect(new Set(q.options.map((o) => renderToString(<span>{o.text}</span>))).size, `${tag}.${tk.id}.${qid} distinct`).toBe(q.options.length);
          } else expect(Number(q.expected)).toBeGreaterThan(0);
        }
      });
      expect(Object.keys(CHAINS[tag]).length, tag).toBe(lab.tasks.length);
      expect(chainOf(lab, lab.tasks.at(-1), advanced).at(-1), `${tag} finit par la règle`).toBe('rule');
    }
  });
  it('les nombres : (−2)^4 = 16 donne 4 wagons ; 1/9 en base −3 donne 2 wagons « ÷ » ; 3 + 4 = 7', () => {
    const b = solvedLab(LV.beginner.numbers);
    expect(QUESTIONS.wagons(b, b.tasks[0], k).expected).toBe('4');
    const a = solvedLab(LV.advanced.numbers);
    expect(QUESTIONS.divide(a, a.tasks[2], k).expected).toBe('2');
    const c = solvedLab({ world: 'couple', ...L.PRESETS.couple.beginner });
    expect(QUESTIONS.coupleN(c, c.tasks[0], k).expected).toBe('4');
    const sum = QUESTIONS.sum(c, c.tasks[0], k);
    expect(renderToString(<span>{sum.options.find((o) => o.correct).text}</span>)).toContain('7');
  });
  it('« أعِد التجربة » : la même tâche repart et son drapeau « fait » tombe', () => {
    const s = solvedLab(LV.beginner.numbers);
    expect(s.done[2]).toBe(true);
    const r = L.retryTask({ ...s, ti: 2 });
    expect(r.done[2]).toBeUndefined();
    expect(r.n).toBe(0);
  });
  it('mode guidé : ni la progression ni le bouton d’indice, les étapes et le son sont là', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-pt-step="2"');
    expect(out).toContain('data-manipulation-sound');
    expect(html({ ...LV.beginner.numbers, level: 'beginner', checkpoints: false })).toContain('data-manipulation-progress');
  });
});
