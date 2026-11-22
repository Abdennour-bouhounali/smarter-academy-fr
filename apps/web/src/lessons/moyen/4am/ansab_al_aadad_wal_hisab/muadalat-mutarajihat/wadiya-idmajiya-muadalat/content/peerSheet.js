/**
 * « ورقة زكريا » — la DERNIÈRE étape du module 7 « وضعية الوحدة » (la synthèse de l'unité 4 dans le lecteur de mission, 2026-11-12 ; recette de la
 * synthèse, point 5). Le camarade est inventé (KidFigure) ; son prénom n'est porté par AUCUNE autre « ورقة زميل » de la plateforme
 * (content/mission.test.js, _unit/missionStrings.test.js).
 * Ce n'est PAS une solution : c'est un PLAN, en mots, SANS aucun nombre. Son erreur est une erreur de JUSTIFICATION — « à la borne les deux coûts
 * sont égaux ; comme la borne vérifie l'inéquation, c'est la plus petite séance où la formule 2 est meilleure » : une inéquation STRICTE n'est
 * pas vérifiée par sa borne (les coûts y sont égaux, aucune formule n'est meilleure) ; la réponse est le premier entier au-delà. Les autres
 * lignes sont justes.
 */
export const PEER_KID = { name: 'زكريا', figure: { outfit: 'orange' } };

export const PEER_SHEET = {
  id: 'm7-zakaria',
  task: 'خطّة زكريا لمعرفة ابتداءً من كم حصّة تكون الصيغة الثانية أفضل:',
  lines: [
    'أسمّي x عدد الحصص، وأترجم كل صيغة بعبارة بدلالة x.',
    'أكتب «تكلفة الصيغة الثانية أقلّ من تكلفة الصيغة الأولى» وأحلّ هذه المتراجحة.',
    'عند العدد الذي يحدّ الحلول تتساوى التكلفتان، وهذا العدد يحقّق المتراجحة، إذن هو أصغر عدد للحصص تكون فيه الصيغة الثانية أفضل.',
    'أتحقّق بحساب تكلفة الصيغتين من أجل العدد الذي اخترته.',
  ],
  errorLine: 2,
  fixes: [
    { text: 'المتراجحة قطعية: العدد الذي يحدّ الحلول لا يحقّقها لأنّ التكلفتين متساويتان عنده؛ الجواب أصغر عدد طبيعي أكبر منه.', ok: true },
    { text: 'العدد الذي يحدّ الحلول يحقّق المتراجحة، لكن نضيف إليه حصّتين احتياطًا.', why: 'لا احتياط هنا: العدد الطبيعي الذي يلي الحدّ مباشرة يحقّق المتراجحة، فالصيغة الثانية أرخص ابتداءً منه.' },
    { text: 'التكلفتان متساويتان عند الحدّ، والتساوي يكفي ليكون هو الجواب.', why: '«أفضل» تعني «أرخص تمامًا»: عند التساوي لا تكون أيّ صيغة أفضل من الأخرى.' },
  ],
  why: 'عند الحدّ تتساوى التكلفتان، والمتراجحة القطعية لا تقبل المساواة: الجواب أصغر عدد طبيعي يحقّقها، لأنّ عدد الحصص عدد طبيعي.',
};
