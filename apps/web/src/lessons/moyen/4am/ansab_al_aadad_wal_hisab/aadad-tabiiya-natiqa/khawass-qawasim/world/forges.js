/**
 * THE FOUR FORGES of lesson « خواص قواسم عدد طبيعي » — one per key, in the order of the story; no rule of this lesson is
 * told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js; « استكشف »: GAME_WORLD.md). Each opens on an
 * experiment of its own kind (inquiries.js), then the mirror tests and attacks the rule he writes:
 *   jam-wal-farq  join     a plank that fills two gaps fills the gap they make glued, and the gap left when one is cut
 *   madaaf        stack    a plank that fills a gap fills every number of copies of it glued end to end
 *   baqi-qisma    peel     a plank that fills the gap and the bridge fills the piece left (writes: his claim is his rule)
 *   burhan        letters  to be sure for EVERY number: write the condition with letters (k and k′) and the goal as
 *                          d × a natural number (writes: the proof he assembled is his rule)
 * Each rule is a PROMISE (« when [this], then [that] »): the mirror runs it only on the cases its condition takes in
 * (`tests`). In the first two forges the tiles let the student write the false rules students really hold, and exactly
 * ONE rule survives (`forges.test.js` writes every rule of both and refutes each wrong one by a computed case).
 *
 * THE TWO FORGES WHOSE EXPERIMENT WRITES THE RULE (`inquiry.writes`: peel, letters) HOLD NO FALSE TILE (2026-11-19).
 * The kit skips the tiles there (`RuleForge › afterInquiry`: the rule he wrote is attacked at once) and the world's
 * screens hand over only an ACCEPTED claim or a complete proof — so a false tile, a help or a test on his rows could
 * never be shown. Their false rules are refuted where he writes: the table refuses a claim that takes in a plank
 * which does not fill the piece; a false card is answered by numbers (`inquiries.test.js` enumerates both). What
 * these two forges keep is what the mirror plays: the rule (one tile per slot — its sentence on the tablet), the two
 * attacks, the seal, the last step.
 * No forge asks predictions: every one opens on its experiment, which holds them (`predictCases` is the kit's hook,
 * called for every forge — empty here; the words of that step, `text.ask`, `text.fact`, `text.next`, are not written).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import { BRIDGE_TEXT, cellsOf, outcome, pickWith } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { joinOf, stackOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { JOIN_INQUIRY, STACK_INQUIRY, PEEL_INQUIRY, LETTERS_INQUIRY } from './inquiries';

/** An equality inside an Arabic sentence: a formula — the screen renders it with MathText, left to right. */
const math = (s) => ['$', s.replaceAll('×', '\\times'), '$'].join('');
const fill = (yes) => (yes ? 'يملأ' : 'لا يملأ');
const fills = (yes) => (yes ? 'يملؤها' : 'لا يملؤها');
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const options = (list) => list.map(({ id, label }) => ({ id, label }));
/** The kit asks every forge for predictions; here the experiment of each forge has held them: none is asked again. */
const noPredictions = () => [];
/** One line per different case, in the order they came; only the cases of THIS forge (those `own` recognises). */
const keepOwn = (own, idOf) => (rows) =>
  rows.filter((row, i) => own(row) && rows.findIndex((x) => own(x) && idOf(x) === idOf(row)) === i);
/**
 * THE ATTACK of a wrong promise: among the cases its condition takes in and he has not seen, the first one where the
 * world does not do what the rule says — one where the rule says « it fills » and it does not is shown first.
 */
function firstBreak(pool, rule, rows, { cond, says, idOf }) {
  const seen = new Set(rows.map(idOf));
  const free = pool.filter((c) => !seen.has(idOf(c)) && cond(rule, c) && says(rule, c) !== c.held);
  const best = free.find((c) => says(rule, c)) ?? free[0];
  return best ? [best] : [];
}

// ───────────────────────── 1. « المجموع والفرق » — two gaps, glued or cut ─────────────────────────

/** Plank d on the gap made from A and B — glued (`sum`) or B cut off A (`diff`): the bridge the mirror draws is that gap. */
const joinCase = (op, A, B, d) => {
  const j = joinOf(d, A, B, op);
  const c = outcome(j.value, d);
  return {
    ...c,
    op,
    A,
    B,
    d,
    fa: j.fillsA,
    fb: j.fillsB,
    tag: `${op === 'sum' ? `لصق ${A} و ${B}` : `قصّ ${B} من ${A}`}: ${c.held ? 'ثبت' : 'انهار'}`,
  };
};
const joinId = (c) => `${c.op}:${c.A}:${c.B}:${c.d}`;
const madeOf = (c) => (c.op === 'sum' ? `هوّة لصق ${c.A} و ${c.B}` : `هوّة قصّ ${c.B} من ${c.A}`);
const J_IF = [
  { id: 'both', label: 'إذا ملأ اللوح الهوّتين كلتيهما', test: (c) => c.fa && c.fb },
  { id: 'some', label: 'إذا ملأ اللوح إحدى الهوّتين على الأقلّ', test: (c) => c.fa || c.fb },
  { id: 'none', label: 'إذا لم يملأ اللوح أيّ هوّة منهما', test: (c) => !c.fa && !c.fb },
  { id: 'any', label: 'مهما كان اللوح والهوّتان', test: () => true },
];
const J_THEN = [
  { id: 'both', label: 'فإنّه يملأ هوّة اللصق وهوّة القصّ', of: () => true },
  { id: 'sum', label: 'فإنّه يملأ هوّة اللصق، ولا يملأ هوّة القصّ', of: (op) => op === 'sum' },
  { id: 'diff', label: 'فإنّه يملأ هوّة القصّ، ولا يملأ هوّة اللصق', of: (op) => op === 'diff' },
  { id: 'neither', label: 'فإنّه لا يملأ هوّة اللصق ولا هوّة القصّ', of: () => false },
];
const JI = byId(J_IF);
const JT = byId(J_THEN);
const joinCond = (rule, c) => JI[rule.if].test(c);
const joinSays = (rule, c) => JT[rule.then].of(c.op);
const isJoinRule = (rule) => rule?.if === 'both' && rule?.then === 'both';
/**
 * Every pair of gaps a mirror can draw: planks 3 … 9, gaps 6 … 40, the joined gap 11 … 80 — never a gap of a few
 * cells that no plank could be laid on (and « 11 خانة » and more is one agreement of the count: `cellsOf`).
 */
const JOIN_POOL = (() => {
  const out = [];
  for (let A = 6; A <= 40; A += 1)
    for (let B = 6; B <= A; B += 1)
      for (let d = 3; d <= 9; d += 1) {
        if (A + B <= 80) out.push(joinCase('sum', A, B, d));
        if (A - B >= 11) out.push(joinCase('diff', A, B, d));
      }
  return out;
})();

const joinForge = {
  key: 'jam-wal-farq',
  /** He finds it by gluing and cutting gaps (inquiries.js); the mirror then tests his rule on the gaps HE made. */
  inquiry: JOIN_INQUIRY,
  fromInquiry: (result) => ({
    rows: result.rounds.map((x) => joinCase(x.op, x.a, x.b, x.d ?? JOIN_INQUIRY.d)),
  }),
  slots: [
    { id: 'if', label: 'متى؟', options: options(J_IF) },
    { id: 'then', label: 'ماذا يملأ؟', options: options(J_THEN) },
  ],
  says: joinSays,
  isTheRule: isJoinRule,
  ruleText: (rule) => `${JI[rule.if].label}، ${JT[rule.then].label}.`,
  explain(rule, c) {
    const facts = `اللوح ${c.d} ${fill(c.fa)} ${c.A} و${fill(c.fb)} ${c.B}.`;
    if (!joinCond(rule, c)) return `${facts} قاعدتك لا تتكلّم عن هاتين الهوّتين.`;
    return `${facts} قاعدتك تقول إنّه ${fill(joinSays(rule, c))} ${madeOf(c)} (${c.a}).`;
  },
  caseId: joinId,
  evidence: keepOwn((row) => Boolean(row.op), joinId),
  /** The rule is run only on the gaps its condition takes in: a promise says nothing of the others. */
  tests: (rule, rows) => rows.filter((c) => joinCond(rule, c)),
  predictCases: noPredictions,
  /** A wrong rule: the first new pair where the world breaks its promise. The right one: a cut and a long glued gap. */
  attacks(rule, rows) {
    if (!isJoinRule(rule)) return firstBreak(JOIN_POOL, rule, rows, { cond: joinCond, says: joinSays, idOf: joinId });
    const seen = new Set(rows.map(joinId));
    const cut = [joinCase('diff', 45, 27, 9), joinCase('diff', 40, 16, 8)].find((c) => !seen.has(joinId(c)));
    const glued = [joinCase('sum', 40, 24, 8), joinCase('sum', 36, 27, 9)].find((c) => !seen.has(joinId(c)));
    return [cut, glued].filter(Boolean);
  },
  // never a choice between two written rules: three pairs of gaps to look at — both filled, one filled, neither
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [joinCase('sum', 28, 14, 7), joinCase('diff', 28, 14, 7)] };
    if (n === 2) return { kind: 'experiment', cases: [joinCase('sum', 28, 15, 7), joinCase('diff', 28, 15, 7)] };
    return { kind: 'experiment', cases: [joinCase('sum', 23, 19, 7), joinCase('sum', 23, 18, 7)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [d, A, B] = pickWith(rand)([
        [7, 357, 210],
        [9, 414, 243],
        [8, 368, 152],
        [6, 534, 318],
      ]);
      return { d, A, B, held: true };
    },
    lines: (c) => [
      { dir: 'ltr', tokens: [String(c.A), '+', String(c.B), '=', String(c.d), '×', slot('x', 'عدد ألواح اللصق', 3)] },
      { dir: 'ltr', tokens: [String(c.A), '−', String(c.B), '=', String(c.d), '×', slot('y', 'عدد ألواح القصّ', 3)] },
    ],
    check(c, vals) {
      const [p, q] = [c.A / c.d, c.B / c.d];
      if (Number(vals.x) !== p + q) return 'sum';
      return Number(vals.y) === p - q ? 'ok' : 'diff';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة اللصق والقصّ',
    log: 'هوّات صنعتَها',
    yes: 'يملؤها',
    no: 'لا يملؤها',
    eq: (c) => `$${c.A} ${c.op === 'sum' ? '+' : '-'} ${c.B} = ${c.a} = ${c.d} \\times ${c.q} + ${c.r}$`,
    frame: 'لوح وهوّتان:',
    buildLead: 'اختر بطاقتين: متى يملأ اللوح هوّة صُنعت من هوّتين؟ المرآة ستجرّب قاعدتك على الهوّات التي صنعتَها.',
    testing: 'المرآة تمرّ على الهوّات التي صنعتَها، وتسأل قاعدتك عن كلّ واحدة…',
    says: (yes) => `قاعدتك: ${fills(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ اللوح ${m.d} ${fill(m.says)} ${madeOf(m)} — لكنّك رأيته ${m.held ? 'يملؤها' : 'لا يملؤها'}.`,
    agreed: 'قاعدتك توافق كلّ الهوّات التي صنعتَها. الآن المرآة تتحدّاها بهوّة جديدة.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: اللوح ${c.d} ${fill(c.fa)} ${c.A} و${fill(c.fb)} ${c.B}. ${madeOf(c)}: ${cellsOf(c.a)}. ماذا تقول قاعدتك؟`,
    fire: 'اصنع الهوّة',
    survived: 'صمدت قاعدتك: اللوح فعل ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${fills(yes)} »، واللوح ${yes ? 'لم يملأها' : 'ملأها'}.`,
    wordsHint: 'مثال: إذا ملأ اللوح…',
    experiment: 'انظر جيّدًا: هوّتان، ثمّ هوّة صُنعت منهما. هل ملأ اللوح كلّ هوّة قبل أن تُصنع الجديدة؟',
    tryKey: (c) =>
      `اللوح ${c.d} يملأ الهوّة ${c.A} (${planks(c.A / c.d)}) والهوّة ${c.B} (${planks(c.B / c.d)}). المرآة لا تبني: كم لوحًا يملأ هوّة لصقهما، وكم لوحًا يملأ هوّة قصّ ${c.B} من ${c.A}؟`,
    use: {
      sum: 'عُدّ ألواح هوّة اللصق: ألواح الهوّة الأولى، ثمّ ألواح الثانية.',
      diff: 'هوّة القصّ: ألواح الهوّة الأولى، ناقص ألواح الهوّة التي قُصّت.',
    },
    useOk: 'هوّتان صُنعتا دون أيّ قسمة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. « المضاعفات » — copies of one gap ─────────────────────────

const copyWord = (k) => (k === 1 ? 'نسخة' : k === 2 ? 'نسختان' : k <= 10 ? `${k} نسخ` : `${k} نسخة`);
/** Plank d on k copies of the gap `base` glued end to end: the bridge the mirror draws is the whole row. */
const stackCase = (d, base, k) => {
  const s = stackOf(d, base, k);
  const c = outcome(s.total, d);
  return { ...c, d, base, k, fb: s.fillsBase, tag: `${copyWord(k)} من ${base}: ${c.held ? 'ثبت' : 'انهار'}` };
};
const stackId = (c) => `${c.d}:${c.base}:${c.k}`;
/** The copies as an OBJECT (« يملأ … », « نلصق … »): « نسختين منها », « 3 نسخ منها », « 40 نسخة منها ». */
const nCopies = (k) =>
  k === 1 ? 'الهوّة نفسها' : k === 2 ? 'نسختين منها' : k <= 10 ? `${k} نسخ منها` : `${k} نسخة منها`;
const K_IF = [
  { id: 'gap', label: 'إذا ملأ اللوح هوّة', test: (c) => c.fb },
  { id: 'two', label: 'إذا ملأ اللوح نسختين ملصوقتين من هوّة', test: (c) => (2 * c.base) % c.d === 0 },
  { id: 'any', label: 'مهما كان اللوح والهوّة', test: () => true },
  { id: 'not', label: 'إذا لم يملأ اللوح هوّة', test: (c) => !c.fb },
];
const K_THEN = [
  { id: 'all', label: 'فإنّه يملؤها، ويملأ أيّ عدد من نسخها الملصوقة', of: () => true },
  { id: 'even', label: 'فإنّه يملأ نسخها عندما يكون عددها زوجيًّا فقط', of: (k) => k % 2 === 0 },
  { id: 'one', label: 'فإنّه يملؤها وحدها، ولا يملأ نسخها الملصوقة', of: (k) => k === 1 },
  { id: 'none', label: 'فإنّه لا يملؤها ولا يملأ أيّ عدد من نسخها', of: () => false },
];
const KI = byId(K_IF);
const KT = byId(K_THEN);
const stackCond = (rule, c) => KI[rule.if].test(c);
const stackSays = (rule, c) => KT[rule.then].of(c.k);
const isStackRule = (rule) => rule?.if === 'gap' && rule?.then === 'all';
/** Every row of copies a mirror can draw: planks 2 … 9, gaps 3 … 30, 1 … 6 copies, 126 cells at most. */
const STACK_POOL = (() => {
  const out = [];
  for (let k = 1; k <= 6; k += 1)
    for (let base = 3; base <= 30; base += 1)
      for (let d = 2; d <= 9; d += 1) if (d < base && k * base <= 126) out.push(stackCase(d, base, k));
  return out;
})();

const stackForge = {
  key: 'madaaf',
  /** He finds it by gluing copies of one gap (inquiries.js); the mirror then tests his rule on the rows HE glued. */
  inquiry: STACK_INQUIRY,
  fromInquiry: (result) => ({ rows: result.rounds.map((x) => stackCase(x.d, x.base, x.k)) }),
  slots: [
    { id: 'if', label: 'متى؟', options: options(K_IF) },
    { id: 'then', label: 'ماذا يملأ؟', options: options(K_THEN) },
  ],
  says: stackSays,
  isTheRule: isStackRule,
  ruleText: (rule) => `${KI[rule.if].label}، ${KT[rule.then].label}.`,
  explain(rule, c) {
    const facts = `اللوح ${c.d} ${fill(c.fb)} الهوّة ${c.base}.`;
    if (!stackCond(rule, c)) return `${facts} قاعدتك لا تتكلّم عن هذه الهوّة.`;
    return `${facts} قاعدتك تقول إنّه ${fill(stackSays(rule, c))} ${nCopies(c.k)} (${c.a}).`;
  },
  caseId: stackId,
  evidence: keepOwn((row) => Boolean(row.k), stackId),
  tests: (rule, rows) => rows.filter((c) => stackCond(rule, c)),
  predictCases: noPredictions,
  /** A wrong rule: the first new row where the world breaks its promise. The right one: ten copies, an odd plank. */
  attacks(rule, rows) {
    if (!isStackRule(rule))
      return firstBreak(STACK_POOL, rule, rows, { cond: stackCond, says: stackSays, idOf: stackId });
    const seen = new Set(rows.map(stackId));
    return [stackCase(4, 12, 10), stackCase(9, 18, 7), stackCase(7, 21, 5)]
      .filter((c) => !seen.has(stackId(c)))
      .slice(0, 2);
  },
  // never a choice between two written rules: a gap the plank fills, then one it does not, then that one again
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [stackCase(4, 12, 2), stackCase(4, 12, 3)] };
    if (n === 2) return { kind: 'experiment', cases: [stackCase(4, 6, 1), stackCase(4, 6, 2)] };
    return { kind: 'experiment', cases: [stackCase(4, 6, 3), stackCase(4, 6, 4)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [d, base, k] = pickWith(rand)([
        [7, 21, 40],
        [8, 24, 25],
        [9, 27, 12],
        [12, 36, 50],
      ]);
      return { d, base, k, held: true };
    },
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [String(c.k), '×', String(c.base), '=', String(c.d), '×', slot('x', 'عدد الألواح', 4)],
      },
    ],
    check: (c, vals) => (Number(vals.x) === (c.k * c.base) / c.d ? 'ok' : 'count'),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الأبراج',
    log: 'نسخ لصقتَها',
    yes: 'يملؤها',
    no: 'لا يملؤها',
    eq: (c) => `$${c.k} \\times ${c.base} = ${c.a} = ${c.d} \\times ${c.q} + ${c.r}$`,
    frame: 'لوح، وهوّة، ونسخها الملصوقة:',
    buildLead: 'اختر بطاقتين: متى يملأ اللوح نسخًا ملصوقة من هوّة؟ المرآة ستجرّب قاعدتك على النسخ التي لصقتَها.',
    testing: 'المرآة تمرّ على النسخ التي لصقتَها، وتسأل قاعدتك عن كلّ صفّ…',
    says: (yes) => `قاعدتك: ${fills(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ اللوح ${m.d} ${fill(m.says)} ${nCopies(m.k)} (${m.a}) — لكنّك رأيته ${m.held ? 'يملؤها' : 'لا يملؤها'}.`,
    agreed: 'قاعدتك توافق كلّ النسخ التي لصقتَها. الآن المرآة تتحدّاها بنسخ جديدة.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: اللوح ${c.d} ${fill(c.fb)} الهوّة ${c.base}. ${c.k === 1 ? 'نأخذ الهوّة نفسها' : `نلصق ${nCopies(c.k)}`}: ${cellsOf(c.a)}. ماذا تقول قاعدتك؟`,
    fire: 'الصق النسخ',
    survived: 'صمدت قاعدتك: اللوح فعل ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${fills(yes)} »، واللوح ${yes ? 'لم يملأها' : 'ملأها'}.`,
    wordsHint: 'مثال: إذا ملأ اللوح هوّة…',
    experiment: 'انظر جيّدًا: الهوّة نفسها، ونسخها الملصوقة. هل ملأ اللوح الهوّة نفسها قبل أن تُلصق؟',
    tryKey: (c) =>
      `اللوح ${c.d} يملأ الهوّة ${c.base}. نلصق ${nCopies(c.k)}. المرآة لا تبني: كم لوحًا يملأ النسخ الملصوقة؟`,
    use: { count: 'كم لوحًا يملأ الهوّة الواحدة؟ والنسخ الملصوقة تكرّرها.' },
    useOk: 'صفّ طويل من النسخ، دون أيّ قسمة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. « باقي القسمة » — the piece left ─────────────────────────

/** The gap A, bridges of B laid on it until none fits (A = B × Q + R), and the plank d laid on the piece R. */
const pieceCase = (A, B, d) => {
  const Q = Math.floor(A / B);
  const R = A % B;
  return { ...outcome(R, d), A, B, d, Q, R, fa: A % d === 0, fb: B % d === 0 };
};
const pieceId = (c) => `${c.A}:${c.B}:${c.d}`;
/** The rule the table accepted, as the two tiles of its sentence (no other tile exists: see the head of this file). */
const P_IF = [{ id: 'and', label: 'إذا ملأ اللوح الهوّة والجسر معًا' }];
const P_THEN = [{ id: 'r', label: 'فإنّه يملأ القطعة الباقية' }];
const PIECE_RULE = { if: 'and', then: 'r' };
const isPieceRule = (rule) => rule?.if === PIECE_RULE.if && rule?.then === PIECE_RULE.then;

const pieceForge = {
  key: 'baqi-qisma',
  /**
   * He finds it on the table (inquiries.js): the claim he built from its columns and the table accepted IS his rule —
   * the only claim the table accepts (`inquiries.test.js`) — and the mirror attacks it at once.
   */
  inquiry: PEEL_INQUIRY,
  fromInquiry: (result) => ({
    rule: PIECE_RULE,
    rows: result.rounds.flatMap((x) => x.rows.map((y) => pieceCase(x.a, x.b, y.d))),
  }),
  slots: [
    { id: 'if', label: 'متى؟', options: options(P_IF) },
    { id: 'then', label: 'ماذا يملأ؟', options: options(P_THEN) },
  ],
  /** His promise speaks of the planks that fill the gap AND the bridge: of each it says « it fills the piece ». */
  says: () => true,
  isTheRule: isPieceRule,
  ruleText: () => `${P_IF[0].label}، ${P_THEN[0].label}.`,
  explain: (rule, c) =>
    `اللوح ${c.d} ${fill(c.fa)} الهوّة ${c.A} و${fill(c.fb)} الجسر ${c.B}. قاعدتك تقول إنّه يملأ القطعة الباقية (${c.R}).`,
  caseId: pieceId,
  evidence: keepOwn((row) => row.R != null, pieceId),
  predictCases: noPredictions,
  /** Two planks he has not tried, each filling a gap and its bridge: his promise is run on them. */
  attacks(rule, rows) {
    const seen = new Set(rows.map(pieceId));
    return [pieceCase(120, 36, 12), pieceCase(91, 35, 7), pieceCase(110, 44, 11)]
      .filter((c) => !seen.has(pieceId(c)))
      .slice(0, 2);
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B, d] = pickWith(rand)([
        [1001, 385, 7],
        [1155, 420, 35],
        [884, 312, 52],
        [936, 360, 36],
      ]);
      return { A, B, d, held: true };
    },
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [String(c.A), '=', String(c.B), '×', slot('q', 'عدد الجسور', 2), '+', slot('r', 'القطعة الباقية', 3)],
      },
      { dir: 'ltr', tokens: ['r', '=', String(c.d), '×', slot('k', 'عدد الألواح في القطعة', 2)] },
    ],
    check(c, vals) {
      const [q, r, k] = ['q', 'r', 'k'].map((x) => Number(vals[x]));
      if (c.B * q + r !== c.A) return 'division';
      if (r >= c.B) return 'big';
      return c.d * k === r ? 'ok' : 'k';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة البقايا',
    log: 'ألواح جرّبتَها',
    // « القطعة الباقية » is feminine: يملؤها
    yes: 'يملؤها',
    no: 'لا يملؤها',
    eq: (c) => `$${c.A} = ${c.B} \\times ${c.Q} + ${c.R}$`,
    frame: 'هوّة، وجسور توضع عليها، وقطعة تبقى:',
    says: (yes) => `قاعدتك: ${fills(yes)}`,
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: الهوّة ${c.A} والجسر ${c.B} — ${math(`${c.A} = ${c.B} × ${c.Q} + ${c.R}`)}. اللوح ${c.d} ${fill(c.fa)} الهوّة و${fill(c.fb)} الجسر. هل يملأ القطعة الباقية (${c.R})؟ ماذا تقول قاعدتك؟`,
    fire: 'ضع اللوح',
    survived: 'صمدت قاعدتك: اللوح فعل ما قالته.',
    wordsHint: 'مثال: القطعة الباقية يملؤها…',
    tryKey: (c) =>
      `اللوح ${c.d} يملأ الهوّة ${c.A} والجسر ${c.B}. المرآة لا تبني: اكتب قسمة ${c.A} على ${c.B}، ثمّ اكتب القطعة الباقية على شكل جداء.`,
    use: {
      division: `تحقّق: عدد الجسور × طول الجسر + القطعة الباقية يساوي طول الهوّة.`,
      big: 'القطعة الباقية ليست أقصر من الجسر: ما زالت تتّسع لجسر آخر.',
      k: 'القسمة صحيحة. كم لوحًا يدخل في القطعة الباقية؟',
    },
    useOk: 'عرفتَ ما يملأ القطعة قبل أن تُبنى: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. « البرهان » — sure for every number ─────────────────────────

/**
 * A statement « if d … then d divides … » about EVERY number: `cond` its condition, `goal` the number it says d divides
 * (`tex`: that number written with the numbers the mirror tries). `ex`: numbers it holds on; `against`: numbers that break
 * it (only for a false one). Whether it is true is computed (`truthOf`) over a pool of numbers, never typed.
 */
const STATEMENTS = [
  {
    id: 'sum',
    text: 'إذا كان d يقسم a و b، فإنّه يقسم a + b',
    cond: (d, a, b) => a % d === 0 && b % d === 0,
    goal: (a, b) => a + b,
    tex: (a, b) => `${a} + ${b}`,
    ex: [7, 21, 35],
  },
  {
    id: 'conv',
    text: 'إذا كان d يقسم a + b، فإنّه يقسم a',
    cond: (d, a, b) => (a + b) % d === 0,
    goal: (a) => a,
    tex: (a) => `${a}`,
    against: [7, 22, 20],
  },
  {
    id: 'alone',
    text: 'إذا كان d يقسم a، فإنّه يقسم a + b',
    cond: (d, a) => a % d === 0,
    goal: (a, b) => a + b,
    tex: (a, b) => `${a} + ${b}`,
    against: [7, 21, 5],
  },
  {
    id: 'mix',
    text: 'إذا كان d يقسم a و b، فإنّه يقسم 2 × a + 3 × b',
    cond: (d, a, b) => a % d === 0 && b % d === 0,
    goal: (a, b) => 2 * a + 3 * b,
    tex: (a, b) => `2 \\times ${a} + 3 \\times ${b}`,
    ex: [4, 8, 12],
  },
];
/** The numbers the world tries a statement on: d 2 … 9, a and b 1 … 60. */
const NUMBER_POOL = (() => {
  const out = [];
  for (let d = 2; d <= 9; d += 1) for (let a = 1; a <= 60; a += 1) for (let b = 1; b <= 60; b += 1) out.push([d, a, b]);
  return out;
})();
/** Does the statement hold on these numbers? (a case its condition does not take in says nothing against it) */
const holdsAt = (st, [d, a, b]) => !st.cond(d, a, b) || st.goal(a, b) % d === 0;
const truthOf = (st) => NUMBER_POOL.every((t) => holdsAt(st, t));
/** The way of checking he assembled from cards, as the one tile of its sentence (no other tile: see the head of this file). */
const B_HOW = [
  { id: 'two', label: 'أكتب كلّ عدد جداءً في القاسم بحرف جديد لكلّ عدد، ثمّ أكتب ما أريده جداءً في القاسم' },
];
const PROOF_RULE = { how: 'two' };
/** A statement as a case of the mirror: its sentence, and the bridge that shows it — numbers that break it, or an example. */
const statementCase = (st) => {
  const held = truthOf(st);
  const [d, a, b] = held ? st.ex : st.against;
  return {
    ...outcome(st.goal(a, b), d),
    fits: st.goal(a, b) % d === 0,
    held,
    sid: st.id,
    text: st.text,
    nums: { d, a, b },
    goalTex: st.tex(a, b),
  };
};
const CASES = byId(STATEMENTS.map((st) => ({ ...statementCase(st), id: st.id })));
const isProofRule = (rule) => rule?.how === PROOF_RULE.how;
const sid = (c) => c.sid;
const verdict = (yes) => (yes ? 'صحيحة دائمًا' : 'ليست دائمًا');

const proofForge = {
  key: 'burhan',
  /**
   * He finds it at the stone (inquiries.js): numbers, then numbers that change and hide, then a proof from cards. The
   * proof he assembled IS his rule — the mirror attacks it at once with statements he has not seen.
   */
  inquiry: LETTERS_INQUIRY,
  // his evidence: the statement he proved, and the one island A showed him false (22 + 20 with the plank 7)
  fromInquiry: () => ({ rule: PROOF_RULE, rows: [CASES.sum, CASES.conv] }),
  slots: [{ id: 'how', label: 'كيف أتأكّد؟', options: options(B_HOW) }],
  /** Written with a letter for each number, a statement is proved exactly when it is true of every number. */
  says: (rule, c) => c.held,
  isTheRule: isProofRule,
  ruleText: () => `لأتأكّد أنّ جملة صحيحة لكلّ الأعداد: ${B_HOW[0].label}.`,
  explain: (rule, c) =>
    `قاعدتك تكتب الجملة بالحروف: تقول إنّها ${c.held ? 'صحيحة لكلّ الأعداد' : 'ليست صحيحة دائمًا'}.`,
  caseId: sid,
  evidence: keepOwn((row) => Boolean(row.sid), sid),
  predictCases: noPredictions,
  /** A trap — « d divides a », nothing said of b — and a true statement: two he has not seen. */
  attacks(rule, rows) {
    const seen = new Set(rows.map(sid));
    return [CASES.alone, CASES.mix].filter((c) => !seen.has(c.sid));
  },
  use: {
    make: (rand = Math.random) => {
      const [d, k, k2] = pickWith(rand)([
        [5, 8, 11],
        [9, 12, 5],
        [7, 14, 9],
        [6, 13, 7],
      ]);
      return { d, k, k2, held: true };
    },
    lines: () => [
      { dir: 'ltr', tokens: ['3a + 2b', '=', 'd', '×', slot('x', 'العدد الطبيعي', 3)] },
      { dir: 'ltr', tokens: ['a + b', '=', 'd', '×', slot('y', 'العدد الطبيعي', 3)] },
    ],
    check(c, vals) {
      if (Number(vals.x) !== 3 * c.k + 2 * c.k2) return 'mix';
      return Number(vals.y) === c.k + c.k2 ? 'ok' : 'sum';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    // the island's name: its stone — the word « حروف » comes with the tablet, after he has found them
    title: 'مرآة جزيرة الحجر',
    log: 'جمل رأيتَها',
    yes: verdict(true),
    no: verdict(false),
    // the numbers the mirror tries, then what the plank does on them: « 21 + 5 = 26 = 7 × 3 + 5 »
    eq: (c) => `$${c.goalTex} = ${c.a} = ${c.b} \\times ${c.q} + ${c.r}$`,
    frame: 'لأتأكّد أنّ جملة صحيحة لكلّ الأعداد:',
    says: (yes) => `قاعدتك: ${verdict(yes)}`,
    attack: () => 'المرآة تتحدّى قاعدتك بجملة جديدة: هل هي صحيحة لكلّ الأعداد؟ ماذا تقول قاعدتك؟',
    fire: 'جرّب كلّ الأعداد',
    survived: 'صمدت قاعدتك: حكمت كما حكمت الأعداد.',
    wordsHint: 'مثال: لأتأكّد لكلّ الأعداد…',
    tryKey: (c) =>
      `$a = ${c.d} \\times ${c.k}$ و $b = ${c.d} \\times ${c.k2}$، أي $d = ${c.d}$ و $k = ${c.k}$ و $k' = ${c.k2}$. المرآة لا تبني: اكتب $3a + 2b$ ثمّ $a + b$ على شكل جداء: $d$ في عدد طبيعي.`,
    use: {
      mix: 'اكتب 3a و 2b بالعددين k و k′: ما العدد الذي يُضرب في d؟',
      sum: 'اكتب a و b بالعددين k و k′: ما العدد الذي يُضرب في d؟',
    },
    useOk: 'كتبتَ الجداء دون أن تحسب a و b: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'jam-wal-farq': joinForge,
  madaaf: stackForge,
  'baqi-qisma': pieceForge,
  burhan: proofForge,
};
