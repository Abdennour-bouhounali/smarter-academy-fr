/**
 * THE THREE FORGES of lesson `natiqa-ghayr-natiqa` « الأعداد الناطقة والأعداد غير الناطقة » — one per key, each of ITS
 * OWN nature (frame: kit/forge.js; screen: kit/RuleForge.jsx; a case of this world and how the mirror draws it:
 * rootCourts/ruleForge.js and rootCourts/forgeParts.jsx). No rule is told: every false rule the tiles can write is
 * refuted in front of him by what a platform does, and the rule gets its name only on its tablet (`tablets.js`).
 *
 *   🧩 murabba-natiq   found IN THE WORLD (no experiment): his evidence is every court of « سطح الأعشار » and « سطح
 *                      الفرز » — ridden, or CLOSED by a band and a jam on two neighbouring marks (the world's log). A
 *                      case is a court: does a rod whose length is a number ride it? « … عندما تُكتب مساحتها: [as an
 *                      irreducible fraction / as a fraction, not reduced] [both terms squares / the numerator a square /
 *                      the denominator a square / the denominator 1, 10, 100…] » — 2 × 4 = 8 rules, one holds. His own
 *                      courts refute five (1,6 = 16/10: « the numerator as read »; 8,1 = 81/10: « the numerator »); the
 *                      mirror's FRACTIONS refute the last two (a reducible fraction whose reduced terms are squares).
 *   ♾️ la-kasr-yarkab  the experiment `chase` (inquiries.js) on the court of two tiles: 3/2 … 99/70, each one small tile
 *                      off. « على ساحة لا تُكتب مساحتها مربّع كسر: [a rod of a fraction: never rides / rides when near
 *                      enough / a fraction near enough rides, a decimal never] ؛ [the calculator shows: the side / a
 *                      number near it] ؛ [the rod clamped on the wall: rides / has no side] » — 3 × 2 × 2 = 12 rules,
 *                      one holds. His chase refutes « near enough »; the mirror's calculator (magnified) and wall the
 *                      rest.
 *   🎯 al-mudawwar     found IN THE WORLD (no experiment): on « سطح العلامات » the wall of 19 ends between 4,35 and 4,4,
 *                      that of 66 between 8,12 and 8,125. A case is a CLAIM « of the two neighbouring marks, M is the
 *                      nearer », drawn as the platform of the MIDDLE mark (what he lowered). « الأقرب: [the upper / the
 *                      lower] [if the middle's platform leaves a band / if the lower's band is less than the upper's
 *                      overhang / if the area's last digit is 5 or more / always] » — 2 × 4 = 8 rules, one holds.
 * `forges.test.js` writes every rule the tiles allow, proves exactly one holds, and refutes every other by a computed
 * case — on his own evidence or on a new one — on several logs, the thinnest included.
 *
 * THE STORY IS READ LAZILY: this file imports `./story` (its courts, `framing`), and the story is evaluated before it in
 * every order — but nothing here touches a story binding while this file is evaluated, only when a forge is used.
 * Its exact facts about a root (the marks around the end of a wall, the calculator's display) are `./math`'s, imported —
 * never a copy (`forges.test.js` checks this file defines none of them).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { pick } from '../../../../../../common/gameworld/kit/random';
import {
  attacksOf,
  firstWrong,
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
  isDecimal,
  isWall,
  magnitude,
  minus,
  outcome,
  platform,
  read,
  rootOf,
  square,
  tex,
  write,
} from '../../../../../../common/gameworld/rootCourts/logic';
import { COURT_TEXT, caseId as courtId, caseOf } from '../../../../../../common/gameworld/rootCourts/ruleForge';
import { tiles } from '../../../../../../common/gameworld/rootCourts/strings';
import { CHASE_INQUIRY } from './inquiries';
import { above, calculator, cut, decimalsOf, isqrt, middle, rounded } from './math';
import { COURTS, framing } from './story';

/**
 * The three keys, as LITERALS: the status script finds each id quoted in this file (`scripts/lesson-v2-status.mjs` ›
 * « every rule is forged »). They are the list `journey.js › KEYS` and the story's ids (forges.test.js checks the three
 * agree).
 */
export const K1 = 'murabba-natiq';
export const K2 = 'la-kasr-yarkab';
export const K3 = 'al-mudawwar';

// ───────────────────────── exact facts about a root: math.js's, never a copy (defects.md D8) ─────────────────────────

/** The longest mark of 10^-k whose platform leaves a band (the value by default): « 4,3 » for 19 and k = 1. */
export const cutAt = cut;
/** The next mark (the value by excess): « 4,4 ». */
export const aboveAt = above;
/** The MIDDLE mark between the two: « 4,35 ». */
export const middleAt = middle;
/** The nearer of the two marks (a middle that rides is rounded up, as the school does). */
export const nearestAt = rounded;
export { calculator };
/** A number cut to k decimals (« 1,414213562 » → « 1,41 »). */
const cutDigits = (x, k) => {
  const [i, d = ''] = write(x).split(',');
  return write(`${i},${d.slice(0, k).padEnd(k, '0')}`);
};
/** A decimal typed in two boxes (whole part, decimals), read exactly — or null. */
function typedDecimal(i, d) {
  const [a, b] = [String(i ?? '').trim(), String(d ?? '').trim()];
  return /^\d+$/.test(a) && /^\d+$/.test(b) ? read(`${a},${b}`) : null;
}
/** A fraction typed over a bar, read — or null (an empty box, a denominator 0). */
function typedFrac(p, q) {
  const [a, b] = [String(p ?? '').trim(), String(q ?? '').trim()];
  return /^\d+$/.test(a) && /^\d+$/.test(b) && BigInt(b) > 0n ? read(`${a}/${b}`) : null;
}

// ───────────────────────── the words: a number as the student reads it ─────────────────────────

/** A number in LaTeX AS IT WAS GIVEN: a fraction keeps its terms (20/45 is not 4/9 here), with a real bar. */
const texGiven = (t) => {
  const [p, q] = String(t).split('/');
  return q == null ? tex(p) : `\\dfrac{${p}}{${q}}`;
};
/** A number in a PLAIN sentence: a fraction in words (« 20 على 45 » — never a slash), a decimal isolated. */
const plainNum = (t) => {
  const [p, q] = String(t).split('/');
  return q == null ? ltr(p) : `${p} على ${q}`;
};
/**
 * A number of tiles in a MathText sentence: a whole number with its noun agreed (« بلاطتان », « 82 بلاطة »); a decimal
 * or a fraction as a formula (a real bar), followed by « بلاطة ».
 */
const tilesM = (t) => (/^\d+$/.test(String(t)) ? tiles(String(t)) : `$${texGiven(t)}$ بلاطة`);
const rides = (yes) => (yes ? 'تركب' : 'لا تركب');
const yn = (yes) => (yes ? 'نعم' : 'لا');
/** What the world did with a rod, as one fact — a fraction over its bar, never a slash. */
const worldFact = (c) => {
  const o = outcome(c.s, c.a);
  if (o.kind === 'ride') return 'تركب المنصّة المصعد: غطّت الساحة كلّها.';
  if (o.kind === 'band') return `يبقى شريط مساحته $${tex(o.diff)}$ بلاطة.`;
  return `تعلق على الحافّة: تزيد على الساحة بـ $${tex(o.diff)}$ بلاطة.`;
};

// ═════════════════════════ 1. 🧩 murabba-natiq — which courts a rod of a number rides ═════════════════════════

const isSquare = (v) => isqrt(v) * isqrt(v) === v;
const isPow10 = (v) => /^10*$/.test(String(v));
/** The two terms of an area written as a fraction: reduced (`irr`), or as it is read (`asis`: 1,6 is 16 over 10). */
export function termsOf(area, form) {
  const t = String(area).trim();
  if (form === 'irr') {
    const { n: p, d } = read(t);
    return [p, d];
  }
  const [p, q] = t.split('/');
  if (q != null) return [BigInt(p), BigInt(q)];
  const [i, dec = ''] = p.split(',');
  return [BigInt(`${i}${dec}`), 10n ** BigInt(dec.length)];
}
const F1_FORM = [
  { id: 'irr', label: 'كسرًا غير قابل للاختزال' },
  { id: 'asis', label: 'كسرًا دون اختزال' },
];
const F1_COND = [
  { id: 'both', label: 'بسطه ومقامه مربّعان', test: (p, q) => isSquare(p) && isSquare(q) },
  { id: 'top', label: 'بسطه مربّع', test: (p) => isSquare(p) },
  { id: 'bottom', label: 'مقامه مربّع', test: (p, q) => isSquare(q) },
  { id: 'ten', label: 'مقامه 1 أو 10 أو 100…', test: (p, q) => isPow10(q) },
];
const J1 = judge({
  slots: [
    { id: 'form', label: 'كيف تُكتب مساحتها؟', options: F1_FORM },
    { id: 'cond', label: 'وماذا في حدّيه؟', options: F1_COND },
  ],
  right: { form: 'irr', cond: 'both' },
  says: (rule, c, tile) => tile.cond[rule.cond].test(...termsOf(c.a, rule.form)),
});

/** The identity of a court of 🧩: its area AS GIVEN (20/45 and 4/9 are two courts the mirror may build). */
const k1Id = (c) => `k1|${c.a}`;
/** A court a rod of a number rides: drawn with that rod (his own, or the side). */
export const rodeCase = (a, q = rootOf(a)) => {
  const frac = String(a).includes('/') || String(q).includes('/');
  return caseOf(a, q, {
    of: K1,
    tag: '',
    id: `k1|${a}`,
    ...(frac ? { head: `ساحة ${plainNum(a)} · مقياس ${plainNum(write(q))}` } : {}),
  });
};
/**
 * A court NO mark of `step` rides: the world saw a band at `lo` and a jam at `hi`, two neighbouring marks — drawn with
 * the rod `lo` (the band he saw), its line naming the two marks.
 */
export const closedCase = (a, step = '0,01', lo = cutAt(a, decimalsOf(step)), hi = aboveAt(a, decimalsOf(step))) =>
  caseOf(a, lo, {
    of: K1,
    held: false,
    closed: true,
    step,
    lo: write(lo),
    hi: write(hi),
    tag: 'بلا علامة',
    id: `k1|${a}`,
    head: `ساحة ${plainNum(a)} · بين ${ltr(write(lo))} و ${ltr(write(hi))}`,
  });
/** The case the mirror builds for an area: ridden by its side, or closed between two marks of a hundredth. */
export const k1Case = (a) => (rootOf(a) != null ? rodeCase(a) : closedCase(a));

/** The courts of the two terraces before the hall, in the order he meets them (read from the story when needed). */
const F1_COURTS = lazy(() => ['big', 'small', 'sortA', 'sortB', 'sortC', 'sortD', 'sortOut'].map((id) => COURTS[id]));
/** What the story guarantees he did there: each court ridden, or closed between two marks of a tenth. */
const lived1 = (a) => (rootOf(a) != null ? rodeCase(a) : closedCase(a, '0,1'));

/** His evidence: one line per court of the two terraces — HIS ride (his rod), or the two marks he closed it between. */
function evidence1(rows) {
  const own = rows.filter((r) => r.of === K1);
  const seen = new Set(own.map(k1Id));
  const raw = rows.filter((r) => r.of == null && !r.mirror && r.s?.q != null && F1_COURTS().includes(r.a));
  const his = [];
  for (const a of [...new Set(raw.map((r) => r.a))]) {
    if (seen.has(`k1|${a}`)) continue;
    const on = raw.filter((r) => r.a === a);
    const rode = on.find((r) => outcome(r.s, a).kind === 'ride');
    // a court is closed by a band and a jam on two NEIGHBOURING marks of a tenth; a log that let one of them go keeps
    // what the story guarantees instead (`lived1`)
    const f = rode ? null : framing(on, a);
    if (rode) his.push(rodeCase(a, rode.s.q));
    else if (f && compare(f.gap, '0,1') <= 0) his.push(closedCase(a, '0,1', f.lo, f.hi));
    else continue;
    seen.add(`k1|${a}`);
  }
  const lived = F1_COURTS()
    .filter((a) => !seen.has(`k1|${a}`))
    .map(lived1);
  const mine = own.filter((c) => !c.mirror);
  return [...mine, ...his, ...lived.map((c) => ({ ...c, mirror: false })), ...own.filter((c) => c.mirror)];
}

/** The right rule's hard cases: a REDUCIBLE fraction whose terms are not squares but whose reduced ones are; and a fraction whose numerator is a square, its reduced terms not. */
export const F1_HARD = lazy(() => [rodeCase('32/98'), closedCase('9/12')]);
/** Courts the mirror may build to break a rule that survived his own courts — fractions above all. */
const F1_POOL = lazy(() => [...F1_HARD(), ...['11/36', '75/147', '2,42', '27/192', '13,3', '28,9'].map(k1Case)]);

const k1Fact = (c) =>
  c.closed
    ? `لا علامة من $${tex(c.step)}$ تركبها: منصّة $${tex(c.lo)}$ تترك شريطًا، ومنصّة $${tex(c.hi)}$ تعلق.`
    : 'تركب المنصّة المصعد: غطّت الساحة كلّها.';
const fracTex = (p, q) => `\\dfrac{${p}}{${q}}`;
/** His rule's reading of an area, in words: the fraction it writes, and what its terms are. */
function k1Reading(rule, c) {
  const [p, q] = termsOf(c.a, rule.form);
  const given = texGiven(c.a);
  const f = fracTex(p, q);
  const writing = given === f ? given : `${given} = ${f}`;
  const sq = (v) => (isSquare(v) ? 'مربّع' : 'ليس مربّعًا');
  const cond = {
    both: `البسط ${p} ${sq(p)}، والمقام ${q} ${sq(q)}`,
    top: `البسط ${p} ${sq(p)}`,
    bottom: `المقام ${q} ${sq(q)}`,
    ten: `المقام ${q} ${isPow10(q) ? 'من الأعداد 1 و 10 و 100…' : 'ليس 1 ولا 10 ولا 100…'}`,
  }[rule.cond];
  return `$${writing}$ — ${cond}`;
}

const forge1 = {
  key: K1,
  ...J1,
  ruleText: (rule) => {
    const cond = J1.tile.cond[rule.cond].label;
    return `تركب الساحةَ منصّةُ مقياسٍ طولُه عدد عندما تُكتب مساحتها ${J1.tile.form[rule.form].label} ${cond}${cond.endsWith('…') ? '' : '.'}`;
  },
  explain(rule, c) {
    const yes = J1.says(rule, c);
    return `قاعدتك: ${k1Reading(rule, c)}؛ فهي تقول إنّ منصّة مقياسٍ طوله عدد ${rides(yes)} هذه الساحة.`;
  },
  caseId: k1Id,
  evidence: evidence1,
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J1, caseId: k1Id, pool: F1_POOL, hard: F1_HARD() })(rule, rows),
  // never a choice between two written rules: two courts built in the mirror, one ridden, one closed
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [closedCase('3,3'), rodeCase('0,0361')] };
    if (k === 2) return { kind: 'experiment', cases: [rodeCase('50/98'), closedCase('50/93')] };
    return { kind: 'experiment', cases: [rodeCase('8/98'), closedCase('8/99')] };
  },
  use: {
    verdict: true,
    /** Three courts he writes the side of — a decimal, a fraction, a reducible fraction — and a fourth he judges. */
    make: (rand = Math.random) => pick(rand, USE1),
    lines: (c) => [
      line([slot('i', 'الوحدات', 1), ',', slot('d', 'الجزء العشري', 2), ':', `ضلع الساحة ${c.dec}`]),
      line(['ضلع الساحة', givenFraction(...c.frac), ':', fractionBox('n1', 'd1', { w: 2 })], 'rtl'),
      line(['ضلع الساحة', givenFraction(...c.red), ':', fractionBox('n2', 'd2', { w: 2 })], 'rtl'),
    ],
    check(c, v, verdict) {
      const side = (x, area) => (x == null ? 'zero' : outcome({ q: write(x) }, area).kind);
      const dec = side(typedDecimal(v.i, v.d), c.dec);
      if (dec !== 'ride') return dec === 'jam' ? 'decJam' : 'decBand';
      for (const [k, terms] of [
        ['1', c.frac],
        ['2', c.red],
      ]) {
        const f = side(typedFrac(v[`n${k}`], v[`d${k}`]), `${terms[0]}/${terms[1]}`);
        if (f === 'zero') return 'zero';
        if (f !== 'ride') return `f${k}${f}`;
      }
      return verdict === (rootOf(c.fourth) != null) ? 'ok' : 'fourth';
    },
  },
  text: {
    ...COURT_TEXT,
    title: 'مرآة القاعة',
    log: 'ساحاتك قبل القاعة',
    fact: k1Fact,
    // the product of a rod that rides is a fact (2/3 × 2/3 = 4/9 = 20/45); a closed court says its two marks instead
    // ('' = no equation: the mirror writes none, kit/RuleForge.jsx › `eq &&`)
    eq: (c) => (c.closed ? '' : COURT_TEXT.eq(c)),
    frame: 'تركب الساحةَ منصّةُ مقياسٍ طولُه عدد، عندما تُكتب مساحتها:',
    buildLead:
      'اختر بطاقة من كلّ عمود. المرآة ستجرّب قاعدتك على كلّ ساحة جرّبتها في السطحين قبل القاعة: ما ركبتَه، وما أُغلق.',
    testing: 'المرآة تمرّ على ساحاتك واحدةً واحدة…',
    yes: 'تركبها',
    no: 'لا تركبها',
    says: (yes) => `قاعدتك: ${yes ? 'تركبها' : 'لا تركبها'}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ منصّة مقياسٍ طوله عدد ${rides(m.says)} الساحة ${plainNum(m.a)} — لكنّك رأيت ${
        m.held
          ? `منصّة المقياس ${plainNum(write(m.s.q))} تركبها`
          : `أن لا علامة تركبها: بين ${ltr(m.lo)} و ${ltr(m.hi)} شريط ثمّ تعلق`
      }.`,
    agreed: 'قاعدتك توافق كلّ ساحاتك. الآن المرآة تتحدّاها بساحات لم ترها، مساحاتها كسور.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: ساحة مساحتها ${tilesM(c.a)}. هل تركبها منصّة مقياسٍ طولُه عدد؟ ماذا تقول قاعدتك؟`,
    survived: 'صمدت قاعدتك: الساحة فعلت ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'تركبها' : 'لا تركبها'} »، و${yes ? 'لم تركبها أيّ علامة' : 'ركبتها المنصّة'}.`,
    wordsHint: 'مثال: تركب الساحةَ منصّةٌ عندما…',
    experiment: 'انظر جيّدًا: ساحتان تبنيهما المرآة. أيّهما ركبتها منصّة؟',
    tryKey: (c) =>
      `اكتب ضلع كلّ ساحة: عددًا عشريًّا في السطر الأوّل، وكسرًا في السطرين الآخرين. ثمّ ساحة رابعة مساحتها ${tilesM(c.fourth)}: هل تركبها منصّة؟`,
    use: {
      decBand: 'السطر الأوّل: منصّة هذا المقياس تترك شريطًا في الساحة. جرّب مقياسًا أطول.',
      decJam: 'السطر الأوّل: منصّة هذا المقياس تعلق في الساحة. جرّب مقياسًا أقصر.',
      f1band: 'السطر الثاني: منصّة هذا الكسر تترك شريطًا. جرّب كسرًا أكبر.',
      f1jam: 'السطر الثاني: منصّة هذا الكسر تعلق. جرّب كسرًا أصغر.',
      f2band: 'السطر الثالث: منصّة هذا الكسر تترك شريطًا. اختزل مساحة الساحة أوّلًا.',
      f2jam: 'السطر الثالث: منصّة هذا الكسر تعلق. اختزل مساحة الساحة أوّلًا.',
      zero: 'المقام لا يكون صفرًا.',
      fourth: 'الساحة الرابعة: طبّق قاعدتك على مساحتها مرّة أخرى.',
    },
    useOk: 'ثلاثة أضلاع كتبتَها بالضبط، وحكمتَ على الرابعة: مفتاحك يعمل!',
  },
};

/** The last step's courts (none named by the bank nor by a story — forges.test.js): their sides, and a fourth. */
export const USE1 = [
  { dec: '9,61', frac: [25, 64], red: [12, 147], fourth: '15/40' },
  { dec: '2,2801', frac: [16, 49], red: [75, 147], fourth: '8,5' },
  { dec: '0,2809', frac: [9, 64], red: [48, 75], fourth: '1/36' },
];

// ═════════════════════════ 2. ♾️ la-kasr-yarkab — a pursuit that never closes ═════════════════════════

/** « near enough »: the platform differs from the court by less than 0,01 tile. */
const NEAR = '0,01';
const gapOf = (c) => magnitude(minus(c.a, platform(c.s)));
const near = (c) => compare(gapOf(c), NEAR) < 0;
const F2_NUM = [
  { id: 'never', label: 'لا تركبها أبدًا، مهما قرب', says: () => false },
  { id: 'close', label: 'تركبها إن قرب كفاية', says: (c) => near(c) },
  { id: 'frac', label: 'تركبها إن قرب، إلّا العشريّ', says: (c) => !isDecimal(c.s.q) && near(c) },
];
const F2_CALC = [
  { id: 'near', label: 'عدد قريب منه، لا الضلع', says: () => false },
  { id: 'same', label: 'هو الضلع نفسه', says: () => true },
];
const F2_WALL = [
  { id: 'rides', label: 'تركب: الجدار ضلعها', says: () => true },
  { id: 'none', label: 'لا تركب: لا ضلع لها', says: () => false },
];
const J2 = judge({
  slots: [
    { id: 'num', label: 'منصّة مقياسٍ طوله كسر أو عدد عشريّ:', options: F2_NUM },
    { id: 'calc', label: 'وما تعرضه الحاسبة لضلعها:', options: F2_CALC },
    { id: 'wall', label: 'والمقياس المشدود على جدارها:', options: F2_WALL },
  ],
  right: { num: 'never', calc: 'near', wall: 'rides' },
  says: (rule, c, tile) =>
    isWall(c.s)
      ? tile.wall[rule.wall].says(c)
      : c.calc != null
        ? tile.calc[rule.calc].says(c)
        : tile.num[rule.num].says(c),
});

/** A rod of a number on a court of ♾️ (`frac` keeps the fraction as the chase showed it: 3/2, drawn 1,5). */
export function numCase(a, q, frac = null) {
  const shown = frac ?? write(q);
  return caseOf(a, q, {
    of: K2,
    tag: '',
    ...(frac ? { frac } : {}),
    // a fraction is never written with a slash: its line names it in words (« مقياس 17 على 12 »)
    ...(shown.includes('/') ? { head: `ساحة ${plainNum(a)} · مقياس ${plainNum(shown)}` } : {}),
  });
}
/** What the calculator shows for the side, as a rod. */
export const calcCase = (a, shows = calculator(a)) =>
  caseOf(a, shows, { of: K2, calc: write(shows), tag: 'الحاسبة', id: `calc|${write(a)}|${write(shows)}` });
/** The rod clamped on the court's wall, corner to corner. */
export const wallCase = (a) => caseOf(a, 'wall', { of: K2, tag: 'الجدار' });

/** The right rule's hard cases: a NEW court and its near fraction (one small tile off), and its wall. */
export const F2_HARD = [numCase('82', '163/18'), wallCase('82')];
/** The courts the mirror builds: the calculator and the wall of the court of two first (he has just stood there). */
const F2_POOL = lazy(() => [
  calcCase(COURTS.two),
  wallCase(COURTS.two),
  numCase(COURTS.two, '1393/985'),
  numCase(COURTS.two, '1,414'),
  ...F2_HARD,
  calcCase('82'),
  calcCase('0,8'),
  wallCase('0,8'),
  numCase('0,8', '17/19'),
]);
/** The rod in a MathText sentence: the fraction he saw (\\dfrac{3}{2}), the calculator's digits, or a number. */
const rodTexOf = (c) => (c.frac ? texGiven(c.frac) : tex(c.s.q));
/** The rod in a plain sentence. */
const rodWords = (c) =>
  isWall(c.s)
    ? 'المقياس المشدود على الجدار'
    : c.calc != null
      ? `مقياس الحاسبة ${ltr(c.s.q)}`
      : `المقياس ${plainNum(c.frac ?? write(c.s.q))}`;
/** The product of a rod by itself beside the court — when it is short enough to read. */
const shortEq = (c) => {
  if (isWall(c.s)) return '';
  return write(platform(c.s)).length <= 10 ? COURT_TEXT.eq(c) : '';
};

const forge2 = {
  key: K2,
  ...J2,
  chip: (s, o) => (s.id === 'calc' ? `الحاسبة: ${o.label}` : s.id === 'wall' ? `الجدار: ${o.label}` : o.label),
  ruleText: (rule) =>
    `على ساحة لا تُكتب مساحتها مربّعَ كسر: منصّة كسرٍ ${J2.tile.num[rule.num].label}؛ الحاسبة: ${J2.tile.calc[rule.calc].label}؛ الجدار: ${J2.tile.wall[rule.wall].label}.`,
  explain(rule, c) {
    const yes = J2.says(rule, c);
    if (isWall(c.s))
      return rule.wall === 'rides'
        ? 'قاعدتك: المقياس المشدود على الجدار من الركن إلى الركن هو ضلع الساحة، فمنصّته تركب.'
        : 'قاعدتك: لا ضلع لهذه الساحة، فلا تركب منصّة المقياس المشدود على جدارها.';
    const q = rodTexOf(c);
    if (c.calc != null)
      return rule.calc === 'same'
        ? `قاعدتك: ما تعرضه الحاسبة، $${q}$، هو الضلع نفسه، فمنصّته تركب.`
        : `قاعدتك: ما تعرضه الحاسبة قريب من الضلع وليس هو، فمنصّة $${q}$ لا تركب.`;
    if (rule.num === 'never') return `قاعدتك: لا تركب هذه الساحةَ منصّةُ أيّ كسر، فمنصّة $${q}$ لا تركب.`;
    const gap = `تفرق منصّته عن الساحة بـ $${tex(gapOf(c))}$ بلاطة، ${near(c) ? 'أقلّ' : 'ليس أقلّ'} من $${tex(NEAR)}$`;
    if (rule.num === 'close') return `قاعدتك: ${gap} — فمنصّة $${q}$ ${rides(yes)}.`;
    if (isDecimal(c.s.q)) return `قاعدتك: $${q}${c.frac ? ` = ${tex(c.s.q)}$` : '$'} عدد عشريّ، فمنصّته لا تركب.`;
    return `قاعدتك: $${q}$ كسر لا يُكتب عددًا عشريًّا؛ ${gap} — فمنصّته ${rides(yes)}.`;
  },
  caseId: courtId,
  // his evidence is what he did in the experiment (`fromInquiry`) and what the mirror showed; the world's log is not
  // his evidence here (the experiment replaces it) — a row of it carries no `of`
  evidence: (rows) => {
    const own = rows.filter((r) => r.of === K2);
    return own.filter((c, i) => own.findIndex((x) => courtId(x) === courtId(c)) === i);
  },
  inquiry: CHASE_INQUIRY,
  fromInquiry: (result) => ({
    rows: result.rows
      .map((r) => numCase(r.a, r.s.q, r.frac))
      .filter((c, i, all) => all.findIndex((x) => courtId(x) === courtId(c)) === i),
  }),
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J2, caseId: courtId, pool: F2_POOL, hard: F2_HARD })(rule, rows),
  // never a choice between two written rules: two rods on one court, built in the mirror — one rides, one does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [numCase(COURTS.two, '1393/985'), wallCase(COURTS.two)] };
    if (k === 2) return { kind: 'experiment', cases: [calcCase('0,8'), wallCase('0,8')] };
    return { kind: 'experiment', cases: [calcCase('82'), wallCase('82')] };
  },
  use: {
    verdict: true,
    /** A court, its calculator's ten digits, and the display cut to 0,01 he squares by hand. */
    make(rand = Math.random) {
      const a = pick(rand, USE2);
      const shows = calculator(a);
      const t = cutDigits(shows, 2);
      return { a, shows, t, sq: write(square(t)) };
    },
    lines: (c) => [line([`${c.t} × ${c.t}`, '=', slot('i', 'الوحدات', 2), ',', slot('d', 'الجزء العشري', 4)])],
    check(c, v, verdict) {
      const x = typedDecimal(v.i, v.d);
      return firstWrong([
        ['square', x != null && compare(x, c.sq) === 0],
        ['verdict', verdict === (rootOf(c.a) != null)],
      ]);
    },
  },
  text: {
    ...COURT_TEXT,
    title: 'مرآة الجدار',
    log: 'مقاييسك على ساحة البلاطتين',
    fact: worldFact,
    eq: shortEq,
    frame: 'على ساحة لا تُكتب مساحتها مربّعَ كسر، كساحة البلاطتين:',
    buildLead: 'اختر بطاقة من كلّ عمود. المرآة ستجرّب قاعدتك على الكسور التي جرّبتها على ساحة البلاطتين، ثمّ تتحدّاها.',
    testing: 'المرآة تمرّ على مقاييسك واحدًا واحدًا…',
    yes: 'تركب',
    no: 'لا تركب',
    refuted: (m) =>
      `قاعدتك تقول إنّ منصّة ${rodWords(m)} ${rides(m.says)} الساحة ${plainNum(m.a)} — لكنّك رأيتها ${rides(m.held)}.`,
    agreed: 'قاعدتك توافق كلّ كسورك. الآن المرآة تتحدّاها بالحاسبة، وبالجدار، وبساحات أخرى.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: ${
        c.calc != null
          ? `ساحة مساحتها ${tilesM(c.a)}، تعرض الحاسبة لضلعها $${tex(c.s.q)}$. أتركب منصّة مقياسٍ بهذا الطول؟`
          : isWall(c.s)
            ? `ساحة مساحتها ${tilesM(c.a)}، والمقياس مشدود على جدارها من ركن إلى ركن. أتركب منصّته؟`
            : `ساحة مساحتها ${tilesM(c.a)}، ومقياس طوله $${rodTexOf(c)}$. أتركب منصّته؟`
      } ماذا تقول قاعدتك؟`,
    survived: 'صمدت قاعدتك: المنصّة فعلت ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${rides(yes)} »، والمنصّة ${yes ? 'لم تركب' : 'ركبت'}.`,
    wordsHint: 'مثال: على ساحة كهذه…',
    experiment: 'انظر جيّدًا: مقياسان تبنيهما المرآة على ساحة واحدة. ماذا فعلت كلّ منصّة؟',
    tryKey: (c) =>
      `ساحة مساحتها ${tilesM(c.a)}، تعرض الحاسبة لضلعها $${tex(c.shows)}$. احسب بلا حاسبة $${tex(c.t)} \\times ${tex(c.t)}$، ثمّ قل: أتركبها منصّة كسرٍ ما؟`,
    use: {
      square: 'الجداء: اضرب العدد في نفسه — في الجداء أربع منازل بعد الفاصلة.',
      verdict: 'اكتب مساحة الساحة كسرًا غير قابل للاختزال، وانظر إلى بسطه ومقامه.',
    },
    useOk: 'لم تكتفِ بأرقام الحاسبة: قرأتَ الساحة نفسها. مفتاحك يعمل!',
  },
};

/** The last step's courts: two no fraction rides, two a fraction rides although the calculator shows many digits. */
export const USE2 = ['8,5', '25/81', '13,5', '1/36'];

// ═════════════════════════ 3. 🎯 al-mudawwar — which of two neighbouring marks is nearer ═════════════════════════

/**
 * A CLAIM about the court `a` at the precision 10^-k: « of the two neighbouring marks the wall ends between, `claim`
 * ('lo' | 'hi') is the nearer ». Drawn as the platform of the MIDDLE mark — the rod he lowered on « سطح العلامات » —
 * whose band or jam is the fact that answers it. `held` is the truth of the claim.
 */
export function k3Case(a, k, claim) {
  const [lo, hi, mid] = [cutAt(a, k), aboveAt(a, k), middleAt(a, k)];
  const truth = nearestAt(a, k) === lo ? 'lo' : 'hi';
  const M = claim === 'lo' ? lo : hi;
  return caseOf(a, mid, {
    of: K3,
    k,
    lo,
    hi,
    mid,
    claim,
    M,
    held: claim === truth,
    tag: 'الوسطى',
    id: `k3|${write(a)}|${k}|${claim}`,
    head: `ساحة ${ltr(write(a))} · ${ltr(M)} الأقرب؟`,
  });
}
const k3Id = (c) => c.id;
const lastDigit = (a) => Number(write(a).replace(',', '').slice(-1));
/** What leaves the lower mark's band and the upper's overhang, in tiles. */
const bandOf = (c) => minus(c.a, square(c.lo));
const overOf = (c) => minus(square(c.hi), c.a);
const F3_PICK = [
  { id: 'hi', label: 'العلامة الكبرى' },
  { id: 'lo', label: 'العلامة الصغرى' },
];
const F3_WHEN = [
  { id: 'mid', label: 'تركت منصّة الوسطى شريطًا', test: (c) => compare(square(c.mid), c.a) < 0 },
  { id: 'gaps', label: 'شريط الصغرى أقلّ من بروز الكبرى', test: (c) => compare(bandOf(c), overOf(c)) < 0 },
  { id: 'digit', label: 'آخر رقم في المساحة 5 فأكثر', test: (c) => lastDigit(c.a) >= 5 },
  { id: 'always', label: 'في كلّ ساحة', test: () => true },
];
/** A condition as the rule says it: « إذا … », or « في كلّ ساحة ». */
const WHEN_WORDS = {
  mid: 'إذا تركت منصّة الوسطى شريطًا',
  gaps: 'إذا كان شريط الصغرى أقلّ من بروز الكبرى',
  digit: 'إذا كان آخر رقم في المساحة 5 فأكثر',
  always: 'في كلّ ساحة',
};
const whenWords = (id) => WHEN_WORDS[id];
const other = (m) => (m === 'hi' ? 'lo' : 'hi');
/** The mark a rule picks for a case. */
const picked = (rule, c) => (F3_WHEN.find((w) => w.id === rule.when).test(c) ? rule.pick : other(rule.pick));
const J3 = judge({
  slots: [
    { id: 'pick', label: 'أيّ العلامتين؟', options: F3_PICK },
    { id: 'when', label: 'متى؟', options: F3_WHEN },
  ],
  right: { pick: 'hi', when: 'mid' },
  says: (rule, c) => picked(rule, c) === c.claim,
});

/** The two courts of « سطح العلامات » and the precision of their middle marks (read from the story when needed). */
const F3_COURTS = lazy(() => [
  [COURTS.marksA, 1],
  [COURTS.marksB, 2],
]);
/**
 * His evidence: on each court of « سطح العلامات », the TRUE claim — the nearer mark, as the middle platform he lowered
 * said. The terrace's mirror opens only once both are closed (`story.featureOpen`), so both are always there.
 */
function evidence3(rows) {
  const own = rows.filter((r) => r.of === K3);
  const seen = new Set(own.map(k3Id));
  const mine = own.filter((c) => !c.mirror);
  const add = [];
  for (const [a, k] of F3_COURTS()) {
    const truth = nearestAt(a, k) === cutAt(a, k) ? 'lo' : 'hi';
    const c = k3Case(a, k, truth);
    if (!seen.has(k3Id(c))) add.push({ ...c, mirror: false });
  }
  return [...mine, ...add, ...own.filter((c) => c.mirror)];
}

/** The right rule's hard cases: a court where the middle leaves a hair of a band (the « band against overhang » rule breaks), and one where it jams while the area ends in 5. */
export const F3_HARD = [k3Case('18,924', 1, 'hi'), k3Case('55', 1, 'hi')];
const F3_POOL = lazy(() => [
  ...F3_HARD,
  ...[
    ['18,924', 1],
    ['55', 1],
    ['21', 1],
    ['37', 2],
    ['89', 1],
  ].flatMap(([a, k]) => [k3Case(a, k, 'lo'), k3Case(a, k, 'hi')]),
]);
const markWord = (m) => (m === 'hi' ? 'الكبرى' : 'الصغرى');
const middleFact = (c) => {
  const band = compare(square(c.mid), c.a) < 0;
  return `منصّة الوسطى $${tex(c.mid)}$ ${band ? 'تترك شريطًا' : 'تعلق'}: ينتهي الجدار بين $${tex(band ? c.mid : c.lo)}$ و $${tex(band ? c.hi : c.mid)}$.`;
};

const forge3 = {
  key: K3,
  ...J3,
  chip: (s, o) => (s.id === 'when' ? whenWords(o.id) : o.label),
  ruleText: (rule) =>
    rule.when === 'always'
      ? `بين علامتين متجاورتين ينتهي الجدار: أقربهما إليه ${J3.tile.pick[rule.pick].label} في كلّ ساحة.`
      : `بين علامتين متجاورتين ينتهي الجدار: أقربهما إليه ${J3.tile.pick[rule.pick].label} ${whenWords(rule.when)}، وإلّا فالأخرى.`,
  explain(rule, c) {
    const band = compare(square(c.mid), c.a) < 0;
    const cond = {
      mid: `منصّة الوسطى $${tex(c.mid)}$ ${band ? 'تترك شريطًا' : 'تعلق'}`,
      gaps: `شريط الصغرى $${tex(bandOf(c))}$ بلاطة، وبروز الكبرى $${tex(overOf(c))}$ بلاطة`,
      digit: `آخر رقم في المساحة $${lastDigit(c.a)}$`,
      always: 'في كلّ ساحة',
    }[rule.when];
    const m = picked(rule, c);
    return `قاعدتك: ${cond} — فالأقرب ${markWord(m)}، $${tex(m === 'hi' ? c.hi : c.lo)}$؛ وهي تقول « ${yn(m === c.claim)} » للعلامة $${tex(c.M)}$.`;
  },
  caseId: k3Id,
  evidence: evidence3,
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J3, caseId: k3Id, pool: F3_POOL, hard: F3_HARD })(rule, rows),
  // never a choice between two written rules: ONE court, the two claims — the mirror lowers the middle for both
  nudge(k) {
    const [a, p] = [
      ['21', 1],
      ['37', 2],
      ['89', 1],
    ][k - 1];
    return { kind: 'experiment', cases: [k3Case(a, p, 'lo'), k3Case(a, p, 'hi')] };
  },
  use: {
    /** A court, its calculator's ten digits, and a precision: the two marks the wall ends between, and the nearer. */
    make(rand = Math.random) {
      const [a, k] = pick(rand, USE3);
      return {
        a,
        k,
        step: write(`1/${10 ** k}`),
        shows: calculator(a),
        lo: cutAt(a, k),
        hi: aboveAt(a, k),
        near: nearestAt(a, k),
      };
    },
    lines: (c) =>
      [
        ['1', 'بالنقصان'],
        ['2', 'بالزيادة'],
        ['3', 'الأقرب'],
      ].map(([i, words]) => line([slot(`i${i}`, 'الوحدات', 1), ',', slot(`d${i}`, 'الجزء العشري', c.k), ':', words])),
    check(c, v) {
      const is = (i, x) => {
        const t = typedDecimal(v[`i${i}`], v[`d${i}`]);
        return t != null && compare(t, x) === 0;
      };
      return firstWrong([
        ['lo', is(1, c.lo)],
        ['hi', is(2, c.hi)],
        ['near', is(3, c.near)],
      ]);
    },
  },
  text: {
    ...COURT_TEXT,
    title: 'مرآة العلامات',
    log: 'جدارا سطح العلامات',
    fact: middleFact,
    frame: 'بين علامتين متجاورتين ينتهي الجدار. أقربهما إليه:',
    buildLead: 'اختر بطاقة من كلّ عمود. المرآة ستجرّب قاعدتك على الساحتين اللتين أغلقتهما على سطح العلامات.',
    testing: 'المرآة تمرّ على ساحاتك واحدةً واحدة…',
    yes: 'نعم',
    no: 'لا',
    says: (yes) => `قاعدتك: ${yn(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ ${ltr(m.M)} ${m.says ? 'هي' : 'ليست'} العلامة الأقرب إلى نهاية جدار الساحة ${ltr(write(m.a))} — لكنّ منصّة الوسطى ${ltr(m.mid)} ${
        compare(square(m.mid), m.a) < 0 ? 'تركت شريطًا' : 'علقت'
      }، فالأقرب ${ltr(m.held ? m.M : m.claim === 'hi' ? m.lo : m.hi)}.`,
    agreed: 'قاعدتك توافق الساحتين. الآن المرآة تتحدّاها بساحات أخرى.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: ساحة مساحتها ${tilesM(write(c.a))}، ينتهي جدارها بين العلامتين $${tex(c.lo)}$ و $${tex(c.hi)}$. هل $${tex(c.M)}$ هي الأقرب؟ ماذا تقول قاعدتك؟`,
    survived: 'صمدت قاعدتك: منصّة الوسطى قالت ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yn(yes)} »، ومنصّة الوسطى ${yes ? 'تضع نهاية الجدار أقرب إلى الأخرى' : 'تضع نهاية الجدار أقرب إلى هذه العلامة'}.`,
    wordsHint: 'مثال: بين علامتين، الأقرب…',
    experiment: 'انظر جيّدًا: ساحة واحدة، وعلامتان. المرآة تُنزل منصّة الوسطى.',
    tryKey: (c) =>
      `ساحة مساحتها ${tilesM(c.a)}، تعرض الحاسبة لضلعها $${tex(c.shows)}$. اكتب العلامتين من $${tex(c.step)}$ اللتين ينتهي الجدار بينهما، ثمّ أقربهما إليه.`,
    use: {
      lo: 'السطر الأوّل: أطول علامة لا تتجاوز ما تعرضه الحاسبة، بعدد المنازل المطلوب.',
      hi: 'السطر الثاني: العلامة التي تلي الأولى مباشرة.',
      near: 'السطر الثالث: فكّر في منصّة العلامة الوسطى بين العلامتين.',
    },
    useOk: 'ثلاث علامات من حاسبة واحدة: مفتاحك يعمل!',
  },
};

/** The last step's courts and precisions: the nearer mark is the lower one twice, the upper one twice. */
export const USE3 = [
  ['71', 1],
  ['57', 2],
  ['71', 2],
  ['34', 2],
];

/** The forges of the lesson, by the key each makes. */
export const FORGES = { [K1]: forge1, [K2]: forge2, [K3]: forge3 };
