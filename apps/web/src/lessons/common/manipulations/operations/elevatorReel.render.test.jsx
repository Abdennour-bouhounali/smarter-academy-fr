import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ElevatorReel, { discoveryOptions, chainsOf, QUESTIONS } from './ElevatorReel';
import { LEVELS } from '../levels';
import * as L from '../logic/elevatorReel';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<ElevatorReel {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.elevatorReel.${key}`, o);
const LV = LEVELS['elevator-reel'];
const cases = { beginner: { ...LV.beginner.numbers, level: 'beginner' }, advanced: { ...LV.advanced.numbers, level: 'advanced' } };
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('elevator-reel — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, the tower, the cabin, the knob slider, −/+ and the record; no raw key, no Latin prose`, () => {
      const out = html(props);
      // متقدم s'ouvre sur les cartes de la prédiction : la ligne du temps et −/+ n'y sont pas encore (rien à manipuler avant la réponse)
      const hands = name === 'beginner' ? ['data-er-knob', 'role="slider"', 'data-er-less', 'data-er-more'] : ['data-er-cards'];
      for (const m of ['data-elevator-reel', 'data-er-glance', 'data-er-cabin', ...hands, 'data-er-record', 'data-er-monitor', 'data-er-pill', 'data-er-free', 'data-er-verdict=""']) expect(out).toContain(m);
      expect(out).not.toContain('data-er-next');
      expect(out).not.toContain('data-er-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['t', 'r', 'a'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('beginner: 19 levels painted with a real minus; the cabin starts at floor 0; no arrows at t = 0', () => {
    const out = html(cases.beginner);
    expect((out.match(/data-er-level=/g) ?? []).length).toBe(19);
    expect(out).toContain('−9');
    expect(out).toMatch(/data-er-cabin="[^"]*"[^>]*data-floor="0"/);
    expect(out).not.toContain('data-er-arrow=');
    expect(out).not.toContain('data-er-speed=""');
    expect(out).toContain('data-er-speed-card');
    expect(out).toContain('data-er-speed-value="-2"');
    expect(out).toContain('data-immersive="off"');
    expect(out).toContain('data-manipulation-immersive-enter');
  });

  it('advanced opens on the prediction cards of a1 (4 cards), no speed lever yet, no arrows', () => {
    const out = html(cases.advanced);
    expect(out).toContain('data-er-cards');
    for (const c of ['6', '-6', '-5', '1']) expect(out).toContain(`data-er-card="${c}"`);
    expect(out).not.toContain('data-er-speed=""');
    expect(out).not.toContain('data-er-play'); // le film attend la prédiction
    expect(out).not.toContain('data-er-arrow=');
  });

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    const q = k('question.floor', { target: '−6' });
    expect(t).toContain(q);
    expect(t.indexOf(k('context.down', { v: k('floors.two') }).slice(0, 20))).toBeLessThan(t.indexOf(q));
    expect(out).toContain('class="sr-only"');
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated in a hint', () => {
    const t = text(html(cases.beginner));
    expect(t.split(k('idle.floor')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) expect(k(`hints.${h}`)).not.toContain('اسحب');
  });

  it('the coach never states the rule; the discovery options refute with the student’s own line', () => {
    for (const id of ['grab', 'left', 'lever', 'cards', 'try', 'next']) expect(k(`coach.${id}`)).not.toMatch(/موجب|سالب|الإشارة|جداء|\\times/);
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 3);
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct).length).toBe(1);
  });

  it('the textbook-free wording: no student string sends to the book', () => {
    const all = JSON.stringify(i18n.t('lesson:manipulation.elevatorReel', { returnObjects: true }));
    expect(all.length).toBeGreaterThan(500);
    expect(all).not.toMatch(/الكتاب|ص \d/);
  });
});

/** Résout toutes les missions d'un niveau par la logique (la main de l'élève). */
function solveAll(numbers) {
  let s = L.init(numbers);
  for (let i = 0; i < s.tasks.length; i += 1) {
    const tk = L.taskOf(s);
    if (tk.kind === 'predict') s = L.choose(s, tk.key);
    else if (tk.kind === 'both') { s = L.release(s, L.timeFor(2, tk.floor, s.step)); s = L.flipSense(s); s = L.release(s, L.timeFor(-2, tk.floor, s.step)); }
    else s = L.release(s, L.timeFor(tk.r, tk.floor, s.step));
    if (i < s.tasks.length - 1) s = L.nextTask(s);
  }
  return s;
}

describe('elevator-reel — questions pendant le labo (LabCheckpoint)', () => {
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
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          else expect(Number(q.expected), `${tk.id}.${qid}`).toBeGreaterThanOrEqual(0);
        }
      }
      expect(chains[s.tasks.at(-1).id].at(-1)).toBe('rule');
    });
  }
  it('les nombres viennent de la mission résolue', () => {
    const s = solveAll(LV.beginner.numbers);
    const chains = chainsOf(s);
    expect(chains.m1).toEqual(['time', 'arrows']);
    expect(chains.m2).toEqual(['time', 'before', 'value']);
    expect(QUESTIONS.value(s, s.tasks[2], k).expected).toBe('4');
    expect(QUESTIONS.distance(s, s.tasks[1], k).expected).toBe('2');
  });
});

describe('elevator-reel — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html(cases.beginner);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...cases.beginner, checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
