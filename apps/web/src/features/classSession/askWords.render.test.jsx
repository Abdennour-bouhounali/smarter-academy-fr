import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import LessonBoard from './LessonBoard';
import { askWords } from './lessonScripts';

// the board's layers (pen, pointer) are portals into `document.body`: no DOM here, they draw nothing
vi.mock('react-dom', async (orig) => ({ ...(await orig()), createPortal: () => null }));
globalThis.document ??= { body: null };

/** An `ask` step draws its cards with its own `words` when it has them, with the planks' words otherwise. */
const noop = () => {};
const plain = { id: 'p', kind: 'ask', chapter: 'نكتشف', title: 'ت', text: 'ن', question: 'س', a: 12, options: [3, 5] };
const own = { ...plain, id: 'o', words: { card: 'عدد العلب', held: 'تمتلئ كلّها', fell: 'يبقى شيء' } };
const board = (step) =>
  renderToString(
    <LessonBoard
      script={{ title: 'درس', steps: [{ ...step, answer: [3], cue: 'س' }] }}
      rules={{}}
      students={[]}
      seating={{}}
      memo={{ step: 0, log: [], readers: [], sealed: false }}
      setMemo={noop}
      onEndTest={noop}
      onExit={noop}
    />,
  );

describe('حصّة القسم — the words of an « ask » card', () => {
  it('keeps the planks’ words for a step without its own', () => {
    expect(askWords(plain)).toEqual({ card: 'لوح', held: 'يثبت', fell: 'ينهار' });
    expect(board(plain)).toContain('<small>لوح</small>');
  });

  it('labels the cards with the step’s own words, and a word left out keeps the default', () => {
    expect(askWords(own)).toEqual(own.words);
    expect(askWords({ ...plain, words: { card: 'عدد الباقات' } })).toEqual({
      card: 'عدد الباقات',
      held: 'يثبت',
      fell: 'ينهار',
    });
    const html = board(own);
    expect(html).toContain('<small>عدد العلب</small>');
    expect(html).not.toContain('<small>لوح</small>');
  });
});
