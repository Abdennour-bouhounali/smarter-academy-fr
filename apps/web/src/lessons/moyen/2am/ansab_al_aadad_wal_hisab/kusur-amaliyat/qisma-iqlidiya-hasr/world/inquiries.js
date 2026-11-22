/**
 * THE TWO INVESTIGATIONS of lesson « القسمة الإقليدية وحصر حاصل القسمة » — their numbers and their words (the screens
 * and their logic are the world's: `divisorIsles/InquiryDivision.jsx`, `inquiry.js`; the contract: GAME_WORLD.md
 * « استكشف », « spec shapes »). Each key that is a procedure or a bracketing is FOUND by an experiment of its own:
 *
 *   ESTIMATE  what is new in this lesson is the LONG plank (three digits): the gap of 4576 he has just crossed with its
 *             three moulds (208, 365, 248), a short gap that takes a single digit (2241 with 365), then a gap of five
 *             digits whose count of planks has a 0 inside (22152 with 208). On a ruler whose marks are multiples of the
 *             long plank he presses the mark he lays; a mark that passes the flag, or one that leaves the next mark under
 *             the flag, is answered by its product. The ruler is BLIND (`blind: true`, GAME_WORLD.md « استكشف »): a mark
 *             shows its count of planks only, and the world writes its product AFTER he has pressed — so he has to try a
 *             digit he thought of, exactly what the tiles of his rule then speak of. Only the FIRST round is sighted
 *             (the plank 208 that has just filled the gap): he meets the ruler of a long plank once, with its products
 *             written, before they are hidden. (The division by a plank of two digits is the first year's: the story
 *             only recalls it, on island B.)
 *   BRACKET   the gap 5475 as a flag on the line of the multiples of each of its planks (208, 365, 312), then 4576 on the
 *             lines of 365 and 208: he types the two numbers of the template, then says whether the flag stands between
 *             two marks or ON one.
 * The third key (« انعدام الباقي ») is one condition on a case: the mirror alone, no investigation.
 * No sentence here states a rule or uses the words of a tile: each one says what the planks, the ruler or the line have
 * just done. No round is the bridge that comes next in the story: every gap here is one he has crossed, or a new one.
 */
import { quotientTex } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { agree, cells, count, noun, planks, planksOf } from './counted';
import { NUMBERS } from './story';

const math = (s) => `$${s.replaceAll('×', '\\times')}$`;
const after = (guess, right) => (guess === right ? ' كما قلت!' : ' لم يكن هذا ما قلته.');
const MARK = noun('علامة', 'علامات', 'f');

const { long: L, bracket: H } = NUMBERS;
const [L208, L248, L365] = L.moulds;
const [H208, H312, H365] = H.moulds;

// ───────────────────────── ESTIMATE — « القسمة على أيّ عدد » ─────────────────────────
/** The one round whose ruler writes its products (the others are blind): the plank that has just filled his gap. */
const sighted = (a, b) => a === L.gap && b === L208;
/** What a blind ruler does — a fact about the screen, said beside the question. */
const HIDDEN = ' المسطرة تكتب طول الألواح بعد أن تضغط.';

export const ESTIMATE_INQUIRY = {
  kind: 'estimate',
  // the marks hide their products until he presses: the multiples of a long plank are not given, they are tried
  blind: true,
  rounds: [
    // the gap he has just crossed, with its three long moulds: one fills it (the ruler shows its products this once),
    // two leave cells
    { a: L.gap, b: L208, blind: false },
    { a: L.gap, b: L365 },
    { a: L.gap, b: L248 },
    // a short gap: ONE digit to find, on a ruler of single planks
    { a: 2241, b: 365 },
    // a gap of five digits: hundreds of planks, then a step where no plank is laid, then planks
    { a: 22152, b: 208 },
  ],
  text: {
    lead: (a, b) => `هوّة من ${cells(a)}، واللوح طويل: طوله ${b}. كم لوحًا يدخل فيها، وكم خانة تبقى؟`,
    goal: () => 'الهدف: أن تجد عدد الألواح رقمًا رقمًا، ومضاعفات اللوح الطويل ليست في جداولك.',
    ask: ({ a, b, place, unit, from }) =>
      `${
        place
          ? `الراية عند ${from}، وكلّ علامة على المسطرة ${planks(10 ** place)}، أي ${cells(unit)}.`
          : `الراية عند ${from}، وكلّ علامة على المسطرة لوح واحد طوله ${b}.`
      }${sighted(a, b) ? '' : HIDDEN} ${place ? 'كم لوحًا تضع الآن؟' : 'كم لوحًا تضع؟'}`,
    left: (n) => `${n} باقية`,
    passes: (m) =>
      `${math(`${m.b} × ${m.count} = ${m.value}`)}، و ${math(`${m.value} > ${m.from}`)}: ${planks(m.count)} ${agree(m.count, ['يتجاوز', 'يتجاوزان', 'تتجاوز'])} الراية.`,
    short: (m) =>
      `${m.count ? math(`${m.b} × ${m.count} = ${m.value}`) : 'لم تضع أيّ لوح'}، والعلامة التالية ${m.next} لا تتجاوز الراية ${m.from}.`,
    laid: (m) =>
      m.count
        ? `${agree(m.count, ['وُضع', 'وُضع', 'وُضعت'])} ${planks(m.count)}: ${math(`${m.from} - ${m.b} × ${m.count} = ${m.left}`)}.`
        : `لا لوح في هذه الخطوة: العلامة الأولى ${m.unit} تتجاوز الراية ${m.from}.`,
    sum: ({ a, b, q, r }) =>
      `${math(`${a} = ${b} × ${q} + ${r}`)}: ${planks(q)}، ${r ? `وبقيت ${cells(r)}` : 'ولم تبقَ أيّ خانة'}.`,
    foundLine: ({ a, b, q, r }) => `${math(`${a} = ${b} × ${q} + ${r}`)} — ${planks(q)}، والباقي ${r}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};

// ───────────────────────── BRACKET — « حصر حاصل القسمة » ─────────────────────────
/** What the line shows of two numbers that do not follow each other — a fact about its marks. */
const apart = (m) => {
  const k = m.hi - m.lo - 1;
  if (k > 0)
    return `، وبين العلامة ${m.loValue} والعلامة ${m.hiValue} تقف ${count(k, MARK)} ${agree(k, ['أخرى', 'أخريان', 'أخرى'])}`;
  return k === -1
    ? `، والعدد ${m.lo} مكتوب مرّتين: على الخطّ علامة واحدة`
    : `، والعلامة ${m.hiValue} قبل العلامة ${m.loValue}`;
};

export const BRACKET_INQUIRY = {
  kind: 'bracket',
  rounds: [
    // the gap he has just crossed with each of its long moulds: between two marks, ON a mark, between again
    { a: H.gap, b: H208 },
    { a: H.gap, b: H365 },
    { a: H.gap, b: H312 },
    // the long gap before it, with a plank that leaves cells and the plank that fills it
    { a: L.gap, b: L365 },
    { a: L.gap, b: L208 },
  ],
  text: {
    lead: (a, b) => `الهوّة ${a} راية على خطّ مضاعفات ${b}. أين تقف بين العلامات؟`,
    // true of every round — also when the flag stands ON a mark — and without a word of the tiles
    goal: () => 'الهدف: أن تعرف أين تقف الراية على الخطّ: بين أيّ علامتين، أو على أيّ علامة.',
    ask: () => 'أكمل القالب بعددين، ثمّ تحقّق.',
    check: 'تحقّق',
    miss: (m) =>
      `${math(`${m.b} × ${m.lo} = ${m.loValue}`)} ${m.loFits ? 'لا يتجاوز' : 'يتجاوز'} ${m.a}، و ${math(`${m.b} × ${m.hi} = ${m.hiValue}`)} ${m.hiPasses ? 'يتجاوز' : 'لا يتجاوز'} ${m.a}${m.consecutive ? '' : apart(m)}.`,
    ok: (f) =>
      `${math(`${f.b} × ${f.lo} = ${f.b * f.lo}`)} لا يتجاوز ${f.a}، و ${math(`${f.b} × ${f.hi} = ${f.b * f.hi}`)} يتجاوزه.`,
    where: (f) => `الراية ${f.a}: أين تقف؟`,
    between: 'بين علامتين',
    onMark: 'على علامة',
    seen: (f) =>
      `${
        f.exact
          ? `الراية على العلامة ${f.b * f.lo}: ${planksOf(f.lo, f.b)} ${agree(f.lo, ['يملأ', 'يملآن', 'تملأ'])} الهوّة، ولا خانة باقية.`
          : `الراية بين ${f.b * f.lo} و ${f.b * f.hi}: ${planksOf(f.lo, f.b)}، وبقيت ${cells(f.r)}.`
      }${after(f.said, f.exact ? 'on' : 'between')}`,
    foundLine: (f) =>
      `$${f.a} \\div ${f.b} = ${quotientTex(f.a, f.b)}$ — ${f.exact ? `على العلامة ${f.b * f.lo}` : `بين العلامتين ${f.b * f.lo} و ${f.b * f.hi}`}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};
