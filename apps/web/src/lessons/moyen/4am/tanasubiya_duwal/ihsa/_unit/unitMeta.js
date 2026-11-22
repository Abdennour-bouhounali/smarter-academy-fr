/**
 * Les constantes communes aux leçons de l'unité 8 « الإحصاء »
 * (4AM, manuel pp. 91–101). Tout ce qui est ici est lu du catalogue
 * (packages/core/curriculum/dz/units_4am_2026_2027.json) ou du manuel
 * (docs/sources/4am/unit8/extraction.json) ; rien n'est retapé dans une leçon.
 *
 * Le ميدان est le ميدان d'AFFICHAGE du propriétaire « ميدان التناسبية والدوال » (units ›
 * ownerChapters), comme les unités 6 et 7 ; le programme range la statistique dans
 * « ميدان تنظيم المعطيات » (unité › placement).
 */
export const UNIT_ID = 'ihsa';
export const UNIT_TITLE = 'الإحصاء';
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
