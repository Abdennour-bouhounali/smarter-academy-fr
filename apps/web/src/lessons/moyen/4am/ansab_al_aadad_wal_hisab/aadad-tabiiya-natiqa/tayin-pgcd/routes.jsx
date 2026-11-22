import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildLessonRoutes } from '../_unit/lessonRoutes';

// A v2 lesson (docs/architecture/LESSON_V2.md §2): its home is the game world; its module pages are deleted. The module
// addresses of its config still answer — each one redirects to the home (`retiredModules`), never a 404. No
// `loadKnowledge`: its knowledge is the one its pack declares (the world's « خريطة المعارف »), never a second map.
export default function tayinPgcdRoutes() {
  return buildLessonRoutes({
    config: LESSON_CONFIG,
    basePath: LESSON_BASE_PATH,
    retiredModules: true,
    loadIndex: () => import('./index.jsx'),
  });
}
