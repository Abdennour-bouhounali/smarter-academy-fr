/**
 * Les constantes communes aux leçons de l'unité 3 du manuel de 3AM « القوى ذات أسس نسبية صحيحة » (pp. 38–53), générée
 * leçon par leçon (cycle moyen, phase 3, 2026-10-21 ; première leçon générée : quwat-adad-nisbi — la première leçon de 3AM).
 * Tout ce qui est ici est lu du catalogue (units_3am_2026_2027.json, programme_3am_2026_2027.json).
 * Source : docs/sources/3am/unit3/extraction.json.
 */
export const UNIT_ID = 'quwa-nisbiya';
export const UNIT_TITLE = 'القوى ذات أسس نسبية صحيحة';
export const CHAPTER_ID = 'ansab_al_aadad_wal_hisab';
export const CHAPTER_TITLE = 'ميدان الأنشطة العددية';
export const LEVEL_ID = 'moyen';
export const GRADE_ID = '3am';
export const LEVEL_LABEL = 'التعليم المتوسط';
export const GRADE_LABEL = 'السنة الثالثة متوسط';
export const PRINT_SUBJECT = 'الرياضيات · السنة الثالثة متوسط';
export const BASE = `/courses/${LEVEL_ID}/${GRADE_ID}/${CHAPTER_ID}`;

/** La source d'un élément du manuel : `src(<elementId>, <page>, <section>, <numéro>)`. */
export const src = (elementId, page, section, number) => ({
  type: 'textbook', elementId, page, ...(section ? { section } : {}), ...(number != null ? { number } : {}),
});
/** Un ajout de la plateforme, toujours déclaré comme tel. */
export const addition = (reason) => ({ type: 'platform_addition', reason });
