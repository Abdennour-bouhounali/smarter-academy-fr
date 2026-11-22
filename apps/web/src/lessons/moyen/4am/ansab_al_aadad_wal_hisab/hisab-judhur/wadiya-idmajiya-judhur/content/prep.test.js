import { describe, it, expect } from 'vitest';
import { PREP_LADDER, PREP_LESSON } from './prep.js';
import { textViolations } from './forbidden.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const close = (x, y) => Math.abs(x - y) < 1e-9;
/** n sans facteur carré > 1 */
const squareFree = (n) => { for (let d = 2; d * d <= n; d += 1) if (n % (d * d) === 0) return false; return true; };

/** La vérité de chaque affirmation, RECALCULÉE (jamais recopiée). */
const truthOf = (c) => {
  if (c.kind === 'rule') return c.truth;
  if (c.kind === 'sqrt') return close(Math.sqrt(c.n), c.claim);
  if (c.kind === 'sqrtSquare') return close(Math.sqrt(c.x * c.x), c.claim);
  if (c.kind === 'sqrtEq') return close(c.root * c.root, c.claim);
  if (c.kind === 'solutions') {
    const sols = c.a > 0 ? [Math.sqrt(c.a), -Math.sqrt(c.a)] : c.a === 0 ? [0] : [];
    return sols.length === c.claim.length && sols.every((x) => c.claim.some((y) => close(x, y)));
  }
  if (c.kind === 'simplest') return c.k * c.k * c.b === c.n && squareFree(c.b);
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of the unit-2 synthesis', () => {
  it('ten statements, numbered; the three skills cycle; levels never go down', () => {
    expect(PREP_LADDER).toHaveLength(10);
    const cycle = ['jidhr', 'muadala', 'kitaba'];
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
  it('each skill revises one of the unit\'s lessons — « راجع » is never empty', () => {
    expect(Object.values(PREP_LESSON).sort()).toEqual(['jidhr-tarbii', 'muadalat-x-murabba', 'tawzif-khawass-judhur']);
    new Set(PREP_LADDER.map((x) => x.skill)).forEach((sk) => expect(PREP_LESSON[sk], sk).toBeTruthy());
    expect(LESSON_CONFIG.priorKnowledge).toEqual(expect.arrayContaining(['jidhr-taarif', 'hulul-x2-a', 'kitaba-a-jidhr-b']));
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
