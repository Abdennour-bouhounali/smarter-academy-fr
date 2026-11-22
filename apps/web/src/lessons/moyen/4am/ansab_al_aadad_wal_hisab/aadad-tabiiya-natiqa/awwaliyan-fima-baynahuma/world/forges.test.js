/**
 * THE FORGES of lesson `awwaliyan-fima-baynahuma`: the shared checks (`describeForges`, kit/authoring/test/suites.js),
 * then only what is this lesson's own — the false rules its students really hold, where each one falls, the last steps
 * with their conclusion (`verdict`), and the numbers of the mirrors checked against the bank and the other stories.
 */
import { describe, it, expect } from 'vitest';
import { runOn } from '../../../../../../common/gameworld/kit/forge';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { pairKey } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { allRules, describeForges } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { bankPairs, collisions, readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { BANK_PAIRS, FORGES } from './forges';
import { PROOF_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { NUMBERS, euclid, gcd } from './math';

const ID = 'awwaliyan-fima-baynahuma';
const fired = (list) => list.map(([a, b]) => ({ a, b }));
const [O1, O2] = NUMBERS.only.gaps;
const [C1, C2] = NUMBERS.common.gaps;
const [P1, P2] = NUMBERS.proof.gaps;
const [W1, W2] = NUMBERS.witness.gaps;
const [H1, H2] = NUMBERS.hidden.gaps;

// ───────── what the WORLD logs while he plays the islands (a bridge per line: the gap, the plank) ─────────
const ONLY = fired([
  [O1, 1],
  [O2, 1],
]);
const COMMON = fired([
  [C1, 13],
  [C2, 13],
]);
const PROOF = fired([
  [P1, 1],
  [P2, 1],
]);
/** The shortest road: the right plank at once (on « hidden » the workshop opens after two falls on the first gap). */
const AT_ONCE = {
  awwaliyan: [...ONLY, ...COMMON],
  'ithbat-awwaliyan': [],
  'shahid-wahid': fired([
    [W1, 5],
    [W2, 5],
    [H1, 2],
    [H1, 3],
    [H1, 17],
    [H2, 17],
  ]),
};
/** The story walk's road: one or two planks first. */
const WALKED = {
  awwaliyan: fired([
    [O1, 5],
    [O2, 5],
    [O1, 1],
    [O2, 1],
    [C1, 3],
    [C1, 1],
    [C1, 13],
    [C2, 13],
  ]),
  'ithbat-awwaliyan': [],
  'shahid-wahid': fired([
    [W1, 3],
    [W2, 3],
    [W1, 5],
    [W2, 5],
    [H1, 5],
    [H2, 5],
    [H1, 2],
    [H1, 17],
    [H2, 17],
  ]),
};
/** The longest road: every plank a student tries. */
const EVERY = {
  awwaliyan: fired([
    [O1, 3],
    [O1, 9],
    [O1, 5],
    [O2, 5],
    [O1, 1],
    [O2, 1],
    [C1, 2],
    [C1, 3],
    [C2, 3],
    [C1, 1],
    [C2, 1],
    [C1, 13],
    [C2, 13],
  ]),
  'ithbat-awwaliyan': [],
  'shahid-wahid': fired([
    [W1, 2],
    [W1, 10],
    [W1, 9],
    [W1, 3],
    [W2, 3],
    [W1, 5],
    [W2, 5],
    [H1, 2],
    [H1, 3],
    [H1, 9],
    [H1, 10],
    [H1, 5],
    [H2, 5],
    [H1, 1],
    [H1, 17],
    [H2, 17],
  ]),
};
/** The log of the road before each mirror (the bridges of the earlier convoys: none is his there). */
const BEFORE = {
  'ithbat-awwaliyan': [...ONLY, ...COMMON],
  'shahid-wahid': [...ONLY, ...COMMON, ...PROOF],
};
/** What ✅'s experiment hands back: both notebooks played to the end. */
const PROOF_RESULT = {
  rounds: PROOF_INQUIRY.rounds.map(({ a, b }) => {
    const L = ladderOf(a, b, 'divide');
    return { a, b, mode: 'divide', steps: L.steps, guessed: L.steps, gcd: L.gcd, guesses: [] };
  }),
};
/** The right answer of each last step, computed from its case. */
const SOLVE = {
  awwaliyan: (c) => ({ g: gcd(c.A, c.B) }),
  'ithbat-awwaliyan': (c) => {
    const r = euclid(c.A, c.B);
    const row = (i) => ({ [`a${i}`]: r[i - 1].a, [`b${i}`]: r[i - 1].b, [`q${i}`]: r[i - 1].q, [`r${i}`]: r[i - 1].r });
    return { q1: r[0].q, r1: r[0].r, ...row(2), ...row(3), g: gcd(c.A, c.B) };
  },
  'shahid-wahid': (c) => {
    const g = gcd(c.A, c.B);
    const d = [2, 3, 5, 7, 11, 13].find((p) => g % p === 0);
    return { d, qa: c.A / d, e: d, qb: c.B / d };
  },
};
/** The words of a key's name and of what it states: no sentence of its forge says them before the last step. */
const FORBIDDEN = {
  awwaliyan: /فيما بينهما|أوّليّان|أوّليّين|PGCD|قاسم/,
  'ithbat-awwaliyan': /نثبت|إثبات|برهان|غير معدوم/,
  'shahid-wahid': /يكفي|شاهد|قاسم/,
};
/**
 * The kit's suite calls `use.check(case, values)` without a conclusion: every last step of this lesson ends on one
 * (`use.verdict`, the frame's yes / no). Here the suite is handed the right conclusion; the lesson's own tests below
 * check that a wrong one is refused.
 */
const withVerdict = Object.fromEntries(
  KEYS.map((key) => {
    const F = FORGES[key];
    return [key, { ...F, use: { ...F.use, check: (c, v, verdict = c.held) => F.use.check(c, v, verdict) } }];
  }),
);

const suite = describeForges({
  forges: withVerdict,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  before: BEFORE,
  inquiry: { 'ithbat-awwaliyan': PROOF_RESULT },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  tiles: { awwaliyan: 16, 'ithbat-awwaliyan': 12, 'shahid-wahid': 6 },
  bankPairs: BANK_PAIRS,
});

// ───────── the lesson's own ─────────

const fallsOn = (key, r, road = WALKED) => suite.refutedBy(key, r, road);

describe('awwaliyan-fima-baynahuma — the false rules its students really hold fall in front of him', () => {
  it('🤝: two primes, two that follow each other, neither dividing the other — refuted by HIS two pairs', () => {
    for (const road of [AT_ONCE, WALKED, EVERY]) {
      const prime = fallsOn('awwaliyan', { look: 'each', is: 'prime' }, road);
      expect([prime.on, prime.c.A, prime.c.B]).toEqual(['evidence', O1, O2]);
      const next = fallsOn('awwaliyan', { look: 'diff', is: 'one' }, road);
      expect([next.on, next.c.A, next.c.B]).toEqual(['evidence', O1, O2]);
      const neither = fallsOn('awwaliyan', { look: 'rem', is: 'nz' }, road);
      expect([neither.on, neither.c.A, neither.c.B, neither.c.g]).toEqual(['evidence', C1, C2, 13]);
    }
  });
  it('🤝: « two odd numbers » agrees with his road — the mirror shows two odd numbers a longer plank builds', () => {
    const { on, c } = fallsOn('awwaliyan', { look: 'each', is: 'odd' });
    expect(on).toBe('attack');
    expect([c.A % 2, c.B % 2, c.held]).toEqual([1, 1, false]);
  });
  it('✅: « the last remainder is 0 » and « the first remainder is 1 » fall on the rows of his notebooks', () => {
    const zero = fallsOn('ithbat-awwaliyan', { look: 'end', is: 'zero' });
    expect([zero.on, zero.c.held]).toEqual(['evidence', false]);
    expect(zero.c.g).toBe(11);
    const first = fallsOn('ithbat-awwaliyan', { look: 'first', is: 'one' });
    expect([first.on, first.c.A, first.c.B, first.c.held]).toEqual(['evidence', 440, 301, true]);
  });
  it('❌: « no plank of the rules builds both, so they are coprime » falls on HIS 85 and 119; a witness never says yes', () => {
    for (const road of [AT_ONCE, WALKED, EVERY]) {
      const none = fallsOn('shahid-wahid', { built: 'not', none: 'yes' }, road);
      expect(none.on).toBe('evidence');
      expect(none.c.witness).toBe(false);
      expect(none.c.held).toBe(false);
      const yes = fallsOn('shahid-wahid', { built: 'yes', none: 'pgcd' }, road);
      expect([yes.on, yes.c.witness]).toEqual(['evidence', true]);
    }
    // « no plank seen, so they are NOT coprime »: the mirror shows a coprime pair the plank does not build
    const not = fallsOn('shahid-wahid', { built: 'not', none: 'not' });
    expect([not.on, not.c.witness, not.c.held]).toEqual(['attack', false, true]);
  });
  it('❌ on his road: every plank of the rules he tried on 85 and 119 builds one gap at most; 17 builds both', () => {
    const rows = FORGES['shahid-wahid'].evidence(EVERY['shahid-wahid']);
    const hidden = rows.filter((c) => c.A === H1);
    expect(hidden.filter((c) => c.witness).map((c) => c.d)).toEqual([17]);
    expect(hidden.find((c) => c.d === 1).witness).toBe(false);
    expect(rows.filter((c) => c.A === W1 && c.witness).map((c) => c.d)).toEqual([5]);
  });
  it('the evidence of ✅ is its two notebooks: 4 rows ending on 1, 3 rows ending on 11', () => {
    const rows = FORGES['ithbat-awwaliyan'].fromInquiry(PROOF_RESULT).rows;
    expect(rows.map((c) => `${c.A};${c.B}`)).toEqual([
      '440;301',
      '301;139',
      '139;23',
      '23;1',
      '341;176',
      '176;165',
      '165;11',
    ]);
    expect(rows.map((c) => c.last)).toEqual([1, 1, 1, 1, 11, 11, 11]);
    const right = allRules(FORGES['ithbat-awwaliyan']).find(FORGES['ithbat-awwaliyan'].isTheRule);
    expect(runOn(FORGES['ithbat-awwaliyan'], right, rows).bad).toBe(-1);
  });
});

describe('awwaliyan-fima-baynahuma — the last steps end on a conclusion he chooses', () => {
  for (const key of KEYS) {
    const F = FORGES[key];
    it(`${key}: the right answer with the right conclusion; the wrong conclusion refused with its own words`, () => {
      expect(F.use.verdict).toBe(true);
      const seen = new Set();
      for (let seed = 1; seed <= 40; seed += 1) {
        const c = F.use.make(rng(seed * 7919));
        seen.add(c.held);
        const vals = Object.fromEntries(Object.entries(SOLVE[key](c)).map(([k, v]) => [k, String(v)]));
        expect(F.use.check(c, vals, c.held)).toBe('ok');
        expect(F.use.check(c, vals, !c.held)).toBe('verdict');
        expect(F.use.check(c, vals, null)).toBe('verdict');
        expect(typeof F.text.use.verdict).toBe('string');
      }
      // 🤝 and ✅ draw pairs of both kinds; ❌'s pairs always have a plank of the rules in common
      expect([...seen].sort()).toEqual(key === 'shahid-wahid' ? [false] : [false, true]);
    });
  }
  it('❌: ANY plank other than 1 that builds both is accepted — and 1 is not', () => {
    const F = FORGES['shahid-wahid'];
    const c = { A: 378, B: 495, g: gcd(378, 495), held: false };
    for (const d of [3, 9]) expect(F.use.check(c, { d, qa: 378 / d, e: d, qb: 495 / d }, false), String(d)).toBe('ok');
    expect(F.use.check(c, { d: 1, qa: 378, e: 1, qb: 495 }, false)).toBe('one');
    expect(F.use.check(c, { d: 3, qa: 126, e: 9, qb: 55 }, false)).toBe('same');
  });
  it('✅: the divisions of every pair it can draw fit their boxes — three rows, the last ending on 0', () => {
    const F = FORGES['ithbat-awwaliyan'];
    for (let i = 0; i < 6; i += 1) {
      const c = F.use.make(() => (i + 0.5) / 6);
      expect(c.rows).toHaveLength(3);
      expect(c.rows[2].r).toBe(0);
      expect(c.rows[1].r).toBe(c.g);
      for (const r of c.rows) expect(r.q).toBeLessThan(100);
    }
  });
});

describe('awwaliyan-fima-baynahuma — the numbers the mirrors write are the lesson’s own', () => {
  const bank = readBank(ID);
  it('the list pasted in forges.js is the bank’s', () => {
    expect([...BANK_PAIRS].sort()).toEqual([...bankPairs(bank)].sort());
  });
  it('every pair the forges hold (hard cases, the robot’s pairs, the last steps, the notebooks): in no line of the bank or of another story', () => {
    const fixed = [];
    for (const key of KEYS) {
      const F = FORGES[key];
      const right = allRules(F).find(F.isTheRule);
      for (const c of F.attacks(right, [])) fixed.push([c.A, c.B]);
      for (const k of [1, 2, 3]) for (const c of F.nudge(k, []).cases) fixed.push([c.A, c.B]);
      for (let i = 0; i < 12; i += 1) {
        const c = F.use.make(() => (i + 0.5) / 12);
        fixed.push([c.A, c.B]);
      }
    }
    for (const { a, b } of PROOF_INQUIRY.rounds) fixed.push([a, b]);
    const keys = [...new Set(fixed.map(([x, y]) => pairKey(x, y)))];
    expect(keys.length).toBeGreaterThan(30);
    for (const k of keys) {
      const r = collisions(bank, k.split(';').map(Number));
      expect(r.clear, `${k}: ${JSON.stringify(r)}`).toBe(true);
    }
  });
});
