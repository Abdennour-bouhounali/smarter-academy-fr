import * as UNIT_META from './unitMeta';
import { createModuleContextBuilder } from '../../../../../common/unit/buildModuleContext';

/** Le MODULE_CTX et getNavLinks d'une leçon de l'unité, construits depuis son LESSON_CONFIG. */
export const buildModuleContext = createModuleContextBuilder(UNIT_META);
