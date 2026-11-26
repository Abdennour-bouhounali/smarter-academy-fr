/**
 * THE FOUR FORGES of lesson « Rendre une fraction irréductible » — one per key, in the order of the story; no rule of
 * this lesson is told (frame: kit/forge.js; the blocks: kit/authoring/forgeBlocks.js; the cases are drawn by
 * divisorIsles/forgeParts.jsx). The design: `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 3 (version
 * 2). PORTED from DZ `ikhtizal-kasr/world/forges.js` (its 🔒, 🎯, 🧾 forges; its 🪜 was cut as a key, its writing case
 * kept) and converted: French rewritten from each job, the design's numbers and wrong rules, not DZ's.
 *
 * A CASE IS A FRACTION drawn as the marked bridge's two bars (`pair` = { a: the whole, b: the lit cells, d: the plank laid
 * on both }), named in its line by its own `head` (« 52/76 → 26/38 »), never « a planche de d ».
 *
 *   simplifier-facteurs   🪜 the mirror of B — KEEPS its experiment (`measure` / `stages`, prime chips only:
 *                         inquiries.js › STRIKE_INQUIRY). A case is a WRITING p/q of L/W; `held` = the same part, and
 *                         no plank longer than a cell fills p and q (« terminé »). His rule says what he strikes on the
 *                         two decompositions — which primes × how often × where: 2 × 2 × 2 = 8 rules; one holds.
 *   irreductible          🔒 the mirror of C — MET ON THE ISLANDS: B → C, 96 cases, 65 lit, only the plank 1 holds. A
 *                         case is a fraction; `held` = it stays as it is (only 1 holds both bars). His rule: what he sees
 *                         in the two terms × what follows — 4 × 2 = 8 rules (« sinon l’inverse »); one holds.
 *   diviser-par-le-pgcd   🎯 the mirror of D — KEEPS its experiment (`measure` / `direct` on 722/1 786: PGCD_INQUIRY). A
 *                         case is a writing p/q of L/W got in ONE division; `held` = it is finished. His rule: which
 *                         number × what is divided — 3 × 2 = 6 rules; one holds.
 *   resultat-irreductible 🧾 the mirror of E — MET ON THE ISLANDS: D → E, 78 cases lit in two strokes, 65 then 4
 *                         (5/6 + 2/39 = 69/78 = 23/26). A case is a CALCULATION and a writing p/q of its result; `held`
 *                         = p/q is finished. His rule: what he does once the result is computed × when — 3 × 2 = 6 rules.
 * In each forge exactly ONE rule holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one by a
 * computed case — on his rows, or by the first new case where it breaks. No sentence of a forge before its last step names
 * its key (`describeForges › forbidden`). Every last step is typed in its own shape (a fraction over a real bar, a power
 * with a raised exponent).
 *
 * FROM THE DESIGN, BY NECESSITY (the kit's proven limits: 2 to 4 columns, ≤ 4 tiles of ≤ 32 characters each): the K1 slot
 * « chaque facteur premier commun aux deux termes, autant de fois qu’il est dans les deux » is three columns, and the
 * belief « tous les facteurs premiers du numérateur » is dropped (a column of « how often » makes it the right rule);
 * K2's six beliefs are four (« l’un pair, l’autre impair » and « le numérateur ne divise pas le dénominateur » dropped);
 * K4's « one slot of four » is two columns — what I do once it is computed × when — the belief « je simplifie d’abord
 * chaque fraction » is the column « si une fraction se simplifiait ».
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  choiceBox,
  divisionRow,
  firstWrong,
  fractionBox,
  gather,
  givenDivision,
  givenFraction,
  judge,
  lazy,
  line,
  noPredictions,
  pairCase,
  pairKey,
  powerBox,
  attacksOf,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { BRIDGE_TEXT } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { PGCD_INQUIRY, STRIKE_INQUIRY } from './inquiries';
import {
  NUMBERS,
  commonDivisors,
  divisorsOf,
  euclid,
  fr,
  fracTex as F,
  frAll,
  gcd,
  listFr,
  nb,
  powTex,
  powersOf,
  range,
  reduce,
  tx,
} from './math';
import { K } from './story';

const { strike: ST, stays: SY, pgcd: PG, result: RS } = NUMBERS;

/**
 * The pairs this lesson's exercise bank names (content/practice/3e/fraction-irreductible — `node
 * scripts/lesson-bank-numbers.mjs fraction-irreductible --js`): the mirror never draws one (`forges.test.js` checks it).
 */
export const BANK_PAIRS = new Set('18;45 30;42 52;78 90;405 105;135 198;330'.split(' '));
/**
 * Numbers the mirror never draws on its own (attacks, nudges): lesson 1's (36, 48, 60, 72, 91, 97), lesson 2's road and
 * mirrors (its `forges.js › AVOID`), and this lesson's road, mirrors, dash and mission (the design's « Numbers »). The
 * design's own cases (K2's attack 95/228, K4's attack 2/3 × 9/26 on the same 78 cases) are named, not drawn.
 */
export const AVOID = new Set([
  18, 20, 22, 23, 26, 28, 29, 30, 33, 34, 35, 36, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 50, 52, 54, 56, 58, 60, 65,
  69, 72, 75, 76, 78, 82, 85, 86, 87, 88, 90, 91, 92, 94, 95, 96, 97,
]);
const drawable = (W, L) => !BANK_PAIRS.has(pairKey(W, L)) && !AVOID.has(W) && !AVOID.has(L);

const n = (v) => Number(v);
const sameFrac = (x, y) => Boolean(x) && x[0] === y[0] && x[1] === y[1];
const isPrime = (x) => x > 1 && divisorsOf(x).length === 2;
/** « 69/123 » as PLAIN text (French thousands). */
const slash = (p, q) => `${nb(p)}/${nb(q)}`;
/** A decomposition as LaTeX, « 1 » for 1. */
const decTex = (x) => (x < 2 ? '1' : powTex(powersOf(x)));
/** « 69 = 3 × 23 » as LaTeX. */
const timesTex = (x, d) => `${tx(x)} = ${tx(d)} \\times ${tx(x / d)}`;
const terms = (L, W) => `$${tx(L)} = ${decTex(L)}$ et $${tx(W)} = ${decTex(W)}$`;
const decEq = (c) => `$${tx(c.L)} = ${decTex(c.L)} \\qquad ${tx(c.W)} = ${decTex(c.W)}$`;
/** The smallest prime both x and y hold, or null. */
const smallestCommon = (x, y) => commonDivisors(x, y).find((k) => k > 1) ?? null;
const dedupe = (rows, caseId) => rows.filter((c, i) => rows.findIndex((x) => caseId(x) === caseId(c)) === i);

/** « terminé » — the world's answer to a writing: the same part, and nothing fills both terms any more. */
const DONE = 'terminé';
const NOT_DONE = 'pas terminé';
const doneWord = (yes) => (yes ? DONE : NOT_DONE);

/**
 * A WRITING p/q asked of the fraction L/W (the lit L cells over the whole W): the mirror lays planks of W ÷ q on both bars
 * — the same part when the lit ones are p — then tries whether a plank longer than a cell still fills p and q. `held`:
 * the same part AND nothing fills both (the writing is finished).
 */
function writingCase(of, W, L, p, q) {
  const c = pairCase(of, W, L, W / q);
  const same = L * q === p * W;
  const held = same && gcd(p, q) === 1;
  return {
    ...c,
    L,
    W,
    p,
    q,
    same,
    held,
    head: `${slash(L, W)} → ${slash(p, q)}`,
    tag: held ? DONE : same ? NOT_DONE : 'autre part',
  };
}
const writingId = (c) => `${c.of}:${c.W}:${c.L}:${c.p}:${c.q}`;
/** What the world did with a writing — a PLAIN clause. */
const worldOf = (m) =>
  m.held
    ? 'aucune planche plus longue qu’une case ne remplit ses deux termes'
    : m.same
      ? `la planche de ${nb(gcd(m.p, m.q))} remplit encore ${nb(m.p)} et ${nb(m.q)}`
      : `${slash(m.p, m.q)} n’éclaire pas la même part`;
const worldFact = (c) => {
  const s = worldOf(c);
  return `${s[0].toUpperCase()}${s.slice(1)}.`;
};
/** The words the writing forges share (K1, K3). */
const WRITING_TEXT = {
  ...BRIDGE_TEXT,
  ask: (c) => `La fraction $${F(c.L, c.W)}$ écrite $${F(c.p, c.q)}$ : est-ce terminé ?`,
  fact: worldFact,
  eq: decEq,
  yes: 'Terminé',
  no: 'Pas terminé',
  next: 'Une autre écriture',
  says: (yes) => `Ta règle : ${doneWord(yes)}`,
  refuted: (m) =>
    `Ta règle dit que ${slash(m.L, m.W)} écrite ${slash(m.p, m.q)} ${m.says ? 'est terminée' : 'n’est pas terminée'}, mais ${worldOf(m)}.`,
  attack: (c) =>
    `Le miroir met ta règle au défi : la fraction $${F(c.L, c.W)}$ écrite $${F(c.p, c.q)}$. Est-ce terminé ? Que dit ta règle ?`,
  fire: 'Le miroir compte',
  survived: 'Ta règle a tenu : les planches ont fait ce qu’elle disait.',
  broken: (yes) =>
    yes
      ? 'Ta règle a cédé : elle disait « terminé », et une planche remplit encore les deux termes.'
      : 'Ta règle a cédé : elle disait « pas terminé », et plus rien ne remplit les deux termes.',
  compare: (cases) => `Compare ces deux écritures de $${F(cases[0].L, cases[0].W)}$ : laquelle est terminée ?`,
  experiment: 'Regarde bien : une fraction, deux écritures, et le miroir essaie ses planches. Laquelle est terminée ?',
};

// ───────────────────────── 1. 🪜 simplifier-facteurs — what he strikes on two decompositions ─────────────────────────
// The mirror of B: the experiment `measure` / `stages`, prime chips only (inquiries.js › STRIKE_INQUIRY) — his sign
// 69/123 (3 → 23/41), then 52/76 (2 → 26/38, 2 again → 13/19). His evidence: his sign 138/246 = 69/123 = 46/82 (neither
// writing is finished), and every stage of the two rounds. A rule strikes, from the two decompositions, WHICH primes
// (each common one, or the smallest common only) × HOW OFTEN (as often as in both, or once) × WHERE (both terms, or the
// denominator only).

/** « 138 = 2 × 3 × 23 » as PLAIN text (the log's second line), primes increasing, exponents raised. */
const decPlain = (x) =>
  x < 2
    ? '1'
    : powersOf(x)
        .map((f) => (f.e === 1 ? nb(f.p) : `${nb(f.p)}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[f.e]}`))
        .join(' × ');
// a row of the log carries its two decompositions (`sub`, divisorIsles/forgeParts.jsx › Line): the frame asks what he
// strikes on them, so they are on the screen he builds his rule on (gate B, 2026-11-26)
const k1Case = (W, L, p, q) => ({
  ...writingCase(K.strike, W, L, p, q),
  sub: `${nb(L)} = ${decPlain(L)} ; ${nb(W)} = ${decPlain(W)}`,
});
const S_WHICH = [
  { id: 'common', label: 'chaque facteur premier commun', of: (common) => common },
  { id: 'small', label: 'le plus petit facteur commun', of: (common) => common.slice(0, 1) },
];
const S_TIMES = [
  { id: 'both', label: 'autant de fois que dans les deux', e: (eL, eW) => Math.min(eL, eW) },
  { id: 'once', label: 'une seule fois', e: () => 1 },
];
const S_WHERE = [
  { id: 'both', label: 'au numérateur et au dénominateur', of: (L, W, k) => [L / k, W / k] },
  { id: 'den', label: 'au dénominateur seulement', of: (L, W, k) => [L, W / k] },
];
const expOf = (fs, p) => fs.find((f) => f.p === p)?.e ?? 0;
/** The writing a K1 rule makes of L/W, and the primes it strikes ([{ p, e }]). */
function k1Strike(rule, L, W, tile) {
  const xs = powersOf(L);
  const ys = powersOf(W);
  const common = xs.filter((x) => ys.some((y) => y.p === x.p)).map((x) => x.p);
  const struck = tile.which[rule.which]
    .of(common)
    .map((p) => ({ p, e: tile.times[rule.times].e(expOf(xs, p), expOf(ys, p)) }));
  const k = struck.reduce((acc, f) => acc * f.p ** f.e, 1);
  return { struck, to: tile.where[rule.where].of(L, W, k) };
}
const K1_J = judge({
  slots: [
    { id: 'which', label: 'Je barre', options: S_WHICH },
    { id: 'times', label: 'Combien de fois ?', options: S_TIMES },
    { id: 'where', label: 'Où ?', options: S_WHERE },
  ],
  right: { which: 'common', times: 'both', where: 'both' },
  says: (rule, c, tile) => sameFrac(k1Strike(rule, c.L, c.W, tile).to, [c.p, c.q]),
});
/** His sign on A: 138/246 written 69/123 (planks of 2) and 46/82 (planks of 3) — neither finished. */
const K1_LIVED = [k1Case(ST.gap, ST.mark, ST.mark / 2, ST.gap / 2), k1Case(ST.gap, ST.mark, ST.mark / 3, ST.gap / 3)];
/**
 * The writings a mirror can draw: every fraction L/W (W ≤ 60) of two numbers that share a prime, outside the bank and
 * `AVOID`, written by each of the eight rules and finished; at most 40 planks on a bar.
 */
const K1_POOL = lazy(() => {
  const rules = S_WHICH.flatMap((a) =>
    S_TIMES.flatMap((b) => S_WHERE.map((c) => ({ which: a.id, times: b.id, where: c.id }))),
  );
  return range(8, 60).flatMap((W) =>
    range(4, W - 1)
      .filter((L) => gcd(L, W) > 1 && drawable(W, L))
      .flatMap((L) => {
        const ws = [reduce(L, W), ...rules.map((r) => k1Strike(r, L, W, K1_J.tile).to)];
        return dedupe(
          ws.map(([p, q]) => k1Case(W, L, p, q)),
          writingId,
        ).filter((c) => c.laid <= 40);
      }),
  );
});
/** The last step: the RAW 735/588 (he decomposes both), then (2 × 53)/(2² × 7 × 53) given decomposed. */
const [RAW_N, RAW_D] = ST.use.raw;
const DEC = ST.use.decomposed;
const valueOf = (fs) => fs.reduce((acc, f) => acc * f.p ** f.e, 1);
const DEC_N = valueOf(DEC.num);
const DEC_D = valueOf(DEC.den);
const plainDec = (fs) => fs.map((f) => (f.e === 1 ? String(f.p) : `${f.p}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[f.e]}`)).join(' × ');
/** « □^□ × □^□ × □^□ » — a decomposition typed, prime by prime (`row` names its boxes). */
const powersLine = (x, row, count) =>
  line([
    nb(x),
    '=',
    ...range(1, count).flatMap((i) => [
      ...(i > 1 ? ['×'] : []),
      powerBox(slot(`${row}${i}`, 'un facteur premier', 2), `${row}e${i}`),
    ]),
  ]);
/** The decomposition he typed, if it is one: [{ p, e }] primes increasing, product x. */
function typedDec(vals, row, count, x) {
  const fs = range(1, count).map((i) => ({ p: n(vals[`${row}${i}`]), e: n(vals[`${row}e${i}`]) }));
  const ok =
    fs.every((f, i) => isPrime(f.p) && Number.isInteger(f.e) && f.e >= 1 && (i === 0 || f.p > fs[i - 1].p)) &&
    valueOf(fs) === x;
  return ok ? fs : null;
}
const equalTo = (vals, nk, dk, a, b) => n(vals[nk]) >= 1 && n(vals[dk]) >= 1 && n(vals[nk]) * b === n(vals[dk]) * a;

const strikeForge = {
  key: K.strike,
  ...K1_J,
  /** He lays prime planks on his sign, then on 52/76 (inquiries.js): his stages are his evidence. */
  inquiry: STRIKE_INQUIRY,
  fromInquiry: (result) => ({
    rows: dedupe(
      [
        ...K1_LIVED,
        ...result.rounds.flatMap((r) => r.runs.flatMap((run) => run.stages.map((s) => k1Case(r.b, r.a, ...s.to)))),
      ],
      writingId,
    ),
  }),
  ruleText: (rule) =>
    fr(
      `Avec les deux décompositions, je barre ${K1_J.tile.which[rule.which].label}, ${K1_J.tile.times[rule.times].label}, ${K1_J.tile.where[rule.where].label}.`,
    ),
  explain(rule, c) {
    const { struck, to } = k1Strike(rule, c.L, c.W, K1_J.tile);
    const what = struck.length ? `ta règle barre $${powTex(struck)}$ et écrit $${F(...to)}$` : 'ta règle ne barre rien';
    return fr(
      `${terms(c.L, c.W)} : ${what} ; ${sameFrac(to, [c.p, c.q]) ? 'c’est' : 'ce n’est pas'} $${F(c.p, c.q)}$.`,
    );
  },
  caseId: writingId,
  evidence: gather({ own: (row) => row.of === K.strike, fromRow: () => [], lived: K1_LIVED, caseId: writingId }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...K1_J,
    caseId: writingId,
    pool: K1_POOL,
    // 40/64 = 2³ × 5 over 2⁶: 5/8 is finished; 20/32 (the smallest prime once) is not
    hard: [k1Case(64, 40, 5, 8), k1Case(64, 40, 20, 32)],
  }),
  // one fraction, two writings: the finished one and one a false belief writes
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [k1Case(64, 24, 3, 8), k1Case(64, 24, 12, 32)] };
    if (k === 2) return { kind: 'experiment', cases: [k1Case(81, 63, 7, 9), k1Case(81, 63, 21, 27)] };
    return { kind: 'experiment', cases: [k1Case(77, 55, 5, 7), k1Case(77, 55, 55, 7)] };
  },
  use: {
    make: () => ({ raw: [RAW_N, RAW_D], dec: [DEC_N, DEC_D], best: [reduce(RAW_N, RAW_D), reduce(DEC_N, DEC_D)] }),
    lines: () => [
      powersLine(RAW_N, 'a', powersOf(RAW_N).length),
      powersLine(RAW_D, 'b', powersOf(RAW_D).length),
      line([givenFraction(nb(RAW_N), nb(RAW_D)), '=', fractionBox('n1', 'd1', { w: 2 })]),
      line([givenFraction(plainDec(DEC.num), plainDec(DEC.den)), '=', fractionBox('n2', 'd2', { w: 2 })]),
    ],
    check: (c, v) =>
      firstWrong([
        ['decN', typedDec(v, 'a', powersOf(RAW_N).length, RAW_N) != null],
        ['decD', typedDec(v, 'b', powersOf(RAW_D).length, RAW_D) != null],
        ['equal1', equalTo(v, 'n1', 'd1', RAW_N, RAW_D)],
        ['short1', sameFrac([n(v.n1), n(v.d1)], c.best[0])],
        ['equal2', equalTo(v, 'n2', 'd2', DEC_N, DEC_D)],
        ['short2', sameFrac([n(v.n2), n(v.d2)], c.best[1])],
      ]),
    /** The claims this answer makes (not sent by the kit today: a forge's last step is not evidence). */
    claim: (c, v) => [
      { kind: 'factorization', a: RAW_N, factors: range(1, 3).map((i) => ({ p: n(v[`a${i}`]), e: n(v[`ae${i}`]) })) },
      { kind: 'factorization', a: RAW_D, factors: range(1, 3).map((i) => ({ p: n(v[`b${i}`]), e: n(v[`be${i}`]) })) },
      { kind: 'fraction', a: RAW_N, b: RAW_D, p: n(v.n1), q: n(v.d1) },
      { kind: 'fraction', a: DEC_N, b: DEC_D, p: n(v.n2), q: n(v.d2) },
    ],
  },
  text: frAll({
    ...WRITING_TEXT,
    title: 'Le miroir des hirondelles',
    log: 'Tes écritures',
    frame: 'Pour écrire la même fraction avec les plus petits nombres, sur ses deux décompositions :',
    buildLead: `Une carte par colonne : que barres-tu, et où ? Le miroir reprend ta pancarte ${slash(ST.mark, ST.gap)} et tes bandes ${slash(...ST.rounds[0])}, ${slash(...ST.rounds[1])}.`,
    testing: 'Le miroir reprend tes écritures une par une…',
    agreed:
      'Ta règle est d’accord avec toutes tes écritures. Le miroir la met maintenant au défi avec une autre fraction.',
    wordsHint: 'Exemple : sur les deux décompositions, je…',
    tryKey: () =>
      `Le miroir ne compte pas : décompose ${nb(RAW_N)} et ${nb(RAW_D)} en facteurs premiers, puis écris les deux fractions avec les plus petits nombres.`,
    use: {
      decN: `Ce n’est pas la décomposition de ${nb(RAW_N)} : des nombres premiers, du plus petit au plus grand, dont le produit fait ${nb(RAW_N)}.`,
      decD: `Ce n’est pas la décomposition de ${nb(RAW_D)} : des nombres premiers, du plus petit au plus grand, dont le produit fait ${nb(RAW_D)}.`,
      equal1: `Cette fraction n’est pas égale à ${slash(RAW_N, RAW_D)} : regarde tes deux décompositions.`,
      short1: 'Cette fraction est égale, mais un facteur premier est encore en haut et en bas.',
      equal2: 'Cette fraction n’est pas égale à la fraction donnée : regarde ce qui est en haut et en bas.',
      short2: 'Cette fraction est égale, mais un facteur premier est encore en haut et en bas.',
    },
    useOk: 'Deux décompositions, et la fraction s’écrit avec les plus petits nombres.',
  }),
};

// ───────────────────────── 2. 🔒 irreductible — a fraction that stays as it is ─────────────────────────
// Island B → C: 96 cases, 65 lit; planks 2, 3, 5, 13 and 1. 2 and 3 fill 96 and miss the post; 5 and 13 do not fill 96;
// only 1 holds, the sign stays 65/96 (the mirror opens once 2, 3, 5 and 13 were each fired). His evidence: the four
// fractions his signs wrote — 138/246, 69/123, 46/82 (A) and 65/96.

/** A fraction L/W; the mirror lays the longest plank that holds both bars (1 alone, or longer). `held`: it stays. */
function stayCase(W, L) {
  const g = gcd(W, L);
  const c = pairCase(K.stays, W, L, g);
  return { ...c, L, W, g, held: g === 1, head: slash(L, W), tag: g === 1 ? 'reste' : 'se simplifie' };
}
const stayId = (c) => `${c.of}:${c.W}:${c.L}`;
const common235 = (c) => [2, 3, 5].filter((p) => c.L % p === 0 && c.W % p === 0);
const SEE = [
  { id: 'odd', label: 'deux nombres impairs', test: (c) => c.L % 2 === 1 && c.W % 2 === 1 },
  { id: 'prime', label: 'deux nombres premiers', test: (c) => isPrime(c.L) && isPrime(c.W) },
  { id: 'no235', label: 'ni 2, ni 3, ni 5 en commun', test: (c) => common235(c).length === 0 },
  { id: 'none', label: 'aucun facteur premier commun', test: (c) => c.g === 1 },
];
const STAYS = 'reste comme elle est';
const SHRINKS = 'se simplifie';
const THEN = [
  { id: 'stays', label: STAYS },
  { id: 'shrinks', label: SHRINKS },
];
const K2_J = judge({
  slots: [
    { id: 'see', label: 'Dans les deux termes, je vois', options: SEE },
    { id: 'then', label: 'alors la fraction', options: THEN },
  ],
  right: { see: 'none', then: 'stays' },
  says: (rule, c, tile) => tile.see[rule.see].test(c) === (rule.then === 'stays'),
});
/** What he can see in the two terms, said as a fact (through MathText). */
const SEEN = {
  odd: (c) => `${nb(c.L)} est ${c.L % 2 ? 'impair' : 'pair'} et ${nb(c.W)} est ${c.W % 2 ? 'impair' : 'pair'}`,
  prime: (c) =>
    `${nb(c.L)} ${isPrime(c.L) ? 'est premier' : 'n’est pas premier'} et ${nb(c.W)} ${isPrime(c.W) ? 'est premier' : 'n’est pas premier'}`,
  no235: (c) => {
    const k = common235(c);
    return k.length
      ? `${listFr(k)} ${k.length > 1 ? 'divisent' : 'divise'} ${nb(c.L)} et ${nb(c.W)}`
      : `ni 2, ni 3, ni 5 ne divise à la fois ${nb(c.L)} et ${nb(c.W)}`;
  },
  none: (c) => terms(c.L, c.W),
};
const K2_LIVED = [
  stayCase(ST.gap, ST.mark),
  stayCase(ST.gap / 2, ST.mark / 2),
  stayCase(ST.gap / 3, ST.mark / 3),
  stayCase(SY.gap, SY.mark),
];
const [ATK_L, ATK_W] = SY.attack;
/**
 * Fractions a mirror can draw: the design's attack first (95/228 = 5/12: odd over even, no 2, 3, 5 in common, 19 hidden),
 * then every L/W with W ≤ 90 and at most 40 planks of the longest plank that holds, outside the bank and `AVOID`.
 */
const K2_POOL = lazy(() => [
  stayCase(ATK_W, ATK_L),
  ...range(6, 90).flatMap((W) =>
    range(2, W - 1)
      .filter((L) => W / gcd(W, L) <= 40 && drawable(W, L))
      .map((L) => stayCase(W, L)),
  ),
]);
const [PG_L, PG_W] = SY.use.pgcd;
const K2_ITEMS = SY.use.fractions;
const yesNo = [
  { id: 'oui', text: 'oui' },
  { id: 'non', text: 'non' },
];

const staysForge = {
  key: K.stays,
  ...K2_J,
  ruleText: (rule) =>
    fr(
      `Quand je vois dans les deux termes ${K2_J.tile.see[rule.see].label}, la fraction ${K2_J.tile.then[rule.then].label} ; sinon, c’est l’inverse.`,
    ),
  explain: (rule, c) =>
    fr(`${SEEN[rule.see](c)} : ta règle dit que $${F(c.L, c.W)}$ ${K2_J.says(rule, c) ? STAYS : SHRINKS}.`),
  caseId: stayId,
  evidence: gather({
    own: (row) => row.of === K.stays,
    fromRow: (row) => {
      if (row.a === SY.gap) return [stayCase(SY.gap, SY.mark)];
      if (row.a !== ST.gap) return [];
      const holds = row.b > 1 && ST.gap % row.b === 0 && ST.mark % row.b === 0;
      return [stayCase(ST.gap, ST.mark), ...(holds ? [stayCase(ST.gap / row.b, ST.mark / row.b)] : [])];
    },
    lived: K2_LIVED,
    caseId: stayId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...K2_J,
    caseId: stayId,
    pool: K2_POOL,
    // 95/228: no 2, 3, 5 in common, and 19 holds both; 25/27: both odd, and only 1 holds
    hard: [stayCase(ATK_W, ATK_L), stayCase(27, 25)],
  }),
  // two fractions alike for a false belief: one stays, one does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [stayCase(25, 16), stayCase(25, 15)] };
    if (k === 2) return { kind: 'experiment', cases: [stayCase(32, 21), stayCase(32, 24)] };
    return { kind: 'experiment', cases: [stayCase(40, 27), stayCase(40, 25)] };
  },
  use: {
    make: () => ({ A: PG_W, B: PG_L, g: gcd(PG_L, PG_W), items: K2_ITEMS }),
    /** PGCD(65 ; 96), then three fractions: irreducible or not, and their irreducible writing. */
    lines: (c) => [
      line([fr(`PGCD(${PG_L} ; ${PG_W})`), '=', slot('g', 'le PGCD', 2)]),
      ...c.items.map(([L, W], i) =>
        line([
          givenFraction(nb(L), nb(W)),
          fr('irréductible :'),
          choiceBox(`y${i + 1}`, 'irréductible, oui ou non', yesNo),
          fr('et s’écrit'),
          fractionBox(`n${i + 1}`, `d${i + 1}`),
        ]),
      ),
    ],
    check: (c, v) =>
      firstWrong([
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
        ...c.items.flatMap(([L, W], i) => {
          const k = i + 1;
          const stays = gcd(L, W) === 1;
          return [
            [stays ? 'yes' : 'no', v[`y${k}`] === (stays ? 'oui' : 'non')],
            ['equal', equalTo(v, `n${k}`, `d${k}`, L, W)],
            ['short', sameFrac([n(v[`n${k}`]), n(v[`d${k}`])], reduce(L, W))],
          ];
        }),
      ]),
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, v) => [
      { kind: 'pgcd', a: PG_L, b: PG_W, g: n(v.g) },
      ...c.items.flatMap(([L, W], i) => [
        { kind: 'coprime', a: L, b: W, says: v[`y${i + 1}`] === 'oui' },
        { kind: 'fraction', a: L, b: W, p: n(v[`n${i + 1}`]), q: n(v[`d${i + 1}`]) },
      ]),
    ],
  },
  text: frAll({
    ...BRIDGE_TEXT,
    title: 'Le miroir du forgeron',
    log: 'Tes pancartes',
    ask: (c) => `La fraction $${F(c.L, c.W)}$ : reste-t-elle comme elle est ?`,
    fact: (c) =>
      c.held
        ? 'Seule la planche de 1 tient ses deux bandes : elle reste comme elle est.'
        : `La planche de ${nb(c.g)} tient ses deux bandes : $${F(c.L, c.W)} = ${F(c.L / c.g, c.W / c.g)}$.`,
    eq: (c) => (c.g > 1 ? `$${timesTex(c.L, c.g)} \\qquad ${timesTex(c.W, c.g)}$` : decEq(c)),
    yes: 'Elle reste',
    no: 'Elle se simplifie',
    next: 'Une autre fraction',
    frame: 'Quand je vois dans les deux termes…',
    buildLead: `Une carte par colonne : quand une fraction reste-t-elle comme elle est ? Le miroir reprend tes pancartes, de ${slash(ST.mark, ST.gap)} à ${slash(SY.mark, SY.gap)}.`,
    testing: 'Le miroir reprend tes pancartes une par une…',
    says: (yes) => `Ta règle : ${yes ? 'elle reste comme elle est' : 'elle se simplifie'}`,
    refuted: (m) =>
      `Ta règle dit que ${slash(m.L, m.W)} ${m.says ? STAYS : SHRINKS}, mais ${m.held ? 'seule la planche de 1 tient ses deux bandes' : `la planche de ${nb(m.g)} tient ses deux bandes : ${slash(m.L / m.g, m.W / m.g)}`}.`,
    agreed:
      'Ta règle est d’accord avec toutes tes pancartes. Le miroir la met maintenant au défi avec une autre fraction.',
    attack: (c) =>
      `Le miroir met ta règle au défi : la fraction $${F(c.L, c.W)}$. Reste-t-elle comme elle est ? Que dit ta règle ?`,
    fire: 'Pose la plus longue planche',
    survived: 'Ta règle a tenu : la plus longue planche a fait ce qu’elle disait.',
    broken: (yes) =>
      yes
        ? 'Ta règle a cédé : elle disait « elle reste comme elle est », et une planche plus longue qu’une case tient.'
        : 'Ta règle a cédé : elle disait « elle se simplifie », et seule la planche de 1 tient.',
    wordsHint: 'Exemple : une fraction reste comme elle est quand…',
    compare: (cases) =>
      `Compare ces deux fractions de dénominateur ${nb(cases[0].W)} : laquelle reste comme elle est ?`,
    experiment:
      'Regarde bien : deux fractions qui se ressemblent, et la plus longue planche qui tient. Qu’est-ce qui change ?',
    tryKey: () =>
      `Le miroir ne pose pas de planche : écris PGCD(${PG_L} ; ${PG_W}), puis dis si chaque fraction est irréductible et écris-la avec les plus petits nombres.`,
    use: {
      pgcd: `Regarde ton pont : quelle est la seule planche qui tenait ${PG_L} et ${PG_W} ?`,
      zero: '0 n’est pas une longueur de planche.',
      // one sentence for both: never the answer of the yes/no item (gate B, 2026-11-26)
      yes: 'Décompose ses deux termes : un facteur premier est-il dans les deux ?',
      no: 'Décompose ses deux termes : un facteur premier est-il dans les deux ?',
      equal: 'Cette fraction n’est pas égale à celle de la ligne.',
      short: 'Cette fraction est égale, mais elle s’écrit encore avec des nombres plus petits.',
    },
    useOk: 'Le PGCD et les décompositions ont tout dit, sans poser une planche.',
  }),
};

// ───────────────────────── 3. 🎯 diviser-par-le-pgcd — the finished writing in ONE division ─────────────────────────
// Islands C → D: the convoy of one, 1 786 cases, 722 lit, 93 coins — only 38 is paid: the sign wrote 722/1 786 = 19/47.
// The mirror of D: `measure` / `direct` on 722/1 786 (inquiries.js › PGCD_INQUIRY): 2 → 361/893 and 19 → 38/94 are not
// enough, 38 → 19/47. His evidence: the sign, and every one-stage writing he tried. A rule divides by WHICH number (their
// PGCD, any common divisor, the smallest one but 1) × WHAT (both terms, the denominator only).

const k3Case = (W, L, p, q) => writingCase(K.pgcd, W, L, p, q);
const BY = [
  { id: 'pgcd', label: 'le PGCD de ses deux termes', ks: (L, W) => [gcd(L, W)] },
  { id: 'any', label: 'un diviseur commun de ses termes', ks: (L, W) => commonDivisors(L, W).filter((k) => k > 1) },
  { id: 'small', label: 'le plus petit commun, sauf 1', ks: (L, W) => [smallestCommon(L, W)].filter(Boolean) },
];
const HOW = [
  { id: 'both', label: 'le numérateur et le dénominateur', of: (L, W, k) => [L / k, W / k] },
  { id: 'den', label: 'le dénominateur seulement', of: (L, W, k) => [L, W / k] },
];
/** Every writing a K3 rule makes of L/W in one division: [{ k, w }]. */
const k3Writes = (rule, L, W, tile) => tile.by[rule.by].ks(L, W).map((k) => ({ k, w: tile.how[rule.how].of(L, W, k) }));
const K3_J = judge({
  slots: [
    { id: 'by', label: 'Je prends', options: BY },
    { id: 'how', label: 'et je divise par ce nombre', options: HOW },
  ],
  right: { by: 'pgcd', how: 'both' },
  says: (rule, c, tile) => k3Writes(rule, c.L, c.W, tile).some((x) => sameFrac(x.w, [c.p, c.q])),
});
const opTex = (how, L, W, k) =>
  how === 'den'
    ? `$${tx(W)} \\div ${tx(k)} = ${tx(W / k)}$`
    : `$${tx(L)} \\div ${tx(k)} = ${tx(L / k)}$ et $${tx(W)} \\div ${tx(k)} = ${tx(W / k)}$`;
/** The sign of the bridge he crossed with 38: 722/1 786 = 19/47. */
const K3_LIVED = [k3Case(PG.gap, PG.mark, PG.mark / PG.plank, PG.gap / PG.plank)];
/**
 * The writings a mirror can draw: every fraction L/W (W ≤ 90) of two numbers that share a prime, outside the bank and
 * `AVOID`, divided once by each of its common divisors (both terms, the denominator only); at most 40 planks on a bar.
 */
const K3_POOL = lazy(() =>
  range(8, 90).flatMap((W) =>
    range(4, W - 1)
      .filter((L) => gcd(L, W) > 1 && drawable(W, L))
      .flatMap((L) =>
        dedupe(
          commonDivisors(L, W)
            .filter((k) => k > 1)
            .flatMap((k) => [k3Case(W, L, L / k, W / k), k3Case(W, L, L, W / k)]),
          writingId,
        ).filter((c) => c.laid <= 40),
      ),
  ),
);
const [U_L, U_W] = PG.use;
const K3_ROWS = euclid(U_W, U_L);
const K3_BEST = reduce(U_L, U_W);

const pgcdForge = {
  key: K.pgcd,
  ...K3_J,
  /** ONE plank, typed, on the fraction of the bridge he crossed (inquiries.js): his tries are his evidence. */
  inquiry: PGCD_INQUIRY,
  fromInquiry: (result) => ({
    rows: dedupe(
      [
        ...K3_LIVED,
        ...result.rounds.flatMap((r) => r.runs.flatMap((run) => run.stages.map((s) => k3Case(r.b, r.a, ...s.to)))),
      ],
      writingId,
    ),
  }),
  ruleText: (rule) =>
    fr(
      `Pour une fraction, en une seule étape, je prends ${K3_J.tile.by[rule.by].label} et je divise par ce nombre ${K3_J.tile.how[rule.how].label}.`,
    ),
  explain(rule, c) {
    const writes = k3Writes(rule, c.L, c.W, K3_J.tile);
    const hit = writes.find((x) => sameFrac(x.w, [c.p, c.q]));
    const shown = hit ?? writes[0];
    if (!shown) return fr(`Pour $${F(c.L, c.W)}$, ta règle ne trouve aucun nombre : elle n’écrit rien d’autre.`);
    return fr(
      `${opTex(rule.how, c.L, c.W, shown.k)} : ta règle écrit $${F(...shown.w)}$ ; ${hit ? 'c’est' : 'ce n’est pas'} $${F(c.p, c.q)}$.`,
    );
  },
  caseId: writingId,
  evidence: gather({ own: (row) => row.of === K.pgcd, fromRow: () => [], lived: K3_LIVED, caseId: writingId }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...K3_J,
    caseId: writingId,
    pool: K3_POOL,
    // 27/63 = 3³ over 3² × 7: by 9 at once, 3/7 is finished; by 3, 9/21 is not
    hard: [k3Case(63, 27, 3, 7), k3Case(63, 27, 9, 21)],
  }),
  // one fraction, two one-division writings: the finished one and one that still shrinks
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [k3Case(80, 32, 2, 5), k3Case(80, 32, 4, 10)] };
    if (k === 2) return { kind: 'experiment', cases: [k3Case(80, 64, 4, 5), k3Case(80, 64, 8, 10)] };
    return { kind: 'experiment', cases: [k3Case(84, 24, 2, 7), k3Case(84, 24, 4, 14)] };
  },
  use: {
    make: () => ({ L: U_L, W: U_W, rows: K3_ROWS, g: gcd(U_L, U_W), best: K3_BEST }),
    /** Euclid's divisions row by row, then the PGCD and the fraction in one division, over a real bar. */
    lines: (c) => [
      givenDivision(c.W, c.L, { q: 'q1', r: 'r1', rw: 3 }),
      divisionRow(2),
      divisionRow(3),
      line([
        fr(`PGCD(${c.L} ; ${c.W})`),
        '=',
        slot('g', 'le PGCD', 2),
        fr(' ; '),
        givenFraction(nb(c.L), nb(c.W)),
        '=',
        fractionBox('n', 'd', { w: 2 }),
      ]),
    ],
    check: (c, v) =>
      firstWrong([
        ['row1', n(v.q1) === c.rows[0].q && n(v.r1) === c.rows[0].r],
        ...[2, 3].flatMap((i) => [
          [`pair${i}`, n(v[`a${i}`]) === c.rows[i - 1].a && n(v[`b${i}`]) === c.rows[i - 1].b],
          [`row${i}`, n(v[`q${i}`]) === c.rows[i - 1].q && n(v[`r${i}`]) === c.rows[i - 1].r],
        ]),
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
        ['equal', equalTo(v, 'n', 'd', c.L, c.W)],
        ['short', sameFrac([n(v.n), n(v.d)], c.best)],
      ]),
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, v) => [
      ...[1, 2, 3].map((i) => {
        const r = c.rows[i - 1];
        const rr = n(v[`r${i}`]);
        return { kind: 'division', a: r.a, b: r.b, q: n(v[`q${i}`]), r: rr, fits: rr === 0 };
      }),
      { kind: 'pgcd', a: c.L, b: c.W, g: n(v.g) },
      { kind: 'fraction', a: c.L, b: c.W, p: n(v.n), q: n(v.d) },
    ],
  },
  text: frAll({
    ...WRITING_TEXT,
    title: 'Le miroir des roseaux',
    log: 'Tes essais',
    frame: 'Rendre une fraction irréductible en une étape :',
    buildLead: `Une carte par colonne : quel nombre prends-tu, et que divises-tu ? Le miroir reprend tes essais sur ${slash(PG.mark, PG.gap)}.`,
    testing: 'Le miroir reprend tes essais un par un…',
    agreed: 'Ta règle est d’accord avec tous tes essais. Le miroir la met maintenant au défi avec une autre fraction.',
    wordsHint: 'Exemple : en une seule étape, je…',
    tryKey: (c) =>
      `Le miroir ne compte pas : écris les divisions de ${nb(c.W)} par ${nb(c.L)} jusqu’au reste 0, puis leur PGCD, puis la fraction irréductible en une division.`,
    use: {
      row1: 'Vérifie la première division : le reste est plus petit que le nombre par lequel tu divises.',
      row2: 'Vérifie la deuxième division : le reste est plus petit que le nombre par lequel tu divises.',
      row3: 'Vérifie la troisième division : le reste est plus petit que le nombre par lequel tu divises.',
      pair2: 'La deuxième ligne divise le plus petit nombre de la première par son reste.',
      pair3: 'La troisième ligne divise le plus petit nombre de la deuxième par son reste.',
      zero: '0 n’est pas une longueur de planche : regarde le reste d’avant.',
      pgcd: 'Regarde les restes que tu as écrits.',
      equal: 'Cette fraction n’est pas égale à la fraction donnée : divise ses deux termes par le même nombre.',
      short: 'Cette fraction est égale, mais elle s’écrit encore avec des nombres plus petits.',
    },
    useOk: 'Trois divisions, un nombre, et la fraction est finie en une division.',
  }),
};

// ───────────────────────── 4. 🧾 resultat-irreductible — the result of a calculation ─────────────────────────
// Island D → E: 78 cases lit in two strokes — Léa's crew 5/6 (65), Hugo's 2/39 (4): the sign opens on 65/78 + 4/78 = 69/78;
// 2 and 6 fill 78 and miss the post, 13 puts a joint at the end of Léa's stroke and misses the post, only 3 holds: 23/26.
// The fractions computed were finished; their sum was not. His evidence: the sum's two writings, 69/78 and 23/26. A rule
// says what he does once the result is computed (makes it irreducible, leaves it, simplifies it once) × when (always,
// only when a fraction of the calculation could be simplified).

/** The result of x/y op z/w as it comes: a sum over the smallest common denominator, a product term by term. */
const lcm = (a, b) => (a / gcd(a, b)) * b;
function rawOf(calc) {
  const { op, x, y, z, w } = calc;
  if (op === '*') return [x * z, y * w];
  const D = lcm(y, w);
  return [x * (D / y) + z * (D / w), D];
}
const opSign = (op) => (op === '*' ? '×' : '+');
const opTexOf = (op) => (op === '*' ? '\\times' : '+');
const calcTex = (c) => `${F(c.x, c.y)} ${opTexOf(c.op)} ${F(c.z, c.w)}`;
/** A CALCULATION and a writing p/q of its result: `held` when p/q is its finished writing. */
function calcCase(calc, p, q) {
  const [N, D] = rawOf(calc);
  const c = pairCase(K.result, D, N, D / q);
  const held = sameFrac([p, q], reduce(N, D));
  return {
    ...c,
    ...calc,
    calc,
    N,
    D,
    L: N,
    W: D,
    p,
    q,
    same: N * q === p * D,
    held,
    head: `${calc.x}/${calc.y} ${opSign(calc.op)} ${calc.z}/${calc.w} → ${slash(p, q)}`,
    tag: doneWord(held),
  };
}
const calcId = (c) => `${c.of}:${c.op}:${c.x}:${c.y}:${c.z}:${c.w}:${c.p}:${c.q}`;
const AFTER = [
  { id: 'irr', label: 'je le rends irréductible', of: (N, D) => reduce(N, D) },
  { id: 'keep', label: 'je le laisse tel quel', of: (N, D) => [N, D] },
  {
    id: 'once',
    label: 'je le simplifie une seule fois',
    of: (N, D) => {
      const k = smallestCommon(N, D);
      return k ? [N / k, D / k] : [N, D];
    },
  },
];
const WHEN = [
  { id: 'always', label: 'toujours', applies: () => true },
  {
    id: 'onlyIf',
    label: 'si l’une d’elles se simplifie',
    say: 'si une fraction du calcul se simplifie',
    applies: (c) => gcd(c.x, c.y) > 1 || gcd(c.z, c.w) > 1,
  },
];
/** The writing a K4 rule gives the result of a calculation. */
const k4Writes = (rule, c, tile) =>
  tile.when[rule.when].applies(c) ? tile.after[rule.after].of(c.N, c.D) : [c.N, c.D];
const K4_J = judge({
  slots: [
    { id: 'after', label: 'Je calcule le résultat, puis', options: AFTER },
    { id: 'when', label: 'Quand ? (les fractions du calcul)', options: WHEN },
  ],
  right: { after: 'irr', when: 'always' },
  says: (rule, c, tile) => sameFrac(k4Writes(rule, c, tile), [c.p, c.q]),
});
const CREWS = { op: '+', x: RS.crews[0][0], y: RS.crews[0][1], z: RS.crews[1][0], w: RS.crews[1][1] };
const [RS_N, RS_D] = rawOf(CREWS);
/** His bridge: 5/6 + 2/39 written 69/78 (the sign in cells) and 23/26 (planks of 3). */
const K4_LIVED = [calcCase(CREWS, RS_N, RS_D), calcCase(CREWS, RS_N / RS.plank, RS_D / RS.plank)];
/** The design's attack on the same 78 cases: 2/3 × 9/26 = 18/78 — once by 2, 9/39, and 3 still fills both. */
const ATTACK = { op: '*', ...RS.attack };
const [AT_N, AT_D] = rawOf(ATTACK);
/**
 * The calculations a mirror can draw: the design's attack first, then sums and products of two finished fractions
 * (denominators 2 … 12) whose result shrinks, the result at most 228 cells, written the three ways a rule writes it; at
 * most 40 planks on a bar; never a number of `AVOID` nor a pair of the bank.
 */
const K4_POOL = lazy(() => {
  const fracs = range(2, 12).flatMap((y) => range(1, y - 1).map((x) => [x, y]));
  const calcs = [];
  for (const [x, y] of fracs)
    for (const [z, w] of fracs)
      for (const op of ['+', '*']) {
        if (op === '+' && (x * w > z * y || y === w)) continue;
        const calc = { op, x, y, z, w };
        const [N, D] = rawOf(calc);
        if (gcd(N, D) === 1 || N >= D || D > 228 || !drawable(D, N)) continue;
        calcs.push(calc);
      }
  const cases = calcs.flatMap((calc) => {
    const [N, D] = rawOf(calc);
    return dedupe(
      AFTER.map((a) => a.of(N, D)).map(([p, q]) => calcCase(calc, p, q)),
      calcId,
    ).filter((c) => c.laid <= 40);
  });
  return [calcCase(ATTACK, AT_N / 2, AT_D / 2), ...cases];
});
const GU = RS.use.guided;
const RAW = RS.use.raw;
const RAW_CALC = { op: '*', ...RAW };
const [R2_N, R2_D] = rawOf(RAW_CALC);
const GU_CALC = { op: '*', x: valueOf(GU.x), y: valueOf(GU.y), z: valueOf(GU.z), w: valueOf(GU.w) };
const [G_N, G_D] = rawOf(GU_CALC);
const STRIKE_OPTIONS = [
  { id: 'both', text: '3² et 23' },
  { id: 'three', text: '3² seulement' },
  { id: 'tt', text: '23 seulement' },
  { id: 'none', text: 'rien' },
];

const resultForge = {
  key: K.result,
  ...K4_J,
  ruleText: (rule) =>
    fr(
      `Pour un calcul de fractions, je calcule le résultat, puis ${K4_J.tile.after[rule.after].label} ; je fais cela ${K4_J.tile.when[rule.when].say ?? K4_J.tile.when[rule.when].label}.`,
    ),
  explain(rule, c) {
    const w = k4Writes(rule, c, K4_J.tile);
    const then = sameFrac(w, [c.N, c.D]) ? '' : `, puis $${F(...w)}$`;
    return fr(
      `Ta règle calcule $${calcTex(c)} = ${F(c.N, c.D)}$${then} ; ${sameFrac(w, [c.p, c.q]) ? 'c’est' : 'ce n’est pas'} $${F(c.p, c.q)}$.`,
    );
  },
  caseId: calcId,
  evidence: gather({
    own: (row) => row.of === K.result,
    // a plank that held the bridge of 78 wrote one more writing on its sign (only 3 does)
    fromRow: (row) =>
      row.a === RS.gap && row.b > 1 && RS.gap % row.b === 0 && RS_N % row.b === 0
        ? [calcCase(CREWS, RS_N / row.b, RS_D / row.b)]
        : [],
    lived: K4_LIVED,
    caseId: calcId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...K4_J,
    caseId: calcId,
    pool: K4_POOL,
    // 2/3 × 9/26 = 18/78: 3/13 is finished; 9/39 (once by 2) is not
    hard: [calcCase(ATTACK, AT_N / 6, AT_D / 6), calcCase(ATTACK, AT_N / 2, AT_D / 2)],
  }),
  // one calculation, two writings of its result: the finished one and one that still shrinks
  nudge(k) {
    if (k === 1) {
      const c = { op: '+', x: 3, y: 8, z: 1, w: 24 };
      return { kind: 'experiment', cases: [calcCase(c, 5, 12), calcCase(c, 10, 24)] };
    }
    if (k === 2) {
      const c = { op: '*', x: 2, y: 5, z: 5, w: 8 };
      return { kind: 'experiment', cases: [calcCase(c, 1, 4), calcCase(c, 5, 20)] };
    }
    const c = { op: '+', x: 1, y: 8, z: 1, w: 24 };
    return { kind: 'experiment', cases: [calcCase(c, 1, 6), calcCase(c, 2, 12)] };
  },
  use: {
    make: () => ({ guided: GU_CALC, raw: RAW_CALC, best: [reduce(G_N, G_D), reduce(R2_N, R2_D)] }),
    /** Item 1 GUIDED (the product given decomposed: what he strikes, then what is left), item 2 raw. */
    lines: () => [
      // one item per row (gate B, 2026-11-26: four lines in a 2 × 2 grid had no reading order); the four choices on the
      // product's own line
      line([
        givenFraction(plainDec(GU.x), plainDec(GU.y)),
        '×',
        givenFraction(plainDec(GU.z), plainDec(GU.w)),
        fr(' : je barre'),
        choiceBox('strike', 'ce que je barre en haut et en bas', STRIKE_OPTIONS),
      ]),
      line([fr('Ce qui reste :'), fractionBox('n1', 'd1', { w: 2 })]),
      line([givenFraction(RAW.x, RAW.y), '×', givenFraction(RAW.z, RAW.w), '=', fractionBox('n2', 'd2', { w: 2 })]),
    ],
    check: (c, v) =>
      firstWrong([
        ['strike', v.strike === 'both'],
        ['equal1', equalTo(v, 'n1', 'd1', G_N, G_D)],
        ['short1', sameFrac([n(v.n1), n(v.d1)], c.best[0])],
        ['equal2', equalTo(v, 'n2', 'd2', R2_N, R2_D)],
        ['short2', sameFrac([n(v.n2), n(v.d2)], c.best[1])],
      ]),
    /** The claims this answer makes (not sent by the kit today): each is about the calculation itself. */
    claim: (c, v) => [
      { kind: 'fraction', a: G_N, b: G_D, p: n(v.n1), q: n(v.d1), ...c.guided },
      { kind: 'fraction', a: R2_N, b: R2_D, p: n(v.n2), q: n(v.d2), ...c.raw },
    ],
  },
  text: frAll({
    ...WRITING_TEXT,
    title: 'Le miroir des cormorans',
    log: 'Ton calcul et ta pancarte',
    ask: (c) => `$${calcTex(c)}$ écrit $${F(c.p, c.q)}$ : est-ce terminé ?`,
    refuted: (m) =>
      `Ta règle dit que ${m.x}/${m.y} ${opSign(m.op)} ${m.z}/${m.w} écrit ${slash(m.p, m.q)} ${m.says ? 'est terminé' : 'n’est pas terminé'}, mais ${worldOf(m)}.`,
    attack: (c) =>
      `Le miroir met ta règle au défi : $${calcTex(c)}$, écrit $${F(c.p, c.q)}$. Est-ce terminé ? Que dit ta règle ?`,
    compare: (cases) => `Compare ces deux écritures de $${calcTex(cases[0])}$ : laquelle est terminée ?`,
    experiment: 'Regarde bien : un calcul, deux écritures de son résultat, et le miroir essaie ses planches.',
    frame: 'Pour donner le résultat d’un calcul de fractions :',
    buildLead: `Une carte par colonne : que fais-tu du résultat ? Le miroir reprend ta pancarte ${RS.crews[0].join('/')} + ${RS.crews[1].join('/')} = ${slash(RS_N, RS_D)}.`,
    testing: 'Le miroir reprend ta pancarte…',
    agreed: 'Ta règle est d’accord avec ta pancarte. Le miroir la met maintenant au défi avec un autre calcul.',
    wordsHint: 'Exemple : je calcule, puis…',
    tryKey: () =>
      'Le miroir ne calcule pas : dans le premier produit, barre ce qui est en haut et en bas ; puis écris chaque produit avec les plus petits nombres.',
    use: {
      strike: `Sans rien barrer, le produit s’écrit ${slash(G_N, G_D)} : cherche les facteurs qui sont à la fois en haut et en bas.`,
      equal1: 'Multiplie ce qui reste en haut, puis ce qui reste en bas.',
      short1: 'Cette fraction est égale, mais un facteur est encore en haut et en bas.',
      equal2: 'Ce n’est pas le produit : barre d’abord ce qui est en haut et en bas, puis multiplie ce qui reste.',
      short2: 'Ce produit est juste, mais il s’écrit encore avec des nombres plus petits.',
    },
    useOk: 'Barrer avant de multiplier : les nombres restent petits, et le résultat est terminé.',
  }),
};

/** The forges, by key, in the order of the story (world/index.js › lesson.forges). */
export const FORGES = {
  [K.strike]: strikeForge,
  [K.stays]: staysForge,
  [K.pgcd]: pgcdForge,
  [K.result]: resultForge,
};
