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
import { read, rootOf, sq, write } from './math';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards });
// the map, the practice hub and the tablets against the limits the walks proved (the forges: forges.test.js)
describeLimits({ forges: {}, keys: [], tablets: TABLETS, knowledge: KNOWLEDGE, practiceMap: PRACTICE_MAP });

const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
/** The value of a quiz option « $14$ », « $-14$ », « $7{,}5$ », or null for one that is not a number. */
const valueOf = (s) => {
  const t = s.replace(/\$/g, '').replace('{,}', ',');
  try {
    return read(t);
  } catch {
    return null;
  }
};

describe('« خريطة المعارف » of « الجذر التربيعي لعدد موجب » — the lesson’s own', () => {
  it('three memo sheets, one per key, each on its notebook card', () => {
    expect(
      Object.values(KNOWLEDGE.modules)
        .flat()
        .map((x) => x.id),
    ).toEqual(KEYS);
    for (const key of KEYS) expect(card(lesson.cards.ofKey[key])).toMatchObject({ notebook: true, requires: key });
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(15);
  });

  it('every quiz has ONE right option, computed here', () => {
    const [m1, m2, m3] = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((x) => x.memo.quiz);
    const right = (quiz, test) =>
      quiz.options
        .map((o, i) => [i, test(o)])
        .filter(([, t]) => t)
        .map(([i]) => i);
    // 🔑 the root of 196 (positive, its square is 196); the number whose root is 15
    const isRootOf = (a) => (o) => {
      const v = valueOf(o);
      return Boolean(v) && v.n >= 0n && write(sq(v)) === a;
    };
    expect(right(m1[0], isRootOf('196'))).toEqual([m1[0].correct]);
    expect(right(m1[1], (o) => valueOf(o) && rootOf(valueOf(o)) === '15')).toEqual([m1[1].correct]);
    // ✍️ the two whole numbers around √40; the exact value (the only option that is not a number)
    const around = (o) => {
      const [x, y] = [...o.matchAll(/\$(\d+)\$/g)].map((mm) => Number(mm[1]));
      return x * x < 40 && 40 < y * y && y === x + 1;
    };
    expect(right(m2[0], around)).toEqual([m2[0].correct]);
    expect(right(m2[1], (o) => valueOf(o) === null)).toEqual([m2[1].correct]);
    // 🔁 (√51)² and √((−15)²)
    expect(right(m3[0], (o) => write(valueOf(o)) === '51')).toEqual([m3[0].correct]);
    expect(right(m3[1], (o) => write(valueOf(o)) === '15')).toEqual([m3[1].correct]);
  });

  it('the decimals the cards state are true: the court of 30 between 5,47 and 5,48, the ninefold walk', () => {
    const list = card('muqarraba').context.list;
    for (const line of list) {
      const [, x, y, z] = /\$(\S+) \\times (\S+) = (\S+)\$/.exec(line).map((s) => s.replace('{,}', ','));
      expect(x).toBe(y);
      expect(write(sq(x))).toBe(write(z));
    }
    expect(read('5,47').n ** 2n * 100n < 30n * read('5,47').d ** 2n * 100n).toBe(true);
    expect(write(sq('5,47'))).toBe('29,9209');
    expect(write(sq('5,48'))).toBe('30,0304');
    expect(card('salib').subtitle).toBe('$\\sqrt{(-9)^2} = 9$');
  });

  it('a card title is plain text; the memo’s hook, trap and exam are plain; no word says « wrong » outside the kit', () => {
    for (const n of KNOWLEDGE.graph.nodes) plain(n.title);
    for (const x of Object.values(KNOWLEDGE.modules).flat()) for (const f of ['hook', 'trap', 'exam']) plain(x.memo[f]);
    // the card « خطأ شائع » is the kit's word (its kind), never a sentence of the lesson about an answer
    for (const s of stringsIn(KNOWLEDGE.graph.nodes.map((n) => ({ ...n, edges: null }))))
      expect(s).not.toMatch(/خاطئ|غلط/);
  });
});
