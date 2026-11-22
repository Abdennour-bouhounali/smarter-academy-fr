/**
 * Les constantes communes aux leçons de l'unité 6 « الدالة الخطية والتناسبية »
 * (4AM, manuel pp. 65–76). Tout ce qui est ici est lu du catalogue
 * (packages/core/curriculum/dz/units_4am_2026_2027.json) ou du manuel
 * (docs/sources/4am/unit6/extraction.json) ; rien n'est retapé dans une leçon.
 *
 * Le ميدان est un ميدان d'AFFICHAGE décidé par le propriétaire (units › ownerChapters,
 * 2026-10-02) ; le programme range le sujet « الدوال الخطية » dans « ميدان الحساب الحرفي »
 * (unité › placement).
 */
export const UNIT_ID = 'tanasubiya-dala-khattiya';
export const UNIT_TITLE = 'الدالة الخطية والتناسبية';
export const CHAPTER_ID = 'tanasubiya_duwal';
export const CHAPTER_TITLE = 'ميدان التناسبية والدوال';
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
