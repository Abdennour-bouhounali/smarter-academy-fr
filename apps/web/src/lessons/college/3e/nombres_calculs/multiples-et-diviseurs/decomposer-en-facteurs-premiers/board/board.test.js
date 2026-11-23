import { describe, it, expect } from 'vitest';
import { SCRIPT, BOARD, KEYS, FACTS, sheets } from './script';
import { MEMO } from './memo';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import {
  groupsOf,
  ladderStart,
  ladderLay,
  ladderDone,
  ladderNoZero,
  ladderRack,
  ladderSheet,
  ladderTex,
  ladderRow,
  rowGroups,
} from '../../../../../../../features/classSession/lessonScripts';
import { LADDER_WORDS } from '../../../../../../../features/classSession/LadderStation';
import { isPrime } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { MAX_LINES } from '../../../../../../common/gameworld/divisorIsles/sheet';
import {
  typographyErrors,
  agreementErrors,
  stringsIn,
} from '../../../../../../common/gameworld/kit/authoring/test/suites';
import { readBank, storiesOf, collisions } from '../../../../../../common/gameworld/kit/authoring/test/bank';

/** « La leçon au tableau » of lesson 1: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'ladder', 'name', 'trace'];
const steps = SCRIPT.steps;
const ladders = steps.filter((s) => s.kind === 'ladder');
const names = steps.filter((s) => s.kind === 'name');
const step = (id) => steps.find((s) => s.id === id);

/** The prime factors of n, found here by trying every number — never the world's helper. */
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
const primeApart = (n) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
const product = (xs) => xs.reduce((p, x) => p * x, 1);
/** The ladder of the shortest planks, laid by the board's own logic, plank after plank. */
const shortest = (s) => {
  let st = ladderStart(s.n);
  for (const p of factorsApart(s.n)) st = ladderLay(st, p);
  return st;
};
const tex = (xs) => xs.join(' \\times ');

/** The words of each key's NAME: none may stand on the board before its naming station. */
const FORBIDDEN = {
  'plus-petit-premier': ['premier', 'première', 'facteur', 'décompos'],
  puissances: ['puissance', 'exposant'],
  arret: ['carré', 'arrêt', 'arrête'],
  tableur: ['tableur'],
};

describe('Décomposer un nombre en facteurs premiers — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, chapters, short cues and two copybook pages', () => {
    expect(steps.every((s) => KINDS.includes(s.kind))).toBe(true);
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

  it('opens on the carpenter’s gap: the plank of 5 falls', () => {
    const [first] = steps;
    expect(first.kind).toBe('situation');
    expect(first.bridge).toEqual(BOARD.situation);
    expect(first.bridge.a % first.bridge.b).not.toBe(0);
    expect(step('echelle').n).toBe(first.bridge.a); // the ladder breaks the situation's own gap
  });

  it('every ladder can be laid to 1 case with what it offers, on ONE screen', () => {
    for (const s of ladders) {
      const st = shortest(s);
      expect(ladderDone(st), s.id).toBe(true);
      expect(product(ladderRow(st))).toBe(s.n);
      expect(ladderTex(st), s.id).toBe(
        `${String(s.n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')} = ${tex(factorsApart(s.n))}`,
      );
      expect(factorsApart(s.n).length + 1, `${s.id}: the rungs on the board`).toBeLessThanOrEqual(9);
      // every plank of the shortest ladder is on offer when its turn comes (the rack, the whole gap or the sheet)
      let now = ladderStart(s.n);
      for (const p of factorsApart(s.n)) {
        const offered = s.sheet
          ? ladderSheet(s, now).some((l) => l.p === p && l.r === 0) || ladderSheet(s, now).every((l) => l.r !== 0)
          : ladderRack(s, now).some((x) => x.d === p);
        expect(offered, `${s.id}: ${p} on ${now.gap}`).toBe(true);
        now = ladderLay(now, p);
      }
      if (!s.sheet) expect(ladderRack(s, ladderStart(s.n)).length, s.id).toBeLessThanOrEqual(8); // two rows of four
      expect(s.after, s.id).toContain(`= ${tex(factorsApart(s.n))}$`);
    }
  });

  it('key 1 — 168: after the planks of 2, neither 4, 6 nor 9 holds; and the row the class may lay with them', () => {
    const s = step('echelle');
    expect(factorsApart(168)).toEqual([2, 2, 2, 3, 7]);
    expect(FACTS.first).toEqual({ factors: [2, 2, 2, 3, 7], left: 21, not: [4, 6, 9] });
    let st = ladderStart(168);
    for (let k = 0; k < 3; k += 1) st = ladderLay(st, 2);
    expect(st.gap).toBe(21);
    for (const d of [4, 6, 9]) expect(ladderLay(st, d).last).toMatchObject({ held: false, before: 21 });
    expect(s.after).toContain('il reste 21 cases');
    expect(s.after).toContain('$4 = 2 \\times 2$, $6 = 2 \\times 3$ et $9 = 3 \\times 3$');
    // a class that lays 4, then 6, then 7 crosses too — with another row, which the proof answers
    let other = ladderStart(168);
    for (const d of [4, 6, 7]) other = ladderLay(other, d);
    expect(ladderDone(other)).toBe(true);
    expect(ladderRow(other)).toEqual([4, 6, 7]);
    expect([4, 6, 9].every((d) => !isPrime(d))).toBe(true);
  });

  it('key 2 — 720: its row counted, 2 × 2 × 2 × 2 = 16 and not 2 × 4', () => {
    const s = step('rangee');
    expect(s.group).toBe(true);
    expect(rowGroups(factorsApart(720))).toEqual([
      { p: 2, k: 4 },
      { p: 3, k: 2 },
      { p: 5, k: 1 },
    ]);
    expect(2 ** 4).toBe(16);
    expect(2 * 4).toBe(8);
    expect(16 * 9 * 5).toBe(720);
    expect(s.after).toContain('4 planches de 2');
    expect(s.after).toContain('$2 \\times 2 \\times 2 \\times 2 = 16$, et non $2 \\times 4 = 8$');
    expect(s.after).toContain('2 planches de 3 : $3 \\times 3 = 9$');
    expect(s.after).toContain('$16 \\times 9 \\times 5 = 720$');
    expect(s.cue).toContain('4 planches de 2');
  });

  it('key 3 — 534 leaves 89: no plank of the rack breaks it, 7 is the last worth trying, the whole gap is offered', () => {
    const s = step('reste');
    expect(factorsApart(534)).toEqual([2, 3, 89]);
    expect(primeApart(89)).toBe(true);
    expect(FACTS.stop).toEqual({ left: 89, last: 7, next: 11 });
    expect(7 * 7 <= 89 && 89 < 11 * 11).toBe(true);
    let st = ladderLay(ladderLay(ladderStart(534), 2), 3);
    expect(st.gap).toBe(89);
    for (const d of s.rack) expect(ladderLay(st, d).rungs, `${d} on 89`).toHaveLength(2); // it falls
    expect(ladderRack(s, st).at(-1)).toEqual({ d: 89, whole: true });
    st = ladderLay(st, 89);
    expect(ladderDone(st)).toBe(true);
    expect(s.after).toContain('$89 = 7 \\times 12 + 5$');
    expect(s.after).toContain('$89 = 11 \\times 8 + 1$');
    expect(7 * 12 + 5).toBe(89);
    expect(11 * 8 + 1).toBe(89);
    expect(8).toBeLessThan(11); // with 11, fewer than 11 planks
    expect(s.after).toContain('moins de 11 planches');
  });

  it('key 4 — 2 387: three sheets, shorter and shorter, each first 0 computed', () => {
    const s = step('feuille');
    expect(factorsApart(2387)).toEqual([7, 11, 31]);
    expect(sheets(2387)).toEqual([
      { n: 2387, lines: 15, zero: 7, after: 341 },
      { n: 341, lines: 7, zero: 11, after: 31 },
      { n: 31, lines: 3, zero: null, after: 1 },
    ]);
    expect(FACTS.sheets).toEqual(sheets(2387));
    let st = ladderStart(2387);
    const first = ladderSheet(s, st);
    expect(first.map((l) => l.p)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
    for (const l of first) expect(l.r).toBe(2387 % l.p);
    expect(first.length).toBeLessThanOrEqual(Math.min(MAX_LINES, 16)); // two columns of eight on the board
    // « no remainder is 0 » said on 2 387: nothing is laid, the zeros are shown
    expect(ladderNoZero(s, st).zeros).toEqual([7, 11, 31]);
    st = ladderLay(st, 7);
    st = ladderLay(st, 11);
    expect(ladderSheet(s, st).every((l) => l.r !== 0)).toBe(true);
    st = ladderNoZero(s, st);
    expect(ladderDone(st)).toBe(true);
    expect(ladderRow(st)).toEqual([7, 11, 31]);
    expect(s.after).toContain('15 lignes pour 2 387, 0 en face de 7');
    expect(s.after).toContain('7 lignes pour 341, 0 en face de 11');
    expect(s.after).toContain('aucun reste nul pour 31');
  });

  it('names each rule after the class has met it: the four keys in order, the copybook holds them in that order', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    steps.forEach((s, i) => {
      if (s.kind === 'name') expect(steps[i - 1].kind, s.id).toBe('ladder');
    });
    expect(steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets)).toEqual(KEYS);
  });

  it('says no key’s name before its naming station — and the station’s own words name none', () => {
    names.forEach((n) => {
      const at = steps.indexOf(n);
      const before = stringsIn(steps.slice(0, at)).join(' ').toLowerCase();
      for (const w of FORBIDDEN[n.tablet]) expect(before, `${n.tablet}: « ${w} »`).not.toContain(w);
    });
    const station = stringsIn(LADDER_WORDS).join(' ').toLowerCase();
    for (const w of Object.values(FORBIDDEN).flat()) expect(station, w).not.toContain(w);
  });

  it('writes French: typography and agreement of every sentence of the script', () => {
    for (const t of stringsIn(SCRIPT)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
  });

  it('uses numbers of its own: none of the exercise bank, none of a story', () => {
    const bank = readBank('decomposer-en-facteurs-premiers');
    const flat = bank.sheets.map((x) => x.text.replace(/\\,| | /g, '')).join('\n');
    const stories = storiesOf();
    const own = [
      BOARD.situation.a,
      BOARD.row.n,
      BOARD.stop.n,
      BOARD.sheet.n,
      FACTS.stop.left,
      ...FACTS.sheets.map((x) => x.n),
    ];
    // a headline number is one of 100 or more (the kit's rule, `collisions`): 31 or 89 are everybody's
    for (const n of own.filter((x) => x >= 100)) {
      expect(collisions(bank, [n], { stories }).clear, `${n}`).toBe(true);
      expect(new RegExp(`(?<![0-9])${n}(?![0-9])`).test(flat), `${n} in the bank`).toBe(false);
    }
  });
});

describe('Décomposer un nombre en facteurs premiers — the tablets of the student’s world', () => {
  // the world is written by another agent at the same time: when it exists, the board reads ITS tablets (one wording)
  // (`world/index.js` hands them to the board; until it exists, the tablets of `world/story.js`)
  const index = Object.values(import.meta.glob('../world/index.js', { eager: true }))[0];
  const story = Object.values(import.meta.glob('../world/story.js', { eager: true }))[0];
  const rules = index?.lesson?.rules ?? index?.rules ?? story?.TABLETS ?? null;
  it.skipIf(!rules)('every tablet the board names exists in the world, with its title and its lines', () => {
    for (const id of KEYS) {
      expect(rules[id], id).toBeTruthy();
      expect(rules[id].title, id).toBeTruthy();
      expect(rules[id].lines.length, id).toBeGreaterThan(0);
    }
    expect(names.every((s) => s.recall?.length)).toBe(true);
    for (const n of names.filter((s) => s.recall)) {
      const t = rules[n.tablet];
      const text = [t.title, ...t.lines, ...(t.list ?? []), ...(t.notes ?? [])].join(' ');
      for (const w of n.recall) expect(text, `${n.tablet}: « ${w} »`).toContain(w);
    }
  });
});

describe('Décomposer un nombre en facteurs premiers — the written memo', () => {
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
  });

  it('proposes four openings with a different drawing each, the board’s among them, numbers true', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject(BOARD.situation); // the memo's board opening IS the script's
    for (const o of MEMO.openings) {
      expect(o.story, o.id).toContain(String(o.a));
      expect(openingFacts(o).first.exact, `${o.id}: the first try leaves something`).toBe(false);
      if (o.alt) expect(openingFacts(o).second.exact, `${o.id}: the second try fits`).toBe(true);
    }
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.bridge.first).toMatchObject({ q: 33, r: 3 });
    expect(f.teams.first).toMatchObject({ q: 6, r: 2 });
    expect(f.shelves.first).toMatchObject({ q: 13, r: 4 });
    expect(f.shelves.second).toMatchObject({ q: 22, r: 0 });
    expect(f.tiles.first).toMatchObject({ q: 4, r: 20 });
    expect(f.tiles.second).toMatchObject({ q: 5, r: 0 });
    // the decompositions the openings quote
    expect(factorsApart(26)).toEqual([2, 13]);
    expect(rowGroups(factorsApart(264))).toEqual([
      { p: 2, k: 3 },
      { p: 3, k: 1 },
      { p: 11, k: 1 },
    ]);
    expect(rowGroups(factorsApart(140))).toEqual([
      { p: 2, k: 2 },
      { p: 5, k: 1 },
      { p: 7, k: 1 },
    ]);
    expect([12, 20, 28, 30].map(factorsApart)).toEqual([
      [2, 2, 3],
      [2, 2, 5],
      [2, 2, 7],
      [2, 3, 5],
    ]);
    expect(MEMO.openings[2].expect).toContain('$264 = 20 \\times 13 + 4$');
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misses are false, the right answers true
    expect(product([4, 6, 7])).toBe(168);
    expect(isPrime(4) || isPrime(6)).toBe(false);
    expect(2 ** 4).not.toBe(8);
    expect(primeApart(2387)).toBe(false);
    expect(factorsApart(299)).toEqual([13, 23]); // « and for 299 ? » — not prime, and its stop is 17
  });

  it('writes only true equalities: the criteria, the exit ticket, the extension', () => {
    const powersOf = (n) => rowGroups(factorsApart(n)).map((g) => [g.p, g.k]);
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check)) {
      if (c.factors) expect(c.factors, JSON.stringify(c)).toEqual(factorsApart(c.n));
      if (c.powers) expect(c.powers, JSON.stringify(c)).toEqual(powersOf(c.n));
      if (c.upTo) {
        // the last prime worth trying: the greatest prime p with p² ⩽ n
        const last = Math.max(
          ...Array.from({ length: c.n }, (_, i) => i + 2).filter((p) => primeApart(p) && p * p <= c.n),
        );
        expect(c.upTo, JSON.stringify(c)).toBe(last);
      }
      if (c.prime != null) expect(primeApart(c.n)).toBe(c.prime);
      if (c.first) {
        const tried = Array.from({ length: c.first - 2 }, (_, i) => i + 2).filter(primeApart);
        expect(tried.every((p) => c.n % p !== 0)).toBe(true);
        expect(c.n % c.first).toBe(0);
      }
    }
    expect(primeApart(89)).toBe(true);
    expect(13 ** 2).toBe(169);
    expect(14 ** 2).toBe(196);
    expect(Math.floor(Math.sqrt(1739))).toBe(41); // « jusqu’à 41 »
    expect(primeApart(47)).toBe(true);
    const { smallestThree, n1024, n1000 } = MEMO.extendCheck;
    const firstWithThree = Array.from({ length: 100 }, (_, i) => i + 2).find(
      (n) => new Set(factorsApart(n)).size === 3,
    );
    expect(smallestThree).toBe(firstWithThree);
    expect(n1024).toEqual(powersOf(1024));
    expect(n1000).toEqual(powersOf(1000));
    expect(MEMO.written[1]).toContain('$720 = 2^4 \\times 3^2 \\times 5$');
    expect(powersOf(720)).toEqual([
      [2, 4],
      [3, 2],
      [5, 1],
    ]);
    expect(MEMO.glance.three[0]).toContain(String(BOARD.first.n));
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
