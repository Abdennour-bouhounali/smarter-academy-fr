/**
 * Les constantes communes aux leçons de l'unité 3 du manuel de 2AM « الأعداد النسبية » (pp. 38–53), générée
 * leçon par leçon (cycle moyen, phase 3, 2026-10-21 ; première leçon : muqarana-nisbiya). Tout ce qui est ici est lu
 * du catalogue (units_2am_2026_2027.json, programme_2am_2026_2027.json). Source : docs/sources/2am/unit3/extraction.json.
 */
export const UNIT_ID = 'adad-nisbiya-2';
export const UNIT_TITLE = 'الأعداد النسبية';
export const CHAPTER_ID = 'ansab_al_aadad_wal_hisab';
export const CHAPTER_TITLE = 'ميدان الأنشطة العددية';
export const LEVEL_ID = 'moyen';
export const GRADE_ID = '2am';
export const LEVEL_LABEL = 'التعليم المتوسط';
export const GRADE_LABEL = 'السنة الثانية متوسط';
export const PRINT_SUBJECT = 'الرياضيات · السنة الثانية متوسط';
export const BASE = `/courses/${LEVEL_ID}/${GRADE_ID}/${CHAPTER_ID}`;

/** La source d'un élément du manuel : `src(<elementId>, <page>, <section>, <numéro>)`. */
export const src = (elementId, page, section, number) => ({
  type: 'textbook', elementId, page, ...(section ? { section } : {}), ...(number != null ? { number } : {}),
});
/** Un ajout de la plateforme, toujours déclaré comme tel. */
export const addition = (reason) => ({ type: 'platform_addition', reason });
