/**
 * Les constantes communes aux leçons de l'unité 2 du manuel de 1AM « الحساب على الأعداد الطبيعية والأعداد العشرية:
 * الجمع والطرح » (pp. 23–34). Première unité de 1AM générée (cycle moyen, phase 3, 2026-10-14). Tout ce qui est ici
 * est lu du catalogue (units_1am_2026_2027.json, programme_1am_2026_2027.json) ; rien n'est retapé dans une leçon.
 * Source : docs/sources/1am/unit2/extraction.json.
 */
export const UNIT_ID = 'jam-tarh-ashriya';
export const UNIT_TITLE = 'الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح';
export const CHAPTER_ID = 'ansab_al_aadad_wal_hisab';
export const CHAPTER_TITLE = 'ميدان الأنشطة العددية';
export const LEVEL_ID = 'moyen';
export const GRADE_ID = '1am';
export const LEVEL_LABEL = 'التعليم المتوسط';
export const GRADE_LABEL = 'السنة الأولى متوسط';
export const PRINT_SUBJECT = 'الرياضيات · السنة الأولى متوسط';
export const BASE = `/courses/${LEVEL_ID}/${GRADE_ID}/${CHAPTER_ID}`;

/** La source d'un élément du manuel : `src(<elementId>, <page>, <section>, <numéro>)`. */
export const src = (elementId, page, section, number) => ({
  type: 'textbook', elementId, page, ...(section ? { section } : {}), ...(number != null ? { number } : {}),
});
/** Un ajout de la plateforme, toujours déclaré comme tel. */
export const addition = (reason) => ({ type: 'platform_addition', reason });
