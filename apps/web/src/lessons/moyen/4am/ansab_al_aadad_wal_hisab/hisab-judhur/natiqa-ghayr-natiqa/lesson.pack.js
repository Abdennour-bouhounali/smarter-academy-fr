/**
 * THE PACK of the lesson — the ONE place where it says what it gives the platform beyond its modules
 * (docs/architecture/LESSON_V2.md). `scripts/generate-lesson-index.mjs` reads this file and writes its flags into
 * `lessons/lessonIndex.generated.json`; the content stays behind each `() => import()`.
 * A data module: no static import (Node reads it).
 */
export const LESSON_PACK = {
  id: 'natiqa-ghayr-natiqa',
  // PAUSED (owner, 2026-11-18): phones are not built for now — the lesson is for the laptop and the tablet.
  phone: false,
  // the student's game world « قصر الساحات »: the unit's world, played with this lesson's story and content
  world: { id: 'root-courts', content: () => import('./world').then((m) => m.lesson) },
  // the lesson's knowledge sheets — « بطاقة المعارف » on the board, the rule the exam coach reminds.
  // They live in the world's folder and are the lesson's ONLY knowledge (the world's « خريطة المعارف » too): the old root
  // `knowledge.jsx` / `knowledgeGraph.js` were deleted with the old version (LESSON_V2.md §2).
  knowledge: () => import('./world/knowledge.js').then((m) => m.LESSON_KNOWLEDGE),
  // « مدرّب الامتحان »: the knowledge sheet behind each الكفاءة of the lesson. The catalogue gives this lesson THREE
  // الكفاءات: P1 (saying whether a root is rational) and P2 (the roots of squares of rationals) read the 🧩 sheet — a
  // root is rational exactly when the area is a square of a rational; P3 (a root that is not rational, and its
  // approximate values) reads the ♾️ sheet. The 🎯 sheet (the rounded value) is reached from the knowledge map.
  coach: { P1: 'murabba-natiq', P2: 'murabba-natiq', P3: 'la-kasr-yarkab' },
  // « حصّة القسم »: the lesson on the board and its written memo
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
