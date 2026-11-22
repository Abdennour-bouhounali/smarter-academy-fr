/**
 * La police de la feuille d'examen — Amiri, un naskh proche de la composition
 * LaTeX arabe des sujets et des annales. Chargée À LA DEMANDE (première feuille
 * affichée) et pas dans index.html : seules les séances de pratique au format
 * BEM la paient (docs/architecture/BUNDLE_BOUNDARIES.md). Sans réseau, la pile
 * de repli (`.sa-exam-paper`, index.css) prend le relais.
 */
const HREF = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap';

export function ensureExamFont() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-exam-font]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = HREF;
  link.dataset.examFont = '';
  document.head.appendChild(link);
}
