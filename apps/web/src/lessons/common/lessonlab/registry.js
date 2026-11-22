/**
 * « مختبري » — THE INSTRUMENTS, each tagged with the lesson that introduces it (2026-11-16).
 * One lab for every lesson: `toolsFor(lesson)` gives the instruments of that lesson (« أدوات هذا الدرس ») and the cabinet
 * « خزانتي » — the instruments of ALL the lessons before it, of every grade, grouped by grade and lesson. An instrument of a
 * later lesson is not listed at all (not even locked).
 *
 * To add an instrument: write `tools/<Name>.jsx` (props: { a, b, setA, setB, play, note }), add its entry here with the code
 * of the lesson that introduces it (`lesson`; its title is the catalogue's), its number ranges, and 2–3 « جرّب » quests in
 * `logic.js › QUESTS`.
 *
 * The French catalogue has no lesson yet (2026-11-22): every instrument is kept with `lesson: null` — listed nowhere
 * until a French lesson introduces it. The Algerian tags are in git (`git show 049380e:<this file>`).
 */
import { getLessonById } from '@smarter-academy/core';
import { GRADES, GRADE_NAMES, compareLessons, isReached, placeOf } from './order';

export const TOOLS = [
  {
    id: 'rows',
    lesson: null,
    icon: '🟡',
    name: 'صفوف القسمة',
    hint: 'رتّب الحبّات في صفوف متساوية: هل يبقى شيء؟',
    needs: 'ab',
    labels: { a: 'عدد الحبّات', b: 'في كلّ صفّ' },
    range: { a: [1, 144], b: [1, 24] },
    load: () => import('./tools/Rows'),
  },
  {
    id: 'jumps',
    lesson: null,
    icon: '🦘',
    name: 'قفزات المضاعفات',
    hint: 'اقفز بخطوات متساوية من 0: هل تصل إلى الراية تمامًا؟',
    needs: 'ab',
    labels: { a: 'الراية', b: 'طول القفزة' },
    range: { a: [1, 120], b: [1, 30] },
    load: () => import('./tools/Jumps'),
  },
  {
    id: 'sentences',
    lesson: null,
    icon: '🗣️',
    name: 'آلة الجمل الأربع',
    hint: 'أربع جمل، معنى واحد: صحيحة معًا أو خاطئة معًا.',
    needs: 'ab',
    labels: { a: 'العدد الأوّل', b: 'العدد الثاني' },
    range: { a: [1, 999], b: [1, 999] },
    load: () => import('./tools/Sentences'),
  },
  {
    id: 'divisors',
    lesson: null,
    icon: '🌈',
    name: 'قوس القواسم',
    hint: 'اكشف كلّ قواسم عدد: كلّ قاسم له رفيق.',
    needs: 'a',
    labels: { a: 'العدد' },
    range: { a: [1, 100], b: [1, 100] },
    load: () => import('./tools/Divisors'),
  },
  {
    id: 'planks',
    lesson: null,
    icon: '🪵',
    name: 'اللوح المشترك',
    hint: 'غيّر طول اللوح: أيّ الأطوال يملؤها تمامًا؟',
    needs: 'ab',
    labels: { a: 'الطول الأوّل', b: 'الطول الثاني' },
    range: { a: [1, 60], b: [1, 60] },
    load: () => import('./tools/Planks'),
  },
  {
    id: 'common',
    lesson: null,
    icon: '🤝',
    name: 'القواسم المشتركة',
    hint: 'قواسم عددين جنبًا إلى جنب: أيّها مشترك، وأيّها الأكبر؟',
    needs: 'ab',
    labels: { a: 'العدد الأوّل', b: 'العدد الثاني' },
    range: { a: [1, 100], b: [1, 100] },
    load: () => import('./tools/Common'),
  },
  {
    id: 'lists',
    lesson: null,
    icon: '📋',
    name: 'مِنضدة القائمتين',
    hint: 'اكتب قواسم عددين زوجًا زوجًا، جنبًا إلى جنب: أين تلتقي القائمتان؟',
    needs: 'ab',
    labels: { a: 'العدد الأوّل', b: 'العدد الثاني' },
    range: { a: [1, 120], b: [1, 120] },
    load: () => import('./tools/Lists'),
  },
  {
    id: 'euclid',
    lesson: null,
    icon: '🟩',
    name: 'مربّعات إقليدس',
    hint: 'اقطع من المستطيل أكبر مربّع ممكن، ثمّ أعد: آخر مربّع يكشف السرّ.',
    needs: 'ab',
    labels: { a: 'الطول', b: 'العرض' },
    range: { a: [1, 60], b: [1, 60] },
    load: () => import('./tools/Euclid'),
  },
  {
    // three faces on two numbers of the student's own: the two lists of divisors and what is in both, the divisions one
    // after another, one number tried on both — facts only; neither the tile nor the instrument names a key of its lesson
    id: 'duo',
    lesson: null,
    icon: '🔬',
    name: 'مِجهر العددين',
    hint: 'انظر إلى عددين من ثلاث جهات: قواسمهما، قسماتهما المتتالية، وعدد تختبره عليهما معًا.',
    needs: 'ab',
    labels: { a: 'العدد الأوّل', b: 'العدد الثاني' },
    range: { a: [1, 999], b: [1, 999] },
    load: () => import('./tools/Duo'),
  },
  {
    id: 'paper',
    lesson: null,
    icon: '📝',
    name: 'القسمة على الورقة',
    hint: 'القسمة كما تُكتب على الورقة، خطوة خطوة، بأعدادك أنت.',
    needs: 'ab',
    labels: { a: 'المقسوم', b: 'المقسوم عليه' },
    range: { a: [1, 9999], b: [2, 99] },
    load: () => import('./tools/PaperDivision'),
  },
  {
    id: 'bracket',
    lesson: null,
    icon: '📏',
    name: 'مسطرة الحصر',
    hint: 'ضع الألواح واحدًا بعد الآخر: كم لوحًا كاملًا يدخل؟ وكم لوحًا يلزم؟',
    needs: 'ab',
    labels: { a: 'الطول', b: 'طول اللوح' },
    range: { a: [1, 9999], b: [2, 999] },
    load: () => import('./tools/Bracket'),
  },
  {
    id: 'rules',
    lesson: null,
    icon: '💡',
    name: 'كاشف قابلية القسمة',
    hint: 'أدِر الأرقام كقفل: أيّ المصابيح يضيء؟',
    needs: 'a',
    labels: { a: 'العدد' },
    range: { a: [0, 9999], b: [1, 999] },
    load: () => import('./tools/Rules'),
  },
  {
    // a fraction of the student's own as a strip of b cells with a cells lit, and a piece of length k he drags along it:
    // where k divides both, the strip regroups and the fraction is written in pieces — facts only; neither the tile nor
    // the instrument names a key of its lesson
    id: 'strip',
    lesson: null,
    icon: '🎞️',
    name: 'شريط الكسر',
    hint: 'كسر من عندك على شريط مضاء: قطعة بطول تختاره، هل تقع مفاصلها حيث ينتهي الضوء وحيث ينتهي الشريط؟',
    needs: 'ab',
    labels: { a: 'البسط', b: 'المقام' },
    range: { a: [1, 999], b: [1, 999] },
    load: () => import('./tools/Strip'),
  },
  {
    // an area of the student's own laid as a square whose side his hand chooses: the tiles that do not fit, the empty
    // places; once he tried the greatest whole square and the next, the court is written — √a, or between two whole
    // numbers and to 0,01. It names the sign √ (the lab opens after the lesson): it is NOT safe before the lesson's keys
    id: 'court',
    lesson: null,
    icon: '🔲',
    name: 'ساحة العدد',
    hint: 'رتّب بلاطات ساحتك في مربّع بضلع تختاره: أيّ مربّع كامل يتّسع لها، وأين يقع ضلعها؟',
    needs: 'a',
    labels: { a: 'المساحة' },
    range: { a: [1, 400], b: [1, 400] },
    load: () => import('./tools/NumberCourt'),
  },
  {
    // a court of the student's own (a whole tiles), each tile cut into b × b small pieces, and a rod of p/b whose
    // numerator his hand sweeps: the platform holds p × p pieces, the court a × b × b — the drawing and the two counts say
    // which is more and by how many, and the nearest rod he reached is kept. Facts only: it names no key of its lesson
    id: 'piece',
    lesson: null,
    icon: '🟦',
    name: 'منصّة الكسر',
    hint: 'مقياس طوله كسر على ساحتك: قطّع البلاطة قطعًا صغيرة، وقارن ما تحمله المنصّة بما تحمله الساحة.',
    needs: 'ab',
    labels: { a: 'المساحة', b: 'المقام' },
    range: { a: [1, 50], b: [1, 12] },
    load: () => import('./tools/FractionPlatform'),
  },
];

export const toolById = (id) => TOOLS.find((t) => t.id === id) ?? null;

/**
 * What a student of `lesson` finds in the lab:
 *   mine     the instruments introduced by this very lesson;
 *   cabinet  [{ grade, name, lessons: [{ code, title, tools }] }] — every earlier lesson that has instruments, oldest grade first;
 *   all      mine + every instrument of the cabinet (what may ever be put on the bench).
 * `earlierOnly` (the lab opened BEFORE the lesson, by « عُدّة الانطلاق »): `mine` is empty — the lesson's own instruments
 * are neither listed nor in `all`.
 */
export function toolsFor(lesson, { earlierOnly = false } = {}) {
  if (!placeOf(lesson)) return { mine: [], cabinet: [], all: [] };
  const reached = TOOLS.filter((t) => isReached(t.lesson, lesson));
  const mine = earlierOnly ? [] : reached.filter((t) => t.lesson === lesson);
  const earlier = reached.filter((t) => t.lesson !== lesson);
  const cabinet = GRADES.map((grade) => {
    const codes = [...new Set(earlier.filter((t) => placeOf(t.lesson).grade === grade).map((t) => t.lesson))].sort(
      compareLessons,
    );
    return {
      grade,
      name: GRADE_NAMES[grade],
      lessons: codes.map((code) => ({
        code,
        title: getLessonById(code)?.title ?? code,
        tools: earlier.filter((t) => t.lesson === code),
      })),
    };
  }).filter((g) => g.lessons.length);
  return { mine, cabinet, all: [...mine, ...earlier] };
}
/** Does this lesson have a lab at all (at least one instrument reached)? */
export const hasLab = (lesson) => toolsFor(lesson).all.length > 0;

/** The pair of numbers a tool can show: the shared numbers, brought inside the tool's ranges. */
export function clampFor(tool, a, b) {
  const c = (v, [lo, hi]) => Math.max(lo, Math.min(hi, Math.round(Number(v) || lo)));
  return { a: c(a, tool.range.a), b: c(b, tool.range.b) };
}
