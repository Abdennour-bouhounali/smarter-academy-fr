/**
 * Les constantes communes aux leçons de l'unité 2 du manuel de 3AM « العمليات على الكسور والأعداد الناطقة » (pp. 22–36), générée
 * leçon par leçon (cycle moyen, phase 3, 2026-10-25 ; première leçon générée : maqlub-qismat-kasrayn, qui SEMENCE l'unité).
 * Tout ce qui est ici est lu du catalogue (units_3am_2026_2027.json, programme_3am_2026_2027.json).
 * Source : docs/sources/3am/unit2/extraction.json.
 */
export const UNIT_ID = 'kusur-natiqa';
export const UNIT_TITLE = 'العمليات على الكسور والأعداد الناطقة';
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
