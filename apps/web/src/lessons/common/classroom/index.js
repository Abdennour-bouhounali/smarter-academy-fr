/**
 * MODE CLASSE — « وضع القسم ».
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
export { default as ClassroomPaged } from './ClassroomPaged';
export { useClassroomStage } from './useClassroomStage';
export { useClassroomMode } from './ClassroomContext';
