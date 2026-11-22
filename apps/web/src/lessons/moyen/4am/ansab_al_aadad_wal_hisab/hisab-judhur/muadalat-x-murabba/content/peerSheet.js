/**
 * « ورقة زميل » du module 2 (rollout 2026-11-10, unité 2 leçon 3 ; conseil du 2026-11-10) — contenu PROPRE à la plateforme : la camarade est
 * inventée (KidFigure, hijab). L'idée fausse visée : la racine d'un décimal prise pour sa MOITIÉ — « √0,16 = 0,08 car 0,16 ÷ 2 = 0,08 ». Le
 * nombre de solutions (deux, opposées) est JUSTE sur la feuille : elle ne reproduit aucune erreur de la مسألة (une solution oubliée, une valeur
 * approchée prise pour la solution, un « x² négatif » résolu) ni ses nombres. Les nombres sont CALCULÉS en centièmes, jamais retapés.
 */
const A_HUNDREDTHS = 16;                 // a = 0,16
const ROOT_TENTHS = 4;                   // √0,16 = 0,4 (4² = 16)
const HALF_HUNDREDTHS = A_HUNDREDTHS / 2; // la fausse racine : 0,08
const hundredths = (n) => `0{,}${String(n).padStart(2, '0')}`;
const tenThousandths = (n) => `0{,}${String(n).padStart(4, '0')}`;
export const A = hundredths(A_HUNDREDTHS);
export const WRONG = hundredths(HALF_HUNDREDTHS);
export const ROOT = `0{,}${ROOT_TENTHS}`;
/** (0,08)² en dix-millièmes : 64 → 0,0064 */
export const WRONG_SQ = tenThousandths(HALF_HUNDREDTHS * HALF_HUNDREDTHS);
/** (0,04)² — la 2e fausse correction (« le dixième de la racine ») */
const TENTH = hundredths(ROOT_TENTHS);
const TENTH_SQ = tenThousandths(ROOT_TENTHS * ROOT_TENTHS);

export const PEER_KID = { name: 'أمينة', figure: { outfit: 'teal', hairStyle: 'hijab', scarf: 'rose' } };

export const PEER_SHEET = {
  id: 'm2-amina',
  task: `حلّت أمينة المعادلة $x^2 = ${A}$.`,
  lines: [
    `$${A}$ عدد موجب: للمعادلة حلّان متعاكسان.`,
    `$\\sqrt{${A}} = ${WRONG}$ لأنّ $${A} \\div 2 = ${WRONG}$.`,
    `إذن $x = ${WRONG}$ أو $x = -${WRONG}$.`,
  ],
  errorLine: 1,
  // la conclusion découle de l'erreur : corrigée elle aussi, barrée puis réécrite
  fixedLines: [null, null, `إذن $x = ${ROOT}$ أو $x = -${ROOT}$.`],
  fixes: [
    { text: `الجذر ليس النصف: $${WRONG}^2 = ${WRONG_SQ}$. العدد الموجب الذي مربّعه $${A}$ هو $${ROOT}$ ، لأنّ $${ROOT}^2 = ${A}$.`, ok: true },
    { text: `$\\sqrt{${A}} = ${TENTH}$ لأنّ $\\sqrt{16} = 4$.`, why: `$${TENTH}^2 = ${TENTH_SQ}$ وليس $${A}$: انتبه إلى موضع الفاصلة.` },
    { text: `المعادلة لا تقبل أي حل لأنّ $${A}$ أصغر من 1.`, why: `$${A}$ موجب، ومربّع $${ROOT}$ يساويه: للمعادلة حلّان.` },
  ],
  why: 'الجذر التربيعي للعدد a هو العدد الموجب الذي مربّعه a — نتحقّق دائمًا بالتربيع، لا بالقسمة على 2.',
};
