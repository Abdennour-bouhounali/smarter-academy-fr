import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { SCRIPT, BOARD, KEYS, FACTS, lanesFigure } from './script';
import { MEMO } from './memo';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { boardFigure, BOARD_LABEL_PX } from '../../../../../../../features/classSession/boardFigure';
import StatementFigure from '../../../../../../common/components/StatementFigure';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import {
  askWords,
  groupsOf,
  ladderStart,
  ladderLay,
  ladderDone,
  ladderRack,
  ladderTex,
  ladderRow,
  rowGroups,
} from '../../../../../../../features/classSession/lessonScripts';
import { LADDER_WORDS } from '../../../../../../../features/classSession/LadderStation';
import {
  typographyErrors,
  agreementErrors,
  stringsIn,
} from '../../../../../../common/gameworld/kit/authoring/test/suites';
import { readBank, storiesOf, collisions } from '../../../../../../common/gameworld/kit/authoring/test/bank';

/** « La leçon au tableau » of lesson 4: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'ask', 'ladder', 'name', 'trace'];
const steps = SCRIPT.steps;
const asks = steps.filter((s) => s.kind === 'ask');
const ladders = steps.filter((s) => s.kind === 'ladder');
const names = steps.filter((s) => s.kind === 'name');
const step = (id) => steps.find((s) => s.id === id);

/** Computed apart, by trying every number — never the script's helpers. */
const factorsApart = (n) => {
  const out = [];
  let m = n;
  for (let d = 2; m > 1; d += 1)
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  return out;
};
/** The multiples of both x and y up to `limit`, found by trying every number. */
const commonMultiplesApart = (x, y, limit) =>
  Array.from({ length: limit }, (_, i) => i + 1).filter((n) => n % x === 0 && n % y === 0);
const lcmApart = (x, y) => commonMultiplesApart(x, y, x * y)[0];
const lcmOfApart = (xs) => {
  let n = Math.max(...xs);
  while (!xs.every((x) => n % x === 0)) n += 1;
  return n;
};
const product = (xs) => xs.reduce((p, x) => p * x, 1);
const powersOf = (n) => rowGroups(factorsApart(n)).map((g) => [g.p, g.k]);
const value = (ps) => ps.reduce((p, [b, k]) => p * b ** k, 1);
/** A formula as the board writes it: thousands with « \, ». */
const tx = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');

/** The words of each key's NAME: none may stand on the board before its naming station. */
const FORBIDDEN = {
  'pilier-commun': ['commun', 'multiple', 'ppcm', 'plus petit'],
  'ppcm-facteurs': ['exposant', 'facteurs premiers', 'facteur premier'],
  'traduire-rendez-vous': ['rythme', 'rendez-vous'],
  'cinq-equipes': ['cycle'],
};

describe('Multiples communs — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, chapters, short cues and two copybook pages', () => {
    expect(steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(steps.length).toBeLessThanOrEqual(14);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    for (const s of steps) {
      expect(s.chapter, s.id).toBeTruthy();
      expect(s.cue.length, `${s.id}: « ${s.cue} »`).toBeLessThanOrEqual(70);
      expect(s.cue, s.id).not.toContain('$'); // the cue is plain text in the footer
    }
    expect(steps.at(-1).kind).toBe('trace');
    expect(steps.filter((s) => s.kind === 'trace')).toHaveLength(2);
    expect(groupsOf(SCRIPT)).toHaveLength(5); // four keys and ONE copybook group
  });

  it('opens on two crews: the crew of 22 ends at 22, the crew of 8 leaves 6 cases', () => {
    const [first] = steps;
    expect(first.kind).toBe('situation');
    expect(first.bridge).toEqual({ a: BOARD.situation.a, b: BOARD.situation.b });
    expect(22 % 22).toBe(0);
    expect(22 % 8).toBe(6);
    expect(first.text).toContain('$22 = 22 \\times 1$');
  });

  it('every ask leaves its cards room: text ≤ 160 characters, proof ≤ 240, both ≤ 370 (walk 2026-11-26)', () => {
    // the board walk found the cards' « Roue de » / « Tour inachevé » out of their card under a 3-line text and a 3-line
    // proof; the stations that passed (`pilier-44`, `pilier-qui-manque`) are within these budgets
    for (const s of asks) {
      expect(s.text.length, s.id).toBeLessThanOrEqual(160);
      expect(s.after.length, s.id).toBeLessThanOrEqual(240);
      expect(s.text.length + s.after.length, s.id).toBeLessThanOrEqual(370);
      for (const w of Object.values(askWords(s))) expect(w.length, `${s.id}: « ${w} »`).toBeLessThanOrEqual(18);
    }
  });

  it('every ask: its answer is exactly the options that fill its gap, at most six cards, a proof after', () => {
    for (const s of asks) {
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      // a station that carries its figure is judged by its own test (its cards are pillars, not planks)
      if (!s.figure) expect(s.answer, s.id).toEqual(s.options.filter((o) => s.a % o === 0));
      expect(s.answer.length, s.id).toBeGreaterThan(0);
      expect(s.after, s.id).toBeTruthy();
    }
  });

  it('key 1 — planks of 22 and of 8: 44 stops the crew of 8, 88 is the first pillar where both end', () => {
    expect(commonMultiplesApart(22, 8, 300)).toEqual([88, 176, 264]);
    expect(lcmApart(22, 8)).toBe(88);
    expect(FACTS.crews.first).toBe(88);
    expect(FACTS.crews.stops).toEqual([22, 44, 66]);
    // before 88 the crew of 22 ends at 22, 44, 66 and the crew of 8 never does
    for (const stop of FACTS.crews.stops) expect(stop % 8, `${stop}`).not.toBe(0);
    const one = step('pilier-44');
    expect(one.options).toEqual([8, 22]);
    expect(one.answer).toEqual([22]);
    expect(44 % 8).toBe(4);
    expect(one.after).toContain('$44 = 8 \\times 5 + 4$');
    expect(one.after).toContain('$22 = 8 \\times 2 + 6$');
    // the common-multiple question (walk 2026-11-26: the bridges' ask asked « which planks fill 88? », both did): its cards
    // are PILLARS, the two walkways drawn; the right card is the one pillar where BOTH crews end — computed apart
    const two = step('pilier-88');
    expect(two.figure).toBeTruthy();
    expect(two.options).toEqual([44, 80, 88]);
    const both = two.options.filter((d) => commonMultiplesApart(22, 8, 300).includes(d));
    expect(both).toEqual([88]);
    expect(two.answer).toEqual(both);
    // each wrong pillar stops exactly one crew: its card « A ou B s’arrête » is true
    for (const d of [44, 80]) expect([d % 8 === 0, d % 22 === 0].filter(Boolean)).toHaveLength(1);
    expect(two.text).toContain('22, 44 et 66');
    expect(two.after).toContain('$88 = 8 \\times 11 = 22 \\times 4$');
    expect(two.after).toContain('11 planches de 8 et 4 planches de 22');
    expect(two.after).toContain('$44 = 8 \\times 5 + 4$');
    expect(two.after).toContain('$80 = 22 \\times 3 + 14$');
    // A10: a card is a crew or a pillar, never « Planche » (the board's default word for a plank)
    expect(askWords(one)).toEqual({ card: 'Équipe de', held: 'Finit pile', fell: 'S’arrête avant' });
    expect(askWords(two)).toEqual({
      card: 'Pilier à',
      held: 'Pile pour A et B',
      fell: 'A ou B s’arrête',
    });
    for (const s of [one, two, step('pilier-qui-manque')])
      expect(stringsIn(askWords(s)).join(' '), s.id).not.toMatch(/planche/i);
  });

  it('key 1 — the walkways’ figure: before the check the lanes run past, no post; after it they stop at 88 with the post', () => {
    const st = step('pilier-88');
    const [f, g] = [st.figure, st.figureAfter];
    for (const x of [f, g]) expect(validateGeoFigure(x)).toEqual([]);
    expect(f).toEqual(lanesFigure([22, 8], 110));
    expect(g).toEqual(lanesFigure([22, 8], 88, 88));
    const joints = (fig, lane) =>
      Object.entries(fig.points)
        .filter(([n]) => n[0] === lane)
        .map(([, p]) => p[0]);
    // before: crew A 0 … 110 (5 planks), crew B 0 … 104 (13 planks) — 88 a joint of both among others, no post
    expect(joints(f, 'A')).toEqual([0, 22, 44, 66, 88, 110]);
    expect(joints(f, 'B')).toEqual(Array.from({ length: 14 }, (_, k) => 8 * k));
    expect(joints(f, 'P')).toEqual([]);
    expect(f.segments.map((x) => x.label)).toEqual([...Array(5).fill('22'), ...Array(13).fill('8')]);
    // after: 4 and 11 planks to 88, and the post at 88
    expect(joints(g, 'A')).toEqual([0, 22, 44, 66, 88]);
    expect(joints(g, 'B')).toEqual(Array.from({ length: 12 }, (_, k) => 8 * k));
    expect(g.segments.map((x) => x.label)).toEqual([...Array(4).fill('22'), ...Array(11).fill('8'), '88']);
    expect([g.points.P0[0], g.points.P1[0]]).toEqual([88, 88]);
    expect(g.segments.at(-1)).toMatchObject({ from: 'P0', to: 'P1', tone: 'violet' });
    for (const x of [f, g]) {
      for (let i = 1; i < x.segments.length; i += 1)
        if (x.segments[i].from === x.segments[i - 1].to) expect(x.segments[i].tone).not.toBe(x.segments[i - 1].tone);
      expect(x.hidden).toEqual(Object.keys(x.points));
      expect(
        x.segments.filter((s) => s.from[0] !== 'P').every((s) => ['indigo', 'sky'].includes(s.tone) && s.bold),
      ).toBe(true);
      expect(boardFigure(x).label).toBeGreaterThanOrEqual(BOARD_LABEL_PX);
      expect(boardFigure(x).width).toBeLessThanOrEqual(560);
      const html = renderToString(createElement(StatementFigure, x));
      expect(html).toContain('data-geo-figure');
      expect(html).not.toMatch(/<circle/);
    }
  });

  it('every ladder can be laid to 1 case with its rack, on ONE screen', () => {
    for (const s of ladders) {
      let st = ladderStart(s.n);
      for (const p of factorsApart(s.n)) {
        expect(
          ladderRack(s, st).some((x) => x.d === p),
          `${s.id}: ${p} on ${st.gap}`,
        ).toBe(true);
        st = ladderLay(st, p);
      }
      expect(ladderDone(st), s.id).toBe(true);
      expect(product(ladderRow(st))).toBe(s.n);
      expect(ladderTex(st)).toBe(`${tx(s.n)} = ${factorsApart(s.n).join(' \\times ')}`);
      expect(factorsApart(s.n).length + 1, `${s.id}: the rungs`).toBeLessThanOrEqual(9);
      expect(ladderRack(s, ladderStart(s.n)).length).toBeLessThanOrEqual(8);
      expect(s.after, s.id).toContain(`= ${factorsApart(s.n).join(' \\times ')}$`);
    }
  });

  it('key 2 — 40 and 325: the pillar 1 300 lacks a 2 for the crew of 40; 2 600 is the first that holds', () => {
    expect(factorsApart(40)).toEqual([2, 2, 2, 5]);
    expect(factorsApart(325)).toEqual([5, 5, 13]);
    expect(factorsApart(1300)).toEqual([2, 2, 5, 5, 13]);
    expect(lcmApart(40, 325)).toBe(2600);
    expect(FACTS.factors.whole).toBe(2600);
    expect(powersOf(2600)).toEqual([
      [2, 3],
      [5, 2],
      [13, 1],
    ]);
    // the larger exponent of each prime of either number: 2³ (40), 5² (325), 13 (325)
    expect(powersOf(40)).toEqual([
      [2, 3],
      [5, 1],
    ]);
    expect(powersOf(325)).toEqual([
      [5, 2],
      [13, 1],
    ]);
    const s = step('pilier-qui-manque');
    expect(s.options).toEqual([40, 325]);
    expect(s.answer).toEqual([325]);
    expect(1300 % 325).toBe(0);
    expect(1300 % 40).toBe(20); // « 1 300 = 40 × 32 + 20 »
    expect(40 * 32 + 20).toBe(1300);
    expect(s.text).toContain('$40 = 2^{3} \\times 5$');
    expect(s.text).toContain('$325 = 5^{2} \\times 13$');
    expect(s.text).toContain('$1\\,300 = 2^{2} \\times 5^{2} \\times 13$');
    expect(s.after).toContain('$1\\,300 = 40 \\times 32 + 20$');
    expect(s.after).toContain('$2\\,600 = 2^{3} \\times 5^{2} \\times 13$');
    expect(s.after).toContain('$2\\,600 = 40 \\times 65 = 325 \\times 8$');
    expect(40 * 65).toBe(2600);
    expect(325 * 8).toBe(2600);
    // no pillar below 2 600 holds for both: the crew of 325 ends at its multiples only
    const holds = Array.from({ length: 2599 }, (_, i) => i + 1).filter((n) => n % 40 === 0 && n % 325 === 0);
    expect(holds).toEqual([]);
  });

  it('key 3 — gears of 9 and 24 teeth: 24 teeth fits 24 only; the marks meet after 72, 8 and 3 turns', () => {
    const s = step('roues');
    expect(s.options).toEqual([9, 24]);
    expect(s.answer).toEqual([24]);
    expect(24 % 9).toBe(6);
    expect(s.after).toContain('$24 = 9 \\times 2 + 6$');
    expect(lcmApart(9, 24)).toBe(72);
    expect(FACTS.gears).toEqual({ meet: 72, turns: [8, 3], whole: [24] });
    expect(72 / 9).toBe(8);
    expect(72 / 24).toBe(3);
    expect(s.after).toContain('$72 = 9 \\times 8 = 24 \\times 3$, soit 8 tours et 3 tours');
    // A10: tooth counts, never planks, and no gear is drawn: the words name none of the world's planks
    expect(s.words).toEqual({ card: 'Roue de', held: 'Tours entiers', fell: 'Tour inachevé' });
    expect(stringsIn(askWords(s)).join(' ')).not.toMatch(/planche|tient|effondre/i);
  });

  it('key 4 — teams that work 1 day and sleep 11, 16, 17 days: day 37 is day 36 since the start; day 613', () => {
    const cycles = [11, 16, 17].map((x) => x + 1);
    expect(cycles).toEqual([12, 17, 18]);
    expect(FACTS.teams.cycles).toEqual(cycles);
    expect(lcmOfApart(cycles)).toBe(612);
    expect(FACTS.teams).toMatchObject({ all: 612, day: 613, work: [12, 18] });
    expect(powersOf(612)).toEqual([
      [2, 2],
      [3, 2],
      [17, 1],
    ]);
    const s = step('equipes');
    expect(s.options).toEqual(cycles);
    expect(s.answer).toEqual([12, 18]); // day 37: 36 days since the start
    expect(36 % 17).toBe(2);
    expect(s.after).toContain('$36 = 17 \\times 2 + 2$');
    expect(s.after).toContain('$612 = 12 \\times 51 = 17 \\times 36 = 18 \\times 34$');
    expect(12 * 51).toBe(612);
    expect(17 * 36).toBe(612);
    expect(18 * 34).toBe(612);
    expect(s.after).toContain('le jour 613');
    // the sleep days alone are the wrong cycle: 11, 16, 17 meet after 2 992 days, not 612
    expect(lcmOfApart([11, 16, 17])).toBe(2992);
    expect(s.text).toContain('Le jour 37, 36 jours se sont écoulés');
    expect(stringsIn(askWords(s)).join(' ')).not.toMatch(/planche|tient|effondre/i);
  });

  it('names each rule after the class has met it: the four keys in order, the copybook holds them in that order', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    steps.forEach((s, i) => {
      if (s.kind === 'name') expect(['ask', 'ladder'], s.id).toContain(steps[i - 1].kind);
    });
    expect(steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets)).toEqual(KEYS);
  });

  it('says no key’s name before its naming station — and the stations’ own words name none', () => {
    names.forEach((n) => {
      const at = steps.indexOf(n);
      const before = stringsIn(steps.slice(0, at)).join(' ').toLowerCase();
      for (const w of FORBIDDEN[n.tablet]) expect(before, `${n.tablet}: « ${w} »`).not.toContain(w);
    });
    const station = stringsIn([LADDER_WORDS, askWords({})])
      .join(' ')
      .toLowerCase();
    for (const w of Object.values(FORBIDDEN).flat()) expect(station, w).not.toContain(w);
  });

  it('writes French: typography and agreement of every sentence of the script', () => {
    for (const t of stringsIn(SCRIPT)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
  });

  it('never abbreviates the key, draws no gear, and keeps the lesson-5 identity unsaid', () => {
    const all = [...stringsIn(SCRIPT), ...stringsIn(MEMO)];
    for (const t of all) {
      expect(t, t).not.toMatch(/PPCM/);
      // lesson 5's: no sentence holds both « PGCD » and « produit »
      expect(/PGCD/.test(t) && /produit/.test(t), t).toBe(false);
    }
    // a gear may be named in words; nothing is drawn as one: the one figure is the walkways' — segments, no circle
    expect(steps.filter((s) => s.figure).map((s) => s.id)).toEqual(['pilier-88']);
    for (const s of steps.filter((x) => x.figure)) expect(s.figure.circles ?? s.figure.arcs ?? []).toEqual([]);
  });

  it('uses numbers of its own: none of the exercise banks, none of a story', () => {
    const bank = readBank('multiples-et-diviseurs-communs');
    const earlier = ['decomposer-en-facteurs-premiers', 'trouver-le-pgcd'].map((id) => readBank(id));
    const stories = storiesOf();
    const own = [
      325,
      BOARD.factors.lacking,
      FACTS.factors.whole,
      FACTS.teams.all,
      FACTS.teams.day,
      // the multiples the memo writes, and the memo's own headline numbers
      176,
      264,
      2520,
      // every rung the two ladders write
      ...ladders.flatMap((s) => {
        let m = s.n;
        return factorsApart(s.n).map((p) => (m /= p));
      }),
    ];
    // a headline number is one of 100 or more (the kit's rule, `collisions`)
    for (const b of [bank, ...earlier])
      for (const n of own.filter((x) => x >= 100))
        expect(collisions(b, [n], { stories }).clear, `${b.id}: ${n}`).toBe(true);
    // the pairs the board names are none of the banks'
    for (const b of [bank, ...earlier])
      for (const [x, y] of [
        [22, 8],
        [40, 325],
        [9, 24],
        [6, 15],
        [9, 12],
        [6, 9],
        [8, 12],
        [12, 17],
        [17, 18],
      ])
        expect(collisions(b, [x, y], { stories }).named, `${b.id}: ${x} ; ${y}`).toBeFalsy();
  });
});

describe('Multiples communs — the tablets of the student’s world', () => {
  // the world is written by another agent at the same time: when its story exists, the board reads ITS tablets (one
  // wording); until then the scaffold's stub throws on every read, and this check waits
  const story = Object.values(import.meta.glob('../world/story.js', { eager: true }))[0];
  const rules = (() => {
    try {
      return KEYS.every((k) => story?.TABLETS?.[k]) ? story.TABLETS : null;
    } catch {
      return null;
    }
  })();
  it.skipIf(!rules)(
    'every tablet the board names exists in the world, with its title, its lines and its recalled words',
    () => {
      for (const id of KEYS) {
        expect(rules[id].title, id).toBeTruthy();
        expect(rules[id].lines.length, id).toBeGreaterThan(0);
      }
      expect(names.every((s) => s.recall?.length)).toBe(true);
      for (const n of names) {
        const t = rules[n.tablet];
        // « Qui s’en souvient ? » blanks the tablet's LINES and list only (LessonBoard.jsx › Name), never its title
        const text = [...t.lines, ...(t.list ?? [])].join(' ');
        for (const w of n.recall) expect(text, `${n.tablet}: « ${w} » in its lines`).toContain(w);
      }
    },
  );
});

describe('Multiples communs — the written memo', () => {
  it('has every part of a good lesson plan and runs the four moments in a 45-minute hour', () => {
    expect(partKeys()).toHaveLength(9);
    for (const k of [
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'support',
      'extend',
      'next',
      'connect',
      'stands',
    ])
      expect(MEMO[k], k).toBeTruthy();
    expect(MEMO.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(MEMO.phases.map((p) => p.min)).toEqual(MEMO.glance.minutes.map((m) => m.min));
    expect(MEMO.criteria).toHaveLength(KEYS.length); // one observable criterion per key
    expect(MEMO.written).toHaveLength(KEYS.length);
  });

  it('proposes four openings with a different drawing each, the board’s among them, numbers true', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject({ a: BOARD.situation.a, b: BOARD.situation.b });
    for (const o of MEMO.openings) {
      expect(o.story, o.id).toContain(String(o.a));
      expect(openingFacts(o).first.exact, `${o.id}: the first try leaves something`).toBe(false);
      if (o.alt) expect(openingFacts(o).second.exact, `${o.id}: the second try fits`).toBe(true);
    }
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.bridge.first).toMatchObject({ q: 2, r: 6 });
    expect(f.tiles.first).toMatchObject({ q: 7, r: 3 });
    expect(f.tiles.second).toMatchObject({ q: 5, r: 0 });
    expect(f.shelves.first).toMatchObject({ q: 7, r: 2 });
    expect(f.shelves.second).toMatchObject({ q: 4, r: 0 });
    expect(f.teams.first).toMatchObject({ q: 4, r: 4 });
    expect(f.teams.second).toMatchObject({ q: 3, r: 0 });
    // the first meeting each opening's « why » quotes
    expect(lcmApart(22, 8)).toBe(88);
    expect(lcmApart(6, 9)).toBe(18);
    expect(lcmApart(6, 11)).toBe(66);
    expect(lcmApart(8, 12)).toBe(24);
    expect(MEMO.openings[0].expect).toContain('44, 66, puis 88');
    expect(22 + 8).toBe(30);
    expect(22 * 8).toBe(176);
    expect(6 * 9).toBe(54);
    expect(8 * 12).toBe(96);
    expect(6 + 11).toBe(17);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misses are wrong, and their numbers as written
    expect(88 < 176 && 176 % 8 === 0 && 176 % 22 === 0).toBe(true); // the product holds, but not first
    expect(22 * 4).toBe(88);
    expect(8 * 11).toBe(88);
    expect(325 % 5).toBe(0); // « 325 avec un seul 5 »: 2³ × 5 × 13 = 520 is not a multiple of 325
    expect(2 ** 3 * 5 * 13).toBe(520);
    expect(520 % 325).not.toBe(0);
    expect(520 % 40).toBe(0);
    expect(11 * 16 * 17).toBe(2992); // the sleep days' product, far beyond 612
    expect(2992 > 612).toBe(true);
    expect(612 % 12 === 0 && 612 % 17 === 0 && 612 % 18 === 0).toBe(true); // day 612 is the 612th day since the start
  });

  it('writes only true equalities: the criteria, the exit ticket, the extension', () => {
    const [crews, factors, gears, teams] = MEMO.criteria.map((x) => x.check);
    expect(crews.common).toEqual(commonMultiplesApart(crews.a, crews.b, 300));
    expect(crews.first).toBe(crews.common[0]);
    expect(factors.lcm).toBe(lcmApart(factors.a, factors.b));
    expect(factors.powers).toEqual(powersOf(factors.lcm));
    expect(gears.lcm).toBe(lcmApart(gears.a, gears.b));
    expect(gears.turns).toEqual([gears.lcm / gears.a, gears.lcm / gears.b]);
    expect(teams.lcm).toBe(lcmOfApart(teams.cycles));
    expect(teams.day).toBe(teams.lcm + 1);
    expect(MEMO.written[0]).toContain('celui de 22 et de 8 est 88');
    expect(MEMO.written[1]).toContain('$2^{3} \\times 5^{2} \\times 13 = 2\\,600$');
    expect(MEMO.written[3]).toContain('$1 + 612 = 613$');

    const [lists, decomposed, rendezVous] = MEMO.exit.map((x) => x.check);
    expect(lists.common).toEqual(commonMultiplesApart(lists.a, lists.b, 100));
    expect(lists.lcm).toBe(lists.common[0]);
    expect(lcmApart(value(decomposed.a), value(decomposed.b))).toBe(decomposed.lcm);
    expect(decomposed.lcm).toBe(2520);
    expect(2 ** 3 * 3 ** 2 * 5 * 7).toBe(2520);
    expect(rendezVous.lcm).toBe(lcmApart(rendezVous.a, rendezVous.b));
    const [h, m] = rendezVous.start;
    const back = h * 60 + m + rendezVous.lcm;
    expect([Math.floor(back / 60), back % 60]).toEqual(rendezVous.back);

    const { sevenEleven, sevenTwentyOne, commonSixEight, withFourth } = MEMO.extendCheck;
    expect(lcmApart(7, 11)).toBe(sevenEleven);
    expect(lcmApart(7, 21)).toBe(sevenTwentyOne);
    expect(commonMultiplesApart(6, 8, 100)).toEqual(commonSixEight);
    expect(commonSixEight).toHaveLength(4);
    expect(lcmOfApart([12, 17, 18, 4]) + 1).toBe(withFourth);
  });

  it('writes French to the teacher: typography and agreement of every sentence', () => {
    for (const t of stringsIn(MEMO)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
    // « vous » to the teacher (the questions he asks a student say « tu »: those are the student's)
    for (const p of MEMO.phases) expect(`${p.teacher} ${p.watch}`, p.moment).not.toMatch(/\b(tu|ton|ta|tes)\b/);
    expect(MEMO.phases.find((p) => p.moment === 'start').teacher).toMatch(/^Vous /);
  });
});
