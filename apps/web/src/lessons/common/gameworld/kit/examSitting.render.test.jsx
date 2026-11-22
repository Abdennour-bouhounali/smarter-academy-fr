// « الامتحان الأبيض » on screen, served from a toy BANK (bankSitting.js): the subject is the bank's sheet as it is — its
// statement, its formulas, its numbered steps and its points — and money reads « دج ». Server render: the first screen only.
import { describe, it, expect, beforeAll } from 'vitest';
import { renderToString } from 'react-dom/server';
import ExamSitting from './ExamSitting';
import { LessonProvider } from './LessonContext';
import { createBankSittings } from './bankSitting';

globalThis.window = globalThis.window ?? {};

const BANK = [
  {
    id: 'ex-toy-l1-001',
    metadata: { title: 'ثمن الصناديق', estimatedMinutes: 6, exam: { heading: 'التمرين', points: '02,5' } },
    statement: { content: 'ثمن الصندوق 150 DA.', formulas: ['450 = 150 \\times 3'] },
    questions: [
      {
        id: 'q1',
        step: '01',
        lead: 'نشتري 3 صناديق.',
        statement: 'ما المبلغ المدفوع؟',
        answerType: 'rational',
        answerFormat: 'عدد بالدينار (DA)',
        expectedAnswer: '450',
        learningPoints: [{ code: 'g_toy_P1', role: 'primary' }],
        solution: { lines: ['$150 \\times 3 = 450$'], result: '450 \\text{ DA}' },
      },
      {
        id: 'q2',
        step: '02',
        statement: 'بيّن أنّ 150 مضاعف للعدد 3.',
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

  it('prints the sheet as it is, with « دج », its points, and no answer box yet', () => {
    const html = renderToString(
      <LessonProvider lesson={lesson}>
        <ExamSitting game={game} level={1} />
      </LessonProvider>,
    );
    expect(html).toContain('data-xs="read"');
    expect(html).toContain('data-xs-bank="ex-toy-l1-001"');
    expect(html).toContain('دج');
    expect(html).not.toMatch(/(?:\d\$?|\\,|\\text\{)\s*DA(?![A-Za-z])|\(\s*DA\s*\)/);
    expect(html).toContain('نشتري');
    expect(html).toContain('2,5');
    expect(html).not.toContain('data-xs-field'); // reading time: nothing can be answered yet
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
