import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { foldReducer, foldResult, initFold } from '../../../../../../common/gameworld/divisorIsles/gcdModes';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { BANK_PAIRS as LISTED, FORGES } from './forges';
import { FOLD_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { differences, euclid, gcd } from './math';
import { NUMBERS } from './story';

/** Every rule that can be written with the tiles of a forge (the product of its slots' options). */
const allRules = (forge) =>
  forge.slots.reduce((rules, s) => rules.flatMap((rule) => s.options.map((o) => ({ ...rule, [s.id]: o.id }))), [{}]);
const rng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
const clean = (text) => expect(String(text)).not.toMatch(/undefined|NaN|null|\[object/);
/** What the screen writes as PLAIN text (not through MathText) never carries a formula: no raw LaTeX on screen. */
const plain = (text) => {
  clean(text);
  expect(text, text).not.toMatch(/\$|\\/);
};

// ───────── the fold he plays in 🧮's mirror, through the world's own reducer (one wrong fold first) ─────────
const FOLD_RESULT = (() => {
  let s = initFold();
  while (s.stage === 'write') s = foldReducer(FOLD_INQUIRY, s, { type: 'tick' });
  s = foldReducer(FOLD_INQUIRY, s, { type: 'fold', q: 2, r: 370 });
  s = foldReducer(FOLD_INQUIRY, s, { type: 'fold', q: 3, r: 74 });
  while (s.stage === 'finish') s = foldReducer(FOLD_INQUIRY, s, { type: 'tick' });
  return foldResult(s);
})();

// ───────── what the WORLD logs while he plays the islands (a bridge per line: the gap, the plank) ─────────
const fired = (list) => list.map(([a, b]) => ({ a, b }));
const [D1, D2, D3] = NUMBERS.diff.gaps;
const [T1, T2] = NUMBERS.tarh.gaps;
const [I1, I2] = NUMBERS.iqlidis.gaps;
const [S1, S2] = NUMBERS.sibaq.gaps;
const DIFF_AT_ONCE = fired([
  [D1, 19],
  [D2, 19],
  [D3, 19],
]);
const TARH_AT_ONCE = fired([
  [T1, 37],
  [T2, 37],
]);
const IQ_AT_ONCE = fired([
  [I1, 39],
  [I2, 39],
]);
/** The shortest road: the right plank at once (🧮's evidence is its fold: it reads no log). */
const AT_ONCE = {
  'farq-yabqi': DIFF_AT_ONCE,
  'khawarizmiyat-al-tarh': TARH_AT_ONCE,
  'baqi-yabqi': [],
  iqlidis: IQ_AT_ONCE,
  'aqall-khutuwat': fired([
    [S1, 17],
    [S2, 17],
  ]),
};
/** The story walk's road: one or two planks first. */
const WALKED = {
  'farq-yabqi': fired([
    [D1, 8],
    [D2, 8],
    [D1, 5],
    [D1, 19],
    [D2, 19],
    [D3, 19],
  ]),
  'khawarizmiyat-al-tarh': fired([
    [T1, 74],
    [T1, 1],
    [T1, 37],
    [T2, 37],
  ]),
  'baqi-yabqi': [],
  iqlidis: fired([
    [I1, 13],
    [I2, 13],
    [I1, 39],
    [I2, 39],
  ]),
  'aqall-khutuwat': fired([
    [S1, 34],
    [S1, 17],
    [S2, 17],
  ]),
};
/** The longest road: every plank a student tries. */
const EVERY = {
  'farq-yabqi': fired([
    [D1, 8],
    [D2, 8],
    [D1, 5],
    [D1, 3],
    [D1, 19],
    [D2, 19],
    [D3, 19],
  ]),
  'khawarizmiyat-al-tarh': fired([
    [T1, 7],
    [T1, 5],
    [T1, 74],
    [T2, 74],
    [T1, 1],
    [T1, 37],
    [T2, 37],
  ]),
  'baqi-yabqi': [],
  iqlidis: fired([
    [I1, 3],
    [I2, 3],
    [I1, 546],
    [I1, 13],
    [I2, 13],
    [I1, 39],
    [I2, 39],
  ]),
  'aqall-khutuwat': fired([
    [S1, 1],
    [S1, 2],
    [S2, 2],
    [S1, 34],
    [S1, 17],
    [S2, 17],
  ]),
};
const ROADS = { AT_ONCE, WALKED, EVERY };
/** The log of the road before each mirror (the bridges of earlier convoys are in it too: none is his there). */
const BEFORE = {
  'farq-yabqi': [],
  'khawarizmiyat-al-tarh': DIFF_AT_ONCE,
  'baqi-yabqi': [...DIFF_AT_ONCE, ...TARH_AT_ONCE],
  iqlidis: [...DIFF_AT_ONCE, ...TARH_AT_ONCE],
  'aqall-khutuwat': [...DIFF_AT_ONCE, ...TARH_AT_ONCE, ...IQ_AT_ONCE],
};
const logOf = (key, road = WALKED) => [...BEFORE[key], ...road[key]];
/** His evidence when the mirror tests his rule: the world's log — or, for 🧮, what its fold gave the mirror. */
const rowsOf = (key, road) => {
  const F = FORGES[key];
  return F.inquiry ? F.fromInquiry(FOLD_RESULT).rows : F.evidence(logOf(key, road));
};
/** The rule is refuted in front of him: on his evidence, or by the first attack. */
const refutedBy = (key, rule, road) => {
  const F = FORGES[key];
  const rows = rowsOf(key, road);
  const run = runOn(F, rule, testsOf(F, rule, rows));
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F.attacks(rule, rows)[0] };
};
/** How many rules the tiles of each forge allow. */
const TILES = {
  'farq-yabqi': 8,
  'khawarizmiyat-al-tarh': 12,
  'baqi-yabqi': 8,
  iqlidis: 18,
  'aqall-khutuwat': 12,
};
/** The right answer of the last step of each forge, computed from the case. */
const SOLVE = {
  'farq-yabqi': (c) => ({ d: c.A - c.B, p: c.A - c.B, g: gcd(c.A, c.B) }),
  'khawarizmiyat-al-tarh': (c) => {
    const r = differences(c.A, c.B);
    return { d1: r[0].d, x2: r[1].x, y2: r[1].y, d2: r[1].d, x3: r[2].x, y3: r[2].y, d3: r[2].d, g: gcd(c.A, c.B) };
  },
  'baqi-yabqi': (c) => ({ q: Math.floor(c.A / c.B), r: c.A % c.B, p: c.A % c.B, g: gcd(c.A, c.B) }),
  iqlidis: (c) => {
    const r = euclid(c.A, c.B);
    return {
      q1: r[0].q,
      r1: r[0].r,
      ...Object.fromEntries(
        [2, 3].flatMap((i) => [
          [`a${i}`, r[i - 1].a],
          [`b${i}`, r[i - 1].b],
          [`q${i}`, r[i - 1].q],
          [`r${i}`, r[i - 1].r],
        ]),
      ),
      g: gcd(c.A, c.B),
    };
  },
  'aqall-khutuwat': (c) => {
    const [d1, d2] = euclid(c.A, c.B);
    return { q1: d1.q, r1: d1.r, b2: d2.b, q2: d2.q, r2: d2.r, s: differences(c.A, c.B).length, g: gcd(c.A, c.B) };
  },
};
/** Every case the MIRROR builds in front of him: every attack of every rule on every road, the nudges. */
const builtCases = (F) =>
  Object.values(ROADS).flatMap((road) => {
    const rows = rowsOf(F.key, road);
    return [
      ...allRules(F).flatMap((rule) => F.attacks(rule, rows)),
      ...[1, 2, 3].flatMap((n) => F.nudge(n, rows).cases),
    ];
  });
/** Every case a forge can show: his rows on every road, then what the mirror builds. */
const shownCases = (F) => [...Object.values(ROADS).flatMap((road) => rowsOf(F.key, road)), ...builtCases(F)];
/** The forges whose case is a plank asked of two gaps (drawn as two bridges). */
const PAIRED = ['farq-yabqi', 'khawarizmiyat-al-tarh', 'baqi-yabqi', 'iqlidis'];

// ───────── the bank's pairs (read as story.test.js reads them) ─────────
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '../../../../../../../../../../content/practice/4am/bahth-pgcd');
const SHEETS = readdirSync(bankDir).flatMap((lvl) =>
  readdirSync(join(bankDir, lvl)).map((f) => readFileSync(join(bankDir, lvl, f), 'utf8')),
);
const pairKey = (x, y) => [x, y].sort((p, q) => p - q).join(';');
const BANK_PAIRS = new Set(
  SHEETS.flatMap((s) =>
    [...s.matchAll(/PGCD\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|للعددين\s+(\d+)\s+و\s+(\d+)/g)].map((m) =>
      pairKey(Number(m[1] ?? m[3]), Number(m[2] ?? m[4])),
    ),
  ),
);

describe('the five forges of « البحث عن القاسم المشترك الأكبر » — no rule is told', () => {
  it('four open on their tiles, their evidence the world’s log; 🧮 keeps its fold in the mirror', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      const F = FORGES[key];
      expect(F.key).toBe(key);
      if (key === 'baqi-yabqi') expect(F.inquiry).toBe(FOLD_INQUIRY);
      else expect(F.inquiry).toBeUndefined();
      for (const road of Object.values(ROADS)) expect(F.predictCases(rowsOf(key, road))).toEqual([]);
      expect(F.predictCases([])).toEqual([]);
    }
    // before its fold, the mirror of 🧮 holds nothing of the islands
    expect(FORGES['baqi-yabqi'].evidence(logOf('baqi-yabqi', EVERY))).toEqual([]);
  });

  it('➖ a line per plank he tried on 152, 95 and 57 — as ONE plank asked of 152 and 95; 19 is there even when the log lost it', () => {
    const F = FORGES['farq-yabqi'];
    expect(rowsOf(F.key, WALKED).map((r) => [r.A, r.B, r.d, r.held])).toEqual([
      [152, 95, 8, false],
      [152, 95, 5, false],
      [152, 95, 19, true],
    ]);
    expect(rowsOf(F.key, EVERY).map((r) => r.d)).toEqual([8, 5, 3, 19]);
    expect(F.evidence([]).map((r) => r.d)).toEqual([19]);
    // the island's planks: 8 fills the longer alone, 5 the shorter alone, 3 the difference alone
    expect(rowsOf(F.key, EVERY).map((r) => [r.fa, r.fb, r.fd])).toEqual([
      [true, false, false],
      [false, true, false],
      [false, false, true],
      [true, true, true],
    ]);
  });

  it('🪜 and 🔁 a line per plank he made for the convoy’s gaps; the crossing plank is there even when the log lost it', () => {
    const T = FORGES['khawarizmiyat-al-tarh'];
    expect(rowsOf(T.key, WALKED).map((r) => [r.d, r.fits, r.held, r.tag])).toEqual([
      [74, false, false, 'لا يملؤهما'],
      [1, true, false, '444 لوحًا'],
      [37, true, true, '12 لوحًا'],
    ]);
    expect(T.evidence([]).map((r) => r.d)).toEqual([37]);
    const I = FORGES.iqlidis;
    expect(rowsOf(I.key, WALKED).map((r) => [r.d, r.need, r.purse, r.held])).toEqual([
      [13, 183, 61, false],
      [39, 61, 61, true],
    ]);
    expect(I.evidence(fired([[I1, 546]])).map((r) => r.d)).toEqual([546, 39]);
    // the bridges of other convoys are not his here
    expect(I.evidence(logOf(I.key, AT_ONCE)).every((r) => r.A === I1 && r.B === I2)).toBe(true);
  });

  it('🧮 the lines of his fold: 962 and 296, then 296 and 74, with the two longest planks of their column', () => {
    expect(FOLD_RESULT.rounds[0]).toMatchObject({ a: 962, b: 296, gcd: 74, lines: 2 });
    expect(FOLD_RESULT.rounds[0].folds[0]).toMatchObject({ said: { q: 2, r: 370 }, q: 3, r: 74 });
    const rows = rowsOf('baqi-yabqi', WALKED);
    expect(rows.map((r) => [r.A, r.B, r.d, r.q, r.rem, r.held])).toEqual([
      [962, 296, 74, 3, 74, true],
      [962, 296, 37, 3, 74, true],
      [296, 74, 74, 4, 0, true],
      [296, 74, 37, 4, 0, true],
    ]);
  });

  it('⏱️ the three pairs he crossed by a notebook, each with its two counts (31 rows against 2 on the last)', () => {
    const F = FORGES['aqall-khutuwat'];
    for (const road of Object.values(ROADS))
      expect(rowsOf(F.key, road).map((r) => [r.A, r.B, r.S, r.D, r.k, r.held, r.tag])).toEqual([
        [259, 185, 5, 3, 2, true, '5 مقابل 3'],
        [1833, 546, 10, 4, 6, true, '10 مقابل 4'],
        [1003, 34, 31, 2, 29, true, '31 مقابل 2'],
      ]);
    // the counts are the notebooks the world writes
    for (const r of rowsOf(F.key, WALKED)) {
      expect(r.S).toBe(ladderOf(r.A, r.B, 'subtract').steps);
      expect(r.D).toBe(ladderOf(r.A, r.B, 'divide').steps);
    }
  });

  it('nothing he did is lost, nothing counted twice; a case the mirror built joins his lines as the mirror’s', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const road of Object.values(ROADS)) {
        const rows = rowsOf(key, road);
        expect(new Set(rows.map(F.caseId)).size, key).toBe(rows.length);
        expect(F.evidence(rows), key).toEqual(rows);
        expect(F.evidence([...rows, ...logOf(key, road)]), key).toHaveLength(rows.length);
        const [p] = F.attacks(allRules(F).find(F.isTheRule), rows);
        const more = F.evidence([...rows, { ...p, mirror: true }]);
        expect(more).toHaveLength(rows.length + 1);
        expect(more.at(-1).mirror).toBe(true);
      }
    }
  });

  // every shown and built case of four forges: seconds of pure computing — on a loaded CI runner it passed the default
  // 5 s and stopped a production deploy (2026-11-20)
  it(
    'a case of ➖, 🪜, 🧮, 🔁 is a PAIR of gaps and one plank; the world’s answer is what the drawing shows',
    { timeout: 60000 },
    () => {
      for (const key of PAIRED) {
        const F = FORGES[key];
        for (const c of shownCases(F)) {
          const id = F.caseId(c);
          const fillsBoth = c.A % c.d === 0 && c.B % c.d === 0;
          expect(c.pair.a, id).toBe(c.A);
          expect(c.pair.b, id).toBe(c.B);
          expect(c.pair.d, id).toBe(c.d);
          expect(c.fits, id).toBe(fillsBoth);
          expect(c.deal).toBeUndefined();
          if (key === 'farq-yabqi' || key === 'baqi-yabqi') expect(c.held, id).toBe(fillsBoth);
          else {
            // the purse holds the planks of the longest plank of both: only that plank is paid
            expect(c.purse).toBe(c.A / gcd(c.A, c.B) + c.B / gcd(c.A, c.B));
            expect(c.held, id).toBe(fillsBoth && c.A / c.d + c.B / c.d <= c.purse);
            expect(c.held).toBe(c.d === gcd(c.A, c.B));
          }
          // the tag is short (a log line stays on one line)
          expect(c.tag.length, c.tag).toBeLessThanOrEqual(12);
          expect(BANK_PAIRS.has(pairKey(c.A, c.B)), id).toBe(false);
        }
        // what the mirror builds: a pair it can draw and lay plank by plank (his own rows are only drawn small)
        for (const c of builtCases(F)) {
          expect(Math.max(c.A, c.B), F.caseId(c)).toBeLessThanOrEqual(90);
          expect(c.laid, F.caseId(c)).toBeLessThanOrEqual(40);
        }
      }
    },
  );

  it('a case of ⏱️ is a pair of numbers and its two notebooks, drawn as its first row (a gap and the planks of the other)', () => {
    const F = FORGES['aqall-khutuwat'];
    for (const c of shownCases(F)) {
      expect(c.pair).toBeUndefined();
      expect([c.a, c.b, c.q, c.r]).toEqual([c.A, c.B, Math.floor(c.A / c.B), c.A % c.B]);
      expect(c.fits).toBe(c.A % c.B === 0);
      expect(c.S).toBe(ladderOf(c.A, c.B, 'subtract').steps);
      expect(c.D).toBe(ladderOf(c.A, c.B, 'divide').steps);
      expect(c.held).toBe(c.kind === 'count' ? c.S - c.D === c.k : c.D > c.S);
      expect(c.tag.length, c.tag).toBeLessThanOrEqual(12);
      expect(BANK_PAIRS.has(pairKey(c.A, c.B)), F.caseId(c)).toBe(false);
    }
    for (const c of builtCases(F)) {
      expect(c.A, F.caseId(c)).toBeLessThanOrEqual(90);
      expect(c.q, F.caseId(c)).toBeLessThanOrEqual(40);
      // the attack writes the notebook of divisions in one formula: three rows at most
      expect(c.D, F.caseId(c)).toBeLessThanOrEqual(3);
    }
  });

  it('on ANY road — the right plank at once, the walk’s, every plank — every false rule falls in front of him', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      const rules = allRules(F);
      for (const road of Object.values(ROADS)) {
        const rows = rowsOf(key, road);
        const right = rules.find(F.isTheRule);
        expect(runOn(F, right, rows).bad, `${key}: the right rule agrees with what he did`).toBe(-1);
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const { on, c } = refutedBy(key, rule, road);
          expect(c, `${key} ${ruleKey(F, rule)}`).toBeTruthy();
          expect(F.says(rule, c), `${key} ${ruleKey(F, rule)} ${on}`).not.toBe(c.held);
          if (on === 'attack') expect(rows.some((r) => F.caseId(r) === F.caseId(c))).toBe(false);
        }
      }
    }
  });

  for (const key of KEYS) {
    const F = FORGES[key];
    const rows = rowsOf(key, WALKED);
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);

    describe(`${key} — he writes his rule with tiles`, () => {
      it('many rules can be written with the tiles and exactly ONE holds; at most four tiles a column', () => {
        expect(rules).toHaveLength(TILES[key]);
        expect(THE).toHaveLength(1);
        expect(F.slots.length).toBeGreaterThanOrEqual(2);
        expect(F.slots.length).toBeLessThanOrEqual(4);
        for (const s of F.slots) expect(s.options.length, s.id).toBeLessThanOrEqual(4);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
      });

      it('EVERY false rule is refuted — by what he did, or by a new case — and every refutation is worded', () => {
        let onEvidence = 0;
        let byAttack = 0;
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const run = runOn(F, rule, testsOf(F, rule, rows));
          if (run.bad >= 0) {
            const m = run.marks[run.bad];
            expect(m.says, ruleKey(F, rule)).not.toBe(m.held);
            plain(F.text.refuted(m));
            clean(F.explain(rule, m));
            onEvidence += 1;
            continue;
          }
          const [c] = F.attacks(rule, rows);
          expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
          clean(F.text.attack(c));
          clean(F.explain(rule, c));
          if (F.text.eq) clean(F.text.eq(c));
          plain(F.text.broken(F.says(rule, c)));
          byAttack += 1;
        }
        expect(onEvidence + byAttack).toBe(TILES[key] - 1);
        expect(onEvidence).toBeGreaterThan(0);
      });

      it('the right rule agrees with all his evidence and survives the hard attacks — a « yes » and a « no » of the world', () => {
        for (const road of Object.values(ROADS)) {
          const rs = rowsOf(key, road);
          expect(runOn(F, THE[0], testsOf(F, THE[0], rs)).bad).toBe(-1);
          const list = F.attacks(THE[0], rs);
          expect(list.length).toBeGreaterThanOrEqual(2);
          expect(new Set(list.map((c) => c.held))).toEqual(new Set([true, false]));
          for (const c of list) {
            expect(F.says(THE[0], c), F.caseId(c)).toBe(c.held);
            expect(rs.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          }
          // the mirror built the first one: the next is still a new case
          const after = F.evidence([...rs, { ...list[0], mirror: true }]);
          expect(F.attacks(THE[0], after).map(F.caseId)).toContain(F.caseId(list[1]));
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        for (const rule of rules) {
          plain(F.ruleText(rule));
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
          for (const s of F.slots)
            plain(
              F.chip
                ? F.chip(
                    s,
                    s.options.find((o) => o.id === rule[s.id]),
                  )
                : s.options.find((o) => o.id === rule[s.id]).label,
            );
        }
        for (const s of F.slots) {
          plain(s.label);
          for (const o of s.options) plain(o.label);
        }
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'frame', 'buildLead', 'testing', 'agreed', 'fire'])
          plain(T[k]);
        for (const k of ['survived', 'wordsHint', 'experiment', 'useOk']) plain(T[k]);
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          clean(T.attack(c));
          plain(T.refuted({ ...c, says: !c.held }));
          plain(T.refuted({ ...c, says: c.held }));
          if (T.eq) clean(T.eq(c));
          plain(c.tag);
        }
        for (const yes of [true, false]) {
          plain(T.says(yes));
          plain(T.broken(yes));
        }
        for (const x of Object.values(T.use)) plain(x);
      });

      it('the robot helps without ever giving the rule: three more pairs of cases, never a choice of rules', () => {
        for (const n of [1, 2, 3]) {
          const h = F.nudge(n, rows);
          expect(h.kind).toBe('experiment');
          expect(h.cases).toHaveLength(2);
          for (const c of h.cases) {
            if (F.text.eq) clean(F.text.eq(c));
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          }
          expect(h.cases[0].held).not.toBe(h.cases[1].held);
        }
        for (const s of F.slots) {
          const label = s.options.find((o) => o.id === THE[0][s.id]).label;
          expect(F.text.experiment, key).not.toContain(label);
        }
      });

      it('ends on a case the mirror does not build — the rule decides, typed in its own shape', () => {
        for (let seed = 1; seed <= 25; seed += 1) {
          const c = F.use.make(rng(seed * 104729));
          const vals = SOLVE[key](c);
          for (const v of Object.values(vals)) expect(Number.isInteger(v) && v >= 0).toBe(true);
          const lines = F.use.lines(c);
          // one screen: three lines in one column, or four in two columns (kit/ruleForge.css)
          expect(lines.length).toBeGreaterThanOrEqual(1);
          expect(lines.length).toBeLessThanOrEqual(4);
          const slots = lines.flatMap((l) => l.tokens.filter((t) => typeof t === 'object'));
          expect(slots.map((t) => t.slot).sort()).toEqual(Object.keys(vals).sort());
          for (const t of slots) expect(String(vals[t.slot]).length, t.slot).toBeLessThanOrEqual(t.w);
          for (const l of lines) for (const t of l.tokens) typeof t === 'string' ? plain(t) : plain(t.label);
          const asText = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)]));
          expect(F.use.check(c, asText)).toBe('ok');
          clean(F.text.tryKey(c));
          for (const name of Object.keys(vals)) {
            const fb = F.use.check(c, { ...asText, [name]: String(Number(vals[name]) + 100) });
            expect(fb, `${key} ${name}`).not.toBe('ok');
            expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
          }
        }
      });
    });
  }
});

describe('the false rules students really hold can be written — and the world refutes each', () => {
  it('➖ « the longer alone », « the shorter alone », « the difference alone » fall on the island’s own planks 8, 5, 3', () => {
    const at = (look, road) => refutedBy('farq-yabqi', { how: 'all', look }, road);
    for (const [look, d] of [
      ['long', 8],
      ['short', 5],
      ['diff', 3],
    ]) {
      const r = at(look, EVERY);
      expect([r.on, r.c.d, r.c.held], look).toEqual(['evidence', d, false]);
    }
    // made at once (19 only): the mirror's own pairs refute them
    for (const look of ['long', 'short', 'diff']) expect(at(look, AT_ONCE).on).toBe('attack');
    // « one gap at least of the shorter and the difference » falls on 5 (it fills 95)
    expect(refutedBy('farq-yabqi', { how: 'one', look: 'pair' }, WALKED)).toMatchObject({
      on: 'evidence',
      c: { d: 5 },
    });
    // the right rule is attacked where the difference is longer than the shorter gap: 66 and 24, 42
    const F = FORGES['farq-yabqi'];
    expect(F.attacks({ how: 'all', look: 'pair' }, rowsOf(F.key, AT_ONCE)).map(F.caseId)).toEqual([
      'farq:66:24:14',
      'farq:66:24:6',
    ]);
  });

  it('🪜 « the next pair is the longer and the difference » never stops; « the first difference », « the count » fall on 37', () => {
    const F = FORGES['khawarizmiyat-al-tarh'];
    const right = { next: 'sd', stop: 'zero', make: 'last' };
    const loop = refutedBy(F.key, { ...right, next: 'ld' }, AT_ONCE);
    expect([loop.on, loop.c.d]).toEqual(['evidence', 37]);
    expect(F.explain({ ...right, next: 'ld' }, loop.c)).toContain('لا تتوقّف');
    for (const make of ['first', 'count']) expect(refutedBy(F.key, { ...right, make }, AT_ONCE).on).toBe('evidence');
    // « stop when the difference is shorter than the shorter gap » makes 74 on 259 and 185
    const less = refutedBy(F.key, { ...right, stop: 'less' }, AT_ONCE);
    expect([less.on, less.c.d]).toEqual(['evidence', 37]);
    expect(F.explain({ ...right, stop: 'less' }, less.c)).toContain('اللوح 74');
    // the subtraction notebook of 259 and 185: five rows, the last (37 ; 37)
    expect(differences(T1, T2).map((r) => r.d)).toEqual([74, 111, 37, 37, 0]);
  });

  it('🧮 « the shorter and the quotient », « the quotient and the remainder » fall on his fold; « the remainder alone » on the mirror’s', () => {
    const at = (look, zero, road = WALKED) => refutedBy('baqi-yabqi', { look, zero }, road);
    expect(at('bq', 'any')).toMatchObject({ on: 'evidence', c: { A: 962, B: 296, d: 74 } });
    expect(at('qr', 'any').on).toBe('evidence');
    // « no plank builds a gap of 0 cells » falls on the last line of the fold: 296 = 74 × 4 + 0
    expect(at('br', 'none')).toMatchObject({ on: 'evidence', c: { A: 296, B: 74, rem: 0 } });
    const alone = at('r', 'any');
    expect(alone.on).toBe('attack');
    expect(alone.c.rem % alone.c.d === 0 && !alone.c.held).toBe(true);
    // the remainder of 962 by 296 is the fold's: 962 = 296 × 3 + 74
    expect([Math.floor(962 / 296), 962 % 296]).toEqual([3, 74]);
  });

  it('🔁 « stop when the quotient is 1 » agrees with 1833 and 546 (it stops on 39) and falls on the mirror’s 63 and 45', () => {
    const F = FORGES.iqlidis;
    const right = { next: 'sr', stop: 'zero', make: 'last' };
    const q1 = refutedBy(F.key, { ...right, stop: 'qone' }, AT_ONCE);
    expect(q1.on).toBe('attack');
    // « the longer and the remainder » also makes 39 on the islands: the mirror refutes it
    expect(refutedBy(F.key, { ...right, next: 'ar' }, AT_ONCE).on).toBe('attack');
    // « the quotient and the remainder », « the last quotient », « the count » fall on 39
    for (const r of [
      { ...right, next: 'qr' },
      { ...right, make: 'q' },
      { ...right, make: 'count' },
    ])
      expect(refutedBy(F.key, r, AT_ONCE).on, ruleKey(F, r)).toBe('evidence');
    expect(F.attacks(right, rowsOf(F.key, AT_ONCE)).map(F.caseId)).toEqual(['iqlidis:63:45:18', 'iqlidis:63:45:9']);
    expect(euclid(I1, I2).map((s) => [s.q, s.r])).toEqual([
      [3, 195],
      [2, 156],
      [1, 39],
      [4, 0],
    ]);
  });

  it('⏱️ « one division gathers one row » falls on 31 against 2; « subtractions for small numbers » on a small pair', () => {
    const F = FORGES['aqall-khutuwat'];
    for (const gather of ['one', 'r', 'b'])
      expect(refutedBy(F.key, { gather, pick: 'divide' }, WALKED).on, gather).toBe('evidence');
    for (const pick of ['subtract', 'small']) {
      const r = refutedBy(F.key, { gather: 'q', pick }, WALKED);
      expect([r.on, r.c.kind, r.c.held]).toEqual(['attack', 'pick', false]);
      expect(Math.max(r.c.A, r.c.B)).toBeLessThan(100);
    }
    // the right rule is attacked by twins (one row each), by 86 and 4 (23 rows against 2), and « more by dividing? »
    expect(F.attacks({ gather: 'q', pick: 'divide' }, rowsOf(F.key, WALKED)).map(F.caseId)).toEqual([
      'count:64:64:0',
      'count:86:4:21',
      'pick:86:4',
    ]);
  });

  it('only twins take as many rows of divisions as of subtractions — swept up to 150', () => {
    for (let a = 1; a <= 150; a += 1)
      for (let b = 1; b <= 150; b += 1) {
        const S = differences(a, b).length;
        const D = euclid(a, b).length;
        expect(S === D, `${a} ${b}`).toBe(a === b);
        // and the subtractions are the quotients of the divisions, summed (the rule of ⏱️)
        expect(S).toBe(euclid(a, b).reduce((n, s) => n + s.q, 0));
      }
  });
});

describe('the words and the numbers of the forges', () => {
  /** Every sentence a forge shows BEFORE its last step (its tablet comes after the last step). */
  const sentences = (F) => {
    const rules = allRules(F);
    const T = F.text;
    return [
      T.title,
      T.log,
      T.frame,
      T.buildLead,
      T.testing,
      T.agreed,
      T.experiment,
      T.wordsHint,
      T.survived,
      T.yes,
      T.no,
      ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
      ...rules.flatMap((r) => [
        F.ruleText(r),
        ...F.slots.map((s) =>
          F.chip
            ? F.chip(
                s,
                s.options.find((o) => o.id === r[s.id]),
              )
            : s.options.find((o) => o.id === r[s.id]).label,
        ),
      ]),
      ...shownCases(F).flatMap((c) => [
        T.attack(c),
        T.refuted({ ...c, says: true }),
        T.refuted({ ...c, says: false }),
        c.tag,
        ...rules.map((r) => F.explain(r, c)),
      ]),
    ];
  };
  /** The words of each key's name, and of what it states, before its tablet. */
  const FORBIDDEN = {
    'farq-yabqi': /يحفظ|مشترك|PGCD|قاسم/,
    'khawarizmiyat-al-tarh': /خوارزمي|الفروق|PGCD|قاسم|مشترك|غير معدوم/,
    'baqi-yabqi': /يحفظ|مشترك|PGCD|قاسم/,
    iqlidis: /خوارزمي|إقليدس|PGCD|قاسم|مشترك|غير معدوم/,
    'aqall-khutuwat': /خوارزمي|أسرع|PGCD|قاسم|مشترك/,
  };

  it('no sentence of a forge before its last step names its key or states it in the words of its tablet', () => {
    for (const key of KEYS) for (const line of sentences(FORGES[key])) expect(line, line).not.toMatch(FORBIDDEN[key]);
  });

  it('⏱️ speaks of notebooks and rows: no plank, no bridge in its own sentences (the world draws the first row)', () => {
    const F = FORGES['aqall-khutuwat'];
    for (const line of sentences(F).filter((l) => !/^\d+ مقابل \d+$/.test(l)))
      expect(line, line).not.toMatch(/لوح|جسر/);
  });

  it('⏱️ cases name themselves by their pair in the log (`head`), never « A لوح B » (A10: seen by the story walk)', () => {
    const F = FORGES['aqall-khutuwat'];
    const cases = [...F.evidence([]), ...F.attacks({ gather: 'q', pick: 'divide' }, [])];
    expect(cases.length).toBeGreaterThan(0);
    for (const c of cases) expect(c.head).toBe(`${c.A} و ${c.B}`);
  });

  it('the list of the bank’s pairs in forges.js is the bank’s', () => {
    expect([...LISTED].sort()).toEqual([...BANK_PAIRS].sort());
  });

  it('the numbers of the last steps: no pair of the bank, of another lesson, of this story', () => {
    const lessons = join(here, '../../../../../../');
    const others = [
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qawasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/khawass-qawasim',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd',
      'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi',
      'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma',
      'moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr',
    ].map((p) => readFileSync(join(lessons, p, 'world/story.js'), 'utf8'));
    const story = readFileSync(join(here, 'story.js'), 'utf8');
    const alone = (n) => new RegExp(`(?<![0-9])${n}(?![0-9])`);
    const usePairs = new Map();
    for (let seed = 1; seed <= 200; seed += 1) {
      const r = rng(seed * 7919);
      for (const key of KEYS) {
        const c = FORGES[key].use.make(r);
        usePairs.set(pairKey(c.A, c.B), [c.A, c.B]);
      }
    }
    expect(usePairs.size).toBe(3 + 4 + 3 + 4 + 4);
    for (const [x, y] of usePairs.values()) {
      expect(BANK_PAIRS.has(pairKey(x, y)), `${x} ; ${y}`).toBe(false);
      const both = (line) => alone(x).test(line) && alone(y).test(line);
      for (const s of [...SHEETS, ...others, story])
        for (const line of s.split('\n')) expect(both(line), `${x} ; ${y}`).toBe(false);
      for (const n of [x, y].filter((v) => v >= 100)) {
        for (const s of SHEETS) expect(s, `${n}`).not.toMatch(alone(n));
        for (const s of others) expect(s, `${n}`).not.toMatch(alone(n));
      }
      for (const n of [x, y]) expect([...NUMBERS.boss.lanes, NUMBERS.boss.plank]).not.toContain(n);
      // 119 and 85 are lesson 7's pair
      expect(pairKey(x, y)).not.toBe('85;119');
    }
  });

  it('➖ last step: the difference, the new pair, then the number', () => {
    const F = FORGES['farq-yabqi'];
    const c = { A: 92, B: 69, D: 23, g: 23 };
    expect(F.use.lines(c).map((l) => l.tokens.filter((t) => typeof t === 'string'))).toEqual([
      ['92 − 69', '='],
      ['PGCD(92 ; 69)', '=', 'PGCD(69 ;', ')'],
      ['PGCD(92 ; 69)', '='],
    ]);
    const ok = { d: '23', p: '23', g: '23' };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, d: '161' })).toBe('diff');
    expect(F.use.check(c, { ...ok, p: '92' })).toBe('pair');
    expect(F.use.check(c, { ...ok, g: '1' })).toBe('pgcd');
  });

  it('🪜 last step: three rows of subtractions typed whole, then the number', () => {
    const F = FORGES['khawarizmiyat-al-tarh'];
    for (let seed = 1; seed <= 40; seed += 1) {
      const c = F.use.make(rng(seed * 31));
      expect(c.rows).toHaveLength(3);
      expect(c.rows[2].d).toBe(0);
    }
    const c = { A: 213, B: 71, rows: differences(213, 71), g: 71 };
    const ok = { d1: '142', x2: '142', y2: '71', d2: '71', x3: '71', y3: '71', d3: '0', g: '71' };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, d1: '140' })).toBe('row1');
    expect(F.use.check(c, { ...ok, x2: '213', y2: '142' })).toBe('pair');
    expect(F.use.check(c, { ...ok, d2: '70' })).toBe('row2');
    expect(F.use.check(c, { ...ok, g: '0' })).toBe('zero');
    expect(F.use.check(c, { ...ok, g: '142' })).toBe('pgcd');
  });

  it('🧮 last step: the division, the new pair, then the number', () => {
    const F = FORGES['baqi-yabqi'];
    const c = { A: 483, B: 92, q: 5, rem: 23, g: 23 };
    const ok = { q: '5', r: '23', p: '23', g: '23' };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, q: '4', r: '115' })).toBe('div');
    expect(F.use.check(c, { ...ok, p: '5' })).toBe('pair');
    expect(F.use.check(c, { ...ok, g: '92' })).toBe('pgcd');
    for (let seed = 1; seed <= 40; seed += 1) {
      const u = F.use.make(rng(seed * 31));
      expect(u.B % u.rem).toBe(0);
    }
  });

  it('🔁 last step: three divisions typed row by row, the third ending on 0, then the number', () => {
    const F = FORGES.iqlidis;
    for (let seed = 1; seed <= 40; seed += 1) {
      const c = F.use.make(rng(seed * 31));
      expect(c.rows).toHaveLength(3);
      expect(c.rows[2].r).toBe(0);
    }
    const c = { A: 1334, B: 319, rows: euclid(1334, 319), g: 29 };
    const ok = {
      q1: '4',
      r1: '58',
      a2: '319',
      b2: '58',
      q2: '5',
      r2: '29',
      a3: '58',
      b3: '29',
      q3: '2',
      r3: '0',
      g: '29',
    };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, q1: '3', r1: '377' })).toBe('row1');
    expect(F.use.check(c, { ...ok, a2: '1334' })).toBe('pair2');
    expect(F.use.check(c, { ...ok, r2: '30' })).toBe('row2');
    expect(F.use.check(c, { ...ok, b3: '58' })).toBe('pair3');
    expect(F.use.check(c, { ...ok, g: '0' })).toBe('zero');
    expect(F.use.check(c, { ...ok, g: '58' })).toBe('pgcd');
  });

  it('⏱️ last step: a carpenter’s two lengths — the two divisions, the subtractions they gather, the piece in cm', () => {
    const F = FORGES['aqall-khutuwat'];
    for (let seed = 1; seed <= 40; seed += 1) {
      const c = F.use.make(rng(seed * 31));
      expect(c.divs).toHaveLength(2);
      // many subtractions (« … سطرًا » agrees from 11 on)
      expect(c.S).toBeGreaterThanOrEqual(11);
    }
    const c = F.use.make(() => 0);
    expect([c.A, c.B, c.S, c.g]).toEqual([1953, 84, 27, 21]);
    const lines = F.use.lines(c);
    expect(lines.slice(2).map((l) => [l.dir, l.tokens[0], l.tokens.at(-1)])).toEqual([
      ['rtl', 'دفتر الطرح:', 'سطرًا'],
      ['rtl', 'طول القطعة:', 'سم'],
    ]);
    const ok = { q1: '23', r1: '21', b2: '21', q2: '4', r2: '0', s: '27', g: '21' };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, q1: '22', r1: '105' })).toBe('div1');
    expect(F.use.check(c, { ...ok, b2: '84' })).toBe('pair2');
    expect(F.use.check(c, { ...ok, s: '2' })).toBe('count');
    expect(F.use.check(c, { ...ok, g: '84' })).toBe('piece');
    expect(F.text.tryKey(c)).toContain('1953 سم و 84 سم');
  });
});
