/**
 * THE FOUR FORGES of lesson « Engrenages et rendez-vous : quand deux rythmes se retrouvent » — one per key, in the order
 * of the story; no rule of this lesson is told (frame: kit/forge.js; the blocks: kit/authoring/forgeBlocks.js). The
 * design: `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 4, version 2 (« plus petit multiple commun » in
 * full, never « PPCM »; no gear drawn). Every number is the design's proof script's.
 *
 *   pilier-commun          🏗️ island B — MET ON THE ISLANDS (the walkway of the quay: crews of 16 and 20, 14 coins). No
 *                          `inquiry`; his evidence is every pillar he placed there (`game.log`, `kind: 'walkway'`), and 80
 *                          — he cannot reach B otherwise. Tiles: which pillar × where who ends × 0 — 2 × 3 × 2 = 12 rules.
 *   ppcm-facteurs          🧮 island D — MET ON THE ISLANDS (the chantier: 414 and 192, 120 coins, lesson 1's sheet as the
 *                          bench). Tiles: which primes × which exponent — 2 × 3 = 6 rules (lesson 2's frame, turned round).
 *   traduire-rendez-vous   🔁 island E — keeps its experiment (`crews` / `story`): the wheels and the buses read back.
 *                          Tiles: when they meet × how many times each — 3 × 2 = 6 rules.
 *   cinq-equipes           ⏳ island F — keeps its experiment (`crews` / `days`): five teams run day by day. Tiles:
 *                          which number × of which days × the day — 2 × 2 × 2 = 8 rules.
 * A case of K1 and K2 is ONE pillar d for two crews A and B with a purse (`pillarCase`): what the world does (`held`) is
 * « the walkway is built » — both crews end on d and the purse pays it. The purse is never exact: it pays the first
 * pillar that holds and not the next one (the story's 14 and 120; for a pair of the mirror, `purseOf`). A case of K3 is a
 * claim about a story read back (`meet`, `turns`, `clock`), of K4 a day for some teams (`dayCase`). Exactly ONE rule of
 * each forge holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one by a computed case.
 * A case carries a `text` (its line in the evidence): `divisorIsles/forgeParts.jsx` has no drawing of crews' lanes nor of
 * day rows yet (REPORTED) — a case carries `walk` = { crews, d } (K1, K2) or `days` = { cycles, day } (K4) for it.
 * No sentence of a forge before its last step names its key (`describeForges › forbidden`).
 */
import { lay } from '../../../../../../common/gameworld/divisorIsles/walkway';
import { daysFact } from '../../../../../../common/gameworld/divisorIsles/crews';
import { BRIDGE_TEXT } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  byId,
  choiceBox,
  firstBreak,
  gather,
  givenPower,
  hard,
  lazy,
  line,
  noPredictions,
  powerBox,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { DAYS_INQUIRY, STORIES, STORY_INQUIRY, clockAfter, clockFr, teamsFr } from './inquiries';
import {
  CELLS,
  COINS,
  NUMBERS,
  PLANKS,
  counted,
  fr,
  frAll,
  gcd,
  lcm,
  lcmOf,
  lcmPowers,
  nb,
  powTex,
  powersOf,
  range,
  tx,
  valueOfPowers,
} from './math';
import { K } from './story';

const { pillar: PI, factors: FC, story: ST, days: DY } = NUMBERS;

const coins = (n) => counted(n, COINS);
const planks = (n) => counted(n, PLANKS);
const cells = (n) => counted(n, CELLS);
const cap = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;
const uncap = (s) => (/^\p{Lu}\p{Ll}/u.test(s) ? `${s[0].toLowerCase()}${s.slice(1)}` : s);
const yn = (yes) => (yes ? 'oui' : 'non');

// ───────────────────────── a pillar for two crews and a purse (K1, K2) ─────────────────────────

/** The planks a pillar at d asks of crews of A and B (both whole or not). */
const costAt = (A, B, d) => Math.floor(d / A) + Math.floor(d / B);
/** The purses of the road, then the rule of the mirror: the first pillar that holds is paid, not the second one. */
const ROAD_PURSES = { [`${PI.crews}`]: PI.purse, [`${FC.crews}`]: FC.purse };
export function purseOf(A, B) {
  const road = ROAD_PURSES[`${A},${B}`];
  if (road != null) return road;
  return 2 * costAt(A, B, lcm(A, B)) - 1;
}
/** The tag of a pillar case (≤ 12 characters): what the world did. */
const PILLAR_TAG = { paid: 'bâtie', ruins: 'trop chère', short: 'ne tient pas', shore: 'sur le bord' };
/** One crew toward the pillar, as a fact: « les planches de 16 finissent pile (5 planches) ». */
const laneSay = (l) =>
  l.ends
    ? `les planches de ${nb(l.b)} finissent pile (${planks(l.planks)})`
    : l.planks === 0
      ? `aucune planche de ${nb(l.b)} ne tient avant le pilier`
      : `les planches de ${nb(l.b)} s’arrêtent ${cells(l.short)} avant le pilier`;
/** Why the world did what it did with a pillar — a PLAIN sentence. */
const pillarWhy = (c) => {
  if (c.verdict === 'shore') return 'un pilier sur le bord ne bâtit aucune passerelle';
  if (c.verdict === 'paid') return `les deux équipes finissent pile, et la bourse paie les ${planks(c.cost)}`;
  if (c.verdict === 'ruins') return `il faut ${planks(c.cost)}, et la bourse n’en paie que ${c.purse}`;
  return c.lanes
    .filter((l) => !l.ends)
    .map(laneSay)
    .join(', et ');
};
/**
 * ONE pillar at d for crews of A and B with the purse of the pair: `held` = the walkway is built (both crews end on d,
 * d > 0, the purse pays it) — the world's own `walkway.js › lay`.
 */
function pillarCase(of, A, B, d, purse = purseOf(A, B)) {
  const t = lay([A, B], d, purse);
  return {
    of,
    A,
    B,
    d,
    purse,
    lanes: t.lanes,
    cost: t.cost,
    verdict: t.verdict,
    holds: t.holds,
    held: t.paid,
    tag: PILLAR_TAG[t.verdict],
    // no-break spaces: a number never leaves its word for the next line (gate B 2026-11-26: « et de / 192 »)
    text: fr(`Planches de ${nb(A)} et de ${nb(B)} : le pilier à ${cells(d)}`),
    walk: { crews: [A, B], d },
    // K2's rows carry the pillar's decomposition, read in place of the lanes: the tiles speak of prime factors and
    // exponents, so what they refer to is on the screen he builds his rule on (gate B 2026-11-26, as lesson 3's K1)
    ...(of === K.facteurs ? { sub: `${nb(d)} = ${decPlain(d)}` } : {}),
  };
}
/** « 576 = 2⁶ × 3² » as PLAIN text (a row's second line), primes increasing, exponents raised; 0 and 1 as they are. */
const decPlain = (x) =>
  x < 2
    ? String(x)
    : powersOf(x)
        .map((f) => (f.e === 1 ? nb(f.p) : `${nb(f.p)}${String(f.e).replace(/\d/g, (k) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[k])}`))
        .join(' × ');
const pillarId = (c) => `${c.of}:${c.A}:${c.B}:${c.d}`;
/** « 64 = 16 × 4 + 0 » as LaTeX. */
const divTex = (n, d) => `${tx(n)} = ${tx(d)} \\times ${tx(Math.floor(n / d))} + ${tx(n % d)}`;
/** His pillars on one walkway of the road (`game.log`, `{ kind: 'walkway', seg, d, … }`), and the one he crossed with. */
const fromWalkway = ({ of, seg, crews, lived }) => {
  const make = (d) => pillarCase(of, crews[0], crews[1], d);
  return gather({
    own: (row) => row.of === of,
    fromRow: (row) => (row.kind === 'walkway' && row.seg === seg && Number.isInteger(row.d) ? [make(row.d)] : []),
    lived: [make(lived)],
    caseId: pillarId,
  });
};
/** The words every pillar forge shares: two crews, a pillar, a purse. */
const PILLAR_TEXT = {
  sub: BRIDGE_TEXT.sub,
  log: 'Tes piliers',
  ask: (c) =>
    `Planches de ${nb(c.A)} et de ${nb(c.B)}, ${coins(c.purse)} : le pilier à ${cells(c.d)} bâtit-il la passerelle ?`,
  fact: (c) =>
    c.verdict === 'shore'
      ? 'Un pilier sur le bord : il n’y a pas de passerelle à construire.'
      : `${cap(pillarWhy(c))}.`,
  eq: (c) =>
    c.d > 0 ? `$${divTex(c.d, c.A)} \\qquad ${divTex(c.d, c.B)}$` : `$0 = ${tx(c.A)} \\times 0 = ${tx(c.B)} \\times 0$`,
  yes: 'Passerelle bâtie',
  no: 'Pas bâtie',
  next: 'Un autre pilier',
  testing: 'Le miroir reprend tes piliers un par un…',
  says: (yes) => `Ta règle : ${yes ? 'la passerelle est bâtie' : 'elle n’est pas bâtie'}`,
  refuted: (m) =>
    `Ta règle dit que le pilier à ${cells(m.d)} ${m.says ? 'bâtit' : 'ne bâtit pas'} la passerelle des planches de ${nb(m.A)} et de ${nb(m.B)}, mais ${pillarWhy(m)}.`,
  agreed: 'Ta règle est d’accord avec tous tes piliers. Le miroir la met maintenant au défi avec d’autres planches.',
  attack: (c) =>
    `Le miroir met ta règle au défi : planches de ${nb(c.A)} et de ${nb(c.B)}, ${coins(c.purse)} dans la bourse, et le pilier à ${cells(c.d)}. Que dit ta règle ?`,
  fire: 'Les équipes posent',
  survived: 'Ta règle a tenu : les équipes et la bourse ont fait ce qu’elle disait.',
  broken: (yes) =>
    yes
      ? 'Ta règle a cédé : elle disait « la passerelle est bâtie », et le pilier ou la bourse a refusé.'
      : 'Ta règle a cédé : elle disait « elle n’est pas bâtie », et la passerelle a été bâtie.',
  compare: (cases) =>
    `Compare ces deux piliers pour des planches de ${nb(cases[0].A)} et de ${nb(cases[0].B)} : lequel bâtit la passerelle avec la bourse ?`,
  experiment: 'Regarde bien : deux équipes, deux piliers, une seule bourse. Que fait chaque pilier ?',
};

// ───────────────────────── 1. 🏗️ pilier-commun — where the pillar stands ─────────────────────────
// Islands A → B were the experiment (the quay): planks of 16 and 20, 14 coins; only 80 is built (5 + 4 = 9 planks; 160
// needs 18, 320 — the product — 36). His evidence: every pillar he placed there, and 80.
// The design's tiles (one column of six long tiles) did not fit the frame (≤ 4 tiles of ≤ 32 characters a column): the
// same beliefs on three columns — which pillar, where who ends, and 0 in its own column (gate A, defect 7). The sum, the
// product and the PGCD are left as numbers the mirror refutes, not as tiles (REPORTED).

const [A1, B1] = PI.crews;
const k1Case = (A, B, d) => pillarCase(K.pilier, A, B, d);
const P_PICK = [
  { id: 'smallest', label: 'la plus petite distance' },
  { id: 'any', label: 'n’importe quelle distance' },
];
/** Who ends exactly on the pillar: the step its distances go by. */
const P_WHO = [
  { id: 'both', label: 'chaque équipe', step: (A, B) => lcm(A, B) },
  { id: 'long', label: 'l’équipe aux longues planches', step: (A, B) => Math.max(A, B) },
  { id: 'short', label: 'l’équipe aux courtes planches', step: (A, B) => Math.min(A, B) },
];
const P_ZERO = [
  { id: 'without', label: 'sans compter 0' },
  { id: 'with', label: 'en comptant 0' },
];
const PP = byId(P_PICK);
const PW = byId(P_WHO);
const PZ = byId(P_ZERO);
/** The pillar the rule places for crews A and B (`smallest`), or the test of a distance (`any`). */
const k1Place = (rule, A, B) => (rule.zero === 'with' ? 0 : PW[rule.who].step(A, B));
function k1Says(rule, c) {
  const step = PW[rule.who].step(c.A, c.B);
  if (rule.pick === 'smallest') return c.d === k1Place(rule, c.A, c.B);
  return c.d % step === 0 && (rule.zero === 'with' || c.d > 0);
}
const isK1Rule = (rule) => rule?.pick === 'smallest' && rule?.who === 'both' && rule?.zero === 'without';
/**
 * The pairs of the mirror: the quay, and two free pairs whose first pillar is not their product — 16 and 38 (304, purse
 * 53), 14 and 46 (322, purse 59) — in no bank, no story, not the dash's (proof script, « The mirrors' own cases »).
 */
const K1_FREE = [
  [16, 38],
  [14, 46],
];
const K1_PAIRS = [PI.crews, ...K1_FREE];
const K1_POOL = lazy(() =>
  K1_PAIRS.flatMap(([A, B]) => {
    const L = lcm(A, B);
    const ds = new Set([0, A, B, A + B, gcd(A, B), L, 2 * L, A * B, ...range(1, 4).map((k) => k * Math.max(A, B))]);
    return [...ds].sort((x, y) => x - y).map((d) => k1Case(A, B, d));
  }),
);
const [U1A, U1B] = PI.use;

const pilierForge = {
  key: K.pilier,
  slots: [
    { id: 'pick', label: 'Je pose le pilier à', options: P_PICK },
    { id: 'who', label: 'où finit pile', options: P_WHO.map(({ id, label }) => ({ id, label })) },
    { id: 'zero', label: 'Et la distance 0 ?', options: P_ZERO },
  ],
  says: k1Says,
  isTheRule: isK1Rule,
  ruleText: (rule) =>
    fr(`Je pose le pilier à ${PP[rule.pick].label} où finit pile ${PW[rule.who].label}, ${PZ[rule.zero].label}.`),
  explain(rule, c) {
    const step = PW[rule.who].step(c.A, c.B);
    if (rule.pick === 'any')
      return fr(
        `Ta règle accepte tout pilier où finit pile ${PW[rule.who].label}${rule.zero === 'with' ? ', 0 compris' : ''} : le pilier à ${cells(c.d)} ${k1Says(rule, c) ? 'en est un' : 'n’en est pas un'}.`,
      );
    const at = k1Place(rule, c.A, c.B);
    return fr(
      `Pour des planches de ${nb(c.A)} et de ${nb(c.B)}, ta règle pose le pilier à ${cells(at)}${rule.zero === 'with' ? '' : ` (un pas de ${nb(step)})`} : ${at === c.d ? 'c’est' : 'ce n’est pas'} le pilier à ${cells(c.d)}.`,
    );
  },
  caseId: pillarId,
  // he crossed with 80: island B cannot be reached otherwise
  evidence: fromWalkway({ of: K.pilier, seg: 'pilier-quai', crews: PI.crews, lived: lcm(A1, B1) }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK1Rule(rule)) return firstBreak(K1_POOL(), rule, rows, k1Says, pillarId);
    // a walkway of other planks that is built; pillars of the quay and of 16 / 38 that hold and that the purse refuses
    return hard(
      rows,
      [
        k1Case(16, 38, 304),
        k1Case(A1, B1, 2 * lcm(A1, B1)),
        k1Case(14, 46, 322),
        k1Case(A1, B1, A1 * B1),
        k1Case(16, 38, 608),
      ],
      pillarId,
    );
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [k1Case(16, 38, 304), k1Case(16, 38, 38)] };
    if (n === 2) return { kind: 'experiment', cases: [k1Case(16, 38, 304), k1Case(16, 38, 608)] };
    return { kind: 'experiment', cases: [k1Case(14, 46, 322), k1Case(14, 46, 46)] };
  },
  use: {
    make: () => ({ A: U1A, B: U1B, m: lcm(U1A, U1B), held: true }),
    lines: (c) => [
      line([fr('Le premier pilier qui tient :'), slot('d', 'la distance du pilier', 3), 'cases']),
      line([
        fr(`L’équipe de ${c.A} pose`),
        slot('x', `les planches de ${c.A}`, 2),
        fr(`planches, celle de ${c.B} pose`),
        slot('y', `les planches de ${c.B}`, 2),
        'planches',
      ]),
    ],
    check(c, vals) {
      const d = Number(vals.d);
      if (!Number.isInteger(d) || d < 0) return 'short';
      if (d === 0) return 'shore';
      const t = lay([c.A, c.B], d, null);
      if (!t.holds) return d === Math.max(c.A, c.B) ? 'longer' : 'short';
      if (d !== c.m) return 'nearer';
      return Number(vals.x) === c.m / c.A && Number(vals.y) === c.m / c.B ? 'ok' : 'planks';
    },
    /** The claims this answer makes (not sent by the kit today: a forge's last step is not evidence). */
    claim: (c, vals) => [{ kind: 'ppcm', a: c.A, b: c.B, m: Number(vals.d) }],
  },
  text: frAll({
    ...PILLAR_TEXT,
    title: 'Le miroir des amarres',
    frame: 'Pour bâtir la passerelle avec la bourse :',
    buildLead: `Une carte par colonne : où poses-tu le pilier pour deux équipes et une bourse ? Le miroir reprend tes piliers de ${A1} et ${B1}.`,
    wordsHint: 'Exemple : je pose le pilier…',
    tryKey: (c) =>
      `Des planches de ${c.A} et de ${c.B}. Le miroir ne pose rien : écris le premier pilier qui tient, puis les planches de chaque équipe.`,
    use: {
      shore: 'Un pilier sur le bord : il n’y a pas de passerelle à construire.',
      longer: `L’équipe de ${U1A} s’arrête ${U1B % U1A} cases avant ce pilier.`,
      short: 'À ce pilier, une des deux équipes s’arrête avant : elle ne finit pas pile.',
      nearer: 'Ce pilier tient, mais un pilier plus proche tient déjà.',
      planks: 'Le pilier est juste : compte les planches de chaque équipe jusqu’à lui.',
    },
    useOk: 'Tu as placé le pilier sans poser une seule planche.',
  }),
};

// ───────────────────────── 2. 🧮 ppcm-facteurs — the pillar read on two decompositions ─────────────────────────
// Islands C → D were the experiment (the chantier): 414 = 2 × 3² × 23 and 192 = 2⁶ × 3, 120 coins; only 13 248 is built
// (32 + 69 = 101 planks; 26 496 needs 202). His evidence: every pillar he placed there, and 13 248. On his pair two pairs
// of rules give the same number (6, 138): the mirror's second pair 1 156 = 2² × 17² and 952 = 2³ × 7 × 17, where the six
// rules give six numbers (68, 2 312, 34, 476, 16 184, 238 — only 16 184 is built).

const [A2, B2] = FC.crews;
const k2Case = (A, B, d) => pillarCase(K.facteurs, A, B, d);
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
/** The decomposition a K2 rule writes for A and B: [{ p, e }] (a prime of one number only keeps its own exponent). */
function k2Powers(rule, A, B) {
  const xs = powersOf(A);
  const ys = powersOf(B);
  return FW[rule.which].primes(xs, ys).map((p) => {
    const es = [...xs, ...ys].filter((f) => f.p === p).map((f) => f.e);
    return { p, e: FE[rule.exp].pick(es) };
  });
}
const k2Made = (rule, A, B) => valueOfPowers(k2Powers(rule, A, B));
const k2Says = (rule, c) => k2Made(rule, c.A, c.B) === c.d;
const isK2Rule = (rule) => rule?.which === 'all' && rule?.exp === 'big';
const powOr1 = (fs) => (fs.length ? powTex(fs) : '1');
const [M2A, M2B] = FC.mirror;
const K2_POOL = lazy(() =>
  [FC.crews, FC.mirror].flatMap(([A, B]) => {
    const L = lcm(A, B);
    const ds = new Set([L, 2 * L, A * B, A, B]);
    for (const which of F_WHICH) for (const exp of F_EXP) ds.add(k2Made({ which: which.id, exp: exp.id }, A, B));
    return [...ds].sort((x, y) => x - y).map((d) => k2Case(A, B, d));
  }),
);
const [UX, UY] = FC.use;
const [CP, CQ] = FC.coprime;
const powerTokens = (fs) => fs.flatMap((f, i) => [...(i ? ['×'] : []), f.e === 1 ? String(f.p) : givenPower(f.p, f.e)]);

const facteursForge = {
  key: K.facteurs,
  slots: [
    { id: 'which', label: 'Je multiplie', options: F_WHICH.map(({ id, label }) => ({ id, label })) },
    { id: 'exp', label: 'chacun avec', options: F_EXP.map(({ id, label }) => ({ id, label })) },
  ],
  says: k2Says,
  isTheRule: isK2Rule,
  ruleText: (rule) =>
    fr(
      `Pour le plus petit multiple commun de deux nombres décomposés, je multiplie ${FW[rule.which].label}, chacun avec ${FE[rule.exp].label}.`,
    ),
  explain(rule, c) {
    const fs = k2Powers(rule, c.A, c.B);
    const v = valueOfPowers(fs);
    return fr(
      `$${tx(c.A)} = ${powOr1(powersOf(c.A))}$ et $${tx(c.B)} = ${powOr1(powersOf(c.B))}$ : ta règle donne $${powOr1(fs)} = ${tx(v)}$ ; ${v === c.d ? 'c’est' : 'ce n’est pas'} le pilier à ${cells(c.d)}.`,
    );
  },
  caseId: pillarId,
  // he crossed with 13 248: island D cannot be reached otherwise
  evidence: fromWalkway({ of: K.facteurs, seg: 'pilier-chantier', crews: FC.crews, lived: lcm(A2, B2) }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK2Rule(rule)) return firstBreak(K2_POOL(), rule, rows, k2Says, pillarId);
    // the mirror's pair: 16 184 is built; 2 312 (common primes, larger exponent) leaves a crew short; 32 368 ruins him
    return hard(
      rows,
      [
        k2Case(M2A, M2B, lcm(M2A, M2B)),
        k2Case(M2A, M2B, k2Made({ which: 'common', exp: 'big' }, M2A, M2B)),
        k2Case(M2A, M2B, 2 * lcm(M2A, M2B)),
        k2Case(A2, B2, 2 * lcm(A2, B2)),
      ],
      pillarId,
    );
  },
  nudge(n) {
    const L = lcm(M2A, M2B);
    if (n === 1) return { kind: 'experiment', cases: [k2Case(M2A, M2B, L), k2Case(M2A, M2B, 68)] };
    if (n === 2) return { kind: 'experiment', cases: [k2Case(M2A, M2B, L), k2Case(M2A, M2B, 476)] };
    return { kind: 'experiment', cases: [k2Case(M2A, M2B, L), k2Case(M2A, M2B, 2312)] };
  },
  use: {
    make: () => {
      const A = valueOfPowers(UX);
      const B = valueOfPowers(UY);
      const big = lcmPowers(UX, UY);
      return { A, B, xs: UX, ys: UY, big, m: valueOfPowers(big), n: valueOfPowers([...CP, ...CQ]), held: true };
    },
    lines: (c) => [
      line([fr('Les deux nombres :'), ...powerTokens(c.xs), 'et', ...powerTokens(c.ys)]),
      line([
        fr('Leur plus petit multiple commun :'),
        powerBox(2, 'e2'),
        '×',
        '7',
        '×',
        powerBox(11, 'e11'),
        '=',
        slot('m', 'le plus petit multiple commun', 4),
      ]),
      line([
        fr('Le plus petit multiple commun de'),
        givenPower(CP[0].p, CP[0].e),
        'et de',
        givenPower(CQ[0].p, CQ[0].e),
        '=',
        slot('n', 'le plus petit multiple commun', 3),
      ]),
    ],
    check(c, vals) {
      const e = (p) => Number(vals[`e${p}`]);
      const want = (p) => c.big.find((f) => f.p === p).e;
      for (const p of [2, 11]) {
        if (!(e(p) >= want(p))) return `e${p}low`;
        if (e(p) > want(p)) return `e${p}high`;
      }
      if (Number(vals.m) !== c.m) return 'value';
      const n = Number(vals.n);
      const [a, b] = [valueOfPowers(CP), valueOfPowers(CQ)];
      if (!(n >= 1) || n % a || n % b) return 'coprimeNot';
      return n === c.n ? 'ok' : 'coprimeBig';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, vals) => [
      {
        kind: 'factorization',
        a: c.m,
        factors: c.big.map((f) => ({ p: f.p, e: f.p === 7 ? 1 : Number(vals[`e${f.p}`]) })),
      },
      { kind: 'ppcm', a: c.A, b: c.B, m: Number(vals.m) },
      { kind: 'ppcm', a: valueOfPowers(CP), b: valueOfPowers(CQ), m: Number(vals.n) },
    ],
  },
  text: frAll({
    ...PILLAR_TEXT,
    title: 'Le miroir des brumes',
    eq: (c) =>
      c.d >= 2
        ? `$${tx(c.A)} = ${powOr1(powersOf(c.A))} \\qquad ${tx(c.B)} = ${powOr1(powersOf(c.B))} \\qquad ${tx(c.d)} = ${powOr1(powersOf(c.d))}$`
        : `$${tx(c.A)} = ${powOr1(powersOf(c.A))} \\qquad ${tx(c.B)} = ${powOr1(powersOf(c.B))}$`,
    frame: 'Pour écrire le plus petit multiple commun de deux nombres décomposés :',
    buildLead: `Une carte par colonne : comment lis-tu le pilier sur les deux décompositions ? Le miroir reprend tes piliers de ${nb(A2)} et ${nb(B2)}.`,
    wordsHint: 'Exemple : je garde…',
    tryKey: () =>
      'Le miroir ne pose rien : avec ta règle, écris le plus petit multiple commun de ces deux nombres en facteurs premiers, puis sa valeur.',
    use: {
      e2low: 'Ce produit a moins de facteurs 2 que le premier nombre : ce n’en est pas un multiple.',
      e2high:
        'Ce produit est bien un multiple des deux nombres, mais avec moins de facteurs 2, un plus petit l’est aussi.',
      e11low: 'Ce produit a moins de facteurs 11 que le second nombre : ce n’en est pas un multiple.',
      e11high:
        'Ce produit est bien un multiple des deux nombres, mais avec moins de facteurs 11, un plus petit l’est aussi.',
      value: 'Les exposants sont justes : calcule le produit.',
      coprimeNot: `Ce nombre n’est pas à la fois un multiple de ${valueOfPowers(CP)} et de ${valueOfPowers(CQ)}.`,
      coprimeBig: `C’est un multiple de ${valueOfPowers(CP)} et de ${valueOfPowers(CQ)}, mais un plus petit l’est aussi.`,
    },
    useOk: 'Tu lis le pilier sur deux décompositions, sans poser une planche.',
  }),
};

// ───────────────────────── 3. 🔁 traduire-rendez-vous — a story read back ─────────────────────────
// The mirror of E keeps its experiment (`crews` / `story`, inquiries.js): two wheels of 32 and 20 teeth, then a line every
// 10 min and a shuttle every 46 min from 6 h 10. A case is a CLAIM about one story:
//   meet   « the two meet again for the first time after d »   held: d = the first meeting (160 teeth, 230 min)
//   turns  « the rhythm `who` has repeated n times then »       held: n × who = the first meeting
//   clock  « they leave together again at h h min »            held: the start + the first meeting
// His evidence: every pillar he placed in each story, the pillar that held, and every value he read back.

const STORY_UNITS = { gears: ['dent', 'dents'], bus: ['min', 'min'] };
const storyOf = (id) => STORIES[id];
/** « Roues de 32 et 20 dents » · « Bus de 10 et 46 min ». */
const amount = (id, n) => counted(n, STORY_UNITS[id]);
/** A story in an evidence row: « Roues de 32 et 20 » · « Bus de 10 et 46 ». */
const shortName = (id) => `${id === 'gears' ? 'Roues' : 'Bus'} de ${STORIES[id].a} et ${STORIES[id].b}`;
/** Who meets: « les marques » (the wheels) · « les deux bus ». */
const SUBJECT = { gears: 'les marques', bus: 'les deux bus' };
const meetTag = (s, d) =>
  d === 0
    ? 'le départ'
    : d === s.first
      ? 'la 1re fois'
      : d % s.a === 0 && d % s.b === 0
        ? 'déjà avant'
        : 'pas ensemble';
function meetCase(id, d) {
  const s = storyOf(id);
  const held = d === s.first;
  return {
    of: K.rendezvous,
    kind: 'meet',
    story: id,
    a: s.a,
    b: s.b,
    v: d,
    held,
    tag: meetTag(s, d),
    // short: an evidence row holds two lines, the datum whole (gate B 2026-11-26: « … pour la… » cut by the clamp)
    text: fr(`${shortName(id)} : 1re fois à ${amount(id, d)}`),
  };
}
function turnsCase(id, who, n) {
  const s = storyOf(id);
  const unit = id === 'gears' ? ['tour', 'tours'] : ['départ', 'départs'];
  return {
    of: K.rendezvous,
    kind: 'turns',
    story: id,
    a: s.a,
    b: s.b,
    who,
    v: n,
    held: n * who === s.first,
    tag: amount(id, n * who),
    text: fr(`${id === 'gears' ? 'Roue' : 'Bus'} de ${who} : ${counted(n, unit)} à la 1re rencontre`),
  };
}
const minutesOf = ([h, m]) => h * 60 + m;
function clockCase(at) {
  const s = storyOf('bus');
  const t = minutesOf(at) - minutesOf(s.start);
  return {
    of: K.rendezvous,
    kind: 'clock',
    story: 'bus',
    a: s.a,
    b: s.b,
    v: minutesOf(at),
    at,
    // the two lines as lanes from the start, the pillar at the minutes since it (forgeCrews.jsx › c.walk)
    ...(Number.isInteger(t) && t > 0 ? { walk: { crews: [s.a, s.b], d: t } } : {}),
    held: t === s.first,
    tag: t > 0 && t % s.a === 0 && t % s.b === 0 ? (t === s.first ? 'ensemble' : 'déjà avant') : 'pas ensemble',
    text: fr(`Bus partis à ${clockFr(...s.start)} : ensemble à ${clockFr(...at)}`),
  };
}
const k3Id = (c) => `${c.of}:${c.story}:${c.kind}:${c.who ?? ''}:${c.v}`;
const R_WHEN = [
  { id: 'lcm', label: 'leur plus petit multiple commun', of: (a, b) => lcm(a, b) },
  { id: 'product', label: 'leur produit', of: (a, b) => a * b },
  { id: 'gcd', label: 'leur plus grand diviseur commun', of: (a, b) => gcd(a, b) },
];
const R_TIMES = [
  { id: 'own', label: 'ce nombre ÷ son propre rythme', by: (c) => c.who },
  { id: 'other', label: 'ce nombre ÷ le rythme de l’autre', by: (c) => (c.who === c.a ? c.b : c.a) },
];
const RW = byId(R_WHEN);
const RT = byId(R_TIMES);
/** What a K3 rule says the story does: its meeting, the repetitions of `who`, the clock time. */
function k3Value(rule, c) {
  const when = RW[rule.when].of(c.a, c.b);
  if (c.kind === 'meet') return when;
  if (c.kind === 'turns') return when / RT[rule.times].by(c);
  return minutesOf(storyOf('bus').start) + when;
}
const k3Says = (rule, c) => k3Value(rule, c) === c.v;
const isK3Rule = (rule) => rule?.when === 'lcm' && rule?.times === 'own';
const K3_POOL = lazy(() =>
  ['gears', 'bus'].flatMap((id) => {
    const s = storyOf(id);
    const whens = R_WHEN.map((w) => w.of(s.a, s.b));
    const out = whens.map((d) => meetCase(id, d));
    for (const who of [s.a, s.b])
      for (const w of whens)
        for (const by of [s.a, s.b]) if (Number.isInteger(w / by)) out.push(turnsCase(id, who, w / by));
    if (id === 'bus') for (const w of whens) out.push(clockCase(clockAfter(w)));
    return out;
  }),
);
/** Why the story did what it did with a claim — a PLAIN sentence. */
function k3Why(c) {
  const s = storyOf(c.story);
  if (c.kind === 'meet') {
    if (c.v === 0) return `au départ, ${SUBJECT[c.story]} sont ensemble : rien n’est encore passé`;
    if (c.held) return `après ${amount(c.story, c.v)}, ${SUBJECT[c.story]} se retrouvent pour la première fois`;
    if (c.tag === 'déjà avant')
      return `après ${amount(c.story, c.v)}, ${SUBJECT[c.story]} se retrouvent, mais ${c.story === 'gears' ? 'elles s’étaient déjà retrouvées' : 'ils s’étaient déjà retrouvés'} avant`;
    return `après ${amount(c.story, c.v)}, ${SUBJECT[c.story]} ne sont pas ensemble`;
  }
  if (c.kind === 'turns') {
    const total = c.v * c.who;
    return `${nb(c.v)} fois ${amount(c.story, c.who)}, c’est ${amount(c.story, total)}${total === s.first ? ' : la première rencontre' : `, et non ${amount(c.story, s.first)}`}`;
  }
  const t = c.v - minutesOf(s.start);
  if (c.held) return `à ${clockFr(...c.at)}, les deux bus repartent ensemble pour la première fois`;
  if (t <= 0) return `à ${clockFr(...c.at)}, les bus ne sont pas encore partis`;
  if (c.tag === 'déjà avant')
    return `à ${clockFr(...c.at)}, ils repartent ensemble, mais ils l’avaient déjà fait avant`;
  return `à ${clockFr(...c.at)}, les deux bus ne partent pas ensemble`;
}
const [GA, GB] = ST.gears;
/** « de l’équipe 1 » · « des équipes 1 et 2 » (never « de les équipes », gate B 2026-11-26). */
const deTeamsFr = (teams) => (teams.length === 1 ? `de ${teamsFr(teams)}` : `des ${teamsFr(teams).slice(4)}`);

const rendezvousForge = {
  key: K.rendezvous,
  /** He translates two stories into crews and reads them back (inquiries.js): his pillars and his answers are his evidence. */
  inquiry: STORY_INQUIRY,
  fromInquiry: (result) => {
    const rows = result.rounds.flatMap((r, ri) => {
      const id = ri === 0 ? 'gears' : 'bus';
      const s = storyOf(id);
      const pillars = [...r.pillars.map((p) => p.d), ...(r.d != null ? [r.d] : [])].map((d) => meetCase(id, d));
      const said = r.said.flatMap((x) => {
        if (id === 'bus') {
          const h = Number(x.said?.h);
          const m = Number(x.said?.min);
          return Number.isInteger(h) && Number.isInteger(m) && m < 60 ? [clockCase([h, m])] : [];
        }
        const n = Number(x.said);
        if (x.said == null || x.said === '' || !Number.isInteger(n) || n < 0) return [];
        if (x.id === 'teeth') return [meetCase(id, n)];
        return [turnsCase(id, x.id === 'turnsA' ? s.a : s.b, n)];
      });
      return [...pillars, ...said];
    });
    return { rows: rows.filter((c, i) => rows.findIndex((x) => k3Id(x) === k3Id(c)) === i) };
  },
  slots: [
    { id: 'when', label: 'Ils se retrouvent après', options: R_WHEN.map(({ id, label }) => ({ id, label })) },
    { id: 'times', label: 'Les répétitions de chacun', options: R_TIMES.map(({ id, label }) => ({ id, label })) },
  ],
  says: k3Says,
  isTheRule: isK3Rule,
  ruleText: (rule) =>
    fr(
      `Ils se retrouvent après ${RW[rule.when].label} ; le nombre de fois que chacun s’est répété, c’est ${RT[rule.times].label}.`,
    ),
  explain(rule, c) {
    const s = storyOf(c.story);
    const when = RW[rule.when].of(s.a, s.b);
    if (c.kind === 'meet')
      return fr(
        `Ta règle donne ${amount(c.story, when)} : ${when === c.v ? 'c’est' : 'ce n’est pas'} ${amount(c.story, c.v)}.`,
      );
    if (c.kind === 'turns') {
      const by = RT[rule.times].by(c);
      const v = when / by;
      if (!Number.isInteger(v))
        return fr(
          `Ta règle divise ${nb(when)} par ${nb(by)} : la division ne tombe pas juste, ce n’est pas ${nb(c.v)}.`,
        );
      return fr(
        `Ta règle donne $${tx(when)} \\div ${tx(by)} = ${tx(v)}$ : ${v === c.v ? 'c’est' : 'ce n’est pas'} ${nb(c.v)}.`,
      );
    }
    const at = clockAfter(when);
    return fr(
      `Ta règle donne ${amount('bus', when)} après ${clockFr(...s.start)}, soit ${clockFr(...at)} : ${minutesOf(at) === c.v ? 'c’est' : 'ce n’est pas'} ${clockFr(...c.at)}.`,
    );
  },
  caseId: k3Id,
  evidence: gather({ own: (row) => row.of === K.rendezvous, fromRow: () => [], caseId: k3Id }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK3Rule(rule)) return firstBreak(K3_POOL(), rule, rows, k3Says, k3Id);
    // the buses' repetitions he never read back (23 and 5 departures), and the products that come too late
    const s = storyOf('bus');
    return hard(
      rows,
      [
        turnsCase('bus', s.a, s.first / s.a),
        meetCase('bus', s.a * s.b),
        turnsCase('bus', s.b, s.first / s.b),
        turnsCase('bus', s.b, s.first / s.a),
        meetCase('gears', GA * GB),
      ],
      k3Id,
    );
  },
  nudge(n) {
    const s = storyOf('bus');
    if (n === 1)
      return {
        kind: 'experiment',
        cases: [turnsCase('bus', s.b, s.first / s.b), turnsCase('bus', s.b, s.first / s.a)],
      };
    if (n === 2)
      return {
        kind: 'experiment',
        cases: [turnsCase('bus', s.a, s.first / s.a), turnsCase('bus', s.a, s.first / s.b)],
      };
    return { kind: 'experiment', cases: [turnsCase('bus', s.a, s.first / s.a), meetCase('bus', gcd(s.a, s.b))] };
  },
  use: {
    make: () => ({ A: GA, B: GB, g: gcd(GA, GB), m: lcm(GA, GB), held: true }),
    lines: (c) => {
      const tools = [
        { id: 'pgcd', text: 'PGCD' },
        { id: 'multiple', text: 'plus petit multiple commun' },
      ];
      return [
        line([
          fr(
            `Deux baguettes de ${c.A} cm et ${c.B} cm, coupées sans chute en morceaux égaux, les plus longs possible :`,
          ),
          choiceBox('t1', 'l’outil des baguettes', tools),
          '=',
          slot('v1', 'la longueur d’un morceau', 3),
          'cm',
        ]),
        line([
          fr(`Deux roues de ${c.A} et ${c.B} dents : les marques de nouveau face à face après`),
          choiceBox('t2', 'l’outil des roues', tools),
          '=',
          slot('v2', 'le nombre de dents', 3),
          'dents',
        ]),
      ];
    },
    check(c, vals) {
      if (vals.t1 !== 'pgcd') return 'rodsTool';
      const v1 = Number(vals.v1);
      if (!(v1 >= 1) || c.A % v1 || c.B % v1) return 'rodsNot';
      if (v1 !== c.g) return 'rodsLonger';
      if (vals.t2 !== 'multiple') return 'gearsTool';
      const v2 = Number(vals.v2);
      if (!(v2 >= 1) || v2 % c.A || v2 % c.B) return 'gearsNot';
      return v2 === c.m ? 'ok' : 'gearsBefore';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, vals) => [
      { kind: 'pgcd', a: c.A, b: c.B, g: Number(vals.v1) },
      { kind: 'ppcm', a: c.A, b: c.B, m: Number(vals.v2) },
    ],
  },
  text: frAll({
    sub: BRIDGE_TEXT.sub,
    title: 'Le miroir des vigies',
    log: 'Tes histoires',
    ask: (c) => `${c.text} : est-ce ce que fait l’histoire ?`,
    fact: (c) => `${cap(k3Why(c))}.`,
    yes: 'Oui',
    no: 'Non',
    next: 'Une autre réponse',
    frame: 'Deux rythmes partent ensemble :',
    buildLead:
      'Une carte par colonne : quand deux rythmes partis ensemble se retrouvent-ils, et combien de fois chacun s’est-il répété ?',
    testing: 'Le miroir reprend tes réponses une par une…',
    says: (yes) => `Ta règle : ${yn(yes)}`,
    refuted: (m) => `Ta règle dit « ${yn(m.says)} » pour « ${m.text} », mais ${uncap(k3Why(m))}.`,
    agreed: 'Ta règle est d’accord avec tes deux histoires. Le miroir la met maintenant au défi.',
    attack: (c) => `Le miroir met ta règle au défi : « ${c.text} ». Est-ce ce que fait l’histoire ?`,
    fire: 'L’histoire répond',
    survived: 'Ta règle a tenu : les histoires ont fait ce qu’elle disait.',
    broken: (yes) => `Ta règle a cédé : elle disait « ${yn(yes)} », et l’histoire a dit « ${yn(!yes)} ».`,
    wordsHint: 'Exemple : ils se retrouvent après…',
    compare: () => 'Compare ces deux réponses à la même histoire : laquelle est ce que fait l’histoire ?',
    experiment: 'Regarde bien : la même histoire, deux réponses. Laquelle tient ?',
    tryKey: (c) =>
      `Les mêmes nombres ${c.A} et ${c.B}, deux histoires. Pour chacune : PGCD ou plus petit multiple commun ? Puis sa valeur.`,
    use: {
      rodsTool: `Un morceau de ${lcm(GA, GB)} cm ne se coupe pas dans une baguette de ${GA} cm.`,
      rodsNot: 'Des morceaux de cette longueur ne se coupent pas sans chute dans les deux baguettes.',
      rodsLonger: 'Ces morceaux se coupent sans chute, mais des morceaux plus longs aussi.',
      gearsTool: `Après ${gcd(GA, GB)} dents, aucune des deux roues n’a fait un tour.`,
      gearsNot: 'Après ce nombre de dents, une des deux marques n’est pas revenue à sa place.',
      gearsBefore: 'Les marques s’y retrouvent, mais elles s’étaient déjà retrouvées avant.',
    },
    useOk: 'Deux histoires, deux outils : tu as choisi le bon à chaque fois.',
  }),
};

// ───────────────────────── 4. ⏳ cinq-equipes — the next day all the teams work ─────────────────────────
// The mirror of F keeps its experiment (`crews` / `days`, inquiries.js): five teams, team x works 1 day then sleeps x days,
// all at work on day 1. A case is ONE day for some teams: held = it is the first day after day 1 when they all work
// (`crews.js › daysFact` — `first`). His evidence: per stage, the day he said, the day they met, and the days the run
// stopped on (four of five at work, one asleep).

const sleepOf = (team) => DY.sleeps[team - 1];
function dayCase(teams, day) {
  const cycles = teams.map((t) => sleepOf(t) + 1);
  const f = daysFact(cycles, day);
  const tag =
    f.kind === 'first'
      ? 'ensemble'
      : f.kind === 'again'
        ? 'pas la 1re'
        : f.kind === 'start'
          ? 'le départ'
          : f.idle.length === 1
            ? `éq. ${teams[f.idle[0]]} dort`
            : `${f.idle.length} dorment`; // one sleeper named (gate B); a tag ≤ 12
  return {
    of: K.equipes,
    teams,
    day,
    sleeps: teams.map(sleepOf),
    held: f.kind === 'first',
    idle: f.idle.map((i) => teams[i]),
    kind: f.kind,
    tag,
    text: fr(`${cap(teamsFr(teams))}, le jour\u00a0${nb(day)}`),
    days: { cycles, day },
  };
}
const dayId = (c) => `${c.of}:${c.teams.join('-')}:${c.day}`;
const D_WHAT = [
  { id: 'lcm', label: 'le plus petit multiple commun', of: (xs) => lcmOf(xs) },
  { id: 'product', label: 'le produit', of: (xs) => xs.reduce((p, x) => p * x, 1) },
];
const D_OF = [
  { id: 'both', label: 'jours de travail et de sommeil', of: (c) => c.sleeps.map((s) => s + 1) },
  { id: 'sleep', label: 'jours de sommeil', of: (c) => c.sleeps },
];
const D_ADD = [
  { id: 'plus', label: '1 + ce nombre', add: 1 },
  { id: 'same', label: 'ce nombre', add: 0 },
];
const DW = byId(D_WHAT);
const DO = byId(D_OF);
const DA = byId(D_ADD);
const k4Value = (rule, c) => DA[rule.add].add + DW[rule.what].of(DO[rule.of].of(c));
const k4Says = (rule, c) => k4Value(rule, c) === c.day;
const isK4Rule = (rule) => rule?.what === 'lcm' && rule?.of === 'both' && rule?.add === 'plus';
/** Who is asleep that day — a PLAIN sentence. */
function dayWhy(c) {
  if (c.kind === 'start') return 'le jour 1, c’est le départ : toutes travaillent, 0 jour depuis le départ';
  if (c.kind === 'first')
    return `le jour ${nb(c.day)}, ${teamsFr(c.teams)} travaillent ensemble pour la première fois depuis le jour 1`;
  if (c.kind === 'again')
    return `le jour ${nb(c.day)}, ${teamsFr(c.teams)} travaillent ensemble, mais elles l’avaient déjà fait avant`;
  return `le jour ${nb(c.day)}, ${teamsFr(c.idle)} ${c.idle.length < 2 ? 'dort' : 'dorment'}`;
}
/** Every set of two teams or more of the five. */
const TEAM_SETS = range(1, 31)
  .map((mask) => [1, 2, 3, 4, 5].filter((t, i) => mask & (1 << i)))
  .filter((ts) => ts.length >= 2);
const K4_POOL = lazy(() =>
  TEAM_SETS.flatMap((teams) => {
    const probe = dayCase(teams, 2);
    const ds = new Set();
    for (const what of D_WHAT)
      for (const of of D_OF) for (const add of D_ADD) ds.add(k4Value({ what: what.id, of: of.id, add: add.id }, probe));
    return [...ds].filter((d) => d >= 2).map((d) => dayCase(teams, d));
  }),
);
const TRIO = DY.trio.map((s) => s + 1);
const TRIO_BIG = powersOf(lcmOf(TRIO));

const equipesForge = {
  key: K.equipes,
  /** He runs the five teams day by day (inquiries.js): his days, the meetings and the stops are his evidence. */
  inquiry: DAYS_INQUIRY,
  fromInquiry: (result) => {
    const rows = result.stages.flatMap((st) => [
      dayCase(st.teams, st.day),
      ...(Number.isInteger(st.said) && st.said >= 2 ? [dayCase(st.teams, st.said)] : []),
      ...(st.sleepers ?? []).map((x) => dayCase(st.teams, x.day)),
    ]);
    return { rows: rows.filter((c, i) => rows.findIndex((x) => dayId(x) === dayId(c)) === i) };
  },
  slots: [
    { id: 'what', label: 'Je calcule', options: D_WHAT.map(({ id, label }) => ({ id, label })) },
    { id: 'of', label: 'de leurs', options: D_OF.map(({ id, label }) => ({ id, label })) },
    { id: 'add', label: 'Le jour cherché, c’est', options: D_ADD.map(({ id, label }) => ({ id, label })) },
  ],
  says: k4Says,
  isTheRule: isK4Rule,
  ruleText: (rule) =>
    fr(
      `Je calcule ${DW[rule.what].label} de leurs ${DO[rule.of].label} ; le jour cherché, c’est ${DA[rule.add].label}.`,
    ),
  explain(rule, c) {
    const v = k4Value(rule, c);
    return fr(
      `Pour ${teamsFr(c.teams)}, ta règle donne le jour ${nb(v)} : ${v === c.day ? 'c’est' : 'ce n’est pas'} le jour ${nb(c.day)}.`,
    );
  },
  caseId: dayId,
  evidence: gather({ own: (row) => row.of === K.equipes, fromRow: () => [], caseId: dayId }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isK4Rule(rule)) return firstBreak(K4_POOL(), rule, rows, k4Says, dayId);
    // two teams he never ran alone: 1 and 3 meet on day 5 (day 9 is not the first time); 2 and 4 on day 16 (not 15)
    return hard(rows, [dayCase([1, 3], 5), dayCase([1, 3], 9), dayCase([2, 4], 16), dayCase([2, 4], 15)], dayId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [dayCase([1, 3], 5), dayCase([1, 3], 4)] };
    if (n === 2) return { kind: 'experiment', cases: [dayCase([2, 4], 16), dayCase([2, 4], 15)] };
    return { kind: 'experiment', cases: [dayCase([1, 4], 11), dayCase([1, 4], 7)] };
  },
  use: {
    make: () => ({ sleeps: DY.trio, cycles: TRIO, big: TRIO_BIG, m: lcmOf(TRIO), day: 1 + lcmOf(TRIO), held: true }),
    lines: (c) => [
      line([
        fr('Les jours de travail et de sommeil réunis : A'),
        slot('ca', 'les jours de A', 2),
        'B',
        slot('cb', 'les jours de B', 2),
        'C',
        slot('cc', 'les jours de C', 2),
      ]),
      line([
        fr('En facteurs premiers, leur plus petit multiple commun :'),
        powerBox(2, 'e2'),
        ...c.big.filter((f) => f.p !== 2).flatMap((f) => ['×', String(f.p)]),
        '=',
        slot('m', 'le plus petit multiple commun', 4),
      ]),
      line([fr('Elles retravaillent toutes ensemble le jour'), slot('day', 'le jour', 4)]),
    ],
    check(c, vals) {
      const typed = ['ca', 'cb', 'cc'].map((k) => Number(vals[k]));
      if (typed.some((v, i) => v !== c.cycles[i])) return typed.some((v, i) => v === c.sleeps[i]) ? 'sleeps' : 'cycle';
      const e2 = Number(vals.e2);
      const want = c.big.find((f) => f.p === 2).e;
      if (!(e2 >= want)) return 'e2low';
      if (e2 > want) return 'e2high';
      if (Number(vals.m) !== c.m) return 'value';
      const day = Number(vals.day);
      const f = daysFact(c.cycles, day);
      if (f.kind === 'first') return 'ok';
      if (f.kind === 'nan') return 'nanDay';
      return f.kind;
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, vals) => [
      { kind: 'ppcm', a: c.cycles[0], b: c.cycles[1], more: c.cycles.slice(2), m: Number(vals.m) },
      { kind: 'ppcm', a: c.cycles[0], b: c.cycles[1], more: c.cycles.slice(2), m: Number(vals.day) - 1 },
    ],
  },
  text: frAll({
    sub: BRIDGE_TEXT.sub,
    title: 'Le miroir des fanaux',
    log: 'Tes jours',
    ask: (c) => `${c.text} : travaillent-elles toutes ensemble pour la première fois depuis le jour 1 ?`,
    fact: (c) => `${cap(dayWhy(c))}.`,
    yes: 'Oui',
    no: 'Non',
    next: 'Un autre jour',
    frame: 'Des équipes qui travaillent 1 jour puis dorment, toutes au travail le jour 1 :',
    buildLead:
      'Une carte par colonne : quel est le prochain jour où toutes les équipes travaillent ensemble ? Le miroir reprend tes jours.',
    testing: 'Le miroir reprend tes jours un par un…',
    says: (yes) => `Ta règle : ${yn(yes)}`,
    refuted: (m) =>
      `Ta règle dit que le jour ${nb(m.day)} ${m.says ? 'est' : 'n’est pas'} le prochain jour ensemble ${deTeamsFr(m.teams)}, mais ${dayWhy(m)}.`,
    agreed: 'Ta règle est d’accord avec tous tes jours. Le miroir la met maintenant au défi avec d’autres équipes.',
    attack: (c) =>
      `Le miroir met ta règle au défi : ${teamsFr(c.teams)}, le jour ${nb(c.day)}. Est-ce leur prochain jour ensemble ?`,
    fire: 'Lance les jours',
    survived: 'Ta règle a tenu : les équipes ont fait ce qu’elle disait.',
    broken: (yes) => `Ta règle a cédé : elle disait « ${yn(yes)} », et les équipes ont dit « ${yn(!yes)} ».`,
    wordsHint: 'Exemple : je calcule…',
    compare: (cases) =>
      `Compare ces deux jours pour ${teamsFr(cases[0].teams)} : lequel est leur prochain jour ensemble ?`,
    experiment: 'Regarde bien : les mêmes équipes, deux jours. Qui dort ?',
    tryKey: (c) =>
      `Trois équipes travaillent le jour 1. Chacune travaille 1 jour puis dort : A ${c.sleeps[0]} jours, B ${c.sleeps[1]}, C ${c.sleeps[2]}. Le miroir ne lance pas les jours.`,
    use: {
      sleeps: 'Une équipe qui travaille 1 jour puis dort 1 jour retravaille le jour 3 : elle revient tous les 2 jours.',
      cycle: 'Compte les jours d’un tour de chaque équipe : son jour de travail et ses jours de sommeil.',
      e2low:
        'Avec trop peu de facteurs 2, ce produit n’est pas un multiple du cycle de l’équipe A : ce jour-là, elle dort.',
      e2high: 'Ce produit contient bien les trois rythmes, mais un plus petit les contient déjà.',
      value: 'Les exposants sont justes : calcule le produit.',
      none: 'Ce jour-là, les trois équipes dorment.',
      some: 'Ce jour-là, une équipe au moins dort.',
      again: 'Elles travaillent ensemble ce jour-là, mais ce n’est pas la première fois depuis le jour 1.',
      start: 'Le jour 1, c’est le départ : 0 jour depuis le départ.',
      nanDay: 'Écris un jour : un nombre entier à partir de 1.',
    },
    useOk: 'Trois équipes, un seul calcul : tu as trouvé le jour sans lancer les jours.',
  }),
};

/** The forges, by key, in the order of the story (world/index.js › lesson.forges). */
export const FORGES = {
  [K.pilier]: pilierForge,
  [K.facteurs]: facteursForge,
  [K.rendezvous]: rendezvousForge,
  [K.equipes]: equipesForge,
};
