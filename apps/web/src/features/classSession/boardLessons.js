/**
 * The lessons whose class has ITS OWN BOARD — « la séance en classe » with a script of the lesson (CLASS_SESSION.md §5ter).
 *
 * Owner, 2026-11-18: for such a lesson « no need for the older version » — the old « mode classe » (Classroom Mode of the
 * lesson page) no longer exists there: no entry button on the lesson page nor on its modules, no « Présenter » of a lab or a
 * test inside it, and every door that used to open it (the teacher's catalogue card, the teacher's memo) opens « la séance en classe ».
 * The other lessons keep « mode classe » until each gets its script. A lesson has its board the day its script and its
 * memo are written and named in ITS pack (`lesson.pack.js › board`, LESSON_V2.md): this list is read from the generated
 * lesson index, never typed here.
 *
 * Deliberately tiny: the lesson runtime and the teacher's catalogue read it.
 */
import { lessonsWithPack } from '../../lessons/registry';

export const BOARD_LESSONS = Object.freeze(lessonsWithPack('board'));

export const hasClassBoard = (lessonId) => BOARD_LESSONS.includes(lessonId);

/**
 * The lessons that are v2 (a game world in their pack) — board or not. Their module pages are deleted, so nothing of the
 * old lesson page may be offered to their teacher (owner, 2026-11-20, on a unit's last lesson, which has its world before
 * its board): the teacher's own bank instead of the old hub, and only the tools that have content.
 */
const WORLD_LESSONS = Object.freeze(lessonsWithPack('world'));
const hasWorld = (lessonId) => WORLD_LESSONS.includes(lessonId);

/** The teacher's own exercise bank (read, show on the board, print): every lesson that has its board or its world. */
export const hasTeacherBank = (lessonId) => hasClassBoard(lessonId) || hasWorld(lessonId);

/**
 * Which tools of the common header have CONTENT for this lesson (owner, 2026-11-20: « display only the buttons that
 * has the content »). A v2 lesson without its board has no script, no memo, no lesson file and no knowledge card
 * yet: its header is the lesson, its bank and « le suivi de la classe » — the tracking reads what the students did on the bank,
 * which every lesson has (owner, the same day: « the teacher must track the work of his student »). Every other lesson
 * keeps every tool.
 */
const KNOWLEDGE_LESSONS = Object.freeze(lessonsWithPack('knowledge'));
export const toolHasContent = (lessonId, toolId) => {
  if (!hasWorld(lessonId)) return true;
  // « la fiche de connaissances » reads the lesson's own knowledge: a unit's last lesson has none (the unit's rules are its recap)
  if (toolId === 'card') return hasClassBoard(lessonId) && KNOWLEDGE_LESSONS.includes(lessonId);
  return hasClassBoard(lessonId) || ['lesson', 'bank', 'track'].includes(toolId);
};

/** The four moments of the hour, in order (the set-up screen and the teacher's card show them the same way). */
export const MOMENTS = Object.freeze(['start', 'revise', 'lesson', 'end']);

/** The class session of a lesson; `moment` opens it directly on one moment of the hour. */
export const classSessionPath = (lessonId, moment = null) =>
  `/enseignant/seance/${encodeURIComponent(lessonId)}${moment && MOMENTS.includes(moment) ? `?moment=${moment}` : ''}`;

/** « le suivi de la classe »: the class on this lesson, student by student — a tab of the set-up screen of the class session. */
export const classTrackingPath = (lessonId) => `/enseignant/suivi/${encodeURIComponent(lessonId)}`;

/** « la fiche de connaissances » of the lesson on the board of the class: a quick revision with the whole class. */
export const classCardPath = (lessonId) => `/enseignant/carte/${encodeURIComponent(lessonId)}`;

/** Is this lesson path (the lesson page or one of its modules) the path of a lesson that has its board? */
export const boardLessonOfPath = (path) =>
  typeof path === 'string' ? (BOARD_LESSONS.find((id) => path.split(/[/?#]/).includes(id)) ?? null) : null;
