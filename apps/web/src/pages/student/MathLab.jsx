/**
 * Le مختبر الرياضيات (Math Lab) — les pages de l'espace élève :
 *   /espace/atelier                          l'accueil : instruments, « أعمالي »
 *   /espace/atelier/:toolSlug                un document neuf dans un instrument
 *   /espace/atelier/:toolSlug/:documentId    un document enregistré
 *
 * Tout vit dans features/mathlab/ ; ce fichier n'est que la porte des
 * routes, comme Notebook.jsx pour le cahier. Voir docs/architecture/MATH_LAB.md.
 */
export { default } from '../../features/mathlab/home/MathLabHome';
export { default as MathLabToolPage } from '../../features/mathlab/MathLabToolPage';
