/**
 * THE EXPERIMENTS « استكشف » of lesson `jidhr-tarbii` — the first phase of forges ✍️ and 🔁 (`forges.js › inquiry`;
 * the screens: `rootCourts/InquiryCalc.jsx` and `rootCourts/InquiryRoundtrip.jsx`, mounted by `rootCourts/Inquiry.jsx`).
 * Key 🔑 has none: it is found in the WORLD, on the courts he rides (its forge reads the world's log).
 *
 *   ✍️ `calc`       back at the court of 30, which no number rode: three rods lie ready — 5, then 5,5, then the number
 *                   the calculator shows for its side. He says BEFORE each lowering whether it rides; the world lowers it,
 *                   writes what is left or what sticks out, and he drives the magnifier until he SEES the calculator's
 *                   miss. Then he clamps the rod on the wall, corner to corner: it rides — and has no number.
 *   🔁 `roundtrip`  the two stations « ابنِ ساحة » and « خذ الضلع »: the wall of the court of 23 → build; the rod 14 →
 *                   build → take; nine steps to the LEFT of the post → build → take; then a chain of three from the wall
 *                   of the court of 29. Before each station runs he types what will come out.
 * Every sentence is a FACT about what he just did — never the rule, never its name, never the sign √ (tested in
 * `inquiries.test.js`). A number inside a sentence that goes through MathText is `$…$`; a plain string holds no `$`.
 */
import { counted } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { read, rootOf, tex, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { tileWord, tiles } from '../../../../../../common/gameworld/rootCourts/ruleForge';
import { CALCULATOR, COURTS, STORY } from './story';

/** A number as a formula of MathText: « $5{,}5$ », « $\\dfrac{4}{9}$ », « $-9$ ». */
const m = (x) => `$${tex(x)}$`;
/** A number of tiles in a MathText sentence: the number as a formula, its noun agreed (« $81$ بلاطة », « $3$ بلاطات »). */
const tilesM = (x) => {
  const w = tileWord(write(x));
  return `${m(x)} ${/واحدة|بلاطتان/.test(w) ? 'بلاطة' : w}`;
};
/** Steps of a walk, agreed (after « مشى »): « خطوة واحدة », « خطوتين », « 9 خطوات », « 18 خطوة ». */
export const steps = (n) => counted(n, ['خطوة واحدة', 'خطوتين', 'خطوات', 'خطوة']);
const MISS = 'توقّعك لم يصب هذه المرّة: ';

/** The names of the two stations, as the story writes them on the terrace. */
export const [BUILD, TAKE] = STORY.terraces.find((t) => t.feature?.kind === 'stations').feature.names;

// ───────────────────────── ✍️ — the court of 30 and its three rods ─────────────────────────

/** The largest whole number whose platform fits in a court: the rod that leaves the band, 5 for 30. */
export const wholeBelow = (area) => {
  const { n, d } = read(area);
  let k = 0n;
  while ((k + 1n) * (k + 1n) * d <= n) k += 1n;
  return Number(k);
};
const W = wholeBelow(COURTS.first);

export const CALC_INQUIRY = {
  kind: 'calc',
  a: COURTS.first,
  rods: [{ q: String(W) }, { q: `${W},5` }, { calc: CALCULATOR }],
  wall: true,
  text: {
    lead: ({ a }) =>
      `عدتَ إلى الساحة التي مساحتها ${tilesM(a)}: لم يركبها أيّ مقياس بعد. بجانب جدارها مقاييس جاهزة، وحاسبة.`,
    goal: ({ a }) => `جرّب المقاييس واحدًا واحدًا على الساحة ${a}: قبل كلّ منصّة، قل هل تركب.`,
    wallName: 'جدار الساحة',
    unknown: '؟',
    ask: ({ q, calc, wall }) =>
      wall
        ? 'المقياس مشدود على الجدار من الركن إلى الركن. هل تركب منصّته المصعد؟'
        : calc
          ? `سُئلت الحاسبة عن ضلع الساحة فعرضت ${m(q)}. هل تركب المصعدَ المنصّةُ المبنيّة على مقياس بهذا الطول؟`
          : `المقياس ${m(q)}: هل تركب منصّته المصعد؟`,
    yes: 'تركب',
    no: 'لا تركب',
    zoomIn: 'كبّر',
    thin: ({ covers }) => `المنصّة تغطّي ${m(covers)} بلاطة. العين لا ترى فرقًا: كبّر ركن الساحة.`,
    fact: ({ kind, covers, diff, wall, right, k, zoom }) =>
      `${right ? '' : MISS}${
        wall || kind === 'ride'
          ? 'المنصّة تلمس الجدران الأربعة: المصعد يحملها.'
          : `المنصّة تغطّي ${m(covers)} بلاطة: ${
              kind === 'band' ? `يبقى شريط مساحته ${m(diff)} بلاطة` : `تبرز عن الساحة بـ ${m(diff)} بلاطة فتعلق`
            }${k ? ` (رأيتَه عند التكبير $${zoom}$)` : ''}.`
      }`,
    colRod: 'المقياس',
    colCovers: 'ما تغطّيه المنصّة (بلاطة)',
    colDiff: 'ما يبقى أو ما يبرز (بلاطة)',
    band: 'يبقى',
    jam: 'يبرز',
    rides: 'تركب المصعد',
    wallAsk: () => 'لم يركب أيّ مقياس من هذه. الجدار نفسه يمتدّ من الركن إلى الركن: شُدّ المقياس عليه.',
    clamp: 'شُدّ المقياس على الجدار',
    wallNote: ({ a }) =>
      `؟ — مقياس طوله طول جدار الساحة التي مساحتها ${tilesM(a)}، من الركن إلى الركن. لم يُكتب له عدد.`,
    next: 'المقياس التالي',
    done: 'انتهيت',
  },
};

// ───────────────────────── 🔁 — the two stations ─────────────────────────

/** The numbers of the journeys: the wall of 23, the rod of the court of 196 (14), nine steps left, the wall of 29. */
export const ROUNDTRIP_NUMBERS = { wall: '23', rod: rootOf(COURTS.last), walk: '-9', chain: '29' };
const R = ROUNDTRIP_NUMBERS;

/** A thing of a journey in words: a rod, the wall of a court, a court, a walk of the robot. */
export function what(t) {
  if (t.walk != null) return `مقياس مشيِ زيرو ${steps(Math.abs(Number(t.walk)))} إلى اليسار من العمود`;
  if (t.court != null) return `ساحة مساحتها ${tilesM(t.court)}`;
  if (t.rod.root != null) return `ضلع الساحة التي مساحتها ${tilesM(t.rod.root)}`;
  return `مقياس طوله ${m(t.rod.q)}`;
}
/** What he typed, in words. */
const saidText = (x) =>
  x.area != null ? `${m(x.area)} بلاطة` : x.root != null ? `ضلع الساحة التي مساحتها ${m(x.root)}` : m(x.q);

export const ROUNDTRIP_INQUIRY = {
  kind: 'roundtrip',
  rounds: [
    { from: { rod: { root: R.wall } }, path: ['build'] },
    { from: { rod: { q: R.rod } }, path: ['build', 'take'] },
    { from: { walk: R.walk }, path: ['build', 'take'] },
    { from: { rod: { root: R.chain } }, path: ['build', 'take', 'build'] },
  ],
  text: {
    lead: ({ from }) => `في يدك ${what(from)}.`,
    goal: () => 'قبل أن تعمل كلّ محطّة، اكتب ما سيخرج منها.',
    buildName: BUILD,
    takeName: TAKE,
    askBuild: ({ in: t }) => `يدخل ${what(t)} محطّة « ${BUILD} ». ماذا ستكتب لوحة الساحة التي تخرج؟`,
    askTake: ({ in: t }) => `تدخل ${what(t)} محطّة « ${TAKE} ». ما المقياس الذي يخرج؟`,
    tiles: 'بلاطة',
    formNumber: 'مقياس طوله عدد',
    formWall: 'ضلع ساحة',
    wallBox: 'ضلع الساحة التي مساحتها',
    wallLabel: ({ area }) => `ضلع الساحة ${area}`,
    plaque: ({ area }) => tiles(area),
    run: 'شغّل المحطّة',
    unread: 'اكتب عددًا في الخانة، ثمّ شغّل المحطّة.',
    unknown: '؟',
    ran: ({ op, out, said: x, right }) =>
      `${right ? '' : MISS}${op === 'build' ? `خرجت ${what(out)}` : `خرج ${what(out)}`}${
        right ? '، كما كتبتَ' : `؛ كتبتَ ${saidText(x)}`
      }.`,
    go: 'إلى المحطّة التالية',
    next: 'الرحلة التالية',
    done: 'انتهيت',
  },
};
