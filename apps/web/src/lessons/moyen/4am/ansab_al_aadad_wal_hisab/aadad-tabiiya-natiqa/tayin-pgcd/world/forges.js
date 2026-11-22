/**
 * THE THREE FORGES of lesson « تعيين القاسم المشترك الأكبر لعددين طبيعيين » — one per key, in the order of the story; no
 * rule of this lesson is told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js). Every key is MET ON THE
 * ISLANDS (owner, 2026-11-19; GAME_WORLD.md §2ter-1 « A situation lived on the islands »; BATCH_2_DESIGN.md §7): he makes
 * his plank in a workshop for two gaps, and a purse — a coin per plank, whatever its length — only pays the right one. So
 * no forge has an `inquiry`: its evidence is what he did on the islands (`evidence(log)`, the world's log of bridges
 * `[{ a, b }]`), `predictCases` returns none and the kit opens it on its TILES (kit/RuleForge.jsx). Then the mirror tests
 * his rule on his rows, attacks it, he seals it, USES it in a last step, and only then the tablet names it.
 *
 *   hasr-wa-taqatu    📋 island C — convoy « lists » (32 then 44, 19 coins): the PROCEDURE that tells which plank to
 *                     make — which planks he writes (each gap's, the shorter gap's, the longer's, the difference's), which
 *                     he keeps (in every row, in one at least), which he makes (the longest, the shortest): 3 slots, 16 rules
 *   nataij-mubashira  ⚡ island G — convoys « same » (27, 27; 2 coins) and « full » (27, 0; 1 coin): the plank for two
 *                     gaps of one length, for a gap and a gap of 0 cells, for a gap and a gap of one cell, for a pair
 *                     turned round — 4 slots of 2 tiles, 16 rules
 *   b-yaqsim-a        🎯 island I — convoy « nest » (19, 76; 5 coins): when a plank as long as the shorter gap fills the
 *                     longer, which plank; and when it does not — 2 slots, 9 rules (« always the shorter gap » falls on
 *                     90 and 36, `NUMBERS.against`)
 * A case is ONE plank d asked of a PAIR of gaps A and B (`pair`, drawn as two bridges by divisorIsles/forgeParts.jsx, its
 * line naming both gaps and the planks the two bridges take — `need`). What the world does with it (`held`): d builds both
 * bridges with the coins of the purse — the purse holds exactly the planks the right plank needs (`purse` = A ÷ g + B ÷ g,
 * g the longest plank that fills both), so `held` is d = g. In each forge exactly ONE rule holds; `forges.test.js` writes
 * every rule the tiles allow and refutes each wrong one by a computed case — on his rows, or by the first new case the
 * world finds where it breaks (`firstBreak`), also when he made the right plank at once.
 * The words of a key's name never appear in its forge before its tablet (tested): 📋 neither « قاسم » nor « PGCD » before
 * its last step (which is about numbers), ⚡ never « مباشرة », 🎯 never « يقسم ».
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { BRIDGE_TEXT, outcome, pickWith } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import { COINS, NUMBERS, commonDivisors, counted, divisorsOf, gcd } from './math';

const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const options = (list) => list.map(({ id, label }) => ({ id, label }));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
/** Computed once, when a forge first needs it (the pools of the attacks are not built at import). */
const lazy = (make) => {
  let value = null;
  return () => (value ??= make());
};
/** The islands held the predictions: none is asked, the forge opens on its tiles. */
const noPredictions = () => [];
/** Planks as the object of a verb: « يحتاج لوحين », « 10 ألواح », « 38 لوحًا ». */
const PLANKS_OBJ = ['لوحًا واحدًا', 'لوحين', 'ألواح', 'لوحًا'];
const coins = (n) => counted(n, COINS);

/**
 * The pairs this lesson's exercise bank names (content/practice/4am/tayin-pgcd, both numbers up to 100): the mirror never
 * draws one of them (`story.test.js` reads the bank the same way; `forges.test.js` checks every case the mirror shows).
 */
const BANK_PAIRS = new Set(
  (
    '0;7 0;45 0;91 8;40 8;88 15;30 15;35 15;45 15;50 18;36 21;35 21;42 21;84 27;30 28;28 32;96 36;54 36;60 39;65 ' +
    '42;60 42;98 45;45 48;72 49;63 51;85 52;91 54;81 57;95 75;90 91;91'
  ).split(' '),
);
const pairKey = (x, y) => [x, y].sort((p, q) => p - q).join(';');
const notInBank = (A, B) => !BANK_PAIRS.has(pairKey(A, B));

// ───────────────────────── a case: one plank on a pair of gaps, and a purse ─────────────────────────

/**
 * The plank d on the gaps A then B (B may be 0: a gap whose bridge stands). The mirror draws the PAIR; `a`, `b`, `q`, `r`
 * are the bridge of the pair the plank does not fill (else the longer gap), as a bridge case of this world carries them.
 */
const plankCase = (of, A, B, d, extra = {}) => {
  const fa = A % d === 0;
  const fb = B % d === 0;
  const fits = fa && fb;
  const g = gcd(A, B);
  const need = fits ? A / d + B / d : null;
  return {
    ...outcome(!fa ? A : !fb ? B : Math.max(A, B), d),
    of,
    A,
    B,
    d,
    fa,
    fb,
    fits,
    g,
    need,
    purse: A / g + B / g,
    held: d === g,
    pair: { a: A, b: B, d, ...(need != null ? { need } : {}) },
    // the line names both gaps and the plank: the tag is what the two bridges take, short (one line of the log)
    tag: fits ? planks(need) : 'لا يملؤهما',
    ...extra,
  };
};
const caseId = (c) => `${c.A}:${c.B}:${c.d}`;
/** The two divisions of a pair by a plank, as one formula: « 32 = 4 × 8 + 0     44 = 4 × 11 + 0 ». */
const twoDivisions = (A, B, d) =>
  `${A} = ${d} \\times ${Math.floor(A / d)} + ${A % d} \\qquad ${B} = ${d} \\times ${Math.floor(B / d)} + ${B % d}`;
const eqOf = (c) =>
  c.fits && !c.held
    ? `$${twoDivisions(c.A, c.B, c.d)} \\qquad ${c.A} = ${c.g} \\times ${c.A / c.g} \\qquad ${c.B} = ${c.g} \\times ${c.B / c.g}$`
    : `$${twoDivisions(c.A, c.B, c.d)}$`;

/** What the world answers, in words: does the plank build both bridges with the coins of the purse? */
const builds = (yes) => (yes ? 'يبنيهما بقطع الكيس' : 'لا يبنيهما بقطع الكيس');
/** Why the world did what it did with a case (a plain sentence: the screen does not render it as a formula). */
const why = (c) =>
  c.held
    ? `اللوح ${c.d} بناهما بقطع الكيس كلّها: ${coins(c.need)}`
    : !c.fits
      ? `اللوح ${c.d} لا يملأ ${c.fa ? c.B : c.A}`
      : `اللوح ${c.d} يحتاج ${counted(c.need, PLANKS_OBJ)}، وفي الكيس ${coins(c.purse)}`;

/**
 * His evidence from the world's log: every plank he fired on the gaps of the convoy is ONE case of the pair (`fromRow`),
 * his own lines first (oldest first, one per plank), then the cases the story guarantees he lived — he cannot stand at
 * this mirror otherwise — when the log no longer holds them, then the cases the mirror built in front of him.
 */
const gather = (own, fromRow, facts) => (rows) => {
  const list = rows.flatMap((row) => (own(row) ? [row] : row.of == null && !row.mirror ? fromRow(row) : []));
  const uniq = list.filter((c, i) => list.findIndex((x) => caseId(x) === caseId(c)) === i);
  const his = uniq.filter((c) => !c.mirror);
  const lived = facts.filter((f) => !his.some((c) => caseId(c) === caseId(f)));
  return [...his, ...lived, ...uniq.filter((c) => c.mirror)];
};
/**
 * THE ATTACK of a wrong rule: among the cases he has not seen, the first one where the world does not do what the rule
 * says — one where the rule says « yes » and the world says « no » is shown first.
 */
function firstBreak(pool, rule, rows, says) {
  const seen = new Set(rows.map(caseId));
  const free = pool.filter((c) => !seen.has(caseId(c)) && says(rule, c) !== c.held);
  const best = free.find((c) => says(rule, c)) ?? free[0];
  return best ? [best] : [];
}
/** The right rule: its hard cases, those he has not seen (two: one the purse pays, one it does not). */
const hard = (rows, list) => {
  const seen = new Set(rows.map(caseId));
  const left = list.filter((c) => !seen.has(caseId(c)));
  const yes = left.find((c) => c.held);
  const no = left.find((c) => !c.held);
  return [no, yes].filter(Boolean);
};
/** Small pairs a mirror can draw (A < B ≤ max, never a pair of the bank), every plank whose bridge it can lay. */
const pairPool = (make, from, to, max) =>
  range(from, to).flatMap((A) =>
    range(A + 1, max)
      .filter((B) => notInBank(A, B))
      .flatMap((B) =>
        range(1, B)
          .map((d) => make(A, B, d))
          .filter((c) => c.q <= 40),
      ),
  );
/** The words every forge of this lesson shares (the case is a plank on two gaps, with a purse). */
const PAIR_TEXT = {
  ...BRIDGE_TEXT,
  yes: builds(true),
  no: builds(false),
  eq: eqOf,
  testing: 'المرآة تمرّ على الألواح التي صنعتَها، وتسأل قاعدتك عن كلّ لوح…',
  says: (yes) => `قاعدتك: ${builds(yes)}`,
  refuted: (m) =>
    `قاعدتك تقول إنّ اللوح ${m.d} ${m.says ? 'يبني' : 'لا يبني'} جسري ${m.A} و ${m.B} بقطع الكيس — لكنّ ${why(m)}.`,
  agreed: 'قاعدتك توافق كلّ الألواح التي صنعتَها. الآن المرآة تتحدّاها بهوّتين أخريين.',
  fire: 'ضع اللوح',
  survived: 'صمدت قاعدتك: الكيس والجسران فعلوا ما قالته.',
  broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${builds(yes)} »، والجسران قالا « ${builds(!yes)} ».`,
  log: 'ألواح صنعتَها',
};
/** The question of an attack: the two gaps, the purse, the plank. */
const attackOf = (c, gaps = `الهوّتان ${c.A} و ${c.B}`) =>
  `المرآة تتحدّى قاعدتك: ${gaps}، وفي الكيس ${coins(c.purse)}. اللوح ${c.d}: هل يبنيهما بقطع الكيس؟ ماذا تقول قاعدتك؟`;
/** A set typed one number per box, in braces, its name at the right: « قواسم 58 : { … ; … } ». */
const setLine = (prefix, n, label) => ({
  dir: 'ltr',
  tokens: [
    '{',
    ...range(1, n).flatMap((i) => [...(i > 1 ? [';'] : []), slot(`${prefix}${i}`, label, 2)]),
    '}',
    ':',
    label,
  ],
});
/** The numbers typed in the boxes of one set: none outside it, none twice (every box is filled, so it is the whole set). */
const checkSet = (prefix, members, vals) => {
  const typed = Object.keys(vals)
    .filter((k) => new RegExp(`^${prefix}\\d+$`).test(k))
    .map((k) => Number(vals[k]));
  if (typed.some((v) => !members.includes(v))) return 'intruder';
  return new Set(typed).size === typed.length ? 'ok' : 'twice';
};

// ───────────────────────── 1. 📋 « احصر القواسم ثم قاطعها » — which plank to make, and how he knew ─────────────────────────
// The islands A–C were the experiment (convoy « lists »): no plank offered, a workshop where he types the plank's length
// and a bench that lists the planks of each gap (inquiries.js › LISTS_BENCH); 8 or 16 fill 32 and not 44, 2 runs out of
// coins on 44, 1 on 32, 11 fills 44 only; 4 builds both with the 19 coins. His evidence: every plank he made.

const [L1, L2] = NUMBERS.lists.gaps;
const hasrCase = (A, B, d) => plankCase('hasr', A, B, d);
/** Which rows of planks he writes. */
const H_ROWS = [
  { id: 'each', label: 'ألواح كلّ هوّة من الهوّتين', of: (A, B) => [divisorsOf(A), divisorsOf(B)] },
  { id: 'short', label: 'ألواح الهوّة الأقصر وحدها', of: (A, B) => [divisorsOf(Math.min(A, B))] },
  { id: 'long', label: 'ألواح الهوّة الأطول وحدها', of: (A, B) => [divisorsOf(Math.max(A, B))] },
  { id: 'diff', label: 'ألواح هوّة طولها فرق الهوّتين', of: (A, B) => [divisorsOf(Math.abs(A - B))] },
];
/** Which planks of those rows he keeps. */
const H_KEEP = [
  { id: 'every', label: 'الموجودة في كلّ سطر', of: (rows) => rows.reduce((x, r) => x.filter((d) => r.includes(d))) },
  { id: 'one', label: 'الموجودة في سطر واحد على الأقلّ', of: (rows) => [...new Set(rows.flat())] },
];
/** Which of the planks kept he makes. */
const H_MAKE = [
  { id: 'longest', label: 'أطولها', of: (list) => Math.max(...list) },
  { id: 'shortest', label: 'أقصرها', of: (list) => Math.min(...list) },
];
const HR = byId(H_ROWS);
const HK = byId(H_KEEP);
const HM = byId(H_MAKE);
/** The plank his procedure makes for the gaps A and B. */
const hasrMakes = (rule, A, B) => HM[rule.make].of(HK[rule.keep].of(HR[rule.rows].of(A, B)));
const hasrSays = (rule, c) => c.d === hasrMakes(rule, c.A, c.B);
const isHasrRule = (rule) => rule?.rows === 'each' && rule?.keep === 'every' && rule?.make === 'longest';
const HASR_POOL = lazy(() => pairPool(hasrCase, 6, 30, 40));
const HASR_CHIP = { rows: 'أكتب', keep: 'أُبقي', make: 'أصنع' };
const [U1, U2] = NUMBERS.use.gaps;

const hasrForge = {
  key: 'hasr-wa-taqatu',
  slots: [
    { id: 'rows', label: 'أكتب في الدفتر…', options: options(H_ROWS) },
    { id: 'keep', label: 'ثمّ أُبقي الألواح…', options: options(H_KEEP) },
    { id: 'make', label: 'وأصنع…', options: options(H_MAKE) },
  ],
  chip: (s, o) => `${HASR_CHIP[s.id]} ${o.label}`,
  says: hasrSays,
  isTheRule: isHasrRule,
  ruleText: (rule) =>
    `لأعرف أيّ لوح أصنع لهوّتين: أكتب ${HR[rule.rows].label}، ثمّ أُبقي ${HK[rule.keep].label}، وأصنع ${HM[rule.make].label}.`,
  explain: (rule, c) =>
    `قاعدتك تصنع للهوّتين ${c.A} و ${c.B} اللوح ${hasrMakes(rule, c.A, c.B)}: تقول إنّ اللوح ${c.d} ${builds(hasrSays(rule, c))}.`,
  caseId,
  evidence: gather(
    (row) => row.of === 'hasr',
    (row) => (NUMBERS.lists.gaps.includes(row.a) ? [hasrCase(L1, L2, row.b)] : []),
    // he crossed both gaps with the plank 4: island C cannot be reached otherwise
    [hasrCase(L1, L2, NUMBERS.lists.plank)],
  ),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isHasrRule(rule)) return firstBreak(HASR_POOL(), rule, rows, hasrSays);
    // the shorter gap is not the plank, the difference is; a plank of both that the purse does not pay
    return hard(rows, [hasrCase(24, 36, 12), hasrCase(30, 45, 5), hasrCase(30, 45, 15)]);
  },
  // never a choice between two written rules: two more planks on a pair, one the purse pays and one it does not
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [hasrCase(12, 18, 6), hasrCase(12, 18, 3)] };
    if (n === 2) return { kind: 'experiment', cases: [hasrCase(20, 30, 10), hasrCase(20, 30, 5)] };
    return { kind: 'experiment', cases: [hasrCase(16, 40, 8), hasrCase(16, 40, 16)] };
  },
  use: {
    make: () => {
      const da = divisorsOf(U1);
      const db = divisorsOf(U2);
      return { A: U1, B: U2, da, db, common: commonDivisors(U1, U2), g: gcd(U1, U2), held: true };
    },
    lines: (c) => [
      setLine('a', c.da.length, `قواسم ${c.A}`),
      setLine('b', c.db.length, `قواسم ${c.B}`),
      setLine('c', c.common.length, 'القواسم المشتركة'),
      { dir: 'ltr', tokens: [`PGCD(${c.A} ; ${c.B})`, '=', slot('g', 'PGCD', 2)] },
    ],
    check(c, vals) {
      const a = checkSet('a', c.da, vals);
      if (a !== 'ok') return `${a}A`;
      const b = checkSet('b', c.db, vals);
      if (b !== 'ok') return `${b}B`;
      const common = checkSet('c', c.common, vals);
      if (common !== 'ok') return `${common}C`;
      const g = Number(vals.g);
      if (g === c.g) return 'ok';
      return c.common.includes(g) ? 'longer' : 'pgcd';
    },
  },
  text: {
    ...PAIR_TEXT,
    title: 'مرآة جزيرة النوارس',
    frame: 'لأعرف أيّ لوح أصنع لهوّتين:',
    buildLead: `اختر بطاقة من كلّ عمود: كيف عرفتَ أيّ لوح تصنع؟ المرآة ستجرّب قاعدتك على الألواح التي صنعتَها للهوّتين ${L1} و ${L2}.`,
    attack: (c) => attackOf(c),
    wordsHint: 'مثال: أكتب… ثمّ…',
    experiment: 'انظر جيّدًا: هوّتان ولوحان، والكيس لا يكفي إلّا لواحد منهما. ماذا يفعل كلّ لوح في الهوّتين؟',
    tryKey: (c) =>
      `المرآة لا تبني: طبّق قاعدتك على العددين ${c.A} و ${c.B}. اكتب كلّ عدد في خانة، ثمّ $\\mathrm{PGCD}(${c.A} ; ${c.B})$.`,
    use: {
      intruderA: 'في السطر الأوّل عدد لا يقسم العدد الأوّل: اقسمه عليه.',
      twiceA: 'كتبتَ عددًا مرّتين في السطر الأوّل: لكلّ قاسم خانة واحدة.',
      intruderB: 'في السطر الثاني عدد لا يقسم العدد الثاني: اقسمه عليه.',
      twiceB: 'كتبتَ عددًا مرّتين في السطر الثاني: لكلّ قاسم خانة واحدة.',
      intruderC: 'في سطر القواسم المشتركة عدد غير موجود في السطرين الأوّلين.',
      twiceC: 'كتبتَ عددًا مرّتين في سطر القواسم المشتركة.',
      longer: 'هذا العدد في السطرين، لكنّ في سطر القواسم المشتركة عددًا أكبر منه.',
      pgcd: 'هذا العدد ليس في سطر القواسم المشتركة.',
    },
    useOk: 'كتبتَ القواسم، وأبقيتَ المشتركة، وأخذتَ أكبرها دون أن يوضع لوح واحد: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. ⚡ « نتائج مباشرة » — pairs whose plank needs no rows ─────────────────────────
// The islands C–G were the experiment: two gaps of 27 with 2 coins (one plank of 27 for each), then 27 and a gap of 0
// cells — its bridge stands from the start — with 1 coin. His rows: those two crossings, guaranteed by the story (the world
// logs no gap of 0, and the three gaps of 27 are ONE line of its log), then every other plank he made for a gap of 27.

const [S1, S2] = NUMBERS.same.gaps;
const [F1, F2] = NUMBERS.full.gaps;
/** The pair turned round that the mirror asks about: the gaps of island A, 44 then 32 — he built 32 then 44. */
const TURN = [L2, L1];
/** kind: same (a ; a) | zero (a ; 0) | one (a ; 1) | turn (the pair he knows, turned round). */
const directCase = (kind, A, B, d) => plankCase('direct', A, B, d, { kind });
const D_SAME = [
  { id: 'their', label: 'لوح بطولهما', of: (c) => c.A },
  { id: 'unit', label: 'لوح طوله 1', of: () => 1 },
];
const D_ZERO = [
  { id: 'other', label: 'لوح بطول الهوّة الأخرى', of: (c) => c.A },
  { id: 'none', label: 'لوح طوله 0', of: () => 0 },
];
const D_ONE = [
  { id: 'unit', label: 'لوح طوله 1', of: () => 1 },
  { id: 'other', label: 'لوح بطول الهوّة الأخرى', of: (c) => c.A },
];
const D_TURN = [
  { id: 'same', label: 'اللوح نفسه', says: (c) => c.d === gcd(c.B, c.A) },
  { id: 'another', label: 'لوح آخر', says: (c) => c.d !== gcd(c.B, c.A) },
];
const DS = byId(D_SAME);
const DZ = byId(D_ZERO);
const DO = byId(D_ONE);
const DT = byId(D_TURN);
const directSays = (rule, c) => {
  if (c.kind === 'turn') return DT[rule.turn].says(c);
  const make = { same: DS[rule.same], zero: DZ[rule.zero], one: DO[rule.one] }[c.kind];
  return c.d === make.of(c);
};
const isDirectRule = (rule) =>
  rule?.same === 'their' && rule?.zero === 'other' && rule?.one === 'unit' && rule?.turn === 'same';
/** The plank his rule makes for a case (a number; for a pair turned round, what it says of the plank asked). */
const directMakes = (rule, c) => {
  if (c.kind === 'same') return DS[rule.same].of(c);
  if (c.kind === 'zero') return DZ[rule.zero].of(c);
  return DO[rule.one].of(c);
};
/** The cases the mirror can show: the two the brief names first, then pairs of every kind (never a pair of the bank). */
const DIRECT_POOL = lazy(() => [
  directCase('one', 27, 1, 27),
  directCase('one', 27, 1, 1),
  ...[8, 2, 4, 11].map((d) => directCase('turn', ...TURN, d)),
  ...range(6, 40)
    .filter((a) => notInBank(a, a) && notInBank(a, 0))
    .flatMap((a) =>
      range(1, a).flatMap((d) => [
        directCase('same', a, a, d),
        directCase('zero', a, 0, d),
        directCase('one', a, 1, d),
      ]),
    )
    .filter((c) => c.q <= 40),
]);
const turnedFrom = (c) => `${c.B} ثمّ ${c.A}`;

const directForge = {
  key: 'nataij-mubashira',
  slots: [
    { id: 'same', label: 'هوّتان متساويتان', options: options(D_SAME) },
    { id: 'zero', label: 'هوّة وهوّة من 0 خانة', options: options(D_ZERO) },
    { id: 'one', label: 'هوّة وهوّة من خانة', options: options(D_ONE) },
    { id: 'turn', label: 'الترتيب المعكوس', options: options(D_TURN) },
  ],
  chip: (s, o) => `${s.label}: ${o.label}`,
  says: directSays,
  isTheRule: isDirectRule,
  ruleText: (rule) =>
    `لأبني هوّتين بقطع الكيس: لهوّتين متساويتين ${DS[rule.same].label}؛ لهوّة وهوّة من 0 خانة ${DZ[rule.zero].label}؛ لهوّة وهوّة من خانة ${DO[rule.one].label}؛ وللهوّتين بالترتيب المعكوس ${DT[rule.turn].label}.`,
  explain(rule, c) {
    if (c.kind === 'turn')
      return `بنيتَ ${turnedFrom(c)} باللوح ${gcd(c.A, c.B)}. قاعدتك تقول: بالترتيب المعكوس ${DT[rule.turn].label}، فاللوح ${c.d} ${builds(directSays(rule, c))}.`;
    return `قاعدتك تصنع للهوّتين ${c.A} و ${c.B} اللوح ${directMakes(rule, c)}: تقول إنّ اللوح ${c.d} ${builds(directSays(rule, c))}.`;
  },
  caseId,
  evidence: gather(
    (row) => row.of === 'direct',
    (row) => (row.a === S1 ? [directCase('same', S1, S2, row.b)] : []),
    [directCase('same', S1, S2, NUMBERS.same.plank), directCase('zero', F1, F2, NUMBERS.full.plank)],
  ),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isDirectRule(rule)) return firstBreak(DIRECT_POOL(), rule, rows, directSays);
    // a gap of one cell, where the long plank is no plank of both; the pair of island A turned round
    return hard(rows, [directCase('one', 27, 1, 27), directCase('turn', ...TURN, 4), directCase('one', 33, 1, 1)]);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [directCase('same', 14, 14, 14), directCase('same', 14, 14, 7)] };
    if (n === 2) return { kind: 'experiment', cases: [directCase('zero', 16, 0, 16), directCase('zero', 16, 0, 4)] };
    return { kind: 'experiment', cases: [directCase('one', 13, 1, 1), directCase('one', 13, 1, 13)] };
  },
  use: {
    make: (rand = Math.random) => {
      const pick = pickWith(rand);
      return {
        same: pick([53, 61, 47]),
        zero: pick([64, 86, 92]),
        one: pick([73, 79, 83]),
        turn: [U2, U1],
        held: true,
      };
    },
    lines: (c) => [
      { dir: 'ltr', tokens: [`PGCD(${c.same} ; ${c.same})`, '=', slot('s', 'PGCD', 2)] },
      { dir: 'ltr', tokens: [`PGCD(${c.zero} ; 0)`, '=', slot('z', 'PGCD', 2)] },
      { dir: 'ltr', tokens: [`PGCD(1 ; ${c.one})`, '=', slot('o', 'PGCD', 2)] },
      { dir: 'ltr', tokens: [`PGCD(${c.turn[0]} ; ${c.turn[1]})`, '=', slot('t', 'PGCD', 2)] },
    ],
    check(c, vals) {
      const v = (k) => Number(vals[k]);
      if (v('s') !== c.same) return 'same';
      if (v('z') !== c.zero) return 'zero';
      if (v('o') !== 1) return 'one';
      return v('t') === gcd(...c.turn) ? 'ok' : 'turn';
    },
  },
  text: {
    ...PAIR_TEXT,
    title: 'مرآة جزيرة الصواري',
    frame: 'لأبني هوّتين بقطع الكيس أصنع:',
    buildLead: `اختر بطاقة من كلّ عمود: أيّ لوح تصنع لكلّ زوج من هذه الهوّات؟ المرآة ستجرّب قاعدتك على ما بنيتَه: ${S1}\u00a0و\u00a0${S2}، ثمّ ${F1}\u00a0و\u00a0${F2}.`,
    attack: (c) =>
      attackOf(c, c.kind === 'turn' ? `الهوّتان ${c.A} ثمّ ${c.B}، أي ${turnedFrom(c)} بترتيب معكوس` : undefined),
    wordsHint: 'مثال: لهوّتين متساويتين…',
    experiment: 'انظر جيّدًا: زوج من الهوّات ولوحان، والكيس لا يكفي إلّا لواحد منهما. ماذا يفعل كلّ لوح؟',
    tryKey: (c) =>
      `المرآة لا تبني، ولا تكتب أيّ قائمة: اكتب كلّ عدد. وتذكّر: $\\mathrm{PGCD}(${c.turn[1]} ; ${c.turn[0]}) = ${gcd(...c.turn)}$.`,
    use: {
      same: 'العددان متساويان: أطول لوح يملأ الهوّة الأولى يملأ الثانية.',
      zero: 'هوّة من 0 خانة لا تحتاج لوحًا: كلّ لوح يملؤها. انظر إلى العدد الآخر وحده.',
      one: 'هوّة من خانة واحدة: لا يملؤها إلّا لوح واحد.',
      turn: 'الهوّتان نفسهما بترتيب معكوس: الجسران لا يتغيّران.',
    },
    useOk: 'كتبتَ الأعداد الأربعة دون أيّ قائمة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. 🎯 « عندما يقسم الأصغر الأكبر » — the shorter gap as the plank ─────────────────────────
// The islands G–I were the experiment (convoy « nest »): 19 then 76, 5 coins — the plank 19 builds both (1 + 4). His
// rows: every plank he made for 19 or 76. The mirror's attacks hold 90 and 36, where 36 does NOT fill 90 (7 coins: 18).

const [N1, N2] = NUMBERS.nest.gaps;
const [AG1, AG2] = NUMBERS.against.gaps;
const nestCase = (A, B, d) => plankCase('nest', A, B, d);
/** When a plank as long as the shorter gap fills the longer: the plank he makes. */
const N_FILLS = [
  { id: 'short', label: 'لوح بطول الهوّة الأقصر', of: (s) => s },
  { id: 'long', label: 'لوح بطول الهوّة الأطول', of: (s, l) => l },
  { id: 'times', label: 'لوح طوله عدد مرّات الأقصر في الأطول', of: (s, l) => l / s },
];
/** When it does not fill it. */
const N_ELSE = [
  { id: 'rows', label: 'أطول لوح في سطري الهوّتين معًا', of: (s, l) => gcd(s, l) },
  { id: 'short', label: 'لوح بطول الهوّة الأقصر أيضًا', of: (s) => s },
  { id: 'diff', label: 'لوح طوله فرق الهوّتين', of: (s, l) => l - s },
];
const NF = byId(N_FILLS);
const NE = byId(N_ELSE);
const nestMakes = (rule, A, B) => {
  const s = Math.min(A, B);
  const l = Math.max(A, B);
  return l % s === 0 ? NF[rule.fills].of(s, l) : NE[rule.else].of(s, l);
};
const nestSays = (rule, c) => c.d === nestMakes(rule, c.A, c.B);
const isNestRule = (rule) => rule?.fills === 'short' && rule?.else === 'rows';
const NEST_POOL = lazy(() => [
  // the pair the brief names comes first: the shorter gap does not fill the longer
  ...[36, 54, 18, 9].map((d) => nestCase(AG1, AG2, d)),
  ...pairPool(nestCase, 6, 30, 60),
]);
const fillsWord = (c) => {
  const s = Math.min(c.A, c.B);
  const l = Math.max(c.A, c.B);
  return l % s === 0 ? `لوح طوله ${s} يملأ ${l}` : `لوح طوله ${s} لا يملأ ${l}`;
};

const nestForge = {
  key: 'b-yaqsim-a',
  slots: [
    { id: 'fills', label: 'إن ملأ لوحٌ بطول الهوّة الأقصر الأطولَ:', options: options(N_FILLS) },
    { id: 'else', label: 'وإن لم يملأها:', options: options(N_ELSE) },
  ],
  chip: (s, o) => `${s.id === 'fills' ? 'إن ملأها لوح بطول الأقصر' : 'وإلّا'}: ${o.label}`,
  says: nestSays,
  isTheRule: isNestRule,
  ruleText: (rule) =>
    `لأبني هوّتين بقطع الكيس: إن ملأ لوحٌ بطول الهوّة الأقصر الهوّةَ الأطول فلوحي ${NF[rule.fills].label}، وإن لم يملأها فلوحي ${NE[rule.else].label}.`,
  explain: (rule, c) =>
    `${fillsWord(c)}: قاعدتك تصنع اللوح ${nestMakes(rule, c.A, c.B)}، فتقول إنّ اللوح ${c.d} ${builds(nestSays(rule, c))}.`,
  caseId,
  evidence: gather(
    (row) => row.of === 'nest',
    (row) => (NUMBERS.nest.gaps.includes(row.a) ? [nestCase(N1, N2, row.b)] : []),
    [nestCase(N1, N2, NUMBERS.nest.plank)],
  ),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isNestRule(rule)) return firstBreak(NEST_POOL(), rule, rows, nestSays);
    // 36 does not fill 90: the shorter gap is not the plank there, 18 is
    return hard(rows, [nestCase(AG1, AG2, 36), nestCase(AG1, AG2, NUMBERS.against.plank), nestCase(AG1, AG2, 9)]);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [nestCase(12, 36, 12), nestCase(12, 36, 6)] };
    if (n === 2) return { kind: 'experiment', cases: [nestCase(14, 42, 14), nestCase(14, 42, 7)] };
    return { kind: 'experiment', cases: [nestCase(20, 50, 10), nestCase(20, 50, 20)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)([
        [329, 47],
        [403, 31],
        [413, 59],
        [469, 67],
      ]);
      return { A, B, q: A / B, g: B, held: true };
    },
    lines: (c) => [
      { dir: 'ltr', tokens: [String(c.A), '=', String(c.B), '×', slot('q', 'كم مرّة', 2)] },
      { dir: 'ltr', tokens: [`PGCD(${c.A} ; ${c.B})`, '=', slot('g', 'PGCD', 3)] },
    ],
    check(c, vals) {
      const q = Number(vals.q);
      const g = Number(vals.g);
      if (q * c.B !== c.A) return 'times';
      if (g === c.g) return 'ok';
      return g >= 1 && c.A % g === 0 && c.B % g === 0 ? 'longer' : 'pgcd';
    },
  },
  text: {
    ...PAIR_TEXT,
    title: 'مرآة جزيرة الحبال',
    frame: 'لأبني هوّتين بقطع الكيس:',
    buildLead: `اختر بطاقة من كلّ عمود: أيّ لوح تصنع لهوّتين؟ المرآة ستجرّب قاعدتك على الألواح التي صنعتَها للهوّتين ${N1} و ${N2}.`,
    attack: (c) => attackOf(c),
    wordsHint: 'مثال: إن ملأ… وإلّا…',
    experiment: 'انظر جيّدًا: هوّتان ولوحان، والكيس لا يكفي إلّا لواحد منهما. ماذا يفعل كلّ لوح؟',
    tryKey: (c) =>
      `المرآة لا تبني، ولا تكتب أيّ قائمة: اكتب ${c.A} جداءً بالعدد ${c.B}، ثمّ $\\mathrm{PGCD}(${c.A} ; ${c.B})$.`,
    use: {
      times: 'تحقّق من الجداء: اضرب العدد الأصغر في العدد الذي كتبتَه.',
      longer: 'هذا قاسم مشترك للعددين، لكنّ لهما قاسمًا مشتركًا أكبر منه.',
      pgcd: 'هذا العدد ليس قاسمًا مشتركًا للعددين.',
    },
    useOk: 'وجدتَه بجداء واحد، دون أيّ قائمة: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'hasr-wa-taqatu': hasrForge,
  'nataij-mubashira': directForge,
  'b-yaqsim-a': nestForge,
};
