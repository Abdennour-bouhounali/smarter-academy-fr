/**
 * THE THREE INVESTIGATIONS of lesson « قواعد قابلية القسمة » — its numbers and its words (the screens and their logic are
 * the world's: `divisorIsles/Inquiry.jsx › Chart`, `InquiryCombine.jsx › Join`, `inquiry.js`; the contract: GAME_WORLD.md
 * « استكشف », the `chart` and `join` kinds). Each key is found by an experiment of ITS OWN nature — no two keys share a
 * (kind, mode), and `inquiries.test.js` computes it from the specs:
 *
 *   UNITS     chart · « يساوي »           planks 5 then 2 — the planks of the two bridges he has just built (35 and 46). He
 *             tests the gaps of a chart one after the other, chooses a LENS and gathers every VALUE of it with which the
 *             plank fills; then he tests the first gaps of the next hundred himself.
 *   SUM       chart · « يقبل القسمة على »  planks 9 then 3 — the plank of the gap 81. He names ONE number the lens must be
 *             divisible by: a reading said that way holds on every hundred.
 *   HUNDREDS  join · glue (`sum`)          plank 4 — the DECOMPOSITION argument. A gap of whole hundreds (the plank always
 *             fills it: a fact, written `300 = 4 × 75 + 0`) and a short gap (filled, or a piece left) are glued; he says
 *             BEFORE whether the plank fills the gap they make. It starts from the gate dash he has just ridden (28, the
 *             number divisible by 4, and its neighbour 26), goes on with the SAME short gap after other hundreds, and
 *             ends on two gaps that end with the same digit (212 and 322).
 * He still WRITES his rule with tiles afterwards (no `writes`): the experiment found what counts, the tiles say it.
 * No sentence here states a rule: each one says what the chart or the strips have just done.
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import { NUMBERS, STORY } from './story';

/** The gap of the story each plank has just filled — a chart starts from what he did (none for 3: met on the chart). */
const FILLED = {
  [NUMBERS.units.planks[0]]: NUMBERS.units.gaps[0],
  [NUMBERS.units.planks[1]]: NUMBERS.units.gaps[1],
  [NUMBERS.sum.plank]: NUMBERS.sum.gap,
};

const LENS = {
  units: 'رقم الآحاد',
  tens: 'رقم العشرات',
  sum: 'مجموع الأرقام',
};
const hundred = (from) => `من ${from} إلى ${from + 99}`;
const gapsOf = (n) => (n === 1 ? 'هوّة واحدة' : n === 2 ? 'هوّتين' : n <= 10 ? `${n} هوّات` : `${n} هوّة`);
/**
 * What a claim does on the chart, counted (the noun, its adjective and its verb agree with the number: one, two, 3 … 10,
 * more): the cells that are not green it takes in, the green cells it leaves out.
 */
const tookIn = (n) =>
  n === 1
    ? 'خانة واحدة غير خضراء دخلت في اختيارك'
    : n === 2
      ? 'خانتان غير خضراوين دخلتا في اختيارك'
      : `${n} ${n <= 10 ? 'خانات' : 'خانة'} غير خضراء دخلت في اختيارك`;
const leftOut = (n) =>
  n === 1
    ? 'خانة خضراء واحدة بقيت خارجه'
    : n === 2
      ? 'خانتان خضراوان بقيتا خارجه'
      : `${n} ${n <= 10 ? 'خانات' : 'خانة'} خضراء بقيت خارجه`;

/**
 * The words of ONE chart (each investigation gets its own object): `last` = the button after its last plank, `sealed`
 * what is said when every reading of it is found.
 */
const chartText = ({ last, sealed }) => ({
  lens: { ...LENS },
  board: (b, from) => `اللوح ${b} · الهوّات من ${from || 1} إلى ${from + 99}`,
  testBtn: (n) => `جرّب الهوّة ${n}`,
  fill: 'أكمل اللوحة',
  look: 'ماذا ألاحظ؟',
  /** THE QUESTION, on screen while he tests: it starts from the gap the plank has just filled in the story. */
  lead: (b) =>
    FILLED[b]
      ? `اللوح ${b} ملأ الهوّة ${FILLED[b]}. ما الهوّات الأخرى التي يملؤها لوح طوله ${b}؟`
      : `ما الهوّات التي يملؤها لوح طوله ${b}؟`,
  goal: (b) => `الهدف: أن تعرف هذه الهوّات من شكلها، دون تقسيم طولها في كلّ مرّة على العدد ${b}.`,
  link: { equals: 'يساوي', divides: 'يقبل القسمة على' },
  how: (b, enough) =>
    enough
      ? 'واصل التجريب، أو دع العالم يكمل اللوحة.'
      : `جرّب الهوّات واحدة بعد الأخرى، من ${b}: نقسم طول الهوّة على ${b}، وإذا كان الباقي 0 صارت خانتها خضراء.`,
  rest: (r) => `الباقي ${r}`,
  lensAsk: (b) =>
    `الخانات الخضراء هوّات يملؤها اللوح ${b}. إلى ماذا يكفي أن تنظر في العدد لتعرفها دون قسمة؟ اختر عدسة.`,
  valuesAsk: (b, lens, link) =>
    link === 'divides'
      ? `عدستك: ${lens}. على أيّ عدد يقبل القسمة عندما يملأ اللوح ${b} الهوّة؟ اضغط عددًا، واللوحة تجيبك.`
      : `عدستك: ${lens}. اضغط كلّ قيمة يملأ معها اللوح ${b} الهوّة، واللوحة تجيبك.`,
  claim: (orphans, intruders) =>
    [intruders ? tookIn(intruders) : null, orphans ? leftOut(orphans) : null].filter(Boolean).join(' · '),
  claimOk: () => 'كلّ الخانات الخضراء داخل اختيارك، ولا خانة غيرها معها.',
  seal: (b) => `هذه قراءتي للّوح ${b}`,
  /** The next hundred: he tests its first gaps HIMSELF, then the world finishes it. */
  confirmTest: (b, from, n) =>
    `هل تصمد قراءتك بعد المئة الأولى؟ جرّب بنفسك اللوح ${b} على ${gapsOf(n)} ابتداءً من ${from}، ثمّ يكمل العالم حتى ${from + 99}.`,
  confirming: (b, from) => `جرّبتَ الهوّات الأولى بنفسك، والعالم يكمل الآن تجريب اللوح ${b} ${hundred(from)}…`,
  confirmed: (b, from) => `صمدت: ${hundred(from)}، قراءتك أحاطت بكلّ الخانات الخضراء، وبها وحدها.`,
  next: 'لوح آخر',
  last,
  foundLine: (b, lens, values, link) =>
    link === 'divides'
      ? `اللوح ${b}: ${lens} يقبل القسمة على ${values.join(' أو ')}`
      : `اللوح ${b}: ${lens} ${values.join(' أو ')}`,
  sealed,
  done: 'أكتب قاعدتي',
});

const DIVISORS = [2, 3, 4, 5, 6, 7, 8, 9];

/** Key 1 « رقم الآحاد »: planks 5 then 2, each value of the lens pressed (« يساوي »). */
export const UNITS_INQUIRY = {
  kind: 'chart',
  planks: [
    { b: NUMBERS.units.planks[0], manual: 8, lenses: ['tens', 'units', 'sum'] },
    { b: NUMBERS.units.planks[1], manual: 9, lenses: ['sum', 'tens', 'units'] },
  ],
  divisors: [...DIVISORS],
  text: chartText({
    last: 'قراءتاي',
    sealed: 'لوحان، وقراءتان وجدتَهما بنفسك. اكتب الآن قاعدتك بالبطاقات، والمرآة ستختبرها.',
  }),
};

/** Key 2 « مجموع الأرقام »: planks 9 then 3, ONE number pressed (« يقبل القسمة على »). */
export const SUM_INQUIRY = {
  kind: 'chart',
  planks: [
    { b: NUMBERS.sum.plank, manual: 10, lenses: ['units', 'tens', 'sum'], link: 'divides' },
    { b: NUMBERS.sum.usePlank, manual: 8, lenses: ['units', 'sum', 'tens'], link: 'divides' },
  ],
  divisors: [...DIVISORS],
  text: chartText({
    last: 'قراءتاي',
    sealed: 'لوحان آخران، وقراءتان وجدتَهما بنفسك. اكتب الآن قاعدتك بالبطاقات، والمرآة ستختبرها.',
  }),
};

// ───────────────────────── key 3 — the hundreds and the short gap, glued ─────────────────────────

/** The last sentence of the gate dash he has just ridden: « عدد يقبل القسمة على 4 » — its gates, the one that is. */
const DASH = STORY.dashWaves.at(-1);
const DASH_YES = DASH.gates.find((n) => n % NUMBERS.last2.plank === 0);
/** Its neighbour on the dash that is NOT divisible by 4, though it is even. */
const DASH_NO = DASH.gates.find((n) => n % NUMBERS.last2.plank !== 0);

const math = (s) => `$${s.replaceAll('×', '\\times')}$`;
const left = (r) => (r === 1 ? 'خانة واحدة' : r === 2 ? 'خانتان' : r <= 10 ? `${r} خانات` : `${r} خانة`);
const fill = (yes) => (yes ? 'يملأ' : 'لا يملأ');
const after = (guess, holds) => (guess == null ? '' : guess === holds ? ' كما توقّعت!' : ' لم يكن هذا توقّعك.');
/**
 * What the plank did on a gap, under its strip (plain: it is SVG text). A short gap gets a short line: its strip is
 * narrow beside a gap of hundreds, and its line is centred under it.
 */
const label = (n, d, { planks: p, rest }) =>
  n < 100
    ? rest
      ? `${n}: بقيت ${left(rest)}`
      : `${n}: ${planks(p)}`
    : rest
      ? `${n}: ${planks(p)}، وبقيت ${left(rest)}`
      : `${n}: ${planks(p)}`;

/**
 * Key 3 « الرقمان الأخيران »: plank 4 on a gap of whole hundreds GLUED to a short gap. The rounds, in order:
 *   100 + 28, 100 + 26   the dash's own numbers: the hundred with a short gap the plank fills, then with one it does not
 *   300 + 28, 200 + 26   the SAME short gaps after other hundreds: the verdict does not move
 *   200 + 12, 300 + 22   two gaps ending with the same digit, one filled and one not
 * Each number of hundreds (1, 2, 3) is met once in a gap the plank fills and once in a gap it does not. The longest gap
 * is 328 cells: beyond that the strip of a short gap is narrower than its own line (the world draws both gaps at one
 * scale) — the thousands come in the forge's last step, where nothing is drawn.
 */
export const HUNDREDS_INQUIRY = {
  kind: 'join',
  d: NUMBERS.last2.plank,
  rounds: [
    { op: 'sum', a: 100, b: DASH_YES },
    { op: 'sum', a: 100, b: DASH_NO },
    { op: 'sum', a: 300, b: DASH_YES },
    { op: 'sum', a: 200, b: DASH_NO },
    { op: 'sum', a: 200, b: 12 },
    { op: 'sum', a: 300, b: 22 },
  ],
  text: {
    /** THE QUESTION, on screen all along: it starts from the dash — the number that was divisible by 4. */
    lead: (d) =>
      `على لوح الضوء، ${DASH_YES} هو العدد الذي يقبل القسمة على ${d}. الآن نلصق هوّة قصيرة بعد هوّة طويلة: ماذا يفعل اللوح ${d} في الهوّة الجديدة؟`,
    goal: (d) => `الهدف: أن تعرف، قبل لصق الهوّتين، هل يملأ اللوح ${d} الهوّة الجديدة.`,
    label,
    ask: ({ a, b, d }) => `نلصق الهوّة ${b} بعد الهوّة ${a}. هل يملأ اللوح ${d} الهوّة الجديدة، دون أن تبقى خانة؟`,
    seen: (f, guess) =>
      `${math(`${f.a} + ${f.b} = ${f.value}`)}: ${planks(f.planks)} طولها ${f.d}، ${
        f.holds ? 'ولا خانة باقية.' : `وبقيت ${left(f.rest)}.`
      }${after(guess, f.holds)}`,
    foundLine: (f) =>
      `${math(`${f.a} + ${f.b} = ${f.value}`)} — اللوح ${f.d}: ${fill(f.fillsA)} ${f.a}، ${fill(f.fillsB)} ${f.b}، ${fill(f.holds)} ${f.value}`,
    yes: 'نعم، يملؤها',
    no: 'لا، تبقى خانات',
    next: 'هوّتان أخريان',
    done: 'أكتب قاعدتي',
  },
};
