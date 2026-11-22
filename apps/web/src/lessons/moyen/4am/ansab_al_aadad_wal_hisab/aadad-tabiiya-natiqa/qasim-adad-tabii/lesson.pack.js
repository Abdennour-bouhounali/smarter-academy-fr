/**
 * THE PACK of the lesson — the ONE place where it says what it gives the platform beyond its modules
 * (docs/architecture/LESSON_V2.md). No list elsewhere names this lesson: `scripts/generate-lesson-index.mjs` reads this
 * file and writes its flags into `lessons/lessonIndex.generated.json`; the content stays behind each `() => import()`.
 * A data module: no static import (Node reads it).
 */
export const LESSON_PACK = {
  id: 'qasim-adad-tabii',
  // PAUSED (owner, 2026-11-18): phones are not built for now — the lesson is for the laptop and the tablet.
  // Its home was walked on a phone held sideways before the pause (GAME_WORLD.md « On a phone »); set `true` when phones resume.
  phone: false,
  // the student's game world: the WORLD (a mechanic of `gameworld/`) played with this lesson's content
  world: { id: 'divisor-isles', content: () => import('./world').then((m) => m.lesson) },
  // the lesson's knowledge sheets — « بطاقة المعارف » on the board, the rule the exam coach reminds
  knowledge: () => import('./knowledge.jsx').then((m) => m.LESSON_KNOWLEDGE),
  // « مدرّب الامتحان »: the knowledge sheet behind each الكفاءة of the lesson
  coach: { P1: 'qasim-baqi', P2: 'qasim-jidaa', P3: 'siyagh-mutakafia', P4: 'wahid-wa-nafsuh' },
  // « حصّة القسم »: the lesson on the board and its written memo
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
