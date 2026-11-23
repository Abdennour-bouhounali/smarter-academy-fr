/**
 * THE FOUR FORGES of lesson « Décomposer un nombre en facteurs premiers » — one per key, in the order of the story; no
 * rule of this lesson is told (frame: kit/forge.js; the cases are drawn by divisorIsles/forgeParts.jsx). Each forge:
 * an experiment of the rule's own nature (or, for a writing convention, none) → he writes his rule with tiles → the
 * mirror tests it on HIS evidence → attacks it → seal → a last step where he USES it → only then the tablet names it.
 * Exactly ONE rule of each forge holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one.
 *
 *   plus-petit-premier  🪜 island C — experiment `ladder · factor` on 60, 72, 495 (inquiries.js). A case is a LADDER of a
 *                       number (`c.factor`): what the world does (`held`) is « it goes to the end » — it reaches 1 and no
 *                       plank laid breaks into shorter planks (every plank is prime). A rule (which plank × a plank that
 *                       held × when to stop — 2 × 2 × 2 = 8 rules) SAYS « I lay these planks » of a ladder when it lays
 *                       the same planks (in any order) on that number. Last step: the ladder of 126, typed.
 *   puissances          🔢 island D — NO experiment (a writing convention has no honest one). A case is a WRITING of a
 *                       number with raised numbers, « 72 = 2³ × 3² », drawn as the ladder of that number; `held` is « it
 *                       counts that ladder's planks » (each prime with how many times it comes). A rule is a READING of the
 *                       raised number (4 readings × 2 signs = 8 rules); it says « it gives the number back ». The evidence
 *                       is the ladders of key 1 (60, 72, 495 — his numbers, written by the mirror) and the plank of 8 he
 *                       crossed 1 400 with (8 = 2 × 2 × 2). Last step: 1 400 = 2^□ × 5^□ × 7, then one reading yes / no.
 *   arret               🛑 island E — experiment `pairs` on 91, 97, 221 (ported from the Algerian `qawasim-adad-tabii`,
 *                       key 3). A case is a plank d asked of a number n: « to know whether n is prime, must d be tried? »;
 *                       `held` = d is prime and d × d ⩽ n (any other plank teaches nothing new: a composite plank is
 *                       made of shorter planks already tried, and a plank whose square passes n has a partner shorter
 *                       than itself, already tried). Rules: which numbers × what is measured × against what — 3 × 3 × 2 =
 *                       18. Last step: « 143 est premier » yes / no, then 143 = □ × □.
 *   tableur             📊 island F — experiment `sheet` on 2 431, 4 641, 3 127. A case is a large number and the numbers a
 *                       reading of the sheet gives for it (drawn as its ladder); `held` = they are all prime (their
 *                       product is always the number). Rules: when it is prime × what to do on a line of remainder 0 —
 *                       3 × 2 = 6. Last step: the trace of a program, then the decomposition of 4 641.
 * The tiles let him write the false rules students really hold (`forges.test.js`, « the rules students really hold »).
 * No sentence of a forge before its last step names its key or states its rule (`describeForges › forbidden`).
 *
 * How key 2 gets key 1's ladders: the engine gives a forge only the world's log of bridges (`Game.openForge` passes
 * `crossing()`, rows `{ a, b }`); the result of another forge's experiment is NOT kept (`Game.sealRule` keeps the rule,
 * not the experiment). So key 2 reads its 8 from the log (the bridge of 1 400 with the plank of 8) and writes the ladders
 * of 60, 72 and 495 — the numbers the story guarantees he decomposed in key 1 — as the key-1 rule lays them (`lived`).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  firstBreak,
  gather,
  hard,
  judge,
  lazy,
  line,
  noPredictions,
  powerBox,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { factorRungs } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { BRIDGE_TEXT, outcome, pickWith } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { factorizationOf } from './evidence';
import { LADDER_INQUIRY, SHEET_INQUIRY, STOP_INQUIRY } from './inquiries';
import {
  NUMBERS,
  counted,
  fr,
  frAll,
  isPrime,
  listFr,
  nb,
  planksOf,
  powText,
  powTex,
  powersOf,
  primeFactors,
  productTex,
  smallestPrime,
  stopOf,
  tx,
  valueOfPowers,
} from './math';
import { K } from './story';

const sorted = (xs) => [...xs].sort((x, y) => x - y).join('.');
const sameNumbers = (xs, ys) => sorted(xs) === sorted(ys);
/** The first unseen hard case the world says « yes » to, and the first it says « no » to. */
const twoHard = (list, caseId) => (rows) => {
  const free = hard(rows, list, caseId);
  return [free.find((c) => c.held), free.find((c) => !c.held)].filter(Boolean);
};
const own = (of) => gather({ own: (row) => row.of === of, fromRow: () => [], caseId: (c) => c.id });
const byCaseId = (c) => c.id;
/**
 * The numbers the mirror may draw (attacks, nudges): none is a number of this lesson (`trainer.js › RESERVED`), none
 * stands in its exercise bank (`forges.test.js` reads the bank). Smooth numbers (their primes ≤ 11, on key 1's rack),
 * primes of two digits and more, large products whose smallest prime is 7 or more.
 */
const SMOOTH = [28, 44, 64, 80, 84, 88, 96, 105, 135, 140, 154, 160, 168, 175, 176, 192, 198, 210, 220, 224, 240, 264];
const PRIMES = [43, 53, 67, 71, 73, 79, 83, 101, 103, 107, 109, 131, 137, 139];
const LARGE = [
  1027, 1067, 1073, 1121, 1147, 1157, 1183, 1207, 1219, 1241, 1243, 1261, 1271, 1309, 1333, 1339, 1349, 1357, 1363,
  1387, 1391, 1403, 1411, 1417, 1441, 1463,
];

// ───────────────────────── 1. 🪜 plus-petit-premier — the ladder ─────────────────────────

const RACK = NUMBERS.ladder.rack;
const WHICH = [
  { id: 'small', label: 'la plus petite planche qui tient', pick: (xs) => Math.min(...xs) },
  { id: 'big', label: 'la plus grande planche qui tient', pick: (xs) => Math.max(...xs) },
];
const AGAIN = [
  { id: 'again', label: 'je la repose tant qu’elle tient', reuse: true },
  { id: 'once', label: 'je passe à la planche suivante', reuse: false },
];
const STOP = [
  { id: 'one', label: '1', done: (x) => x === 1 },
  { id: 'ten', label: 'un nombre plus petit que 10', done: (x) => x < 10 },
];
/** The planks a rule lays on n (from the rack of the experiment), and what is left when it stops. */
function ladderRun(rule, n, tile) {
  const { pick } = tile.which[rule.which];
  const { reuse } = tile.again[rule.again];
  const { done } = tile.stop[rule.stop];
  const used = new Set();
  const planks = [];
  let x = n;
  while (!done(x)) {
    const can = RACK.filter((d) => x % d === 0 && (reuse || !used.has(d)));
    if (!can.length) break;
    const d = pick(can);
    planks.push(d);
    used.add(d);
    x /= d;
  }
  return { planks, left: x };
}
/** The first plank of a ladder that breaks into shorter planks, or null. */
const breaking = (planks) => planks.find((d) => !isPrime(d)) ?? null;
/**
 * A LADDER of n: the planks laid in his (or a rule's) order, each holding on what the ones before left; `fell`, a plank
 * tried on what is left that fell there. `held`: it reaches 1 and none of its planks breaks.
 */
function ladderCase(n, planks, fell = null) {
  const { left } = factorRungs(n, planks);
  const f = fell != null && left >= 2 && left % fell !== 0 ? fell : null;
  const held = left === 1 && planks.every(isPrime);
  const broken = breaking(planks);
  return {
    of: K.ladder,
    id: `${K.ladder}:${n}:${planks.join('.')}${f ? `:${f}` : ''}`,
    n,
    planks,
    left,
    broken,
    held,
    fits: held,
    factor: { n, planks, ...(f ? { fell: f } : {}) },
    tag: held ? 'va au bout' : f ? `${f} tombe` : left > 1 ? `reste ${left}` : `${broken} se casse`,
  };
}
const L_JUDGE = judge({
  slots: [
    { id: 'which', label: 'Sur ce qui reste, je pose', options: WHICH },
    { id: 'again', label: 'Une planche qui a tenu', options: AGAIN },
    { id: 'stop', label: 'Je m’arrête quand il reste', options: STOP },
  ],
  right: { which: 'small', again: 'again', stop: 'one' },
  says: (rule, c, tile) => sameNumbers(ladderRun(rule, c.n, tile).planks, c.planks),
});
const runOf = (rule, n) => ladderRun(rule, n, L_JUDGE.tile);
/** Every ladder the rules of this forge lay on a number, and its ladder by the primes. */
const laddersOf = (n) => {
  const out = new Map();
  for (const which of WHICH)
    for (const again of AGAIN)
      for (const stop of STOP) {
        const { planks } = runOf({ which: which.id, again: again.id, stop: stop.id }, n);
        if (planks.length) out.set(planks.join('.'), planks);
      }
  out.set(primeFactors(n).join('.'), primeFactors(n));
  return [...out.values()].map((p) => ladderCase(n, p));
};
const L_POOL = lazy(() => SMOOTH.flatMap(laddersOf));
const BIG = { which: 'big', again: 'again', stop: 'one' };
const ONCE = { which: 'small', again: 'once', stop: 'one' };
const L_HARD = [
  ladderCase(84, primeFactors(84)),
  ladderCase(84, runOf(BIG, 84).planks),
  ladderCase(88, primeFactors(88)),
  ladderCase(88, runOf(ONCE, 88).planks),
];
const L_NUDGES = [
  [ladderCase(96, primeFactors(96)), ladderCase(96, runOf(BIG, 96).planks)],
  [ladderCase(140, primeFactors(140)), ladderCase(140, runOf(BIG, 140).planks)],
  [ladderCase(135, primeFactors(135)), ladderCase(135, runOf(ONCE, 135).planks)],
];
/** Why a ladder does not go to the end — a fact of the world. */
const notToEnd = (c) =>
  c.left > 1
    ? `l’échelle s’arrête sur ${c.left}, et non sur 1`
    : `la planche de ${c.broken} se casse encore : ${planksOf(c.broken / smallestPrime(c.broken), smallestPrime(c.broken))} la remplissent`;
/** The ladder of the last step: 126, a rung per line — the number on the left, the plank laid on it on the right. */
const L_USE = NUMBERS.ladder.use;
const L_ROWS = primeFactors(L_USE).length;

const ladderForge = {
  key: K.ladder,
  inquiry: LADDER_INQUIRY,
  /**
   * What he did in the experiment: each ladder he laid down to 1 — and, for every round where a plank breaking into
   * shorter ones FELL, the ladder as it stood then with that plank falling (« 4 never holds once the 2s are laid »).
   */
  fromInquiry: (result) => {
    const rows = result.rounds.flatMap((r) => {
      const fall = [...r.attempts].reverse().find((a) => !a.held && !isPrime(a.plank));
      const before = fall
        ? r.attempts
            .slice(0, r.attempts.indexOf(fall))
            .filter((a) => a.held)
            .map((a) => a.plank)
        : [];
      return [ladderCase(r.n, r.planks), ...(fall && before.length ? [ladderCase(r.n, before, fall.plank)] : [])];
    });
    return { rows: rows.filter((c, i) => rows.findIndex((x) => x.id === c.id) === i) };
  },
  ...L_JUDGE,
  ruleText: (rule) =>
    fr(
      `Je pose ${WHICH.find((o) => o.id === rule.which).label} ; ${AGAIN.find((o) => o.id === rule.again).label} ; je m’arrête quand il reste ${STOP.find((o) => o.id === rule.stop).label}.`,
    ),
  explain(rule, c) {
    const r = runOf(rule, c.n);
    const yes = sameNumbers(r.planks, c.planks);
    return fr(
      `Sur ${c.n}, ta règle pose ${listFr(r.planks)}${r.left > 1 ? ` et s’arrête sur ${r.left}` : ' et arrive à 1'} : ${yes ? 'ce sont' : 'ce ne sont pas'} les planches de cette échelle.`,
    );
  },
  caseId: byCaseId,
  /** How a ladder is made a case (for the tests of the rules students hold). */
  caseOf: ladderCase,
  evidence: own(K.ladder),
  predictCases: noPredictions,
  // a wrong rule: the first new ladder where it breaks; the right one: a ladder of 84 that goes to the end, one laid with
  // the longest planks (7, 6, 2)
  attacks: (rule, rows) =>
    L_JUDGE.isTheRule(rule)
      ? twoHard(L_HARD, byCaseId)(rows)
      : firstBreak(L_POOL(), rule, rows, L_JUDGE.says, byCaseId),
  nudge: (n) => ({ kind: 'experiment', cases: L_NUDGES[Math.min(3, n) - 1] }),
  use: {
    make: () => ({ n: L_USE, planks: primeFactors(L_USE), held: true }),
    // a ladder is read from top to bottom: its four rungs in ONE column (RuleForge.jsx › UseLines)
    column: true,
    lines: () =>
      Array.from({ length: L_ROWS }, (_, i) =>
        line([
          i === 0 ? String(L_USE) : slot(`n${i + 1}`, 'ce qui reste', 2),
          '|',
          slot(`d${i + 1}`, i === 0 ? `la planche posée sur ${L_USE}` : 'la planche posée', 2),
        ]),
      ),
    check(c, v) {
      let x = c.n;
      for (let i = 1; i <= L_ROWS; i += 1) {
        if (i > 1 && Number(v[`n${i}`]) !== x) return 'left';
        const d = Number(v[`d${i}`]);
        if (!Number.isInteger(d) || d < 2 || x % d !== 0) return 'fall';
        if (d !== smallestPrime(x)) return 'small';
        x /= d;
      }
      return x === 1 ? 'ok' : 'end';
    },
    /** The claim this answer makes (not sent by the kit today: a forge's last step is not evidence). */
    claim: (c, v) =>
      factorizationOf(
        c.n,
        Array.from({ length: L_ROWS }, (_, i) => Number(v[`d${i + 1}`])),
      ),
  },
  text: frAll({
    ...BRIDGE_TEXT,
    title: 'Le miroir clair',
    log: 'Tes échelles',
    ask: (c) => `Sur ${c.n}, cette échelle : ${listFr(c.planks)}. Va-t-elle au bout ?`,
    fact: (c) =>
      c.held ? 'Elle arrive à 1, et aucune planche ne se casse.' : `Elle ne va pas au bout : ${notToEnd(c)}.`,
    eq: (c) => `$${tx(c.n)} \\div ${c.planks.join(' \\div ')} = ${tx(c.left)}$`,
    yes: 'Elle les pose',
    no: 'Pas ces planches',
    next: 'Une autre échelle',
    frame: 'Ma règle pour descendre à 1 :',
    buildLead:
      'Une carte par colonne : comment poses-tu tes planches ? Le miroir reprend tes fossés de 60, 72 et 495 avec ta règle.',
    testing: 'Le miroir reprend tes échelles une par une…',
    says: (yes) => `Ta règle : ${yes ? 'elle les pose' : 'pas ces planches'}`,
    refuted: (m) =>
      m.held
        ? `Ta règle ne pose pas ${listFr(m.planks)} sur ${m.n}, et pourtant cette échelle arrive à 1 sans planche qui se casse.`
        : `Ta règle pose ${listFr(m.planks)} sur ${m.n}, mais ${notToEnd(m)}.`,
    agreed: 'Ta règle est d’accord avec toutes tes échelles. Le miroir la met maintenant au défi.',
    attack: (c) =>
      `Le miroir met ta règle au défi : ${c.n}, et l’échelle ${listFr(c.planks)}. Ta règle pose-t-elle ces planches ?`,
    fire: 'Pose les planches',
    survived: 'Ta règle a tenu : l’échelle a fait ce qu’elle disait.',
    broken: (yes) =>
      yes
        ? 'Ta règle a cédé : elle pose ces planches, et cette échelle ne va pas au bout.'
        : 'Ta règle a cédé : elle ne pose pas ces planches, et cette échelle va au bout.',
    wordsHint: 'Exemple : je pose d’abord…',
    compare: (cases) => `Compare ces deux échelles de ${cases[0].n} : laquelle va au bout ?`,
    experiment: 'Regarde ces deux échelles du même nombre : laquelle va au bout ?',
    tryKey: () =>
      `Remplis l’échelle de ${L_USE} avec ta règle : à droite la planche posée, à gauche ce qui reste. Après la dernière planche, il reste 1.`,
    use: {
      fall: 'Une de tes planches ne remplit pas le nombre écrit à sa gauche : elle tomberait.',
      small: 'Une de tes planches tient, mais une planche plus petite tenait déjà sur ce nombre.',
      left: 'Un nombre de gauche n’est pas ce que la planche du dessus a laissé : refais la division.',
      end: 'Après ta dernière planche, il ne reste pas 1 : l’échelle ne va pas au bout.',
    },
    useOk: 'Ta clé descend jusqu’à 1 sans te tromper de planche.',
  }),
};

// ───────────────────────── 2. 🔢 puissances — the writing ─────────────────────────

/** How a rule reads a raised number: the numbers it writes in a row for p with e raised. */
const READ = [
  { id: 'base', label: '2, trois fois', seq: (p, e) => Array(e).fill(p) },
  { id: 'swap', label: '3, deux fois', seq: (p, e) => Array(p).fill(e) },
  { id: 'both', label: '2 et 3', seq: (p, e) => [p, e] },
  { id: 'two', label: '2, deux fois', seq: (p) => [p, p] },
];
const JOIN = [
  { id: 'times', label: 'le signe ×', op: (xs) => xs.reduce((v, x) => v * x, 1), tex: ' \\times ' },
  { id: 'plus', label: 'le signe +', op: (xs) => xs.reduce((v, x) => v + x, 0), tex: ' + ' },
];
const readTerm = (rule, tile, { p, e }) => (e === 1 ? p : tile.join[rule.join].op(tile.read[rule.read].seq(p, e)));
const readValue = (rule, tile, w) => w.reduce((v, f) => v * readTerm(rule, tile, f), 1);
/** How many times each prime comes in the ladder of n: « 3 fois 2 et 2 fois 3 ». */
const countsOf = (n) => listFr(powersOf(n).map((f) => `${counted(f.e, ['fois', 'fois'])} ${f.p}`));
/**
 * A WRITING of n: `w` = [{ p, e }] (primes increasing), drawn as the ladder of n (its planks). `held`: it counts that
 * ladder — each prime with how many times it comes (the same, for primes increasing, as « its value is n »).
 */
function writeCase(n, w) {
  const value = valueOfPowers(w);
  const held = value === n;
  return {
    of: K.powers,
    id: `${K.powers}:${n}:${w.map((f) => `${f.p}^${f.e}`).join('*')}`,
    n,
    w,
    value,
    held,
    fits: held,
    text: `${nb(n)} = ${powText(w)}`,
    factor: { n, planks: primeFactors(n) },
    tag: held ? `redonne ${nb(n)}` : `donne ${nb(value)}`,
  };
}
const truly = (n) => writeCase(n, powersOf(n));
/** Other writings of n with the same primes: the raised numbers swapped, one more, one fewer. */
const misWritings = (n) => {
  const w = powersOf(n);
  const out = [];
  if (w.length >= 2 && w[0].e !== w[1].e) out.push([{ ...w[0], e: w[1].e }, { ...w[1], e: w[0].e }, ...w.slice(2)]);
  out.push([{ ...w[0], e: w[0].e + 1 }, ...w.slice(1)]);
  if (w[0].e > 1) out.push([{ ...w[0], e: w[0].e - 1 }, ...w.slice(1)]);
  return out.map((x) => writeCase(n, x));
};
const P_JUDGE = judge({
  slots: [
    { id: 'read', label: 'Dans 2³, on écrit', options: READ },
    { id: 'join', label: 'et entre eux, on met', options: JOIN },
  ],
  right: { read: 'base', join: 'times' },
  says: (rule, c, tile) => readValue(rule, tile, c.w) === c.n,
});
const P_POOL = lazy(() => SMOOTH.flatMap((n) => [truly(n), ...misWritings(n)]).filter((c) => c.value <= 9999));
const P_HARD = [
  truly(88),
  writeCase(72, [
    { p: 2, e: 2 },
    { p: 3, e: 3 },
  ]),
  truly(135),
  writeCase(140, [
    { p: 2, e: 1 },
    { p: 5, e: 1 },
    { p: 7, e: 1 },
  ]),
];
const P_NUDGES = [
  [
    truly(80),
    writeCase(80, [
      { p: 2, e: 3 },
      { p: 5, e: 1 },
    ]),
  ],
  [
    truly(175),
    writeCase(175, [
      { p: 5, e: 1 },
      { p: 7, e: 2 },
    ]),
  ],
  [
    truly(96),
    writeCase(96, [
      { p: 2, e: 3 },
      { p: 3, e: 2 },
    ]),
  ],
];
/** His ladders of key 1 (the story guarantees he decomposed 60, 72 and 495 there) and the plank of 8 that crossed 1 400. */
const [, , R1400] = NUMBERS.road;
const P_LIVED = [8, ...NUMBERS.ladder.rounds].map(truly);
const P_USE = NUMBERS.powers.use;
/** The readings of the last step: a number that 1 400 holds or not, read from its decomposition (never 36, 48, 504). */
const P_READ = [28, 35, 56, 70, 175, 16, 49, 80, 98, 125];
/** How a rule reads each raised number of a writing, in words and formulas. */
function readingOf(rule, w) {
  const R = READ.find((o) => o.id === rule.read);
  const J = JOIN.find((o) => o.id === rule.join);
  return w
    .filter((f) => f.e > 1)
    .map((f) => {
      const seq = R.seq(f.p, f.e);
      const shown = seq.length > 6 ? `${f.e}, écrit ${f.p} fois` : `$${seq.map(tx).join(J.tex)}$`;
      return `$${tx(f.p)}^{${f.e}}$ comme ${shown}`;
    });
}

const powersForge = {
  key: K.powers,
  ...P_JUDGE,
  ruleText: (rule) =>
    fr(
      `Dans 2³, on écrit ${READ.find((o) => o.id === rule.read).label}, et entre eux, on met ${JOIN.find((o) => o.id === rule.join).label}.`,
    ),
  explain(rule, c) {
    const v = readValue(rule, P_JUDGE.tile, c.w);
    const how = readingOf(rule, c.w);
    return fr(
      `${how.length ? `Ta règle lit ${listFr(how)}` : 'Ici, aucun nombre n’est écrit en haut'} : l’écriture donne ${nb(v)}, et le nombre est ${nb(c.n)}.`,
    );
  },
  caseId: byCaseId,
  caseOf: writeCase,
  evidence: gather({
    own: (row) => row.of === K.powers,
    // the bridge of 1 400 cases, crossed with the plank of 8: 8 = 2 × 2 × 2
    fromRow: (row) => (row.a === R1400.a && row.b === 8 ? [truly(8)] : []),
    lived: P_LIVED,
    caseId: byCaseId,
  }),
  predictCases: noPredictions,
  attacks: (rule, rows) =>
    powersForge.isTheRule(rule)
      ? twoHard(P_HARD, byCaseId)(rows)
      : firstBreak(P_POOL(), rule, rows, powersForge.says, byCaseId),
  nudge: (n) => ({ kind: 'experiment', cases: P_NUDGES[Math.min(3, n) - 1] }),
  use: {
    make: (rand = Math.random) => {
      const d = pickWith(rand)(P_READ);
      return { n: P_USE, w: powersOf(P_USE), d, held: P_USE % d === 0 };
    },
    lines: () => [line([nb(P_USE), '=', powerBox(2, 'e2'), '×', powerBox(5, 'e5'), '×', '7'])],
    verdict: true,
    check(c, v, verdict) {
      const e = Object.fromEntries(c.w.map((f) => [f.p, f.e]));
      if (Number(v.e2) !== e[2]) return 'e2';
      if (Number(v.e5) !== e[5]) return 'e5';
      return verdict === c.held ? 'ok' : 'reading';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, v, verdict) => [
      { kind: 'factorization', a: c.n, factors: [2, 5, 7].map((p) => ({ p, e: p === 7 ? 1 : Number(v[`e${p}`]) })) },
      { kind: 'divisible', a: c.n, b: c.d, fits: verdict },
    ],
  },
  text: frAll({
    ...BRIDGE_TEXT,
    title: 'Le miroir des enclumes',
    log: 'Tes échelles, écrites court',
    ask: (c) => `$${tx(c.n)} = ${powTex(c.w)}$ : cette écriture redonne-t-elle ${nb(c.n)} ?`,
    fact: (c) => `L’échelle de ${nb(c.n)} : ${countsOf(c.n)}.`,
    eq: (c) => `$${tx(c.n)} = ${productTex(primeFactors(c.n))}$`,
    yes: 'Oui',
    no: 'Non',
    next: 'Une autre écriture',
    frame: 'Ma lecture de 2³ :',
    buildLead:
      'Une carte par colonne : que veut dire le petit 3 de 2³ ? Le miroir lit avec ta règle les écritures de 8, 60, 72 et 495.',
    testing: 'Le miroir lit chaque écriture avec ta règle…',
    says: (yes) => `Ta règle : ${yes ? 'elle redonne le nombre' : 'elle ne le redonne pas'}`,
    refuted: (m) =>
      m.held
        ? `Avec ta règle, ${powText(m.w)} ne redonne pas ${nb(m.n)}, et pourtant l’échelle de ${nb(m.n)} compte ${countsOf(m.n)}, comme cette écriture.`
        : `Avec ta règle, ${powText(m.w)} redonne ${nb(m.n)}, et pourtant l’échelle de ${nb(m.n)} compte ${countsOf(m.n)}.`,
    agreed: 'Avec ta règle, chaque écriture redonne son nombre. Le miroir la met maintenant au défi.',
    attack: (c) =>
      `Le miroir met ta règle au défi : $${tx(c.n)} = ${powTex(c.w)}$. Lue avec ta règle, cette écriture redonne-t-elle ${nb(c.n)} ?`,
    fire: 'Pose l’échelle',
    survived: 'Ta règle a tenu : l’échelle compte ce qu’elle disait.',
    broken: (yes) =>
      yes
        ? 'Ta règle a cédé : elle disait « oui », et l’échelle compte autre chose.'
        : 'Ta règle a cédé : elle disait « non », et l’échelle compte exactement cette écriture.',
    wordsHint: 'Exemple : le petit nombre en haut dit…',
    compare: (cases) => `Compare ces deux écritures de ${nb(cases[0].n)} : laquelle compte son échelle ?`,
    experiment: 'Regarde ces deux écritures du même nombre : laquelle compte son échelle ?',
    tryKey: (c) =>
      `$${tx(c.n)} = ${productTex(primeFactors(c.n))}$. Écris-le en peu de signes, puis lis ton écriture : ${c.d} divise-t-il ${nb(c.n)} ?`,
    use: {
      e2: 'Compte encore les 2 de l’échelle de 1 400 : ce n’est pas ce nombre-là en haut du 2.',
      e5: 'Compte encore les 5 de l’échelle de 1 400 : ce n’est pas ce nombre-là en haut du 5.',
      reading: 'Écris aussi le nombre essayé avec des exposants, et compare-le exposant par exposant à 1 400.',
    },
    useOk: 'Tu écris un nombre en peu de signes, et tu lis ce qu’il contient.',
  }),
};

// ───────────────────────── 3. 🛑 arret — which planks to try (ported) ─────────────────────────

/** « To know whether a is prime, must the plank d be tried? » — `fits`: the bridge holds; `held`: it HAD to be tried. */
function tryCase(a, d) {
  const c = outcome(a, d);
  const need = isPrime(d) && d * d <= a;
  return { ...c, of: K.stop, id: `${K.stop}:${a}:${d}`, fits: c.held, held: need, tag: need ? 'à essayer' : 'inutile' };
}
const KIND = [
  {
    id: 'primes',
    label: 'les nombres premiers',
    test: isPrime,
    say: (d) => `${d} ${isPrime(d) ? 'est' : 'n’est pas'} un nombre premier`,
  },
  {
    id: 'all',
    label: 'tous les nombres à partir de 2',
    test: (d) => d >= 2,
    say: (d) => `${d} est un nombre à partir de 2`,
  },
  {
    id: 'odd',
    label: 'les nombres impairs',
    test: (d) => d % 2 === 1,
    say: (d) => `${d} ${d % 2 ? 'est' : 'n’est pas'} impair`,
  },
];
const WHAT = [
  { id: 'sq', label: 'son carré', of: (d) => d * d, show: (d) => `$${d} \\times ${d} = ${d * d}$` },
  { id: 'self', label: 'lui-même', of: (d) => d, show: (d) => `${d}` },
  { id: 'dbl', label: 'son double', of: (d) => 2 * d, show: (d) => `$2 \\times ${d} = ${2 * d}$` },
];
const AGAINST = [
  { id: 'n', label: 'le nombre n', test: (v, a) => v <= a, show: (a) => `${a}` },
  { id: 'half', label: 'la moitié de n', test: (v, a) => 2 * v <= a, show: (a) => `la moitié de ${a}` },
];
const S_JUDGE = judge({
  slots: [
    { id: 'kind', label: 'J’essaie', options: KIND },
    { id: 'what', label: 'tant que', options: WHAT },
    { id: 'cond', label: 'ne dépasse pas', options: AGAINST },
  ],
  right: { kind: 'primes', what: 'sq', cond: 'n' },
  says: (rule, c, tile) =>
    tile.kind[rule.kind].test(c.b) && tile.cond[rule.cond].test(tile.what[rule.what].of(c.b), c.a),
});
const S_POOL = lazy(() => PRIMES.flatMap((a) => Array.from({ length: stopOf(a) + 2 }, (_, i) => tryCase(a, i + 2))));
const S_HARD = [tryCase(83, 7), tryCase(83, 11), tryCase(101, 7), tryCase(101, 9)];
const S_NUDGES = [
  [tryCase(53, 7), tryCase(53, 8)],
  [tryCase(67, 5), tryCase(67, 6)],
  [tryCase(73, 7), tryCase(73, 11)],
];
/** Why a plank teaches nothing new — a fact. */
const useless = (m) =>
  isPrime(m.b)
    ? `${m.b} × ${m.b} = ${m.b * m.b} dépasse ${m.a} : si ${m.b} remplissait ${m.a}, son partenaire serait plus petit que ${m.b}, et déjà essayé`
    : `${m.b} = ${smallestPrime(m.b)} × ${m.b / smallestPrime(m.b)} : si ${m.b} remplissait ${m.a}, ${smallestPrime(m.b)} l’aurait rempli avant`;
const S_USE = NUMBERS.stop.use;

const stopForge = {
  key: K.stop,
  inquiry: STOP_INQUIRY,
  /** Every plank he tried on each gap (from 2 to two planks past the crossing), read again: had it to be tried? */
  fromInquiry: (result) => ({
    rows: result.gaps.flatMap((g) => Array.from({ length: stopOf(g.a) + 1 }, (_, i) => tryCase(g.a, i + 2))),
  }),
  ...S_JUDGE,
  ruleText: (rule) =>
    fr(
      `Pour savoir si n est premier, j’essaie ${KIND.find((o) => o.id === rule.kind).label}, tant que ${WHAT.find((o) => o.id === rule.what).label} ne dépasse pas ${AGAINST.find((o) => o.id === rule.cond).label}.`,
    ),
  explain(rule, c) {
    const k = KIND.find((o) => o.id === rule.kind);
    const w = WHAT.find((o) => o.id === rule.what);
    const g = AGAINST.find((o) => o.id === rule.cond);
    const yes = stopForge.says(rule, c);
    return fr(
      `${k.say(c.b)} ; ${w.show(c.b)} ${g.test(w.of(c.b), c.a) ? 'ne dépasse pas' : 'dépasse'} ${g.show(c.a)} : ta règle dit ${yes ? 'de l’essayer' : 'que c’est inutile'}.`,
    );
  },
  caseId: byCaseId,
  caseOf: tryCase,
  evidence: own(K.stop),
  predictCases: noPredictions,
  attacks: (rule, rows) =>
    stopForge.isTheRule(rule)
      ? twoHard(S_HARD, byCaseId)(rows)
      : firstBreak(S_POOL(), rule, rows, stopForge.says, byCaseId),
  nudge: (n) => ({ kind: 'experiment', cases: S_NUDGES[Math.min(3, n) - 1] }),
  use: {
    make: () => ({ a: S_USE, held: isPrime(S_USE) }),
    lines: () => [
      line([String(S_USE), '=', slot('p', 'le premier facteur', 2), '×', slot('q', 'le second facteur', 3)]),
    ],
    verdict: true,
    check(c, v, verdict) {
      if (verdict !== isPrime(c.a)) return 'prime';
      const [p, q] = [Number(v.p), Number(v.q)];
      if (!Number.isInteger(p) || !Number.isInteger(q) || p * q !== c.a) return 'product';
      return Math.min(p, q) === 1 && !isPrime(c.a) ? 'one' : 'ok';
    },
    /** The claims this answer makes (not sent by the kit today). */
    claim: (c, v, verdict) => [
      { kind: 'prime', a: c.a, says: verdict },
      { kind: 'pair', a: c.a, b: Number(v.p), e: Number(v.q) },
    ],
  },
  text: frAll({
    ...BRIDGE_TEXT,
    title: 'Le miroir des cerfs-volants',
    log: 'Les planches essayées',
    ask: (c) => `Pour savoir si ${c.a} est premier, faut-il essayer la planche de ${c.b} ?`,
    fact: (c) => (c.held ? `Il fallait l’essayer.` : `Inutile : ${useless(c)}.`),
    eq: (c) => `$${c.b} \\times ${c.b} = ${c.b * c.b}$`,
    yes: 'Oui',
    no: 'Non',
    next: 'Une autre planche',
    frame: 'Pour savoir si n est premier :',
    buildLead:
      'Une carte par colonne : quelles planches essayer pour savoir si un nombre est premier ? Le miroir reprend tes essais.',
    testing: 'Le miroir reprend tes essais, planche par planche…',
    says: (yes) => `Ta règle : ${yes ? 'on l’essaie' : 'inutile'}`,
    refuted: (m) =>
      m.held
        ? `Ta règle n’essaie pas ${m.b} pour ${m.a}, et pourtant ${m.b} est premier et ${m.b} × ${m.b} = ${m.b * m.b} ne dépasse pas ${m.a} : sans lui, on ne peut pas être sûr.`
        : `Ta règle essaie ${m.b} pour ${m.a}, mais ${useless(m)}.`,
    agreed: 'Ta règle choisit les planches utiles, ni plus ni moins. Le miroir la met maintenant au défi.',
    attack: (c) =>
      `Le miroir met ta règle au défi : pour savoir si ${c.a} est premier, faut-il essayer la planche de ${c.b} ?`,
    fire: 'Essaie-la',
    survived: 'Ta règle a tenu : le miroir est d’accord avec elle.',
    broken: (yes) =>
      yes
        ? 'Ta règle a cédé : elle disait « on l’essaie », et cette planche ne pouvait rien apprendre de nouveau.'
        : 'Ta règle a cédé : elle disait « inutile », et sans cette planche on ne pouvait pas être sûr.',
    wordsHint: 'Exemple : j’essaie seulement…',
    compare: (cases) => `Compare ces deux planches pour ${cases[0].a} : laquelle pouvait apprendre quelque chose ?`,
    experiment: 'Regarde bien : le même nombre, deux planches. Laquelle pouvait encore apprendre quelque chose ?',
    tryKey: () =>
      `${S_USE} est-il premier ? Essaie ce que ta règle demande, puis écris ${S_USE} comme un produit : 1 × ${S_USE} s’il est premier.`,
    use: {
      prime: `Avant de répondre, essaie chaque nombre premier dont le carré ne dépasse pas ${S_USE}.`,
      product: `Ces deux nombres ne donnent pas ${S_USE} : multiplie-les pour vérifier.`,
      one: `Avec 1, tout nombre s’écrit ainsi. ${S_USE} a un autre produit : trouve-le.`,
    },
    useOk: 'Tu sais où t’arrêter : ta clé décide sans tout essayer.',
  }),
};

// ───────────────────────── 4. 📊 tableur — reading the sheet ─────────────────────────

const digits = (x) => x % 10;
const CLAIM = [
  { id: 'zero', label: 'si aucun reste n’est 0', prime: () => false },
  { id: 'units', label: 's’il finit par 1, 3, 7 ou 9', prime: (x) => x > 10 && [1, 3, 7, 9].includes(digits(x)) },
  {
    id: 'easy',
    label: 'si 2, 3 et 5 ne le divisent pas',
    prime: (x) => x > 10 && x % 2 !== 0 && x % 3 !== 0 && x % 5 !== 0,
  },
];
const THEN = [
  { id: 'again', label: 'je divise, puis je recommence', again: true },
  { id: 'stop', label: 'je divise, et j’ai fini', again: false },
];
/** The first line of the sheet of x whose remainder is 0 (primes p with p × p ⩽ x), or null. */
const firstZero = (x) => {
  for (let p = 2; p * p <= x; p += 1) if (isPrime(p) && x % p === 0) return p;
  return null;
};
/** The numbers a reading of the sheet gives for n, in order (their product is always n). */
function toolRun(rule, n, tile) {
  const claim = tile.read[rule.read];
  const { again } = tile.then[rule.then];
  const out = [];
  let x = n;
  while (x > 1) {
    const p = claim.prime(x) ? null : firstZero(x);
    if (p == null) {
      out.push(x);
      break;
    }
    out.push(p);
    x /= p;
    if (!again) {
      if (x > 1) out.push(x);
      break;
    }
  }
  return out;
}
/** A large number and the numbers a reading gave: `held` when they are all prime. */
function toolCase(n, planks) {
  const held = planks.every(isPrime);
  return {
    of: K.tool,
    id: `${K.tool}:${n}:${sorted(planks)}`,
    n,
    planks,
    held,
    fits: held,
    factor: { n, planks },
    tag: held ? 'va au bout' : 'se casse',
  };
}
const T_JUDGE = judge({
  slots: [
    { id: 'read', label: 'Un grand nombre est premier', options: CLAIM },
    { id: 'then', label: 'Sur une ligne de reste 0', options: THEN },
  ],
  right: { read: 'zero', then: 'again' },
  says: (rule, c, tile) => sameNumbers(toolRun(rule, c.n, tile), c.planks),
});
const toolOf = (rule, n) => toolRun(rule, n, T_JUDGE.tile);
const T_POOL = lazy(() =>
  LARGE.flatMap((n) => {
    const outs = new Map();
    for (const read of CLAIM)
      for (const then of THEN) {
        const o = toolOf({ read: read.id, then: then.id }, n);
        outs.set(sorted(o), o);
      }
    return [...outs.values()].map((o) => toolCase(n, o));
  }),
);
const STOPPED = { read: 'zero', then: 'stop' };
const UNITS = { read: 'units', then: 'again' };
const T_HARD = [
  toolCase(1309, primeFactors(1309)),
  toolCase(1309, toolOf(STOPPED, 1309)),
  toolCase(1147, primeFactors(1147)),
  toolCase(1147, toolOf(UNITS, 1147)),
];
const T_NUDGES = [
  [toolCase(1463, primeFactors(1463)), toolCase(1463, toolOf(STOPPED, 1463))],
  [toolCase(1271, primeFactors(1271)), toolCase(1271, toolOf(UNITS, 1271))],
  [toolCase(1207, primeFactors(1207)), toolCase(1339, toolOf(UNITS, 1339))],
];
/** Why the numbers a reading gave are not all prime — the sheet of the first one that is not. */
const notAllPrime = (m) => {
  const x = m.planks.find((y) => !isPrime(y));
  return `${nb(x)} n’est pas premier : sur la feuille de ${nb(x)}, la ligne ${firstZero(x)} montre le reste 0`;
};
const T_USE = NUMBERS.tool.use;
/** The program of the last step on 4 641: d stays on 3 after the first division (1 547 = 4 641 ÷ 3). */
const T_FIRST = smallestPrime(T_USE);

const toolForge = {
  key: K.tool,
  inquiry: SHEET_INQUIRY,
  /** Each sheet he read to the end: the number and the primes he found, in his order. */
  fromInquiry: (result) => ({ rows: result.rounds.map((r) => toolCase(r.n, r.factors)) }),
  ...T_JUDGE,
  ruleText: (rule) =>
    fr(
      `Un grand nombre est premier ${CLAIM.find((o) => o.id === rule.read).label} ; sur une ligne de reste 0, ${THEN.find((o) => o.id === rule.then).label}.`,
    ),
  explain(rule, c) {
    const r = toolOf(rule, c.n);
    return fr(
      `Avec ta règle, ${nb(c.n)} donne ${listFr(r.map(nb))} : ${sameNumbers(r, c.planks) ? 'ce sont' : 'ce ne sont pas'} les nombres de cette réponse.`,
    );
  },
  caseId: byCaseId,
  caseOf: toolCase,
  evidence: own(K.tool),
  predictCases: noPredictions,
  attacks: (rule, rows) =>
    toolForge.isTheRule(rule)
      ? twoHard(T_HARD, byCaseId)(rows)
      : firstBreak(T_POOL(), rule, rows, toolForge.says, byCaseId),
  nudge: (n) => ({ kind: 'experiment', cases: T_NUDGES[Math.min(3, n) - 1] }),
  use: {
    make: () => ({ n: T_USE, planks: primeFactors(T_USE), held: true }),
    lines: () => [
      line([`Quand N devient ${nb(T_USE / T_FIRST)}, le programme essaie d =`, slot('d', 'le d essayé ensuite', 2)]),
      line([
        nb(T_USE),
        '=',
        slot('f1', 'facteur 1', 2),
        '×',
        slot('f2', 'facteur 2', 2),
        '×',
        slot('f3', 'facteur 3', 2),
        '×',
        slot('f4', 'facteur 4', 2),
      ]),
    ],
    check(c, v) {
      if (Number(v.d) !== T_FIRST) return 'trace';
      const fs = ['f1', 'f2', 'f3', 'f4'].map((k) => Number(v[k]));
      if (!fs.every(Number.isInteger) || fs.reduce((p, x) => p * x, 1) !== c.n) return 'product';
      return fs.every(isPrime) ? 'ok' : 'prime';
    },
    /** The claim this answer makes (not sent by the kit today; NO claim kind states a program's trace). */
    claim: (c, v) =>
      factorizationOf(
        c.n,
        ['f1', 'f2', 'f3', 'f4'].map((k) => Number(v[k])),
      ),
  },
  text: frAll({
    ...BRIDGE_TEXT,
    title: 'Le miroir des lanternes',
    log: 'Tes feuilles',
    ask: (c) => `${nb(c.n)} : la réponse ${listFr(c.planks.map(nb))} va-t-elle au bout ?`,
    fact: (c) => (c.held ? 'Tous ces nombres sont premiers.' : `${notAllPrime(c)}.`),
    eq: (c) => `$${tx(c.n)} = ${productTex(c.planks)}$`,
    yes: 'Oui',
    no: 'Non',
    next: 'Un autre nombre',
    frame: 'Ma règle pour un grand nombre :',
    buildLead: `Une carte par colonne : comment lis-tu la feuille ? Le miroir reprend avec ta règle tes nombres ${listFr(NUMBERS.tool.rounds.map(nb))}.`,
    testing: 'Le miroir reprend tes feuilles une par une…',
    says: (yes) => `Ta règle : ${yes ? 'ceux-là' : 'd’autres nombres'}`,
    refuted: (m) =>
      m.held
        ? `Ta règle ne donne pas ${listFr(m.planks.map(nb))} pour ${nb(m.n)}, et pourtant ces nombres sont tous premiers, et leur produit fait ${nb(m.n)}.`
        : `Ta règle donne ${listFr(m.planks.map(nb))} pour ${nb(m.n)}, mais ${notAllPrime(m)}.`,
    agreed: 'Ta règle redonne les nombres de tes feuilles. Le miroir la met maintenant au défi.',
    attack: (c) =>
      `Le miroir met ta règle au défi : ${nb(c.n)}, et les nombres ${listFr(c.planks.map(nb))}. Ta règle donne-t-elle ceux-là ?`,
    fire: 'Remplis la feuille',
    survived: 'Ta règle a tenu : la feuille a donné ce qu’elle disait.',
    broken: (yes) =>
      yes
        ? 'Ta règle a cédé : elle donnait ces nombres, et l’un d’eux n’est pas premier.'
        : 'Ta règle a cédé : elle donnait d’autres nombres, et ceux-là sont tous premiers.',
    wordsHint: 'Exemple : je lis la colonne…',
    compare: (cases) => `Compare ces deux réponses pour ${nb(cases[0].n)} : laquelle n’a que des nombres premiers ?`,
    experiment: 'Regarde ces deux réponses : laquelle n’a que des nombres premiers ?',
    tryKey: () =>
      `Un programme essaie $d = 2, 3, 4\\ldots$ sur $N = ${tx(T_USE)}$ : si d divise N, N devient $N \\div d$, et d ne change pas. Puis décompose ${nb(T_USE)}.`,
    use: {
      trace: 'Après une division, le programme garde le même d : il ne passe au suivant que si d ne divise pas N.',
      product: `Le produit de tes quatre nombres ne fait pas ${nb(T_USE)} : refais tes divisions.`,
      prime: 'Un de tes nombres n’est pas premier : sa feuille montrerait encore un reste 0.',
    },
    useOk: 'Ta clé confie les grands nombres à la feuille, et tu lis ce qu’elle donne.',
  }),
};

/** The forges, by key, in the order of the story (world/index.js › lesson.forges). */
export const FORGES = {
  [K.ladder]: ladderForge,
  [K.powers]: powersForge,
  [K.stop]: stopForge,
  [K.tool]: toolForge,
};
