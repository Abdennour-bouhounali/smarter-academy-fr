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

/** A length in cells, after « من »: « 7 خانات », « 15 خانة ». */
export const cellsOf = (n) => (n <= 10 ? `${n} خانات` : `${n} خانة`);
const left = (r) => (r === 1 ? 'بقيت خانة واحدة' : r === 2 ? 'بقيت خانتان' : `بقيت ${r} خانات`);
/** The wording of a bridge as a case — shared by the forges of this world; a forge overrides what its rule changes. */
export const BRIDGE_TEXT = {
  title: 'مرآة الجزيرة',
  sub: 'اصنع مفتاحك: قاعدة تصمد أمام المرآة.',
  log: 'سجلّ عبورك',
  ask: (c) => `هوّة من ${cellsOf(c.a)}، ولوح طوله ${c.b}. هل يثبت الجسر؟`,
  yes: 'يثبت',
  no: 'ينهار',
  fact: (c) =>
    c.held
      ? 'لم تبقَ أيّ خانة: الجسر ثبت.'
      : c.b > c.a
        ? 'اللوح أطول من الهوّة: الجسر انهار.'
        : `${left(c.r)}: الجسر انهار.`,
  eq: (c) => `$${c.a} = ${c.b} \\times ${c.q} + \\textcolor{${c.held ? '#34d399' : '#fbbf24'}}{${c.r}}$`,
  next: 'جسر آخر',
  frame: 'يثبت الجسر عندما:',
  buildLead: 'اختر بطاقتين. المرآة لا تصدّق أحدًا: ستجرّب قاعدتك على جسورك.',
  testing: 'المرآة تمرّ على جسورك واحدًا واحدًا…',
  says: (yes) => `قاعدتك: ${yes ? 'يثبت' : 'ينهار'}`,
  refuted: (m) =>
    `قاعدتك تقول إنّ جسر ${m.a} باللوح ${m.b} ${m.says ? 'يثبت' : 'ينهار'} — لكنّك رأيته ${m.held ? 'يثبت' : 'ينهار'}.`,
  agreed: 'قاعدتك توافق كلّ الجسور التي رأيتَها. الآن المرآة تتحدّاها بجسر جديد.',
  attack: (c) => `المرآة تتحدّى قاعدتك: هوّة من ${cellsOf(c.a)}، ولوح طوله ${c.b}. ماذا تقول قاعدتك؟`,
  fire: 'ابنِ الجسر',
  survived: 'صمدت قاعدتك: الجسر فعل ما قالته.',
  broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yes ? 'يثبت' : 'ينهار'} »، والجسر ${yes ? 'انهار' : 'ثبت'}.`,
  wordsHint: 'مثال: الجسر يثبت إذا…',
  compare: (cases) => `قارن هذين الجسرين: الهوّة نفسها (${cases[0].a}). ماذا بقي في كلّ مرّة؟`,
  experiment: 'انظر جيّدًا: اللوح نفسه، هوّة ثمّ التي بعدها. ماذا بقي في كلّ مرّة؟',
  useOk: 'مفتاحك يعمل حتّى حيث لا تعدّ!',
};

// ───────────────────── the law of the world: the remainder ─────────────────────
// A rule = { q, c }: a QUANTITY read on the gap (a cells) and the plank (b cells), and a CONDITION on it. It can be evaluated
// on any bridge: that is what lets the game test it and look for the case that breaks it. The class board reads these too.

export const QUANTITIES = [
  {
    id: 'r',
    label: 'باقي قسمة طول الهوّة على طول اللوح',
    short: (a, b) => `باقي قسمة ${a} على ${b}`,
    of: (a, b) => a % b,
  },
  {
    id: 'q',
    label: 'حاصل قسمة طول الهوّة على طول اللوح',
    short: (a, b) => `حاصل قسمة ${a} على ${b}`,
    of: (a, b) => Math.floor(a / b),
  },
  { id: 'b', label: 'طول اللوح', short: () => 'طول اللوح', of: (a, b) => b },
  { id: 'a', label: 'طول الهوّة', short: () => 'طول الهوّة', of: (a) => a },
];
export const CONDITIONS = [
  { id: 'zero', label: 'يساوي 0', yes: 'يساوي 0', no: 'لا يساوي 0', test: (v) => v === 0 },
  { id: 'even', label: 'عدد زوجي', yes: 'عدد زوجي', no: 'عدد فردي', test: (v) => v % 2 === 0 },
  {
    id: 'lessB',
    label: 'أصغر من طول اللوح',
    yes: 'أصغر من طول اللوح',
    no: 'ليس أصغر من طول اللوح',
    test: (v, a, b) => v < b,
  },
  { id: 'gt1', label: 'أكبر من 1', yes: 'أكبر من 1', no: 'ليس أكبر من 1', test: (v) => v > 1 },
];
const Q = Object.fromEntries(QUANTITIES.map((x) => [x.id, x]));
const C = Object.fromEntries(CONDITIONS.map((x) => [x.id, x]));

/** What the student's rule says of a bridge: « it holds » (true) or « it crumbles » (false). */
export const ruleSays = (rule, a, b) => C[rule.c].test(Q[rule.q].of(a, b), a, b);
export const isTheRule = (rule) => rule?.q === 'r' && rule?.c === 'zero';
export const ruleText = (rule) => `يثبت الجسر عندما: ${Q[rule.q].label} ${C[rule.c].label}.`;
/** His rule applied to one bridge, in words: « باقي قسمة 18 على 4 هو 2، و 2 لا يساوي 0: قاعدتك تقول إنّ الجسر ينهار ». */
export function explain(rule, a, b) {
  const v = Q[rule.q].of(a, b);
  const yes = ruleSays(rule, a, b);
  return `${Q[rule.q].short(a, b)} هو ${v}، و ${v} ${yes ? C[rule.c].yes : C[rule.c].no}: قاعدتك تقول إنّ الجسر ${yes ? 'يثبت' : 'ينهار'}.`;
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
    { id: 'q', label: 'ماذا أقرأ؟', options: QUANTITIES.map(({ id, label }) => ({ id, label })) },
    { id: 'c', label: 'كيف يجب أن يكون؟', options: CONDITIONS.map(({ id, label }) => ({ id, label })) },
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
        tokens: [String(c.a), '=', String(c.b), '×', slot('q', 'حاصل القسمة', 3), '+', slot('r', 'الباقي', 2)],
      },
    ],
    check: checkDivision,
  },
  text: {
    ...BRIDGE_TEXT,
    tryKey: (c) =>
      `جرّب مفتاحك حيث لا تستطيع العدّ: هوّة من ${cellsOf(c.a)}، ولوح طوله ${c.b}. المرآة لا تبني هذه المرّة.`,
    use: {
      sum: 'المساواة غير صحيحة: احسب الجداء ثمّ أضف الباقي.',
      big: 'الباقي يجب أن يكون أصغر من طول اللوح.',
      verdict: 'القسمة صحيحة. انظر إلى الباقي: ماذا تقول قاعدتك؟',
    },
    ...text,
  },
});
