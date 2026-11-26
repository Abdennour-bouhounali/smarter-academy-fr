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
import CLASS_TEST from '../../../../../../../../../../content/class-tests/3e/fraction-irreductible.json';

/** « La leçon au tableau » of lesson 3: every number the board says is computed here, never trusted. */
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
const value = (ps) => ps.reduce((p, [b, k]) => p * b ** k, 1);
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
/** A fraction made irreducible by striking the common prime factors one by one (not by the PGCD). */
const strike = (n, d) => {
  const fn = factorsApart(n);
  const fd = factorsApart(d);
  for (const p of [...fn]) {
    const j = fd.indexOf(p);
    if (j >= 0) {
      fd.splice(j, 1);
      fn.splice(fn.indexOf(p), 1);
    }
  }
  return [product(fn), product(fd)];
};
/** A formula as the board writes it: thousands with « \, ». */
const tx = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');

/** The words of each key's NAME: none may stand on the board before its naming station. */
const FORBIDDEN = {
  'simplifier-facteurs': ['barr', 'simplifi', 'irréductible', 'commun'],
  irreductible: ['irréductible', 'aucun facteur', 'entre eux'],
  'diviser-par-le-pgcd': ['une seule', 'en une', 'directement', 'd’un coup'],
  'resultat-irreductible': ['résultat', 'vérifi'],
};

describe('Rendre une fraction irréductible — the script of the lesson on the board', () => {
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

  it('opens on the carpenter’s bridge: 84 cases, 36 lit; the plank of 7 fills the bridge and leaves one case of the lit stretch', () => {
    const [first] = steps;
    expect(first.kind).toBe('situation');
    expect(first.bridge).toEqual({ a: BOARD.situation.lit, b: BOARD.situation.first });
    expect(84 % 7).toBe(0);
    expect(36 % 7).toBe(1);
    expect(first.text).toContain('$84 = 7 \\times 12$');
    expect(first.text).toContain('\\frac{36}{84}');
  });

  it('every ask: its answer is exactly the options that fill its bridge, at most six cards, a proof after', () => {
    for (const s of asks) {
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      expect(s.answer, s.id).toEqual(s.options.filter((o) => s.a % o === 0));
      expect(s.answer.length, s.id).toBeGreaterThan(0);
      expect(s.answer.length, `${s.id}: something falls`).toBeLessThan(s.options.length);
      expect(s.after, s.id).toBeTruthy();
    }
  });

  it('gate B, 2026-11-26: the world’s words — « éclairée », « pancarte » — and a ladder that names what it cuts', () => {
    const all = JSON.stringify([SCRIPT, MEMO]);
    expect(all).not.toMatch(/allum/i);
    expect(all).not.toMatch(/panneau/i);
    const ladders = steps.filter((s) => s.kind === 'ladder');
    expect(ladders.map((s) => s.words?.start)).toEqual(['Partie éclairée\u00a0:', 'Pont entier\u00a0:']);
    // the oral question names only what is on the screen: no plank the station has not laid
    expect(step('echelle-1').cue).not.toMatch(/\d/);
  });

  it('every ask leaves its plank cards their height: statement and proof within the budget of one screen', () => {
    // 2026-11-26 walk (ask-pgcd): a three-line statement and a three-line proof with tall fractions squeezed the four
    // cards — each card's equation and verdict left it. The stations that held measured 334, 360 and 472 characters of
    // source, the failing one about 570, and its statement held a fraction on top of its four formulas. A proxy of the
    // walk's « out of button.cs-plankcard » check, kept on the lesson's side.
    const fracs = (t) => (t.match(/\\frac/g) ?? []).length;
    for (const s of asks) {
      expect(s.text.length + s.after.length, s.id).toBeLessThanOrEqual(480);
      expect(fracs(s.text) + fracs(s.after), s.id).toBeLessThanOrEqual(7);
    }
  });

  it('every ladder can be laid to 1 case with its rack, on ONE screen', () => {
    expect(ladders.map((s) => s.n)).toEqual([490, 686]);
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

  it('key 1 — 490 and 686: of the planks of 490, 14, 49 and 98 fill 686; 98 = 2 × 7² is what the rows share, and gives 5/7', () => {
    expect(factorsApart(490)).toEqual([2, 5, 7, 7]);
    expect(factorsApart(686)).toEqual([2, 7, 7, 7]);
    expect(pgcdApart(490, 686)).toBe(98);
    expect(FACTS.factors.gcd).toBe(98);
    expect(FACTS.factors.shared).toEqual([2, 7, 7]); // 7 struck twice: « as often as it is in both »
    expect(powersOf(98)).toEqual([
      [2, 1],
      [7, 2],
    ]);
    expect(strike(490, 686)).toEqual([5, 7]);
    expect(FACTS.factors.reduced).toEqual([5, 7]);
    const s = step('facteurs');
    expect(s.options.every((o) => 490 % o === 0)).toBe(true);
    expect(s.answer).toEqual([14, 49, 98]);
    expect(FACTS.factors.miss).toEqual([10, 35, 70]);
    // the three that fall each need a 5, absent from 686
    for (const o of [10, 35, 70]) expect(factorsApart(o)).toContain(5);
    expect(s.text).toContain('$490 = 2 \\times 5 \\times 7^{2}$ et $686 = 2 \\times 7^{3}$');
    expect(s.after).toContain('$2 \\times 7^{2} = 98$');
    expect(s.after).toContain('$490 = 98 \\times 5$ et $686 = 98 \\times 7$');
    expect(s.after).toContain('\\frac{5}{7}$');
  });

  it('key 2 — 91 lit of 124: only the plank of 1 fills both, and neither number is prime', () => {
    const s = step('reste');
    expect(divisorsApart(91)).toEqual(s.options);
    expect(s.answer).toEqual([1]);
    expect(pgcdApart(91, 124)).toBe(1);
    expect(FACTS.stays.gcd).toBe(1);
    expect(factorsApart(91)).toEqual([7, 13]);
    expect(factorsApart(124)).toEqual([2, 2, 31]);
    expect(124 % 7).toBe(5);
    expect(124 % 13).toBe(7);
    expect(124 % 91).toBe(33);
    expect(s.after).toContain('$124 = 7 \\times 17 + 5$');
    expect(s.after).toContain('$124 = 13 \\times 9 + 7$');
    expect(s.after).toContain('$124 = 91 \\times 1 + 33$');
    expect(s.after).toContain('$91 = 7 \\times 13$ et $124 = 2^{2} \\times 31$');
  });

  it('key 3 — 627 lit of 726: Euclid’s three divisions give 33; 11 and 33 fill both; one division by 33 writes 19/22', () => {
    const rows = euclidApart(627, 726);
    expect(rows).toEqual([
      [726, 627, 1, 99],
      [627, 99, 6, 33],
      [99, 33, 3, 0],
    ]);
    expect(FACTS.euclid.rows).toEqual(rows);
    expect(pgcdApart(627, 726)).toBe(33);
    expect(FACTS.euclid.gcd).toBe(33);
    expect(commonApart(627, 726)).toEqual([1, 3, 11, 33]);
    const s = step('pgcd');
    expect(s.options.every((o) => 627 % o === 0)).toBe(true);
    expect(s.answer).toEqual([11, 33]);
    expect(s.text).toContain('$726 = 627 \\times 1 + 99$');
    expect(s.text).toContain('$627 = 99 \\times 6 + 33$');
    expect(s.after).toContain('$99 = 33 \\times 3 + 0$');
    expect(627 / 33).toBe(19);
    expect(726 / 33).toBe(22);
    expect(s.after).toContain('\\frac{19}{22}');
    // 11 is a common divisor too, but leaves 57/66, which a plank of 3 still fills
    expect([627 / 11, 726 / 11]).toEqual([57, 66]);
    expect(pgcdApart(57, 66)).toBe(3);
    expect(s.after).toContain('\\frac{57}{66}');
    expect(strike(627, 726)).toEqual([19, 22]);
  });

  it('key 4 — 11/20 × 34/55 = 374/1 100: each fraction is finished, the product is not; 22 gives 17/50', () => {
    expect(pgcdApart(11, 20)).toBe(1);
    expect(pgcdApart(34, 55)).toBe(1);
    expect(11 * 34).toBe(374);
    expect(20 * 55).toBe(1100);
    expect(pgcdApart(374, 1100)).toBe(22);
    expect(FACTS.product).toMatchObject({ n: 374, d: 1100, gcd: 22, reduced: [17, 50] });
    expect(pgcdApart(17, 50)).toBe(1);
    expect(strike(374, 1100)).toEqual([17, 50]);
    const s = step('produit');
    expect(s.options.every((o) => 374 % o === 0)).toBe(true);
    expect(s.answer).toEqual([11, 22]);
    expect(s.text).toContain('\\frac{11}{20} \\times \\frac{34}{55} = \\frac{374}{1\\,100}');
    expect(s.after).toContain('$374 = 22 \\times 17$ et $1\\,100 = 22 \\times 50$');
    expect(s.after).toContain('= \\frac{17}{50}$');
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

  it('uses numbers of its own: none of the exercise bank, none of another lesson’s, none of a story', () => {
    const banks = [
      'fraction-irreductible',
      'decomposer-en-facteurs-premiers',
      'trouver-le-pgcd',
      'multiples-et-diviseurs-communs',
      'thales-configuration-papillon',
    ].map((id) => readBank(id));
    const stories = storiesOf();
    const own = [
      BOARD.factors.lit,
      BOARD.factors.whole,
      BOARD.stays.whole,
      BOARD.pgcd.lit,
      BOARD.pgcd.whole,
      FACTS.euclid.rows[0][3],
      BOARD.product.x[0] * BOARD.product.y[0],
      BOARD.product.x[1] * BOARD.product.y[1],
      // every rung the two ladders write
      ...ladders.flatMap((s) => {
        let m = s.n;
        return factorsApart(s.n).map((p) => (m /= p));
      }),
      // the memo's exit ticket
      667,
      725,
      476,
      1020,
      111,
    ];
    // a headline number is one of 100 or more (the kit's rule, `collisions`)
    for (const bank of banks)
      for (const n of own.filter((x) => x >= 100))
        expect(collisions(bank, [n], { stories }).clear, `${bank.id}: ${n}`).toBe(true);
  });
});

describe('Rendre une fraction irréductible — the tablets of the student’s world', () => {
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

describe('Rendre une fraction irréductible — the written memo', () => {
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
    expect(MEMO.openings[0]).toMatchObject({ a: BOARD.situation.lit, b: BOARD.situation.first });
    for (const o of MEMO.openings) {
      expect(o.story, o.id).toContain(String(o.a));
      expect(openingFacts(o).first.exact, `${o.id}: the first try leaves something`).toBe(false);
      if (o.alt) expect(openingFacts(o).second.exact, `${o.id}: the second try fits`).toBe(true);
    }
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.bridge.first).toMatchObject({ q: 5, r: 1 });
    expect(f.teams.first).toMatchObject({ q: 10, r: 2 });
    expect(f.shelves.first).toMatchObject({ q: 11, r: 2 });
    expect(f.shelves.second).toMatchObject({ q: 9, r: 0 });
    expect(f.tiles.first).toMatchObject({ q: 14, r: 4 });
    expect(f.tiles.second).toMatchObject({ q: 11, r: 0 });
    // the fractions each opening's « why » quotes
    expect(strike(30, 42)).toEqual([5, 7]);
    expect(pgcdApart(30, 42)).toBe(6);
    expect(42 / 6).toBe(7);
    expect(30 / 6).toBe(5);
    expect(strike(40, 90)).toEqual([4, 9]);
    expect(40 % 10).toBe(0);
    expect(strike(56, 88)).toEqual([7, 11]);
    expect((88 / 8) * (56 / 8)).toBe(77);
    expect(MEMO.openings[0].expect).toContain('$36 = 7 \\times 5 + 1$');
    expect(MEMO.openings[2].expect).toContain('$90 = 8 \\times 11 + 2$');
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
    expect([490 / 2, 686 / 2]).toEqual([245, 343]);
    expect(pgcdApart(245, 343)).toBe(49); // 7² still stands in both
    expect([490 / 7, 686 / 7]).toEqual([70, 98]);
    expect(pgcdApart(70, 98)).toBe(14); // « one 7 only » stops early
    expect([627 / 11, 726 / 11]).toEqual([57, 66]);
    expect(pgcdApart(57, 66)).toBeGreaterThan(1);
    expect([11 * 34, 20 * 55]).toEqual([374, 1100]);
  });

  it('writes only true equalities: the criteria, the exit ticket, the extension', () => {
    const [c1, c2, c3, c4] = MEMO.criteria.map((x) => x.check);
    expect(value(c1.shared)).toBe(pgcdApart(c1.a, c1.b));
    expect(powersOf(value(c1.shared))).toEqual(c1.shared);
    expect(strike(c1.a, c1.b)).toEqual(c1.reduced);
    expect(c2.pgcd).toBe(pgcdApart(c2.a, c2.b));
    expect(c3.pgcd).toBe(pgcdApart(c3.a, c3.b));
    expect([c3.a / c3.pgcd, c3.b / c3.pgcd]).toEqual(c3.reduced);
    expect([c4.x[0] * c4.y[0], c4.x[1] * c4.y[1]]).toEqual([c4.n, c4.d]);
    expect(strike(c4.n, c4.d)).toEqual(c4.reduced);

    const [decomposed, stays, euclid, calc] = MEMO.exit.map((x) => x.check);
    expect(strike(value(decomposed.top), value(decomposed.bottom))).toEqual(decomposed.reduced);
    expect(pgcdApart(stays.n, stays.d) === 1).toBe(stays.irreducible);
    expect(euclidApart(euclid.n, euclid.d)).toHaveLength(euclid.rows);
    expect(euclidApart(euclid.n, euclid.d).at(-2)[3]).toBe(euclid.pgcd);
    expect(pgcdApart(euclid.n, euclid.d)).toBe(euclid.pgcd);
    expect([euclid.n / euclid.pgcd, euclid.d / euclid.pgcd]).toEqual(euclid.reduced);
    expect([calc.x[0] * calc.y[0], calc.x[1] * calc.y[1]]).toEqual([calc.n, calc.d]);
    expect(pgcdApart(calc.n, calc.d)).toBe(calc.pgcd);
    expect([calc.n / calc.pgcd, calc.d / calc.pgcd]).toEqual(calc.reduced);
    // each fraction of the exit calculation is already irreducible
    expect(pgcdApart(...calc.x)).toBe(1);
    expect(pgcdApart(...calc.y)).toBe(1);
    expect(MEMO.exit[2].a).toContain('$725 = 667 \\times 1 + 58$');
    expect(MEMO.exit[2].a).toContain('$667 = 58 \\times 11 + 29$');
    expect(MEMO.written[2]).toContain('\\dfrac{19}{22}');
    expect(MEMO.written[3]).toContain('\\dfrac{17}{50}');
    const { totatives30, consecutive } = MEMO.extendCheck;
    expect(totatives30).toBe(Array.from({ length: 29 }, (_, i) => i + 1).filter((n) => pgcdApart(n, 30) === 1).length);
    expect(consecutive).toBe(pgcdApart(41, 42));
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

describe('Rendre une fraction irréductible — the class test', () => {
  const all = [...CLASS_TEST.start, ...CLASS_TEST.end, ...CLASS_TEST.pool];
  const fracs = (t) => [...t.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])]);
  it('has its shape: ids, items, two teasers each paired at the end, a check on every question', () => {
    expect(CLASS_TEST).toMatchObject({ lesson: 'fraction-irreductible', grade: '3e', version: 1 });
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    expect(CLASS_TEST.start.filter((q) => q.teaser).map((q) => q.id)).toEqual(['s7', 's8']);
    expect(CLASS_TEST.end.filter((q) => q.pairOf).map((q) => q.pairOf)).toEqual(['s7', 's8']);
    for (const q of all) {
      expect(['3e.m1.r05', '4e.m1.r07', '3e.m1.r06'], q.id).toContain(q.item);
      expect(q.check?.type, q.id).toBeTruthy();
      if (q.kind === 'choice') expect(q.options[q.answer], q.id).toBeTruthy();
      expect(typographyErrors(q.text), q.id).toEqual([]);
    }
  });
  it('every answer is computed again here, by another path than the generator’s', () => {
    const irr = (n, d) => pgcdApart(n, d) === 1;
    const by = Object.fromEntries(all.map((q) => [q.id, q]));
    const right = (q) => q.options[q.answer];
    // irreducible or not, the PGCD to divide by
    for (const id of ['s7', 'e1']) expect(by[id].answer, id).toBe(irr(...fracs(by[id].text)[0]));
    for (const id of ['s8', 'e2']) expect(by[id].answer, id).toBe(pgcdApart(...fracs(by[id].text)[0]));
    expect(fracs(right(by.e5)).every(([n, d]) => irr(n, d))).toBe(true);
    expect(by.e5.options.filter((o) => irr(...fracs(o)[0]))).toHaveLength(1);
    expect(by.p1.options.filter((o) => irr(...fracs(o)[0]))).toEqual([right(by.p1)]);
    // the equal fraction: same value, finished
    for (const id of ['s1', 'e4']) {
      const [n, d] = fracs(by[id].text)[0];
      const [x, y] = fracs(right(by[id]))[0];
      expect(x * d, id).toBe(y * n);
      expect(irr(x, y), id).toBe(true);
    }
    expect(by.s2.answer * 39).toBe(3 * 65);
    expect(by.s4.answer).toBe(factorsApart(152).filter((p) => p === 2).length);
    expect(factorsApart(72)).toEqual([2, 2, 2, 3, 3]);
    expect(by.s5.answer).toBe(2 ** 3 * 3 * 5 === 60);
    expect(by.s6.answer).toBe(16 * 34 === 10 * 40);
    // the calculations: raw, right, and the third option is an equal fraction that is not finished
    const calc = [
      ['e7', (a, b, c) => [a + c, b]],
      ['e8', (a, b, c, d) => [a * c, b * d]],
      ['p5', (a, b, c, d) => [a * c, b * d]],
    ];
    for (const [id, op] of calc) {
      const [[a, b], [c, d]] = fracs(by[id].text);
      const [n, den] = op(a, b, c, d);
      const g = pgcdApart(n, den);
      expect(fracs(right(by[id]))[0], id).toEqual([n / g, den / g]);
      expect(fracs(by[id].options[0])[0], id).toEqual([n, den]);
    }
    const [[a, b], [c, d]] = fracs(by.p8.text);
    expect(by.p8.answer).toBe((b * d) / pgcdApart(a * d + c * b, b * d));
    expect(by.p2.answer).toBe(72 / pgcdApart(45, 72));
    expect(by.p6.answer).toBe((2 * 9 * 11) / pgcdApart(2 * 9 * 11, 3 * 11 * 13));
    // the strikes: e3 with its two decompositions, e6 with its own
    expect(strike(60, 72)).toEqual(fracs(right(by.e3))[0]);
    expect(strike(48, 60)).toEqual(fracs(right(by.e6))[0]);
  });
});
