/**
 * Les constantes communes aux leçons de l'unité 11 du manuel de 1AM « السطوح المستوية : الأطوال، المحيطات، المساحات »
 * (pp. 147–160 ; PDF 147–161), générée leçon par leçon (cycle moyen, phase 3, 2026-10-15 ; première leçon générée :
 * masahat-muhit-sath). Tout ce qui est ici est lu du catalogue (units_1am_2026_2027.json, programme_1am_2026_2027.json).
 * Source : docs/sources/1am/unit11/extraction.json. Le ميدان est celui du programme (« ميدان الأنشطة الهندسية », `handasa`,
 * مقطع 1am.m2 ; la leçon des unités de mesure relève de 1am.m6).
 */
export const UNIT_ID = 'sutuh-masahat-muhitat';
export const UNIT_TITLE = 'السطوح المستوية: الأطوال، المحيطات، المساحات';
export const CHAPTER_ID = 'handasa';
export const CHAPTER_TITLE = 'ميدان الأنشطة الهندسية';
export const LEVEL_ID = 'moyen';
export const GRADE_ID = '1am';
export const LEVEL_LABEL = 'التعليم المتوسط';
export const GRADE_LABEL = 'السنة الأولى متوسط';
export const PRINT_SUBJECT = 'الرياضيات · السنة الأولى متوسط';
export const BASE = `/courses/${LEVEL_ID}/${GRADE_ID}/${CHAPTER_ID}`;

/** La source d'un élément du manuel : `src(<elementId>, <page>, <section>, <numéro>)`. */
export const src = (elementId, page, section, number) => ({
  type: 'textbook', elementId, page, ...(section ? { section } : {}), ...(number != null ? { number } : {}),
});
/** Un ajout de la plateforme, toujours déclaré comme tel. */
export const addition = (reason) => ({ type: 'platform_addition', reason });
