/**
 * Les constantes communes aux leçons de l'unité 11 du manuel de 3AM « خاصية فيثاغورس، جيب تمام زاوية » (pp. 166–181 ; PDF 168–183),
 * générée leçon par leçon (cycle moyen, phase 3, 2026-10-20 ; première leçon générée : khassiyat-fitaghuras). Tout ce qui est ici est
 * lu du catalogue (units_3am_2026_2027.json, programme_3am_2026_2027.json). Source : docs/sources/3am/unit11/extraction.json. Le ميدان
 * est celui du programme de 3AM (« ميدان الأنشطة الهندسية », `handasa`, مقطع 3am.m4) — chaque année garde ses noms (D13).
 */
export const UNIT_ID = 'fitaghuras-jayb-tamam';
export const UNIT_TITLE = 'خاصية فيثاغورس، جيب تمام زاوية';
export const CHAPTER_ID = 'handasa';
export const CHAPTER_TITLE = 'ميدان الأنشطة الهندسية';
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
