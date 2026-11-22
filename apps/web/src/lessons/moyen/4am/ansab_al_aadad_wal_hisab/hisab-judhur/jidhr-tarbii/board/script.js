/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The lesson is on « قصر الساحات »: every question is a COURT (`court`, the world's own drawing) — the class proposes a
 * rod, the teacher taps its card, the board lowers the platform and the world answers: it rides, it leaves a band, it
 * jams. Each key is PROVED there before its tablet names it (the student's own wording, `world/tablets.js`):
 *   🔑  a court of 324 tiles, then one of 17,64: the rod that rides is the number whose square is the area — never half the
 *       area, never a quarter of it;
 *   ✍️  a court of 53: no rod of tenths, then of hundredths rides it; the calculator's ten digits leave a band no eye sees;
 *       the rod taken from the wall itself rides — written √53;
 *   🔁  the rod √61 rides exactly the court of 61; a court built on 3,4 is ridden by 3,4.
 * The numbers are the board's own — none of the student's story (its courts, its crates, its calculator), none of the
 * course of gates, none of the exercise bank (scripts/lesson-bank-numbers.mjs) — and `board.test.js` computes all of them.
 * Nothing before the naming of 🔑 says « الجذر التربيعي » or shows the sign √ (tested). A `cue` is at most 70 characters.
 */
import { tiles } from '../../../../../../common/gameworld/rootCourts/strings';
import { KEYS } from '../world/tablets';

const [K1, K2, K3] = KEYS;

/** The board's courts and rods, in the order of the hour. */
export const BOARD = {
  /** 🔑 a court of whole tiles, its side a whole number; the cards: two neighbours, the side, a quarter and a half of the area */
  opening: { area: '324', rods: ['17', '18', '19', '81', '162'] },
  /** 🔑 a court that is not a whole number of tiles */
  decimal: { area: '17,64', rods: ['4', '4,1', '4,2', '4,3', '8,82'] },
  /** ✍️ a court no rod of tenths rides */
  between: { area: '53', rods: ['7', '8', '7,2', '7,3'] },
  /** ✍️ the same court: hundredths, the calculator's ten digits (computed in the test), the wall */
  calc: { area: '53', rods: ['7,28', '7,29'], calculator: '7,280109889' },
  /** 🔁 the wall of a court of 61, carried to other courts */
  build: { root: '61', areas: ['30,5', '61', '122', '3721'] },
  /** 🔁 a court built on a rod of 3,4: its side */
  take: { rod: '3,4', area: '11,56', rods: ['1,7', '3,4', '5,78', '11,56'] },
};
const { opening: O, decimal: D, between: B, calc: C, build: U, take: T } = BOARD;

export const SCRIPT = {
  title: 'الجذر التربيعي لعدد موجب',
  steps: [
    {
      id: 'opening',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'ساحة لم يقسها أحد',
      text: `في سطح جديد من القصر ساحة مربّعة، مساحتها مكتوبة على بابها: ${tiles(O.area)}. ولا أحد يعرف طول ضلعها.`,
      question: 'أيّ مقياس تركب منصّته المصعد؟ توقّعوا قبل أن ننزلها.',
      area: O.area,
      rods: O.rods,
      answer: ['18'],
      after:
        'منصّة المقياس 18 تغطّي الساحة بالضبط: $18 \\times 18 = 324$. والمقياس 81 ربع المساحة، و 162 نصفها: منصّتاهما تعلقان.',
      cue: 'من يقترح مقياسًا قبل أيّ تجربة؟ ولماذا هذا العدد بالذات؟',
    },
    {
      id: 'decimal',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'ساحة بأجزاء من البلاطة',
      text: `ساحة أخرى مساحتها ${tiles(D.area)}: ليست عددًا طبيعيًّا من البلاطات.`,
      question: 'أيّ مقياس تركب منصّته هذه الساحة؟',
      area: D.area,
      rods: D.rods,
      answer: ['4,2'],
      after:
        '$4{,}2 \\times 4{,}2 = 17{,}64$: المنصّة تغطّي الساحة بالضبط. والمقياس $8{,}82$ نصف المساحة: منصّته تعلق.',
      cue: 'منصّة المقياس 4 تركت شريطًا: لماذا نجرّب بعده مقياسًا أطول قليلًا؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: K1,
      recall: ['مربّعه', 'الجذر التربيعي'],
      cue: 'ساحة مساحتها 1089 بلاطة: ما طول ضلعها؟ وكيف نكتبه بالرمز الجديد؟',
    },
    {
      id: 'between',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'ساحة لا يركبها مقياس',
      text: `ساحة مساحتها ${tiles(B.area)}. نجرّب المقاييس كما فعلنا من قبل.`,
      question: 'أيّ هذه المقاييس تركب منصّته الساحة؟',
      area: B.area,
      rods: B.rods,
      answer: [],
      after:
        '$7{,}2 \\times 7{,}2 = 51{,}84$ و $7{,}3 \\times 7{,}3 = 53{,}29$: لا مقياس منها يركب. ضلع الساحة أطول من $7{,}2$ وأقصر من $7{,}3$.',
      cue: 'بقي شريط مع 7، وعلقت المنصّة مع 8: أين نبحث بعدهما؟',
    },
    {
      id: 'calc',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'الحاسبة والجدار',
      text: 'علامات أدقّ: $7{,}28$ و $7{,}29$. والحاسبة تعرض عشرة أرقام. ونأخذ أيضًا المقياس من الجدار نفسه، من الركن إلى الركن.',
      question: 'أيّ منصّة تركب: منصّة الحاسبة أم منصّة الجدار؟',
      area: C.area,
      rods: [...C.rods, { q: C.calculator, label: 'الحاسبة' }, { root: C.area, label: 'ضلع الساحة' }],
      answer: [`√${C.area}`],
      after:
        '$7{,}28 < \\sqrt{53} < 7{,}29$. منصّة الحاسبة تترك شريطًا لا تراه العين؛ منصّة الجدار وحدها تركب، وطوله نكتبه $\\sqrt{53}$.',
      cue: 'الحاسبة تعرض عشرة أرقام: لماذا بقي شريط؟ فماذا نكتب لطول الضلع؟',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: K2,
      recall: ['المضبوطة', 'قيمة مقرّبة'],
      cue: 'ما القيمة المقرّبة إلى 0,01 بالزيادة لضلع الساحة 53؟ ولماذا؟',
    },
    {
      id: 'build',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'نبني على الجدار',
      text: `مقياس أُخذ من جدار ساحة مساحتها ${tiles(U.root)}، من الركن إلى الركن: طوله $\\sqrt{61}$. نحمله إلى ورشة « ابنِ ساحة ».`,
      question: 'على أيّ ساحة تركب منصّته؟',
      rod: { root: U.root },
      areas: U.areas,
      answer: ['61'],
      after:
        '$(\\sqrt{61})^2 = 61$: المنصّة المبنيّة على $\\sqrt{61}$ تغطّي الساحة 61 بالضبط — لا ضعفها، ولا نصفها، ولا $61 \\times 61 = 3721$.',
      cue: 'لم نعرف أرقام هذا المقياس: فكيف عرفنا مساحة منصّته؟',
    },
    {
      id: 'take',
      kind: 'court',
      chapter: 'نكتشف',
      title: 'نأخذ الضلع',
      text: 'في ورشة « ابنِ ساحة » نبني ساحة على مقياس طوله $3{,}4$: مساحتها $3{,}4 \\times 3{,}4 = 11{,}56$. ثمّ ننقلها إلى ورشة « خذ الضلع ».',
      question: 'أيّ مقياس تركب منصّته هذه الساحة؟',
      area: T.area,
      rods: T.rods,
      answer: ['3,4'],
      after: '$\\sqrt{(3{,}4)^2} = \\sqrt{11{,}56} = 3{,}4$: نبني على مقياس، ثمّ نأخذ الضلع، فنعود إلى المقياس نفسه.',
      cue: 'لو بنينا على 438 ثمّ أخذنا الضلع: ماذا نجد؟ هل نحتاج أن نحسب؟',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: K3,
      recall: ['مساحتها', 'ضلع الساحة'],
      cue: 'نمشي 12 خطوة إلى اليسار ونبني ساحة: ما طول ضلعها؟ هل له إشارة؟',
    },
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: [K1, K2],
      cue: 'بعد النقل: من يقرأ الكتابة الجديدة بصوت عالٍ، ويقول ما معناها؟',
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
