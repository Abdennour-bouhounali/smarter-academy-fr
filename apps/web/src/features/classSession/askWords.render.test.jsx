import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import LessonBoard from './LessonBoard';
import { askWords } from './lessonScripts';

// the board's layers (pen, pointer) are portals into `document.body`: no DOM here, they draw nothing
vi.mock('react-dom', async (orig) => ({ ...(await orig()), createPortal: () => null }));
globalThis.document ??= { body: null };

/** An `ask` step draws its cards with its own `words` when it has them, with the planks' words otherwise. */
const noop = () => {};
const plain = {
  id: 'p',
  kind: 'ask',
  chapter: 'On découvre',
  title: 'T',
  text: 'Texte',
  question: 'Question',
  a: 12,
  options: [3, 5],
};
const own = { ...plain, id: 'o', words: { card: 'Nombre de boîtes', held: 'Toutes pleines', fell: 'Il en reste' } };
const board = (step) =>
  renderToString(
    <LessonBoard
      script={{ title: 'Leçon', steps: [{ ...step, answer: [3], cue: 'Q' }] }}
      rules={{}}
      students={[]}
      seating={{}}
      memo={{ step: 0, log: [], readers: [], sealed: false }}
      setMemo={noop}
      onEndTest={noop}
      onExit={noop}
    />,
  );

describe('séance en classe — the words of an « ask » card', () => {
  it('keeps the planks’ words for a step without its own', () => {
    expect(askWords(plain)).toEqual({ card: 'Planche', held: 'Tient', fell: 'S’effondre' });
    expect(board(plain)).toContain('<small>Planche</small>');
  });

  it('labels the cards with the step’s own words, and a word left out keeps the default', () => {
    expect(askWords(own)).toEqual(own.words);
    expect(askWords({ ...plain, words: { card: 'Nombre de bouquets' } })).toEqual({
      card: 'Nombre de bouquets',
      held: 'Tient',
      fell: 'S’effondre',
    });
    const html = board(own);
    expect(html).toContain('<small>Nombre de boîtes</small>');
    expect(html).not.toContain('<small>Planche</small>');
  });
});
