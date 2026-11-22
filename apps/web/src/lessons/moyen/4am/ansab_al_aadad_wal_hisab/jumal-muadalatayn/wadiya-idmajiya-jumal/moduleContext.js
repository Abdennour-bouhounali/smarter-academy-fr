import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildModuleContext } from '../_unit/moduleContext';
export const { MODULE_CTX, getNavLinks } = buildModuleContext(LESSON_CONFIG, LESSON_BASE_PATH);
