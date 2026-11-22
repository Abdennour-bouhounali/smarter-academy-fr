/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The lesson is on « قصر الساحات », like lesson 1 of the unit: every question is a COURT (`court`) — the class proposes a
 * rod, the teacher taps its card, the board lowers the platform and the world answers: it rides, it leaves a band, it
 * jams. A rod may be a FRACTION (its card drawn with a real bar). Each key is PROVED there before its tablet names it
 * (the student's own wording, `world/tablets.js`):
 *   🧩  a court whose gate shows a fraction: the rod that rides is a fraction whose square is the area — never the side
 *       of the numerator alone; then a fraction NOT reduced, whose two terms are no squares, ridden all the same;
 *   ♾️  a court of whole tiles chased by better and better fractions, then by the calculator's ten digits: each one leaves
 *       a band or jams, never zero — the platform and the court counted in small pieces never agree;
 *   🎯  the middle mark between two neighbouring marks decides which one is nearer the wall: to a tenth the lower one,
 *       to a hundredth the upper one, on the same court.
 * The numbers are the board's own — none of the student's story, none of lesson 1's board, none of the exercise bank
 * (scripts/lesson-bank-numbers.mjs) — and `board.test.js` computes all of them. ONE NUMBER A LINE: a line of this file
 * never holds two of the hour's numbers (no comment writes one); every text is built from `BOARD`, every product is
 * computed (`rootCourts/logic.js`). Nothing before a naming says its key's name (tested). A `cue` is at most 70
 * characters.
 */
import { square, tex, times, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { tiles } from '../../../../../../common/gameworld/rootCourts/strings';
import { KEYS } from '../world/tablets';

const [K1, K2, K3] = KEYS;

/** The board's numbers, ONE a line; the courts and rods of each station are built from them below. */
export const BOARD = {
  /** 🧩 a court whose gate shows a fraction (its numerator a square, its denominator a square) */
  opening: {
    top: '529',
    bottom: '49',
    sideTop: '23',
    sideBottom: '7',
    whole: '3',
    next: '24',
  },
  /** 🧩 a fraction not reduced: neither term is a square, the fraction it reduces to is the square of a fraction */
  unreduced: {
    top: '722',
    bottom: '98',
    sideTop: '19',
    sideBottom: '7',
    below: '18',
    low: '2',
    whole: '3',
  },
  /** ♾️ a court of whole tiles chased by fractions nearer and nearer, then by the calculator */
  chase: {
    area: '14',
    t1: '11',
    b1: '3',
    dec: '3,75',
    t2: '101',
    b2: '27',
    t3: '116',
    b3: '31',
    calculator: '3,741657387',
  },
  /** 🎯 the same court for two middle marks: a tenth, then a hundredth */
  marks: {
    area: '69',
    low: '8',
    high: '9',
    lo: '8,3',
    hi: '8,4',
    mid: '8,35',
    hi2: '8,31',
    mid2: '8,305',
  },
  /** the oral questions of the namings: a decimal court ridden by a decimal; the mark between two whole marks */
  oral: {
    decimal: '13,69',
    half: '8,5',
  },
};
const { opening: O, unreduced: U, chase: C, marks: M } = BOARD;

/** p/q as a script writes a rod (« 23/7 ») and in LaTeX with its bar. */
const fr = (p, q) => `${p}/${q}`;
const F = (p, q) => `\\dfrac{${p}}{${q}}`;
/** A product of the board, computed: « a × a » written exactly. */
const sq = (x) => tex(write(square(x)));
const by = (a, b) => tex(write(times(a, b)));
/** The fraction a not-reduced area reduces to, its terms halved (both are even), computed. */
const half = (x) => write(times(x, '0,5'));
const MIDDLE = 'العلامة الوسطى';

export const SCRIPT = {
  title: 'الأعداد الناطقة والأعداد غير الناطقة',
  steps: [
    {
      id: 'opening',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'ساحة على بابها كسر',
      text: `في سطح جديد ساحة مربّعة، مساحتها مكتوبة كسرًا على بابها: $${F(O.top, O.bottom)}$ بلاطة.`,
      question: 'أيّ مقياس تركب منصّته المصعد؟ توقّعوا قبل أن ننزلها.',
      area: fr(O.top, O.bottom),
      rods: [fr(O.sideTop, O.bottom), O.whole, fr(O.sideTop, O.sideBottom), fr(O.next, O.sideBottom)],
      answer: [fr(O.sideTop, O.sideBottom)],
      after: `$${F(O.sideTop, O.sideBottom)} \\times ${F(O.sideTop, O.sideBottom)} = ${F(sq(O.sideTop), sq(O.sideBottom))}$: المنصّة تغطّي الساحة بالضبط. والمقياس $${F(O.sideTop, O.bottom)}$ أخذ ضلع البسط وحده: منصّته تترك شريطًا.`,
      cue: `البسط ${O.top} مربّع: هل يكفي أن نأخذ ضلعه وحده؟ ولماذا؟`,
    },
    {
      id: 'unreduced',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'كسر لم يُختزل',
      text: `ساحة أخرى مساحتها $${F(U.top, U.bottom)}$ بلاطة. لا البسط ${U.top} مربّع عدد طبيعيّ، ولا المقام ${U.bottom}.`,
      question: 'هل يركبها مقياس؟ أيّ مقياس؟',
      area: fr(U.top, U.bottom),
      rods: [U.low, fr(U.below, U.sideBottom), fr(U.sideTop, U.sideBottom), U.whole],
      answer: [fr(U.sideTop, U.sideBottom)],
      after: `$${F(U.top, U.bottom)} = ${F(half(U.top), half(U.bottom))}$ و $${F(U.sideTop, U.sideBottom)} \\times ${F(U.sideTop, U.sideBottom)} = ${F(sq(U.sideTop), sq(U.sideBottom))}$: المنصّة تغطّي الساحة بالضبط.`,
      cue: 'قبل أن ننزل المنصّات: هل نكتب هذا الكسر بحدّين أصغر؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: K1,
      recall: ['عددًا ناطقًا', 'مربّعان'],
      cue: `وساحة مساحتها ${BOARD.oral.decimal} بلاطة: هل يُكتب ضلعها؟ ما هو؟`,
    },
    {
      id: 'chase',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'كسور تقترب',
      text: `ساحة مساحتها ${tiles(C.area)}. نجرّب مقاييس طولها كسور، كلّ واحد أقرب إلى الجدار من الذي قبله، ثمّ ما تعرضه الحاسبة.`,
      question: 'أيّ مقياس تركب منصّته الساحة؟',
      area: C.area,
      rods: [fr(C.t1, C.b1), C.dec, fr(C.t2, C.b2), fr(C.t3, C.b3), { q: C.calculator, label: 'الحاسبة' }],
      answer: [],
      after: `$${C.t2} \\times ${C.t2} = ${sq(C.t2)}$ و $${C.area} \\times ${C.b2} \\times ${C.b2} = ${by(C.area, square(C.b2))}$؛ $${C.t3} \\times ${C.t3} = ${sq(C.t3)}$ و $${C.area} \\times ${C.b3} \\times ${C.b3} = ${by(C.area, square(C.b3))}$: كلّ مقياس ترك شريطًا أو علق.`,
      cue: 'كلّما اقترب الكسر صغر الفرق: هل يصير الفرق صفرًا يومًا؟',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: K2,
      recall: ['عدد غير ناطق', 'قيمة مقرّبة'],
      cue: `وضلع الساحة ${C.area}: ما الكتابة الوحيدة الصحيحة تمامًا لطوله؟`,
    },
    {
      id: 'tenth',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'العلامة الوسطى',
      text: `ساحة مساحتها ${tiles(M.area)}. علامتان طبيعيتان، ثمّ علامتا الأعشار $${tex(M.lo)}$ و $${tex(M.hi)}$، وبينهما العلامة الوسطى $${tex(M.mid)}$.`,
      question: `ضلع الساحة بين ${M.lo} و ${M.hi}: أيّ العلامتين أقرب إليه؟`,
      area: M.area,
      rods: [M.low, M.high, M.lo, M.hi, { q: M.mid, label: MIDDLE }],
      answer: [],
      after: `$${tex(M.lo)} < \\sqrt{${M.area}} < ${tex(M.hi)}$ و $${tex(M.mid)} \\times ${tex(M.mid)} = ${sq(M.mid)}$: منصّة العلامة الوسطى تعلق، فالجدار ينتهي قبلها — العلامة $${tex(M.lo)}$ أقرب.`,
      cue: 'لا نعرف أرقام الضلع: كيف تقول منصّة واحدة أيّ العلامتين أقرب؟',
    },
    {
      id: 'hundredth',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'أدقّ بعلامة',
      text: `علامتا الأجزاء من المئة حول الجدار نفسه: $${tex(M.lo)}$ و $${tex(M.hi2)}$، وبينهما العلامة الوسطى $${tex(M.mid2)}$.`,
      question: 'وهنا: أيّ العلامتين أقرب إلى ضلع الساحة؟',
      area: M.area,
      rods: [M.lo, M.hi2, { q: M.mid2, label: MIDDLE }],
      answer: [],
      after: `$${tex(M.lo)} < \\sqrt{${M.area}} < ${tex(M.hi2)}$ و $${tex(M.mid2)} \\times ${tex(M.mid2)} = ${sq(M.mid2)}$: منصّة العلامة الوسطى تترك شريطًا، فالجدار ينتهي بعدها — العلامة $${tex(M.hi2)}$ أقرب.`,
      cue: 'إلى جزء من عشرة كانت الصغرى أقرب، والآن الكبرى: هل تناقضنا؟',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: K3,
      recall: ['الأقرب', 'العلامة الوسطى'],
      cue: `ما مدوَّر ضلع الساحة ${M.area} إلى 1؟ أيّ علامة وسطى ننزل؟`,
    },
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: [K1, K2],
      cue: 'بعد النقل: من يعطي عددًا ناطقًا وعددًا غير ناطق من عنده؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاح 3',
      tablets: [K3],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الثلاثة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
