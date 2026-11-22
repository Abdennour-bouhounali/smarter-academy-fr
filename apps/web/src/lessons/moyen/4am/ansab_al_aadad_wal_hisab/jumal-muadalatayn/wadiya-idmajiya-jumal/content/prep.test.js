import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { PREP_LADDER, PREP_LESSON } from './prep.js';
import { textViolations } from './forbidden.js';
import { LESSON_CONFIG } from '../lesson.config.js';

/** La vérité de chaque affirmation, RECALCULÉE (jamais recopiée) — fractions exactes de linearSystem. */
const truthOf = (c) => {
  if (c.kind === 'rule') return c.truth;
  if (c.kind === 'pair') { const [a, b] = c.system.split('|'); return LS.isSolution(LS.system(a, b), c.pair[0], c.pair[1]); }
  if (c.kind === 'iso') return c.claimK === -c.a;
  if (c.kind === 'translate') return c.counts[0] === c.claim[0] && c.counts[1] === c.claim[1];
  if (c.kind === 'add') return c.e1[1] + c.e2[1] === 0 && c.e1[0] + c.e2[0] === c.claim[0] && c.e1[2] + c.e2[2] === c.claim[1];
  if (c.kind === 'natural') return c.pair.every((v) => Number.isInteger(v) && v >= 0);
  if (c.kind === 'unique') { const [a, b] = c.system.split('|'); return LS.classify(LS.system(a, b)).kind === 'unique'; }
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of the unit-5 synthesis', () => {
  it('ten statements, numbered; the three skills cycle; levels never go down', () => {
    expect(PREP_LADDER).toHaveLength(10);
    const cycle = ['mafhum', 'hall', 'mushkila'];
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(cycle[i % 3]); });
    const lv = PREP_LADDER.map((x) => x.level);
    expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    expect(lv[0]).toBe(1);
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => !x.answer).length).toBeGreaterThanOrEqual(3);
  });
  it('every answer is the truth, recomputed', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), `${it.n}: ${it.text}`).toBe(it.answer));
  });
  it('each skill revises one of the unit\'s three lessons — « راجع » is never empty', () => {
    expect(Object.values(PREP_LESSON).sort()).toEqual(['hall-jabri', 'mafhum-jumla', 'mushkilat-jumla']);
    new Set(PREP_LADDER.map((x) => x.skill)).forEach((sk) => expect(PREP_LESSON[sk], sk).toBeTruthy());
    expect(LESSON_CONFIG.priorKnowledge).toEqual(expect.arrayContaining(['mafhum-jumla', 'hall-jumla', 'tarjama-jumla']));
  });
  it('never uses the challenge nor the unit situation, a control character, « DA » or the textbook', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    expect(textViolations(text, 'prep')).toEqual([]);
    expect(/[\t\n\r]/.test(text)).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    expect(/\bDA\b/.test(text)).toBe(false);
  });
});
