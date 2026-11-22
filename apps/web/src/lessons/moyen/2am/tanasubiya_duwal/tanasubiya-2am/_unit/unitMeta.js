/**
 * Les constantes communes aux leçons de l'unité 5 du manuel de 2AM « التناسبية » (pp. 70–85), générée leçon par leçon
 * (cycle moyen, phase 3, 2026-10-21 ; première leçon : rabi-mutanasib). Tout ce qui est ici est lu du catalogue
 * (units_2am_2026_2027.json, programme_2am_2026_2027.json). Source : docs/sources/2am/unit5/extraction.json. Le ميدان est celui du
 * programme de 2AM (« ميدان الدوال وتنظيم المعطيات », `tanasubiya_duwal`, مقطع 2am.m6) — chaque année garde ses noms (D13).
 */
export const UNIT_ID = 'tanasubiya-2am';
export const UNIT_TITLE = 'التناسبية';
export const CHAPTER_ID = 'tanasubiya_duwal';
export const CHAPTER_TITLE = 'ميدان الدوال وتنظيم المعطيات';
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
