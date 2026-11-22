/**
 * Les constantes communes aux leçons de l'unité 12 « الأشعة في معلم »
 * (4AM, manuel pp. 139–149). Tout ce qui est ici est lu du catalogue
 * (packages/core/curriculum/dz/units_4am_2026_2027.json) ou du manuel
 * (docs/sources/4am/unit12/extraction.json) ; rien n'est retapé dans une leçon.
 *
 * Le ميدان est celui du PROGRAMME, « ميدان الهندسة » (`handasa`, sujet `maalam`), sans `placement` :
 * la quatrième unité de géométrie, sur les vecteurs de l'unité 11 (packages/core/arithmetic/vectors.js).
 */
export const UNIT_ID = 'ashia-maalam';
export const UNIT_TITLE = 'الأشعة في معلم';
export const CHAPTER_ID = 'handasa';
export const CHAPTER_TITLE = 'ميدان الهندسة';
export const LEVEL_ID = 'moyen';
export const GRADE_ID = '4am';
export const LEVEL_LABEL = 'التعليم المتوسط';
export const GRADE_LABEL = 'السنة الرابعة متوسط';
export const PRINT_SUBJECT = 'الرياضيات · السنة الرابعة متوسط';
export const BASE = `/courses/${LEVEL_ID}/${GRADE_ID}/${CHAPTER_ID}`;

/** La source d'un élément du manuel : `src(<elementId>, <page>, <section>, <numéro>)`. */
export const src = (elementId, page, section, number) => ({
  type: 'textbook', elementId, page, ...(section ? { section } : {}), ...(number != null ? { number } : {}),
});
/** Un ajout de la plateforme, toujours déclaré comme tel. */
export const addition = (reason) => ({ type: 'platform_addition', reason });
