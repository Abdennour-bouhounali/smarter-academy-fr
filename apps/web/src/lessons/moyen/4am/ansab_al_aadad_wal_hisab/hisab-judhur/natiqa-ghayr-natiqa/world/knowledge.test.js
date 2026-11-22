import { describe, it, expect } from 'vitest';
import {
  describeKnowledge,
  describeLimits,
  plain,
  stringsIn,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { lesson } from './index';
import { PRACTICE_MAP } from './practice';
import { TABLETS } from './tablets';
import { calculator, cut, read, rootOf, rounded, sq, write } from './math';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards });
// the map, the practice hub and the tablets against the limits the walks proved (the forges: their own test)
describeLimits({ forges: {}, keys: [], tablets: TABLETS, knowledge: KNOWLEDGE, practiceMap: PRACTICE_MAP });

const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
/** The value of a quiz option « $1{,}8$ », « $\\dfrac{7}{10}$ », or null for one that is not a number. */
const valueOf = (s) => {
  const t = s
    .replace(/\$/g, '')
    .replace('{,}', ',')
    .replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2');
  try {
    return write(read(t));
  } catch {
    return null;
  }
};
const rightOf = (quiz, test) =>
  quiz.options
    .map((o, i) => [i, test(o)])
    .filter(([, t]) => t)
    .map(([i]) => i);

describe('« خريطة المعارف » of « الأعداد الناطقة والأعداد غير الناطقة » — the lesson’s own', () => {
  it('three memo sheets, one per key, each on its notebook card', () => {
    expect(
      Object.values(KNOWLEDGE.modules)
        .flat()
        .map((x) => x.id),
    ).toEqual(KEYS);
    for (const key of KEYS) expect(card(lesson.cards.ofKey[key])).toMatchObject({ notebook: true, requires: key });
  });

  it('every quiz has ONE right option, computed here', () => {
    const [m1, m2, m3] = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((x) => x.memo.quiz);
    // 🧩 √(98/200) and √0,0441
    expect(rightOf(m1[0], (o) => valueOf(o) != null && write(sq(valueOf(o))) === write('98/200'))).toEqual([
      m1[0].correct,
    ]);
    expect(rightOf(m1[1], (o) => valueOf(o) != null && sq(valueOf(o)) === '0,0441')).toEqual([m1[1].correct]);
    // ♾️ the one radicand that is no square of a rational; 1,41²
    const under = (o) => valueOf(/\\sqrt\{(.+)\}\$$/.exec(o)[1]);
    expect(rightOf(m2[0], (o) => rootOf(under(o)) === null)).toEqual([m2[0].correct]);
    expect(rightOf(m2[1], (o) => valueOf(o) === sq('1,41'))).toEqual([m2[1].correct]);
    // 🎯 the rounded value of √23 to 0,1; the value by default of √15 to 0,01
    expect(rightOf(m3[0], (o) => valueOf(o) === rounded('23', 1))).toEqual([m3[0].correct]);
    expect(rightOf(m3[1], (o) => valueOf(o) === cut('15', 2))).toEqual([m3[1].correct]);
  });

  it('the numbers the cards state are computed: the long display of a fraction, the middle marks, the chase', () => {
    expect(calculator('4/81')).toBe('0,222222222');
    expect(rootOf('4/81')).toBe('2/9');
    expect(card('wusta').subtitle).toBe('$4{,}35^2 = 18{,}9225$');
    expect(card('naqs-ziyada').context.list).toEqual([
      'بالنقصان: $8{,}12$',
      'بالزيادة: $8{,}13$',
      'المدوَّر: $8{,}12$',
    ]);
    for (const line of card('tard').context.list) {
      const [p2, q2] = [...line.matchAll(/= (\d+)\$/g)].map((m) => Number(m[1]));
      expect(Math.abs(p2 - q2)).toBe(1);
    }
    expect(card('khata-fasila').context.parts[2].text).toContain('1{,}26 < \\sqrt{1{,}6} < 1{,}27');
    expect(read('32/50')).toEqual(read('16/25'));
  });

  it('a card title is plain text; the memo’s hook, trap and exam are plain; no sentence says « wrong »', () => {
    for (const n of KNOWLEDGE.graph.nodes) plain(n.title);
    for (const x of Object.values(KNOWLEDGE.modules).flat()) for (const f of ['hook', 'trap', 'exam']) plain(x.memo[f]);
    for (const s of stringsIn(KNOWLEDGE.graph.nodes.map((n) => ({ ...n, edges: null }))))
      expect(s).not.toMatch(/خاطئ|غلط/);
  });
});
