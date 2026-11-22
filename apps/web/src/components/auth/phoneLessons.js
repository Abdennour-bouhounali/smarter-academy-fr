/**
 * THE PAGES A PHONE MAY OPEN (owner, 2026-11-16: « allow only the pages that are designed for mobile; for the others
 * display the message: open it on the large screen »). A lesson enters `PHONE_LESSONS` when its home has been designed
 * and walked on a phone: for the student the game world (played sideways), for the teacher his card. The lesson says it
 * itself — `phone: true` in its `lesson.pack.js` (LESSON_V2.md) — and the list is read from the generated lesson index.
 * What opens: the HOME of the lesson and, for the teacher, the memo and the lesson file. Its other pages — the class
 * session, the bank, the tracking, the knowledge card — keep the message (a v2 lesson has no module page: LESSON_V2.md §2).
 * No catalogue import here: this module is in the entry bundle (BUNDLE_BOUNDARIES.md); the lesson index already is.
 */
import { lessonsWithPack } from '../../lessons/registry';

export const PHONE_LESSONS = lessonsWithPack('phone');

/** The teacher's tools of a lesson that a phone may open (owner, 2026-11-16): the memo and the lesson file — to read and to note. */
/** …of a lesson whose TEACHER side exists (`board` in its pack): a lesson may open its world on a phone before its board is written. */
const TEACHER_PHONE_LESSONS = PHONE_LESSONS.filter((id) => lessonsWithPack('board').includes(id));
const TEACHER_PHONE_TOOLS = [/^\/enseignant\/cours\/([^/]+)\/memoire\/?$/, /^\/enseignant\/milaff\/([^/]+)\/?$/];

/** Is this address a page of a phone-ready lesson that was designed for a phone? */
export function isPhoneLessonPath(pathname) {
  const path = String(pathname ?? '');
  if (
    TEACHER_PHONE_TOOLS.some((tool) => TEACHER_PHONE_LESSONS.includes(decodeURIComponent(path.match(tool)?.[1] ?? '')))
  )
    return true;
  const parts = path.split('/').filter(Boolean);
  return parts[0] === 'courses' && PHONE_LESSONS.includes(parts[parts.length - 1]);
}

/** The ids of the lesson tools (`LessonToolsBar › lessonTools`) a phone opens; the others are shown as « على الحاسوب ». */
export const PHONE_TOOL_IDS = ['lesson', 'memo', 'file'];
