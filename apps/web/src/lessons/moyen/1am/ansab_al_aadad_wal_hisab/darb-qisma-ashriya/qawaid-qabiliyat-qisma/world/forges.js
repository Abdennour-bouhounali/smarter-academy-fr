/**
 * THE FOUR FORGES of lesson « قواعد قابلية القسمة » — one per key, in the order of the story; no rule of this lesson is
 * told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js; « استكشف »: GAME_WORLD.md). The three first keys are
 * « what to read in a number instead of dividing »: each opens on an experiment of ITS OWN nature (inquiries.js), then the
 * student writes his rule with tiles and the mirror tests and attacks it:
 *   raqm-alahad        chart 5, 2 (« يساوي »)            by 5 / by 2: what the units digit must be
 *   majmu-arqam        chart 9, 3 (« يقبل القسمة على »)   by 9 / by 3: what the sum of the digits must be
 *   raqmayn-akhirayn   join: hundreds + a short gap      by 4: what to read (a digit, the sum, the number the units and
 *                                                        tens digits write) and how it must be
 *   baqi-sifr          the mirror alone — « يقبل القسمة على », « مضاعف للعدد », « يقسم »: three sentences, one fact, said
 *                      by the remainder of the Euclidean division (and which number is divided in « يقسم »)
 * The tiles let the student write the false rules students really hold (« by 3 when the units digit is 3, 6 or 9 », « by
 * 9 when the sum is 9 », « by 4 when the units digit is even », « by 5 when it ends with 5 »…), and exactly ONE rule
 * survives (`forges.test.js` writes every rule of every forge — 16, 16, 12 and 16 — and refutes each wrong one by a
 * computed case).
 * A condition is said in TWO forms: `label` is what follows « عندما يكون … » in the rule (« عددًا زوجيًّا »), `yes(v)` /
 * `no(v)` are whole clauses about a number (« 6 عدد زوجي ») — `explain` uses these, never the label as a predicate.
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  BRIDGE_TEXT,
  cellsOf,
  checkDivision,
  outcome,
  pickWith,
} from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { HUNDREDS_INQUIRY, SUM_INQUIRY, UNITS_INQUIRY } from './inquiries';
import { NUMBERS } from './story';

/** An equality inside an Arabic sentence: a formula — the screen renders it with MathText, left to right. */
const math = (s) => ['$', s.replaceAll('×', '\\times'), '$'].join('');
const verdictOf = (yes) => (yes ? 'يثبت' : 'ينهار');
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const options = (list) => list.map(({ id, label }) => ({ id, label }));
const bridgeKey = (c) => `${c.a}:${c.b}`;
const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((s, d) => s + Number(d), 0);
/** The lines the mirror can show at once (kit/forge.js › EVIDENCE_MAX). */
const LINES = 8;

/**
 * The evidence of a forge whose cases are bridges of ITS planks: one line per different bridge, in the order they came,
 * the last one kept (a bridge the mirror built keeps its mark).
 */
const ownBridges = (planks) => (rows) => {
  const out = [];
  for (const row of rows) {
    if (!planks.includes(row.b)) continue;
    const i = out.findIndex((x) => bridgeKey(x) === bridgeKey(row));
    if (i >= 0) out.splice(i, 1);
    out.push({ ...outcome(row.a, row.b), mirror: Boolean(row.mirror) });
  }
  return out.slice(-LINES);
};
/** The gaps the story asks right AFTER a key (95, 111, 136): no mirror shows one before — the key must answer it. */
const STORY_NEXT = [NUMBERS.units.use, NUMBERS.sum.use, NUMBERS.last2.use];
/** Every bridge of these planks a mirror can draw: gaps 10 … 126, without the story's next gaps. */
const poolOf = (planks) => {
  const out = [];
  for (let a = 10; a <= 126; a += 1) if (!STORY_NEXT.includes(a)) for (const b of planks) out.push(outcome(a, b));
  return out;
};
/**
 * THE ATTACK of a wrong rule: among the bridges he has not seen, the first one where the world does not do what the rule
 * says — one where the rule says « it holds » and it crumbles is shown first.
 */
function firstBreak(pool, says, rows, idOf = bridgeKey) {
  const seen = new Set(rows.map(idOf));
  const free = pool.filter((c) => !seen.has(idOf(c)) && says(c) !== c.held);
  const best = free.find((c) => says(c)) ?? free[0];
  return best ? [best] : [];
}
/** Six bridges he has not seen, which hold and crumble in turn: the first plank, the second, again. */
function alternate(pool, planks, rows, rand) {
  const pick = pickWith(rand);
  const seen = new Set(rows.map(bridgeKey));
  const used = [];
  const one = (b, held) => {
    const c = pick(pool.filter((x) => x.b === b && x.held === held && !seen.has(bridgeKey(x)) && !used.includes(x.a)));
    used.push(c.a);
    return c;
  };
  const [p, q = p] = planks;
  return [one(p, true), one(p, false), one(q, true), one(q, false), one(p, true), one(q, false)];
}

/**
 * A forge whose cases are bridges of the planks of its experiment: what is common to the three keys that open on one.
 * `cfg` gives the planks, the tiles and what a rule says of a bridge; `fromInquiry` what the experiment hands the mirror
 * (the gaps he tested or glued), the hard attacks two traps.
 */
const bridgeForge = ({
  key,
  inquiry,
  planks,
  fromInquiry,
  slots,
  chip,
  says,
  isTheRule,
  ruleText,
  explain,
  hard,
  nudges,
  use,
  text,
}) => {
  const pool = poolOf(planks);
  return {
    key,
    /** He finds WHAT to read by an experiment (inquiries.js); then he writes his rule with the tiles. */
    inquiry,
    fromInquiry,
    slots,
    ...(chip ? { chip } : {}),
    says,
    isTheRule,
    ruleText,
    explain,
    caseId: bridgeKey,
    evidence: ownBridges(planks),
    predictCases: (seen, rand = Math.random) => alternate(pool, planks, seen, rand),
    attacks(rule, seen) {
      if (!isTheRule(rule)) return firstBreak(pool, (c) => says(rule, c), seen);
      const known = new Set(seen.map(bridgeKey));
      return hard.filter((c) => !known.has(bridgeKey(c)));
    },
    // never a choice between two written rules: one more pair of bridges to look at each time
    nudge: (n) => ({ kind: 'experiment', cases: nudges[Math.min(n, nudges.length) - 1] }),
    use,
    text: { ...BRIDGE_TEXT, ...text },
  };
};

/** What a chart hands the mirror: gaps of ITS chart he tested by hand — on the first hundred, then on the next one. */
const chartRows = (pairs) => {
  const rows = pairs.map(([a, b]) => outcome(a, b));
  return () => ({ rows: rows.map((c) => ({ ...c })) });
};

// ───────────────────────── 1. « رقم الآحاد » — planks 5 and 2 ─────────────────────────

const units = (a) => a % 10;
const UNIT_OPTIONS = {
  5: [
    { id: 'five', label: '5 فقط', test: (u) => u === 5 },
    { id: 'zero', label: '0 فقط', test: (u) => u === 0 },
    { id: 'zeroFive', label: '0 أو 5', test: (u) => u === 0 || u === 5 },
    { id: 'odd', label: '1 أو 3 أو 5 أو 7 أو 9', test: (u) => u % 2 === 1 },
  ],
  2: [
    { id: 'two', label: '2 فقط', test: (u) => u === 2 },
    { id: 'noZero', label: '2 أو 4 أو 6 أو 8', test: (u) => u > 0 && u % 2 === 0 },
    { id: 'even', label: '0 أو 2 أو 4 أو 6 أو 8', test: (u) => u % 2 === 0 },
    { id: 'twoFour', label: '2 أو 4 أو 8', test: (u) => [2, 4, 8].includes(u) },
  ],
};
const UNIT_RIGHT = { 5: 'zeroFive', 2: 'even' };
const UO = { 5: byId(UNIT_OPTIONS[5]), 2: byId(UNIT_OPTIONS[2]) };
const unitSlot = (b) => `b${b}`;
const unitsSays = (rule, c) => UO[c.b][rule[unitSlot(c.b)]].test(units(c.a));
const isUnitsRule = (rule) => [5, 2].every((b) => rule?.[unitSlot(b)] === UNIT_RIGHT[b]);
/**
 * Big gaps the last step reads: ONE of the two planks fills each, and he writes which one does and which one does not
 * (a count of planks would not say which). A gap both fill (units digit 0) is met in the attack and the helps.
 */
const UNITS_USE = [3465, 5718, 1205, 6384, 7935, 4096];
const unitsFiller = (a) => [5, 2].find((b) => a % b === 0);

const unitsForge = bridgeForge({
  key: 'raqm-alahad',
  inquiry: UNITS_INQUIRY,
  planks: UNITS_INQUIRY.planks.map((p) => p.b),
  // gaps he tested by hand: 5 … 12 then 100 … 102 with the plank 5, 2 … 10 then 100 … 102 with the plank 2
  fromInquiry: chartRows([
    [5, 5],
    [7, 5],
    [10, 5],
    [100, 5],
    [4, 2],
    [7, 2],
    [10, 2],
    [101, 2],
  ]),
  slots: [5, 2].map((b) => ({
    id: unitSlot(b),
    label: `يملأ اللوح ${b} الهوّة عندما يكون رقم آحادها:`,
    options: options(UNIT_OPTIONS[b]),
  })),
  chip: (s, o) => `اللوح ${s.id.slice(1)}: ${o.label}`,
  says: unitsSays,
  isTheRule: isUnitsRule,
  ruleText: (rule) =>
    `يملأ اللوح 5 الهوّة عندما يكون رقم آحادها ${UO[5][rule.b5].label}، ويملؤها اللوح 2 عندما يكون رقم آحادها ${UO[2][rule.b2].label}.`,
  explain(rule, c) {
    const yes = unitsSays(rule, c);
    return `رقم آحاد ${c.a} هو ${units(c.a)}. قاعدتك للّوح ${c.b}: ${UO[c.b][rule[unitSlot(c.b)]].label} — فهي تقول إنّ الجسر ${verdictOf(yes)}.`;
  },
  hard: [outcome(120, 5), outcome(115, 2)],
  nudges: [
    [outcome(30, 5), outcome(35, 5)],
    [outcome(20, 2), outcome(21, 2)],
    [outcome(50, 5), outcome(50, 2)],
  ],
  use: {
    make: (rand = Math.random) => ({ a: pickWith(rand)(UNITS_USE), held: true }),
    // each plank is answered: the one that fills the gap, and the one that does not
    lines: (c) => [
      { dir: 'rtl', tokens: [`رقم آحاد ${c.a} هو`, slot('u', 'رقم الآحاد', 1)] },
      { dir: 'rtl', tokens: ['من اللوحين 2 و 5، يملؤها اللوح', slot('yes', 'اللوح الذي يملؤها', 1)] },
      { dir: 'rtl', tokens: ['ولا يملؤها اللوح', slot('no', 'اللوح الذي لا يملؤها', 1)] },
    ],
    check(c, vals) {
      if (Number(vals.u) !== units(c.a)) return 'units';
      const [yes, no] = [Number(vals.yes), Number(vals.no)];
      if (![2, 5].includes(yes) || ![2, 5].includes(no) || yes === no) return 'planks';
      return yes === unitsFiller(c.a) ? 'ok' : 'which';
    },
  },
  text: {
    title: 'مرآة جزيرة اللوحة الخضراء',
    log: 'هوّات جرّبتَها على اللوحة',
    frame: 'دون قسمة، أنظر إلى رقم آحاد الهوّة:',
    buildLead: 'لكلّ لوح بطاقة: متى يملأ الهوّة؟ المرآة ستجرّب قاعدتك على الهوّات التي جرّبتَها.',
    testing: 'المرآة تمرّ على هوّاتك، وتسأل قاعدتك عن كلّ واحدة…',
    // true of the three helps: two gaps under one plank (twice), then one gap under the two planks
    experiment: 'انظر جيّدًا إلى الجسرين: ما رقم آحاد كلّ هوّة، وماذا فعل اللوح فوقها؟',
    wordsHint: 'مثال: يملأ اللوح 5 الهوّة عندما…',
    tryKey: (c) => `هوّة من ${c.a} خانة: أطول من أن تُبنى هنا، ولا قسمة. اقرأها بمفتاحك.`,
    use: {
      units: 'انظر إلى آخر رقم في العدد، على اليمين.',
      planks: 'رقم الآحاد صحيح. اكتب في كلّ خانة أحد اللوحين: 2 في واحدة، و 5 في الأخرى.',
      which: 'رقم الآحاد صحيح. اسأل قاعدتك عن اللوح 2، ثمّ عن اللوح 5: أيّهما يملأ هذه الهوّة؟',
    },
    useOk: 'هوّة طويلة حُكم عليها دون أيّ قسمة: مفتاحك يعمل!',
  },
});

// ───────────────────────── 2. « مجموع الأرقام » — planks 9 and 3 ─────────────────────────

const SUM_OPTIONS = {
  9: [
    { id: 'unit9', label: 'رقم آحادها 9', test: (a) => units(a) === 9 },
    { id: 'sumIs9', label: 'مجموع أرقامها 9', test: (a) => digitSum(a) === 9 },
    { id: 'sumBy9', label: 'مجموع أرقامها يقبل القسمة على 9', test: (a) => digitSum(a) % 9 === 0 },
    { id: 'sumBy3', label: 'مجموع أرقامها يقبل القسمة على 3', test: (a) => digitSum(a) % 3 === 0 },
  ],
  3: [
    { id: 'unit369', label: 'رقم آحادها 3 أو 6 أو 9', test: (a) => [3, 6, 9].includes(units(a)) },
    { id: 'sumIs369', label: 'مجموع أرقامها 3 أو 6 أو 9', test: (a) => [3, 6, 9].includes(digitSum(a)) },
    { id: 'sumBy3', label: 'مجموع أرقامها يقبل القسمة على 3', test: (a) => digitSum(a) % 3 === 0 },
    { id: 'sumBy9', label: 'مجموع أرقامها يقبل القسمة على 9', test: (a) => digitSum(a) % 9 === 0 },
  ],
};
const SUM_RIGHT = { 9: 'sumBy9', 3: 'sumBy3' };
const SO = { 9: byId(SUM_OPTIONS[9]), 3: byId(SUM_OPTIONS[3]) };
const sumSlot = (b) => `b${b}`;
const sumSays = (rule, c) => SO[c.b][rule[sumSlot(c.b)]].test(c.a);
const isSumRule = (rule) => [9, 3].every((b) => rule?.[sumSlot(b)] === SUM_RIGHT[b]);
/** Big gaps the last step reads: their digits sum to 18, 15, 11, 18, 12, 21 — filled by 2, 1, 0, 2, 1, 1 of the planks. */
const SUM_USE = [4518, 2715, 7202, 3609, 5241, 8463];
const sumWhat = (rule, c) => SO[c.b][rule[sumSlot(c.b)]];

const sumForge = bridgeForge({
  key: 'majmu-arqam',
  inquiry: SUM_INQUIRY,
  planks: SUM_INQUIRY.planks.map((p) => p.b),
  // gaps he tested by hand: 9 … 18 then 100 … 102 with the plank 9, 3 … 10 then 100 … 102 with the plank 3
  fromInquiry: chartRows([
    [9, 9],
    [12, 9],
    [18, 9],
    [100, 9],
    [6, 3],
    [7, 3],
    [9, 3],
    [101, 3],
  ]),
  slots: [9, 3].map((b) => ({
    id: sumSlot(b),
    label: `يملأ اللوح ${b} الهوّة عندما يكون`,
    options: options(SUM_OPTIONS[b]),
  })),
  chip: (s, o) => `اللوح ${s.id.slice(1)}: ${o.label}`,
  says: sumSays,
  isTheRule: isSumRule,
  ruleText: (rule) =>
    `يملأ اللوح 9 الهوّة عندما يكون ${SO[9][rule.b9].label}، ويملؤها اللوح 3 عندما يكون ${SO[3][rule.b3].label}.`,
  explain(rule, c) {
    const yes = sumSays(rule, c);
    const digits = String(c.a).split('').join(' + ');
    return `${math(`${digits} = ${digitSum(c.a)}`)}، ورقم الآحاد ${units(c.a)}. قاعدتك للّوح ${c.b}: ${sumWhat(rule, c).label} — فهي تقول إنّ الجسر ${verdictOf(yes)}.`;
  },
  hard: [outcome(117, 9), outcome(106, 3)],
  nudges: [
    [outcome(27, 9), outcome(28, 9)],
    [outcome(99, 9), outcome(98, 9)],
    [outcome(42, 3), outcome(43, 3)],
  ],
  use: {
    make: (rand = Math.random) => ({ a: pickWith(rand)(SUM_USE), held: true }),
    lines: (c) => [
      { dir: 'rtl', tokens: [`مجموع أرقام ${c.a} هو`, slot('s', 'مجموع الأرقام', 2)] },
      { dir: 'rtl', tokens: ['عدد الألواح التي تملؤها من بين 3 و 9', slot('n', 'عدد الألواح التي تملؤها', 1)] },
    ],
    check(c, vals) {
      if (Number(vals.s) !== digitSum(c.a)) return 'sum';
      return Number(vals.n) === [3, 9].filter((b) => c.a % b === 0).length ? 'ok' : 'count';
    },
  },
  text: {
    title: 'مرآة جزيرة الزيتون',
    log: 'هوّات جرّبتَها على اللوحة',
    frame: 'دون قسمة، أقرأ في طول الهوّة:',
    buildLead: 'لكلّ لوح بطاقة: متى يملأ الهوّة؟ المرآة ستجرّب قاعدتك على الهوّات التي جرّبتَها.',
    testing: 'المرآة تمرّ على هوّاتك، وتسأل قاعدتك عن كلّ واحدة…',
    experiment: 'انظر جيّدًا: اللوح نفسه، هوّتان متقاربتان. ماذا تغيّر في أرقام الهوّة، وماذا فعل اللوح؟',
    wordsHint: 'مثال: يملأ اللوح 9 الهوّة عندما…',
    tryKey: (c) => `هوّة من ${c.a} خانة: أطول من أن تُبنى هنا، ولا قسمة. اقرأها بمفتاحك.`,
    use: {
      sum: 'أعد جمع أرقام العدد، رقمًا بعد رقم.',
      count: 'المجموع صحيح. طبّق الآن قاعدتك على اللوح 3 ثمّ على اللوح 9، وعُدّ.',
    },
    useOk: 'هوّة طويلة حُكم عليها دون أيّ قسمة: مفتاحك يعمل!',
  },
});

// ───────────────────────── 3. « الرقمان الأخيران » — plank 4 ─────────────────────────

const L_READS = [
  { id: 'units', label: 'رقم آحادها', of: (a) => units(a) },
  { id: 'tens', label: 'رقم عشراتها', of: (a) => Math.floor(a / 10) % 10 },
  { id: 'sum', label: 'مجموع أرقامها', of: (a) => digitSum(a) },
  { id: 'last2', label: 'العدد المشكّل من رقمَي آحادها وعشراتها', of: (a) => a % 100 },
];
/** `label` follows « عندما يكون … » in the rule; `yes` / `no` are said of the number the rule has just read. */
const L_CONDS = [
  {
    id: 'by4',
    label: 'يقبل القسمة على 4',
    yes: 'وهو يقبل القسمة على 4',
    no: 'وهو لا يقبل القسمة على 4',
    test: (v) => v % 4 === 0,
  },
  { id: 'by2', label: 'عددًا زوجيًّا', yes: 'وهو عدد زوجي', no: 'وهو عدد فردي', test: (v) => v % 2 === 0 },
  {
    id: 'is48',
    label: '4 أو 8',
    yes: 'وهو أحد العددين 4 و 8',
    no: 'وهو ليس 4 ولا 8',
    test: (v) => v === 4 || v === 8,
  },
];
const LR = byId(L_READS);
const LC = byId(L_CONDS);
const lastSays = (rule, c) => LC[rule.cond].test(LR[rule.read].of(c.a));
const isLastRule = (rule) => rule?.read === 'last2' && rule?.cond === 'by4';
/** Big gaps the last step reads: the number their units and tens digits write, and the verdict of the plank 4. */
const LAST2_USE = [5316, 7230, 4812, 2614, 3528, 6150];
/**
 * What the gluing hands the mirror: the gaps he made and predicted — a number of hundreds and a short gap, glued. (With
 * no result — a test, a forge opened on its tiles — the rounds of the experiment themselves.)
 */
const gluedRows = (spec) => (result) => ({
  rows: (result?.rounds?.length ? result.rounds : spec.rounds).map((x) => outcome(x.a + x.b, x.d ?? spec.d)),
});

const last2Forge = bridgeForge({
  key: 'raqmayn-akhirayn',
  inquiry: HUNDREDS_INQUIRY,
  planks: [HUNDREDS_INQUIRY.d],
  fromInquiry: gluedRows(HUNDREDS_INQUIRY),
  slots: [
    { id: 'read', label: 'ماذا أقرأ؟', options: options(L_READS) },
    { id: 'cond', label: 'كيف يجب أن يكون؟', options: options(L_CONDS) },
  ],
  says: lastSays,
  isTheRule: isLastRule,
  ruleText: (rule) => `يملأ اللوح 4 الهوّة عندما يكون ${LR[rule.read].label} ${LC[rule.cond].label}.`,
  explain(rule, c) {
    const r = LR[rule.read];
    const yes = lastSays(rule, c);
    const cond = LC[rule.cond];
    return `قاعدتك تقرأ في الهوّة ${c.a} ${r.label}، أي ${r.of(c.a)}، ${yes ? cond.yes : cond.no} — فهي تقول إنّ الجسر ${verdictOf(yes)}.`;
  },
  // 114 ends with 4 and crumbles; 116 ends with 6 and holds
  hard: [outcome(114, 4), outcome(116, 4)],
  // the same short gap with and without a hundred before it (twice), then two gaps ending with 0
  nudges: [
    [outcome(24, 4), outcome(124, 4)],
    [outcome(18, 4), outcome(118, 4)],
    [outcome(120, 4), outcome(110, 4)],
  ],
  use: {
    make: (rand = Math.random) => {
      const a = pickWith(rand)(LAST2_USE);
      return { a, b: 4, held: a % 4 === 0 };
    },
    verdict: true,
    lines: (c) => [
      {
        dir: 'rtl',
        tokens: [
          `العدد المشكّل من رقمَي آحاد ${c.a} وعشراته هو`,
          slot('l', 'العدد المشكّل من رقمَي الآحاد والعشرات', 2),
        ],
      },
    ],
    check(c, vals, verdict) {
      if (Number(vals.l) !== c.a % 100) return 'last';
      return verdict === c.held ? 'ok' : 'verdict';
    },
  },
  text: {
    title: 'مرآة جزيرة المئات',
    log: 'الهوّات الملصوقة في تجربتك',
    frame: 'دون قسمة، يملأ اللوح 4 الهوّة عندما يكون:',
    buildLead: 'اختر بطاقتين: ماذا تقرأ في طول الهوّة، وكيف يجب أن يكون؟ المرآة ستجرّب قاعدتك على الهوّات الملصوقة.',
    testing: 'المرآة تمرّ على الهوّات الملصوقة، وتسأل قاعدتك عن كلّ واحدة…',
    experiment: 'انظر جيّدًا: اللوح 4 وهوّتان. ماذا تغيّر في أرقام الهوّة، وماذا فعل اللوح؟',
    wordsHint: 'مثال: يملأ اللوح 4 الهوّة عندما…',
    tryKey: (c) => `هوّة من ${c.a} خانة، ولوح طوله 4. أطول من أن تُبنى هنا، ولا قسمة: اقرأها بمفتاحك، ثمّ احكم.`,
    use: {
      last: 'انظر إلى رقمَي الآحاد والعشرات فقط، على اليمين: أيّ عدد يشكّلان؟',
      verdict: 'العدد صحيح. هل يقبل القسمة على 4؟ ماذا تقول قاعدتك عن الجسر؟',
    },
    useOk: 'آلاف الخانات، ورقمان فقط: مفتاحك يعمل!',
  },
});

// ───────────────────────── 4. « الباقي معدوم » — three sentences, one fact ─────────────────────────

/** The three phrasings; `first` = what the number written first really is: the gap (the dividend) or the plank. */
const FORMS = [
  { id: 'yaqbal', mid: 'يقبل القسمة على', first: 'gap' },
  { id: 'mudaaf', mid: 'مضاعف للعدد', first: 'gap' },
  { id: 'yaqsim', mid: 'يقسم', first: 'plank' },
];
const FORM = byId(FORMS);
/** A sentence as a case: its words, and the bridge it REALLY means (which holds — the sentence is true — or not). */
function sentence(form, x, y) {
  const [a, b] = FORM[form].first === 'gap' ? [x, y] : [y, x];
  return { form, x, y, text: `${x} ${FORM[form].mid} ${y}`, ...outcome(a, b) };
}
/** The sentence « small … big » said the right way round in that phrasing — or, `reversed`, the other way round. */
const about = (form, small, big, reversed = false) => {
  const smallFirst = (FORM[form].first === 'plank') !== reversed;
  return smallFirst ? sentence(form, small, big) : sentence(form, big, small);
};
const sentenceId = (c) => `${c.form}:${c.x}:${c.y}`;

const B_QUANT = [
  { id: 'r', label: 'باقي القسمة الإقليدية', of: (n, d) => n % d },
  { id: 'q', label: 'حاصل القسمة الإقليدية', of: (n, d) => Math.floor(n / d) },
];
/** `label` follows « عندما يكون … » in the rule; `yes` / `no` are said of the number the rule has just read. */
const B_COND = [
  { id: 'zero', label: 'يساوي 0', yes: 'وهو يساوي 0', no: 'وهو لا يساوي 0', test: (v) => v === 0 },
  {
    id: 'less',
    label: 'أصغر من القاسم',
    yes: 'وهو أصغر من القاسم',
    no: 'وهو ليس أصغر من القاسم',
    test: (v, d) => v < d,
  },
  { id: 'even', label: 'عددًا زوجيًّا', yes: 'وهو عدد زوجي', no: 'وهو عدد فردي', test: (v) => v % 2 === 0 },
  {
    id: 'natural',
    label: 'عددًا طبيعيًّا',
    yes: 'وهو عدد طبيعي',
    no: 'وهو ليس عددًا طبيعيًّا',
    test: (v) => Number.isInteger(v) && v >= 0,
  },
];
const B_DIR = [
  { id: 'second', label: 'العدد الثاني على العدد الأوّل' },
  { id: 'first', label: 'العدد الأوّل على العدد الثاني' },
];
const BQ = byId(B_QUANT);
const BC = byId(B_COND);
const BD = byId(B_DIR);
/** The division the rule makes for a sentence: which number it divides (n), by which (d). */
const divisionOf = (rule, c) =>
  c.form === 'yaqsim' && rule.dir === 'second' ? { n: c.y, d: c.x } : { n: c.x, d: c.y };
const restSays = (rule, c) => {
  const { n, d } = divisionOf(rule, c);
  return BC[rule.c].test(BQ[rule.q].of(n, d), d);
};
const isRestRule = (rule) => rule?.q === 'r' && rule?.c === 'zero' && rule?.dir === 'second';
/** Pairs (small, big) the mirror can draw: the small one divides the big one — or, in `OFF`, it does not. */
const PAIRS = [
  [6, 42],
  [7, 35],
  [8, 96],
  [4, 52],
  [9, 63],
  [5, 85],
  [3, 51],
  [6, 78],
];
const OFF = [
  [6, 44],
  [7, 37],
  [8, 92],
  [4, 50],
  [9, 60],
];
/** Every sentence a mirror can show: the three phrasings, both ways round, on numbers that divide and that do not. */
const SENTENCES = FORMS.flatMap((f) =>
  [...PAIRS, ...OFF].flatMap(([s, b]) => [about(f.id, s, b), about(f.id, s, b, true)]),
);
/** When the crossing gave fewer lines: bridges of the story said as a sentence. */
const STORY_LINES = [
  sentence('yaqbal', 35, 5),
  sentence('yaqbal', 46, 5),
  sentence('yaqbal', 46, 2),
  sentence('yaqbal', 81, 2),
];
/** The last step: a sentence the mirror does not build — the Euclidean division decides (half of them are true). */
const REST_USE = [
  [392, 14],
  [395, 14],
  [744, 24],
  [750, 24],
  [675, 45],
  [680, 45],
];

const restForge = {
  key: 'baqi-sifr',
  slots: [
    { id: 'q', label: 'ماذا أقرأ؟', options: options(B_QUANT) },
    { id: 'c', label: 'كيف يجب أن يكون؟', options: options(B_COND) },
    { id: 'dir', label: 'في « … يقسم … » أقسم:', options: options(B_DIR) },
  ],
  says: restSays,
  isTheRule: isRestRule,
  ruleText: (rule) =>
    `تكون الجملة صحيحة عندما يكون ${BQ[rule.q].label} ${BC[rule.c].label}؛ وفي « يقسم » أقسم ${BD[rule.dir].label}.`,
  explain(rule, c) {
    const { n, d } = divisionOf(rule, c);
    const q = Math.floor(n / d);
    const r = n % d;
    const v = BQ[rule.q].of(n, d);
    const yes = restSays(rule, c);
    return `قاعدتك تقسم ${n} على ${d}: ${math(`${n} = ${d} × ${q} + ${r}`)}. ${BQ[rule.q].label} ${v}، ${yes ? BC[rule.c].yes : BC[rule.c].no}: فهي تقول إنّ الجملة ${yes ? 'صحيحة' : 'خاطئة'}.`;
  },
  caseId: sentenceId,
  /**
   * His crossing said as sentences (« 46 يقبل القسمة على 2 »: the bridges he built), then the sentences the mirror judged
   * in front of him; never fewer than four lines.
   */
  evidence(rows) {
    const out = [];
    for (const row of rows) {
      const c = row.form ? sentence(row.form, row.x, row.y) : sentence('yaqbal', row.a, row.b);
      const i = out.findIndex((x) => sentenceId(x) === sentenceId(c));
      if (i >= 0) out.splice(i, 1);
      out.push({ ...c, mirror: Boolean(row.mirror) });
    }
    const own = out.filter((x) => !x.mirror).slice(-5);
    const mirrored = out.filter((x) => x.mirror).slice(-(LINES - own.length));
    const lines = [...own, ...mirrored];
    const base = STORY_LINES.filter((c) => !lines.some((x) => sentenceId(x) === sentenceId(c)));
    return [...base.slice(0, Math.max(0, 4 - lines.length)).map((c) => ({ ...c, mirror: true })), ...lines];
  },
  /** Six sentences which alternate: a true one, a false one by its numbers, « يقسم » both ways round… */
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const seen = new Set(rows.map(sentenceId));
    const used = [];
    const pair = (list) => {
      const p = pick(list.filter((x) => !used.includes(x)));
      used.push(p);
      return p;
    };
    const fresh = (make, list) => {
      for (let k = 0; k < 20; k += 1) {
        const c = make(pair(list));
        if (!seen.has(sentenceId(c))) return c;
      }
      return make(pair(list));
    };
    return [
      fresh((p) => about('yaqbal', ...p), PAIRS),
      fresh((p) => about('mudaaf', ...p), OFF),
      fresh((p) => about('yaqsim', ...p), PAIRS),
      fresh((p) => about('yaqsim', ...p, true), PAIRS),
      fresh((p) => about('mudaaf', ...p), PAIRS),
      fresh((p) => about('yaqbal', ...p), OFF),
    ];
  },
  /** A wrong rule: the first new sentence it judges wrongly. The right one: « يقسم » the wrong way round, and a multiple. */
  attacks(rule, rows) {
    if (!isRestRule(rule)) return firstBreak(SENTENCES, (c) => restSays(rule, c), rows, sentenceId);
    const seen = new Set(rows.map(sentenceId));
    const trap = PAIRS.map((p) => about('yaqsim', ...p, true)).find((c) => !seen.has(sentenceId(c)));
    const truth = PAIRS.map((p) => about('mudaaf', ...p)).find((c) => !seen.has(sentenceId(c)));
    return [trap, truth].filter(Boolean);
  },
  // never a choice between two written rules: one more pair of sentences each time
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [sentence('yaqbal', 42, 6), sentence('yaqbal', 44, 6)] };
    if (n === 2) return { kind: 'experiment', cases: [sentence('yaqsim', 6, 42), sentence('yaqsim', 42, 6)] };
    return { kind: 'experiment', cases: [sentence('mudaaf', 45, 9), sentence('mudaaf', 47, 9)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)(REST_USE);
      return outcome(a, b);
    },
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
    title: 'مرآة اللوح الحجري',
    log: 'جمل عن جسورك',
    ask: () => 'هل هذه الجملة صحيحة؟',
    yes: 'صحيحة',
    no: 'خاطئة',
    fact: (c) =>
      c.held
        ? 'الجسر الذي تعنيه ثبت، ولم تبقَ أيّ خانة: الجملة صحيحة.'
        : c.b > c.a
          ? `هي تعني لوحًا طوله ${c.b} فوق هوّة من ${cellsOf(c.a)}: لا يدخل. الجملة خاطئة.`
          : 'الجسر الذي تعنيه انهار، وبقيت خانات: الجملة خاطئة.',
    eq: (c) =>
      c.b > c.a ? null : `$${c.a} = ${c.b} \\times ${c.q} + \\textcolor{${c.held ? '#34d399' : '#fbbf24'}}{${c.r}}$`,
    next: 'جملة أخرى',
    frame: 'تكون الجملة صحيحة عندما:',
    buildLead: 'ثلاث بطاقات: ماذا تقرأ، كيف يجب أن يكون، وأيّ عدد تقسم في « يقسم ». المرآة ستقرأ جملك بقاعدتك.',
    testing: 'المرآة تقرأ الجمل بقاعدتك، واحدةً بعد الأخرى…',
    says: (yes) => `قاعدتك: ${yes ? 'صحيحة' : 'خاطئة'}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ « ${m.text} » ${m.says ? 'صحيحة' : 'خاطئة'} — لكنّ الجسر الذي تعنيه ${m.held ? 'ثبت' : 'انهار'}.`,
    agreed: 'قاعدتك تحكم على كلّ الجمل كما فعلت الجسور. الآن المرآة تتحدّاها بجملة جديدة.',
    attack: (c) => `المرآة تتحدّى قاعدتك: « ${c.text} ». ماذا تقول قاعدتك؟`,
    fire: 'ابنِ الجسر الذي تعنيه',
    survived: 'صمدت قاعدتك: الجسر فعل ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yes ? 'صحيحة' : 'خاطئة'} »، والجسر ${yes ? 'انهار' : 'ثبت'}.`,
    wordsHint: 'مثال: تكون الجملة صحيحة عندما…',
    experiment: 'انظر جيّدًا: جملتان متقاربتان. أيّ جسر تبنيه المرآة في كلّ مرّة، وماذا بقي؟',
    tryKey: (c) =>
      `« ${c.a} يقبل القسمة على ${c.b} ». المرآة لا تبني هذه المرّة: اكتب القسمة الإقليدية، ثمّ احكم على الجملة.`,
    use: {
      sum: 'المساواة غير صحيحة: احسب الجداء ثمّ أضف الباقي.',
      big: 'الباقي يجب أن يكون أصغر من القاسم: ما زال هناك مكان للوح آخر.',
      verdict: 'القسمة صحيحة. انظر إلى الباقي: ماذا تقول قاعدتك عن الجملة؟',
    },
    useOk: 'جملة حُكم عليها بالباقي وحده: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes (in the order of the story: islands C, E, G, then the stone). */
export const FORGES = {
  'raqm-alahad': unitsForge,
  'majmu-arqam': sumForge,
  'raqmayn-akhirayn': last2Forge,
  'baqi-sifr': restForge,
};
