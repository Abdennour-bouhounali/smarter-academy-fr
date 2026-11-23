import { describe, it, expect } from 'vitest';
import { hasBoardMemo, MEMO_PARTS, partKeys, openingFacts } from './lessonMemos';
import { BOARD_LESSONS } from './boardLessons';

describe('fiche du professeur — the written memo of a lesson that has its board', () => {
  it('exists for the lessons that have a board, with every part a good lesson plan has', () => {
    for (const id of BOARD_LESSONS) expect(hasBoardMemo(id), id).toBe(true); // the memo is written with the script: one flag of the pack
    expect(hasBoardMemo('other')).toBe(false);
    expect(partKeys()).toEqual([
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'tiers',
    ]); // no notes part: his notes are « le dossier de la leçon »
    expect(MEMO_PARTS.map((g) => g.id)).toEqual(['before', 'during', 'after']);
  });

  it('computes the numbers of an opening situation: how many fit, how many are left', () => {
    // a neutral opening: 15 places, rows of 4 then of 5
    expect(openingFacts({ kind: 'rows', a: 15, b: 4, alt: 5 }).first).toEqual({ b: 4, q: 3, r: 3, exact: false });
    expect(openingFacts({ kind: 'rows', a: 15, b: 4, alt: 5 }).second).toMatchObject({ b: 5, q: 3, r: 0, exact: true });
  });
});

// The three cards of « La séance en une page » (BoardMemo.jsx) write a memo's sentences through MathText: a formula of
// the memo (« lire $2^4$ comme $2 \times 4$ ») is drawn — the first French memo showed it as raw LaTeX (board walk).
describe('the memo’s glance — formulas drawn', () => {
  it('goal, idea and trap go through MathText', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('./BoardMemo.jsx', import.meta.url), 'utf8');
    for (const k of ['goal', 'idea', 'trap']) expect(src).toMatch(new RegExp(`<MathText>\\{g\\.${k}\\}</MathText>`));
    // …and every other sentence of the memo (criteria, openings, phases, sequence) through its `T` (MathText)
    for (const f of ['c.can', 'memo.stands', 'o.story', 'o.ask', 'o.why', 'o.expect', 'p.aim', 'v', 's', 'lead'])
      expect(src).toMatch(new RegExp(`<T>\\{${f.replaceAll('.', '\\.')}\\}</T>`));
  });
});
