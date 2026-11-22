/**
 * Les constantes communes aux leçons de l'unité 3 « الحساب الحرفي »
 * (4AM, manuel pp. 31–41). Tout ce qui est ici est lu du catalogue
 * (packages/core/curriculum/dz/units_4am_2026_2027.json) ou du manuel
 * (docs/sources/4am/unit3/extraction.json) ; rien n'est retapé dans une leçon.
 *
 * Le ميدان est celui choisi par le propriétaire (unité › placement), le
 * programme rangeant ces sujets dans « ميدان الحساب الحرفي ».
 */
export const UNIT_ID = 'hisab-harfi';
export const UNIT_TITLE = 'الحساب الحرفي';
export const CHAPTER_ID = 'ansab_al_aadad_wal_hisab';
export const CHAPTER_TITLE = 'ميدان أنساب الأعداد والحساب';
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
