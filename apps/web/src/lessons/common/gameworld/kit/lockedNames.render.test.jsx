// « No rule is told … only then its name » (CLAUDE.md, GAME_WORLD.md « A key's name comes after him »): the kit's screens
// that list the lesson's keys — the practice hub « L’espace d’entraînement » and « Ma progression » — never print the name (the tablet's
// title) of a key the student does not hold yet, nor the names of its levels. Server render: the first screen only.
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import PracticeHub from './PracticeHub';
import { ProgressPage } from './Spaces';
import { LessonProvider } from './LessonContext';
import { createLadder, SUMMARY } from './ladder';
import { createJourney, emptyExam } from './journey';
import { KT } from './text';

globalThis.window = globalThis.window ?? {};
// the sound switch reads the game's store (useSyncExternalStore), which a server render cannot: it is not under test here
vi.mock('./parts', async (importOriginal) => ({ ...(await importOriginal()), SoundToggle: () => null }));

const run = { speed: 6, mix: [['k', {}]] };
const nodes = [
  { id: 'first', levels: [run, run] },
  { id: 'second', levels: [run, run] },
  { id: SUMMARY, levels: [run] },
];
const ladder = createLadder({ nodes, generators: { k: () => null }, isRight: () => true });
const journey = createJourney({ keys: ['first', 'second'], ladder, levels: [{ n: 1 }], stages: 2, cards: 2 });
const lesson = {
  keys: ['first', 'second'],
  ladder,
  journey,
  rules: {
    first: { icon: '🔑', title: 'Nom de la première règle', math: ['1'], notes: ['Première note'] },
    second: { icon: '🗝️', title: 'Nom de la deuxième règle', math: ['2'], notes: ['Deuxième note'] },
  },
  text: {
    summary: { icon: '🏆', title: 'Défi du brevet', text: 'Révision' },
    levels: {
      first: ['Course de la première manche A', 'Course de la première manche B'],
      second: ['Course secrète A', 'Course secrète B'],
      [SUMMARY]: ['Course de révision'],
    },
  },
  practiceMap: {
    root: 'Racine de la carte',
    positions: { root: [50, 10], first: [70, 40], second: [30, 40], [SUMMARY]: [50, 80] },
    edges: [
      ['root', 'first', 'Un lieu'],
      ['first', 'second', null],
      ['second', SUMMARY, null, true],
    ],
  },
  cards: { ofKey: {}, ofExercise: {}, fallback: null },
  evidence: { learningPointOf: () => null },
};
const game = {};
// he holds the first key only: the second is not forged yet
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
const render = (el) => renderToString(<LessonProvider lesson={lesson}>{el}</LessonProvider>);
// renderToString escapes no accented letter, but splits adjacent text nodes with comments: compare on the bare text
const textOf = (html) => html.replace(/<!--.*?-->/g, '');

describe('a key not held yet has no name on the kit screens', () => {
  it('the practice hub: the held node shows its name, the locked one shows the neutral label and no level name', () => {
    const html = textOf(render(<PracticeHub s={s} game={game} />));
    expect(html).toContain('Nom de la première règle');
    expect(html).toContain('Course de la première manche A');
    expect(html).not.toContain('Nom de la deuxième règle');
    expect(html).toContain(KT.hidden);
    // the summary node is not a rule: its name stays
    expect(html).toContain('Défi du brevet');
  });

  it('the practice hub: the panel of a locked node does not name its rule nor its levels', () => {
    const html = textOf(render(<PracticeHub s={s} game={game} sel={1} />));
    expect(html).toContain('data-di-panel="second"');
    expect(html).not.toContain('Nom de la deuxième règle');
    expect(html).not.toContain('Course secrète');
    expect(html).toContain(KT.map.locked);
  });

  it('the practice hub: once the key is held, its name appears as before', () => {
    const html = textOf(render(<PracticeHub s={{ ...s, openKeys: ['first', 'second'] }} game={game} sel={1} />));
    expect(html).toContain('Nom de la deuxième règle');
    expect(html).toContain('Course secrète A');
  });

  it('« Ma progression »: a key not earned yet is a locked row without its name', () => {
    const html = textOf(render(<ProgressPage s={s} game={game} lessonId="toy" lessonTitle="Leçon" />));
    expect(html).toContain('data-di-prow="second"');
    expect(html).toContain('Nom de la première règle');
    expect(html).not.toContain('Nom de la deuxième règle');
    expect(html).toContain(KT.hidden);
  });
});
