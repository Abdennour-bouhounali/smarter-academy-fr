/**
 * THE EXPERIMENT « استكشف » of lesson `natiqa-ghayr-natiqa` — the first phase of forge ♾️ (`forges.js › inquiry`; the
 * screen: `rootCourts/InquiryChase.jsx`, mounted by `rootCourts/Inquiry.jsx`; its logic `rootCourts/chase.js`).
 * Keys 🧩 and 🎯 have none: they are found in the WORLD, on the courts he sorts and closes (their forges read the log).
 *
 *   ♾️ `chase`  back at the court of two tiles, which no mark of a hundredth rode: the mirror lays rods whose lengths are
 *               fractions, each nearer the end of the wall than the one before. He says BEFORE each lowering what the
 *               platform will do (leave a band, jam, ride); the world lowers it and writes the platform and the court
 *               in SMALL tiles of side 1/q — two whole numbers, one small tile apart every time. Last, he counts how
 *               many rode.
 * Every sentence is a FACT about what he just did — never the rule, never its name, never « exact », « never »,
 * « impossible », a root or its sign (tested in `inquiries.test.js`). A number inside a sentence that goes through
 * MathText is `$…$` (a fraction `\\dfrac`, a real bar); a plain string holds no `$`.
 */
import { tiles } from '../../../../../../common/gameworld/rootCourts/strings';
import { COURTS } from './story';

/** The fractions the mirror lays on the court of two, each nearer than the one before (the design's list). */
export const CHASE_FRACS = ['3/2', '7/5', '17/12', '41/29', '99/70'];

/**
 * A number of SMALL tiles with its noun agreed (« بلاطة صغيرة واحدة », « بلاطتان صغيرتان », « 9 بلاطات صغيرة »,
 * « 50 بلاطة صغيرة »), without the number: what follows a number already written (`unit`, the card's line).
 */
export function smallWord(n) {
  const t = tiles(String(n));
  if (t === 'بلاطة واحدة') return 'بلاطة صغيرة';
  if (t === 'بلاطتان') return 'بلاطتان صغيرتان';
  // the kit glues a number to its noun with a no-break space (an ordinary one in older strings)
  return `${t.replace(/^\d+[\s  ]+/, '')} صغيرة`;
}
/** A number of small tiles in a MathText sentence: the number as a formula, its noun agreed. */
const smallM = (n) =>
  String(n) === '1' ? 'بلاطة صغيرة واحدة' : String(n) === '2' ? 'بلاطتان صغيرتان' : `$${n}$ ${smallWord(n)}`;
const MISS = 'توقّعك لم يصب هذه المرّة: ';

/**
 * ♾️ — the court of two tiles and the mirror's fractions. Its area is read from the story when the screen asks for it
 * (a getter): the story is evaluated before this file in every order the app or a test imports them.
 */
export const CHASE_INQUIRY = {
  kind: 'chase',
  get a() {
    return COURTS.two;
  },
  fracs: CHASE_FRACS,
  text: {
    lead: ({ a }) =>
      `الساحة نفسها، ${tiles(a)} فقط: تمدّ المرآة بجانبها مقاييس طولها كسور، كلّ واحد أقرب إلى نهاية الجدار من الذي قبله.`,
    goal: ({ n }) => `جرّب المقاييس الـ $${n}$ واحدًا بعد واحد: قبل أن تنزل كلّ منصّة، قل ماذا ستفعل.`,
    ask: ({ rodTex }) => `مقياس طوله $${rodTex}$: ماذا ستفعل منصّته في الساحة؟`,
    sayBand: 'تترك شريطًا',
    sayJam: 'تعلق',
    sayRide: 'تركب',
    rodName: 'المقياس',
    platformName: 'المنصّة',
    courtName: 'الساحة',
    smallTile: ({ q, perTile }) => `بلاطة صغيرة ضلعها $\\dfrac{1}{${q}}$: في البلاطة الواحدة ${smallM(perTile)}.`,
    unit: (n) => smallWord(n),
    unknown: '؟',
    fact: ({ kind, platform, court, gap, right }) =>
      `${right ? '' : MISS}المنصّة ${smallM(platform)}، والساحة ${smallM(court)}: ${
        kind === 'ride'
          ? 'غطّتها المنصّة، فركبت المصعد'
          : kind === 'band'
            ? `تنقص المنصّةَ ${smallM(gap)}، فيبقى شريط`
            : `تزيد المنصّة ${smallM(gap)}، فتعلق`
      }.`,
    colRod: 'المقياس',
    colPlatform: 'المنصّة',
    colCourt: 'الساحة',
    colFact: 'ما حدث (بلاطة صغيرة)',
    band: 'ينقص',
    jam: 'يزيد',
    rides: 'تركب',
    next: 'المقياس التالي',
    countAsk: ({ n }) => `انظر الجدول: كم منصّة من هذه المنصّات الـ $${n}$ ركبت المصعد؟`,
    countNone: 'ولا واحدة',
    countOne: 'واحدة',
    countAll: 'كلّها',
    countFact: ({ rides, n, right }) =>
      `${right ? '' : MISS}${
        rides === 0
          ? `لم تركب المصعدَ أيّ منصّة من الـ $${n}$`
          : rides === n
            ? `ركبت المصعدَ المنصّات الـ $${n}$ كلّها`
            : `ركبت المصعدَ $${rides}$ من الـ $${n}$`
      }: انظر عمود ما حدث.`,
    done: 'انتهيت',
  },
};
