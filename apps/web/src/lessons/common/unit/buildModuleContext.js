/**
 * La fabrique du MODULE_CTX d'une leçon, commune à TOUTES les unités du
 * manuel. Chaque unité la lie à ses propres constantes dans son
 * `_unit/moduleContext.js` (une ligne) :
 *
 *   export const buildModuleContext = createModuleContextBuilder(UNIT_META);
 *
 * `unitMeta` : { UNIT_ID, UNIT_TITLE, CHAPTER_ID, LEVEL_ID, GRADE_ID, LEVEL_LABEL, GRADE_LABEL }
 * (les exports de `_unit/unitMeta.js`). Rien ici ne connaît une unité
 * particulière : une deuxième unité n'a pas de fabrique à recopier.
 */
export function createModuleContextBuilder(unitMeta) {
  const { UNIT_ID, UNIT_TITLE, CHAPTER_ID, LEVEL_ID, GRADE_ID, LEVEL_LABEL, GRADE_LABEL } = unitMeta;
  return function buildModuleContext(LESSON_CONFIG, LESSON_BASE_PATH) {
    const MODULE_CTX = {
      lessonId: LESSON_CONFIG.id,
      coursePath: LESSON_BASE_PATH,
      courseTitle: LESSON_CONFIG.title,
      chapter: LESSON_CONFIG.chapter,
      chapterTitle: LESSON_CONFIG.chapterTitle,
      // L'الوحدة du manuel — le GROUPE DE LEÇONS auquel celle-ci appartient,
      // à ne pas confondre avec le المجال (domaine) ni avec un المحور
      // (LESSON_DEVELOPMENT_GUIDE §2). Le fil d'Ariane d'un محور la nomme :
      // « الوحدة / الدرس / المحور ».
      unitId: UNIT_ID,
      unitTitle: UNIT_TITLE,
      unitPath: `/courses/${LEVEL_ID}/${GRADE_ID}/${CHAPTER_ID}/units/${UNIT_ID}`,
      levelLabel: LEVEL_LABEL,
      gradeLabel: GRADE_LABEL,
      levelId: LEVEL_ID,
      gradeId: GRADE_ID,
      totalModules: LESSON_CONFIG.modules.length,
      // Le PREMIER et le DERNIER module de la leçon. Le premier n'est pas
      // toujours 1 : une leçon qui ouvre par « أستعدّ » commence à 0, et le
      // déverrouillage séquentiel doit le savoir, sinon le module 0 attend un
      // module -1 qui n'existe pas et la leçon reste scellée.
      firstModuleNumber: LESSON_CONFIG.modules[0].number,
      // L'étape de chaque module, par numéro : ContentModule y lit celle du
      // module PRÉCÉDENT, pour qu'un diagnostic (`prerequisite_check`) ne
      // barre pas la route au module suivant.
      stageByNumber: Object.fromEntries(LESSON_CONFIG.modules.map((m) => [m.number, m.stage])),
      lastModuleNumber: LESSON_CONFIG.modules[LESSON_CONFIG.modules.length - 1].number,
      sequentialUnlock: LESSON_CONFIG.sequentialUnlock,
      // Le regard « focus » de l'élève (components/StudentFocus.jsx), activé leçon par leçon.
      studentView: LESSON_CONFIG.studentView,
    };
    const getNavLinks = (currentModuleNumber) => {
      const idx = LESSON_CONFIG.modules.findIndex((m) => m.number === currentModuleNumber);
      if (idx === -1) return { prevLink: null, nextLink: null };
      return {
        prevLink: idx > 0 ? LESSON_CONFIG.modules[idx - 1].path : LESSON_BASE_PATH,
        nextLink: idx < LESSON_CONFIG.modules.length - 1 ? LESSON_CONFIG.modules[idx + 1].path : null,
      };
    };
    return { MODULE_CTX, getNavLinks };
  };
}
