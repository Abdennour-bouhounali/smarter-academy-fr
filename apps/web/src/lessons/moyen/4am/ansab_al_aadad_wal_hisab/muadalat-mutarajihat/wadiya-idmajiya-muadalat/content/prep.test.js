import { describe, it, expect } from 'vitest';
import { PREP_LADDER, PREP_LESSON } from './prep.js';
import { textViolations } from './forbidden.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const POINTS = [-7, -4, -3, 0, 1, 2, 5, 11];
const near = (u, v) => Math.abs(u - v) < 1e-9;
/** La vérité de chaque affirmation, RECALCULÉE (jamais recopiée). */
const truthOf = (c) => {
  if (c.kind === 'rule') return c.truth;
  if (c.kind === 'identity') return POINTS.every((x) => near(c.lhs(x), c.rhs(x)));
  if (c.kind === 'solution') {
    // une équation du premier degré : une seule solution si les deux membres ne sont pas parallèles
    const slope = (f) => f(1) - f(0);
    return near(c.lhs(c.x), c.rhs(c.x)) && !near(slope(c.lhs), slope(c.rhs));
  }
  if (c.kind === 'roots') {
    const zeros = Array.from({ length: 101 }, (_, i) => i - 50).filter((x) => near(c.f(x), 0));
    return c.roots.every((r) => near(c.f(r), 0)) && zeros.every((z) => c.roots.includes(z));
  }
  if (c.kind === 'ineq') return [...POINTS, -5, -4.5, 3.5].every((x) => c.holds(x) === c.claim(x));
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of the unit-4 synthesis', () => {
  it('ten statements, numbered; the four skills cycle; levels never go down', () => {
    expect(PREP_LADDER).toHaveLength(10);
    const cycle = ['muadala', 'jidaa', 'mutarajiha', 'tarrid'];
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(cycle[i % 4]); });
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
  it('each skill revises one of the unit\'s lessons — « راجع » is never empty', () => {
    expect(Object.values(PREP_LESSON).sort()).toEqual(['jidaa-maadum', 'muadala-ula', 'mutarajiha-ula', 'tarrid-mushkila']);
    new Set(PREP_LADDER.map((x) => x.skill)).forEach((sk) => expect(PREP_LESSON[sk], sk).toBeTruthy());
    expect(LESSON_CONFIG.priorKnowledge).toEqual(expect.arrayContaining(['hall-muadala', 'jidaa-maadum-khassiya', 'hall-mutarajiha', 'tarrid-tarjama']));
  });
  it('never uses the challenge nor the unit situation, a control character, « DA » or the textbook', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    expect(textViolations(text, 'prep')).toEqual([]);
    expect(/[\t\n\r]/.test(text)).toBe(false);
    expect(/الكتاب(?!ة)/.test(text)).toBe(false);
    expect(/DA\b/.test(text)).toBe(false);
  });
  it('a statement that is only a formula has no final period (it jumps left in RTL)', () => {
    PREP_LADDER.filter((x) => /^\$[^$]*\$\.?$/.test(x.text)).forEach((x) => expect(x.text.endsWith('.'), x.text).toBe(false));
  });
});
