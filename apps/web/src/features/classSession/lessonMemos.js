/**
 * « la fiche du professeur » WRITTEN for a lesson that has its board (owner, 2026-11-18: « the content must be updated: research
 * what a good one is, then update it »; CLASS_SESSION.md §2quater). The memo of the other lessons is still derived from
 * their modules; this one is authored, on the model good lesson plans share:
 *   a goal and OBSERVABLE success criteria · launch → explore → summarize · the students' likely answers and
 *   misconceptions ANTICIPATED · questions of two kinds prepared (to check where a student is, to push him forward) ·
 *   which answers to show on the board and in what order · what is written · a short check at the end · support and
 *   extension · and ONE page for the desk.
 * It describes the hour as « la séance en classe » runs it (never the old « mode classe »). Every number is checked by a test.
 * Own wording: nothing is quoted from the textbook.
 * The memo of a lesson is in ITS folder (`board/memo.js`, named in its `lesson.pack.js`); here: the model's parts.
 */
import { lessonPackFlags } from '../../lessons/registry';
import { outcome as courtOutcome, rod as numberRod } from '../../lessons/common/gameworld/rootCourts/logic';

/** Has this lesson a WRITTEN memo? Read from its pack (`lesson.pack.js › board`): the memo is written with the script. */
export const hasBoardMemo = (lessonCode) => Boolean(lessonPackFlags(lessonCode).board);

/**
 * The parts of an authored memo, in the order of a teacher's work (the rail of the page). No « Mon cahier » part: the
 * teacher's own notes on the lesson live in « le dossier de la leçon », one tap away in the top bar (owner, 2026-11-18).
 */
export const MEMO_PARTS = [
  {
    id: 'before',
    label: 'Avant la séance',
    keys: [
      ['glance', 'La séance en une page'],
      ['criteria', 'L’objectif et les critères de réussite'],
      ['openings', 'Les situations de départ'],
    ],
  },
  {
    id: 'during',
    label: 'Pendant la séance',
    keys: [
      ['phases', 'Le déroulement'],
      ['anticipated', 'Ce que les élèves vont proposer'],
      ['sequence', 'Ce qui passe au tableau'],
    ],
  },
  {
    id: 'after',
    label: 'Après la séance',
    keys: [
      ['written', 'La trace écrite'],
      ['exit', 'Le ticket de sortie'],
      ['tiers', 'Soutien et approfondissement'],
    ],
  },
];
export const partKeys = () => MEMO_PARTS.flatMap((g) => g.keys.map(([k]) => k));

/**
 * The numbers of an opening situation, computed: how many fit, how many are left — for the drawing and the caption.
 * A `court` (a square court of the `rootCourts` world: area `a`, rods `b` and `alt`, numbers as text): what the platform built
 * on each rod does — `kind` ride / band / jam, `diff` the band or what sticks out, exact (`rootCourts/logic.js`); `r` is
 * that difference. A GEOMETRY opening carries its own `figure` (a bank sheet's `statement.figure`): no numbers to lay.
 */
export function openingFacts(o) {
  // a geometry opening is its `figure` (drawn by StatementFigure): nothing is laid or left
  if (o.figure && o.a == null) return { a: null, first: { r: null, exact: null }, second: null };
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
