/**
 * THE PACK of the lesson — the ONE place where it says what it gives the platform beyond its modules
 * (docs/architecture/LESSON_V2.md). `scripts/generate-lesson-index.mjs` reads this file and writes its flags into
 * `lessons/lessonIndex.generated.json`; the content stays behind each `() => import()`.
 * A data module: no static import (Node reads it).
 */
export const LESSON_PACK = {
  id: 'bahth-pgcd',
  // PAUSED (owner, 2026-11-18): phones are not built for now — the lesson is for the laptop and the tablet.
  phone: false,
  // the student's game world: the unit's world, played with this lesson's story and content
  world: { id: 'divisor-isles', content: () => import('./world').then((m) => m.lesson) },
  // the lesson's knowledge sheets — « بطاقة المعارف » on the board, the rule the exam coach reminds.
  // They live in the world's folder and are the lesson's ONLY knowledge (the world's « خريطة المعارف » too): the old root
  // `knowledge.jsx` / `knowledgeGraph.js` were deleted with the old version (LESSON_V2.md §2).
  knowledge: () => import('./world/knowledge.js').then((m) => m.LESSON_KNOWLEDGE),
  // « مدرّب الامتحان »: the knowledge sheet behind each الكفاءة of the lesson (world/evidence.js › POINTS, one to one)
  coach: { P1: 'farq-yabqi', P2: 'khawarizmiyat-al-tarh', P3: 'baqi-yabqi', P4: 'iqlidis', P5: 'aqall-khutuwat' },
  // « حصّة القسم »: the lesson on the board and its written memo
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
