/**
 * Les constantes communes aux leçons de l'unité 6 du manuel de 1AM « الحساب الحرفي » (pp. 77–88), générée leçon par leçon (cycle moyen,
 * phase 3, 1AM paire 2 B, 2026-10-30). Tout ce qui est ici est lu du catalogue (units_1am_2026_2027.json, programme_1am_2026_2027.json).
 * Source : docs/sources/1am/unit6/extraction.json.
 */
export const UNIT_ID = 'ibarat-harfiya';
export const UNIT_TITLE = 'الحساب الحرفي';
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
