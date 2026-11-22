import { PRINT_SUBJECT } from './unitMeta';
import { createLessonRoutesBuilder } from '../../../../../common/unit/buildLessonRoutes';

/**
 * Les routes d'une leçon de l'unité (sommaire + un module par fichier
 * `modules/Module<NN>*.jsx`). La fabrique est commune à toutes les unités
 * (common/unit/buildLessonRoutes.jsx) ; l'unité n'y apporte que sa matière.
 */
export const buildLessonRoutes = createLessonRoutesBuilder({ printSubject: PRINT_SUBJECT });
