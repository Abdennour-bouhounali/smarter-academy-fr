/**
 * THE FOUR FORGES of lesson « Trouver le PGCD de deux nombres » — one per key, in the order of the story; no rule of this
 * lesson is told (frame: kit/forge.js; the blocks: kit/authoring/forgeBlocks.js; the cases are drawn by
 * divisorIsles/forgeParts.jsx). The design: `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 2.
 *
 *   diviseurs-communs  🤝 island C — MET ON THE ISLANDS (convoy « jumeaux »: 90 then 54, 15 coins, A's typed workshop, no
 *                      bench). No `inquiry`; his evidence is every plank he made for the two gaps (`fromLog`), and 18 —
 *                      he cannot reach C otherwise. Tiles: which plank × filling what — 3 × 4 = 12 rules (the design's
 *                      one column of five planks did not fit the frame's 2–4 columns: the same five beliefs, two columns).
 *   lots-identiques    🧺 island C, the mirror's second forge — keeps its experiment (`deal`, inquiries.js): a case is a
 *                      SHARING (no plank, no bridge, A10): « k baskets share everything » or « k is the most baskets ».
 *                      Tiles: when n baskets suit × the most baskets — 4 × 4 = 16 rules.
 *   pgcd-facteurs      🧮 island E — MET ON THE ISLANDS (convoy « grands »: 1 736 then 980, 193 coins, C's workshop whose
 *                      bench is lesson 1's spreadsheet, kept). Tiles: which primes × which exponent — 2 × 3 = 6 rules.
 *   euclide            🔁 island G — met on the islands (convoy « euclide »: 52 015 then 31 209, 807 coins, the division
 *                      notebook), then KEEPS its experiment in the mirror (`nest` / `pair`). The frame owns what the
 *                      notebook does (divide the larger by the smaller, then the smaller by the remainder); tiles: when
 *                      I stop × the plank I make — 2 × 3 = 6 rules.
 * A case of K1, K3, K4 is ONE plank d on a PAIR of gaps A and B with a PURSE (`convoyCase`, drawn as two bridges): what the
 * world does (`held`) is « d builds both bridges with the coins of the purse ». The purse is never exact: it pays the
 * longest plank of both and not the next one (`purseOf` — the purses of the road are exactly this: 15, 193, 807, 55), so
 * `held` is d = PGCD(A ; B). Exactly ONE rule of each forge holds; `forges.test.js` writes every rule the tiles allow and
 * refutes each wrong one by a computed case — on his evidence, or by the first new case where it breaks.
 * No sentence of a forge before its last step names its key (`describeForges › forbidden`). The mirror never draws a pair
 * of the bank, nor a number of lesson 1 or of this lesson's road (`AVOID`).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  byId,
  divisionRow,
  fills,
  firstBreak,
  fromLog,
  gather,
  givenPower,
  hard,
  lazy,
  line,
  noPredictions,
  pairCase,
  pairKey,
  powerBox,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { BRIDGE_TEXT } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { APPLES, BASKETS, DEAL_INQUIRY, PAIR_INQUIRY, PEARS } from './inquiries';
import {
  CELLS,
  COINS,
  DIVISIONS,
  NUMBERS,
  PLANKS,
  commonDivisors,
  commonPowers,
  counted,
  divisorsOf,
  euclid,
  fr,
  frAll,
  gcd,
  nb,
  powTex,
  powersOf,
  range,
  tx,
  valueOfPowers,
} from './math';
import { K } from './story';

const { twins: TW, deal: DL, factors: FC, euclide: EU } = NUMBERS;

/**
 * The pairs this lesson's exercise bank names (content/practice/3e/trouver-le-pgcd — `node scripts/lesson-bank-numbers.mjs
 * trouver-le-pgcd --js`): the mirror never draws one (`forges.test.js` checks this list against the bank).
 */
export const BANK_PAIRS = new Set(
  '12;18 39;65 42;70 49;63 51;85 77;121 78;117 87;203 104;156 120;150 132;156 156;180 156;234 162;216 165;275 180;240 180;252 189;315 190;247 207;276 224;336 270;360 288;432 294;420 330;462 350;560 364;546 390;480 528;594 714;935'.split(
    ' ',
  ),
);
/**
 * Numbers the mirror never draws: lesson 1's (36, 48, 60, 72, 91, 97 — the design: « appear nowhere on screen ») and the
 * numbers of this lesson's road, stall, mirrors and mission.
 */
export const AVOID = new Set([18, 22, 28, 30, 33, 35, 36, 42, 43, 45, 48, 54, 56, 60, 72, 75, 86, 88, 90, 91, 97]);
const drawable = (A, B) => !BANK_PAIRS.has(pairKey(A, B)) && !AVOID.has(A) && !AVOID.has(B);

const coins = (n) => counted(n, COINS);
const planksN = (n) => counted(n, PLANKS);
const cells = (n) => counted(n, CELLS);

// ───────────────────────── a plank on a convoy: two gaps and a purse ─────────────────────────

/**
 * The purse of a pair: it pays the longest plank of both, and not the next one (a coin short of its need) — never exact.
 * The four purses of the road are this (90 ; 54) → 15, (1 736 ; 980) → 193, (52 015 ; 31 209) → 807, (1 462 ; 946) → 55.
 */
export function purseOf(A, B) {
  const list = commonDivisors(A, B);
  const need = (d) => A / d + B / d;
  return list.length >= 2 ? need(list.at(-2)) - 1 : need(list[0]);
}
/** The tag of a convoy case (≤ 12 characters): what the world did with the plank. */
const verdictTag = (c) => (c.held ? 'construit' : c.fits ? 'bourse vide' : 'refusée');
/**
 * ONE plank of d on the gaps A and B, with the purse of the pair (`purse`, else `purseOf`): `need` = the planks the two
 * bridges take when d fills both; `held` = it builds both within the purse (= d is the longest plank of both).
 */
function convoyCase(of, A, B, d, purse = purseOf(A, B)) {
  const c = pairCase(of, A, B, d);
  const g = gcd(A, B);
  const need = c.fits ? A / d + B / d : null;
  const held = c.fits && need <= purse;
  const out = { ...c, g, need, purse, held, pair: { a: A, b: B, d, ...(need != null ? { need } : {}) } };
  return { ...out, tag: verdictTag(out) };
}
const plankId = (c) => `${c.of}:${c.A}:${c.B}:${c.d}`;
/** « 90 = 18 × 5 + 0 » as LaTeX. */
const divTex = (n, d) => `${tx(n)} = ${tx(d)} \\times ${tx(Math.floor(n / d))} + ${tx(n % d)}`;
/** Why the world did what it did with a convoy case — a PLAIN sentence (the screen does not render it as a formula). */
const why = (c) =>
  c.held
    ? `la planche de ${nb(c.d)} construit les deux ponts avec ${planksN(c.need)}, et la bourse a ${coins(c.purse)}`
    : !c.fits
      ? `la planche de ${nb(c.d)} ne remplit pas ${nb(c.fa ? c.B : c.A)} : il reste ${cells((c.fa ? c.B : c.A) % c.d)}`
      : `la planche de ${nb(c.d)} demande ${planksN(c.need)}, et la bourse n’a que ${coins(c.purse)}`;
const builds = (yes) => (yes ? 'elle construit les deux ponts' : 'elle ne les construit pas');
/** The words every convoy forge shares: a plank, two gaps, a purse. */
const CONVOY_TEXT = {
  ...BRIDGE_TEXT,
  log: 'Tes planches',
  ask: (c) =>
    `Deux fossés de ${nb(c.A)} et ${nb(c.B)} cases, ${coins(c.purse)} : la planche de ${nb(c.d)} construit-elle les deux ponts ?`,
  fact: (c) => {
    const s = why(c);
    return `${s[0].toUpperCase()}${s.slice(1)}.`;
  },
  eq: (c) =>
    c.fits && !c.held
      ? `$${divTex(c.A, c.d)} \\qquad ${divTex(c.B, c.d)} \\qquad ${divTex(c.A, c.g)} \\qquad ${divTex(c.B, c.g)}$`
      : `$${divTex(c.A, c.d)} \\qquad ${divTex(c.B, c.d)}$`,
  yes: 'Construit les deux',
  no: 'Ne les construit pas',
  next: 'Une autre planche',
  testing: 'Le miroir reprend tes planches une par une…',
  says: (yes) => `Ta règle : ${builds(yes)}`,
  refuted: (m) =>
    `Ta règle dit que la planche de ${nb(m.d)} ${m.says ? 'construit' : 'ne construit pas'} les ponts de ${nb(m.A)} et ${nb(m.B)} avec la bourse, mais ${why(m)}.`,
  agreed:
    'Ta règle est d’accord avec toutes tes planches. Le miroir la met maintenant au défi avec deux autres fossés.',
  attack: (c) =>
    `Le miroir met ta règle au défi : deux fossés de ${nb(c.A)} et ${nb(c.B)} cases, ${coins(c.purse)} dans la bourse, et la planche de ${nb(c.d)}. Que dit ta règle ?`,
  fire: 'Pose la planche',
  survived: 'Ta règle a tenu : les ponts et la bourse ont fait ce qu’elle disait.',
  broken: (yes) =>
    yes
      ? 'Ta règle a cédé : elle disait « elle construit les deux ponts », et les ponts ou la bourse ont refusé.'
      : 'Ta règle a cédé : elle disait « elle ne les construit pas », et la planche a construit les deux ponts.',
  compare: (cases) =>
    `Compare ces deux planches pour ${nb(cases[0].A)} et ${nb(cases[0].B)} : laquelle construit les deux ponts avec la bourse ?`,
  experiment: 'Regarde bien : deux fossés, deux planches, une seule bourse. Que fait chaque planche ?',
};
/**
 * The pairs a convoy mirror may draw: A < B ≤ `max`, never a pair of the bank nor a number of `AVOID`, never two numbers
 * that only 1 fills; `planks(A, B)` = the planks asked of the pair; at most 40 planks on the longer bridge.
 */
const convoyPool = ({ of, from = 6, to = 40, max = 60, planks }) =>
  lazy(() =>
    range(from, to).flatMap((A) =>
      range(A + 1, max)
        .filter((B) => drawable(A, B) && gcd(A, B) >= 2)
        .flatMap((B) =>
          planks(A, B)
            .map((d) => convoyCase(of, A, B, d))
            .filter((c) => c.laid <= 40),
        ),
    ),
  );

// ───────────────────────── 1. 🤝 diviseurs-communs — the plank of two gaps and a purse ─────────────────────────
// Islands A–C were the experiment (convoy « jumeaux »): 90 then 54, a purse of 15 that only 18 pays (5 + 3 planks; 9
// needs 10 + 6). His evidence: every plank he made for them, and 18.

const [T1, T2] = TW.gaps;
const k1Case = (A, B, d) => convoyCase(K.common, A, B, d);
/** Which plank of the list: the longest, the shortest but 1, any of them. */
const C_PICK = [
  { id: 'longest', label: 'la plus longue planche', of: (list) => [list.at(-1)] },
  { id: 'shortest', label: 'la plus courte planche (pas 1)', of: (list) => list.filter((d) => d > 1).slice(0, 1) },
  { id: 'any', label: 'n’importe quelle planche', of: (list) => list },
];
/** Among the planks that fill: both gaps, the shorter, the longer, a gap as long as their difference. */
const C_AMONG = [
  { id: 'both', label: 'les deux fossés', of: (A, B) => commonDivisors(A, B), say: (A, B) => `${nb(A)} et ${nb(B)}` },
  {
    id: 'short',
    label: 'le fossé le plus court',
    of: (A, B) => divisorsOf(Math.min(A, B)),
    say: (A, B) => nb(Math.min(A, B)),
  },
  {
    id: 'long',
    label: 'le fossé le plus long',
    of: (A, B) => divisorsOf(Math.max(A, B)),
    say: (A, B) => nb(Math.max(A, B)),
  },
  {
    id: 'diff',
    label: 'le fossé de leur différence',
    of: (A, B) => divisorsOf(Math.abs(A - B)),
    say: (A, B) => `le fossé de ${nb(Math.abs(A - B))}`,
  },
];
const CP = byId(C_PICK);
const CA = byId(C_AMONG);
/** The planks a K1 rule makes for A and B. */
const k1Made = (rule, A, B) => CP[rule.pick].of(CA[rule.among].of(A, B));
const k1Says = (rule, c) => k1Made(rule, c.A, c.B).includes(c.d);
const isK1Rule = (rule) => rule?.pick === 'longest' && rule?.among === 'both';
const K1_POOL = convoyPool({
  of: K.common,
  planks: (A, B) => range(1, B).filter((d) => d <= A || fills(B, d)),
});
const K1_USE = TW.use;

const commonForge = {
  key: K.common,
  slots: [
    { id: 'pick', label: 'Je fabrique', options: C_PICK.map(({ id, label }) => ({ id, label })) },
    { id: 'among', label: 'qui remplit', options: C_AMONG.map(({ id, label }) => ({ id, label })) },
  ],
  says: k1Says,
  isTheRule: isK1Rule,
  ruleText: (rule) =>
    fr(
      `Pour construire les deux ponts avec la bourse, je fabrique ${CP[rule.pick].label} qui remplit ${CA[rule.among].label}.`,
    ),
  explain(rule, c) {
    const made = k1Made(rule, c.A, c.B);
    const where = CA[rule.among].say(c.A, c.B);
    if (rule.pick === 'any')
      return fr(
        `Ta règle accepte toute planche qui remplit ${where} : la planche de ${nb(c.d)} ${made.includes(c.d) ? 'en est une' : 'n’en est pas une'}.`,
      );
    if (!made.length) return fr(`Pour ${where}, ta règle ne fabrique aucune planche.`);
    return fr(
      `Pour ${nb(c.A)} et ${nb(c.B)}, ta règle fabrique la planche de ${nb(made[0])} : ${made[0] === c.d ? 'c’est' : 'ce n’est pas'} la planche de ${nb(c.d)}.`,
    );
  },
  caseId: plankId,
  // he crossed both gaps with 18: island C cannot be reached otherwise
  evidence: fromLog({ of: K.common, gaps: TW.gaps, make: k1Case, lived: [TW.plank], caseId: plankId }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK1Rule(rule)) return firstBreak(K1_POOL(), rule, rows, k1Says, plankId);
    // the shorter gap is itself the plank of both; a plank of both that the purse does not pay
    return hard(rows, [k1Case(17, 51, 17), k1Case(24, 40, 4), k1Case(26, 39, 13)], plankId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [k1Case(20, 50, 10), k1Case(20, 50, 5)] };
    if (n === 2) return { kind: 'experiment', cases: [k1Case(24, 40, 8), k1Case(24, 40, 2)] };
    return { kind: 'experiment', cases: [k1Case(21, 49, 7), k1Case(21, 49, 49)] };
  },
  use: {
    make: () => {
      const [A, B] = K1_USE;
      return { A, B, set: commonDivisors(A, B), g: gcd(A, B), held: true };
    },
    lines: (c) => [
      line([
        fr(`Les planches qui remplissent ${c.A} et ${c.B} :`),
        ...c.set.flatMap((_, i) => [...(i ? [';'] : []), slot(`d${i + 1}`, 'une planche des deux fossés', 2)]),
      ]),
      line([fr('La planche à fabriquer :'), slot('g', 'la planche à fabriquer', 2)]),
    ],
    check(c, vals) {
      const typed = c.set.map((_, i) => Number(vals[`d${i + 1}`]));
      if (typed.some((v) => !c.set.includes(v))) return 'intruder';
      if (new Set(typed).size !== typed.length) return 'twice';
      const g = Number(vals.g);
      if (!(g >= 1) || c.A % g || c.B % g) return 'both';
      return g === c.g ? 'ok' : 'longer';
    },
    /** The claims this answer makes (not sent by the kit today: a forge's last step is not evidence). */
    claim: (c, vals) => [
      { kind: 'divisors', a: c.g, list: c.set.map((_, i) => Number(vals[`d${i + 1}`])), b: c.set.length },
      { kind: 'pgcd', a: c.A, b: c.B, g: Number(vals.g) },
    ],
  },
  text: frAll({
    ...CONVOY_TEXT,
    title: 'Le miroir du marché',
    frame: 'Pour construire les deux ponts avec la bourse :',
    buildLead: `Une carte par colonne : quelle planche fabriques-tu pour deux fossés et une bourse ? Le miroir reprend tes planches de ${T1} et ${T2}.`,
    wordsHint: 'Exemple : je fabrique la planche…',
    tryKey: (c) =>
      `Deux fossés de ${c.A} et ${c.B} cases. Le miroir ne construit pas : écris les planches qui remplissent les deux, puis celle que tu fabriques.`,
    use: {
      intruder: `Un de tes nombres ne remplit pas un des deux fossés : divise ${K1_USE[0]} et ${K1_USE[1]} par lui.`,
      twice: 'Tu as écrit une planche deux fois : une planche par case.',
      both: `Cette planche ne remplit pas les deux fossés : divise ${K1_USE[0]} et ${K1_USE[1]} par elle.`,
      longer:
        'Cette planche remplit les deux fossés, mais une planche plus longue les remplit aussi, avec moins de planches.',
    },
    useOk: 'Tu as trouvé la planche des deux fossés sans en poser une seule.',
  }),
};

// ───────────────────────── 2. 🧺 lots-identiques — the stall's baskets ─────────────────────────
// A case is a SHARING of nA apples and nB pears into k identical baskets (`c.deal`, drawn with the stall's pieces), of
// one of two kinds, each asking one column:
//   deal  « k baskets share every fruit »     held: k divides both          (column `must`)
//   most  « k is the most baskets possible »   held: k = PGCD(nA ; nB)        (column `most`)

const sharing = (nA, nB, k) => ({
  a: { n: nA, item: DEAL_INQUIRY.a.item },
  b: { n: nB, item: DEAL_INQUIRY.b.item },
  k,
  lot: DEAL_INQUIRY.lot,
});
function fruitCase(kind, nA, nB, k) {
  const fa = fills(nA, k);
  const fb = fills(nB, k);
  const g = gcd(nA, nB);
  const held = kind === 'deal' ? fa && fb : k === g;
  const tag = kind === 'deal' ? (fa && fb ? 'tout partagé' : 'il en reste') : held ? 'le plus' : 'pas le plus';
  return { of: K.lots, kind, A: nA, B: nB, nA, nB, k, fa, fb, fits: fa && fb, g, held, deal: sharing(nA, nB, k), tag };
}
const dealCase = (nA, nB, k) => fruitCase('deal', nA, nB, k);
const mostCase = (nA, nB, k) => fruitCase('most', nA, nB, k);
const fruitId = (c) => `${c.of}:${c.kind}:${c.nA}:${c.nB}:${c.k}`;
/** The numbers of baskets that share every fruit (1 included: one basket holds them all). */
const suits = (a, b) => commonDivisors(a, b);
const F_MUST = [
  { id: 'both', label: 'divise les deux nombres', ok: (c) => c.fa && c.fb },
  { id: 'one', label: 'divise l’un des deux nombres', ok: (c) => c.fa || c.fb },
  { id: 'sum', label: 'divise leur somme', ok: (c) => (c.nA + c.nB) % c.k === 0 },
  { id: 'diff', label: 'divise leur différence', ok: (c) => Math.abs(c.nA - c.nB) % c.k === 0 },
];
const F_MOST = [
  { id: 'pgcd', label: 'leur PGCD', of: (a, b) => gcd(a, b) },
  { id: 'small', label: 'le plus petit n qui convient', of: (a, b) => suits(a, b).find((k) => k >= 2) ?? null },
  { id: 'count', label: 'le nombre de n qui conviennent', of: (a, b) => suits(a, b).length },
  { id: 'diff', label: 'leur différence', of: (a, b) => Math.abs(a - b) },
];
const FM = byId(F_MUST);
const FX = byId(F_MOST);
const lotsSays = (rule, c) => (c.kind === 'deal' ? FM[rule.must].ok(c) : FX[rule.most].of(c.nA, c.nB) === c.k);
const isLotsRule = (rule) => rule?.must === 'both' && rule?.most === 'pgcd';
const fruits = (c) => `${counted(c.nA, APPLES)} et ${counted(c.nB, PEARS)}`;
/** What k baskets left on the table — a fact. */
const tableOf = (c) =>
  c.fa && c.fb
    ? 'tous les fruits sont partagés'
    : [c.fa ? null : 'il reste des pommes', c.fb ? null : 'il reste des poires'].filter(Boolean).join(' et ');
const LOTS_POOL = lazy(() =>
  range(12, 40).flatMap((nA) =>
    range(nA + 1, 60)
      .filter((nB) => drawable(nA, nB) && gcd(nA, nB) >= 2)
      .flatMap((nB) => range(2, 12).flatMap((k) => [dealCase(nA, nB, k), mostCase(nA, nB, k)])),
  ),
);
const { apples: NA, pears: NB } = DL;
const yesNo = (yes) => (yes ? 'oui' : 'non');
const L_USE = DL.use;

const lotsForge = {
  key: K.lots,
  /** He deals the stall's fruits into baskets (inquiries.js): his tries and his answers are his evidence. */
  inquiry: DEAL_INQUIRY,
  fromInquiry: (result) => {
    const rows = [
      ...result.tries.map((t) => dealCase(NA, NB, t.k)),
      mostCase(NA, NB, result.most),
      ...result.answers.filter((a) => a.kind !== 'ok').map((a) => mostCase(NA, NB, a.k)),
    ];
    return { rows: rows.filter((c, i) => rows.findIndex((x) => fruitId(x) === fruitId(c)) === i) };
  },
  slots: [
    { id: 'must', label: 'n paniers conviennent quand n', options: F_MUST.map(({ id, label }) => ({ id, label })) },
    {
      id: 'most',
      label: 'Le plus de paniers possible, c’est',
      options: F_MOST.map(({ id, label }) => ({ id, label })),
    },
  ],
  says: lotsSays,
  isTheRule: isLotsRule,
  ruleText: (rule) =>
    fr(`n paniers conviennent quand n ${FM[rule.must].label} ; le plus de paniers, c’est ${FX[rule.most].label}.`),
  explain(rule, c) {
    if (c.kind === 'deal')
      return fr(
        `${counted(c.k, BASKETS)} pour ${fruits(c)} : ${tableOf(c)}. Ta règle dit : ${FM[rule.must].ok(c) ? 'tous les fruits sont partagés' : 'il reste des fruits'}.`,
      );
    const v = FX[rule.most].of(c.nA, c.nB);
    return fr(
      `Pour ${fruits(c)}, ta règle dit que le plus de paniers possible est ${v ?? 'introuvable'} : ${v === c.k ? 'c’est' : 'ce n’est pas'} ${c.k}.`,
    );
  },
  caseId: fruitId,
  evidence: gather({ own: (row) => row.of === K.lots, fromRow: () => [], caseId: fruitId }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isLotsRule(rule)) return firstBreak(LOTS_POOL(), rule, rows, lotsSays, fruitId);
    // ten baskets share 20 apples and 50 pears, and are the most; five share them too, but are not the most
    return hard(rows, [dealCase(20, 50, 10), mostCase(20, 50, 5), mostCase(40, 50, 10)], fruitId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [dealCase(20, 32, 4), dealCase(20, 32, 8)] };
    if (n === 2) return { kind: 'experiment', cases: [mostCase(20, 32, 4), mostCase(20, 32, 2)] };
    return { kind: 'experiment', cases: [dealCase(24, 40, 8), dealCase(24, 40, 6)] };
  },
  use: {
    make: () => {
      const [nA, nB] = L_USE;
      return { A: nA, B: nB, nA, nB, g: gcd(nA, nB), held: true };
    },
    lines: () => [
      line([fr('Le plus de paniers possible'), '=', slot('k', 'le nombre de paniers', 2)]),
      line([fr('Pommes dans chaque panier'), '=', slot('x', 'les pommes d’un panier', 2)]),
      line([fr('Poires dans chaque panier'), '=', slot('y', 'les poires d’un panier', 2)]),
    ],
    check(c, vals) {
      const [k, x, y] = ['k', 'x', 'y'].map((v) => Number(vals[v]));
      if (!(k >= 1) || c.nA % k || c.nB % k) return 'share';
      if (k < c.g) return 'more';
      return x * k === c.nA && y * k === c.nB ? 'ok' : 'lot';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, vals) => [
      { kind: 'pgcd', a: c.nA, b: c.nB, g: Number(vals.k) },
      { kind: 'pair', a: c.nA, b: Number(vals.k), e: Number(vals.x) },
      { kind: 'pair', a: c.nB, b: Number(vals.k), e: Number(vals.y) },
    ],
  },
  text: frAll({
    sub: BRIDGE_TEXT.sub,
    title: 'Le miroir de l’étal',
    log: 'Tes partages',
    ask: (c) =>
      c.kind === 'deal'
        ? `${fruits(c)} dans ${counted(c.k, BASKETS)} identiques : tous les fruits sont-ils partagés ?`
        : `${fruits(c)} : ${counted(c.k, BASKETS)}, est-ce le plus possible ?`,
    fact: (c) =>
      c.kind === 'deal'
        ? `${counted(c.k, BASKETS)} : ${tableOf(c)}.`
        : c.held
          ? `${counted(c.k, BASKETS)} partagent tout, et aucun nombre plus grand ne le fait.`
          : c.fits
            ? `${counted(c.g, BASKETS)} partagent aussi tout.`
            : `${counted(c.k, BASKETS)} : ${tableOf(c)}.`,
    eq: (c) =>
      c.kind === 'most' && c.fits && !c.held
        ? `$${divTex(c.nA, c.k)} \\qquad ${divTex(c.nB, c.k)} \\qquad ${divTex(c.nA, c.g)} \\qquad ${divTex(c.nB, c.g)}$`
        : `$${divTex(c.nA, c.k)} \\qquad ${divTex(c.nB, c.k)}$`,
    yes: 'Oui',
    no: 'Non',
    next: 'Un autre partage',
    frame: 'Des paniers identiques, sans qu’il reste un fruit :',
    buildLead: `Une carte par colonne : quels nombres de paniers conviennent, et quel est le plus grand ? Le miroir reprend tes partages de l’étal.`,
    testing: 'Le miroir reprend tes partages un par un…',
    says: (yes) => `Ta règle : ${yesNo(yes)}`,
    refuted: (m) =>
      m.kind === 'deal'
        ? `Ta règle dit que ${counted(m.k, BASKETS)} ${m.says ? 'partagent' : 'ne partagent pas'} tous les fruits, mais tu as vu ${m.held ? 'tous les fruits partagés' : 'des fruits rester sur la table'}.`
        : `Ta règle dit que ${m.k} ${m.says ? 'est' : 'n’est pas'} le plus de paniers possible, mais ${
            m.held
              ? 'aucun nombre plus grand ne partage tout'
              : m.fits
                ? `${counted(m.g, BASKETS)} partagent aussi tout`
                : 'des fruits restent sur la table'
          }.`,
    agreed: 'Ta règle est d’accord avec tous tes partages. Le miroir la met maintenant au défi avec d’autres fruits.',
    attack: (c) =>
      c.kind === 'deal'
        ? `Le miroir met ta règle au défi : ${fruits(c)} dans ${counted(c.k, BASKETS)} identiques. Tous les fruits sont-ils partagés ?`
        : `Le miroir met ta règle au défi : ${fruits(c)}. ${counted(c.k, BASKETS)}, est-ce le plus possible ?`,
    fire: 'Partage les fruits',
    survived: 'Ta règle a tenu : les fruits ont fait ce qu’elle disait.',
    broken: (yes) => `Ta règle a cédé : elle disait « ${yesNo(yes)} », et les fruits ont dit « ${yesNo(!yes)} ».`,
    wordsHint: 'Exemple : n paniers conviennent quand…',
    compare: (cases) => `Compare ces deux partages de ${fruits(cases[0])} : lequel ne laisse aucun fruit ?`,
    experiment: 'Regarde bien : les mêmes fruits, deux nombres de paniers. Que reste-t-il sur la table ?',
    tryKey: () =>
      `${L_USE[0]} pommes et ${L_USE[1]} poires, toutes dans des paniers identiques. Le miroir ne partage pas : combien de paniers au plus, et que contient chacun ?`,
    use: {
      share: 'Avec ce nombre de paniers, il reste des fruits : divise les deux nombres par lui.',
      more: 'Ce nombre partage tout, mais un nombre plus grand de paniers partage tout aussi.',
      lot: 'Le nombre de paniers est juste. Divise chaque nombre de fruits par lui.',
    },
    useOk: 'Tu as partagé tous les fruits sans en déplacer un seul.',
  }),
};

// ───────────────────────── 3. 🧮 pgcd-facteurs — the plank read on two decompositions ─────────────────────────
// Islands C–E were the experiment (convoy « grands »): 1 736 = 2³ × 7 × 31 and 980 = 2² × 5 × 7², 193 coins; only 28 =
// 2² × 7 builds (62 + 35 planks), 14 runs out of coins (124 + 70). His evidence: every plank he made for them, and 28.
// A rule multiplies WHICH primes (those of both, or every prime seen) with WHICH exponent (the smaller seen, the larger
// seen, 1). « son plus petit exposant » (the owner's wording, 2026-11-23): a prime seen in one number only keeps the
// exponent it has there.

const k3Case = (A, B, d) => convoyCase(K.factors, A, B, d);
const F_WHICH = [
  {
    id: 'common',
    label: 'les facteurs premiers communs',
    primes: (xs, ys) => xs.filter((x) => ys.some((y) => y.p === x.p)).map((x) => x.p),
  },
  {
    id: 'all',
    label: 'tous les facteurs premiers',
    primes: (xs, ys) => [...new Set([...xs, ...ys].map((f) => f.p))].sort((p, q) => p - q),
  },
];
const F_EXP = [
  { id: 'small', label: 'son plus petit exposant', pick: (es) => Math.min(...es) },
  { id: 'big', label: 'son plus grand exposant', pick: (es) => Math.max(...es) },
  { id: 'one', label: 'l’exposant 1', pick: () => 1 },
];
const FW = byId(F_WHICH);
const FE = byId(F_EXP);
/** The decomposition a K3 rule writes for A and B: [{ p, e }]. */
function k3Powers(rule, A, B) {
  const xs = powersOf(A);
  const ys = powersOf(B);
  return FW[rule.which].primes(xs, ys).map((p) => {
    const es = [...xs, ...ys].filter((f) => f.p === p).map((f) => f.e);
    return { p, e: FE[rule.exp].pick(es) };
  });
}
const k3Made = (rule, A, B) => valueOfPowers(k3Powers(rule, A, B));
const k3Says = (rule, c) => k3Made(rule, c.A, c.B) === c.d;
const isK3Rule = (rule) => rule?.which === 'common' && rule?.exp === 'small';
/** A decomposition as LaTeX, 1 for none. */
const powOr1 = (fs) => (fs.length ? powTex(fs) : '1');
/** The mirror's small pairs, and for each the planks the rules make and the right one (none longer than the shorter gap). */
const K3_POOL = convoyPool({
  of: K.factors,
  to: 60,
  max: 90,
  planks: (A, B) => {
    const out = new Set([gcd(A, B)]);
    for (const which of F_WHICH) for (const exp of F_EXP) out.add(k3Made({ which: which.id, exp: exp.id }, A, B));
    return [...out].filter((d) => d <= Math.min(A, B)).sort((p, q) => p - q);
  },
});
const [G1, G2] = FC.gaps;
const [U1, U2] = FC.use;
const UA = valueOfPowers(U1);
const UB = valueOfPowers(U2);

const factorsForge = {
  key: K.factors,
  slots: [
    { id: 'which', label: 'Je multiplie', options: F_WHICH.map(({ id, label }) => ({ id, label })) },
    { id: 'exp', label: 'chacun avec', options: F_EXP.map(({ id, label }) => ({ id, label })) },
  ],
  says: k3Says,
  isTheRule: isK3Rule,
  ruleText: (rule) =>
    fr(
      `Pour écrire le PGCD de deux nombres décomposés, je multiplie ${FW[rule.which].label}, chacun avec ${FE[rule.exp].label}.`,
    ),
  explain(rule, c) {
    const fs = k3Powers(rule, c.A, c.B);
    const v = valueOfPowers(fs);
    return fr(
      `$${tx(c.A)} = ${powOr1(powersOf(c.A))}$ et $${tx(c.B)} = ${powOr1(powersOf(c.B))}$ : ta règle fabrique $${powOr1(fs)} = ${tx(v)}$ ; ${v === c.d ? 'c’est' : 'ce n’est pas'} la planche de ${nb(c.d)}.`,
    );
  },
  caseId: plankId,
  // he crossed both gaps with 28: island E cannot be reached otherwise
  evidence: fromLog({ of: K.factors, gaps: FC.gaps, make: k3Case, lived: [FC.plank], caseId: plankId }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK3Rule(rule)) return firstBreak(K3_POOL(), rule, rows, k3Says, plankId);
    // 2³ × 5 and 2² × 3 × 7: 4 builds both; 8 (the larger exponent) does not fill 84
    return hard(rows, [k3Case(40, 84, 4), k3Case(40, 84, 8), k3Case(50, 80, 10)], plankId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [k3Case(44, 66, 22), k3Case(44, 66, 11)] };
    if (n === 2) return { kind: 'experiment', cases: [k3Case(24, 40, 8), k3Case(24, 40, 4)] };
    return { kind: 'experiment', cases: [k3Case(63, 84, 21), k3Case(63, 84, 63)] };
  },
  use: {
    make: () => ({ A: UA, B: UB, xs: U1, ys: U2, common: commonPowers(U1, U2), g: gcd(UA, UB), held: true }),
    lines: (c) => [
      line([
        nb(c.A),
        '=',
        ...c.xs.flatMap((f, i) => [...(i ? ['×'] : []), f.e === 1 ? String(f.p) : givenPower(f.p, f.e)]),
      ]),
      line([
        nb(c.B),
        '=',
        ...c.ys.flatMap((f, i) => [...(i ? ['×'] : []), f.e === 1 ? String(f.p) : givenPower(f.p, f.e)]),
      ]),
      line([
        fr(`PGCD(${nb(c.A)} ; ${nb(c.B)})`),
        '=',
        ...c.common.flatMap((f, i) => [...(i ? ['×'] : []), powerBox(f.p, `e${f.p}`)]),
        '=',
        slot('g', 'le PGCD', 3),
      ]),
    ],
    check(c, vals) {
      for (const f of c.common) if (Number(vals[`e${f.p}`]) !== f.e) return `e${f.p}`;
      return Number(vals.g) === c.g ? 'ok' : 'value';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, vals) => [
      { kind: 'factorization', a: c.g, factors: c.common.map((f) => ({ p: f.p, e: Number(vals[`e${f.p}`]) })) },
      { kind: 'pgcd', a: c.A, b: c.B, g: Number(vals.g) },
    ],
  },
  text: frAll({
    ...CONVOY_TEXT,
    title: 'Le miroir des horloges',
    eq: (c) =>
      `$${tx(c.A)} = ${powOr1(powersOf(c.A))} \\qquad ${tx(c.B)} = ${powOr1(powersOf(c.B))} \\qquad ${tx(c.d)} = ${powOr1(powersOf(c.d))}$`,
    frame: 'Pour écrire le PGCD de deux nombres décomposés :',
    buildLead: `Une carte par colonne : comment lis-tu la planche sur les deux décompositions ? Le miroir reprend tes planches de ${nb(G1)} et ${nb(G2)}.`,
    wordsHint: 'Exemple : je garde…',
    tryKey: (c) =>
      `Le miroir ne construit pas : avec ta règle, écris le PGCD de ${nb(c.A)} et ${nb(c.B)} en facteurs premiers, puis sa valeur.`,
    use: {
      e2: `Regarde le 2 dans les deux décompositions : ce n’est pas cet exposant-là.`,
      e3: `Regarde le 3 dans les deux décompositions : ce n’est pas cet exposant-là.`,
      value: 'Les exposants sont justes : calcule le produit.',
    },
    useOk: 'Tu lis la planche sur deux décompositions, sans poser une planche.',
  }),
};

// ───────────────────────── 4. 🔁 euclide — the plank the notebook leads to ─────────────────────────
// Islands E–G were the experiment (convoy « euclide »): 52 015 then 31 209, 807 coins, the notebook of divisions (3 rows
// ending 20 806 = 10 403 × 2 + 0); only 10 403 builds. In the mirror, the experiment `nest` / `pair` (inquiries.js): the
// contrast (88 ; 33) / (88 ; 22), then his last two rows. His evidence: the plank 10 403 he crossed with (the forge's
// experiment replaces the log: `RuleForge.jsx`), and every probe of the two rounds, asked of each pair.

const [E1, E2] = EU.gaps;
const k4Case = (A, B, d, purse) => convoyCase(K.euclide, A, B, d, purse);
/** What the procedure of a rule does with A and B: its divisions and the plank it makes. */
function k4Run(rule, A, B) {
  let [x, y] = [Math.max(A, B), Math.min(A, B)];
  const rows = [];
  for (;;) {
    const q = Math.floor(x / y);
    const r = x % y;
    rows.push({ x, y, q, r });
    if (r === 0 || (rule.stop === 'qone' && q === 1)) break;
    [x, y] = [y, r];
  }
  const end = rows.at(-1);
  const made = { last: end.r !== 0 ? end.r : end.y, q: end.q, count: rows.length }[rule.make];
  return { rows, made };
}
const I_STOP = [
  { id: 'zero', label: 'quand le reste est 0' },
  { id: 'qone', label: 'quand le quotient est 1' },
];
const I_MAKE = [
  { id: 'last', label: 'le dernier reste qui n’est pas 0' },
  { id: 'q', label: 'le dernier quotient' },
  { id: 'count', label: 'le nombre de divisions' },
];
const IS = byId(I_STOP);
const IM = byId(I_MAKE);
const k4Says = (rule, c) => k4Run(rule, c.A, c.B).made === c.d;
const isK4Rule = (rule) => rule?.stop === 'zero' && rule?.make === 'last';
const K4_POOL = convoyPool({
  of: K.euclide,
  planks: (A, B) => {
    const out = new Set([gcd(A, B)]);
    for (const stop of I_STOP) for (const make of I_MAKE) out.add(k4Run({ stop: stop.id, make: make.id }, A, B).made);
    return [...out].sort((p, q) => p - q);
  },
});
const K4_USE = EU.use;
const K4_ROWS = euclid(...K4_USE);

const euclideForge = {
  key: K.euclide,
  inquiry: PAIR_INQUIRY,
  /** The plank he crossed with, then every probe of the two rounds asked of each pair of the round. */
  fromInquiry: (result) => {
    const rows = [
      k4Case(E1, E2, EU.plank, EU.purse),
      ...result.rounds.flatMap((r) =>
        [
          [r.a, r.b],
          [r.pair[0], r.pair[1]],
        ].flatMap(([A, B]) => r.rows.map((x) => k4Case(A, B, x.p))),
      ),
    ];
    return { rows: rows.filter((c, i) => rows.findIndex((x) => plankId(x) === plankId(c)) === i) };
  },
  slots: [
    { id: 'stop', label: 'Je m’arrête', options: I_STOP },
    { id: 'make', label: 'La planche mesure', options: I_MAKE },
  ],
  says: k4Says,
  isTheRule: isK4Rule,
  ruleText: (rule) =>
    fr(`Je divise comme le carnet ; je m’arrête ${IS[rule.stop].label} ; la planche mesure ${IM[rule.make].label}.`),
  explain(rule, c) {
    const { rows, made } = k4Run(rule, c.A, c.B);
    return fr(
      `Avec ta règle, ${nb(c.A)} et ${nb(c.B)} donnent ${counted(rows.length, DIVISIONS)}, puis la planche de ${nb(made)} : ${made === c.d ? 'c’est' : 'ce n’est pas'} la planche de ${nb(c.d)}.`,
    );
  },
  caseId: plankId,
  evidence: gather({ own: (row) => row.of === K.euclide, fromRow: () => [], caseId: plankId }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK4Rule(rule)) return firstBreak(K4_POOL(), rule, rows, k4Says, plankId);
    // 85 = 34 × 2 + 17 and 34 = 17 × 2 + 0: 17 builds both; 34, the shorter gap, does not fill 85
    return hard(rows, [k4Case(34, 85, 17), k4Case(34, 85, 34), k4Case(26, 65, 13)], plankId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [k4Case(34, 51, 17), k4Case(34, 51, 34)] };
    if (n === 2) return { kind: 'experiment', cases: [k4Case(51, 68, 17), k4Case(51, 68, 34)] };
    return { kind: 'experiment', cases: [k4Case(39, 52, 13), k4Case(39, 52, 3)] };
  },
  use: {
    make: () => {
      const [A, B] = K4_USE;
      return { A, B, rows: K4_ROWS, g: gcd(A, B), held: true };
    },
    lines: (c) => [
      line([nb(c.A), '=', nb(c.B), '×', slot('q1', 'le quotient', 2), '+', slot('r1', 'le reste', 3)]),
      divisionRow(2),
      divisionRow(3),
      line([fr(`PGCD(${nb(c.A)} ; ${nb(c.B)})`), '=', slot('g', 'le PGCD', 2)]),
    ],
    check(c, vals) {
      const v = (k) => Number(vals[k]);
      const [r1] = c.rows;
      if (v('q1') !== r1.q || v('r1') !== r1.r) return 'row1';
      for (const i of [2, 3]) {
        const r = c.rows[i - 1];
        if (v(`a${i}`) !== r.a || v(`b${i}`) !== r.b) return `pair${i}`;
        if (v(`q${i}`) !== r.q || v(`r${i}`) !== r.r) return `row${i}`;
      }
      if (v('g') === c.g) return 'ok';
      return v('g') === 0 ? 'zero' : 'pgcd';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, vals) => [
      ...[1, 2, 3].map((i) => {
        const r = c.rows[i - 1];
        const q = Number(vals[`q${i}`]);
        const rr = Number(vals[`r${i}`]);
        return { kind: 'division', a: r.a, b: r.b, q, r: rr, fits: rr === 0 };
      }),
      { kind: 'pgcd', a: c.A, b: c.B, g: Number(vals.g) },
    ],
  },
  text: frAll({
    ...CONVOY_TEXT,
    title: 'Le miroir des cascades',
    frame:
      'Comme le carnet : je divise le plus grand par le plus petit, puis le plus petit par le reste, et ainsi de suite.',
    buildLead: `Une carte par colonne : quelle planche le carnet te fait-il fabriquer ? Le miroir reprend ta planche de ${nb(EU.plank)} et tes deux paires.`,
    wordsHint: 'Exemple : je divise… jusqu’à…',
    tryKey: (c) =>
      `Le miroir ne construit pas : écris les divisions de ${nb(c.A)} par ${nb(c.B)}, ligne par ligne jusqu’au reste 0, puis leur PGCD.`,
    use: {
      row1: 'Vérifie la première division : le reste est plus petit que le nombre par lequel tu divises.',
      row2: 'Vérifie la deuxième division : le reste est plus petit que le nombre par lequel tu divises.',
      row3: 'Vérifie la troisième division : le reste est plus petit que le nombre par lequel tu divises.',
      pair2: 'La deuxième ligne divise le plus petit nombre de la première par son reste.',
      pair3: 'La troisième ligne divise le plus petit nombre de la deuxième par son reste.',
      zero: '0 n’est pas une longueur de planche : regarde le reste d’avant.',
      pgcd: 'Regarde les restes que tu as écrits.',
    },
    useOk: 'Trois divisions, le reste 0, et la planche est trouvée.',
  }),
};

/** The forges, by key, in the order of the story (world/index.js › lesson.forges). */
export const FORGES = {
  [K.common]: commonForge,
  [K.lots]: lotsForge,
  [K.factors]: factorsForge,
  [K.euclide]: euclideForge,
};
