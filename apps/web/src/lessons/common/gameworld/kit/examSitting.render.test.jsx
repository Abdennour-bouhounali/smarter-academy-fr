// « brevet blanc » on screen, served from a toy BANK (bankSitting.js): the subject is the bank's sheet as it is — its
// statement, its formulas, its numbered steps and its points, in French, left to right, money in euros. Server render: the
// first screen only. (How a bank's « DA » is displayed is bankSitting's `cashDj`, tested in kit.test.js.)
import { describe, it, expect, beforeAll } from 'vitest';
import { renderToString } from 'react-dom/server';
import ExamSitting from './ExamSitting';
import { LessonProvider } from './LessonContext';
import { createBankSittings } from './bankSitting';

globalThis.window = globalThis.window ?? {};

const BANK = [
  {
    id: 'ex-toy-l1-001',
    metadata: { title: 'Le prix des caisses', estimatedMinutes: 6, exam: { heading: 'Exercice', points: '02,5' } },
    statement: { content: 'Une caisse coûte 150 €.', formulas: ['450 = 150 \\times 3'] },
    questions: [
      {
        id: 'q1',
        step: '01',
        lead: 'On achète 3 caisses.',
        statement: 'Quelle somme paie-t-on ?',
        answerType: 'rational',
        answerFormat: 'un nombre d’euros',
        expectedAnswer: '450',
        learningPoints: [{ code: 'g_toy_P1', role: 'primary' }],
        solution: { lines: ['$150 \\times 3 = 450$'], result: '450 \\text{ €}' },
      },
      {
        id: 'q2',
        step: '02',
        statement: 'Montre que 150 est un multiple de 3.',
        answerType: 'selfCheck',
        learningPoints: [{ code: 'g_toy_P1', role: 'primary' }],
        solution: { lines: ['$150 = 3 \\times 50$'] },
      },
    ],
  },
];
const sittings = createBankSittings({ lesson: 'toy', load: async () => BANK });
const lesson = { sittings, rules: {}, keys: [], evidence: null };
const game = { paperMode: () => {} };

describe('the exam sitting — a bank sheet on its first screen', () => {
  beforeAll(() => sittings.prepare());

  it('prints the sheet as it is, in euros, with its points and minutes in French, and no answer box yet', () => {
    const html = renderToString(
      <LessonProvider lesson={lesson}>
        <ExamSitting game={game} level={1} />
      </LessonProvider>,
    );
    expect(html).toContain('data-xs="read"');
    expect(html).toContain('data-xs-bank="ex-toy-l1-001"');
    // a word of the subject is its own span (a tap underlines it): the amount and its sign are two neighbours
    expect(html).toMatch(/>150<\/span> <span[^>]*>€\.</);
    expect(html).not.toMatch(/(?:\d\$?|\\,|\\text\{)\s*DA(?![A-Za-z])|\(\s*DA\s*\)/);
    expect(html).toContain('>achète<');
    // the sheet's heading « (2,5 points) » and the subject's line « … · 2,5 points · 6 minutes »
    const text = html.replaceAll('<!-- -->', ''); // React separates two text nodes with a comment
    expect(text).toContain('(2,5 points)');
    expect(text).toContain('6 minutes');
    expect(html).toContain('Temps de lecture');
    expect(html).not.toContain('dir="rtl"');
    // the sitting's own words are French; the subject's title, the level's name and the sheet's heading are written by
    // bankSitting.js (not this screen): they are left out of this check
    const chrome = html
      .replace(/<h2>.*?<\/h2>/, '')
      .replace(/<p>[^<]*<!-- --> · /, '<p>')
      .replace(/<h3>.*?<i>/g, '<h3><i>');
    expect(chrome).not.toMatch(/\p{Script=Arabic}/u);
    expect(html).not.toContain('data-xs-field'); // reading time: nothing can be answered yet
  });

  it("draws a sheet's FIGURE with the practice space's renderer, never narrower than its 12 px floor", async () => {
    const figure = {
      points: { A: [0, 0], B: [6, 0], C: [0, 4], M: [3, 0], N: [0, 2] },
      segments: [['A', 'B'], ['A', 'C'], ['B', 'C'], { from: 'M', to: 'N', label: '2,5 cm' }],
      ariaLabel: 'Triangle ABC, (MN) parallèle à (BC)',
      maxWidth: 300,
    };
    const sheet = {
      ...BANK[0],
      id: 'ex-toy-l1-002',
      statement: { content: 'Sur la figure ci-contre, (MN) // (BC).', figure },
    };
    const withFig = createBankSittings({ lesson: 'toy', load: async () => [sheet] });
    await withFig.prepare();
    const html = renderToString(
      <LessonProvider lesson={{ ...lesson, sittings: withFig }}>
        <ExamSitting game={game} level={1} />
      </LessonProvider>,
    );
    expect(html).toContain('data-xs-figure="plane"');
    expect(html).toContain('data-geo-figure'); // GeoFigure, through StatementFigure — the practice space's own drawing
    expect(html).toContain('aria-label="Triangle ABC, (MN) parallèle à (BC)"');
    expect(html).toContain('2,5 cm');
    expect(html).toMatch(/--xs-fig-natural:300px;--xs-fig-k:\d+(\.\d+)?/);
    // the figure stands beside the statement, inside the sheet of the bank
    expect(html.indexOf('data-xs-figure')).toBeGreaterThan(html.indexOf('data-xs-bank="ex-toy-l1-002"'));
  });

  it('draws no figure box for a sheet without one', () => {
    const html = renderToString(
      <LessonProvider lesson={lesson}>
        <ExamSitting game={game} level={1} />
      </LessonProvider>,
    );
    expect(html).not.toContain('data-xs-figure');
  });

  it('waits for the bank when it is not loaded yet', () => {
    const later = createBankSittings({ lesson: 'toy', load: () => new Promise(() => {}) });
    const html = renderToString(
      <LessonProvider lesson={{ ...lesson, sittings: later }}>
        <ExamSitting game={game} level={1} />
      </LessonProvider>,
    );
    expect(html).toContain('data-xs="loading"');
  });

  it('says a level with nothing to sit is unavailable — no sheet, no clock, a way out', async () => {
    const none = createBankSittings({ lesson: 'toy', load: async () => [] });
    await none.prepare();
    const html = renderToString(
      <LessonProvider lesson={{ ...lesson, sittings: none }}>
        <ExamSitting game={game} level={1} />
      </LessonProvider>,
    );
    expect(html).toContain('data-xs="empty"');
    expect(html).toContain('data-xs-quit-yes');
    expect(html).not.toContain('data-xs-bank');
  });
});
