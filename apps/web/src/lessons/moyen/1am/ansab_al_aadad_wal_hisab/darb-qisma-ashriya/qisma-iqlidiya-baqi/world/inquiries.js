/**
 * THE FOUR INVESTIGATIONS of lesson « القسمة الإقليدية » — their numbers and their words (the screens and their logic
 * are the world's: `divisorIsles/InquiryDivision.jsx` and `inquiry.js`, `InquiryCycle.jsx` and `cycle.js`; the contract:
 * GAME_WORLD.md « استكشف », « spec shapes »). Four of the five keys are FOUND by an experiment of their own nature; the
 * fifth (`baqi-fi-masala`, ONE decision on a case) is the mirror alone:
 *
 *   GROUPS    the gap of island B (30 cells) and the plank 4 he has just fired: planks laid ONE AT A TIME, « will one
 *             more fit? » said before each; then an exact fit, a plank longer than the gap, a gap of more than ten planks.
 *   CYCLE     the gap of island C (45 cells) and its mould 8, on gaps that GROW one cell at a time: 44, 45, 46 … — how
 *             many cells will be left? said before each; the cells left climb, and fall where a plank goes in. Then the
 *             plank 4 from island A's gap; then two planks he has not laid: the most they will leave, said before.
 *   REBUILD   the gap of island D (52 = 6 × 8 + 4) under a cloth: 8 planks of 6 and a piece of 4 lie on it — how long is
 *             it? The first rounds show the box ALONE (`bare`): the template « b × q + r = □ » would spell the rule, so it
 *             appears only in the last round. One round has a piece as long as a plank: the world lays one more in it.
 *   ESTIMATE  the spyglass's old bridge (692 cells, planks of 27): too long to lay plank by plank — tens of planks on a
 *             ruler, then single planks; then three more gaps (a 0 among the planks, hundreds of planks).
 * No sentence here states a rule: each one says what the strip, the cloth or the ruler has just done.
 */
import { cellsOf, emptyCellsOf, emptyRestOf, fullPlanksOf, ofCells, planksOf, restOf } from './counted';
import { NUMBERS, divide } from './story';

const math = (s) => ['$', s.replaceAll('×', '\\times'), '$'].join('');
const after = (guess, fits) => (guess == null ? '' : guess === fits ? ' كما توقّعت!' : ' لم يكن هذا توقّعك.');

const { first: A0, count: C, groups: GR, rests: RS, scope: SC } = NUMBERS;
const D = divide(RS.a, RS.probe);

// ───────────────────────── GROUPS — « المجموعات الكاملة » ─────────────────────────
export const GROUPS_INQUIRY = {
  kind: 'groups',
  manual: 3,
  rounds: [
    // the gap he has just crossed on island B, with the plank 4 that left cells empty
    { a: C.a, b: C.probe },
    // an exact fit: the plank that does not fit hangs over 0 cells
    { a: 24, b: 6 },
    // a plank longer than the gap: no plank fits
    { a: 5, b: 8 },
    // a gap of more than ten planks: after three predictions the world may lay the rest
    { a: 75, b: 7 },
  ],
  text: {
    lead: (a, b) => `هوّة من ${ofCells(a)}، وألواح طولها ${b}. نضع الألواح واحدًا بعد الآخر، ولا نقطع أيّ لوح.`,
    goal: () => 'الهدف: أن تعرف كم لوحًا كاملًا تأخذ الهوّة، وكم خانة تبقى فارغة.',
    ask: ({ k, left }) =>
      left === 0
        ? `لم تبقَ أيّ خانة فارغة. هل يدخل اللوح رقم ${k}؟`
        : `على الهوّة ${emptyCellsOf(left)}. هل يدخل اللوح رقم ${k}؟`,
    yes: 'نعم، يدخل',
    no: 'لا، لا يدخل',
    finish: 'أكمل',
    laid: (f) => `دخل اللوح رقم ${f.k}، و${restOf(f.left)}.${after(f.guess, true)}`,
    over: (f) => `اللوح رقم ${f.k} يبرز خارج الهوّة: لا يدخل.${after(f.guess, false)}`,
    left: (n) => `${n} فارغة`,
    sayLead: () => 'كم لوحًا كاملًا على الهوّة؟ وكم خانة بقيت فارغة؟',
    sayPlanks: 'لوحًا كاملًا',
    sayLeft: 'خانة فارغة',
    check: 'تحقّق',
    sayMiss: (f) =>
      [
        f.said.q !== f.q && `كتبتَ ${f.said.q}: الألواح على الهوّة مرقّمة الآن، انظر إلى رقم آخرها.`,
        f.said.r !== f.r && `كتبتَ ${f.said.r}: انظر إلى الخانات بين آخر لوح ونهاية الهوّة.`,
      ]
        .filter(Boolean)
        .join(' '),
    sayOk: (f) => `على الهوّة ${fullPlanksOf(f.q)}، و${restOf(f.r)}.`,
    foundLine: ({ a, b, q, r }) =>
      `${cellsOf(a)}، ألواح ${b}: ${fullPlanksOf(q)}، و${restOf(r)} — ${math(`${a} - ${b} × ${q} = ${r}`)}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};

// ───────────────────────── CYCLE — « ما يبقى مع لوح » ─────────────────────────
/** « 4، 5، 6، 7، 0، 1، 2 » — the cells left, gap after gap. */
const lefts = (steps) => steps.map((st) => st.r).join('، ');

export const CYCLE_INQUIRY = {
  kind: 'cycle',
  rounds: [
    // the mould 8 of island C: its gap of 45 is the second gap of the round — he saw it leave 5 cells
    { b: GR.probe, from: GR.a - 1, count: 7 },
    // a short plank on island A's gap: 28 is filled, then one cell at a time
    { b: 4, from: A0.a, count: 6 },
  ],
  // two planks he has not laid cell by cell — the second too long to count on the fingers
  probes: [
    { b: 7, from: 21 },
    { b: 12, from: 24 },
  ],
  text: {
    lead: (b, from, count) =>
      `لوح واحد طوله ${b}، وهوّة تكبر خانة بعد خانة: من ${from} إلى ${from + count - 1}. بعد كلّ خانة نضع كلّ الألواح التي تدخل.`,
    goal: () => 'الهدف: أن تعرف، قبل وضع الألواح، كم خانة يمكن أن يتركها هذا اللوح فارغة.',
    start: (f) => `على ${cellsOf(f.a)} دخل ${fullPlanksOf(f.q)}، و${restOf(f.r)}.`,
    ask: ({ a }) => `نضيف خانة: تصير الهوّة ${cellsOf(a)}. كم خانة ستبقى فارغة بعد وضع الألواح؟`,
    grew: (f) =>
      `${
        f.wraps
          ? `صارت الخانات الفارغة ${f.b}، فدخل فيها لوح آخر: لم تبقَ أيّ خانة.`
          : `الهوّة ${cellsOf(f.a)}: ${emptyRestOf(f.r)}.`
      }${f.said == null ? '' : f.said === f.r ? ' كما قلتَ!' : ` قلتَ ${f.said}.`}`,
    left: (n) => `${n} فارغة`,
    foundLine: (r) =>
      `لوح ${r.b}، هوّات من ${r.steps[0].a} إلى ${r.steps.at(-1).a} — الخانات الفارغة: ${lefts(r.steps)}`,
    next: 'لوح آخر',
    toProbe: 'لوح لم أضعه بعد',
    done: 'أكتب قاعدتي',
    probeLead: (b, start) =>
      `لوح جديد طوله ${b}، لم تضعه بعد. الهوّة ستكبر خانة بعد خانة، ابتداءً من ${start}. قل قبل أن تكبر:`,
    maxAsk: () => 'ما أكثر ما سيبقى فارغًا من الخانات؟',
    maxUnit: 'خانة',
    sameAsk: ({ b }) => `وهل ستبقى ${emptyCellsOf(b)} في إحدى المرّات؟`,
    yes: 'نعم، ستبقى',
    no: 'لا، لن تبقى',
    grow: 'كبّر الهوّة',
    probeSeen: (p) =>
      `أكثر ما بقي فارغًا: ${cellsOf(p.max)}. وعندما صارت الخانات الفارغة ${p.b} دخل فيها لوح آخر.${
        p.said.max === p.max && p.said.same === false
          ? ' كما قلتَ!'
          : ` قلتَ: ${p.said.max}، و«${p.said.same ? 'ستبقى' : 'لن تبقى'}».`
      }`,
    probeLine: (p) => `لوح ${p.b} — الخانات الفارغة: من 0 إلى ${p.max}، ثمّ 0 من جديد`,
  },
};

// ───────────────────────── REBUILD — « مساواة القسمة » ─────────────────────────
const lying = ({ b, q, r }) =>
  `${q === 0 ? `لا لوح طوله ${b}` : q === 1 ? `لوح واحد طوله ${b}` : q === 2 ? `لوحان طولهما ${b}` : `${planksOf(q)} طولها ${b}`}${r ? `، وقطعة من ${ofCells(r)}` : ''}`;

export const REBUILD_INQUIRY = {
  kind: 'rebuild',
  rounds: [
    // the gap of island D he has just crossed: 52 = 6 × 8 + 4 — the box alone
    { b: RS.probe, q: D.q, r: D.r, bare: true },
    { b: 7, q: 5, r: 3, bare: true },
    // a piece longer than a plank: after the lift the world lays one more plank in it — that piece was not left over
    { b: 9, q: 4, r: 11, bare: true },
    // the last round only: the template
    { b: 11, q: 8, r: 5 },
  ],
  text: {
    lead: (round) => `على الهوّة ${lying(round)}، والهوّة كلّها تحت قماش.`,
    goal: () => 'الهدف: أن تعرف طول الهوّة قبل أن يُرفع القماش.',
    label: (round) => lying(round),
    ask: () => 'كم خانة طول الهوّة تحت القماش؟',
    lift: 'ارفع القماش',
    seen: (f) => `تحت القماش هوّة من ${ofCells(f.a)}.${f.said === f.a ? ' كما قلتَ!' : ` قلتَ ${f.said}.`}`,
    more: (f) =>
      `في القطعة ${f.r} دخل ${f.more === 1 ? `لوح آخر طوله ${f.b}` : f.more === 2 ? `لوحان آخران طولهما ${f.b}` : `${planksOf(f.more)} أخرى طولها ${f.b}`}، ثمّ ${restOf(f.r2)}. والهوّة ${cellsOf(f.a)}.`,
    foundLine: (f) => `${lying(f)}: الهوّة ${cellsOf(f.a)}${f.said === f.a ? '' : ` (قلتَ ${f.said})`}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};

// ───────────────────────── ESTIMATE — « تقدير الحاصل » ─────────────────────────
/** What a mark of the ruler counts: single planks, tens of planks, hundreds of planks. */
const BY = ['لوحًا لوحًا', 'بعشرات الألواح', 'بمئات الألواح'];
/** « وُضع لوح واحد », « وُضع لوحان », « وُضع 20 لوحًا », « وُضع 100 لوح » — the verb comes first: it stays singular. */
const laidPlanks = (n) => `وُضع ${planksOf(n)}`;

export const ESTIMATE_INQUIRY = {
  kind: 'estimate',
  rounds: [
    // the old bridge the spyglass of island G shows
    { a: SC.a, b: SC.plank },
    { a: 940, b: 38 },
    // a 0 among the single planks: the step is there, nothing is laid
    { a: 2100, b: 52 },
    // hundreds of planks first
    { a: 3172, b: 26 },
  ],
  text: {
    lead: (a, b) =>
      a === SC.a
        ? `المنظار يُريك جسرًا قديمًا: هوّة من ${ofCells(a)}، وألواح طولها ${b}. وضعُ الألواح واحدًا واحدًا يطول كثيرًا.`
        : `هوّة طويلة من ${ofCells(a)}، وألواح طولها ${b}. وضعُ الألواح واحدًا واحدًا يطول كثيرًا.`,
    goal: () => 'الهدف: أن تعرف كم لوحًا كاملًا تأخذ الهوّة، دون أن تضعها واحدًا واحدًا.',
    ask: ({ place, from }) => `بقيت ${cellsOf(from)}. المسطرة تعدّ ${BY[Math.min(place, 2)]}: اضغط عددًا من الألواح.`,
    left: (n) => `${n} باقية`,
    passes: (m) => `${math(`${m.b} × ${m.count} = ${m.value}`)}: هذه الألواح أطول من ${ofCells(m.from)}.`,
    short: (m) =>
      `${math(`${m.b} × ${m.count} = ${m.value}`)}، و ${math(`${m.b} × ${m.count + 10 ** m.place} = ${m.next}`)} يدخل أيضًا في ${ofCells(m.from)}.`,
    laid: (m) =>
      m.count === 0
        ? `لم يدخل شيء في هذه الخطوة: ${math(`${m.from} < ${m.unit}`)}.`
        : `${laidPlanks(m.count)}: ${math(`${m.from} - ${m.b} × ${m.count} = ${m.left}`)}.`,
    sum: ({ a, b, q, r }) => `الهوّة ${a} أخذت ${planksOf(q, { acc: true })} طولها ${b}، و${restOf(r)}.`,
    foundLine: ({ a, b, q, r }) => `${cellsOf(a)}، ألواح ${b}: ${planksOf(q)}، و${restOf(r)}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};
