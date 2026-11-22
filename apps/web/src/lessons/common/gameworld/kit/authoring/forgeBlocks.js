/**
 * THE AUTHORING KIT — the building blocks a lesson's `world/forges.js` is assembled from (PURE; it names no lesson).
 * The frame of a forge is `kit/forge.js` (read its header first: what a forge IS); this file gives what every forge of
 * the three lessons on « L’archipel des diviseurs » re-derived: the tiles and the judge, the evidence read from the world's log,
 * the attacks, the cases (a plank on a pair of gaps), the pools the mirror draws from, and the last step.
 * The lesson keeps what is ITS OWN: the procedure or the rule a case is judged by, the wording (`text`, `ruleText`,
 * `explain`), the hard cases and the nudges, the numbers of the last step.
 *
 * A forge met on the islands, assembled (lesson 6, forge 🔁 — `authoring/proof.bahth.test.js` rebuilds it this way and
 * checks it behaves exactly like the lesson's own):
 *
 *   const iqCase = (A, B, d) => plankCase('iqlidis', A, B, d);
 *   const plankId = (c) => `${c.of}:${c.A}:${c.B}:${c.d}`;
 *   const J = judge({ slots: [NEXT, STOP, MAKE], right: { next: 'sr', stop: 'zero', make: 'last' },
 *     says: (rule, c) => iqRun(rule, c.A, c.B).made === c.d });
 *   const forge = { key: 'iqlidis', ...J, caseId: plankId, predictCases: noPredictions,
 *     evidence: fromLog({ of: 'iqlidis', gaps: [1833, 546], make: iqCase, lived: [39], caseId: plankId }),
 *     attacks: attacksOf({ ...J, caseId: plankId, pool: pairPool({ A: [6, 40], B: (a) => [a + 1, 60],
 *       d: (a, b) => [1, b], make: iqCase, exclude: BANK_PAIRS }), hard: [iqCase(63, 45, 18), iqCase(63, 45, 9)] }),
 *     use: { make: makerOf(pairsOutside(IQ_USE, BANK_PAIRS), (A, B) => ({ A, B, rows: euclid(A, B) })),
 *       lines: (c) => [givenDivision(c.A, c.B, { q: 'q1', r: 'r1', rw: 3 }), divisionRow(2), divisionRow(3),
 *         pgcdBox(c.A, c.B)], check: … }, ruleText, explain, chip, nudge, text };
 *
 * Every block is tested in `authoring/forgeBlocks.test.js`; the whole forge by the suite `describeForges`
 * (`authoring/test/suites.js`).
 */
import { slot } from '../forge';
import { pick } from '../random';
import { gcd, planks, range } from './numbers';

// ───────────────────────── the tiles, and the judge: exactly one rule holds ─────────────────────────

/** { id: item } of a list of tiles. */
export const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
/** The tiles as the screen takes them: an id and a label (the rest of a tile — its test, its `of` — stays here). */
export const options = (list) => list.map(({ id, label }) => ({ id, label }));

/**
 * THE JUDGE of a forge, from its declared tiles: `slots` = [{ id, label, options: [{ id, label, …what the tile means }] }],
 * `right` = the one rule that holds ({ slot id: option id }), `says(rule, c, tile)` = what a rule says of a case, with
 * `tile[slotId][optionId]` the whole tile. → { slots, says, isTheRule, tile }: spread it into the forge.
 * That ONE rule holds is not declared but PROVED by `describeForges`: every other rule is refuted by a computed case.
 *
 *   const F_LOOK = [{ id: 'pair', label: 'le plus court et le fossé de la différence', of: (c) => [c.B, c.D] }, …];
 *   const F_HOW = [{ id: 'all', label: 'chaque fossé parmi', test: (gaps, built) => gaps.every(built) }, …];
 *   const J = judge({
 *     slots: [{ id: 'how', label: 'Combien de fossés ?', options: F_HOW }, { id: 'look', label: 'Quels fossés ?', options: F_LOOK }],
 *     right: { how: 'all', look: 'pair' },
 *     says: (rule, c, tile) => tile.how[rule.how].test(tile.look[rule.look].of(c), (n) => n % c.d === 0),
 *   });
 */
export function judge({ slots, right, says }) {
  const tile = Object.fromEntries(slots.map((s) => [s.id, byId(s.options)]));
  return {
    slots: slots.map((s) => ({ id: s.id, label: s.label, options: options(s.options) })),
    says: (rule, c) => says(rule, c, tile),
    isTheRule: (rule) => slots.every((s) => rule?.[s.id] === right[s.id]),
    tile,
  };
}

// ───────────────────────── the opening ─────────────────────────

/**
 * The islands (or the forge's own experiment) held the predictions: none is asked. A forge with no `inquiry` whose
 * `predictCases` is this opens on its TILES (kit/RuleForge.jsx; GAME_WORLD.md §2sexies).
 */
export const noPredictions = () => [];

/** Computed once, when a forge first needs it: the pools of the attacks are not built at import. */
export const lazy = (make) => {
  let value = null;
  return () => (value ??= make());
};

// ───────────────────────── pairs, and the bank ─────────────────────────

/** « 85;119 » — a pair of numbers in either order, as a key. */
export const pairKey = (x, y) => [x, y].sort((p, q) => p - q).join(';');
/** The pairs of `list` ([A, B]) whose key is in none of the `excluded` sets (a bank's pairs, another forge's…). */
export const pairsOutside = (list, ...excluded) =>
  list.filter(([A, B]) => excluded.every((set) => !set.has(pairKey(A, B))));

// ───────────────────────── the cases ─────────────────────────

/** Does a plank of d fill a gap of n cells? A gap of 0 cells is filled by every plank (its bridge stands). */
export const fills = (n, d) => n % d === 0;

/**
 * ONE plank of d cells asked of a PAIR of gaps A and B, drawn as two bridges (`pair`, divisorIsles/forgeParts.jsx).
 * `held` is « d builds both »; a lesson adds what its rule reads and its `tag` (the log line's verdict).
 *
 *   const farqCase = (A, B, d) => {
 *     const c = pairCase('farq', A, B, d);
 *     return { ...c, D: A - B, fd: fills(A - B, d), tag: c.held ? 'construit les deux' : 'ne construit pas les deux' };
 *   };
 */
export function pairCase(of, A, B, d) {
  const fa = fills(A, d);
  const fb = fills(B, d);
  return {
    of,
    A,
    B,
    d,
    fa,
    fb,
    fits: fa && fb,
    held: fa && fb,
    laid: Math.max(Math.floor(A / d), Math.floor(B / d)),
    pair: { a: A, b: B, d },
  };
}

/**
 * The plank d on the gaps A and B with the coins of a PURSE that holds exactly the planks of the longest plank of both
 * (`purse` = A ÷ g + B ÷ g): so `held` is d = g. `need` = the planks the two bridges take when d fills both; the tag
 * says it (« 12 planches ») or « ne remplit pas les deux ».
 *
 *   const tarhCase = (A, B, d) => plankCase('tarh', A, B, d);
 *   tarhCase(259, 185, 37);   // { held: true, need: 12, purse: 12, tag: '12 planches', pair: { a: 259, b: 185, d: 37, need: 12 } }
 *   tarhCase(259, 185, 1);    // { fits: true, held: false, need: 444, tag: '444 planches' }
 */
export function plankCase(of, A, B, d) {
  const c = pairCase(of, A, B, d);
  const g = gcd(A, B);
  const need = c.fits ? A / d + B / d : null;
  return {
    ...c,
    g,
    need,
    purse: A / g + B / g,
    held: d === g,
    pair: { a: A, b: B, d, ...(need != null ? { need } : {}) },
    tag: c.fits ? planks(need) : 'ne remplit pas les deux',
  };
}

/**
 * The cases a mirror can draw, for its attacks: every pair (a, b) with a in `A` = [from, to], b in `B(a)`, every plank d
 * in `d(a, b)`, made by `make(a, b, d)`; never a pair of `exclude` (the bank's), and only the cases `keep` accepts (by
 * default at most 40 planks laid on one bridge). Lazy: built the first time an attack needs it.
 *
 *   const TARH_POOL = pairPool({ A: [6, 40], B: (a) => [a + 1, 60], d: (a, b) => [1, b], make: tarhCase,
 *     exclude: BANK_PAIRS });
 *   TARH_POOL();   // every case, built once
 */
export const pairPool = ({ A, B, d, make, exclude = new Set(), keep = (c) => c.laid <= 40 }) =>
  lazy(() =>
    range(...A).flatMap((a) =>
      range(...B(a))
        .filter((b) => !exclude.has(pairKey(a, b)))
        .flatMap((b) =>
          range(...d(a, b))
            .map((x) => make(a, b, x))
            .filter(keep),
        ),
    ),
  );

// ───────────────────────── the evidence: what he did ─────────────────────────

/**
 * His evidence from the world's log (rows `{ a, b }`, one per bridge fired; `of` set on a case the forge already made,
 * `mirror` on a case the mirror built): his own lines first (oldest first, one per case — `fromRow` turns a bridge into
 * the forge's case, or [] when it is not his here), then `lived` — the cases the story GUARANTEES he lived (he cannot
 * stand at this mirror otherwise) when the log no longer holds them — then the mirror's.
 *
 *   evidence: gather({
 *     own: (row) => row.of === 'aqall',
 *     fromRow: () => [],
 *     lived: [[259, 185], [1833, 546], [1003, 34]].map(([A, B]) => truth(A, B)),  // the three pairs he crossed
 *     caseId: aqallId,
 *   }),
 */
export const gather =
  ({ own, fromRow, lived = [], caseId }) =>
  (rows) => {
    const list = rows.flatMap((row) => (own(row) ? [row] : row.of == null && !row.mirror ? fromRow(row) : []));
    const uniq = list.filter((c, i) => list.findIndex((x) => caseId(x) === caseId(c)) === i);
    const his = uniq.filter((c) => !c.mirror);
    const facts = lived.filter((f) => !his.some((c) => caseId(c) === caseId(f)));
    return [...his, ...facts, ...uniq.filter((c) => c.mirror)];
  };

/**
 * `gather` for a key met on a CONVOY: every plank b he fired on one of its `gaps` is ONE case `make(A, B, b)` of the
 * pair (`pair`, default the first two gaps); `lived` = the planks the story guarantees he crossed with.
 *
 *   // three gaps 152, 95, 57 (the third the first minus the second), each plank asked of 152 and 95; he crossed with 19
 *   evidence: fromLog({ of: 'farq', gaps: [152, 95, 57], make: farqCase, lived: [19], caseId: farqId }),
 */
export const fromLog = ({ of, gaps, pair = gaps.slice(0, 2), make, lived = [], caseId }) =>
  gather({
    own: (row) => row.of === of,
    fromRow: (row) => (gaps.includes(row.a) ? [make(pair[0], pair[1], row.b)] : []),
    lived: lived.map((d) => make(pair[0], pair[1], d)),
    caseId,
  });

/**
 * The evidence of a forge that KEEPS its experiment in the mirror (`inquiry`): what the experiment handed back, round by
 * round, turned into cases. `fromInquiry: fromRounds((r) => euclid(r.a, r.b).map((s) => baqiCase(s.a, s.b, 74)))`.
 */
export const fromRounds = (perRound) => (result) => ({ rows: result.rounds.flatMap(perRound) });

// ───────────────────────── the attacks ─────────────────────────

/**
 * THE ATTACK of a wrong rule: among the cases of `pool` he has not seen, the first one where the world does not do what
 * the rule says — one where the rule says « yes » and the world « no » first (he SEES it fall). [] when none breaks it.
 */
export function firstBreak(pool, rule, rows, says, caseId) {
  const seen = new Set(rows.map(caseId));
  const free = pool.filter((c) => !seen.has(caseId(c)) && says(rule, c) !== c.held);
  const best = free.find((c) => says(rule, c)) ?? free[0];
  return best ? [best] : [];
}

/** The right rule's hard cases that he has not seen yet (give one the world says « yes » to and one « no »). */
export const hard = (rows, list, caseId) => {
  const seen = new Set(rows.map(caseId));
  return list.filter((c) => !seen.has(caseId(c)));
};

/**
 * `attacks(rule, rows)` of a forge: a wrong rule meets its `firstBreak` in `pool()`; the right one its `hard` cases.
 *
 *   attacks: attacksOf({ ...J, caseId: plankId, pool: TARH_POOL,
 *     hard: [tarhCase(51, 21, 30), tarhCase(51, 21, 3)] }),   // a notebook of seven rows: 30 is not the plank, 3 is
 */
export const attacksOf =
  ({ pool, says, isTheRule, hard: hardCases, caseId }) =>
  (rule, rows) =>
    isTheRule(rule) ? hard(rows, hardCases, caseId) : firstBreak(pool(), rule, rows, says, caseId);

// ───────────────────────── the last step: the rule decides, typed in its own shape ─────────────────────────

/** A line of the last step: tokens (a string, or a box `slot(name, label, w)`), read left to right by default. */
export const line = (tokens, dir = 'ltr') => ({ dir, tokens });
/** « □ − □ = □ » — row i of the subtraction algorithm, typed whole. */
export const subtractionRow = (i, w = 3) =>
  line([
    slot(`x${i}`, 'le plus grand nombre', w),
    '−',
    slot(`y${i}`, 'le plus petit nombre', w),
    '=',
    slot(`d${i}`, 'la différence', w),
  ]);
/** « □ = □ × □ + □ » — row i of Euclid's algorithm, typed whole. */
export const divisionRow = (i, { w = 3, qw = 2 } = {}) =>
  line([
    slot(`a${i}`, 'le dividende', w),
    '=',
    slot(`b${i}`, 'le plus petit nombre', w),
    '×',
    slot(`q${i}`, 'le quotient', qw),
    '+',
    slot(`r${i}`, 'le reste', w),
  ]);
/** « A = B × □ + □ » — the division of A by B, its quotient and remainder typed. */
export const givenDivision = (A, B, { q = 'q', r = 'r', qw = 2, rw = 2 } = {}) =>
  line([String(A), '=', String(B), '×', slot(q, 'le quotient', qw), '+', slot(r, 'le reste', rw)]);
/** « A − B = □ ». */
export const differenceBox = (A, B, { name = 'd', w = 2 } = {}) =>
  line([`${A} − ${B}`, '=', slot(name, 'la différence', w)]);
/** « PGCD(A ; B) = □ ». */
export const pgcdBox = (A, B, { name = 'g', w = 2 } = {}) => line([`PGCD(${A} ; ${B})`, '=', slot(name, 'PGCD', w)]);
/** « PGCD(A ; B) = PGCD(B ; □) ». */
export const pgcdPairBox = (A, B, { name = 'p', w = 2 } = {}) =>
  line([`PGCD(${A} ; ${B})`, '=', `PGCD(${B} ;`, slot(name, 'le nombre', w), ')']);

/**
 * A FRACTION in its own shape (root CLAUDE.md: a typed answer is entered in its own shape): the token
 * `{ frac: { n, d } }`, each part a printed number (a string) or a box `slot(…)`. The forge draws it stacked — numerator,
 * a real bar, denominator (`kit/RuleForge.jsx`, the classes `di-frac` / `di-frac__bar` of `styles/trainer.css`).
 *   line([givenFraction(66, 78), '=', fractionBox('n', 'd')])   // 66/78 = □/□, typed over a bar
 */
export const fractionBox = (n = 'n', d = 'd', { w = 3, nw = w, dw = w } = {}) => ({
  frac: { n: slot(n, 'le numérateur', nw), d: slot(d, 'le dénominateur', dw) },
});
/** A fraction printed in the same shape, nothing to type: `givenFraction(66, 78)`. */
export const givenFraction = (n, d) => ({ frac: { n: String(n), d: String(d) } });
/** The boxes of a line's tokens, in reading order — a fraction gives its numerator's box, then its denominator's. */
export const boxesOf = (tokens) =>
  tokens.flatMap((t) =>
    t?.frac ? [t.frac.n, t.frac.d].filter((x) => typeof x === 'object') : typeof t === 'object' ? [t] : [],
  );

/**
 * `use.make` from a list of pairs: one drawn with `rand`, then `build(A, B)` → the case.
 *   make: makerOf(pairsOutside([[1334, 319], [1395, 217]], BANK_PAIRS), (A, B) => ({ A, B, rows: euclid(A, B),
 *     g: gcd(A, B), held: true })),
 */
export const makerOf =
  (pairs, build) =>
  (rand = Math.random) => {
    const [A, B] = pick(rand, pairs);
    return build(A, B);
  };

/**
 * `use.check`: the key of the FIRST step that is wrong (a key of the forge's `text.use`), or 'ok'.
 *   check: (c, vals) => firstWrong([
 *     ['row1', n(vals.q1) === c.rows[0].q && n(vals.r1) === c.rows[0].r],
 *     [n(vals.g) === 0 ? 'zero' : 'pgcd', n(vals.g) === c.g],
 *   ]),
 */
export const firstWrong = (steps) => steps.find(([, ok]) => !ok)?.[0] ?? 'ok';
