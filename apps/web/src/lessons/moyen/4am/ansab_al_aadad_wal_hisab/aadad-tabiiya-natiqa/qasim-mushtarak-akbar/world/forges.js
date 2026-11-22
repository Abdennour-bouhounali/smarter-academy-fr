/**
 * THE FOUR FORGES of lesson « القاسم المشترك الأكبر لعددين طبيعيين » — one per key, in the order of the story; no rule
 * of this lesson is told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js; « استكشف »: GAME_WORLD.md). He
 * writes his rule with TILES, the mirror tests it on what HE did, then attacks it:
 *   qawasim-mushtaraka  no experiment screen: the ISLANDS A–B were it (owner, 2026-11-19) — the planks of island A build
 *                       two bridges, 198 then 234; his evidence is every plank he fired on them. Tiles: what makes a
 *                       plank build both bridges (2 slots, 12 rules)
 *   al-akbar            no experiment screen: the ISLANDS C–D were it — a purse of a coin per plank, every plank of C
 *                       fills both gaps, only one builds both bridges with the coins. Tiles: which plank builds both with
 *                       the fewest planks (2 slots, 9 rules)
 *   baqat-mutamathila   deal                   identical vases with ALL the flowers: their number is a common divisor,
 *                                              the most is the PGCD, one vase holds each number ÷ that (3 slots, 48 rules)
 *   qawasim-al-pgcd     nest                   the common divisors of two numbers are exactly the divisors of their PGCD
 *                                              (2 slots, 12 rules)
 * In each forge exactly ONE rule holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one by
 * a computed case — on his evidence, or by the first new case the world finds where it breaks (`firstBreak`).
 * The two forges without an experiment open on their TILES (owner, 2026-11-19: « in the mirror he only writes his rule
 * with tiles »): the islands held the predictions, so `predictCases` returns none and the kit skips that step
 * (kit/RuleForge.jsx). Their evidence is the world's log of bridges (`evidence(log)`), one line per plank of the pair.
 *
 * WHY NO EXPERIMENT HERE WRITES THE RULE (`inquiry.writes` is not set). `deal` hands back what he predicted and found,
 * never a sentence. `nest` was weighed against lesson 3's `peel` (which writes): `peel` ends on a
 * claim he BUILDS from the table's columns and the table judges it — that claim is a rule. `nest` has no such step: he
 * says yes / no for each probe and the two lists stand side by side at the end. The sentence « the common divisors ARE
 * the divisors of the PGCD » is still his to write — and the tiles let him write what students really believe instead
 * (the divisors of the smaller number, of the difference, every number up to the PGCD, its multiples), each refuted.
 *
 * A case of forges 1, 2 and 4 is ONE plank on TWO gaps. In forges 1 and 2 it is a PAIR (`pair`, forgeParts.jsx): the
 * mirror draws BOTH bridges, the plank laid on each, and the log line names both gaps (forge 2: and the planks the two
 * bridges need). Forge 4 still draws one bridge: the gap the plank does not fill when there is one, else the second
 * gap — so the bridge holds exactly when the plank fills both (`fits`). `held` is what the case asks (a plank of both,
 * the longest…). A case of forge 3 is a SHARING (`deal`:
 * the roses and the lilies, k vases, and the claim x and y of a `lot` case): the mirror draws the flowers dealt into the
 * vases — never a bridge — and `fits` says whether every flower is shared. Both divisions are written under it
 * (`text.eq`).
 * No forge asks predictions (`predictCases` returns []): forges 1 and 2 open on their tiles, forges 3 and 4 on their
 * experiment, which holds them.
 * The words « PGCD » and « القاسم المشترك الأكبر » appear only from the third forge on — after the tablet of 👑.
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { BRIDGE_TEXT, outcome, pickWith } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import { LILIES, ROSES, commonDivisors, counted, divisorsOf, gcd } from './math';
import { DEAL_INQUIRY, NEST_INQUIRY, VASES, inVases } from './inquiries';
import { NUMBERS } from './story';

const fill = (yes) => (yes ? 'يملأ' : 'لا يملأ');
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const options = (list) => list.map(({ id, label }) => ({ id, label }));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
/** Computed once, when a forge first needs it (the pools of the attacks are not built at import). */
const lazy = (make) => {
  let value = null;
  return () => (value ??= make());
};
/** The kit asks every forge for predictions; here the experiment of each forge — or the islands — held them: none. */
const noPredictions = () => [];
/** One line per different case, in the order they came; only the cases of THIS forge (those `own` recognises). */
const keepOwn = (own, idOf) => (rows) =>
  rows.filter((row, i) => own(row) && rows.findIndex((x) => own(x) && idOf(x) === idOf(row)) === i);
/**
 * THE ATTACK of a wrong rule: among the cases he has not seen, the first one where the world does not do what the rule
 * says — one where the rule says « yes » and the world says « no » is shown first.
 */
function firstBreak(pool, rule, rows, says, idOf) {
  const seen = new Set(rows.map(idOf));
  const free = pool.filter((c) => !seen.has(idOf(c)) && says(rule, c) !== c.held);
  const best = free.find((c) => says(rule, c)) ?? free[0];
  return best ? [best] : [];
}
/** The right rule: its hard cases, those he has not seen. */
const fresh = (rows, idOf, list) => {
  const seen = new Set(rows.map(idOf));
  return list.filter((c) => !seen.has(idOf(c)));
};
/**
 * ONE plank of d cells on the pair of gaps A and B. The bridge the mirror draws is the gap it does not fill, if any, else
 * the second gap: it holds exactly when the plank fills both (`fits`).
 */
const pairCase = (A, B, d) => {
  const fa = A % d === 0;
  const fb = B % d === 0;
  return { ...outcome(fa ? B : A, d), A, B, d, fa, fb, fits: fa && fb };
};
/** The same case drawn as a PAIR of bridges (forgeParts.jsx › `c.pair`); `need`: the planks the two bridges take. */
const asPair = (c, need) => ({ ...c, pair: { a: c.A, b: c.B, d: c.d, ...(need != null ? { need } : {}) } });
/** The two divisions of a pair by a plank, as one formula: « 198 = 6 × 33 + 0     234 = 6 × 39 + 0 ». */
const twoDivisions = (A, B, d) =>
  `${A} = ${d} \\times ${Math.floor(A / d)} + ${A % d} \\qquad ${B} = ${d} \\times ${Math.floor(B / d)} + ${B % d}`;
/** Pairs of small gaps a mirror can draw (the shorter first): A in from … to, B up to `max`. */
const pairs = (from, to, max) => range(from, to).flatMap((A) => range(A + 1, max).map((B) => [A, B]));
/** The last step of two forges: a set of numbers typed one per box, in braces — every box a different member. */
const setLine = (n, label) => ({
  dir: 'ltr',
  tokens: ['{', ...range(1, n).flatMap((i) => [...(i > 1 ? [';'] : []), slot(`d${i}`, label, 2)]), '}'],
});
const checkSet = (members, vals) => {
  const typed = Object.keys(vals)
    .filter((k) => /^d\d+$/.test(k))
    .map((k) => Number(vals[k]));
  if (typed.some((v) => !members.includes(v))) return 'intruder';
  return new Set(typed).size === typed.length ? 'ok' : 'twice';
};

// ───────────────────────── 1. 🤝 « القواسم المشتركة » — a plank that builds both bridges ─────────────────────────
// No « استكشف » screen: the islands A and B were the experiment (the convoy « twins »). His evidence is every plank he
// fired on the two gaps (the world's log), one line per plank: does it fill 198? 234? both?

/** The planks he fired on a pair of gaps (the world's log, a bridge per line) as ONE case per plank of the pair. */
const fromLog = (pair, make, own, idOf) => (rows) =>
  keepOwn(
    own,
    idOf,
  )(
    rows.flatMap((row) => {
      if (own(row)) return [row];
      return row.kind == null && !row.mirror && pair.includes(row.a) ? [make(pair[0], pair[1], row.b)] : [];
    }),
  );

const commonCase = (A, B, d) => {
  const c = asPair(pairCase(A, B, d));
  return {
    ...c,
    kind: 'common',
    held: c.fits,
    fg: (A + B) % d === 0,
    fd: Math.abs(B - A) % d === 0,
    // the line names both gaps and the plank itself (forgeParts.jsx › a pair): the tag is the verdict only
    tag: c.fits ? 'يبني الجسرين' : 'لا يبنيهما',
  };
};
const commonId = (c) => `${c.A}:${c.B}:${c.d}`;
/** What the plank does to one length n: it fills it exactly, or it is shorter than it. */
const C_ACT = [
  { id: 'fill', label: 'يملأ تمامًا', test: (n, d) => n % d === 0 },
  { id: 'shorter', label: 'أقصر من', test: (n, d) => d < n },
];
/** Which lengths: the two gaps each, one of them, the gap the two make glued, a gap as long as their difference. */
const C_WHERE = [
  { id: 'each', label: 'كلّ هوّة من الهوّتين', of: (c, t) => t(c.A) && t(c.B) },
  { id: 'first', label: 'الهوّة الأولى', of: (c, t) => t(c.A) },
  { id: 'second', label: 'الهوّة الثانية', of: (c, t) => t(c.B) },
  { id: 'one', label: 'إحدى الهوّتين على الأقلّ', of: (c, t) => t(c.A) || t(c.B) },
  { id: 'glued', label: 'هوّة لصق الهوّتين', of: (c, t) => t(c.A + c.B) },
  { id: 'diff', label: 'هوّة طولها فرق الهوّتين', of: (c, t) => t(Math.abs(c.B - c.A)) },
];
const CA = byId(C_ACT);
const CW = byId(C_WHERE);
const commonSays = (rule, c) => CW[rule.where].of(c, (n) => CA[rule.act].test(n, c.d));
const isCommonRule = (rule) => rule?.act === 'fill' && rule?.where === 'each';
/** Planks 1 … 24 on pairs of gaps 6 … 48 — never a bridge of more than 40 planks for the mirror to lay. */
const COMMON_POOL = lazy(() =>
  pairs(6, 40, 48).flatMap(([A, B]) =>
    range(1, 24)
      .map((d) => commonCase(A, B, d))
      .filter((c) => c.q <= 40),
  ),
);
const [TW1, TW2] = NUMBERS.twin.gaps;
const builds = (yes) => (yes ? 'يبني الجسرين' : 'لا يبنيهما');

const commonForge = {
  key: 'qawasim-mushtaraka',
  slots: [
    { id: 'act', label: 'ماذا يفعل اللوح؟', options: options(C_ACT) },
    { id: 'where', label: 'أيّ هوّة؟', options: options(C_WHERE) },
  ],
  says: commonSays,
  isTheRule: isCommonRule,
  ruleText: (rule) => `يبني اللوح الجسرين معًا إذا كان ${CA[rule.act].label} ${CW[rule.where].label}.`,
  explain(rule, c) {
    const extra =
      rule.where === 'glued'
        ? `، و${fill(c.fg)} هوّة لصقهما (${c.A + c.B})`
        : rule.where === 'diff'
          ? `، و${fill(c.fd)} هوّة فرقهما (${Math.abs(c.B - c.A)})`
          : '';
    const facts =
      rule.act === 'shorter'
        ? `اللوح ${c.d} ${c.d < Math.min(c.A, c.B) ? 'أقصر من الهوّتين' : 'ليس أقصر من الهوّتين'}.`
        : `اللوح ${c.d} ${fill(c.fa)} ${c.A} و${fill(c.fb)} ${c.B}${extra}.`;
    return `${facts} قاعدتك تقول: ${builds(commonSays(rule, c))}.`;
  },
  caseId: commonId,
  evidence: fromLog(NUMBERS.twin.gaps, commonCase, (row) => row.kind === 'common', commonId),
  // the islands A and B held the predictions: the mirror opens on the tiles
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isCommonRule(rule)) return firstBreak(COMMON_POOL(), rule, rows, commonSays, commonId);
    // the shorter gap is itself a plank of both; two gaps that only the plank 5 glued fills
    return fresh(rows, commonId, [commonCase(15, 45, 15), commonCase(16, 19, 5), commonCase(14, 42, 14)]).slice(0, 2);
  },
  // never a choice between two written rules: two more planks to look at, each time
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [commonCase(12, 18, 6), commonCase(12, 20, 6)] };
    if (n === 2) return { kind: 'experiment', cases: [commonCase(10, 14, 4), commonCase(12, 16, 4)] };
    return { kind: 'experiment', cases: [commonCase(12, 36, 12), commonCase(12, 30, 12)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)([
        [54, 78],
        [56, 98],
        [50, 70],
        [40, 88],
      ]);
      return { A, B, set: commonDivisors(A, B), held: true };
    },
    lines: (c) => [setLine(c.set.length, 'لوح يبني الجسرين')],
    check: (c, vals) => checkSet(c.set, vals),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الياقوت',
    log: 'ألواح جرّبتَها',
    yes: builds(true),
    no: builds(false),
    eq: (c) => `$${twoDivisions(c.A, c.B, c.d)}$`,
    frame: 'يبني اللوح الجسرين معًا إذا كان:',
    buildLead: `اختر بطاقة من كلّ عمود: متى يبني لوح الجسرين معًا؟ المرآة ستجرّب قاعدتك على الألواح التي جرّبتَها على ${TW1} و ${TW2}.`,
    testing: 'المرآة تمرّ على الألواح التي جرّبتَها، وتسأل قاعدتك عن كلّ لوح…',
    says: (yes) => `قاعدتك: ${builds(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ اللوح ${m.d} ${m.says ? 'يبني' : 'لا يبني'} جسري ${m.A} و ${m.B} — لكنّه ${
        m.held ? 'يملأ كلّ واحدة منهما' : `لا يملأ ${m.fa ? m.B : m.A}`
      }.`,
    agreed: 'قاعدتك توافق كلّ الألواح التي جرّبتَها. الآن المرآة تتحدّاها بهوّتين جديدتين.',
    attack: (c) => `المرآة تتحدّى قاعدتك: الهوّتان ${c.A} و ${c.B}، واللوح ${c.d}. هل يبني الجسرين معًا؟`,
    fire: 'ضع اللوح',
    survived: 'صمدت قاعدتك: اللوح فعل ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${builds(yes)} »، واللوح ${yes ? 'لا يملأ الهوّتين كلتيهما' : 'يملأ كلّ واحدة منهما'}.`,
    wordsHint: 'مثال: يبني اللوح الجسرين إذا…',
    experiment: 'انظر جيّدًا: لوح وهوّتان. ماذا فعل في كلّ هوّة؟',
    tryKey: (c) =>
      `الهوّتان ${c.A} و ${c.B}. المرآة لا تبني: اكتب كلّ الألواح التي تبني الجسرين معًا، كلّ لوح في خانة.`,
    use: {
      intruder: 'أحد الأعداد لا يملأ إحدى الهوّتين: اقسم كلّ هوّة عليه.',
      twice: 'كتبتَ لوحًا مرّتين: لكلّ لوح خانة واحدة.',
    },
    useOk: 'وجدتَ كلّ الألواح التي تبني الجسرين دون أن يوضع لوح واحد: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. 👑 « الأكبر » — the plank that builds both bridges with the fewest planks ─────────────────────────
// No « استكشف » screen: the islands C and D were the experiment (the convoy « crown » and its purse of a coin per plank).
// His evidence: every plank he fired on 266 or 322, with the planks it needs for the two bridges (computed).

const longCase = (A, B, d) => {
  const base = pairCase(A, B, d);
  const g = gcd(A, B);
  const need = base.fits ? A / d + B / d : null;
  const c = asPair(base, need);
  return {
    ...c,
    kind: 'longest',
    g,
    need,
    held: d === g,
    // short: the line already names both gaps and the plank; whether it is the fewest is the line's colour (`held`)
    tag: c.fits ? planks(need) : 'لا يملؤهما',
  };
};
const longId = (c) => `${c.A}:${c.B}:${c.d}`;
/** Which plank of the list: the longest, the shortest, or any (« they all cost the same »). */
const L_PICK = [
  { id: 'longest', label: 'أطول لوح', says: (list, d) => d === Math.max(...list) },
  { id: 'shortest', label: 'أقصر لوح', says: (list, d) => d === Math.min(...list) },
  { id: 'any', label: 'أيّ لوح، فكلّها سواء', says: (list, d) => list.includes(d) },
];
/** Among which planks: those of both gaps, those of the shorter gap, those of the longer gap. */
const L_AMONG = [
  { id: 'both', label: 'تملأ الهوّتين كلتيهما', of: (A, B) => commonDivisors(A, B) },
  { id: 'short', label: 'تملأ الهوّة الأقصر', of: (A, B) => divisorsOf(Math.min(A, B)) },
  { id: 'long', label: 'تملأ الهوّة الأطول', of: (A, B) => divisorsOf(Math.max(A, B)) },
];
const LP = byId(L_PICK);
const LA = byId(L_AMONG);
const longSays = (rule, c) => LP[rule.pick].says(LA[rule.among].of(c.A, c.B), c.d);
const isLongRule = (rule) => rule?.pick === 'longest' && rule?.among === 'both';
const LONG_POOL = lazy(() =>
  pairs(6, 40, 60).flatMap(([A, B]) =>
    range(1, A)
      .map((d) => longCase(A, B, d))
      .filter((c) => c.q <= 40),
  ),
);
const longEq = (c) =>
  !c.held && c.fits
    ? `$${twoDivisions(c.A, c.B, c.d)} \\qquad ${c.A} = ${c.g} \\times ${c.A / c.g} \\qquad ${c.B} = ${c.g} \\times ${c.B / c.g}$`
    : `$${twoDivisions(c.A, c.B, c.d)}$`;
const longSay = (yes) => (yes ? 'بأقلّ عدد' : 'ليس بأقلّ عدد');

const longForge = {
  key: 'al-akbar',
  slots: [
    { id: 'pick', label: 'أيّ لوح آخذ؟', options: options(L_PICK) },
    { id: 'among', label: 'من بين الألواح التي…', options: options(L_AMONG) },
  ],
  says: longSays,
  isTheRule: isLongRule,
  ruleText: (rule) =>
    `لأبني الجسرين بأقلّ عدد من الألواح: آخذ ${LP[rule.pick].label} من بين الألواح التي ${LA[rule.among].label}.`,
  explain(rule, c) {
    const list = LA[rule.among].of(c.A, c.B);
    const yes = longSays(rule, c);
    if (rule.pick === 'any')
      return `قاعدتك تقبل كلّ الألواح التي ${LA[rule.among].label}: تقول إنّ اللوح ${c.d} ${longSay(yes)}.`;
    const v = LP[rule.pick].id === 'longest' ? Math.max(...list) : Math.min(...list);
    return `قاعدتك تأخذ للهوّتين ${c.A} و ${c.B} اللوح ${v}: تقول إنّ اللوح ${c.d} ${longSay(yes)}.`;
  },
  caseId: longId,
  evidence: fromLog(NUMBERS.second.gaps, longCase, (row) => row.kind === 'longest', longId),
  // the islands C and D (the purse) held the predictions: the mirror opens on the tiles
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isLongRule(rule)) return firstBreak(LONG_POOL(), rule, rows, longSays, longId);
    // the shorter gap itself is the longest plank; a plank of both that is not the longest
    return fresh(rows, longId, [longCase(18, 54, 18), longCase(30, 45, 5), longCase(21, 35, 7)]).slice(0, 2);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [longCase(24, 36, 6), longCase(24, 36, 12)] };
    if (n === 2) return { kind: 'experiment', cases: [longCase(20, 30, 20), longCase(20, 30, 10)] };
    return { kind: 'experiment', cases: [longCase(16, 48, 8), longCase(16, 48, 16)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)([
        [174, 261],
        [186, 279],
        [161, 230],
        [442, 663],
      ]);
      return { A, B, g: gcd(A, B), held: true };
    },
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [String(c.A), '=', slot('g', 'طول اللوح', 3), '×', slot('x', 'عدد ألواحه في الهوّة الأولى', 2)],
      },
      {
        dir: 'ltr',
        tokens: [String(c.B), '=', slot('h', 'طول اللوح نفسه', 3), '×', slot('y', 'عدد ألواحه في الهوّة الثانية', 2)],
      },
    ],
    check(c, vals) {
      const [g, h, x, y] = ['g', 'h', 'x', 'y'].map((k) => Number(vals[k]));
      if (g !== h) return 'same';
      if (!(g >= 1) || c.A % g || c.B % g) return 'both';
      if (g < c.g) return 'longer';
      return g * x === c.A && g * y === c.B ? 'ok' : 'count';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة التاج',
    log: 'ألواح جرّبتَها',
    yes: longSay(true),
    no: longSay(false),
    eq: longEq,
    frame: 'لأبني الجسرين بأقلّ عدد من الألواح:',
    buildLead: `اختر بطاقة من كلّ عمود: أيّ لوح يبني الجسرين بأقلّ عدد من الألواح؟ المرآة ستجرّب قاعدتك على الألواح التي جرّبتَها على ${NUMBERS.second.gaps.join(' و ')}.`,
    testing: 'المرآة تمرّ على الألواح التي جرّبتَها، وتسأل قاعدتك عن كلّ لوح…',
    says: (yes) => `قاعدتك: ${longSay(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ اللوح ${m.d} ${m.says ? 'يبني' : 'لا يبني'} جسري ${m.A} و ${m.B} بأقلّ عدد من الألواح — لكنّ ${
        m.held
          ? `${planks(m.need)} أقلّ عدد يبنيهما`
          : m.fits
            ? `اللوح ${m.g} يبنيهما بـ ${planks((m.A + m.B) / m.g)}، وهو يحتاج ${planks(m.need)}`
            : `اللوح ${m.d} لا يملأ ${m.fa ? m.B : m.A}`
      }.`,
    agreed: 'قاعدتك توافق كلّ الألواح التي جرّبتَها. الآن المرآة تتحدّاها بهوّتين جديدتين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: الهوّتان ${c.A} و ${c.B}، واللوح ${c.d}. هل يبني الجسرين بأقلّ عدد من الألواح؟ ماذا تقول قاعدتك؟`,
    fire: 'ضع اللوح',
    survived: 'صمدت قاعدتك: الهوّتان قالتا ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${longSay(yes)} »، والهوّتان تقولان « ${longSay(!yes)} ».`,
    wordsHint: 'مثال: آخذ اللوح…',
    experiment: 'انظر جيّدًا: هوّتان ولوحان. كم لوحًا يحتاج كلّ واحد منهما للجسرين؟',
    tryKey: (c) =>
      `الهوّتان ${c.A} و ${c.B}. المرآة لا تبني: بأيّ لوح تبني الجسرين بأقلّ عدد من الألواح؟ اكتب كلّ هوّة جداءً: طول اللوح × عدد ألواحه.`,
    use: {
      same: 'اللوح واحد للهوّتين: اكتب الطول نفسه في السطرين.',
      both: 'هذا اللوح لا يملأ الهوّتين كلتيهما: اقسم كلّ هوّة عليه.',
      longer: 'هذا اللوح يملأ الهوّتين، لكنّ لوحًا أطول منه يملؤهما بألواح أقلّ.',
      count: 'الطول صحيح. احسب عدد الألواح في كلّ هوّة.',
    },
    useOk: 'وجدتَ اللوح الذي يبني الجسرين بأقلّ عدد من الألواح دون أن يوضع لوح واحد: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. 💐 « الباقات المتماثلة » — the florist's vases ─────────────────────────
// A case is a CLAIM about nA roses and nB lilies in k identical vases, of one of three kinds — each asks one slot:
//   deal  « k vases share everything »            held: k divides both            (slot `must`)
//   most  « k is the most vases »                 held: k = gcd(nA, nB)           (slot `most`)
//   lot   « in k vases, each holds x and y »      held: k divides both, x = nA ÷ k, y = nB ÷ k   (slot `holds`)

/** What the mirror draws of a flower case: the roses and the lilies dealt into k vases (forgeParts.jsx › `c.deal`). */
const sharing = (nA, nB, k, claim) => ({
  a: { n: nA, item: DEAL_INQUIRY.a.item },
  b: { n: nB, item: DEAL_INQUIRY.b.item },
  k,
  lot: DEAL_INQUIRY.lot,
  ...(claim ? { claim } : {}),
});
const flowerCase = (kind, nA, nB, k, extra = {}) => {
  const c = pairCase(nA, nB, k);
  const claim = kind === 'lot' ? [extra.x, extra.y] : null;
  return { ...c, kind, nA, nB, k, g: gcd(nA, nB), deal: sharing(nA, nB, k, claim), ...extra };
};
const dealCase = (nA, nB, k) => {
  const c = flowerCase('deal', nA, nB, k);
  return { ...c, held: c.fits, tag: `${counted(k, VASES)}: ${c.fits ? 'لا تبقى زهرة' : 'تبقى زهور'}` };
};
const mostCase = (nA, nB, k) => {
  const c = flowerCase('most', nA, nB, k);
  return { ...c, held: k === c.g, tag: `${counted(k, VASES)}: ${k === c.g ? 'الأكثر' : 'ليس الأكثر'}` };
};
const lotCase = (nA, nB, k, x, y) => {
  const c = flowerCase('lot', nA, nB, k, { x, y });
  const held = c.fits && x * k === nA && y * k === nB;
  return { ...c, held, tag: `في كلّ واحدة من ${k}: ${x} و ${y} — ${held ? 'صحيح' : 'غير ذلك'}` };
};
const FLOWER_KINDS = new Set(['deal', 'most', 'lot']);
const flowerId = (c) => [c.kind, c.nA, c.nB, c.k, ...(c.kind === 'lot' ? [c.x, c.y] : [])].join(':');
const largestBelow = (n) =>
  divisorsOf(n)
    .filter((d) => d < n)
    .at(-1) ?? null;
const F_MUST = [
  { id: 'both', label: 'قاسم مشترك لعدد الورود وعدد الزنابق', ok: (c) => c.fa && c.fb },
  { id: 'one', label: 'قاسم لأحد العددين على الأقلّ', ok: (c) => c.fa || c.fb },
  { id: 'sum', label: 'قاسم لعدد كلّ الزهور', ok: (c) => (c.nA + c.nB) % c.k === 0 },
  { id: 'less', label: 'أيّ عدد أصغر من العددين', ok: (c) => c.k < Math.min(c.nA, c.nB) },
];
const F_MOST = [
  { id: 'gcd', label: 'القاسم المشترك الأكبر للعددين', of: (a, b) => gcd(a, b) },
  { id: 'min', label: 'العدد الأصغر منهما', of: (a, b) => Math.min(a, b) },
  { id: 'diff', label: 'الفرق بين العددين', of: (a, b) => Math.abs(a - b) },
  { id: 'half', label: 'أكبر قاسم للعدد الأصغر غير العدد نفسه', of: (a, b) => largestBelow(Math.min(a, b)) },
];
const F_HOLDS = [
  { id: 'quot', label: 'كلّ عدد مقسومًا على عدد المزهريات', of: (a, b, k) => [a / k, b / k] },
  { id: 'same', label: 'من كلّ نوع بقدر عدد المزهريات', of: (a, b, k) => [k, k] },
  { id: 'minus', label: 'كلّ عدد ناقص عدد المزهريات', of: (a, b, k) => [a - k, b - k] },
];
const FM = byId(F_MUST);
const FX = byId(F_MOST);
const FH = byId(F_HOLDS);
const flowerSays = (rule, c) => {
  if (c.kind === 'deal') return FM[rule.must].ok(c);
  if (c.kind === 'most') return FX[rule.most].of(c.nA, c.nB) === c.k;
  const [x, y] = FH[rule.holds].of(c.nA, c.nB, c.k);
  return x === c.x && y === c.y;
};
const isFlowerRule = (rule) => rule?.must === 'both' && rule?.most === 'gcd' && rule?.holds === 'quot';
const flowers = (c) => `${counted(c.nA, ROSES)} و ${counted(c.nB, LILIES)}`;
const FLOWER_POOL = lazy(() =>
  pairs(12, 40, 60).flatMap(([nA, nB]) =>
    range(2, 12).flatMap((k) => {
      const lots = [
        [nA / k, nB / k],
        [k, k],
        [nA - k, nB - k],
      ].filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y));
      return [dealCase(nA, nB, k), mostCase(nA, nB, k), ...lots.map(([x, y]) => lotCase(nA, nB, k, x, y))];
    }),
  ),
);
const { n: ROSES_N } = DEAL_INQUIRY.a;
const { n: LILIES_N } = DEAL_INQUIRY.b;
const yesNo = (yes) => (yes ? 'نعم' : 'لا');
/** « في مزهريتين متماثلتين », « في 6 مزهريات متماثلة »: the adjective agrees with the dual. */
const alike = (k) => (k === 2 ? 'متماثلتين' : 'متماثلة');

const flowerForge = {
  key: 'baqat-mutamathila',
  /** He deals the florist's flowers into vases (inquiries.js): his tries and his answer are his evidence. */
  inquiry: DEAL_INQUIRY,
  fromInquiry: (result) => {
    const [x, y] = result.perLot;
    const rows = [
      ...result.tries.map((t) => dealCase(ROSES_N, LILIES_N, t.k)),
      mostCase(ROSES_N, LILIES_N, result.most),
      lotCase(ROSES_N, LILIES_N, result.most, x, y),
      ...result.answers
        .filter((a) => a.kind !== 'ok')
        .flatMap((a) => [mostCase(ROSES_N, LILIES_N, a.k), lotCase(ROSES_N, LILIES_N, a.k, a.x, a.y)]),
    ];
    return { rows: keepOwn((row) => FLOWER_KINDS.has(row.kind), flowerId)(rows) };
  },
  slots: [
    { id: 'must', label: 'عدد المزهريات:', options: options(F_MUST) },
    { id: 'most', label: 'أكثر عدد منها:', options: options(F_MOST) },
    { id: 'holds', label: 'في كلّ مزهرية:', options: options(F_HOLDS) },
  ],
  says: flowerSays,
  isTheRule: isFlowerRule,
  ruleText: (rule) =>
    `مزهريات متماثلة بكلّ الزهور: عددها ${FM[rule.must].label}؛ وأكثر عدد منها ${FX[rule.most].label}؛ وفي كلّ مزهرية ${FH[rule.holds].label}.`,
  explain(rule, c) {
    if (c.kind === 'deal') {
      const facts = `${counted(c.k, VASES)}: ${c.fa ? 'الورود كلّها توزَّع' : 'تبقى ورود'}، و${c.fb ? 'الزنابق كلّها توزَّع' : 'تبقى زنابق'}.`;
      return `${facts} قاعدتك تقول: ${FM[rule.must].ok(c) ? 'لا تبقى زهرة' : 'تبقى زهور'}.`;
    }
    if (c.kind === 'most') {
      const v = FX[rule.most].of(c.nA, c.nB);
      return `قاعدتك تقول إنّ أكثر عدد من المزهريات لـ ${flowers(c)} هو ${v}: ${v === c.k ? 'هو' : 'ليس'} ${c.k}.`;
    }
    const [x, y] = FH[rule.holds].of(c.nA, c.nB, c.k);
    if (!Number.isInteger(x) || !Number.isInteger(y))
      return `قاعدتك تقسم ${c.nA} و ${c.nB} على ${c.k}: لا يخرج عدد طبيعي في الحالتين.`;
    return `قاعدتك تقول إنّ في كلّ واحدة من ${inVases(c.k)} ${counted(x, ROSES)} و ${counted(y, LILIES)}.`;
  },
  caseId: flowerId,
  evidence: keepOwn((row) => FLOWER_KINDS.has(row.kind), flowerId),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isFlowerRule(rule)) return firstBreak(FLOWER_POOL(), rule, rows, flowerSays, flowerId);
    // twelve vases share 36 roses and 60 lilies; six do too — but six are not the most
    return fresh(rows, flowerId, [dealCase(36, 60, 12), mostCase(36, 60, 6), lotCase(36, 60, 12, 3, 5)]).slice(0, 2);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [dealCase(12, 18, 6), dealCase(12, 18, 4)] };
    if (n === 2) return { kind: 'experiment', cases: [mostCase(12, 18, 6), mostCase(12, 18, 3)] };
    return { kind: 'experiment', cases: [lotCase(12, 18, 6, 2, 3), lotCase(12, 18, 6, 6, 6)] };
  },
  use: {
    // a sharing of the platform's own — not the florist's, not the market's 364 and 286, no pair of the bank
    make: (rand = Math.random) => {
      // the lots three ways: « أكبر عدد من الأكياس » (definite), « في أكياس متماثلة » (indefinite), « في كلّ كيس » (one)
      const [nA, nB, a, b, lots, few, lot] = pickWith(rand)([
        [345, 465, 'قارورات الماء', 'علب العصير', 'الأكياس', 'أكياس', 'كيس'],
        [495, 855, 'الكرّاسات', 'الأقلام', 'الحقائب', 'حقائب', 'حقيبة'],
        [816, 952, 'حبّات البرتقال', 'حبّات التفّاح', 'الصناديق', 'صناديق', 'صندوق'],
        [434, 527, 'قطع الحلوى', 'قطع الشوكولاتة', 'العلب', 'علب', 'علبة'],
      ]);
      return { nA, nB, a, b, lots, few, lot, g: gcd(nA, nB), held: true };
    },
    lines: (c) => [
      { dir: 'rtl', tokens: [`أكبر عدد من ${c.lots}`, '=', slot('k', `عدد ${c.lots}`, 3)] },
      { dir: 'rtl', tokens: [`${c.a} في كلّ ${c.lot}`, '=', slot('x', c.a, 2)] },
      { dir: 'rtl', tokens: [`${c.b} في كلّ ${c.lot}`, '=', slot('y', c.b, 2)] },
    ],
    check(c, vals) {
      const [k, x, y] = ['k', 'x', 'y'].map((v) => Number(vals[v]));
      if (!(k >= 1) || c.nA % k || c.nB % k) return 'share';
      if (k < c.g) return 'more';
      return x * k === c.nA && y * k === c.nB ? 'ok' : 'lot';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الباقات',
    log: 'مزهريات جرّبتَها',
    yes: yesNo(true),
    no: yesNo(false),
    eq: (c) =>
      !c.held && c.kind === 'most' && c.fits
        ? `$${twoDivisions(c.nA, c.nB, c.k)} \\qquad ${c.nA} = ${c.g} \\times ${c.nA / c.g} \\qquad ${c.nB} = ${c.g} \\times ${c.nB / c.g}$`
        : `$${twoDivisions(c.nA, c.nB, c.k)}$`,
    frame: 'مزهريات متماثلة بكلّ الزهور:',
    buildLead:
      'اختر بطاقة من كلّ عمود: كم مزهرية تصلح، وما أكثرها، وماذا في كلّ واحدة؟ المرآة ستجرّب قاعدتك على ما وزّعتَه.',
    testing: 'المرآة تمرّ على ما وزّعتَه، وتسأل قاعدتك عن كلّ سطر…',
    says: (yes) => `قاعدتك: ${yesNo(yes)}`,
    refuted: (m) =>
      m.kind === 'deal'
        ? `قاعدتك تقول إنّ ${counted(m.k, VASES)} ${m.says ? 'لا تترك زهرة' : 'تترك زهورًا'} — لكنّك رأيت ${m.held ? 'الزهور كلّها توزَّع' : 'زهورًا تبقى على الطاولة'}.`
        : m.kind === 'most'
          ? `قاعدتك تقول إنّ ${m.k} ${m.says ? 'هو' : 'ليس'} أكثر عدد من المزهريات — لكنّك رأيت ${m.held ? 'أنّه هو' : m.fits ? `${counted(m.g, VASES)} توزّع كلّ الزهور` : 'زهورًا تبقى على الطاولة'}.`
          : `قاعدتك ${m.says ? 'تقبل' : 'لا تقبل'} ${m.x} و ${m.y} في كلّ واحدة من ${m.k} — لكنّك رأيت ${m.held ? 'ذلك' : 'غير ذلك'}.`,
    agreed: 'قاعدتك توافق كلّ ما وزّعتَه. الآن المرآة تتحدّاها بزهور جديدة.',
    attack: (c) =>
      c.kind === 'deal'
        ? `المرآة تتحدّى قاعدتك: ${flowers(c)} في ${inVases(c.k)} ${alike(c.k)}. هل توزَّع كلّها، دون أن تبقى زهرة؟`
        : c.kind === 'most'
          ? `المرآة تتحدّى قاعدتك: ${flowers(c)}. هل ${c.k} هو أكثر عدد من المزهريات المتماثلة بكلّ الزهور؟`
          : `المرآة تتحدّى قاعدتك: ${flowers(c)} في ${inVases(c.k)} ${alike(c.k)}. هل في كلّ واحدة ${counted(c.x, ROSES)} و ${counted(c.y, LILIES)}؟`,
    fire: 'وزّع الزهور',
    survived: 'صمدت قاعدتك: الزهور فعلت ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yesNo(yes)} »، والزهور قالت « ${yesNo(!yes)} ».`,
    wordsHint: 'مثال: عدد المزهريات…',
    experiment: 'انظر جيّدًا: الزهور نفسها في مزهريات. ماذا بقي على الطاولة، وماذا في كلّ مزهرية؟',
    tryKey: (c) =>
      `توزَّع ${c.nA} من ${c.a} و ${c.nB} من ${c.b} كلّها في ${c.few} متماثلة، دون أن يبقى شيء. المرآة لا توزّع: ما أكبر عدد من ${c.lots}، وماذا في كلّ ${c.lot}؟`,
    use: {
      share: 'بهذا العدد يبقى شيء لا يوزَّع: اقسم العددين عليه.',
      more: 'هذا العدد يوزّع كلّ شيء، لكنّ عددًا أكبر منه يوزّعه أيضًا.',
      lot: 'العدد الأوّل صحيح. اقسم كلّ عدد عليه لتعرف ما في الواحد.',
    },
    useOk: 'وزّعتَ كلّ شيء دون أن توزّع قطعة واحدة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. 🧩 « قواسم القاسم المشترك الأكبر » — the planks of the longest ─────────────────────────

const nestCase = (A, B, p) => {
  const c = pairCase(A, B, p);
  const g = gcd(A, B);
  return {
    ...c,
    kind: 'nest',
    p,
    g,
    inG: g % p === 0,
    held: c.fits,
    tag: `${A} و ${B}: ${c.fits ? 'قاسم مشترك' : 'ليس قاسمًا مشتركًا'}`,
  };
};
const nestId = (c) => `${c.A}:${c.B}:${c.d}`;
const N_OF = [
  { id: 'g', label: 'القاسم المشترك الأكبر لهما', of: (A, B) => gcd(A, B) },
  { id: 'min', label: 'العدد الأصغر منهما', of: (A, B) => Math.min(A, B) },
  { id: 'diff', label: 'الفرق بينهما', of: (A, B) => Math.abs(A - B) },
  { id: 'sum', label: 'مجموعهما', of: (A, B) => A + B },
];
const N_WHICH = [
  { id: 'div', label: 'كلّ قواسم', has: (N, p) => N % p === 0 },
  { id: 'mult', label: 'كلّ مضاعفات', has: (N, p) => N > 0 && p % N === 0 },
  { id: 'upto', label: 'كلّ الأعداد من 1 إلى', has: (N, p) => p <= N },
];
const NO = byId(N_OF);
const NW = byId(N_WHICH);
const nestSays = (rule, c) => NW[rule.which].has(NO[rule.of].of(c.A, c.B), c.d);
const isNestRule = (rule) => rule?.which === 'div' && rule?.of === 'g';
const NEST_POOL = lazy(() =>
  pairs(6, 40, 60).flatMap(([A, B]) =>
    range(1, 40)
      .map((p) => nestCase(A, B, p))
      .filter((c) => c.q <= 40),
  ),
);
const pgcdOf = (A, B) => `$\\mathrm{PGCD}(${A} ; ${B}) = ${gcd(A, B)}$`;
const isCommon = (yes) => (yes ? 'قاسم مشترك' : 'ليس قاسمًا مشتركًا');

const nestForge = {
  key: 'qawasim-al-pgcd',
  /** He judges planks from the longest one alone (inquiries.js); every probe laid there is a line of his evidence. */
  inquiry: NEST_INQUIRY,
  fromInquiry: (result) => ({
    rows: keepOwn(
      (row) => row.kind === 'nest',
      nestId,
    )(result.rounds.flatMap((r) => r.rows.map((x) => nestCase(r.a, r.b, x.p)))),
  }),
  slots: [
    { id: 'which', label: 'ماذا؟', options: options(N_WHICH) },
    { id: 'of', label: 'من أيّ عدد؟', options: options(N_OF) },
  ],
  says: nestSays,
  isTheRule: isNestRule,
  ruleText: (rule) => `القواسم المشتركة لعددين هي ${NW[rule.which].label} ${NO[rule.of].label}.`,
  explain(rule, c) {
    const N = NO[rule.of].of(c.A, c.B);
    const yes = nestSays(rule, c);
    return `${NO[rule.of].label}: ${N}. قاعدتك تقول إنّ ${c.d} ${isCommon(yes)} للعددين ${c.A} و ${c.B}.`;
  },
  caseId: nestId,
  evidence: keepOwn((row) => row.kind === 'nest', nestId),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isNestRule(rule)) return firstBreak(NEST_POOL(), rule, rows, nestSays, nestId);
    // a divisor of the PGCD that is no small number; a number that fills one of the two only
    return fresh(rows, nestId, [nestCase(36, 54, 9), nestCase(28, 42, 4), nestCase(30, 45, 15)]).slice(0, 2);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [nestCase(24, 36, 6), nestCase(24, 36, 8)] };
    if (n === 2) return { kind: 'experiment', cases: [nestCase(20, 30, 5), nestCase(20, 30, 20)] };
    return { kind: 'experiment', cases: [nestCase(18, 27, 3), nestCase(18, 27, 6)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)([
        [598, 782],
        [627, 798],
        [858, 975],
        [918, 986],
      ]);
      return { A, B, g: gcd(A, B), set: divisorsOf(gcd(A, B)), held: true };
    },
    lines: (c) => [setLine(c.set.length, 'قاسم مشترك')],
    check: (c, vals) => checkSet(c.set, vals),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة السلال',
    log: 'ألواح جرّبتَها',
    yes: isCommon(true),
    no: isCommon(false),
    eq: (c) =>
      `$${twoDivisions(c.A, c.B, c.d)} \\qquad ${c.g} = ${c.d} \\times ${Math.floor(c.g / c.d)} + ${c.g % c.d}$`,
    frame: 'القواسم المشتركة لعددين هي:',
    buildLead: 'اختر بطاقتين: ما القواسم المشتركة لعددين؟ المرآة ستجرّب قاعدتك على الألواح التي جرّبتَها.',
    testing: 'المرآة تمرّ على الألواح التي جرّبتَها، وتسأل قاعدتك عن كلّ لوح…',
    says: (yes) => `قاعدتك: ${isCommon(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ ${m.d} ${isCommon(m.says)} للعددين ${m.A} و ${m.B} — لكنّك رأيته ${m.held ? 'يملأ الهوّتين' : 'لا يملأ الهوّتين كلتيهما'}.`,
    agreed: 'قاعدتك توافق كلّ الألواح التي جرّبتَها. الآن المرآة تتحدّاها بعددين جديدين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: ${pgcdOf(c.A, c.B)}، والعدد ${c.d}. هل هو قاسم مشترك للعددين ${c.A} و ${c.B}؟ ماذا تقول قاعدتك؟`,
    fire: 'ضع اللوح',
    survived: 'صمدت قاعدتك: الهوّتان قالتا ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${isCommon(yes)} »، والهوّتان قالتا « ${isCommon(!yes)} ».`,
    wordsHint: 'مثال: القواسم المشتركة هي…',
    experiment: 'انظر جيّدًا: هوّتان، وأطول لوح يملؤهما، ولوحان آخران. ماذا يفعل كلّ لوح في الثلاث؟',
    tryKey: (c) =>
      `${pgcdOf(c.A, c.B)}. المرآة لا تبني: اكتب كلّ القواسم المشتركة للعددين ${c.A} و ${c.B}، كلّ عدد في خانة.`,
    use: {
      intruder: 'أحد الأعداد لا يقسم أحد العددين: اقسم كلّ عدد عليه.',
      twice: 'كتبتَ عددًا مرّتين: لكلّ قاسم خانة واحدة.',
    },
    useOk: 'كتبتَ القواسم المشتركة دون أن تكتب قواسم العددين: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'qawasim-mushtaraka': commonForge,
  'al-akbar': longForge,
  'baqat-mutamathila': flowerForge,
  'qawasim-al-pgcd': nestForge,
};
