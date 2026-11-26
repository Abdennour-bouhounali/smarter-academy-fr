/**
 * THE PACK of the lesson — the ONE place where it says what it gives the platform beyond its modules
 * (docs/architecture/LESSON_V2.md §1). `scripts/generate-lesson-index.mjs` reads this file and writes its flags into
 * `lessons/lessonIndex.generated.json`; the content stays behind each `() => import()`.
 * A data module: no static import (Node reads it).
 */
export const LESSON_PACK = {
  id: 'fraction-irreductible',
  // PAUSED (owner, 2026-11-18): phones are not built for now — the lesson is for the laptop and the tablet.
  phone: false,
  // the student's game world: the unit's world, played with this lesson's story and content
  world: { id: 'divisor-isles', content: () => import('./world').then((m) => m.lesson) },
  // the lesson's knowledge sheets — the board's knowledge card, the rule the exam coach reminds (LESSON_V2.md §2)
  knowledge: () => import('./world/knowledge.js').then((m) => m.LESSON_KNOWLEDGE),
  // the exam coach: the knowledge sheet behind each learning point (savoir-faire) of the lesson (world/evidence.js ›
  // POINTS) — P1 ← the fraction that stays, P2 ← the struck prime factors, P3 ← a result given irreducible, P4 ← the PGCD
  coach: { P1: 'irreductible', P2: 'simplifier-facteurs', P3: 'resultat-irreductible', P4: 'diviser-par-le-pgcd' },
  revision: () => import('./revision.js').then((m) => m.REVISION),
  // the class session: the lesson on the board and its written memo
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
