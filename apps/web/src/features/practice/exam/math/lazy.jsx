import { lazy, Suspense } from 'react';

/**
 * MathLive n'entre que dans un lot À PART, chargé par la première feuille
 * d'examen (docs/architecture/BUNDLE_BOUNDARIES.md §6). En attendant, un trait
 * vide de la même place — jamais un saut de mise en page.
 */
const ExamMathFieldImpl = lazy(() => import('./ExamMathField'));
const MathLinesEditorImpl = lazy(() => import('./MathLinesEditor'));

const Placeholder = ({ tall = false }) => (
  <span className={`block w-full border-b-2 border-dotted border-slate-300 ${tall ? 'h-16' : 'h-9'}`} aria-hidden="true" />
);

export function LazyExamMathField(props) {
  return <Suspense fallback={<Placeholder />}><ExamMathFieldImpl {...props} /></Suspense>;
}

export function LazyMathLinesEditor(props) {
  return <Suspense fallback={<Placeholder tall />}><MathLinesEditorImpl {...props} /></Suspense>;
}
