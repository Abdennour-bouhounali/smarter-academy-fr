/**
 * Les constantes communes aux leçons de l'unité 6 du manuel de 3AM « التناسبية » (pp. 86–101), générée leçon par leçon
 * (cycle moyen, phase 3, 2026-10-21 ; premières leçons générées : tanasub-tamthil-bayani puis nisba-miawiya-3am).
 * Tout ce qui est ici est lu du catalogue (units_3am_2026_2027.json, programme_3am_2026_2027.json).
 * Source : docs/sources/3am/unit6/extraction.json.
 */
export const UNIT_ID = 'tanasubiya-sura';
export const UNIT_TITLE = 'التناسبية';
export const CHAPTER_ID = 'tanasubiya_duwal';
export const CHAPTER_TITLE = 'ميدان الدوال وتنظيم المعطيات';
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
