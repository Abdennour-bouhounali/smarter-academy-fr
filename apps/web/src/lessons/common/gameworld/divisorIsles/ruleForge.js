/**
 * The rule forge IN THIS WORLD (PURE logic; the frame is kit/forge.js, the screen kit/RuleForge.jsx).
 *
 * Here a CASE is a bridge: a gap of `a` cells, planks of `b` cells — it holds or it crumbles in front of the student.
 * This file gives every forge of the world what a bridge is (its outcome, the evidence of a crossing, the pool of small
 * bridges, its wording), and THE LAW OF THE WORLD as a forge: « the bridge holds when the remainder is 0 ».
 * The other forges of a lesson are written in the lesson's own folder, on these bridges.
 */
import { EVIDENCE_MAX, slot } from '../kit/forge';
import { divide } from './logic';
import { counted, CELLS } from '../kit/authoring/numbers';

// ───────────────────────────── a bridge as a case ─────────────────────────────

/** Does the bridge really hold? The plank must fit at least once, and nothing may be left. */
export const holds = (a, b) => b >= 1 && b <= a && a % b === 0;
export const outcome = (a, b) => {
  const { q, r } = divide(a, b);
  return { a, b, q, r, held: holds(a, b) };
};
export const sameCase = (x, y) => x.a === y.a && x.b === y.b;
export const bridgeId = (c) => `${c.a}:${c.b}`;
const OWN_MAX = 5;

/**
 * The evidence: one line per different bridge, oldest first — the student's OWN crossing first (its last five bridges are
 * never pushed out), then the bridges the mirror built in front of him (`mirror: true`), eight lines at most.
 */
export function evidence(log) {
  const out = [];
  for (const row of log) {
    const i = out.findIndex((x) => sameCase(x, row));
    const was = i >= 0 ? out.splice(i, 1)[0] : null;
    out.push({ ...outcome(row.a, row.b), mirror: Boolean(row.mirror) && (was ? was.mirror : true) });
  }
  const own = out.filter((x) => !x.mirror).slice(-OWN_MAX);
  return [...own, ...out.filter((x) => x.mirror).slice(-(EVIDENCE_MAX - own.length))];
}

/** The small bridges a mirror can draw and a student can count: gaps 8 … 30, planks 2 … 9. */
export const SMALL = (() => {
  const out = [];
  for (let a = 8; a <= 30; a += 1) for (let b = 2; b <= 9; b += 1) if (b < a) out.push({ a, b });
  return out;
})();
/** Keeps the bridges that are not in the evidence yet. */
const fresh = (rows) => (c) => !rows.some((row) => sameCase(row, c));
export const pickWith = (rand) => (list) => list[Math.floor(rand() * list.length)];

/** A length in cells, after « de »: « 7 cases », « 15 cases » (« un fossé de 15 cases »). */
export const cellsOf = (n) => counted(n, CELLS);
const left = (r) => `Il reste ${counted(r, CELLS)}`;
/** The wording of a bridge as a case — shared by the forges of this world; a forge overrides what its rule changes. */
export const BRIDGE_TEXT = {
  title: 'Le miroir de l’île',
  sub: 'Forge ta clé : une règle qui résiste au miroir.',
  log: 'Ton carnet de traversée',
  ask: (c) => `Un fossé de ${cellsOf(c.a)} et une planche de ${c.b}. Le pont tient-il ?`,
  yes: 'Il tient',
  no: 'Il s’effondre',
  fact: (c) =>
    c.held
      ? 'Aucune case ne reste : le pont a tenu.'
      : c.b > c.a
        ? 'La planche est plus longue que le fossé : le pont s’est effondré.'
        : `${left(c.r)} : le pont s’est effondré.`,
  eq: (c) => `$${c.a} = ${c.b} \\times ${c.q} + \\textcolor{${c.held ? '#34d399' : '#fbbf24'}}{${c.r}}$`,
  next: 'Un autre pont',
  frame: 'Le pont tient quand :',
  buildLead: 'Choisis deux cartes. Le miroir ne croit personne : il va essayer ta règle sur tes ponts.',
  testing: 'Le miroir passe sur tes ponts, un par un…',
  says: (yes) => `Ta règle : ${yes ? 'il tient' : 'il s’effondre'}`,
  refuted: (m) =>
    `Ta règle dit que le pont de ${cellsOf(m.a)} avec la planche de ${m.b} ${m.says ? 'tient' : 's’effondre'}, mais tu l’as vu ${m.held ? 'tenir' : 's’effondrer'}.`,
  agreed:
    'Ta règle est d’accord avec tous les ponts que tu as vus. Maintenant, le miroir la met au défi avec un nouveau pont.',
  attack: (c) =>
    `Le miroir met ta règle au défi : un fossé de ${cellsOf(c.a)} et une planche de ${c.b}. Que dit ta règle ?`,
  fire: 'Construis le pont',
  survived: 'Ta règle a tenu : le pont a fait ce qu’elle disait.',
  broken: (yes) =>
    `Ta règle a cédé ici : elle disait « ${yes ? 'il tient' : 'il s’effondre'} », et le pont ${yes ? 's’est effondré' : 'a tenu'}.`,
  wordsHint: 'Exemple : le pont tient si…',
  compare: (cases) => `Compare ces deux ponts : le même fossé (${cases[0].a}). Que reste-t-il chaque fois ?`,
  experiment: 'Regarde bien : la même planche, un fossé puis le suivant. Que reste-t-il chaque fois ?',
  useOk: 'Ta clé marche même là où tu ne comptes pas !',
};

// ───────────────────── the law of the world: the remainder ─────────────────────
// A rule = { q, c }: a QUANTITY read on the gap (a cells) and the plank (b cells), and a CONDITION on it. It can be evaluated
// on any bridge: that is what lets the game test it and look for the case that breaks it. The class board reads these too.

export const QUANTITIES = [
  {
    id: 'r',
    label: 'le reste de la division de la longueur du fossé par la longueur de la planche',
    short: (a, b) => `Le reste de la division de ${a} par ${b}`,
    of: (a, b) => a % b,
  },
  {
    id: 'q',
    label: 'le quotient de la division de la longueur du fossé par la longueur de la planche',
    short: (a, b) => `Le quotient de la division de ${a} par ${b}`,
    of: (a, b) => Math.floor(a / b),
  },
  { id: 'b', label: 'la longueur de la planche', short: () => 'La longueur de la planche', of: (a, b) => b },
  { id: 'a', label: 'la longueur du fossé', short: () => 'La longueur du fossé', of: (a) => a },
];
export const CONDITIONS = [
  { id: 'zero', label: 'est égal à 0', yes: 'est égal à 0', no: 'n’est pas égal à 0', test: (v) => v === 0 },
  {
    id: 'even',
    label: 'est un nombre pair',
    yes: 'est un nombre pair',
    no: 'est un nombre impair',
    test: (v) => v % 2 === 0,
  },
  {
    id: 'lessB',
    label: 'est plus petit que la longueur de la planche',
    yes: 'est plus petit que la longueur de la planche',
    no: 'n’est pas plus petit que la longueur de la planche',
    test: (v, a, b) => v < b,
  },
  {
    id: 'gt1',
    label: 'est plus grand que 1',
    yes: 'est plus grand que 1',
    no: 'n’est pas plus grand que 1',
    test: (v) => v > 1,
  },
];
const Q = Object.fromEntries(QUANTITIES.map((x) => [x.id, x]));
const C = Object.fromEntries(CONDITIONS.map((x) => [x.id, x]));

/** What the student's rule says of a bridge: « it holds » (true) or « it crumbles » (false). */
export const ruleSays = (rule, a, b) => C[rule.c].test(Q[rule.q].of(a, b), a, b);
export const isTheRule = (rule) => rule?.q === 'r' && rule?.c === 'zero';
export const ruleText = (rule) => `Le pont tient quand : ${Q[rule.q].label} ${C[rule.c].label}.`;
/** His rule applied to one bridge, in words: « Le reste de la division de 18 par 4 est 2, et 2 n'est pas égal à 0 : ta règle dit que le pont s'effondre. » */
export function explain(rule, a, b) {
  const v = Q[rule.q].of(a, b);
  const yes = ruleSays(rule, a, b);
  return `${Q[rule.q].short(a, b)} est ${v}, et ${v} ${yes ? C[rule.c].yes : C[rule.c].no} : ta règle dit que le pont ${yes ? 'tient' : 's’effondre'}.`;
}

/** The rule run on the evidence, in order: each row agrees or not; `bad` = the first row that contradicts it (or −1). */
export function runOnEvidence(rule, rows) {
  const marks = rows
    .map((row) => ({ ...row, says: ruleSays(rule, row.a, row.b) }))
    .map((row) => ({ ...row, agrees: row.says === row.held }));
  return { marks, bad: marks.findIndex((m) => !m.agrees) };
}

/**
 * THE ATTACK of a rule on bridges. A wrong rule: the smallest new gap where the rule and the bridge disagree — the
 * counterexample the student will SEE (a rule that says « holds » on a bridge that crumbles is shown first: a fall is the
 * clearest refutation). The right rule: the `hard` bridges of its forge.
 */
export function attackOn(rows, says, right, hard) {
  const free = SMALL.filter(fresh(rows));
  if (!right) {
    const breaks = free.filter((c) => says(c) !== holds(c.a, c.b));
    const best = breaks.find((c) => says(c)) ?? breaks[0];
    return best ? [outcome(best.a, best.b)] : [];
  }
  return hard(free)
    .filter(Boolean)
    .map((c) => outcome(c.a, c.b));
}
/** Two bridges against the usual false ideas: two even numbers that crumble, an odd plank that holds. */
const hardRemainder = (free) => {
  const evenFall = free.find((c) => c.a % 2 === 0 && c.b % 2 === 0 && c.b >= 4 && !holds(c.a, c.b) && c.a >= 14);
  const oddHold = free.find(
    (c) => c.b % 2 === 1 && c.b >= 3 && holds(c.a, c.b) && c.a / c.b >= 3 && c.a >= 15 && c.a !== evenFall?.a,
  );
  return [evenFall, oddHold];
};
export const attacks = (rule, rows) => attackOn(rows, (c) => ruleSays(rule, c.a, c.b), isTheRule(rule), hardRemainder);

/** Bridges he has not built, one per `kind` (a test on a small bridge), never twice the same gap. */
export function casesOfKinds(kinds, rows, rand = Math.random) {
  const free = SMALL.filter(fresh(rows));
  const pick = pickWith(rand);
  const out = [];
  for (const kind of kinds) {
    const c = pick(free.filter((x) => kind(x) && !out.some((y) => sameCase(x, y) || y.a === x.a)));
    if (c) out.push(outcome(c.a, c.b));
  }
  return out;
}
/** The predictions: bridges which alternate — an easy one that holds, a trap that crumbles, an odd plank… */
export const predictCases = (rows, rand = Math.random) =>
  casesOfKinds(
    [
      (c) => holds(c.a, c.b) && c.b <= 5 && c.a <= 20,
      (c) => !holds(c.a, c.b) && c.a % 2 === 0 && c.b % 2 === 0,
      (c) => holds(c.a, c.b) && c.b % 2 === 1 && c.a % 2 === 1,
      (c) => !holds(c.a, c.b) && c.a % c.b === 1,
      (c) => holds(c.a, c.b) && c.b >= 6,
      (c) => !holds(c.a, c.b) && c.b % 2 === 1,
    ],
    rows,
    rand,
  );

/** Two bridges of his own crossing over the same gap, one that held and one that crumbled (when he has them). */
function comparePair(rows) {
  for (const x of rows) {
    const y = rows.find((z) => z.a === x.a && z.held !== x.held);
    if (y) return x.held ? [x, y] : [y, x];
  }
  return null;
}
/** Two bridges for the mirror: the same plank on a gap that fits and on the next one, which does not. */
function experimentPair(rows) {
  const b = [4, 3, 5].find((k) => !rows.some((row) => row.b === k && (row.a === k * 3 || row.a === k * 3 + 1))) ?? 4;
  return [outcome(b * 3, b), outcome(b * 3 + 1, b)];
}
/**
 * The help of the robot — it NEVER gives the rule. Three nudges, in this order:
 *   1 compare     two bridges of his own crossing over the same gap, one that held and one that crumbled (when he has them);
 *   2 experiment  two bridges built in the mirror in front of him: the same plank, a gap that fits and the next one that does not;
 *   3 choice      two rules to test — a false one and the right one. He must still test them: nothing is ticked for him.
 */
export function nudgeWith(n, rows, choice) {
  const pair = n === 1 ? comparePair(rows) : null;
  if (pair) return { kind: 'compare', cases: pair };
  if (n <= 2) return { kind: 'experiment', cases: experimentPair(rows) };
  return { kind: 'choice', rules: choice };
}
export const nudge = (n, rows) =>
  nudgeWith(n, rows, [
    { q: 'r', c: 'lessB' },
    { q: 'r', c: 'zero' },
  ]);

/** The last step: a gap too long to count. Half the time it holds. */
export function longCase(rand = Math.random) {
  const [a, b] = pickWith(rand)([
    [96, 8],
    [91, 7],
    [108, 9],
    [100, 7],
    [110, 9],
    [94, 8],
  ]);
  return outcome(a, b);
}
/** The Euclidean division he wrote for the last step: 'ok', or what to look at again. */
export function checkDivision(c, vals, verdict) {
  const q = Number(vals.q);
  const r = Number(vals.r);
  if (c.b * q + r !== c.a) return 'sum';
  if (r >= c.b) return 'big';
  return verdict === c.held ? 'ok' : 'verdict';
}

/**
 * The law of the world as a forge of the kit — « the bridge holds when: [what I read] [how it must be] », sixteen rules
 * can be written, ONE holds. `key` = the key of the lesson it makes; `text` = what that lesson words differently.
 */
export const remainderForge = (key, text = {}) => ({
  key,
  logs: true,
  slots: [
    { id: 'q', label: 'Qu’est-ce que je lis ?', options: QUANTITIES.map(({ id, label }) => ({ id, label })) },
    { id: 'c', label: 'Comment doit-il être ?', options: CONDITIONS.map(({ id, label }) => ({ id, label })) },
  ],
  says: (rule, c) => ruleSays(rule, c.a, c.b),
  isTheRule,
  ruleText,
  explain: (rule, c) => explain(rule, c.a, c.b),
  caseId: bridgeId,
  evidence,
  predictCases,
  attacks,
  nudge,
  use: {
    make: longCase,
    verdict: true,
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [String(c.a), '=', String(c.b), '×', slot('q', 'quotient', 3), '+', slot('r', 'reste', 2)],
      },
    ],
    check: checkDivision,
  },
  text: {
    ...BRIDGE_TEXT,
    tryKey: (c) =>
      `Essaie ta clé là où tu ne peux pas compter : un fossé de ${cellsOf(c.a)} et une planche de ${c.b}. Cette fois, le miroir ne construit pas.`,
    use: {
      sum: 'L’égalité ne tombe pas juste : calcule le produit, puis ajoute le reste.',
      big: 'Le reste doit être plus petit que la longueur de la planche.',
      verdict: 'La division est juste. Regarde le reste : que dit ta règle ?',
    },
    ...text,
  },
});
