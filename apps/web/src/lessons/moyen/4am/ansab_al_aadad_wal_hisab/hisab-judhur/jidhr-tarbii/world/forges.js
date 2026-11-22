/**
 * THE THREE FORGES of lesson `jidhr-tarbii` « الجذر التربيعي لعدد موجب » — one per key, each of ITS OWN nature (frame:
 * kit/forge.js; screen: kit/RuleForge.jsx; a case of this world and how the mirror draws it: rootCourts/ruleForge.js and
 * rootCourts/forgeParts.jsx). No rule is told: every false rule the tiles can write is refuted in front of him by what a
 * platform does, and the rule gets its name only on its tablet (`tablets.js`).
 *
 *   🔑 dil-as-saha     found IN THE WORLD (no experiment): his evidence is every platform he lowered on the courts of
 *                      30, 16, 36 and 100 (the world's log). « تركب المنصّة مصعد الساحة عندما: [what I compute from the
 *                      rod] [equals what] » — 4 × 4 = 16 rules, one holds: the rod × itself equals the court's area.
 *                      The court of 16 lets « four times the rod » ride by chance; 36 breaks it. The mirror writes NO
 *                      product (`eq: () => null`): « 5 × 5 = 25 » would state the rule.
 *   ✍️ qima-madbuta    the experiment `calc` (inquiries.js) on the court of 30: 5, 5,5, the calculator's ten digits, then
 *                      the rod clamped on the wall. « طول ضلع الساحة: [the nearest whole number / it has no length / the
 *                      length whose square is its area] ؛ وما تعرضه الحاسبة: [is that length, always / is never that
 *                      length / comes close to it, and may be it] » — 3 × 3 = 9 rules, one holds. « the calculator shows
 *                      the length » falls on HIS calculator row (a band); « never » falls on the court of 36, where the
 *                      calculator shows 6 and 6 rides.
 *   🔁 dhahab-wa-iyab  the experiment `roundtrip` (inquiries.js): the two stations. « ابنِ على ضلع الساحة a: [a / a × a
 *                      / نصف a / 2 × a] ؛ خذ ضلع ساحة بُنيت على مقياس a: [طول المقياس / a × a / العدد نفسه بإشارته / نصف
 *                      a] » — 4 × 4 = 16 rules, one holds. A case is a CLAIM about what a station gives; the mirror
 *                      lowers the claim's platform: it rides exactly when the claim is what the station gives.
 * `forges.test.js` writes every rule the tiles allow, proves exactly one holds, and refutes every other by a computed
 * case — on his own evidence or on a new one — on several logs, the thinnest included.
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { pick } from '../../../../../../common/gameworld/kit/random';
import {
  attacksOf,
  fractionBox,
  givenFraction,
  judge,
  lazy,
  line,
  noPredictions,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import {
  compare,
  equal,
  isWall,
  magnitude,
  minus,
  platform,
  read,
  rootOf,
  square,
  tex,
  times,
  write,
} from '../../../../../../common/gameworld/rootCourts/logic';
import {
  COURT_TEXT,
  caseId as courtId,
  caseOf,
  courtPool,
  evidenceOf,
  inCourtWriting,
  tiles,
} from '../../../../../../common/gameworld/rootCourts/ruleForge';
import { runOp } from '../../../../../../common/gameworld/rootCourts/roundtrip';
import { BUILD, CALC_INQUIRY, ROUNDTRIP_INQUIRY, TAKE, steps, wholeBelow } from './inquiries';
import { COURTS } from './story';

/**
 * The three keys, as LITERALS: the status script finds each id quoted in this file (`scripts/lesson-v2-status.mjs` ›
 * « every rule is forged »). They are the list `journey.js › KEYS` (journey.test.js checks the two agree); the files the
 * journey imports (practice, knowledge) take the ids from here, never from the journey (a cycle).
 */
export const K1 = 'dil-as-saha';
export const K2 = 'qima-madbuta';
export const K3 = 'dhahab-wa-iyab';
const n = (v) => Number(v);

// ───────────────────────── the numbers of the last steps (checked against the bank in forges.test.js) ─────────────────────────

/** The last step's courtyards: 22², 26², 29², 31² (none named by the bank nor by another story). */
export const USE1 = [484, 676, 841, 961];
/** The last step's three courts (none a perfect square, none named by the bank): their sides lie between 6 and 10. */
export const USE2 = [
  [39, 58, 87],
  [43, 62, 79],
  [47, 67, 83],
];
/** The last step's journeys (no number of the bank, none of the other forges): a wall, a rod, a walk, a fraction. */
export const USE3 = [
  { wall: 37, rod: 32, walk: 27, frac: [3, 8] },
  { wall: 53, rod: 38, walk: 33, frac: [4, 7] },
  { wall: 61, rod: 42, walk: 48, frac: [5, 6] },
];

// ───────────────────────── exact helpers ─────────────────────────

/** A number in LaTeX in the writing of its court: a court given as a fraction keeps fractions (« \\dfrac{9}{16} »). */
export function texIn(x, area) {
  if (!String(area).includes('/')) return tex(x);
  const { n: p, d } = read(x);
  return d === 1n ? String(p) : `${p < 0n ? '-' : ''}\\dfrac{${p < 0n ? -p : p}}{${d}}`;
}
/** The whole square root of a BigInt, rounded down. */
const isqrt = (v) => {
  if (v < 2n) return v;
  let x = BigInt(Math.floor(Math.sqrt(Number(v))));
  while (x * x > v) x -= 1n;
  while ((x + 1n) * (x + 1n) <= v) x += 1n;
  return x;
};
/**
 * What a ten-digit calculator shows for the side of a court of a WHOLE area: the root rounded to ten significant
 * digits, computed exactly (30 → « 5,477225575 »); the root itself when it is a number (36 → « 6 », 0,81 → « 0,9 »).
 */
export function calculator(area, digits = 10) {
  const exact = rootOf(area);
  if (exact != null) return exact;
  const a = read(area);
  if (a.d !== 1n) throw new Error(`calculator: ${area} is not a whole area`);
  const whole = String(isqrt(a.n)).length;
  const k = BigInt(digits - whole); // the decimals shown
  const r = isqrt(a.n * 10n ** (2n * (k + 1n))); // one digit more, to round
  return write(`${(r + 5n) / 10n}/${10n ** k}`);
}
/** The longest rod of two decimals whose platform does not pass the court: the side cut to 0,01 (« 5,47 » for 30). */
export function cutTo2(area) {
  const a = read(area);
  const c = isqrt((a.n * 10000n) / a.d);
  return { i: String(c / 100n), d: String(c % 100n).padStart(2, '0') };
}

// ───────────────────────── the words a forge shares with the world ─────────────────────────

const rides = (yes) => (yes ? 'تركب' : 'لا تركب');
/** A rod in a plain sentence: its number isolated, or a wall in words — never a sign drawn without its bar. */
const rodWords = (s) => (isWall(s) ? `ضلع الساحة ${ltr(s.root)}` : ltr(s.q));

// ═════════════════════════ 1. 🔑 dil-as-saha — what makes a platform ride ═════════════════════════

const F1_CALC = [
  { id: 'self', label: 'المقياس × نفسه', of: (r) => square(r), tex: (t) => `${t} \\times ${t}` },
  { id: 'twice', label: 'المقياس × 2', of: (r) => times(r, '2'), tex: (t) => `${t} \\times 2` },
  { id: 'four', label: 'المقياس × 4', of: (r) => times(r, '4'), tex: (t) => `${t} \\times 4` },
  { id: 'plus', label: 'المقياس + 2', of: (r) => minus(r, '-2'), tex: (t) => `${t} + 2` },
];
/**
 * The second column. « half the area » (the brief's tile) was replaced by « a third of the area »: with it, « the rod × 2
 * equals half the area » and « the rod × 4 equals the area » were the same rule on every court, and so were « × 2 = a
 * quarter » and « × 4 = half » — `forges.test.js` proves no two of the sixteen rules agree on every case.
 */
const F1_EQ = [
  { id: 'area', label: 'مساحة الساحة', of: (a) => read(a), tex: (A) => A },
  { id: 'third', label: 'ثلث المساحة', of: (a) => times(a, '1/3'), tex: (A) => `${A} \\div 3` },
  { id: 'quarter', label: 'ربع المساحة', of: (a) => times(a, '1/4'), tex: (A) => `${A} \\div 4` },
  { id: 'less', label: 'المساحة إلا 1', of: (a) => minus(a, '1'), tex: (A) => `${A} - 1` },
];
const J1 = judge({
  slots: [
    { id: 'calc', label: 'ما أحسبه من المقياس', options: F1_CALC },
    { id: 'eq', label: 'يساوي ماذا؟', options: F1_EQ },
  ],
  right: { calc: 'self', eq: 'area' },
  says: (rule, c, tile) => equal(tile.calc[rule.calc].of(c.s.q), tile.eq[rule.eq].of(c.a)),
});

/** A platform of the world on a court: the rod is a NUMBER (a wall has no place before key 🔑 — it is drawn with √). */
const numberRow = (row) => row && row.s && !isWall(row.s);
/** A case of 🔑: a court and a number rod; its line needs no tag (the world's word for what it did is there). */
const k1 = (a, q) => caseOf(a, q, { tag: '' });
/** What the story guarantees he did before the mirror: he rode the courts of 16, 36 and 100 (the log keeps 24 rows). */
const F1_LIVED = [COURTS.small, COURTS.palm, COURTS.wind].map((a) => k1(a, rootOf(a)));
/** The hard cases of the right rule: a side LARGER than its area (0,25 → 0,5), a rod as long as the area, a fraction. */
export const F1_HARD = [k1('0,25', '0,5'), k1('0,25', '0,25'), k1('9/16', '3/4')];
/** Courts the mirror may build to break a wrong rule that survived (never needed on a real road: see the test). */
const F1_POOL = lazy(() => [
  ...F1_HARD,
  // each court with its side, the rods of « × 4 » and « × 2 » rules, and its area less 2 (the world's `courtPool`)
  ...courtPool({
    areas: ['0,25', '9/16', '6,25', '12,25', '20,25'],
    rods: (a) =>
      [rootOf(a), write(times(a, '1/4')), write(times(a, '1/2')), write(minus(a, '2'))].filter(
        (q) => compare(q, '0') > 0,
      ),
    extra: () => ({ tag: '' }),
  }),
]);

const forge1 = {
  key: K1,
  ...J1,
  chip: (s, o) => (s.id === 'eq' ? `يساوي ${o.label}` : o.label),
  ruleText: (rule) =>
    `تركب المنصّة مصعد الساحة عندما يكون ${J1.tile.calc[rule.calc].label} يساوي ${J1.tile.eq[rule.eq].label}.`,
  explain(rule, c) {
    const C = J1.tile.calc[rule.calc];
    const E = J1.tile.eq[rule.eq];
    const left = C.of(c.s.q);
    const right = E.of(c.a);
    const lhs = `${C.tex(texIn(c.s.q, c.a))} = ${texIn(left, c.a)}`;
    const rhs = rule.eq === 'area' ? texIn(c.a, c.a) : `${E.tex(texIn(c.a, c.a))} = ${texIn(right, c.a)}`;
    const same = equal(left, right);
    return `قاعدتك: $${lhs}$، و${rule.eq === 'area' ? 'المساحة' : ` ${E.label}`} $${rhs}$ — ${same ? 'متساويان' : 'مختلفان'}، فالمنصّة ${rides(same)}.`;
  },
  caseId: courtId,
  evidence(rows) {
    const ev = evidenceOf(rows.filter(numberRow).map((r) => ({ tag: '', ...r })));
    const his = ev.filter((c) => !c.mirror);
    const facts = F1_LIVED.filter((f) => !his.some((c) => courtId(c) === courtId(f))).map((f) => ({
      ...f,
      mirror: false,
    }));
    return [...his, ...facts, ...ev.filter((c) => c.mirror)];
  },
  predictCases: noPredictions,
  attacks: attacksOf({ ...J1, caseId: courtId, pool: F1_POOL, hard: F1_HARD }),
  // never a choice between two written rules: one court, a rod that rides and a longer one that does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [k1('6,25', '2,5'), k1('6,25', '3')] };
    if (k === 2) return { kind: 'experiment', cases: [k1('20,25', '4'), k1('20,25', '4,5')] };
    return { kind: 'experiment', cases: [k1('12,25', '3,5'), k1('12,25', '4')] };
  },
  logs: true,
  use: {
    /** A square courtyard of three digits — a perfect square, no number of the bank (checked in the test). */
    make: (rand = Math.random) => ({ area: pick(rand, USE1) }),
    lines: (c) => [
      line([slot('x', 'المقياس', 2), '×', slot('y', 'المقياس', 2), '=', String(c.area)]),
      line(['طول ضلعها', '=', slot('side', 'الضلع', 2)], 'rtl'),
    ],
    check: (c, v) => {
      const [x, y, s] = [n(v.x), n(v.y), n(v.side)];
      if (x * y !== c.area) return 'product';
      if (x !== y) return 'square';
      return s === x ? 'ok' : 'side';
    },
  },
  text: {
    ...COURT_TEXT,
    // the mirror writes no product: « 5 × 5 = 25 < 30 » IS the rule of this key
    eq: () => null,
    frame: 'تركب المنصّة مصعد الساحة عندما:',
    buildLead: 'اختر بطاقة من كلّ عمود. المرآة لا تصدّق أحدًا: ستجرّب قاعدتك على كلّ منصّة أنزلتها في ساحات القصر.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: ساحة مساحتها $${texIn(c.a, c.a)}$ بلاطة، ومقياس طوله $${texIn(c.s.q, c.a)}$. ماذا تقول قاعدتك: هل تركب منصّته المصعد؟`,
    tryKey: (c) =>
      `ساحة مربّعة جديدة مساحتها ${tiles(c.area)}، لا تبنيها المرآة. اكتب الجداء الذي يعطي مساحتها، ثمّ طول ضلعها.`,
    use: {
      product: 'هذا الجداء لا يعطي مساحة الساحة: جرّب مقياسًا آخر.',
      square: 'الساحة مربّعة: ضلعاها متساويان، فاكتب العدد نفسه مرّتين.',
      side: 'طول الضلع هو المقياس الذي ضربته في نفسه.',
    },
    useOk: 'مفتاحك يعمل حتّى حيث لا ترى الساحة!',
  },
};

// ═════════════════════════ 2. ✍️ qima-madbuta — one length, three candidates ═════════════════════════

const nearestWhole = (area) => {
  const k = wholeBelow(area);
  return compare(square(`${k},5`), area) > 0 ? k : k + 1;
};
/** The side of the court in a sentence: its nearest whole number, as a formula. */
const F2_SIDE = [
  {
    id: 'whole',
    label: 'أقرب عدد طبيعي',
    says: (c) => !isWall(c.s) && equal(c.s.q, String(nearestWhole(c.a))),
  },
  { id: 'none', label: 'لا طول له: لا مقياس يركبها', says: () => false },
  { id: 'square', label: 'الطول الذي مربّعه مساحتها', says: (c) => equal(platform(c.s), c.a) },
];
const F2_SHOWS = [
  { id: 'same', label: 'هو ذلك الطول دائمًا', says: () => true },
  { id: 'never', label: 'لا يكون ذلك الطول أبدًا', says: () => false },
  // it may be the length: it is when its platform covers the court — the platform decides, as for any rod
  { id: 'may', label: 'يقترب منه، وقد يكونه', says: (c) => equal(platform(c.s), c.a) },
];
const J2 = judge({
  slots: [
    { id: 'side', label: 'طول ضلع الساحة هو:', options: F2_SIDE },
    { id: 'shows', label: 'وما تعرضه الحاسبة:', options: F2_SHOWS },
  ],
  right: { side: 'square', shows: 'may' },
  // a rod the calculator showed is judged by what he thinks of the calculator; any other rod by what he thinks the side is
  says: (rule, c, tile) => (c.calc != null ? tile.shows[rule.shows].says(c) : tile.side[rule.side].says(c)),
});

/** The cases of ✍️ — a court and a rod, marked as this forge's (`of`): a number, the calculator's, or the wall. */
export const numCase = (a, q) => caseOf(a, q, { of: 'calc', tag: '' });
export const calcCase = (a, shows = calculator(a)) =>
  caseOf(a, shows, { of: 'calc', calc: write(shows), tag: 'الحاسبة', id: `calc|${write(a)}|${write(shows)}` });
/**
 * The wall of a court: its line names itself (`head`) — the world's line would write the rod √30, and the writing of a
 * side no number reaches is what THIS key names (tablet ✍️). For the same reason no case the MIRROR builds in this forge
 * is a wall (the court's drawing labels a wall rod with its radical): only his own clamped rod, in his log.
 */
export const wallCase = (a) =>
  caseOf(a, 'wall', { of: 'calc', tag: 'الجدار', head: `ساحة ${write(a)} · مقياس الجدار` });
const ownOf = (of) => (rows) => evidenceOf(rows.filter((r) => r.of === of));

/** The right rule's hard cases: a new court the calculator misses (41), and the court of 36, where it shows 6. */
export const F2_HARD = [calcCase('41'), calcCase(COURTS.palm)];
const F2_POOL = lazy(() => [
  calcCase(COURTS.palm),
  ...F2_HARD,
  calcCase('0,81'),
  numCase('41', '6'),
  numCase(COURTS.palm, '6'),
]);
/** The product of a rod by itself, as the mirror may write it beside the court — when it is short enough to read. */
const shortEq = (c) => {
  if (isWall(c.s)) return null;
  const covers = inCourtWriting(write(platform(c.s)), c.a);
  return covers.length <= 8 ? COURT_TEXT.eq(c) : null;
};
const rodName = (c) =>
  isWall(c.s) ? 'المقياس المشدود على الجدار' : c.calc != null ? `مقياس الحاسبة ${ltr(c.s.q)}` : `المقياس ${ltr(c.s.q)}`;

const forge2 = {
  key: K2,
  ...J2,
  chip: (s, o) => (s.id === 'shows' ? `وما تعرضه الحاسبة ${o.label}` : o.label),
  ruleText: (rule) =>
    `طول ضلع الساحة هو ${J2.tile.side[rule.side].label}، وما تعرضه الحاسبة ${J2.tile.shows[rule.shows].label}.`,
  explain(rule, c) {
    const yes = J2.says(rule, c);
    const q = isWall(c.s) ? null : tex(c.s.q);
    const A = tex(c.a);
    const sq = q && `$${q} \\times ${q} ${equal(platform(c.s), c.a) ? '=' : '\\neq'} ${A}$`;
    if (c.calc != null) {
      if (rule.shows === 'same') return `قاعدتك: ما تعرضه الحاسبة هو الطول دائمًا، فمنصّة $${q}$ تركب.`;
      if (rule.shows === 'never') return `قاعدتك: ما تعرضه الحاسبة ليس الطول أبدًا، فمنصّة $${q}$ لا تركب.`;
      return `قاعدتك: ما تعرضه الحاسبة يقترب من الطول، ويكونه حين يكون مربّعه المساحة: ${sq}، فمنصّته ${rides(yes)}.`;
    }
    if (rule.side === 'none') return 'قاعدتك: لا طول لضلع هذه الساحة، فلا يركبها أيّ مقياس.';
    if (rule.side === 'whole') {
      const k = nearestWhole(c.a);
      return isWall(c.s)
        ? `قاعدتك: الطول هو أقرب عدد طبيعي، $${k}$ — والمقياس المشدود على الجدار ليس $${k}$، فمنصّته لا تركب.`
        : `قاعدتك: الطول هو أقرب عدد طبيعي، $${k}$، فمنصّة $${q}$ ${rides(yes)}.`;
    }
    return isWall(c.s)
      ? 'قاعدتك: الطول هو الذي مربّعه المساحة، والمقياس المشدود على الجدار من الركن إلى الركن هو ذلك الطول: منصّته تركب.'
      : `قاعدتك: الطول هو الذي مربّعه المساحة، و ${sq}، فمنصّة $${q}$ ${rides(yes)}.`;
  },
  caseId: courtId,
  // his evidence is what he did in the experiment (`fromInquiry`) and what the mirror showed; the world's log is not his
  // evidence here (the experiment replaces it) — a row of it carries no `of`
  evidence: ownOf('calc'),
  inquiry: CALC_INQUIRY,
  fromInquiry: (result) => ({
    rows: ownOf('calc')(
      result.rows.map((r) =>
        r.calc != null ? calcCase(r.a, r.calc) : isWall(r.s) ? wallCase(r.a) : numCase(r.a, r.s.q),
      ),
    ),
  }),
  predictCases: noPredictions,
  attacks: attacksOf({ ...J2, caseId: courtId, pool: F2_POOL, hard: F2_HARD }),
  // never a choice between two written rules: two rods built in the mirror, one rides and one does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [calcCase('59'), calcCase('7,29')] };
    if (k === 2) return { kind: 'experiment', cases: [calcCase('0,81'), numCase('0,81', '0,8')] };
    return { kind: 'experiment', cases: [calcCase('6,25'), calcCase('73')] };
  },
  use: {
    /** Three courts the calculator was asked about; its displays come in another order than the areas. */
    make(rand = Math.random) {
      const areas = pick(rand, USE2);
      const order = pick(rand, [
        [1, 2, 0],
        [2, 0, 1],
        [1, 0, 2],
      ]);
      return { areas, order, shows: order.map((i) => calculator(String(areas[i]))) };
    },
    /**
     * Each box says what goes in it (the owner could not tell, 2026-11-21: one line held three unnamed boxes):
     *   three lines, read from the right: « الحاسبة: 9,110433579 ← ضلع الساحة [ ] » — he writes the
     *   AREA of the court this display belongs to;
     *   one last line for ONE court, laid left to right so the typed decimal reads as every number does (whole part,
     *   comma, decimals), its words on the right: « أطول مقياس للساحة 47 : [ ],[ ] » (the sentence above says: two
     *   decimals, and it must leave a band). Four lines stand in two columns (the kit's grid): each is kept SHORT.
     * No line writes √ (the kit has no typed radical yet).
     */
    lines: (c) => [
      ...c.order.map((_, k) => line([`الحاسبة: ${c.shows[k]}`, '←', 'ضلع الساحة', slot(`a${k}`, 'المساحة', 2)], 'rtl')),
      line([slot('i', 'الوحدات', 1), ',', slot('d', 'الجزء العشري', 2), ':', `أطول مقياس للساحة ${c.areas[0]}`]),
    ],
    check(c, v) {
      for (let k = 0; k < c.order.length; k += 1) if (n(v[`a${k}`]) !== n(String(c.areas[c.order[k]]))) return 'match';
      const d = String(v.d ?? '');
      if (d.length !== 2) return 'two';
      const cut = cutTo2(String(c.areas[0]));
      const said = compare(`${n(v.i)},${d}`, `${cut.i},${cut.d}`);
      if (said > 0) return 'jam';
      if (said < 0) return 'longer';
      return 'ok';
    },
  },
  text: {
    ...COURT_TEXT,
    // this forge opens by the calculator of the first terrace, not in the hall of mirrors
    title: 'مرآة الحاسبة',
    log: `مقاييس الساحة ${COURTS.first}`,
    fact: (c) => (c.kind === 'ride' ? 'تركب المنصّة المصعد: غطّت الساحة كلّها.' : COURT_TEXT.fact(c)),
    eq: shortEq,
    frame: 'طول ضلع الساحة:',
    buildLead: `اختر بطاقة من كلّ عمود. المرآة ستجرّب قاعدتك على كلّ مقياس أنزلته في الساحة ${COURTS.first}، مقياسِ الحاسبة والجدارِ معًا.`,
    testing: 'المرآة تمرّ على مقاييسك واحدًا واحدًا…',
    refuted: (m) =>
      `قاعدتك تقول إنّ منصّة ${rodName(m)} ${rides(m.says)} الساحة ${ltr(m.a)} — لكنّك رأيتها ${rides(m.held)}.`,
    agreed: 'قاعدتك توافق كلّ مقاييسك. الآن المرآة تتحدّاها بساحة أخرى وحاسبتها.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: ${
        c.calc != null
          ? `سُئلت الحاسبة عن ضلع ساحة مساحتها $${tex(c.a)}$ بلاطة فعرضت $${tex(c.s.q)}$. هل تركب منصّة هذا المقياس؟`
          : isWall(c.s)
            ? `ساحة مساحتها $${tex(c.a)}$ بلاطة، والمقياس مشدود على جدارها من الركن إلى الركن. هل تركب منصّته؟`
            : `ساحة مساحتها $${tex(c.a)}$ بلاطة، ومقياس طوله $${tex(c.s.q)}$. هل تركب منصّته؟`
      } ماذا تقول قاعدتك؟`,
    wordsHint: 'مثال: طول الضلع هو…',
    experiment: 'انظر جيّدًا: مقياسان تبنيهما المرآة. ماذا فعلت كلّ منصّة؟',
    tryKey: (c) =>
      `الحاسبة عرضت أضلاع الساحات ${c.areas.join(' و ')} بترتيب آخر. اكتب أمام كلّ عدد مساحة ساحته، ثمّ أطول مقياس بمنزلتين بعد الفاصلة يترك شريطًا في الساحة ${c.areas[0]}.`,
    use: {
      match: 'عدد من الثلاثة ليس ضلع الساحة التي كتبتَها: الساحة الأكبر ضلعها أطول.',
      two: 'اكتب منزلتين عشريّتين بعد الفاصلة.',
      jam: 'منصّة هذا المقياس تعلق: لا تزد على ما تعرضه الحاسبة.',
      longer: 'مقياس أطول منه بمنزلتين عشريّتين ما زال يترك شريطًا.',
    },
    useOk: 'كلّ ضلع مع ساحته، والمقياس يترك أرقّ شريط: مفتاحك يعمل!',
  },
};

// ═════════════════════════ 3. 🔁 dhahab-wa-iyab — two stations that undo each other ═════════════════════════

/** Two rods are the same length: both without a sign, the same platform (√196 and 14 are one rod). */
const sameRod = (x, y) =>
  Boolean(x && y) && [x, y].every((r) => isWall(r) || compare(r.q, '0') >= 0) && equal(platform(x), platform(y));

const F3_BUILD = [
  { id: 'a', label: 'a', of: (R) => read(R), tex: (R) => tex(R) },
  { id: 'aa', label: 'a × a', of: (R) => square(R), tex: (R) => `${tex(R)} \\times ${tex(R)}` },
  { id: 'half', label: 'نصف a', of: (R) => times(R, '1/2'), tex: (R) => `${tex(R)} \\div 2` },
  { id: 'twice', label: '2 × a', of: (R) => times(R, '2'), tex: (R) => `2 \\times ${tex(R)}` },
];
const F3_TAKE = [
  // a rod's length: a wall is a length already, a number loses the sign of the walk that wrote it
  { id: 'a', label: 'طول المقياس', of: (t) => (isWall(t) ? t : { q: write(magnitude(t.q)) }) },
  { id: 'aa', label: 'a × a', of: (t) => ({ q: write(platform(t)) }) },
  { id: 'sign', label: 'العدد نفسه بإشارته', of: (t) => t },
  {
    id: 'half',
    label: 'نصف a',
    of: (t) => (isWall(t) ? { root: write(times(t.root, '1/4')) } : { q: write(times(t.q, '1/2')) }),
  },
];
const J3 = judge({
  slots: [
    { id: 'build', label: 'ابنِ على ضلع الساحة a، فلوحتها:', options: F3_BUILD },
    { id: 'take', label: 'خذ ضلع ساحة بُنيت على مقياس a:', options: F3_TAKE },
  ],
  right: { build: 'a', take: 'a' },
  says: (rule, c, tile) =>
    c.op === 'build' ? equal(tile.build[rule.build].of(c.src), c.a) : sameRod(tile.take[rule.take].of(c.t), c.s),
});

/**
 * A CLAIM about « ابنِ ساحة »: the wall of the court of `R` goes in, the plaque `P` comes out? Drawn as the court P with
 * the rod √R: the platform rides exactly when P is the plaque (`held`).
 */
export const buildCase = (R, P) =>
  caseOf(
    write(P),
    { root: write(R) },
    {
      of: 'rt',
      op: 'build',
      src: write(R),
      held: equal(P, R),
      tag: BUILD,
      id: `build|${write(R)}|${write(P)}`,
    },
  );
/**
 * A CLAIM about « خذ الضلع »: the court built on the rod `t` (a number — a walk to the left is a negative one — or a
 * wall) goes in, the rod `u` comes out? Drawn as that court with the rod u: it rides exactly when u is the rod the
 * station gives (`held`) — a claim is never a negative rod, which the court would draw as its length (tested).
 */
export function takeCase(t, u, { walk = false } = {}) {
  const A = write(platform(t));
  const truth = runOp('take', { court: A }).rod;
  const s = u.root != null ? { root: write(u.root) } : { q: write(u.q) };
  return caseOf(A, s, {
    of: 'rt',
    op: 'take',
    t: t.root != null ? { root: write(t.root) } : { q: write(t.q) },
    walk,
    held: sameRod(s, truth),
    tag: TAKE,
    id: `take|${isWall(t) ? `w${write(t.root)}` : write(t.q)}|${isWall(s) ? `w${s.root}` : s.q}`,
  });
}
/** The journeys of the experiment as cases: what each station REALLY gave (a build on a wall, a take after a build). */
export function roundCases(row) {
  return row.steps.flatMap((st, i) => {
    if (st.op === 'build' && st.in.rod?.root != null) return [buildCase(st.in.rod.root, st.out.court)];
    if (st.op !== 'take' || i === 0 || row.steps[i - 1].op !== 'build') return [];
    const before = row.steps[i - 1].in;
    const t = before.walk != null ? { q: write(before.walk) } : before.rod;
    return [takeCase(t, st.out.rod, { walk: before.walk != null })];
  });
}
const rt = (x) => (x.root != null ? `\\sqrt{${tex(x.root)}}` : tex(x.q));

/** The right rule's hard cases: a NEW walk to the left, a rod that is a fraction — what comes out, and a × a. */
export const F3_HARD = [
  takeCase({ q: '-18' }, { q: '18' }, { walk: true }),
  takeCase({ q: '2/3' }, { q: '4/9' }),
  takeCase({ q: '2/3' }, { q: '2/3' }),
];
const F3_POOL = lazy(() => [
  ...F3_HARD,
  buildCase('86', '86'),
  buildCase('86', '172'),
  buildCase('86', '43'),
  takeCase({ q: '2,5' }, { q: '2,5' }),
  takeCase({ q: '2,5' }, { q: '6,25' }),
  takeCase({ q: '2,5' }, { q: '1,25' }),
  takeCase({ q: '-46' }, { q: '46' }, { walk: true }),
]);
const plaqueWords = (x) => ltr(write(x));
const yn = (yes) => (yes ? 'نعم' : 'لا');

const forge3 = {
  key: K3,
  ...J3,
  chip: (s, o) =>
    s.id === 'build'
      ? `لوحة الساحة المبنيّة على ضلع الساحة a: ${o.label}`
      : `وضلع الساحة المبنيّة على مقياس a: ${o.label}`,
  ruleText: (rule) =>
    `أبني على ضلع الساحة a فتكتب لوحتها ${J3.tile.build[rule.build].label}؛ وآخذ ضلع ساحة بُنيت على مقياس a فأجد ${J3.tile.take[rule.take].label}.`,
  explain(rule, c) {
    const yes = J3.says(rule, c);
    if (c.op === 'build') {
      const B = J3.tile.build[rule.build];
      return `قاعدتك: على $\\sqrt{${tex(c.src)}}$ تُبنى ساحة لوحتها $${rule.build === 'a' ? tex(c.src) : `${B.tex(c.src)} = ${tex(B.of(c.src))}`}$، فهي تقول « ${yn(yes)} » للّوحة $${tex(c.a)}$.`;
    }
    const out = J3.tile.take[rule.take].of(c.t);
    const from = c.walk ? `مقياس المشي $${tex(c.t.q)}$` : `المقياس $${rt(c.t)}$`;
    return `قاعدتك: من الساحة المبنيّة على ${from} يخرج $${rt(out)}$، فهي تقول « ${yn(yes)} » للمقياس $${rt(c.s)}$.`;
  },
  caseId: (c) => c.id,
  evidence: ownOf('rt'),
  inquiry: ROUNDTRIP_INQUIRY,
  fromInquiry: (result) => ({ rows: ownOf('rt')(result.rows.flatMap(roundCases)) }),
  predictCases: noPredictions,
  attacks: attacksOf({ ...J3, caseId: (c) => c.id, pool: F3_POOL, hard: F3_HARD }),
  // never a choice between two written rules: one thing goes in, two claims of what comes out — one rides, one does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [buildCase('86', '86'), buildCase('86', '172')] };
    if (k === 2)
      return {
        kind: 'experiment',
        cases: [takeCase({ q: '2,5' }, { q: '2,5' }), takeCase({ q: '2,5' }, { q: '1,25' })],
      };
    return {
      kind: 'experiment',
      cases: [takeCase({ q: '-46' }, { q: '46' }, { walk: true }), takeCase({ q: '-46' }, { q: '23' }, { walk: true })],
    };
  },
  use: {
    make: (rand = Math.random) => pick(rand, USE3),
    /** Four journeys he does not see, each answer in its own box — a plaque, a side, a walk's side, a fraction. */
    lines: (c) => [
      line([`لوحة ساحة على ضلع الساحة ${c.wall}:`, slot('p', 'اللوحة', 4)], 'rtl'),
      line([`ضلع ساحة على مقياس ${c.rod}:`, slot('s', 'الضلع', 4)], 'rtl'),
      line([`${steps(c.walk)} يسارًا، ثمّ ابنِ وخذ:`, slot('w', 'الضلع', 4)], 'rtl'),
      line(['ضلع ساحة على مقياس', givenFraction(...c.frac), ':', fractionBox('n', 'd', { w: 2 })], 'rtl'),
    ],
    check: (c, v) => {
      if (n(v.p) !== c.wall) return 'plaque';
      if (n(v.s) !== c.rod) return 'side';
      if (n(v.w) !== c.walk) return 'walk';
      const [p, q] = c.frac;
      return n(v.n) >= 1 && n(v.d) >= 1 && n(v.n) * q === n(v.d) * p ? 'ok' : 'frac';
    },
  },
  text: {
    ...COURT_TEXT,
    title: 'مرآة الورشتين',
    log: 'ما خرج من المحطّتين',
    fact: (c) => (c.held ? 'هذا ما خرج من المحطّة.' : 'ليس هذا ما خرج من المحطّة.'),
    frame: 'في الورشتين:',
    buildLead:
      'اختر بطاقة من كلّ عمود. المرآة ستجرّب قاعدتك على رحلاتك: تُنزل المنصّة، فتركب حين يكون ما قالته هو ما خرج.',
    yes: 'نعم',
    no: 'لا',
    says: (yes) => `قاعدتك: ${yn(yes)}`,
    testing: 'المرآة تمرّ على رحلاتك محطّةً محطّة…',
    refuted: (m) =>
      m.op === 'build'
        ? `قاعدتك تقول إنّ لوحة الساحة المبنيّة على ضلع الساحة ${ltr(m.src)} ${m.says ? '' : 'لا '}تكتب ${plaqueWords(m.a)} — لكنّك رأيتها تكتب ${plaqueWords(m.held ? m.a : m.src)}.`
        : `قاعدتك تقول إنّ « ${TAKE} » ${m.says ? 'يُخرج' : 'لا يُخرج'} ${rodWords(m.s)} من الساحة ${ltr(m.a)} — لكنّك رأيته يُخرج ${rodWords(runOp('take', { court: m.a }).rod)}.`,
    agreed: 'قاعدتك توافق كلّ ما خرج من المحطّتين. الآن المرآة تتحدّاها برحلة جديدة.',
    attack: (c) =>
      c.op === 'build'
        ? `المرآة تتحدّى قاعدتك: يدخل ضلع الساحة التي مساحتها $${tex(c.src)}$ محطّة « ${BUILD} ». هل تكتب لوحة الساحة التي تخرج $${tex(c.a)}$؟ ماذا تقول قاعدتك؟`
        : c.walk
          ? `المرآة تتحدّى قاعدتك: مشى زيرو ${steps(Math.abs(n(c.t.q)))} إلى اليسار، فبُنيت ساحة على مقياسه ودخلت « ${TAKE} ». هل يخرج المقياس $${rt(c.s)}$؟ ماذا تقول قاعدتك؟`
          : `المرآة تتحدّى قاعدتك: ساحة بُنيت على مقياس طوله $${rt(c.t)}$ تدخل « ${TAKE} ». هل يخرج المقياس $${rt(c.s)}$؟ ماذا تقول قاعدتك؟`,
    fire: 'أنزِل المنصّة',
    survived: 'صمدت قاعدتك: المحطّة أخرجت ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yn(yes)} »، والمنصّة ${yes ? 'لم تركب' : 'ركبت'}.`,
    wordsHint: 'مثال: أبني على ضلع ساحة فأجد…',
    experiment: 'انظر جيّدًا: شيء واحد يدخل المحطّة، وكتابتان لما يخرج. المرآة تُنزل منصّة كلّ واحدة.',
    tryKey: () => 'المرآة لا تبني هنا: اكتب ما يخرج في آخر كلّ رحلة — لوحةً أو ضلعًا.',
    use: {
      plaque: 'السطر الأوّل: ساحة بُنيت على ضلع ساحة أخرى. ما مساحة تلك الساحة؟',
      side: 'السطر الثاني: الساحة بُنيت على مقياس؛ ضلعها هو ذلك المقياس.',
      walk: 'السطر الثالث: الضلع طول، والمشي إلى اليسار لم يغيّر طول المقياس.',
      frac: 'السطر الرابع: ضلع الساحة هو المقياس الذي بُنيت عليه — كسرًا كما هو.',
    },
    useOk: 'أربع رحلات لم ترها، وأصبتَ آخرها كلّها: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = { [K1]: forge1, [K2]: forge2, [K3]: forge3 };
