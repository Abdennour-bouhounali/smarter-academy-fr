import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { commonDivisors, divisorsOf, gcd } from './math';
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

// ───────── what the WORLD logs while he plays the islands (a bridge per line: the gap, the plank) ─────────
const fired = (list) => list.map(([a, b]) => ({ a, b }));
const [L1, L2] = NUMBERS.lists.gaps;
const [S1] = NUMBERS.same.gaps;
const [N1, N2] = NUMBERS.nest.gaps;
/** The log of the road before each mirror (the bridges of earlier convoys are in it too: none is his here). */
const BEFORE = {
  'hasr-wa-taqatu': [],
  'nataij-mubashira': fired([
    [L1, 4],
    [L2, 4],
  ]),
};
BEFORE['b-yaqsim-a'] = [...BEFORE['nataij-mubashira'], ...fired([[S1, 27]])];
/** The shortest road: the right plank at once. On ⚡ the three gaps of 27 are ONE line of the log, the gap of 0 none. */
const AT_ONCE = {
  'hasr-wa-taqatu': fired([
    [L1, 4],
    [L2, 4],
  ]),
  'nataij-mubashira': fired([[S1, 27]]),
  'b-yaqsim-a': fired([
    [N1, 19],
    [N2, 19],
  ]),
};
/** The story walk's road: one or two planks first. */
const WALKED = {
  'hasr-wa-taqatu': fired([
    [L1, 8],
    [L2, 8],
    [L1, 2],
    [L2, 2],
    [L1, 4],
    [L2, 4],
  ]),
  'nataij-mubashira': fired([
    [S1, 9],
    [S1, 27],
  ]),
  'b-yaqsim-a': fired([
    [N1, 38],
    [N1, 19],
    [N2, 19],
  ]),
};
/** The longest road: every plank a student tries. */
const EVERY = {
  'hasr-wa-taqatu': fired([
    [L1, 1],
    [L1, 16],
    [L2, 16],
    [L1, 11],
    [L1, 8],
    [L2, 8],
    [L1, 2],
    [L2, 2],
    [L1, 4],
    [L2, 4],
  ]),
  'nataij-mubashira': fired([
    [S1, 1],
    [S1, 3],
    [S1, 9],
    [S1, 27],
  ]),
  'b-yaqsim-a': fired([
    [N1, 1],
    [N1, 2],
    [N2, 2],
    [N1, 4],
    [N1, 38],
    [N1, 19],
    [N2, 19],
  ]),
};
const ROADS = { AT_ONCE, WALKED, EVERY };
const logOf = (key, road = WALKED) => [...BEFORE[key], ...road[key]];
const rowsOf = (key, road) => FORGES[key].evidence(logOf(key, road));
/** The rule is refuted in front of him: on his evidence, or by the first attack. */
const refutedBy = (key, rule, road) => {
  const F = FORGES[key];
  const rows = rowsOf(key, road);
  const run = runOn(F, rule, testsOf(F, rule, rows));
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F.attacks(rule, rows)[0] };
};
/** How many rules the tiles of each forge allow. */
const TILES = { 'hasr-wa-taqatu': 16, 'nataij-mubashira': 16, 'b-yaqsim-a': 9 };
/** The right answer of the last step of each forge, computed from the case. */
const asSet = (prefix, xs) => Object.fromEntries(xs.map((d, i) => [`${prefix}${i + 1}`, d]));
const SOLVE = {
  'hasr-wa-taqatu': (c) => ({
    ...asSet('a', [...divisorsOf(c.A)].reverse()), // a set: any order
    ...asSet('b', divisorsOf(c.B)),
    ...asSet('c', commonDivisors(c.A, c.B)),
    g: gcd(c.A, c.B),
  }),
  'nataij-mubashira': (c) => ({ s: c.same, z: c.zero, o: 1, t: gcd(...c.turn) }),
  'b-yaqsim-a': (c) => ({ q: c.A / c.B, g: gcd(c.A, c.B) }),
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

describe('the three forges of « تعيين القاسم المشترك الأكبر » — met on the islands, no rule is told', () => {
  it('no forge has an experiment screen: each opens on its tiles, its evidence the world’s log', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      const F = FORGES[key];
      expect(F.key).toBe(key);
      expect(F.inquiry).toBeUndefined();
      for (const road of Object.values(ROADS)) expect(F.predictCases(rowsOf(key, road))).toEqual([]);
      expect(F.predictCases([])).toEqual([]);
    }
  });

  it('📋 a line per plank he made on 32 and 44 (the bridges of other gaps are not his here)', () => {
    const F = FORGES['hasr-wa-taqatu'];
    expect(rowsOf(F.key, WALKED).map((r) => [r.A, r.B, r.d, r.held])).toEqual([
      [32, 44, 8, false],
      [32, 44, 2, false],
      [32, 44, 4, true],
    ]);
    expect(rowsOf(F.key, EVERY).map((r) => r.d)).toEqual([1, 16, 11, 8, 2, 4]);
    // the plank 2 fills both but needs 38 planks: the purse holds 19 coins
    const two = rowsOf(F.key, WALKED)[1];
    expect([two.fits, two.need, two.purse, two.tag]).toEqual([true, 38, 19, '38 لوحًا']);
    // the crossing with 4 is his even when the log has lost it (an old save): island C cannot be reached otherwise
    expect(F.evidence(fired([[L1, 8]])).map((r) => r.d)).toEqual([8, 4]);
    expect(F.evidence([]).map((r) => r.d)).toEqual([4]);
  });

  it('⚡ the two crossings the story guarantees, then every other plank he made for a gap of 27', () => {
    const F = FORGES['nataij-mubashira'];
    // the log holds ONE line for the three gaps of 27, none for the gap of 0 cells
    const once = rowsOf(F.key, AT_ONCE);
    expect(once.map((r) => [r.kind, r.A, r.B, r.d, r.held, r.need])).toEqual([
      ['same', 27, 27, 27, true, 2],
      ['zero', 27, 0, 27, true, 1],
    ]);
    expect(once.map((r) => r.purse)).toEqual([NUMBERS.same.purse, NUMBERS.full.purse]);
    expect(F.evidence([]).map(F.caseId)).toEqual(once.map(F.caseId));
    expect(rowsOf(F.key, EVERY).map((r) => [r.kind, r.d])).toEqual([
      ['same', 1],
      ['same', 3],
      ['same', 9],
      ['same', 27],
      ['zero', 27],
    ]);
    // the bridges of 32 and 44 crossed before are not his here
    expect(
      F.evidence(
        fired([
          [L1, 4],
          [L2, 4],
        ]),
      ).every((r) => r.A === 27),
    ).toBe(true);
  });

  it('🎯 a line per plank he made on 19 and 76; 19 is there even when the log lost it', () => {
    const F = FORGES['b-yaqsim-a'];
    expect(rowsOf(F.key, WALKED).map((r) => [r.d, r.held, r.tag])).toEqual([
      [38, false, 'لا يملؤهما'],
      [19, true, '5 ألواح'],
    ]);
    expect(F.evidence([]).map((r) => r.d)).toEqual([19]);
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

  it('every case is a PAIR of gaps and one plank — the mirror draws two bridges, the line names both gaps', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const c of shownCases(F)) {
        const need = c.A % c.d === 0 && c.B % c.d === 0 ? c.A / c.d + c.B / c.d : undefined;
        expect(c.pair, F.caseId(c)).toEqual({ a: c.A, b: c.B, d: c.d, ...(need != null ? { need } : {}) });
        expect(c.fits).toBe(need != null);
        // what the world does: the purse holds the planks of the longest plank of both — only that plank is paid
        expect(c.purse).toBe(c.A / gcd(c.A, c.B) + c.B / gcd(c.A, c.B));
        expect(c.held, F.caseId(c)).toBe(need != null && need <= c.purse);
        expect(c.held).toBe(c.d === gcd(c.A, c.B));
        expect(c.deal).toBeUndefined();
        // the tag is short (a log line stays on one line) and names no gap
        expect(c.tag.length, c.tag).toBeLessThanOrEqual(12);
        expect(BANK_PAIRS.has(pairKey(c.A, c.B)), F.caseId(c)).toBe(false);
      }
      // what the mirror builds: a pair it can draw and lay plank by plank (his own rows are only drawn small)
      for (const c of builtCases(F)) {
        expect(Math.max(c.A, c.B), F.caseId(c)).toBeLessThanOrEqual(90);
        expect(c.q, F.caseId(c)).toBeLessThanOrEqual(40);
      }
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
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(TILES[key]);
        expect(THE).toHaveLength(1);
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
          clean(F.text.eq(c));
          plain(F.text.broken(F.says(rule, c)));
          byAttack += 1;
        }
        expect(onEvidence + byAttack).toBe(TILES[key] - 1);
        expect(onEvidence).toBeGreaterThan(0);
      });

      it('the right rule agrees with all his evidence and survives two hard attacks, one paid and one not', () => {
        for (const road of Object.values(ROADS)) {
          const rs = rowsOf(key, road);
          expect(runOn(F, THE[0], testsOf(F, THE[0], rs)).bad).toBe(-1);
          const hard = F.attacks(THE[0], rs);
          expect(hard).toHaveLength(2);
          expect(new Set(hard.map((c) => c.held))).toEqual(new Set([true, false]));
          for (const c of hard) {
            expect(F.says(THE[0], c), F.caseId(c)).toBe(c.held);
            expect(rs.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          }
          // the mirror built the first one: the second is still a new case
          const after = F.evidence([...rs, { ...hard[0], mirror: true }]);
          expect(F.attacks(THE[0], after).map(F.caseId)).toContain(F.caseId(hard[1]));
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        for (const rule of rules) {
          plain(F.ruleText(rule));
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
          for (const s of F.slots)
            plain(
              F.chip(
                s,
                s.options.find((o) => o.id === rule[s.id]),
              ),
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
          clean(T.eq(c));
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
            clean(F.text.eq(c));
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
          for (const v of Object.values(vals)) expect(Number.isInteger(v) && v >= 1).toBe(true);
          const lines = F.use.lines(c);
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

// ───────── the bank's pairs (read as story.test.js reads them) ─────────
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '../../../../../../../../../../content/practice/4am/tayin-pgcd');
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

describe('the false rules students really hold can be written — and the world refutes each', () => {
  const hasr = (rows, keep, make) => ({ rows, keep, make });

  it('📋 « the shorter gap’s planks », « the longest of one gap », « the shortest », « the difference » fall on 4 — even made at once', () => {
    for (const road of [AT_ONCE, WALKED])
      for (const rule of [
        hasr('short', 'every', 'longest'), // 32
        hasr('long', 'every', 'longest'), // 44
        hasr('each', 'one', 'longest'), // 44
        hasr('each', 'every', 'shortest'), // 1
        hasr('diff', 'every', 'longest'), // 12
      ]) {
        const { on, c } = refutedBy('hasr-wa-taqatu', rule, road);
        expect([on, c.d, c.held], ruleKey(FORGES['hasr-wa-taqatu'], rule)).toEqual(['evidence', 4, true]);
      }
    // « the shortest of every row » says the plank 1, which he made on the longest road: the coins refused it first
    const one = refutedBy('hasr-wa-taqatu', hasr('each', 'every', 'shortest'), EVERY);
    expect([one.on, one.c.d, one.c.fits, one.c.need, one.c.purse]).toEqual(['evidence', 1, true, 76, 19]);
  });

  it('⚡ « a plank of 1 for equal gaps », « a plank of 0 » fall on his crossings; « the other gap » for (27 ; 1), « another plank » turned round fall on the mirror’s attacks', () => {
    const right = { same: 'their', zero: 'other', one: 'unit', turn: 'same' };
    const unit = refutedBy('nataij-mubashira', { ...right, same: 'unit' }, AT_ONCE);
    expect([unit.on, unit.c.kind, unit.c.d]).toEqual(['evidence', 'same', 27]);
    const none = refutedBy('nataij-mubashira', { ...right, zero: 'none' }, AT_ONCE);
    expect([none.on, none.c.kind, none.c.B, none.c.d]).toEqual(['evidence', 'zero', 0, 27]);
    const other = refutedBy('nataij-mubashira', { ...right, one: 'other' }, AT_ONCE);
    expect([other.on, other.c.A, other.c.B, other.c.d, other.c.held]).toEqual(['attack', 27, 1, 27, false]);
    const turned = refutedBy('nataij-mubashira', { ...right, turn: 'another' }, AT_ONCE);
    expect([turned.on, turned.c.A, turned.c.B, turned.c.d, turned.c.held]).toEqual(['attack', 44, 32, 8, false]);
    // the right rule is attacked on (27 ; 1) and on (44 ; 32)
    const F = FORGES['nataij-mubashira'];
    expect(F.attacks(right, rowsOf(F.key, AT_ONCE)).map(F.caseId)).toEqual(['27:1:27', '44:32:4']);
  });

  it('🎯 « always the shorter gap » and « the difference » fall on 90 and 36; « the longer gap », « how many times » on 19', () => {
    const F = FORGES['b-yaqsim-a'];
    for (const road of Object.values(ROADS)) {
      const always = refutedBy(F.key, { fills: 'short', else: 'short' }, road);
      expect([always.on, always.c.A, always.c.B, always.c.d, always.c.held]).toEqual(['attack', 90, 36, 36, false]);
      const diff = refutedBy(F.key, { fills: 'short', else: 'diff' }, road);
      expect([diff.on, diff.c.A, diff.c.B, diff.c.d]).toEqual(['attack', 90, 36, 54]);
      for (const fills of ['long', 'times']) {
        const r = refutedBy(F.key, { fills, else: 'rows' }, road);
        // « how many times » says 4 — a plank he made on the longest road, which fills 76 and not 19
        const at = road === EVERY && fills === 'times' ? [4, false] : [19, true];
        expect([r.on, r.c.d, r.c.held], fills).toEqual(['evidence', ...at]);
      }
      expect(F.attacks({ fills: 'short', else: 'rows' }, rowsOf(F.key, road)).map(F.caseId)).toEqual([
        '90:36:36',
        '90:36:18',
      ]);
    }
    // the mirror's pair is the story's: 36 does not fill 90, 7 coins pay 18 (5 + 2)
    const { gaps, purse, plank } = NUMBERS.against;
    expect([gaps[0] % gaps[1] !== 0, gcd(...gaps), gaps[0] / plank + gaps[1] / plank]).toEqual([true, plank, purse]);
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
          F.chip(
            s,
            s.options.find((o) => o.id === r[s.id]),
          ),
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
    'hasr-wa-taqatu': /احصر|قاطع|قاسم|قواسم|مشترك|PGCD/,
    'nataij-mubashira': /مباشر|PGCD|قاسم/,
    'b-yaqsim-a': /يقسم|قاسم|PGCD|الأصغر الأكبر/,
  };

  it('no sentence of a forge before its last step names its key or states it in the words of numbers', () => {
    for (const key of KEYS) for (const line of sentences(FORGES[key])) expect(line, line).not.toMatch(FORBIDDEN[key]);
  });

  it('the numbers of the forges: no pair of the bank, of another lesson, nor the last bridge’s piers', () => {
    const lessons = join(here, '../../../../../../');
    const others = [
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qawasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/khawass-qawasim',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar',
    ].map((p) => readFileSync(join(lessons, p, 'world/story.js'), 'utf8'));
    const has = (s, n) => new RegExp(`\\b${n}\\b`).test(s);
    const usePairs = new Map();
    for (let seed = 1; seed <= 200; seed += 1) {
      const r = rng(seed * 7919);
      const h = FORGES['hasr-wa-taqatu'].use.make(r);
      const d = FORGES['nataij-mubashira'].use.make(r);
      const n = FORGES['b-yaqsim-a'].use.make(r);
      for (const p of [[h.A, h.B], [d.same, d.same], [d.zero, 0], [1, d.one], d.turn, [n.A, n.B]])
        usePairs.set(pairKey(...p), p);
    }
    expect(usePairs.size).toBe(1 + 3 + 3 + 3 + 0 + 4); // the turned pair is 📋's own pair
    for (const [x, y] of usePairs.values()) {
      expect(BANK_PAIRS.has(pairKey(x, y)), `${x} ; ${y}`).toBe(false);
      for (const s of others)
        for (const line of s.split('\n')) expect(has(line, x) && has(line, y) && x !== y).toBe(false);
      for (const n of [x, y].filter((v) => v >= 100)) for (const s of SHEETS) expect(has(s, n), `${n}`).toBe(false);
      for (const n of [x, y]) expect(NUMBERS.boss.piers).not.toContain(n);
    }
  });

  it('📋 last step: the two sets, the common set, then the number — a member missing, an intruder, a shorter one are answered', () => {
    const F = FORGES['hasr-wa-taqatu'];
    const c = F.use.make();
    expect([c.A, c.B, c.da, c.db, c.common, c.g]).toEqual([58, 87, [1, 2, 29, 58], [1, 3, 29, 87], [1, 29], 29]);
    const lines = F.use.lines(c);
    expect(lines).toHaveLength(4);
    expect(lines.slice(0, 3).map((l) => [l.tokens[0], l.tokens.at(-1)])).toEqual([
      ['{', 'قواسم 58'],
      ['{', 'قواسم 87'],
      ['{', 'القواسم المشتركة'],
    ]);
    const ok = { ...asSet('a', [1, 2, 29, 58]), ...asSet('b', [1, 3, 29, 87]), ...asSet('c', [29, 1]), g: 29 };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, a3: 3 })).toBe('intruderA');
    expect(F.use.check(c, { ...ok, a3: 2 })).toBe('twiceA');
    expect(F.use.check(c, { ...ok, b2: 2 })).toBe('intruderB');
    expect(F.use.check(c, { ...ok, c1: 2 })).toBe('intruderC');
    expect(F.use.check(c, { ...ok, c2: 29 })).toBe('twiceC');
    expect(F.use.check(c, { ...ok, g: 1 })).toBe('longer');
    expect(F.use.check(c, { ...ok, g: 58 })).toBe('pgcd');
  });

  it('⚡ last step: four pairs, each answered alone', () => {
    const F = FORGES['nataij-mubashira'];
    const c = { same: 53, zero: 64, one: 73, turn: [87, 58] };
    expect(F.use.lines(c).map((l) => l.tokens[0])).toEqual([
      'PGCD(53 ; 53)',
      'PGCD(64 ; 0)',
      'PGCD(1 ; 73)',
      'PGCD(87 ; 58)',
    ]);
    const ok = { s: '53', z: '64', o: '1', t: '29' };
    expect(F.use.check(c, ok)).toBe('ok');
    expect(F.use.check(c, { ...ok, s: '1' })).toBe('same');
    expect(F.use.check(c, { ...ok, z: '0' })).toBe('zero');
    expect(F.use.check(c, { ...ok, o: '73' })).toBe('one');
    expect(F.use.check(c, { ...ok, t: '1' })).toBe('turn');
    expect(F.text.tryKey(c)).toContain('\\mathrm{PGCD}(58 ; 87) = 29');
  });

  it('🎯 last step: the product, then the number — a wrong product, a smaller common divisor, a non-divisor are answered', () => {
    const F = FORGES['b-yaqsim-a'];
    for (let seed = 1; seed <= 40; seed += 1) {
      const c = F.use.make(rng(seed * 31));
      expect(c.A % c.B).toBe(0);
      expect(gcd(c.A, c.B)).toBe(c.B);
    }
    const c = { A: 403, B: 31, q: 13, g: 31 };
    expect(F.use.check(c, { q: '13', g: '31' })).toBe('ok');
    expect(F.use.check(c, { q: '12', g: '31' })).toBe('times');
    expect(F.use.check(c, { q: '13', g: '1' })).toBe('longer');
    expect(F.use.check(c, { q: '13', g: '13' })).toBe('pgcd');
  });
});
