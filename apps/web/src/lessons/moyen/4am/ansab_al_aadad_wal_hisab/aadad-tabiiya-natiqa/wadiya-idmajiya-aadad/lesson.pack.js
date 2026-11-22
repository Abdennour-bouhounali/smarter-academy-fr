/**
 * THE PACK of « أدمج تعلّماتي » (unit 1) — the ONE place where it says what it gives the platform
 * (docs/architecture/LESSON_V2.md). `scripts/generate-lesson-index.mjs` reads this file and writes its flags into
 * `lessons/lessonIndex.generated.json`; the content stays behind each `() => import()`.
 * A data module: no static import (Node reads it).
 */
export const LESSON_PACK = {
  id: 'wadiya-idmajiya-aadad',
  // PAUSED (owner, 2026-11-18): phones are not built for now — the lesson is for the laptop.
  phone: false,
  // the LAST lesson of the unit is not a lesson of keys: its world is the island of the missions
  // (docs/reports/INTEGRATION_LESSON_PLAN.md), played with this lesson's situations and its bank
  world: { id: 'mission-isle', content: () => import('./world').then((m) => m.lesson) },
  // « حصّة القسم »: the hour on the board IS a mission (one per hour, `board/script.js`), and its written memo
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
