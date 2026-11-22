/**
 * THE THREE FORGES of lesson « العددان الأوّليّان فيما بينهما » — one per key, in the order of the story; no rule of this
 * lesson is told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js, forgeParts.jsx). Assembled from the
 * authoring kit (`kit/authoring/forgeBlocks.js`); the lesson writes only what the tiles mean, the words, the hard cases
 * and the last step's numbers.
 *
 *   awwaliyan          🤝 island E — MET ON THE ISLANDS (no `inquiry`): convoy « only » (25 ; 27: the plank 1 alone
 *                      builds both) and convoy « common » (39 ; 52: 13 builds both). A case is a PAIR of gaps, drawn
 *                      with the longest plank that builds both (`pair`, d = that plank); what the world does (`held`):
 *                      « the plank 1 alone builds both ». His rule says when, looking at the two numbers — 4 × 4 = 16
 *                      rules: two prime numbers, two odd numbers, two that follow each other, neither divides the other…
 *                      one holds: the longest plank that builds both is 1.
 *   ithbat-awwaliyan   ✅ island G — it KEEPS an experiment in its mirror (inquiries.js › PROOF_INQUIRY: the notebook of
 *                      divisions, with the planks of every row, on 440 ; 301 — ending on 1 — and 341 ; 176 — ending on
 *                      11). Every row of the two notebooks is a case (a pair, as in 🤝); the question: are the two numbers
 *                      coprime? His rule reads the notebook — 4 × 3 = 12 rules (the first remainder, the last remainder
 *                      that is not 0, the last remainder, the number of divisions; equal to 0, to 1, a prime number); one
 *                      holds: the last remainder that is not 0 is 1.
 *   shahid-wahid       ❌ island K — MET ON THE ISLANDS (no `inquiry`): convoy « witness » (645 ; 410, the rules' planks:
 *                      5 builds both) and convoy « hidden » (85 ; 119: no plank of the rules builds both; 17, made in
 *                      the workshop, does). A case is ONE plank he tried on a pair (`pair`, d = that plank); the
 *                      question: are the two numbers coprime? His rule says what a plank tells — 2 × 3 = 6 rules; one
 *                      holds: a plank other than 1 that builds both says « not coprime »; a plank that does not build
 *                      both says nothing yet — the PGCD decides.
 * In each forge exactly ONE rule holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one by a
 * computed case — on his rows, or by the first new case where it breaks (`attacksOf`), also when he took the right plank
 * at once. The words of a key's name never appear in its forge before its last step (tested).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  attacksOf,
  divisionRow,
  firstWrong,
  fromRounds,
  gather,
  givenDivision,
  judge,
  line,
  noPredictions,
  pairCase,
  pairPool,
  pairsOutside,
  pgcdBox,
  makerOf,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { BRIDGE_TEXT } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { PROOF_INQUIRY } from './inquiries';
import { DIVISIONS, NUMBERS, counted, divisorsOf, euclid, gcd } from './math';

// 139 pairs named by content/practice/4am/awwaliyan-fima-baynahuma (scripts/lesson-bank-numbers.mjs)
export const BANK_PAIRS = new Set(
  (
    '1;672 2;672 3;672 4;672 5;672 5;8 6;672 7;150 7;672 7;9 8;672 9;14 9;672 10;13 10;672 11;672 12;18 12;672 14;15 ' +
    '15;22 15;48 17;18 18;135 21;1225 22;1225 22;35 23;1225 23;31 24;1225 25;1225 26;1225 27;1225 27;36 28;1225 ' +
    '29;1225 31;1176 32;1176 33;1176 34;1176 35;1176 36;1176 37;1176 38;1176 39;1176 41;150 41;70 42;150 42;70 43;150 ' +
    '43;70 44;150 44;70 45;150 45;70 46;150 46;70 46;75 47;150 47;48 47;70 48;150 48;70 49;150 49;70 50;150 50;77 ' +
    '51;150 52;150 53;150 53;69 54;150 55;150 55;77 55;78 56;150 56;65 57;150 58;150 59;150 65;104 65;126 69;80 77;150 ' +
    '81;256 84;87 85;102 85;106 90;133 117;168 117;170 120;121 125;625 128;135 128;625 144;209 147;248 152;250 ' +
    '156;187 156;195 160;189 160;220 160;221 162;275 175;288 180;288 195;286 208;351 235;1840 238;255 240;330 247;330 ' +
    '250;325 252;325 253;407 342;437 385;546 426;1158 501;684 667;899 672;845 735;1240 768;1001 768;960 805;1265 ' +
    '936;1225 1001;1365 1007;1311 1045;1463 1088;1575 1105;1176 1173;1360 1287;2002 1430;1859 1463;1464 1485;2835 ' +
    '1729;2717 2024;2025 2025;2026 12345;67895'
  ).split(' '),
);

const n = (v) => Number(v);
const isPrime = (x) => x > 1 && divisorsOf(x).length === 2;
/** The two answers about two numbers, once 🤝 named them (✅ and ❌). */
const COPRIME = 'أوّليّان فيما بينهما';
const NOT_COPRIME = 'ليسا أوّليّين فيما بينهما';
const verdictOf = (yes) => (yes ? COPRIME : NOT_COPRIME);
/** What the world shows once the mirror has built (one line, left to right): the plank that builds both, or only 1. */
const worldEq = (c) =>
  c.g > 1
    ? `$${c.A} = ${c.g} \\times ${c.A / c.g} \\qquad ${c.B} = ${c.g} \\times ${c.B / c.g}$`
    : `$\\mathrm{PGCD}(${c.A} ; ${c.B}) = 1$`;
/** What the world did with a pair, said plainly: the longest plank that builds both. */
const worldFact = (m) => (m.held ? 'أطول لوح يبنيهما معًا هو 1' : `اللوح ${m.g} يبنيهما معًا`);

/**
 * A PAIR of gaps asked « does the plank 1 alone build both? », drawn with the longest plank that builds both (the
 * mirror lays it on the two bridges: 1 when it is the only one). `held` = that plank is 1.
 */
const longestCase = (of) => (x, y) => {
  const g = gcd(x, y);
  const c = pairCase(of, x, y, g);
  return { ...c, g, held: g === 1, tag: g === 1 ? 'اللوح 1 وحده' : `يبنيهما ${g}` };
};
/** Small pairs a mirror can draw (the longer gap ≤ 90, at most 40 planks on one bridge); never a pair of the bank. */
const pairsPool = (make) =>
  pairPool({
    A: [4, 89],
    B: (a) => [a + 1, 90],
    d: (a, b) => [gcd(a, b), gcd(a, b)],
    make: (a, b) => make(a, b),
    exclude: BANK_PAIRS,
  });

// ───────────────────────── 1. 🤝 « عددان أوّليّان فيما بينهما » — the only common plank is 1 ─────────────────────────
// Islands A–E were the experiment: convoy « only » (25 then 27, planks 3, 5, 9 and 1, 52 coins: only the plank 1
// builds both) and convoy « common » (39 then 52, planks 2, 3, 13 and 1, 40 coins: 13 builds both). His evidence: the
// two pairs he crossed — he cannot stand at this mirror otherwise.

const [O1, O2] = NUMBERS.only.gaps;
const [C1, C2] = NUMBERS.common.gaps;
const awCase = longestCase('awwaliyan');
const awId = (c) => `awwaliyan:${c.A}:${c.B}`;
/** What his rule reads on the two numbers. */
const AW_LOOK = [
  { id: 'each', label: 'كلّ عدد من العددين', of: (c) => [c.A, c.B] },
  { id: 'diff', label: 'فرق العددين', of: (c) => [Math.abs(c.A - c.B)] },
  { id: 'long', label: 'أطول لوح يبنيهما معًا', of: (c) => [c.g] },
  { id: 'rem', label: 'باقي قسمة الأكبر على الأصغر', of: (c) => [Math.max(c.A, c.B) % Math.min(c.A, c.B)] },
];
/** What it must be. `yes` / `no`: what a number is or is not, in words. */
const AW_IS = [
  { id: 'prime', label: 'عددًا أوّليًّا', test: isPrime, yes: 'عدد أوّليّ', no: 'ليس عددًا أوّليًّا' },
  { id: 'odd', label: 'عددًا فرديًّا', test: (v) => v % 2 === 1, yes: 'عدد فرديّ', no: 'عدد زوجيّ' },
  { id: 'one', label: 'يساوي 1', test: (v) => v === 1, yes: 'يساوي 1', no: 'لا يساوي 1' },
  { id: 'nz', label: 'لا يساوي 0', test: (v) => v !== 0, yes: 'لا يساوي 0', no: 'يساوي 0' },
];
const AW = judge({
  slots: [
    { id: 'look', label: 'ماذا أنظر إليه؟', options: AW_LOOK },
    { id: 'is', label: 'كيف يكون؟', options: AW_IS },
  ],
  right: { look: 'long', is: 'one' },
  says: (rule, c, tile) => tile.look[rule.look].of(c).every(tile.is[rule.is].test),
});
const alone = (yes) => (yes ? 'اللوح 1 وحده' : 'لوح غير 1 أيضًا');
/** The pairs of his road (the order he crossed them). */
const AW_LIVED = [awCase(O1, O2), awCase(C1, C2)];
/** The last step: a new pair — two that look alike but are not, two that look apart but are. */
const AW_USE = [
  [57, 91],
  [49, 72],
  [77, 98],
  [62, 93],
];

const awForge = {
  key: 'awwaliyan',
  ...AW,
  ruleText: (rule) =>
    `لا يبني الهوّتين معًا إلّا اللوح 1 عندما يكون ${AW.tile.look[rule.look].label} ${AW.tile.is[rule.is].label}.`,
  explain(rule, c) {
    const look = AW.tile.look[rule.look];
    const is = AW.tile.is[rule.is];
    const word = (v) => `${v} ${is.test(v) ? is.yes : is.no}`;
    const [v] = look.of(c);
    const fact = {
      each: () => `${word(c.A)}، و ${word(c.B)}`,
      diff: () => `فرق العددين ${v}، و ${word(v)}`,
      long: () => `أطول لوح يبنيهما معًا طوله ${v}، و ${word(v)}`,
      rem: () => `باقي قسمة ${Math.max(c.A, c.B)} على ${Math.min(c.A, c.B)} هو ${v}، و ${word(v)}`,
    }[rule.look]();
    return `${fact}: قاعدتك تقول ${AW.says(rule, c) ? 'إنّ اللوح 1 وحده يبنيهما معًا' : 'إنّ لوحًا غير 1 يبنيهما معًا أيضًا'}.`;
  },
  caseId: awId,
  evidence: gather({
    own: (row) => row.of === 'awwaliyan',
    fromRow: (row) =>
      NUMBERS.only.gaps.includes(row.a) ? [AW_LIVED[0]] : NUMBERS.common.gaps.includes(row.a) ? [AW_LIVED[1]] : [],
    lived: AW_LIVED,
    caseId: awId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...AW,
    caseId: awId,
    pool: pairsPool(awCase),
    // 21 and 40: no number prime, not consecutive, neither divides the other — the plank 1 alone; 33 and 55: both odd,
    // neither divides the other — 11 builds both
    hard: [awCase(21, 40), awCase(33, 55)],
  }),
  // never a choice between two written rules: two more pairs, one the plank 1 alone builds and one it does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [awCase(16, 21), awCase(14, 21)] };
    if (k === 2) return { kind: 'experiment', cases: [awCase(20, 33), awCase(22, 33)] };
    return { kind: 'experiment', cases: [awCase(34, 39), awCase(33, 39)] };
  },
  use: {
    make: makerOf(pairsOutside(AW_USE, BANK_PAIRS), (A, B) => ({ A, B, g: gcd(A, B), held: gcd(A, B) === 1 })),
    lines: (c) => [pgcdBox(c.A, c.B)],
    /** He types the longest plank of both, then says whether the plank 1 alone builds them (`verdict`: yes). */
    verdict: true,
    check: (c, v, verdict) =>
      firstWrong([
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
        ['verdict', verdict === c.held],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة السنديان',
    log: 'هوّات عبرتَها',
    frame: 'لا يبني الهوّتين معًا إلّا اللوح 1 عندما يكون:',
    buildLead: `اختر بطاقة من كلّ عمود: متى لا يبني هوّتين معًا إلّا اللوح 1؟ المرآة ستجرّب قاعدتك على ${O1} و ${O2}، ثمّ ${C1} و ${C2}.`,
    yes: alone(true),
    no: alone(false),
    testing: 'المرآة تمرّ على الهوّات التي عبرتَها، وتسأل قاعدتك عن كلّ زوج…',
    says: (yes) => `قاعدتك: ${alone(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول ${m.says ? 'إنّ اللوح 1 وحده يبني' : 'إنّ لوحًا غير 1 يبني'} ${m.A} و ${m.B} معًا — لكنّ ${worldFact(m)}.`,
    agreed: 'قاعدتك توافق الهوّات التي عبرتَها. الآن المرآة تتحدّاها بهوّتين أخريين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: الهوّتان ${c.A} و ${c.B}. أيّ الألواح تبنيهما معًا: اللوح 1 وحده، أم لوح غير 1 أيضًا؟ ماذا تقول قاعدتك؟`,
    eq: worldEq,
    fire: 'ضع أطول لوح',
    survived: 'صمدت قاعدتك: أطول لوح يبني الهوّتين فعل ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${alone(yes)} »، والجسران قالا « ${alone(!yes)} ».`,
    wordsHint: 'مثال: لا يبني الهوّتين إلّا اللوح 1 عندما…',
    experiment: 'انظر جيّدًا: زوجان من الهوّات، وأطول لوح يبني كلّ زوج. ما الذي يختلف بينهما؟',
    tryKey: (c) =>
      `المرآة لا تبني: الهوّتان ${c.A} و ${c.B}. اكتب طول أطول لوح يبنيهما معًا، ثمّ اختر: اللوح 1 وحده، أم لوح غير 1 أيضًا؟`,
    use: {
      pgcd: 'أطول لوح يبنيهما: اقسم الأكبر على الأصغر، ثمّ الأصغر على الباقي، حتّى يصير الباقي 0.',
      zero: '0 ليس طول لوح: انظر إلى الباقي الذي قبله.',
      verdict: 'انظر إلى أطول لوح كتبتَه: هل هو 1؟',
    },
    useOk: 'أطول لوح يبنيهما قال كلّ شيء: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. ✅ « نثبت أنّهما أوّليّان فيما بينهما » — the proof by the divisions ─────────────────────────
// It keeps its experiment in the mirror (inquiries.js › PROOF_INQUIRY): two notebooks of divisions with, beside every row,
// the planks that fill both gaps of that row. His evidence: every row of the two notebooks, a pair each.

const [P1, P2] = PROOF_INQUIRY.rounds;
const ithLongest = longestCase('ithbat');
/** A pair read through its notebook of divisions: the first remainder, the last that is not 0, the last, the count. */
const ithCase = (x, y) => {
  const c = ithLongest(Math.max(x, y), Math.min(x, y));
  const rows = euclid(c.A, c.B);
  return {
    ...c,
    rows,
    first: rows[0].r,
    // the last remainder that is not 0 — the divisor itself when the first division leaves 0 (the notebook lights it)
    last: rows.length > 1 ? rows.at(-2).r : rows[0].b,
    end: rows.at(-1).r,
    count: rows.length,
  };
};
const ithId = (c) => `ithbat:${c.A}:${c.B}`;
const ITH_LOOK = [
  { id: 'first', label: 'باقي القسمة الأولى', of: (c) => c.first },
  { id: 'last', label: 'آخر باقٍ ليس 0', of: (c) => c.last },
  { id: 'end', label: 'الباقي الأخير', of: (c) => c.end },
  { id: 'count', label: 'عدد القسمات', of: (c) => c.count },
];
const ITH_IS = [
  { id: 'zero', label: '0', test: (v) => v === 0, yes: 'يساوي 0', no: 'لا يساوي 0' },
  { id: 'one', label: '1', test: (v) => v === 1, yes: 'يساوي 1', no: 'لا يساوي 1' },
  { id: 'prime', label: 'عددًا أوّليًّا', test: isPrime, yes: 'عدد أوّليّ', no: 'ليس عددًا أوّليًّا' },
];
const ITH = judge({
  slots: [
    { id: 'look', label: 'في دفتر القسمة أنظر إلى:', options: ITH_LOOK },
    { id: 'is', label: 'فإذا كان:', options: ITH_IS },
  ],
  right: { look: 'last', is: 'one' },
  says: (rule, c, tile) => tile.is[rule.is].test(tile.look[rule.look].of(c)),
});
/** The last step: a new pair of three-digit numbers, three divisions — three end on 1, three on another number. */
const ITH_USE = [
  [728, 353],
  [767, 358],
  [881, 801],
  [690, 299],
  [882, 427],
  [920, 851],
];

const ithForge = {
  key: 'ithbat-awwaliyan',
  /** The notebook of divisions in the mirror; every row it writes is a pair of his evidence. */
  inquiry: PROOF_INQUIRY,
  fromInquiry: fromRounds((r) => ladderOf(r.a, r.b, 'divide').rows.map((row) => ithCase(row.a, row.b))),
  ...ITH,
  chip: (s, o) => (s.id === 'look' ? `أنظر إلى ${o.label}` : `إذا كان ${o.label} فهما ${COPRIME}`),
  ruleText: (rule) =>
    `أقسم العددين كما في دفتر القسمة حتّى الباقي 0، وأنظر إلى ${ITH.tile.look[rule.look].label}: إذا كان ${ITH.tile.is[rule.is].label} فهما ${COPRIME}، وإلّا فليسا كذلك.`,
  explain(rule, c) {
    const is = ITH.tile.is[rule.is];
    const v = ITH.tile.look[rule.look].of(c);
    const fact = {
      first: `باقي القسمة الأولى ${v}`,
      last: c.count > 1 ? `آخر باقٍ ليس 0 هو ${v}` : `القسمة الأولى باقيها 0، فآخر عدد ليس 0 هو ${v}`,
      end: `الباقي الأخير ${v}`,
      count: `الدفتر يكتب ${counted(v, DIVISIONS)}`,
    }[rule.look];
    const value = rule.look === 'count' ? `، وعددها ${v}` : '';
    return `في دفتر ${c.A} و ${c.B}: ${fact}${value}، و ${v} ${is.test(v) ? is.yes : is.no}: قاعدتك تقول إنّهما ${verdictOf(ITH.says(rule, c))}.`;
  },
  caseId: ithId,
  evidence: gather({ own: (row) => row.of === 'ithbat', fromRow: () => [], caseId: ithId }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...ITH,
    caseId: ithId,
    pool: pairsPool(ithCase),
    // 38 and 27: the first remainder is 11, the last that is not 0 is 1; 88 and 55: the last that is not 0 is 11
    hard: [ithCase(38, 27), ithCase(88, 55)],
  }),
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [ithCase(40, 29), ithCase(42, 30)] };
    if (k === 2) return { kind: 'experiment', cases: [ithCase(29, 21), ithCase(48, 21)] };
    return { kind: 'experiment', cases: [ithCase(37, 27), ithCase(63, 27)] };
  },
  use: {
    make: makerOf(pairsOutside(ITH_USE, BANK_PAIRS), (A, B) => ({
      A,
      B,
      rows: euclid(A, B),
      g: gcd(A, B),
      held: gcd(A, B) === 1,
    })),
    lines: (c) => [
      givenDivision(c.A, c.B, { q: 'q1', r: 'r1', rw: 3 }),
      divisionRow(2),
      divisionRow(3),
      pgcdBox(c.A, c.B),
    ],
    /** The divisions row by row, the PGCD, then the conclusion: coprime (yes) or not. */
    verdict: true,
    check: (c, v, verdict) =>
      firstWrong([
        ['row1', n(v.q1) === c.rows[0].q && n(v.r1) === c.rows[0].r],
        ...[2, 3].flatMap((i) => [
          [`pair${i}`, n(v[`a${i}`]) === c.rows[i - 1].a && n(v[`b${i}`]) === c.rows[i - 1].b],
          [`row${i}`, n(v[`q${i}`]) === c.rows[i - 1].q && n(v[`r${i}`]) === c.rows[i - 1].r],
        ]),
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
        ['verdict', verdict === c.held],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الصخور',
    log: 'أسطر الدفترين',
    frame: 'أقسم العددين حتّى الباقي 0، ثمّ:',
    buildLead: `اختر بطاقة من كلّ عمود: كيف تحكم على عددين من دفتر قسمتهما؟ المرآة ستجرّب قاعدتك على أسطر الدفترين: ${P1.a} و ${P1.b}، ثمّ ${P2.a} و ${P2.b}.`,
    yes: COPRIME,
    no: 'ليسا أوّليّين',
    testing: 'المرآة تمرّ على أسطر الدفترين، وتسأل قاعدتك عن كلّ زوج…',
    says: (yes) => `قاعدتك: ${verdictOf(yes)}`,
    refuted: (m) => `قاعدتك تقول إنّ ${m.A} و ${m.B} ${verdictOf(m.says)} — لكنّ ${worldFact(m)}.`,
    agreed: 'قاعدتك توافق أسطر الدفترين. الآن المرآة تتحدّاها بعددين آخرين.',
    attack: (c) => `المرآة تتحدّى قاعدتك: العددان ${c.A} و ${c.B}. هل هما ${COPRIME}؟ ماذا تقول قاعدتك؟`,
    eq: worldEq,
    fire: 'ضع أطول لوح',
    survived: 'صمدت قاعدتك: أطول لوح يبني العددين فعل ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${verdictOf(yes)} »، والجسران قالا « ${verdictOf(!yes)} ».`,
    wordsHint: 'مثال: أقسم… ثمّ أنظر إلى…',
    experiment: 'انظر جيّدًا: عددان ودفتر قسمتهما، وعددان آخران ودفترهما. بماذا ينتهي كلّ دفتر؟',
    tryKey: (c) =>
      `المرآة لا تبني: العددان ${c.A} و ${c.B}. اكتب قسماتهما سطرًا سطرًا حتّى الباقي 0، ثمّ PGCD، ثمّ احكم: هل هما ${COPRIME}؟`,
    use: {
      row1: 'تحقّق من القسمة في السطر الأوّل: الباقي أصغر من العدد الذي تقسم عليه.',
      row2: 'تحقّق من القسمة في السطر الثاني: الباقي أصغر من العدد الذي تقسم عليه.',
      row3: 'تحقّق من القسمة في السطر الثالث: الباقي أصغر من العدد الذي تقسم عليه.',
      pair2: 'السطر الثاني يقسم العدد الأصغر من السطر الأوّل على باقيه.',
      pair3: 'السطر الثالث يقسم العدد الأصغر من السطر الثاني على باقيه.',
      zero: '0 ليس طول لوح: انظر إلى الباقي الذي قبله.',
      pgcd: 'انظر إلى البواقي التي كتبتَها: آخر باقٍ ليس 0.',
      verdict: 'انظر إلى PGCD الذي كتبتَه: هل هو 1؟',
    },
    useOk: 'قسمات، ثمّ آخر باقٍ ليس 0، ثمّ الحكم: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. ❌ « قاسم مشترك واحد غير 1 » — what one plank tells ─────────────────────────
// Islands G–K were the experiment: convoy « witness » (645 then 410, the rules' planks 2, 3, 5, 9, 10 — 5 builds both)
// and convoy « hidden » (85 then 119, the same five planks — none builds both — and 17 made in the workshop). His
// evidence: every plank he tried on those gaps, one case each; he crossed with 5 and with 17.

const [W1, W2] = NUMBERS.witness.gaps;
const [H1, H2] = NUMBERS.hidden.gaps;
/** ONE plank d tried on a pair: does it build both (`fits`)? A witness is a plank other than 1 that does. */
const shCase = (A, B, d) => {
  const c = pairCase('shahid', A, B, d);
  const g = gcd(A, B);
  return { ...c, g, witness: d > 1 && c.fits, held: g === 1, tag: c.fits ? 'يبنيهما معًا' : 'لا يبنيهما' };
};
const shId = (c) => `shahid:${c.A}:${c.B}:${c.d}`;
/** What his rule concludes: coprime (true), not (false), or « the PGCD decides » (the truth). */
const VERDICT = { yes: () => true, not: () => false, pgcd: (c) => c.held };
const SH_BUILT = [
  { id: 'yes', label: `فهما ${COPRIME}` },
  { id: 'not', label: `فهما ${NOT_COPRIME}` },
];
const SH_NONE = [
  { id: 'not', label: `فهما ${NOT_COPRIME}` },
  { id: 'pgcd', label: 'فلا نعرف بعد: نحسب PGCD' },
  { id: 'yes', label: `فهما ${COPRIME}` },
];
const SH = judge({
  slots: [
    { id: 'built', label: 'إن بناهما معًا لوح غير 1:', options: SH_BUILT },
    { id: 'none', label: 'وإن لم يبنهما معًا:', options: SH_NONE },
  ],
  right: { built: 'not', none: 'pgcd' },
  says: (rule, c) => VERDICT[c.witness ? rule.built : rule.none](c),
});
/** Small pairs a mirror can draw, every plank 2 … the shorter gap; never a pair of the bank. */
const SH_POOL = pairPool({
  A: [6, 50],
  B: (a) => [a + 1, 80],
  d: (a) => [2, Math.min(a, 20)],
  make: shCase,
  exclude: BANK_PAIRS,
});
/** The last step: a new pair of three-digit numbers that a plank of the rules builds together. */
const SH_USE = [
  [435, 620],
  [378, 495],
  [465, 610],
  [294, 861],
];

const shForge = {
  key: 'shahid-wahid',
  ...SH,
  chip: (s, o) => (s.id === 'built' ? `إن بناهما لوح غير 1 ${o.label}` : `وإن لم يبنهما ${o.label}`),
  ruleText: (rule) =>
    `لوح أجرّبه على عددين: إن بناهما معًا وكان غير 1 ${SH.tile.built[rule.built].label}؛ وإن لم يبنهما معًا ${SH.tile.none[rule.none].label}.`,
  explain(rule, c) {
    const fact =
      c.d === 1 ? 'اللوح 1 ليس لوحًا غير 1' : `اللوح ${c.d} ${c.fits ? 'يبني' : 'لا يبني'} ${c.A} و ${c.B} معًا`;
    const choice = c.witness ? rule.built : rule.none;
    const says = SH.says(rule, c);
    if (choice === 'pgcd')
      return `${fact}: قاعدتك تحسب $\\mathrm{PGCD}(${c.A} ; ${c.B}) = ${c.g}$، فتقول إنّهما ${verdictOf(says)}.`;
    return `${fact}: قاعدتك تقول إنّهما ${verdictOf(says)}.`;
  },
  caseId: shId,
  evidence: gather({
    own: (row) => row.of === 'shahid',
    fromRow: (row) =>
      NUMBERS.witness.gaps.includes(row.a)
        ? [shCase(W1, W2, row.b)]
        : NUMBERS.hidden.gaps.includes(row.a)
          ? [shCase(H1, H2, row.b)]
          : [],
    // he crossed 645 and 410 with the plank 5, then 85 and 119 with the plank 17: island K cannot be reached otherwise
    lived: [shCase(W1, W2, NUMBERS.witness.plank), shCase(H1, H2, NUMBERS.hidden.plank)],
    caseId: shId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...SH,
    caseId: shId,
    pool: SH_POOL,
    // 46 and 69: 3 builds 69 only — and 23 builds both; 55 and 72: 3 builds 72 only — and only 1 builds both
    hard: [shCase(46, 69, 3), shCase(55, 72, 3)],
  }),
  // a plank that builds neither pair together — on one pair only 1 builds both, on the other a longer plank does
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [shCase(44, 63, 2), shCase(44, 77, 2)] };
    if (k === 2) return { kind: 'experiment', cases: [shCase(49, 60, 3), shCase(49, 63, 3)] };
    return { kind: 'experiment', cases: [shCase(58, 75, 5), shCase(58, 87, 3)] };
  },
  use: {
    make: makerOf(pairsOutside(SH_USE, BANK_PAIRS), (A, B) => ({ A, B, g: gcd(A, B), held: gcd(A, B) === 1 })),
    lines: (c) => [
      line([String(c.A), '=', slot('d', 'اللوح', 2), '×', slot('qa', 'الحاصل', 3)]),
      line([String(c.B), '=', slot('e', 'اللوح', 2), '×', slot('qb', 'الحاصل', 3)]),
    ],
    /** ANY plank other than 1 that builds both is a right answer; then the conclusion (`verdict`: coprime or not). */
    verdict: true,
    check: (c, v, verdict) =>
      firstWrong([
        ['one', n(v.d) > 1],
        ['a', n(v.d) * n(v.qa) === c.A],
        ['same', n(v.e) === n(v.d)],
        ['b', n(v.e) * n(v.qb) === c.B],
        ['verdict', verdict === c.held],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الريحان',
    log: 'ألواح جرّبتَها',
    frame: 'لوح أجرّبه على عددين:',
    buildLead: `اختر بطاقة من كلّ عمود: ماذا يقول لوح جرّبتَه عن عددين؟ المرآة ستجرّب قاعدتك على ألواحك للهوّتين ${W1} و ${W2}، ثمّ ${H1} و ${H2}.`,
    yes: COPRIME,
    no: 'ليسا أوّليّين',
    testing: 'المرآة تمرّ على الألواح التي جرّبتَها، وتسأل قاعدتك عن كلّ لوح…',
    says: (yes) => `قاعدتك: ${verdictOf(yes)}`,
    refuted: (m) => `قاعدتك تقول إنّ ${m.A} و ${m.B} ${verdictOf(m.says)} — لكنّ ${worldFact(m)}.`,
    agreed: 'قاعدتك توافق الألواح التي جرّبتَها. الآن المرآة تتحدّاها بعددين آخرين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: العددان ${c.A} و ${c.B}، واللوح ${c.d} ${c.fits ? 'يبنيهما معًا' : 'لا يبنيهما معًا'}. هل هما ${COPRIME}؟ ماذا تقول قاعدتك؟`,
    eq: worldEq,
    fire: 'ضع اللوح',
    survived: 'صمدت قاعدتك: العددان فعلا ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${verdictOf(yes)} »، والعددان ${verdictOf(!yes)}.`,
    wordsHint: 'مثال: لوح غير 1 يبنيهما معًا يعني…',
    experiment: 'انظر جيّدًا: لوح لا يبني هذين العددين معًا، ولا ذينك. هل الزوجان من النوع نفسه؟',
    tryKey: (c) =>
      `المرآة لا تبني: العددان ${c.A} و ${c.B}. جد لوحًا غير 1 يبنيهما معًا، دون أن تحسب PGCD، ثمّ احكم: هل هما ${COPRIME}؟`,
    use: {
      one: 'اللوح 1 يبني كلّ عددين: جد لوحًا غير 1.',
      a: 'تحقّق من الضرب في السطر الأوّل.',
      same: 'اكتب اللوح نفسه في السطرين: لوح واحد يبني العددين معًا.',
      b: 'تحقّق من الضرب في السطر الثاني.',
      verdict: 'لوح غير 1 يبنيهما معًا: ماذا يقول ذلك عن العددين؟',
    },
    useOk: 'لوح واحد غير 1، دون أيّ قسمة: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  awwaliyan: awForge,
  'ithbat-awwaliyan': ithForge,
  'shahid-wahid': shForge,
};
