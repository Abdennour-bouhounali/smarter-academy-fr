// The kit reads LEFT TO RIGHT (French). What the Arabic interface placed « from the right » now starts on the left, and
// nothing turns a screen back to right-to-left: no dir="rtl", no CSS `direction: rtl`, no Arabic font stack, the arrows
// of « next » point right. Each check below pins one place that was mirrored. Server render and the sources on disk.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToString } from 'react-dom/server';
import { ExamLadder, ProgressPage } from './Spaces';
import { LessonProvider } from './LessonContext';
import { createLadder, SUMMARY } from './ladder';
import { createJourney, emptyExam } from './journey';
import { TX } from './text';

globalThis.window = globalThis.window ?? {};
// the sound switch reads the game's store (useSyncExternalStore), which a server render cannot: it is not under test here
vi.mock('./parts', async (importOriginal) => ({ ...(await importOriginal()), SoundToggle: () => null }));

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const read = (p) => readFileSync(here(p), 'utf8');
const ARABIC = /\p{Script=Arabic}/u;

/** The rule of a CSS file whose selector is exactly `selector`. */
const ruleOf = (css, selector) => {
  const at = css.indexOf(`${selector} {`);
  expect(at, selector).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf('}', at));
};

describe('the CSS of the kit reads left to right', () => {
  const files = [
    './examSitting.css',
    './ruleForge.css',
    ...readdirSync(here('./styles'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => `./styles/${f}`),
  ];
  it.each(files)('%s: no direction: rtl, no Arabic font, no Arabic word', (f) => {
    const css = read(f);
    expect(css).not.toMatch(/direction:\s*rtl/);
    expect(css).not.toMatch(/Cairo|Tajawal|Amiri|Scheherazade|Noto (Naskh|Kufi)/);
    expect(css).not.toMatch(ARABIC);
  });

  it('the exam ladder rises from the LEFT: its grid is not turned right to left', () => {
    expect(ruleOf(read('./styles/spaces.css'), '.di-rungs')).not.toMatch(/direction/);
  });

  it('the progress dots of the top bar run left to right', () => {
    expect(ruleOf(read('./styles/world.css'), '.di-steps')).not.toMatch(/direction/);
  });

  it('the action buttons keep the reading order of the page', () => {
    expect(ruleOf(read('./styles/world.css'), '.di-actions')).not.toMatch(/direction/);
  });

  it('the recall of the island before stands at the START (left), where the reading begins', () => {
    const r = ruleOf(read('./styles/world.css'), '.di-recall');
    expect(r).toMatch(/inset-inline-start:\s*1rem/);
    expect(r).not.toMatch(/\bright:/);
  });
});

describe('the screens of the kit carry no right-to-left and no Arabic', () => {
  const sources = [
    'ExamSitting.jsx',
    'ExamSittingLeaves.jsx',
    'Trainer.jsx',
    'RuleForge.jsx',
    'Paper.jsx',
    'KnowledgePage.jsx',
    'Spaces.jsx',
    'PracticeHub.jsx',
    'End.jsx',
    'Title.jsx',
    'Tablet.jsx',
    'Instruction.jsx',
    'Result.jsx',
    'parts.jsx',
    'Fit.jsx',
    'GateRunHud.jsx',
    'LessonWorld.jsx',
    'LessonContext.jsx',
    'text.js',
  ];
  it.each(sources)('%s', (f) => {
    const src = read(`./${f}`);
    expect(src).not.toMatch(/dir=["{]['"]?rtl/);
    expect(src).not.toMatch(/'rtl'/);
    expect(src).not.toMatch(ARABIC);
  });

  it('« next » points right: no screen draws a left arrow after « next »', () => {
    for (const f of ['Trainer.jsx', 'Paper.jsx', 'KnowledgePage.jsx', 'Spaces.jsx'])
      expect(read(`./${f}`), f).not.toMatch(/ArrowLeft/);
  });
});

const run = { speed: 6, mix: [['k', {}]] };
const ladder = createLadder({
  nodes: [
    { id: 'first', levels: [run] },
    { id: SUMMARY, levels: [run] },
  ],
  generators: { k: () => null },
  isRight: () => true,
});
const levels = [1, 2, 3].map((n) => ({ n, title: `Titre ${n}` }));
const sittings = {
  levels,
  ready: () => true,
  prepare: () => Promise.resolve(),
  available: () => true,
  levelPoints: () => '2,5',
  levelMinutes: () => 1,
};
const lesson = {
  keys: ['first'],
  ladder,
  journey: { ...createJourney({ keys: ['first'], ladder, levels, stages: 1, cards: 1 }), examOpen: () => true },
  sittings,
  rules: { first: { icon: '🔑', title: 'Règle', notes: ['note'] } },
  cards: { ofKey: {}, ofExercise: {}, fallback: null },
  evidence: { learningPointOf: () => null },
};
const s = {
  openKeys: ['first'],
  keys: ['first'],
  practice: {},
  stage: 1,
  know: { read: [], sealed: [] },
  exam: emptyExam(),
  tally: {},
  phase: 'title',
};
const render = (el) => renderToString(<LessonProvider lesson={lesson}>{el}</LessonProvider>).replace(/<!--.*?-->/g, '');

describe('the exam ladder and the progress page, left to right', () => {
  it('the ladder: level 1 first (on the left), then 2, then 3 — with « Palier », minutes and points in French', () => {
    const html = render(<ExamLadder s={s} game={{}} />);
    const at = [1, 2, 3].map((n) => html.indexOf(`data-di-exam-level="${n}"`));
    expect(at[0]).toBeGreaterThan(-1);
    expect(at[0]).toBeLessThan(at[1]);
    expect(at[1]).toBeLessThan(at[2]);
    expect(html).toContain('1 minute');
    expect(html).toContain('2,5 points');
    expect(html).toContain(TX.spaces.passAt);
    expect(html).not.toMatch(ARABIC);
  });

  it('the progress page: « Ensuite : … » then an arrow that points right', () => {
    const html = render(<ProgressPage s={s} game={{}} lessonId="toy" lessonTitle="Leçon" />);
    const btn = html.match(/<button[^>]*data-di-next-step[^>]*>(?:(?!<\/button>).)*<\/button>/)[0];
    expect(btn).toMatch(new RegExp(`^<button[^>]*>${TX.progress.next}`));
    expect(btn).toMatch(/lucide-arrow-right/);
    expect(btn).not.toMatch(/lucide-arrow-left/);
    expect(html).toMatch(/\d %/);
    expect(html).not.toMatch(ARABIC);
  });
});

describe('the words of the kit agree with their number', () => {
  it('minutes and points: 1 is singular, 2 and a range are plural, a decimal under 2 is singular', () => {
    expect(TX.spaces.minutes(1)).toBe('1 minute');
    expect(TX.spaces.minutes(5)).toBe('5 minutes');
    expect(TX.spaces.minutes('10–15')).toBe('10–15 minutes');
    expect(TX.spaces.points(1)).toBe('1 point');
    expect(TX.spaces.points('1,5')).toBe('1,5 point');
    expect(TX.spaces.points('2,5')).toBe('2,5 points');
    expect(TX.spaces.points('2–2,5')).toBe('2–2,5 points');
    expect(TX.progress.tries(1, 4)).toBe('1 réussite sur 4');
    expect(TX.progress.tries(3, 4)).toBe('3 réussites sur 4');
  });
});
