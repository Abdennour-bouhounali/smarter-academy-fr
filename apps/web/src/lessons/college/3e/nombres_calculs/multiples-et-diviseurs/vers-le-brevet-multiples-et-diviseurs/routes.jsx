import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildLessonRoutes } from '../../../../../common/lessonRoutes';

// The unit's last lesson (kind `synthesis`): its home is the rapid revision of the unit, not a game world.
export default function versLeBrevetMultiplesEtDiviseursRoutes() {
  return buildLessonRoutes({
    config: LESSON_CONFIG,
    basePath: LESSON_BASE_PATH,
    loadIndex: () => import('./index.jsx'),
  });
}
