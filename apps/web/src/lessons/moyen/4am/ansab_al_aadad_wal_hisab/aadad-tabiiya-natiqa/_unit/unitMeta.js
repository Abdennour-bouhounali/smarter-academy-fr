/**
 * Les constantes communes aux leçons de l'unité 1 « الأعداد الطبيعيّة
 * والأعداد النّاطقة » (4AM). Tout ce qui est ici est lu du catalogue ou du
 * manuel ; rien n'est retapé dans une leçon. Depuis le 2026-11-20 les neuf leçons de l'unité sont v2 : il ne reste ici
 * que ce que les routes lisent (les constantes des anciennes pages de module sont supprimées).
 */
export const PRINT_SUBJECT = 'الرياضيات · السنة الرابعة متوسط';

/** La source d'un élément du manuel : `src(<elementId>, <page>, <section>, <numéro>)`. */
export const src = (elementId, page, section, number) => ({
  type: 'textbook', elementId, page, ...(section ? { section } : {}), ...(number != null ? { number } : {}),
});
/** Un ajout de la plateforme, toujours déclaré comme tel. */
export const addition = (reason) => ({ type: 'platform_addition', reason });
