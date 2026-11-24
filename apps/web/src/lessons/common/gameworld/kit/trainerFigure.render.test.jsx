// « Entraîne-toi » — a question that carries a FIGURE (`q.figure`, a bank sheet's `statement.figure`): drawn above the question by
// the practice space's own StatementFigure (never a second renderer), never narrower than its 12 px floor
// (`trainerFigure.js`), within the room the trainer has at 1366 × 768. A question without one draws exactly as before:
// a lesson whose trainer existed before the figure gives none and renders none (on the Algerian platform jidhr-tarbii and
// bahth-pgcd; here the one French lesson, decomposer-en-facteurs-premiers).
// Server render.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import Trainer, { QuestionFigure } from './Trainer';
import { LessonProvider } from './LessonContext';
import { trainerFigure, TRAINER_FIGURE } from './trainerFigure';
import { sheetFigure } from './sheetFigure';
import { rng } from './random';
import { SESSION } from './trainer';
import {
  trainer as factors,
  PLAN_OF as FACTORS_PLAN,
} from '../../../college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers/world/trainer';

globalThis.window = globalThis.window ?? {};

/** A Thalès figure as a lesson writes it: a triangle, a parallel cut, its lengths and the one asked — upright (a column). */
const NESTED = {
  points: { A: [4.2, 0], B: [0, 3], C: [0, -4], M: [2.52, 1.2], N: [2.52, -1.6] },
  segments: [
    { from: 'A', to: 'M', label: '6' },
    { from: 'M', to: 'B', label: '9' },
    { from: 'A', to: 'N', label: '8' },
    { from: 'B', to: 'C', label: '25', arrows: 1 },
    { from: 'M', to: 'N', label: '?', arrows: 1, tone: 'indigo', bold: true },
    ['N', 'C'],
  ],
  ariaLabel: 'Triangle ABC, (MN) parallèle à (BC)',
};
const tapQ = (figure) => ({
  format: 'game',
  kind: 'tap',
  prompt: 'Quelle est la longueur $MN$ ?',
  options: [10, 15, 16],
  answer: 10,
  ...(figure ? { figure } : {}),
});
const formQ = (figure) => ({
  format: 'exam',
  kind: 'form',
  prompt: 'Calcule la longueur $MN$.',
  form: {
    tip: 'tipWrite',
    single: 'mn',
    lines: [{ ltr: true, tokens: ['MN', '=', { num: 'mn', label: 'MN', decimal: true }] }],
  },
  ...(figure ? { figure } : {}),
});
const lessonOf = (qs) => ({
  trainer: {
    makeSession: () => qs,
    check: () => ({ ok: true, fix: '' }),
    solution: () => null,
    answerLabel: () => '',
    evidenceOf: () => null,
  },
});
const draw = (lesson, nodeId = 'n') =>
  renderToString(
    <LessonProvider lesson={lesson}>
      <Trainer nodeId={nodeId} />
    </LessonProvider>,
  ).replaceAll('<!-- -->', '');

afterEach(() => vi.restoreAllMocks());

describe('the size of a question’s figure', () => {
  it('a plane figure: never narrower than k × 12 px (its smallest label ≥ 12 px), within the trainer’s room', () => {
    const f = trainerFigure(NESTED);
    expect(f.kind).toBe('plane');
    expect(f.k).toBe(sheetFigure(NESTED).k);
    expect(f.width).toBeGreaterThanOrEqual(Math.ceil(f.k * 12));
    expect(f.label).toBeGreaterThanOrEqual(12);
    expect(f.width).toBeLessThanOrEqual(TRAINER_FIGURE.room.width);
    expect(f.height).toBeLessThanOrEqual(TRAINER_FIGURE.room.height);
    expect(f.fits).toBe(true);
  });

  it('nothing to draw: no figure, a plane figure without points; another kind keeps its natural width', () => {
    expect(trainerFigure(undefined)).toBe(null);
    expect(trainerFigure({ AD: 1 })).toBe(null);
    expect(trainerFigure({ kind: 'tape', maxWidth: 300 })).toMatchObject({ kind: 'tape', width: 300, fits: true });
  });

  it('a figure whose labels need more than the room is said not to fit (the lesson redraws it, never below its floor)', () => {
    // GeoFigure draws a fixed number of units on its longest side: a WIDE figure at its floor is wider than the room (a
    // column beside the question); turned upright, the same figure fits
    const wide = {
      points: { A: [0, 0], B: [6, 0], C: [0, 1] },
      segments: [{ from: 'A', to: 'B', label: '6' }, ['A', 'C'], ['B', 'C']],
      ariaLabel: 'x',
    };
    const f = trainerFigure(wide);
    expect(f.label).toBeGreaterThanOrEqual(12);
    expect(f.fits).toBe(false);
    const upright = { ...wide, points: { A: [0, 0], B: [0, 6], C: [1, 0] } };
    expect(trainerFigure(upright).fits).toBe(true);
    // an angle's label (12 units) asks a wider floor than a length's (13)
    const angled = { ...NESTED, angles: [{ at: 'A', from: 'B', to: 'C', label: '40°' }] };
    expect(trainerFigure(angled).k).toBeGreaterThan(trainerFigure(NESTED).k);
    expect(trainerFigure(angled).label).toBeGreaterThanOrEqual(12);
  });
});

describe('a question that carries a figure', () => {
  it('QuestionFigure draws the figure through StatementFigure (an svg of GeoFigure) with its floor; nothing without one', () => {
    const html = renderToString(<QuestionFigure fig={NESTED} />);
    const f = trainerFigure(NESTED);
    expect(html).toContain('data-di-tr-figure="plane"');
    expect(html).toContain('data-geo-figure');
    expect(html).toContain(`--tr-fig-w:${f.width}px`);
    expect(html).toContain(`--tr-fig-k:${f.k}`);
    expect(html).toContain('max-width:100%');
    expect(renderToString(<QuestionFigure fig={undefined} />)).toBe('');
  });

  it('the game look: the figure above the order and its gates', () => {
    const html = draw(lessonOf([tapQ(NESTED), ...SESSION.slice(1).map(() => tapQ())]));
    const fig = html.indexOf('data-di-tr-figure="plane"');
    expect(fig).toBeGreaterThan(-1);
    expect(fig).toBeLessThan(html.indexOf('di-tap__say'));
    expect(html.indexOf('di-tap__say')).toBeLessThan(html.indexOf('data-di-tr-opt="10"'));
  });

  it('the exam look: the figure above the sheet and its paper gate (the boxes come after « Écris d’abord »)', () => {
    const html = draw(lessonOf([formQ(NESTED), ...SESSION.slice(1).map(() => formQ())]));
    const fig = html.indexOf('data-di-tr-figure="plane"');
    expect(fig).toBeGreaterThan(-1);
    expect(fig).toBeLessThan(html.indexOf('di-sheet__q'));
    expect(fig).toBeLessThan(html.indexOf('data-di-pgate'));
  });

  it('a question without a figure draws no figure box', () => {
    expect(draw(lessonOf(SESSION.map(() => tapQ())))).not.toContain('data-di-tr-figure');
    expect(draw(lessonOf(SESSION.map(() => formQ())))).not.toContain('data-di-tr-figure');
  });
});

describe('the default is unchanged — a lesson whose trainer has no figure', () => {
  for (const [name, trainer, plans] of [['decomposer-en-facteurs-premiers', factors, FACTORS_PLAN]])
    it(`${name}: no question carries a figure, and no card’s trainer draws one`, () => {
      const nodes = [...Object.keys(plans), 'no-such-card'];
      for (const nodeId of nodes)
        for (let seed = 1; seed <= 6; seed += 1) {
          const qs = trainer.makeSession(rng(seed * 31), nodeId);
          expect(qs.some((q) => 'figure' in q)).toBe(false);
        }
      const lesson = { trainer: { ...trainer, evidenceOf: () => null } };
      for (const nodeId of nodes) {
        const r = rng(7);
        vi.spyOn(Math, 'random').mockImplementation(r);
        const html = draw(lesson, nodeId);
        vi.restoreAllMocks();
        expect(html).toContain('data-di-trainer=');
        expect(html).not.toContain('data-di-tr-figure');
      }
    });
});
