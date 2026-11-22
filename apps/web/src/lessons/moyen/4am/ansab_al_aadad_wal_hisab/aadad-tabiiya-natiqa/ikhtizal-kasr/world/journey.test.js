import { describe, it, expect } from 'vitest';
import { describeKnowledge } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { MODULE_KEYS, STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards });

const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
/** The value of a memo option: « $\frac{33}{39}$ » → 33/39, « $39$ » → 39. */
const value = (s) => {
  const f = s.match(/\\frac\{(\d+)\}\{(\d+)\}/);
  return f ? Number(f[1]) / Number(f[2]) : Number(s.replace(/\$/g, ''));
};
const irreducible = (s) => {
  const f = s.match(/\\frac\{(\d+)\}\{(\d+)\}/);
  return Boolean(f) && gcd(Number(f[1]), Number(f[2])) === 1;
};

describe('the road of « اختزال كسر »', () => {
  it('its four keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['ikhtizal-marahil', 'ghayr-qabil', 'ikhtizal-pgcd', 'natija-mukhtazala']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((x) => x.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      expect(card(lesson.cards.ofKey[key])?.notebook && card(lesson.cards.ofKey[key]).requires, key).toBe(key);
    }
    expect(KNOWLEDGE.graph.nodes).toHaveLength(15);
    expect(journey).toBeTruthy();
  });

  it('the modules: each teaches the keys of its learning points (P1 🪜, P2 🔒, P3 🎯, P4 🧾)', () => {
    const P = { P1: KEYS[0], P2: KEYS[1], P3: KEYS[2], P4: KEYS[3] };
    for (const m of LESSON_CONFIG.modules) {
      const points = m.teachesLearningPointIds ?? [];
      const keys = points.map((p) => P[p.split('_').at(-1)]);
      expect(MODULE_KEYS[m.number] ?? [], `module ${m.number}`).toEqual(keys);
    }
    expect(lesson.keysFromModules(['1'])).toEqual([KEYS[0], KEYS[1]]);
    expect(lesson.keysFromModules(['6'])).toEqual([KEYS[2], KEYS[3]]);
  });

  it('every memo quiz has ONE right option, computed: equal to the fraction asked and, where asked, irreducible', () => {
    const [m1, m2, m3, m4] = Object.values(KNOWLEDGE.modules).flat();
    const ok = (quiz, test) =>
      quiz.options
        .map((o, i) => [i, test(o)])
        .filter(([, t]) => t)
        .map(([i]) => i);
    expect(ok(m1.memo.quiz[0], (o) => value(o) === 39)).toEqual([m1.memo.quiz[0].correct]);
    expect(ok(m1.memo.quiz[1], (o) => 33 % value(o) === 0 && 39 % value(o) === 0)).toEqual([m1.memo.quiz[1].correct]);
    expect(ok(m2.memo.quiz[0], irreducible)).toEqual([m2.memo.quiz[0].correct]);
    expect(ok(m2.memo.quiz[1], (o) => value(o) === gcd(35, 48))).toEqual([m2.memo.quiz[1].correct]);
    expect(ok(m3.memo.quiz[0], (o) => irreducible(o) && value(o) === 66 / 99)).toEqual([m3.memo.quiz[0].correct]);
    expect(ok(m3.memo.quiz[1], (o) => irreducible(o) && value(o) === 189 / 243)).toEqual([m3.memo.quiz[1].correct]);
    expect(ok(m4.memo.quiz[0], (o) => irreducible(o) && value(o) === 13 / 39)).toEqual([m4.memo.quiz[0].correct]);
    expect(ok(m4.memo.quiz[1], (o) => irreducible(o) && value(o) === 28 / 30)).toEqual([m4.memo.quiz[1].correct]);
    // the stopped-too-early writing of the 🎯 trap still reduces
    expect(gcd(189 / 9, 243 / 9)).toBe(3);
  });

  it('the card titles are plain text (no formula), and the road has a stage per segment', () => {
    for (const n of KNOWLEDGE.graph.nodes) expect(n.title, n.id).not.toMatch(/\$|\\/);
    expect(STORY.segments).toHaveLength(7);
  });
});
