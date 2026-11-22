/**
 * « مذكّرة الدرس » WRITTEN for a lesson that has its board (owner, 2026-11-18: « the content must be updated: research
 * what a good one is, then update it »; CLASS_SESSION.md §2quater). The memo of the other lessons is still derived from
 * their modules; this one is authored, on the model good lesson plans share:
 *   a goal and OBSERVABLE success criteria · launch → explore → summarize · the students' likely answers and
 *   misconceptions ANTICIPATED · questions of two kinds prepared (to check where a student is, to push him forward) ·
 *   which answers to show on the board and in what order · what is written · a short check at the end · support and
 *   extension · and ONE page for the desk.
 * It describes the hour as « حصّة القسم » runs it (never the old « وضع القسم »). Every number is checked by a test.
 * Own wording: nothing is quoted from the textbook.
 * The memo of a lesson is in ITS folder (`board/memo.js`, named in its `lesson.pack.js`); here: the model's parts.
 */
import { lessonPackFlags } from '../../lessons/registry';
import { outcome as courtOutcome, rod as numberRod } from '../../lessons/common/gameworld/rootCourts/logic';

/** Has this lesson a WRITTEN memo? Read from its pack (`lesson.pack.js › board`): the memo is written with the script. */
export const hasBoardMemo = (lessonCode) => Boolean(lessonPackFlags(lessonCode).board);

/**
 * The parts of an authored memo, in the order of a teacher's work (the rail of the page). No « كرّاسي » part: the
 * teacher's own notes on the lesson live in « ملفّ الدرس », one tap away in the top bar (owner, 2026-11-18).
 */
export const MEMO_PARTS = [
  {
    id: 'before',
    label: 'قبل الحصّة',
    keys: [
      ['glance', 'الحصّة في صفحة'],
      ['criteria', 'الهدف ومؤشّرات النجاح'],
      ['openings', 'وضعيات الانطلاق'],
    ],
  },
  {
    id: 'during',
    label: 'أثناء الحصّة',
    keys: [
      ['phases', 'سير الحصّة'],
      ['anticipated', 'ما يُنتظر من التلاميذ'],
      ['sequence', 'ما يُعرض على السبّورة'],
    ],
  },
  {
    id: 'after',
    label: 'بعد الحصّة',
    keys: [
      ['written', 'الأثر الكتابي'],
      ['exit', 'تذكرة الخروج'],
      ['tiers', 'دعم وتعميق'],
    ],
  },
];
export const partKeys = () => MEMO_PARTS.flatMap((g) => g.keys.map(([k]) => k));

/**
 * The numbers of an opening situation, computed: how many fit, how many are left — for the drawing and the caption.
 * A `court` (a square court of « قصر الساحات »: area `a`, rods `b` and `alt`, numbers as text): what the platform built
 * on each rod does — `kind` ride / band / jam, `diff` the band or what sticks out, exact (`rootCourts/logic.js`); `r` is
 * that difference.
 */
export function openingFacts(o) {
  if (o.kind === 'court') {
    const try1 = (b) => {
      const out = courtOutcome(numberRod(String(b)), String(o.a));
      return {
        b: String(b),
        kind: out.kind,
        covers: out.covers,
        diff: out.diff,
        r: out.diff,
        exact: out.kind === 'ride',
      };
    };
    return { a: String(o.a), first: try1(o.b), second: o.alt != null ? try1(o.alt) : null };
  }
  const fit = (b) => ({ b, q: Math.floor(o.a / b), r: o.a % b, exact: o.a % b === 0 });
  return { a: o.a, first: fit(o.b), second: o.alt ? fit(o.alt) : null };
}
