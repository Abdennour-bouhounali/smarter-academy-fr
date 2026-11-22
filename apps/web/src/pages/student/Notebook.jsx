/**
 * « Mon cahier » (كرّاسي) — les trois pages de l'espace des notes :
 *   /espace/cahier            retrouver, filtrer, ranger, imprimer
 *   /espace/cahier/revision   la révision active de la file « à revoir »
 *   /espace/cahier/:noteId    une note, dans le même éditeur que le cahier
 *
 * Le cahier FLOTTANT (NotebookProvider) reste l'outil pour écrire pendant la
 * leçon ; ces pages sont l'outil pour gérer ce qu'on a écrit.
 */
export { default } from '../../features/practice/notebook/space/NotebookSpace';
export { default as NotebookNotePage } from '../../features/practice/notebook/space/NoteDetail';
export { default as NotebookReviewPage } from '../../features/practice/notebook/space/ReviewSession';
