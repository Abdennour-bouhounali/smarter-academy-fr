import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import LessonBoard, { AskCard } from './LessonBoard';
import MemoFigure from './MemoFigures';
import { openingFacts } from './lessonMemos';
import { askProof, askHeld, askWords } from './lessonScripts';
import { boardFigure, BOARD_LABEL_PX } from './boardFigure';

// the board's layers (pen, pointer) are portals into `document.body`: no DOM here, they draw nothing
vi.mock('react-dom', async (orig) => ({ ...(await orig()), createPortal: () => null }));
globalThis.document ??= { body: null };

/**
 * An `ask` that carries a GEOMETRY FIGURE (`step.figure`, a bank sheet's `statement.figure`): drawn by the practice
 * space's StatementFigure beside the question, at the board's width, with no bridge under its cards — and the memo's
 * opening that carries one. A station without a figure keeps the world's drawing, the bridge by default.
 */
const figure = {
  points: { A: [0, 4], B: [0, 0], C: [6, 0], M: [0, 2], N: [3, 2] },
  segments: [
    { from: 'A', to: 'B', label: '8' },
    { from: 'B', to: 'C', label: '12', arrows: 1 },
    ['A', 'C'],
    { from: 'M', to: 'N', label: '?', arrows: 1, tone: 'indigo', bold: true },
  ],
  ariaLabel: 'Triangle ABC, (MN) parallèle à (BC)',
};
const LEN = { card: 'Longueur', held: 'Convient', fell: 'Ne convient pas' };
const withFig = {
  id: 'f',
  kind: 'ask',
  chapter: 'On découvre',
  title: 'Passerelle',
  text: 'La passerelle $[MN]$ est parallèle à $(BC)$.',
  question: 'Quelle est sa longueur ?',
  options: [4, 6, 9],
  answer: [6],
  words: LEN,
  figure,
  after: '$MN = 6$',
  cue: 'Q',
};
const planks = { ...withFig, id: 'p', figure: undefined, words: undefined, a: 12, options: [3, 5], answer: [3] };
const noop = () => {};
const board = (step, world) =>
  renderToString(
    <LessonBoard
      script={{ title: 'Leçon', steps: [step] }}
      rules={{}}
      askWorld={world}
      students={[]}
      seating={{}}
      memo={{ step: 0, log: [], readers: [], sealed: false }}
      setMemo={noop}
      onEndTest={noop}
      onExit={noop}
    />,
  );
const card = (step, o, proof) =>
  renderToString(<AskCard step={step} option={o} proof={proof} words={askWords(step)} picked checked onPick={noop} />);

describe('la séance en classe — a station that draws a geometry figure', () => {
  it('draws the figure with the practice space’s renderer, beside the question, at the width of 18 px labels', () => {
    const html = board(withFig);
    expect(html).toContain('cs-askstep--figure');
    expect(html).toContain('data-cs-figure="plane"');
    expect(html).toContain('data-geo-figure'); // GeoFigure, through StatementFigure — never a second drawing
    expect(html).toContain('aria-label="Triangle ABC, (MN) parallèle à (BC)"');
    expect(html).toContain('>12</text>');
    const f = boardFigure(figure);
    expect(f.label).toBeGreaterThanOrEqual(BOARD_LABEL_PX);
    expect(html).toContain(`--cs-fig-w:${f.width}px`);
    expect(html).toContain('data-cs-ask-proof="none"');
    // the figure comes first: on the inline end of the grid, the question and its cards beside it
    expect(html.indexOf('data-cs-figure')).toBeLessThan(html.indexOf('cs-askstep__body'));
  });

  it('draws NO bridge under its cards: once checked, a card says only its verdict', () => {
    expect(askProof(withFig)).toBe('none');
    expect(askProof(withFig, 'bridge')).toBe('none'); // a figure is its own proof, whatever the world
    expect(withFig.options.filter((o) => askHeld(withFig, o))).toEqual([6]);
    const right = card(withFig, 6, 'none');
    expect(right).toContain('is-held');
    expect(right).toContain('<em>Convient</em>');
    const other = card(withFig, 9, 'none');
    expect(other).toContain('is-fell');
    expect(other).toContain('<em>Ne convient pas</em>');
    for (const html of [right, other]) {
      expect(html).not.toContain('bbar'); // no plank bridge
      expect(html).not.toContain('\\times'); // no « a = b × q + r »
      expect(html).not.toContain('katex');
    }
  });

  it('keeps the bridge for every station without a figure: the world’s drawing, the bridge by default', () => {
    expect(askProof(planks)).toBe('bridge');
    expect(askProof(planks, 'unknown')).toBe('bridge');
    expect(askProof(planks, 'none')).toBe('none'); // a world that draws nothing under its cards
    const html = board(planks);
    expect(html).toContain('data-cs-ask-proof="bridge"');
    expect(html).not.toContain('cs-askstep--figure');
    expect(html).not.toContain('data-cs-figure');
    const held = card(planks, 3, 'bridge');
    expect(held).toContain('bbar');
    expect(held).toContain('katex'); // « 12 = 3 × 4 »
    expect(held).toContain('<em>Tient</em>');
    expect(card(planks, 5, 'bridge')).toContain('<em>S’effondre</em>');
    // a world that says « none »: the verdict only, no bridge under the cards
    expect(board(planks, 'none')).toContain('data-cs-ask-proof="none"');
    expect(card(planks, 3, 'none')).not.toContain('bbar');
  });
});

describe('la séance en classe — a figure with two states (`figureAfter`, 2026-11-26)', () => {
  // the after-state draws the proof: here a rose segment the before-state does not have
  const proofDrawn = { ...figure, segments: [...figure.segments, { from: 'A', to: 'C', label: '10', tone: 'rose' }] };
  const twoStates = { ...withFig, id: 't', figureAfter: proofDrawn };
  it('before the check: the figure alone — the proof (the post of the walkways) is not on the board', () => {
    const html = board(twoStates);
    expect(html).toContain('data-cs-figure-state="before"');
    expect(html).toContain('data-geo-figure');
    expect(html).not.toContain('#e11d48'); // the after-state's rose stroke
    expect(html).not.toMatch(/>10</);
  });
  it('a station without `figureAfter` renders exactly as before: no state, the same markup', () => {
    const html = board(withFig);
    expect(html).not.toContain('data-cs-figure-state');
    expect(html).toBe(board({ ...withFig, figureAfter: undefined }));
  });
});

describe('la fiche du professeur — an opening that draws a geometry figure', () => {
  it('draws its figure with the practice space’s renderer, never narrower than its 12 px floor', () => {
    const o = { id: 'g', kind: 'thales', title: 'Passerelle', figure };
    expect(openingFacts(o).first.r).toBe(null); // nothing laid, nothing left
    const html = renderToString(<MemoFigure opening={o} />);
    expect(html).toContain('data-memo-figure="plane"');
    expect(html).toContain('data-geo-figure');
    expect(html).toContain('aria-label="Triangle ABC, (MN) parallèle à (BC)"');
    expect(html).toMatch(/min-width:calc\(var\(--di-min-font, 12px\) \* \d+(\.\d+)?\)/);
  });

  // the Algerian platform draws its Thalès lesson's three openings here; no French lesson has a geometry memo yet, so
  // three openings of that shape stand in: each marks the length asked with « ? »
  it('draws openings that mark the length asked with « ? »', () => {
    const openings = [
      { id: 'o1', kind: 'thales', title: 'Passerelle', figure },
      {
        id: 'o2',
        kind: 'thales',
        title: 'Rampe',
        figure: { ...figure, segments: [...figure.segments.slice(0, 3), { from: 'A', to: 'N', label: '?' }] },
      },
      {
        id: 'o3',
        kind: 'thales',
        title: 'Ombre',
        figure: { ...figure, segments: [{ from: 'B', to: 'C', label: '?' }, ...figure.segments.slice(2)] },
      },
    ];
    for (const o of openings) {
      const html = renderToString(<MemoFigure opening={o} />);
      expect(html, o.id).toContain('data-geo-figure');
      expect(html, o.id).toContain('>?</text>');
    }
  });

  it('keeps the figure of its kind for an opening without one', () => {
    const html = renderToString(<MemoFigure opening={{ id: 'b', kind: 'bridge', title: 'Pont', a: 15, b: 4 }} />);
    expect(html).toContain('data-memo-figure="bridge"');
    expect(html).not.toContain('data-geo-figure');
  });
});
