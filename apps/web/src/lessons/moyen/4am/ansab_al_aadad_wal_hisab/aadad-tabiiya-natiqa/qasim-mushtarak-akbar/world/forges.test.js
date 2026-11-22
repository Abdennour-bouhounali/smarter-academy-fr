import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { nestOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { dealReducer, dealResult, initDeal } from '../../../../../../common/gameworld/divisorIsles/deal';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { DEAL_INQUIRY, NEST_INQUIRY } from './inquiries';
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

// ───────── keys 1 and 2: what the WORLD logs while he plays the islands (a bridge per line: the gap, the plank) ─────────
const [W1, W2] = NUMBERS.twin.gaps;
const [S1, S2] = NUMBERS.second.gaps;
const fired = (list) => list.map(([a, b]) => ({ a, b }));
/**
 * The story walk's road: 11 holds on 198 and is refused by 234, he walks back, 9 builds both; on the crown 7 holds on 266
 * and runs out of coins on 322, he walks back, 14 builds both. Earlier bridges of the road are in the log too.
 */
const WALKED = {
  'qawasim-mushtaraka': fired([
    [W1, 11],
    [W2, 11],
    [W1, 9],
    [W2, 9],
  ]),
  'al-akbar': fired([
    [W1, 9],
    [W2, 9],
    [S1, 7],
    [S2, 7],
    [S1, 14],
    [S2, 14],
  ]),
};
/** The shortest road: he picked right at once — ONE plank on the two gaps. */
const AT_ONCE = {
  'qawasim-mushtaraka': fired([
    [W1, 9],
    [W2, 9],
  ]),
  'al-akbar': fired([
    [S1, 14],
    [S2, 14],
  ]),
};
/** The longest road: every plank of the island tried. */
const EVERY = {
  'qawasim-mushtaraka': fired([
    [W1, 7],
    [W1, 13],
    [W1, 11],
    [W2, 11],
    [W1, 9],
    [W2, 9],
  ]),
  'al-akbar': fired([
    [S1, 2],
    [S1, 7],
    [S2, 7],
    [S1, 14],
    [S2, 14],
  ]),
};
const ON_ISLANDS = new Set(Object.keys(WALKED));

// ───────── keys 3 and 4: what each experiment hands back when a student plays it through (the world's own logic) ─────────
/** The deal played: 5, 7, 3 and 4 vases, then « 4 vases » (a bigger one is open), then 8 tried and the answer. */
const dealPlayed = (() => {
  const go = (s, a) => dealReducer(DEAL_INQUIRY, s, a);
  const deal = (s0, k) => {
    let s = go(go(s0, { type: 'choose', k }), { type: 'say', v: k === 4 });
    while (s.stage === 'deal') s = go(s, { type: 'tick' });
    return s;
  };
  let s = [5, 7, 3, 4].reduce(deal, initDeal());
  s = go(go(s, { type: 'toAnswer' }), { type: 'answer', k: 4, x: 10, y: 14 });
  expect(s.fact).toMatchObject({ type: 'miss', kind: 'open' });
  s = deal(s, 8);
  s = go(go(s, { type: 'toAnswer' }), { type: 'answer', k: 8, x: 5, y: 7 });
  expect(s.stage).toBe('seen');
  return dealResult(DEAL_INQUIRY, go(s, { type: 'next' }));
})();
const nestResult = {
  rounds: NEST_INQUIRY.rounds.map(({ a, b, probes }) => {
    const n = nestOf(a, b, probes);
    return { a, b, g: n.g, rows: n.rows.map((r) => ({ p: r.p, guess: r.inG, both: r.both })) };
  }),
};
const RESULTS = {
  'baqat-mutamathila': dealPlayed,
  'qawasim-al-pgcd': nestResult,
};
/** How many rules the tiles of each forge allow. */
const TILES = { 'qawasim-mushtaraka': 12, 'al-akbar': 9, 'baqat-mutamathila': 48, 'qawasim-al-pgcd': 12 };
/** What a student who holds the rule writes at the last step of each forge. */
const asSet = (xs) => Object.fromEntries(xs.map((d, i) => [`d${i + 1}`, d]));
const SOLVE = {
  'qawasim-mushtaraka': (c) => asSet(commonDivisors(c.A, c.B)),
  'al-akbar': (c) => ({ g: c.g, h: c.g, x: c.A / c.g, y: c.B / c.g }),
  'baqat-mutamathila': (c) => ({ k: c.g, x: c.nA / c.g, y: c.nB / c.g }),
  'qawasim-al-pgcd': (c) => asSet([...divisorsOf(c.g)].reverse()), // a set: any order
};
/** His evidence when the forge opens: the world's log read by the forge (keys 1, 2), or what the experiment handed back. */
const rowsOf = (key, log = WALKED[key]) =>
  ON_ISLANDS.has(key) ? FORGES[key].evidence(log) : FORGES[key].fromInquiry(RESULTS[key]).rows;
/** The rule is refuted in front of him: on his evidence, or by the first attack. */
const refutedBy = (key, rule, log) => {
  const F = FORGES[key];
  const rows = rowsOf(key, log);
  const run = runOn(F, rule, testsOf(F, rule, rows));
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F.attacks(rule, rows)[0] };
};

describe('the four forges of « القاسم المشترك الأكبر » — no rule is told', () => {
  it('keys 1 and 2: no experiment screen — the evidence is the world’s log, a line per plank fired on the two gaps', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of ON_ISLANDS) {
      const F = FORGES[key];
      expect(F.key).toBe(key);
      expect(F.inquiry).toBeUndefined();
      const rows = rowsOf(key);
      // one line per plank, whatever the number of gaps it was fired on; the other bridges of the road are not his here
      const pair = key === 'qawasim-mushtaraka' ? [W1, W2] : [S1, S2];
      const planksFired = [...new Set(WALKED[key].filter((x) => pair.includes(x.a)).map((x) => x.b))];
      expect(rows.map((r) => r.d)).toEqual(planksFired);
      for (const row of rows) {
        expect([row.A, row.B]).toEqual(pair);
        expect(typeof row.held).toBe('boolean');
      }
      // nothing he did is lost, nothing counted twice — the log read again over his rows changes nothing
      expect(F.evidence(rows)).toHaveLength(rows.length);
      expect(F.evidence([...rows, ...WALKED[key]])).toHaveLength(rows.length);
      // a bridge the mirror built in front of him (an attack) joins his lines (marked as the mirror's), never as a log line
      const [p] = F.attacks(allRules(F).find(F.isTheRule), rows);
      expect(F.evidence([...rows, { ...p, mirror: true }])).toHaveLength(rows.length + 1);
      // the islands held the predictions: none is asked, the kit opens such a forge on its TILES (RuleForge.jsx)
      expect(F.predictCases(rows)).toEqual([]);
      expect(F.predictCases([])).toEqual([]);
    }
  });

  it('keys 1 and 2: every case is a PAIR of gaps — the mirror draws two bridges, the line names both gaps', () => {
    for (const key of ON_ISLANDS) {
      const F = FORGES[key];
      const rows = rowsOf(key, EVERY[key]);
      const cases = [
        ...rows,
        ...allRules(F).flatMap((rule) => F.attacks(rule, rows)),
        ...[1, 2, 3].flatMap((n) => F.nudge(n, rows).cases),
      ];
      for (const c of cases) {
        const need = key === 'al-akbar' && c.fits ? c.A / c.d + c.B / c.d : undefined;
        // forgeParts.jsx › c.pair: the two gaps, the plank, and (👑) the planks the two bridges take
        expect(c.pair, F.caseId(c)).toEqual({ a: c.A, b: c.B, d: c.d, ...(need != null ? { need } : {}) });
        if (key === 'al-akbar') expect(c.need ?? undefined).toBe(need);
        // the line names the gaps and the plank itself: the tag is the verdict, short (a log line stays on one line)
        expect(c.tag).not.toContain(String(c.A));
        expect(c.tag.length, c.tag).toBeLessThanOrEqual(12);
      }
    }
    // keys 3 and 4 keep their own drawing: a sharing, one bridge
    for (const key of ['baqat-mutamathila', 'qawasim-al-pgcd'])
      for (const c of rowsOf(key)) expect(c.pair, key).toBeUndefined();
  });

  it('keys 3 and 4 open on an experiment that holds the predictions, then tiles', () => {
    for (const key of KEYS.filter((k) => !ON_ISLANDS.has(k))) {
      const F = FORGES[key];
      expect(F.key).toBe(key);
      expect(F.inquiry?.kind, key).toBeTruthy();
      expect(F.inquiry.writes, key).toBeUndefined(); // the tiles come after every experiment
      expect(F.predictCases(rowsOf(key)), key).toEqual([]);
      const out = F.fromInquiry(RESULTS[key]);
      expect(out.rule).toBeUndefined();
      expect(out.rows.length, key).toBeGreaterThanOrEqual(4);
      // nothing he did is lost, nothing is counted twice, and the world's log is never mixed in
      expect(F.evidence(out.rows)).toHaveLength(out.rows.length);
      expect(new Set(out.rows.map(F.caseId)).size).toBe(out.rows.length);
      expect(F.evidence([{ a: 198, b: 11 }, ...out.rows])).toHaveLength(out.rows.length);
      for (const row of out.rows) expect(typeof row.held).toBe('boolean');
    }
  });

  it('keys 1 and 2: on ANY road — one plank at once, the walk’s, every plank — every false rule falls in front of him', () => {
    for (const key of ON_ISLANDS) {
      const F = FORGES[key];
      const rules = allRules(F);
      for (const log of [AT_ONCE[key], WALKED[key], EVERY[key]]) {
        const rows = rowsOf(key, log);
        const right = rules.find(F.isTheRule);
        expect(runOn(F, right, rows).bad, `${key}: the right rule agrees with what he did`).toBe(-1);
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const { on, c } = refutedBy(key, rule, log);
          expect(c, `${key} ${ruleKey(F, rule)}`).toBeTruthy();
          expect(F.says(rule, c), `${key} ${ruleKey(F, rule)} ${on}`).not.toBe(c.held);
        }
      }
    }
  });

  for (const key of KEYS) {
    const F = FORGES[key];
    const rows = rowsOf(key);
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);

    describe(`${key} — he writes his rule with tiles`, () => {
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(TILES[key]);
        expect(THE).toHaveLength(1);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
      });

      it('EVERY false rule is refuted in front of him — by what he did, or by a new case the world computes', () => {
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
          expect(c, ruleKey(F, rule)).toBeTruthy();
          expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a NEW case
          // a bridge the mirror can draw and lay plank by plank
          expect(c.a, F.caseId(c)).toBeLessThanOrEqual(60);
          expect(c.q, F.caseId(c)).toBeLessThanOrEqual(40);
          clean(F.text.attack(c));
          clean(F.explain(rule, c));
          clean(F.text.eq(c));
          plain(F.text.broken(F.says(rule, c)));
          byAttack += 1;
        }
        expect(onEvidence + byAttack).toBe(TILES[key] - 1);
        expect(onEvidence).toBeGreaterThan(0);
      });

      it('the right rule agrees with all his evidence and survives two hard attacks', () => {
        const run = runOn(F, THE[0], testsOf(F, THE[0], rows));
        expect(run.bad).toBe(-1);
        // keys 1 and 2: a line per plank he fired on the islands (the walk: two); keys 3 and 4: the experiment's
        expect(run.marks.length).toBeGreaterThanOrEqual(ON_ISLANDS.has(key) ? 2 : 4);
        const hard = F.attacks(THE[0], rows);
        expect(hard).toHaveLength(2);
        expect(new Set(hard.map(F.caseId)).size).toBe(2);
        for (const c of hard) {
          expect(F.says(THE[0], c), F.caseId(c)).toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          expect(c.a).toBeLessThanOrEqual(60);
        }
        // one says « yes » and one says « no »: the mirror does not only confirm
        expect(new Set(hard.map((c) => c.held)).size).toBe(2);
      });

      it('the mirror draws what holds exactly when the number fills both: a bridge, or (💐) a sharing into vases', () => {
        const nudged = [1, 2, 3].flatMap((n) => F.nudge(n, rows).cases);
        for (const c of [...rows, ...F.attacks(THE[0], rows), ...nudged]) {
          const A = c.A ?? c.nA;
          const B = c.B ?? c.nB;
          const d = c.d ?? c.k;
          expect(c.fits).toBe(A % d === 0 && B % d === 0);
          if (key !== 'baqat-mutamathila') {
            expect(c.deal, F.caseId(c)).toBeUndefined(); // the other forges keep their bridge
            expect(c.b).toBe(d);
            expect([A, B]).toContain(c.a);
            expect(c.r === 0 && c.q >= 1).toBe(c.fits);
            continue;
          }
          // a SHARING (forgeParts.jsx › c.deal): the roses and the lilies dealt into d vases — the experiment's own pieces
          expect(c.deal, F.caseId(c)).toMatchObject({
            a: { n: A, item: DEAL_INQUIRY.a.item },
            b: { n: B, item: DEAL_INQUIRY.b.item },
            k: d,
            lot: DEAL_INQUIRY.lot,
          });
          if (c.kind === 'lot') expect(c.deal.claim).toEqual([c.x, c.y]);
          else expect(c.deal.claim).toBeUndefined();
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        for (const rule of rules) {
          plain(F.ruleText(rule));
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
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
            expect(c.a).toBeLessThanOrEqual(60);
            expect(typeof c.held).toBe('boolean');
            clean(F.text.eq(c));
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          }
          expect(F.caseId(h.cases[0])).not.toBe(F.caseId(h.cases[1]));
          // each pair shows the two answers of the world
          expect(h.cases[0].held).not.toBe(h.cases[1].held);
        }
        const THE_RULE = THE[0];
        for (const s of F.slots) {
          const label = s.options.find((o) => o.id === THE_RULE[s.id]).label;
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
          // every box is wide enough for its answer
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
  it('🤝 « it fills the first gap », « one of them », « it is shorter than both » fall on 11 — the plank 234 refused', () => {
    for (const rule of [
      { act: 'fill', where: 'first' },
      { act: 'fill', where: 'one' },
      { act: 'shorter', where: 'each' },
    ]) {
      const { on, c } = refutedBy('qawasim-mushtaraka', rule);
      expect([on, c.d, c.fa, c.fb, c.held], rule.where).toEqual(['evidence', 11, true, false, false]);
    }
    expect(W2 % 11).toBe(3);
  });

  it('🤝 « the glued gap », « the difference », « the second gap » agree with 11 and 9 — a new pair breaks each', () => {
    for (const where of ['glued', 'diff', 'second']) {
      const { on, c } = refutedBy('qawasim-mushtaraka', { act: 'fill', where });
      expect(on, where).toBe('attack');
      expect(FORGES['qawasim-mushtaraka'].says({ act: 'fill', where }, c), where).toBe(true);
      expect(c.held, where).toBe(false); // a plank of that length, and not of both gaps
    }
    // on the longest road, « the second gap » falls on 13: it fills 234, and not 198
    const { on, c } = refutedBy('qawasim-mushtaraka', { act: 'fill', where: 'second' }, EVERY['qawasim-mushtaraka']);
    expect([on, c.d]).toEqual(['evidence', 13]);
    // 7 fills neither, and is shorter than both: on the longest road it refutes « shorter »
    expect(refutedBy('qawasim-mushtaraka', { act: 'shorter', where: 'each' }, EVERY['qawasim-mushtaraka']).c.d).toBe(7);
  });

  it('👑 « any plank of both, they cost the same » falls on 7; « the longest of a gap », « the shortest » fall on 14', () => {
    const any = refutedBy('al-akbar', { pick: 'any', among: 'both' });
    expect([any.on, any.c.d, any.c.fits, any.c.held, any.c.need]).toEqual(['evidence', 7, true, false, 84]);
    for (const rule of [
      { pick: 'longest', among: 'short' }, // the shorter gap itself, 266
      { pick: 'longest', among: 'long' },
      { pick: 'shortest', among: 'both' }, // 1
    ]) {
      const { on, c } = refutedBy('al-akbar', rule);
      expect([on, c.d, c.held, c.need], `${rule.pick} ${rule.among}`).toEqual(['evidence', 14, true, 42]);
    }
    // he built both at once with 14: « any plank » agrees with him — a new pair breaks it on a shorter plank of both
    const once = refutedBy('al-akbar', { pick: 'any', among: 'both' }, AT_ONCE['al-akbar']);
    expect(once.on).toBe('attack');
    expect([once.c.fits, once.c.held]).toEqual([true, false]);
    expect(once.c.g).toBeGreaterThan(once.c.d);
  });

  it('💐 « it divides one of them » falls on a number of vases that leaves flowers; « the smaller number » on 8', () => {
    const one = refutedBy('baqat-mutamathila', { must: 'one', most: 'gcd', holds: 'quot' }).c;
    expect(one.kind).toBe('deal');
    expect(one.fa !== one.fb && !one.held).toBe(true);
    for (const most of ['min', 'diff', 'half']) {
      const c = refutedBy('baqat-mutamathila', { must: 'both', most, holds: 'quot' }).c;
      expect([c.kind, c.k, c.held]).toEqual(['most', 8, true]);
    }
    const same = refutedBy('baqat-mutamathila', { must: 'both', most: 'gcd', holds: 'same' }).c;
    expect([same.kind, same.k, same.x, same.y]).toEqual(['lot', 8, 5, 7]);
  });

  it('💐 every case the mirror can show is a sharing it can draw (two collections of 60 at most, 12 vases at most), and no word of it is a plank', () => {
    const F = FORGES['baqat-mutamathila'];
    const rows = rowsOf('baqat-mutamathila');
    const cases = [
      ...rows,
      ...allRules(F).flatMap((rule) => F.attacks(rule, rows)),
      ...[1, 2, 3].flatMap((n) => F.nudge(n, rows).cases),
    ];
    expect(cases.length).toBeGreaterThan(40);
    for (const c of cases) {
      const { a, b, k } = c.deal;
      expect(Math.max(a.n, b.n), F.caseId(c)).toBeLessThanOrEqual(60);
      expect(k, F.caseId(c)).toBeLessThanOrEqual(12);
      const words = [
        c.tag,
        F.text.attack(c),
        F.text.refuted({ ...c, says: !c.held }),
        F.text.refuted({ ...c, says: c.held }),
      ];
      for (const rule of allRules(F)) words.push(F.explain(rule, c));
      for (const w of words) expect(w, w).not.toMatch(/لوح|ألواح|هوّة|جسر/);
    }
    for (const w of [F.text.experiment, F.text.testing, F.text.agreed, F.text.fire, F.text.survived, F.text.log])
      expect(w, w).not.toMatch(/لوح|ألواح|هوّة|جسر/);
  });

  it('🧩 the divisors of the smaller number, of the difference, every number up to 12, the multiples of 12 — all fall', () => {
    expect(refutedBy('qawasim-al-pgcd', { which: 'div', of: 'min' }).c.d).toBe(19);
    expect(refutedBy('qawasim-al-pgcd', { which: 'div', of: 'diff' }).c.d).toBe(8); // 8 divides 276 − 228 = 48
    expect(refutedBy('qawasim-al-pgcd', { which: 'upto', of: 'g' }).c.d).toBe(8);
    expect(refutedBy('qawasim-al-pgcd', { which: 'mult', of: 'g' }).c.d).toBe(6);
  });
});

describe('the words and the numbers of the forges', () => {
  /** Every sentence a forge can show, for a set of cases. */
  const sentences = (F, rules) => {
    const rows = rowsOf(F.key);
    const predicted = F.predictCases(rows);
    const cases = [
      ...rows,
      ...predicted,
      ...rules.flatMap((r) => F.attacks(r, rows)),
      ...[1, 2, 3].flatMap((n) => F.nudge(n).cases),
    ];
    const T = F.text;
    return [
      ...predicted.flatMap((c) => [T.ask(c), T.fact(c)]),
      T.next,
      T.title,
      T.log,
      T.frame,
      T.buildLead,
      T.testing,
      T.agreed,
      T.experiment,
      T.wordsHint,
      ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
      ...rules.map((r) => F.ruleText(r)),
      ...cases.flatMap((c) => [
        T.attack(c),
        T.refuted({ ...c, says: true }),
        c.tag,
        ...rules.map((r) => F.explain(r, c)),
      ]),
    ];
  };

  it('🤝 and 👑 come before the name: no sentence of theirs writes « PGCD » or « القاسم المشترك الأكبر »', () => {
    for (const key of ['qawasim-mushtaraka', 'al-akbar']) {
      const F = FORGES[key];
      for (const line of sentences(F, allRules(F))) expect(line, line).not.toMatch(/PGCD|القاسم المشترك الأكبر|الأكبر/);
    }
    // nor does 🤝 say the name of its own key before its tablet
    const F = FORGES['qawasim-mushtaraka'];
    for (const line of sentences(F, allRules(F))) expect(line, line).not.toMatch(/قاسم|قواسم|مشترك/);
  });

  it('the last steps use numbers of the platform’s own: no pair of the bank, of another lesson, nor the market', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const bank = join(here, '../../../../../../../../../../content/practice/4am/qasim-mushtarak-akbar');
    const sheets = readdirSync(bank).flatMap((lvl) =>
      readdirSync(join(bank, lvl)).map((f) => readFileSync(join(bank, lvl, f), 'utf8')),
    );
    const lessons = join(here, '../../../../../../');
    const others = [
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qawasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/khawass-qawasim',
      'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi',
      'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma',
      'moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr',
    ].map((p) => readFileSync(join(lessons, p, 'world/story.js'), 'utf8'));
    const has = (s, n) => new RegExp(`\\b${n}\\b`).test(s);
    const pairsOf = (key) => {
      const seen = new Map();
      for (let seed = 1; seed <= 200; seed += 1) {
        const c = FORGES[key].use.make(rng(seed * 7919));
        const pair = [c.A ?? c.nA, c.B ?? c.nB];
        seen.set(pair.join(':'), pair);
      }
      return [...seen.values()];
    };
    const market = [NUMBERS.boss.roses, NUMBERS.boss.lilies];
    let checked = 0;
    for (const key of KEYS)
      for (const [x, y] of pairsOf(key)) {
        for (const s of [...sheets, ...others]) expect(has(s, x) && has(s, y), `${key} ${x} ${y}`).toBe(false);
        expect(market).not.toContain(x);
        expect(market).not.toContain(y);
        // three-digit numbers: none of them appears in the bank at all
        for (const n of [x, y].filter((v) => v >= 100)) for (const s of sheets) expect(has(s, n), `${n}`).toBe(false);
        checked += 1;
      }
    expect(checked).toBe(16); // four pairs per forge, every one drawn
  });

  it('the last step of 👑 answers a short plank, a plank of one gap only, two lengths, a wrong count — never the answer', () => {
    const F = FORGES['al-akbar'];
    const c = { A: 174, B: 261, g: gcd(174, 261) };
    expect(c.g).toBe(87);
    expect(F.use.check(c, { g: '29', h: '29', x: '6', y: '9' })).toBe('longer');
    expect(F.use.check(c, { g: '58', h: '58', x: '3', y: '4' })).toBe('both');
    expect(F.use.check(c, { g: '87', h: '29', x: '2', y: '3' })).toBe('same');
    expect(F.use.check(c, { g: '87', h: '87', x: '2', y: '4' })).toBe('count');
    expect(F.use.check(c, { g: '87', h: '87', x: '2', y: '3' })).toBe('ok');
  });

  it('the last step of 💐: a number that leaves something, a smaller one that shares, a wrong lot', () => {
    const F = FORGES['baqat-mutamathila'];
    const c = { nA: 345, nB: 465, g: gcd(345, 465) };
    expect(c.g).toBe(15);
    expect(F.use.check(c, { k: '10', x: '1', y: '1' })).toBe('share');
    expect(F.use.check(c, { k: '5', x: '69', y: '93' })).toBe('more');
    expect(F.use.check(c, { k: '15', x: '23', y: '30' })).toBe('lot');
    expect(F.use.check(c, { k: '15', x: '23', y: '31' })).toBe('ok');
    // its units are printed, never typed; the boxes say what they hold
    const lines = F.use.lines({ ...c, a: 'قارورات الماء', b: 'علب العصير', lots: 'الأكياس', lot: 'كيس' });
    expect(lines.map((l) => l.tokens[0])).toEqual([
      'أكبر عدد من الأكياس',
      'قارورات الماء في كلّ كيس',
      'علب العصير في كلّ كيس',
    ]);
  });

  it('the last steps of 🤝 and 🧩 are sets: a member twice or a number that is no member is answered', () => {
    for (const key of ['qawasim-mushtaraka', 'qawasim-al-pgcd']) {
      const F = FORGES[key];
      const c = F.use.make(rng(3));
      const vals = SOLVE[key](c);
      const keys = Object.keys(vals);
      expect(F.use.check(c, { ...vals, [keys[0]]: vals[keys[1]] })).toBe('twice');
      expect(F.use.check(c, { ...vals, [keys[0]]: 4 * 9 * 25 })).toBe('intruder');
      expect(F.use.lines(c)[0].tokens[0]).toBe('{');
      expect(F.use.lines(c)[0].tokens.at(-1)).toBe('}');
    }
    // 🧩 is given the PGCD; 🤝 is not
    expect(FORGES['qawasim-al-pgcd'].text.tryKey({ A: 598, B: 782 })).toContain('\\mathrm{PGCD}(598 ; 782) = 46');
    expect(FORGES['qawasim-mushtaraka'].text.tryKey({ A: 54, B: 78 })).not.toContain('PGCD');
  });
});
