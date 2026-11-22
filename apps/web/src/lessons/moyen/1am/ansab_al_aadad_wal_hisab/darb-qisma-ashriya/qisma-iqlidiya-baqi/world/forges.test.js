import { describe, it, expect } from 'vitest';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { groupsOf, rebuildOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { cycleOf, probeOf } from '../../../../../../common/gameworld/divisorIsles/cycle';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { NUMBERS, STORY, TABLETS } from './story';
import { GROUPS_INQUIRY, CYCLE_INQUIRY, REBUILD_INQUIRY, ESTIMATE_INQUIRY } from './inquiries';

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
const plainText = (x) => expect(String(x), String(x)).not.toMatch(/\$|\\/);

/** What each investigation hands back when the student plays it through (the facts are the world's, computed). */
const RESULTS = {
  'majmuaat-kamila': {
    rounds: GROUPS_INQUIRY.rounds.map(({ a, b }, i) => {
      const { q, r } = groupsOf(a, b);
      // on the first gap he counted the plank that hung over the end too
      return { a, b, q, r, guesses: [], said: i === 0 ? { q: q + 1, r } : { q, r } };
    }),
  },
  'baqi-asghar': {
    // he says « one more » at every cell — also where the strip lays a plank instead (he says b there)
    rounds: CYCLE_INQUIRY.rounds.map(({ b, from, count }) => {
      const { steps } = cycleOf(b, from, count);
      return {
        b,
        from,
        steps: steps.map((st, i) => ({ a: st.a, r: st.r, said: i === 0 ? null : steps[i - 1].r + 1 })),
      };
    }),
    // on the first plank he has not laid he says « b cells, and yes »; on the second he has it
    probes: CYCLE_INQUIRY.probes.map(({ b, from }, i) => ({
      b,
      from: probeOf(b, from).start,
      max: b - 1,
      said: i === 0 ? { max: b, same: true } : { max: b - 1, same: false },
    })),
  },
  'musawat-qisma': {
    rounds: REBUILD_INQUIRY.rounds.map(({ b, q, r }, i) => {
      const { a } = rebuildOf(b, q, r);
      // on the second gap he added the three numbers
      return { b, q, r, a, said: i === 1 ? b + q + r : a };
    }),
  },
  'taqdir-hasil': {
    rounds: ESTIMATE_INQUIRY.rounds.map(({ a, b }) => {
      const q = Math.floor(a / b);
      return { a, b, q, r: a % b, tens: Math.floor(q / 10), units: q % 10, guesses: [] };
    }),
  },
};
/** The bridges he fired on the way (the world's log) — the mirror-alone forge mounts on them and keeps none. */
const { first, count, groups, rests } = NUMBERS;
const CROSSING = [
  { a: first.a, b: first.plank },
  ...count.moulds.map((b) => ({ a: count.a, b })),
  ...groups.moulds.map((b) => ({ a: groups.a, b })),
  ...rests.moulds.map((b) => ({ a: rests.a, b })),
];
/** What a student who holds the rule writes at the last step of each forge. */
const division = (c) => ({ q: Math.floor(c.a / c.b), r: c.a % c.b });
const SOLVE = {
  'majmuaat-kamila': division,
  'baqi-asghar': (c) => ({ lo: 0, hi: c.b - 1 }),
  'musawat-qisma': (c) => ({ a: c.b * c.q + c.r }),
  'taqdir-hasil': division,
  'baqi-fi-masala': (c) => ({ ...division(c), n: Math.ceil(c.a / c.b) }),
};
/** How many rules the tiles of each forge allow. */
const RULES = {
  'majmuaat-kamila': 16,
  'baqi-asghar': 8,
  'musawat-qisma': 16,
  'taqdir-hasil': 12,
  'baqi-fi-masala': 36,
};
/** The longest gap the mirror draws: cells it can count — the estimate's gaps are drawn as a bar. */
const LONGEST = { 'taqdir-hasil': 800 };
/**
 * His evidence when he writes his rule: what he did in the investigation — or, for the forge that is the mirror alone,
 * the cases the mirror built for his predictions (as `RuleForge` keeps them: `mirror: true`).
 */
const rowsOf = (F) =>
  F.inquiry
    ? F.evidence(F.fromInquiry(RESULTS[F.key]).rows)
    : F.evidence(F.predictCases(F.evidence(CROSSING), rng(424243)).map((c) => ({ ...c, mirror: true })));

describe('the five forges of « القسمة الإقليدية » — no rule is told', () => {
  it('there is one forge per key of the lesson; four open on an investigation, the decision of a problem on the mirror', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) expect(FORGES[key].key).toBe(key);
    for (const key of KEYS.slice(0, 4)) {
      expect(FORGES[key].inquiry?.kind, key).toBeTruthy();
      expect(typeof FORGES[key].fromInquiry).toBe('function');
    }
    // one decision on a case: the mirror alone (predict → write → test → attack)
    const last = FORGES['baqi-fi-masala'];
    expect(last.inquiry).toBeUndefined();
    expect(last.evidence(CROSSING)).toEqual([]); // a bridge is not a problem: its evidence is what the mirror shows
    expect(rowsOf(last).length).toBeGreaterThanOrEqual(4);
  });

  it('each mirror is named after the island where the story opens it', () => {
    const at = { 2: 'majmuaat-kamila', 3: 'baqi-asghar', 4: 'musawat-qisma', 6: 'taqdir-hasil', 7: 'baqi-fi-masala' };
    const opened = [];
    const game = { T: STORY.text, say: () => {}, openForge: (k) => opened.push(k), wait: () => ({ then: () => {} }) };
    const titled = [];
    STORY.islands.forEach((isl, k) => {
      const before = opened.length;
      STORY.onArrive(game, k);
      // the forge this island opens: on arriving, or from its stone
      const key = isl.feature === 'stone' ? STORY.onStone(game).forge : opened.length > before ? opened.at(-1) : null;
      expect(key ?? undefined, isl.id).toBe(at[k]);
      if (!key) return;
      expect(FORGES[key].text.title, key).toBe(`مرآة ${isl.name}`);
      titled.push(key);
    });
    expect(titled).toEqual(KEYS);
  });

  for (const key of KEYS) {
    const F = FORGES[key];
    const rows = rowsOf(F);
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);
    const longest = LONGEST[key] ?? 126;

    describe(key, () => {
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(RULES[key]);
        expect(THE).toHaveLength(1);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
        expect(rows.length).toBeGreaterThanOrEqual(2);
        if (F.inquiry) expect(rows).toHaveLength(F.fromInquiry(RESULTS[key]).rows.length); // nothing he did is lost
        if (F.inquiry) expect(F.fromInquiry(RESULTS[key]).rule).toBeUndefined(); // the tiles are his to write
        expect(new Set(rows.map(F.caseId)).size).toBe(rows.length);
      });

      it('EVERY false rule is refuted in front of him — by what he did, or by a new case the world computes', () => {
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const run = runOn(F, rule, testsOf(F, rule, rows));
          if (run.bad >= 0) {
            const m = run.marks[run.bad];
            expect(m.says, ruleKey(F, rule)).not.toBe(m.held);
            clean(F.text.refuted(m));
            plainText(F.text.refuted(m));
            continue;
          }
          const [c] = F.attacks(rule, rows);
          expect(c, ruleKey(F, rule)).toBeTruthy();
          expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a NEW case
          expect(Math.max(c.a, c.b), ruleKey(F, rule)).toBeLessThanOrEqual(longest);
          clean(F.text.attack(c));
        }
      });

      it('the right rule agrees with all his evidence and survives two hard attacks', () => {
        const run = runOn(F, THE[0], testsOf(F, THE[0], rows));
        expect(run.bad).toBe(-1);
        expect(run.marks.length).toBeGreaterThanOrEqual(2);
        const hard = F.attacks(THE[0], rows);
        expect(hard).toHaveLength(2);
        for (const c of hard) {
          expect(F.says(THE[0], c)).toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
        }
        // the two attacks do not look alike: one case holds, the other does not
        expect(new Set(hard.map((c) => c.held)).size, key).toBe(2);
      });

      it('predictions on cases he has not seen, which hold and fail in turn, all drawable', () => {
        for (let seed = 1; seed <= 25; seed += 1) {
          const list = F.predictCases(rows, rng(seed * 7919));
          expect(list.length).toBeGreaterThanOrEqual(4);
          expect(list.map((c) => c.held).slice(0, 4)).toEqual([true, false, true, false]);
          expect(new Set(list.map(F.caseId)).size).toBe(list.length);
          for (const c of list) {
            expect(Number.isInteger(c.a) && Number.isInteger(c.b) && c.a >= 1 && c.b >= 1, F.caseId(c)).toBe(true);
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
            expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(longest); // the mirror can draw it
            // the mirror draws q planks of b and what is left
            expect(c.b * c.q + c.r).toBe(c.a);
            clean(F.text.ask(c));
            clean(F.text.fact(c));
            clean(F.text.eq(c));
          }
        }
        // a forge that opens on an investigation still mounts on the world's log (its predictions are not asked)
        expect(() => F.predictCases(F.evidence(CROSSING), rng(3))).not.toThrow();
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        for (const rule of rules) {
          clean(F.ruleText(rule));
          plainText(F.ruleText(rule));
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
          for (const s of F.slots) {
            const o = s.options.find((x) => x.id === rule[s.id]);
            if (F.chip) plainText(F.chip(s, o));
          }
        }
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'next', 'frame', 'buildLead', 'testing', 'agreed', 'fire'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const k of ['survived', 'wordsHint', 'experiment', 'useOk'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          clean(T.attack(c));
          clean(T.refuted({ ...c, says: !c.held }));
          clean(T.fact(c));
        }
        for (const yes of [true, false]) {
          clean(T.says(yes));
          clean(T.broken(yes));
        }
        // what the screen writes as PLAIN text (not through MathText) never carries a formula: no raw LaTeX on screen
        const plain = [T.agreed, T.survived, T.useOk, T.frame, T.buildLead, T.experiment, ...Object.values(T.use)];
        plain.push(T.says(true), T.says(false), T.broken(true), T.broken(false));
        plain.push(...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]));
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          plain.push(T.refuted({ ...c, says: !c.held }), T.refuted({ ...c, says: c.held }));
          if (c.tag) plain.push(c.tag);
          if (c.text) plain.push(c.text);
        }
        for (const x of plain) {
          clean(x);
          plainText(x);
        }
      });

      it('the robot helps without ever giving the rule: three more pairs of cases, never a choice of rules', () => {
        for (const n of [1, 2, 3]) {
          const h = F.nudge(n, rows);
          expect(h.kind).toBe('experiment');
          expect(h.cases).toHaveLength(2);
          for (const c of h.cases) {
            expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(longest);
            expect(c.b * c.q + c.r).toBe(c.a);
            clean(F.text.fact(c));
            // a help shows what the world does: the right rule agrees with it
            expect(F.says(THE[0], c), `${key} nudge ${n}`).toBe(c.held);
          }
          expect(F.caseId(h.cases[0])).not.toBe(F.caseId(h.cases[1]));
        }
      });

      it('ends on a case the mirror does not build: the rule decides, typed in its own shape', () => {
        for (let seed = 1; seed <= 25; seed += 1) {
          const c = F.use.make(rng(seed * 104729));
          const vals = SOLVE[key](c);
          for (const v of Object.values(vals)) expect(Number.isInteger(v) && v >= 0).toBe(true);
          const slots = F.use.lines(c).flatMap((l) => l.tokens.filter((t) => typeof t === 'object').map((t) => t.slot));
          expect(slots.sort()).toEqual(Object.keys(vals).sort());
          expect(F.use.check(c, Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)])))).toBe('ok');
          clean(F.text.tryKey(c));
          for (const name of slots) {
            const fb = F.use.check(c, { ...vals, [name]: Number(vals[name]) + 100 });
            expect(fb, `${key} ${name}`).not.toBe('ok');
            expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
          }
          // the remainder box holds the remainder written one plank too few (r + b): that slip must reach the world's
          // « too big », never be cut to fewer digits by the box (2750 = 64 × 41 + 126 was read « + 12 »)
          const rBox = F.use
            .lines(c)
            .flatMap((l) => l.tokens)
            .find((t) => typeof t === 'object' && t.slot === 'r');
          if (rBox && 'q' in vals && vals.q > 0) {
            expect(String(vals.r + c.b).length, `${key} the remainder box`).toBeLessThanOrEqual(rBox.w);
            expect(F.use.check(c, { ...vals, q: String(vals.q - 1), r: String(vals.r + c.b) })).not.toBe('ok');
          }
          // the text of a line is plain: words and numbers, never a formula
          for (const l of F.use.lines(c)) for (const t of l.tokens) if (typeof t === 'string') plainText(t);
        }
      });
    });
  }
});

describe('the false rules students really hold can be written — and the world refutes each', () => {
  /** The rule is refuted in front of him: on his evidence, or by the first attack. */
  const refutedBy = (key, rule) => {
    const F = FORGES[key];
    const rows = rowsOf(F);
    const run = runOn(F, rule, testsOf(F, rule, rows));
    return run.bad >= 0 ? { ...run.marks[run.bad], on: 'evidence' } : { ...F.attacks(rule, rows)[0], on: 'attack' };
  };

  it('full planks: « the plank that hangs over counts too » falls on his first gap; « at most 9 » on 75', () => {
    // he lays the plank that passes the end and counts it: 8 planks on 30 cells — he saw 7
    const passes = refutedBy('majmuaat-kamila', { count: 'full', stop: 'passes' });
    expect([passes.a, passes.b, passes.on]).toEqual([NUMBERS.count.a, NUMBERS.count.probe, 'evidence']);
    expect(groupsOf(30, 4)).toMatchObject({ q: 7, r: 2 });
    const nine = refutedBy('majmuaat-kamila', { count: 'full', stop: 'nine' });
    expect([nine.a, nine.b, nine.on]).toEqual([75, 7, 'evidence']);
    expect(groupsOf(75, 7).q).toBe(10);
    // « only when no cell is left »: on a gap that keeps cells empty the rule never stops
    const empty = refutedBy('majmuaat-kamila', { count: 'full', stop: 'empty' });
    expect(empty.on).toBe('evidence');
    expect(empty.r).toBeGreaterThan(0);
    // « the count is the cells left », « the plank that hung over counts too », « the cells covered »
    for (const what of ['cells', 'tried', 'covered'])
      expect(refutedBy('majmuaat-kamila', { count: what, stop: 'noMore' }).on).toBe('evidence');
  });

  it('KEY 1 SAYS NOTHING OF WHAT IS LEFT: no tile, no sentence of its forge or its tablet states a length for the leftover', () => {
    const F = FORGES['majmuaat-kamila'];
    const said = [
      ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
      ...allRules(F).map((r) => F.ruleText(r)),
      ...TABLETS['majmuaat-kamila'].lines,
      ...TABLETS['majmuaat-kamila'].notes,
    ].join(' ');
    // « what is left is shorter than a plank », « smaller than the divisor », « as long as a plank » — key 2's own words
    expect(said).not.toMatch(/أقصر من|أصغر من|أطول من|بطوله|الباقي|باقٍ|ناقص 1/);
    // …and the two forges share no tile
    const tiles = (key) => FORGES[key].slots.flatMap((s) => s.options.map((o) => o.label));
    for (const label of tiles('baqi-asghar')) expect(tiles('majmuaat-kamila')).not.toContain(label);
  });

  it('the leftover: « it may be as long as the plank », « at most 9 », « never 0 », « half a plank » — each meets what he saw', () => {
    const F = FORGES['baqi-asghar'];
    const rows = rowsOf(F);
    // what he saw: for each plank the most it left (b − 1, kept), b cells (a plank went in), and a gap it filled
    for (const { b } of CYCLE_INQUIRY.rounds) {
      expect(rows.some((c) => c.b === b && c.n === b - 1 && c.held)).toBe(true);
      expect(rows.some((c) => c.b === b && c.n === b && !c.held && c.r === 0)).toBe(true);
      expect(rows.some((c) => c.b === b && c.n === 0 && c.held)).toBe(true);
    }
    for (const c of rows) {
      expect(c.b * c.k + c.n, F.caseId(c)).toBe(c.a);
      expect(c.held).toBe(c.n < c.b);
    }
    const asLong = refutedBy('baqi-asghar', { from: 'zero', to: 'b' });
    expect([asLong.n, asLong.held, asLong.on]).toEqual([asLong.b, false, 'evidence']);
    const nine = refutedBy('baqi-asghar', { from: 'zero', to: 'nine' });
    expect([nine.held, nine.on]).toEqual([false, 'evidence']);
    expect(nine.n).toBeGreaterThanOrEqual(nine.b);
    const never0 = refutedBy('baqi-asghar', { from: 'one', to: 'bm1' });
    expect([never0.n, never0.held, never0.on]).toEqual([0, true, 'evidence']);
    const half = refutedBy('baqi-asghar', { from: 'zero', to: 'half' });
    expect([half.held, half.on]).toEqual([true, 'evidence']);
    expect(half.n).toBeGreaterThan(half.b / 2);
    // every false rule of this forge falls on what he saw in the experiment: none needs an attack
    for (const rule of allRules(F).filter((r) => !F.isTheRule(r)))
      expect(refutedBy('baqi-asghar', rule).on).toBe('evidence');
    // the right rule is attacked by a long leftover that stays and by a leftover as long as the plank
    const hard = F.attacks({ from: 'zero', to: 'bm1' }, rows);
    expect(hard.map((c) => [c.b, c.n, c.held])).toEqual([
      [13, 12, true],
      [15, 15, false],
    ]);
  });

  it('the equality: « a = b + q + r » and « the plank times the leftover » fall on gaps he lifted', () => {
    const sum = refutedBy('musawat-qisma', { first: 'bPlusQ', then: 'plusR' });
    expect(sum.on).toBe('evidence');
    const br = refutedBy('musawat-qisma', { first: 'br', then: 'none' });
    expect(br.on).toBe('evidence');
    const brq = refutedBy('musawat-qisma', { first: 'br', then: 'plusQ' });
    expect(brq.held).not.toBe(FORGES['musawat-qisma'].says({ first: 'br', then: 'plusQ' }, brq));
    // a help shows ONE change between its two gaps: the piece, the number of planks, the length of the plank
    const changes = [1, 2, 3].map((n) => {
      const [x, y] = FORGES['musawat-qisma'].nudge(n).cases;
      return ['b', 'pq', 'pr'].filter((k) => x[k] !== y[k]);
    });
    expect(changes).toEqual([['pr'], ['pq'], ['b']]);
    // the first help is the gap of island D he has just rebuilt, never the bridge that comes next
    const [own] = FORGES['musawat-qisma'].nudge(1).cases;
    expect(own.a).toBe(NUMBERS.rests.a);
  });

  it('the estimate: « a round number of planks » and « the nearest tens » fall on the spyglass’s 692 cells', () => {
    for (const rule of [
      { tens: 'big', units: 'none' },
      { tens: 'near', units: 'big' },
    ]) {
      const c = refutedBy('taqdir-hasil', rule);
      expect([c.a, c.b, c.on]).toEqual([NUMBERS.scope.a, NUMBERS.scope.plank, 'evidence']);
    }
    expect(Math.floor(NUMBERS.scope.a / NUMBERS.scope.plank)).toBe(25);
  });

  it('the problem: « the quotient is enough », « always one more », « the quotient plus the remainder » — the station answers', () => {
    const F = FORGES['baqi-fi-masala'];
    const right = { full: 'q', need: 'cond', left: 'r' };
    expect(F.isTheRule(right)).toBe(true);
    // the cases are computed: a sentence holds exactly when its number is what the division answers
    for (const c of rowsOf(F)) {
      const { q, r } = { q: Math.floor(c.a / c.b), r: c.a % c.b };
      const truth = { full: q, need: q + (r > 0 ? 1 : 0), left: r }[c.t];
      expect(c.held, F.caseId(c)).toBe(c.n === truth);
    }
    for (const need of ['q', 'q1', 'qr']) {
      const c = refutedBy('baqi-fi-masala', { ...right, need });
      expect(c.t).toBe('need');
      expect(F.says({ ...right, need }, c)).not.toBe(c.held);
    }
    // the attack of a wrong rule is ITS OWN answer, carried out: the rule says « yes », and the station shows
    // travellers left behind, a cabin too many, or another count — for each of the 35 wrong rules, whatever he saw
    const wrong = allRules(F).filter((r) => !F.isTheRule(r));
    expect(wrong).toHaveLength(35);
    for (const rule of wrong)
      for (const seen of [[], rowsOf(F)]) {
        const [c] = F.attacks(rule, seen);
        expect(c, ruleKey(F, rule)).toBeTruthy();
        expect([F.says(rule, c), c.held], ruleKey(F, rule)).toEqual([true, false]);
        plainText(F.text.fact(c));
      }
    // what the station says of a number: too few cabins leave travellers, too many leave empty
    const few = F.text.fact({ t: 'need', a: 52, b: 8, q: 6, r: 4, n: 6 });
    expect(few).toContain('لا تكفي 6 عربات');
    expect(few).toContain('4 مسافرين');
    const many = F.text.fact({ t: 'need', a: 48, b: 8, q: 6, r: 0, n: 7 });
    expect(many).toContain('تكفي 6 عربات');
    expect(many).toContain('عربة واحدة دون أيّ مسافر');
    expect(F.text.fact({ t: 'need', a: 52, b: 8, q: 6, r: 4, n: 7 })).toContain('تلزم 7 عربات');
    // the right rule is attacked by a cabin that is not full (it is needed) and by a cabin too many
    expect(F.attacks(right, rowsOf(F)).map((c) => [c.t, c.a, c.b, c.n, c.held])).toEqual([
      ['need', 59, 8, 8, true],
      ['need', 54, 9, 7, false],
    ]);
  });
});
