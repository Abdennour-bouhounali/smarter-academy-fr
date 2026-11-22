import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import RobotTrack, { chainsOf, QUESTIONS } from './RobotTrack';
import { LEVELS } from '../levels';
import * as L from '../logic/robotTrack';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<RobotTrack {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[\u2066\u2069\u200E]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.robotTrack.${key}`, o);
const LV = LEVELS['robot-track'];
const cases = { beginner: { ...LV.beginner.numbers, level: 'beginner' }, advanced: { ...LV.advanced.numbers, level: 'advanced' }, square: { world: 'square', levels: false } };
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('robot-track — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, the mat, the robot, the record; no raw key, no Latin prose`, () => {
      const out = html(props);
      for (const m of ['data-robot-track', 'data-rt-glance', 'data-rt-robot', 'data-rt-post', 'data-rt-program', 'data-rt-record', 'data-rt-free', 'data-rt-verdict=""']) expect(out).toContain(m);
      expect(out).not.toContain('data-rt-next');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['t', 'r', 'a', 'n'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('beginner: the tray holds the card −1, the placed card 5 is in slot 0, the flag stands at −5, no side cards', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-rt-tray');
    expect(out).toMatch(/data-rt-card="m1-t0"[^>]*data-v="−1"/);
    expect(out).toMatch(/data-rt-card="m1-p0"[^>]*data-v="5"/);
    expect(out).toContain('data-flag="-5"');
    expect(out).not.toContain('data-rt-sides');
  });

  it('advanced opens on the prediction: side cards, distance stepper, a disabled « شغّل », and NO arcs, no running line', () => {
    const out = html(cases.advanced);
    for (const m of ['data-rt-sides', 'data-rt-left', 'data-rt-right', 'data-rt-dist', 'data-rt-run']) expect(out).toContain(m);
    expect(out).not.toContain('data-rt-arc=');
    expect(out).not.toContain('data-rt-line');
    expect(out).not.toContain('data-rt-tray');
  });

  it('square alone: the number stepper and a « لا يمكن » button, the card shown twice', () => {
    const out = html(cases.square);
    for (const m of ['data-rt-a', 'data-rt-impossible']) expect(out).toContain(m);
    expect((out.match(/data-rt-card="f\d"/g) ?? []).length).toBe(2);
  });

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    const q = k('question.place', { target: '−5' });
    expect(t).toContain(q);
    expect(t.indexOf(k('context.goal').slice(0, 20))).toBeLessThan(t.indexOf(q));
    expect(out).toContain('class="sr-only"');
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated in a hint', () => {
    const t = text(html(cases.beginner));
    expect(t.split(k('idle.place')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) expect(k(`hints.${h}`)).not.toContain('اسحب');
  });

  it('the coach never states the rule; every coach id has its text', () => {
    for (const id of ['tray', 'sign', 'swap', 'side', 'run', 'repeat', 'square', 'impossible', 'next']) {
      const v = k(`coach.${id}`);
      expect(v).not.toMatch(/فردي|زوجي|موجب|سالب|جداء|\\times/);
      expect(v).not.toMatch(/^lesson:/);
    }
    let s = L.init(LV.beginner.numbers);
    expect(L.coachOf(s).id).toBe('tray');
  });

  it('the textbook-free wording: no student string sends to the book', () => {
    const all = JSON.stringify(i18n.t('lesson:manipulation.robotTrack', { returnObjects: true }));
    expect(all.length).toBeGreaterThan(500);
    expect(all).not.toMatch(/الكتاب|ص \d/);
  });
});

/** Un labo dont chaque mission est résolue par un programme qui l'atteint (les nombres de la mission). */
function solvedLab(numbers, programmes) {
  const s = L.init(numbers);
  const solved = {}; const done = {}; const record = [];
  s.tasks.forEach((tk, i) => {
    done[i] = true;
    const p = programmes[tk.id];
    if (Array.isArray(p)) {
      const stop = L.text(L.finalOf(p));
      solved[i] = { stop, negatives: L.negativesOf(p), values: p };
      record.push({ sig: `${tk.id}:x`, task: i, taskId: tk.id, values: p, stop, negatives: L.negativesOf(p) });
    } else solved[i] = p ?? {};
  });
  return { ...s, solved, done, record, tried: { neg: true, pos: true, vals: [3, -3, 1.5, -1.5] } };
}
const PROGRAMMES = {
  m1: ['5', '-1'], m2: ['5', '-1', '-1'], m3: ['2', '3', '-4'], m4: ['-2', '-3', '4'],
  a1: ['-2', '3', '-1', '-4', '0,5'], a2: ['4', '-0,5', '-5', '2'], a3: { reached: { '-3': 1, 3: 2 } },
  q1: { claimed: true }, q2: { a: [1.5, -1.5] },
};
const kk = (key, o) => i18n.t(`lesson:manipulation.robotTrack.${key}`, o);

describe('robot-track — questions pendant le labo (LabCheckpoint)', () => {
  const cases = [['beginner', LEVELS['robot-track'].beginner.numbers], ['advanced', LEVELS['robot-track'].advanced.numbers], ['square', { world: 'square', tasks: L.SQUARE_TASKS }]];
  for (const [name, numbers] of cases) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const s = solvedLab(numbers, PROGRAMMES);
      const chains = chainsOf(s);
      for (const tk of s.tasks) {
        expect(chains[tk.id].length, tk.id).toBeGreaterThanOrEqual(1);
        for (const qid of chains[tk.id]) {
          const q = QUESTIONS[qid](s, tk, kk);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(/manipulation\.[a-zA-Z]/);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          else expect(Number(q.expected), `${tk.id}.${qid}`).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }
  it('les nombres viennent du programme de l’élève', () => {
    const s = solvedLab(LEVELS['robot-track'].beginner.numbers, PROGRAMMES);
    expect(chainsOf(s)).toEqual({ m1: ['jump', 'opposite'], m2: ['back', 'negCount'], m3: ['negCount', 'order'], m4: ['negCount', 'parity'] });
    expect(QUESTIONS.negCount(s, s.tasks[3], kk).expected).toBe('2');
    const sq = solvedLab({ world: 'square', tasks: L.SQUARE_TASKS }, PROGRAMMES);
    expect(QUESTIONS.sqValue(sq, sq.tasks[0], kk).expected).toBe('9');
  });
});

describe('robot-track — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const props = { ...LEVELS['robot-track'].beginner.numbers, level: 'beginner' };
    const g = renderToString(<RobotTrack {...props} />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<RobotTrack {...props} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
