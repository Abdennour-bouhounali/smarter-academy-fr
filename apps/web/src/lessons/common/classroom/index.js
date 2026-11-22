/**
 * MODE CLASSE — « Mode classe ».
 *
 *   <ClassroomPresentation scope="manipulation" title="…" entry="none">
 *     … votre contenu, qui peut poser <ClassroomEntryButton /> où il veut
 *     et lire useClassroomMode() pour adapter sa mise en page …
 *   </ClassroomPresentation>
 *
 * Voir docs/architecture/CLASSROOM_MODE.md.
 */
export { default as ClassroomPresentation } from './ClassroomPresentation';
export { default as ClassroomEntryButton } from './ClassroomEntryButton';
export { default as ClassroomFrame, ClassroomHidden } from './ClassroomFrame';
export { useClassroomMode } from './ClassroomContext';
