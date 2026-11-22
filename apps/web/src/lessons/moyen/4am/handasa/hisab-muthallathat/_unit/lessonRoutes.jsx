import { PRINT_SUBJECT } from './unitMeta';
import { createLessonRoutesBuilder } from '../../../../../common/unit/buildLessonRoutes';

/** Les routes d'une leçon de l'unité — la fabrique est commune (common/unit/buildLessonRoutes.jsx). */
export const buildLessonRoutes = createLessonRoutesBuilder({ printSubject: PRINT_SUBJECT });
