import { describe, it, expect } from 'vitest';
import { PREP_LADDER, truthOf } from './prep.js';
import { TEXT } from './forbidden.js';

describe('« أستعدّ » ladder of mutarajiha-ula', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down (overall and within a skill)', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'tartib' : 'amaliyat'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
    ['tartib', 'amaliyat'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
      expect(new Set(PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.answer)).size).toBe(2);
    });
  });
  it('the first three are true; six true and four false', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => x.answer)).toHaveLength(6);
  });
  it('every answer is the truth, recomputed; the checker tells a true operation from a false one', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect(truthOf({ kind: 'op', l: 2, rel: '<', r: 5, op: '*', k: -1, claim: { l: -2, rel: '>', r: -5 } })).toBe(true);
    expect(truthOf({ kind: 'cmp', l: 3, rel: '<', r: 1 })).toBe(false);
  });
  it('items 8 and 10 are numeric (no unknown); nothing shows the climax signature, a control character or the book', () => {
    [8, 10].forEach((n) => expect(/x/.test(PREP_LADDER[n - 1].text)).toBe(false));
    PREP_LADDER.forEach((it) => {
      const text = `${it.text} ${it.why}`;
      TEXT.forEach((re) => expect(re.test(text), `${it.n} ${re}`).toBe(false));
      expect(/[\t\n\r]/.test(text)).toBe(false);
      expect(text.includes('الكتاب')).toBe(false);
    });
  });
});
