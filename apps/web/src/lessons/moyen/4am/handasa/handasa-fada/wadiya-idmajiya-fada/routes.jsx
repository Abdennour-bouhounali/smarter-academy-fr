import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildLessonRoutes } from '../_unit/lessonRoutes';

const MODULE_FILES = import.meta.glob('./modules/Module*.jsx');

export default function wadiyaIdmajiyaFadaRoutes() {
  return buildLessonRoutes({
    config: LESSON_CONFIG, basePath: LESSON_BASE_PATH, moduleFiles: MODULE_FILES,
    loadKnowledge: () => import('./knowledge'), loadIndex: () => import('./index.jsx'),
  });
}
