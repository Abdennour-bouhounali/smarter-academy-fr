import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildLessonRoutes } from '../../../../../common/lessonRoutes';

// A v2 lesson (docs/architecture/LESSON_V2.md §2): its home is the game world; it has no module page. The module
// addresses of its config still answer — each one redirects to the home, never a 404. Its knowledge is the one its pack
// declares (the world's « carte des connaissances »), never a second map.
export default function multiplesEtDiviseursCommunsRoutes() {
  return buildLessonRoutes({
    config: LESSON_CONFIG,
    basePath: LESSON_BASE_PATH,
    loadIndex: () => import('./index.jsx'),
  });
}
