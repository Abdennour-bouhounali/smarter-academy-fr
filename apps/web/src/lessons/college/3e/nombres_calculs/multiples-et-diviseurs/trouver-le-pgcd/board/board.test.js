import { describe, it, expect } from 'vitest';
import { SCRIPT, BOARD, KEYS, FACTS } from './script';
import { MEMO } from './memo';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
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

/** « La leçon au tableau » of lesson 2: every number the board says is computed here, never trusted. */
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
const divisorsApart = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const commonApart = (a, b) => divisorsApart(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
const pgcdApart = (a, b) => Math.max(...commonApart(a, b));
const product = (xs) => xs.reduce((p, x) => p * x, 1);
const powersOf = (n) => rowGroups(factorsApart(n)).map((g) => [g.p, g.k]);
/** Euclid's rows by repeated subtraction (another path than the script's « % »). */
const euclidApart = (a, b) => {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    let q = 0;
    let r = x;
    while (r >= y) {
      r -= y;
      q += 1;
    }
    out.push([x, y, q, r]);
    [x, y] = [y, r];
  }
  return out;
};
/** A formula as the board writes it: thousands with « \, ». */
const tx = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');

/** The words of each key's NAME: none may stand on the board before its naming station. */
const FORBIDDEN = {
  'diviseurs-communs': ['commun', 'pgcd', 'plus grand diviseur'],
  'lots-identiques': ['identique', 'lots'],
  'pgcd-facteurs': ['exposant', 'facteurs premiers', 'facteur premier'],
  euclide: ['euclide', 'algorithme', 'dernier reste', 'non nul'],
};

describe('Trouver le PGCD de deux nombres — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, chapters, short cues and two copybook pages', () => {
    expect(steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(steps.length).toBeLessThanOrEqual(14);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    for (const s of steps) {
      expect(s.chapter, s.id).toBeTruthy();
      expect(s.cue.length, `${s.id}: « ${s.cue} »`).toBeLessThanOrEqual(70);
      expect(s.cue, s.id).not.toContain('$'); // the cue is plain text in the footer
    }
    expect(steps.at(-1).kind).toBe('trace');
    expect(steps.filter((s) => s.kind === 'trace')).toHaveLength(2);
    expect(groupsOf(SCRIPT)).toHaveLength(5); // four keys and ONE copybook group
  });

  it('opens on the carpenter’s two gaps: the plank of 10 fills 70 and falls on 98', () => {
    const [first] = steps;
    expect(first.kind).toBe('situation');
    expect(first.bridge).toEqual({ a: BOARD.situation.a, b: BOARD.situation.b });
    expect(98 % 10).toBe(8);
    expect(70 % 10).toBe(0);
    expect(first.text).toContain('$70 = 10 \\times 7$');
  });

  it('every ask: its answer is exactly the options that fill its gap, at most six cards, a proof after', () => {
    for (const s of asks) {
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      expect(s.answer, s.id).toEqual(s.options.filter((o) => s.a % o === 0));
      expect(s.answer.length, s.id).toBeGreaterThan(0);
      expect(s.answer.length, `${s.id}: something falls`).toBeLessThan(s.options.length);
      expect(s.after, s.id).toBeTruthy();
    }
  });

  it('key 1 — 70 and 98: the planks of both are 1, 2, 7, 14; 14 is the longest and lays the fewest planks', () => {
    expect(commonApart(70, 98)).toEqual([1, 2, 7, 14]);
    expect(FACTS.common).toEqual([1, 2, 7, 14]);
    expect(FACTS.first).toBe(pgcdApart(70, 98));
    const both = step('deux-fosses');
    // every option fills 70 (the text says so), only 2, 7 and 14 fill 98
    expect(both.options.every((o) => 70 % o === 0)).toBe(true);
    expect(both.answer).toEqual([2, 7, 14]);
    expect(both.after).toContain('$98 = 5 \\times 19 + 3$');
    expect(both.after).toContain('$98 = 10 \\times 9 + 8$');
    expect(both.after).toContain('$98 = 35 \\times 2 + 28$');
    const long = step('la-plus-longue');
    expect(long.options).toEqual(divisorsApart(98).filter((d) => d >= 14));
    expect(long.answer).toEqual([14]);
    expect(long.text).toContain('soit 24 planches');
    expect(70 / 7 + 98 / 7).toBe(24);
    expect(long.after).toContain('soit 12 planches en tout');
    expect(70 / 14 + 98 / 14).toBe(12);
  });

  it('key 2 — 44 clementines and 66 kiwis: 2, 11 and 22 baskets share both; the most is 22, with 2 and 3 in each', () => {
    const s = step('paniers');
    expect(s.options.every((o) => 44 % o === 0)).toBe(true);
    expect(s.answer).toEqual([2, 11, 22]);
    expect(FACTS.baskets).toEqual({ fill: [2, 11, 22], most: pgcdApart(44, 66), each: [2, 3] });
    expect(s.words).toEqual({ card: 'Paniers', held: 'Rien ne reste', fell: 'Il reste des fruits' });
    // the cards and verdicts speak of baskets, never of planks (A10)
    expect(stringsIn(askWords(s)).join(' ')).not.toMatch(/planche|tient|effondre/i);
    expect(s.after).toContain('= 22$, avec 2 clémentines et 3 kiwis');
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

  it('key 3 — 910 and 1 950: of the planks of 1 950, 26, 65 and 130 fill 910; 130 = 2 × 5 × 13 is the longest', () => {
    expect(factorsApart(910)).toEqual([2, 5, 7, 13]);
    expect(factorsApart(1950)).toEqual([2, 3, 5, 5, 13]);
    expect(pgcdApart(910, 1950)).toBe(130);
    expect(FACTS.factors.gcd).toBe(130);
    expect(powersOf(130)).toEqual([
      [2, 1],
      [5, 1],
      [13, 1],
    ]);
    const s = step('facteurs');
    expect(s.options.every((o) => 1950 % o === 0)).toBe(true);
    expect(s.answer).toEqual([26, 65, 130]);
    expect(Math.max(...s.answer)).toBe(130);
    // the two that fall: 39 needs a 3, 325 needs two 5
    expect(factorsApart(39)).toEqual([3, 13]);
    expect(s.after).toContain('$39 = 3 \\times 13$');
    expect(factorsApart(325)).toEqual([5, 5, 13]);
    expect(s.after).toContain('$325 = 5^{2} \\times 13$');
    expect(910 % 3).not.toBe(0);
    expect(910 % 25).not.toBe(0);
    expect(s.text).toContain('$1\\,950 = 2 \\times 3 \\times 5^{2} \\times 13$');
    expect(s.after).toContain('= 2 \\times 5 \\times 13 = 130$');
  });

  it('key 4 — 2 173 and 1 517: four divisions; of the numbers they write only 41 fills 2 173', () => {
    const rows = euclidApart(2173, 1517);
    expect(rows).toEqual([
      [2173, 1517, 1, 656],
      [1517, 656, 2, 205],
      [656, 205, 3, 41],
      [205, 41, 5, 0],
    ]);
    expect(FACTS.euclid.rows).toEqual(rows);
    expect(FACTS.euclid.gcd).toBe(pgcdApart(2173, 1517));
    expect(pgcdApart(2173, 1517)).toBe(41);
    const s = step('divisions');
    expect(s.options).toEqual([1517, 656, 205, 41]);
    expect(s.answer).toEqual([41]);
    expect(s.text).toContain('$2\\,173 = 1\\,517 \\times 1 + 656$');
    expect(s.text).toContain('$1\\,517 = 656 \\times 2 + 205$');
    expect(s.after).toContain('$656 = 205 \\times 3 + 41$');
    expect(s.after).toContain('$205 = 41 \\times 5 + 0$');
    expect(s.after).toContain('$2\\,173 = 41 \\times 53$');
    expect(s.after).toContain('$1\\,517 = 41 \\times 37$');
    // the two primes are beyond what the class tries by hand: decomposing would be long
    expect(factorsApart(2173)).toEqual([41, 53]);
    expect(factorsApart(1517)).toEqual([37, 41]);
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
      for (const w of FORBIDDEN[n.tablet]) expect(before, `${n.tablet}: « ${w} »`).not.toContain(w);
    });
    const station = stringsIn([LADDER_WORDS, askWords({}), askWords(step('paniers'))])
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

  it('uses numbers of its own: none of the exercise bank, none of a story', () => {
    const bank = readBank('trouver-le-pgcd');
    const earlier = readBank('decomposer-en-facteurs-premiers');
    const flat = [...bank.sheets, ...earlier.sheets].map((x) => x.text.replace(/\\\\,| | /g, '')).join('\n');
    const stories = storiesOf();
    const own = [
      ...[BOARD.factors.a, BOARD.factors.b, ...BOARD.factors.options, BOARD.euclid.a, BOARD.euclid.b],
      ...FACTS.euclid.numbers,
      FACTS.factors.gcd,
      // every rung the two ladders write
      ...ladders.flatMap((s) => {
        let m = s.n;
        return factorsApart(s.n).map((p) => (m /= p));
      }),
      // the memo's exit ticket
      851,
      629,
      222,
      185,
    ];
    // a headline number is one of 100 or more (the kit's rule, `collisions`)
    for (const n of own.filter((x) => x >= 100)) {
      expect(collisions(bank, [n], { stories }).clear, `${n}`).toBe(true);
      expect(new RegExp(`(?<![0-9])${n}(?![0-9])`).test(flat), `${n} in a bank`).toBe(false);
    }
    // the pairs the board names are none of the bank's
    for (const [a, b] of [
      [70, 98],
      [44, 66],
      [910, 1950],
      [2173, 1517],
      [34, 85],
      [851, 629],
    ])
      expect(collisions(bank, [a, b], { stories }).named, `${a} ; ${b}`).toBeFalsy();
  });
});

describe('Trouver le PGCD de deux nombres — the tablets of the student’s world', () => {
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
        for (const w of n.recall) expect(text, `${n.tablet}: « ${w} » in its lines`).toContain(w);
      }
    },
  );
});

describe('Trouver le PGCD de deux nombres — the written memo', () => {
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
    expect(f.bridge.first).toMatchObject({ q: 9, r: 8 });
    expect(f.teams.first).toMatchObject({ q: 6, r: 3 });
    expect(f.shelves.first).toMatchObject({ q: 8, r: 5 });
    expect(f.shelves.second).toMatchObject({ q: 5, r: 0 });
    expect(f.tiles.first).toMatchObject({ q: 5, r: 4 });
    expect(f.tiles.second).toMatchObject({ q: 4, r: 0 });
    // the PGCD each opening's « why » quotes
    expect(pgcdApart(26, 39)).toBe(13);
    expect(pgcdApart(85, 68)).toBe(17);
    expect(pgcdApart(64, 80)).toBe(16);
    expect(powersOf(68)).toEqual([
      [2, 2],
      [17, 1],
    ]);
    expect(powersOf(64)).toEqual([[2, 6]]);
    expect(powersOf(80)).toEqual([
      [2, 4],
      [5, 1],
    ]);
    expect((64 / 16) * (80 / 16)).toBe(20);
    expect(MEMO.openings[2].expect).toContain('$85 = 10 \\times 8 + 5$');
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
    expect(pgcdApart(70, 98)).not.toBe(7);
    expect(98 - 70).toBe(28);
    expect(70 % 28).toBe(14); // « 70 = 28 × 2 + 14 »
    expect(2 * 25 * 13).toBe(650);
    expect(910 % 650).not.toBe(0);
    expect(euclidApart(2173, 1517).at(-1)[2]).toBe(5); // the last quotient
    expect(1517 % 5).not.toBe(0);
  });

  it('writes only true equalities: the criteria, the exit ticket, the extension', () => {
    for (const c of MEMO.criteria.map((x) => x.check)) {
      if (c.common) expect(c.common).toEqual(commonApart(c.a, c.b));
      if (c.pgcd) expect(c.pgcd).toBe(pgcdApart(c.a, c.b));
      if (c.most) expect(c.most).toBe(pgcdApart(c.a, c.b));
      if (c.each) expect(c.each).toEqual([c.a / c.most, c.b / c.most]);
      if (c.powers) expect(c.powers).toEqual(powersOf(c.pgcd));
      if (c.rows) expect(c.rows).toBe(euclidApart(c.a, c.b).length);
    }
    const [lists, factors, euclid] = MEMO.exit.map((x) => x.check);
    expect(lists.common).toEqual(commonApart(34, 85));
    expect(lists.pgcd).toBe(pgcdApart(34, 85));
    const value = (ps) => ps.reduce((p, [b, k]) => p * b ** k, 1);
    expect(factors.pgcd).toBe(pgcdApart(value(factors.a), value(factors.b)));
    expect(euclidApart(851, 629)).toEqual([
      [851, 629, 1, 222],
      [629, 222, 2, 185],
      [222, 185, 1, 37],
      [185, 37, 5, 0],
    ]);
    expect(euclid.rows).toBe(4);
    expect(euclid.pgcd).toBe(pgcdApart(851, 629));
    const { consecutive, coprimeTo50, rows34and21 } = MEMO.extendCheck;
    expect(consecutive).toBe(pgcdApart(41, 42));
    expect(coprimeTo50).toBe(Array.from({ length: 50 }, (_, i) => i + 1).filter((n) => pgcdApart(n, 50) === 1).length);
    expect(rows34and21).toBe(euclidApart(34, 21).length);
    expect(MEMO.written[0]).toContain('$\\text{PGCD}(70 ; 98) = 14$');
    expect(MEMO.written[2]).toContain('= 2 \\times 5 \\times 13 = 130$');
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
