/**
 * « ورقة أسامة » — la dernière étape du module 2 (rollout 2026-11-12, unité 5 leçon 2 ; conseil du 2026-11-11, verdict X1 et L2.8) — contenu PROPRE
 * à la plateforme : le camarade est inventé (KidFigure, en sweat). L'idée fausse visée : avant d'additionner, ne multiplier que le PREMIER membre
 * d'une équation (« je multiplie (1) par 2 : 4x + 2y = 14 ») — l'erreur de la طريقة الجمع, pas celle de la مسألة (une substitution). Ses nombres ne
 * sont pas ceux de la مسألة ; ils sont CALCULÉS, et la vérification est faite en (3 ; 8) où chaque terme se voit.
 */
const S = { a1: 2, b1: 1, c1: 14, a2: 3, b2: -2, c2: 7 };            // 2x + y = 14 ; 3x − 2y = 7
const K = 2;                                                         // la carte (1) multipliée par 2
const WRONG_C = S.c1;                                                // 4x + 2y = 14 : le second membre oublié
const X_WRONG = (WRONG_C + S.c2) / (K * S.a1 + S.a2);                 // 7x = 21 → 3
const Y_WRONG = S.c1 - S.a1 * X_WRONG;                               // y = 14 − 2 × 3 = 8
const RIGHT_C = K * S.c1;                                            // 28
const X_RIGHT = (RIGHT_C + S.c2) / (K * S.a1 + S.a2);                 // 35 / 7 = 5
const Y_RIGHT = S.c1 - S.a1 * X_RIGHT;                               // 4
export const NUMS = { S, K, WRONG_C, X_WRONG, Y_WRONG, RIGHT_C, X_RIGHT, Y_RIGHT, check: S.a2 * X_WRONG + S.b2 * Y_WRONG, checkRight: S.a2 * X_RIGHT + S.b2 * Y_RIGHT };

export const PEER_KID = { name: 'أسامة', figure: { outfit: 'blue' } };

export const PEER_SHEET = {
  id: 'm2-usama',
  task: `حلّ أسامة الجملة $\\begin{cases} 2x + y = 14 \\\\ 3x - 2y = 7 \\end{cases}$ بالجمع، ثم تحقّق في المعادلة الثانية: $3 \\times ${X_WRONG} - 2 \\times ${Y_WRONG} = ${NUMS.check}$ لا 7 !`,
  lines: [
    `أضرب المعادلة الأولى في ${K} : $4x + 2y = ${WRONG_C}$`,
    `أجمعها مع الثانية طرفًا لطرف: $7x = ${WRONG_C + S.c2}$`,
    `إذن $x = ${X_WRONG}$ ، ثم $y = 14 - 2 \\times ${X_WRONG} = ${Y_WRONG}$`,
  ],
  errorLine: 0,
  fixes: [
    { text: `$4x + 2y = ${RIGHT_C}$ : الطرفان معًا يُضربان في ${K}`, ok: true },
    { text: `$2x + y = ${RIGHT_C}$`, why: `ضُرب الطرف الثاني وحده وبقي الطرف الأول $2x + y$ : الطرفان معًا يُضربان.` },
    { text: `$4x + 2y = ${S.c1 + K}$`, why: `أُضيف العدد ${K} إلى الطرف الثاني بدل أن يُضرب فيه: $14 \\times 2 = ${RIGHT_C}$ .` },
  ],
  fixedLines: {
    1: `أجمعها مع الثانية طرفًا لطرف: $7x = ${RIGHT_C + S.c2}$`,
    2: `إذن $x = ${X_RIGHT}$ ، ثم $y = 14 - 2 \\times ${X_RIGHT} = ${Y_RIGHT}$ : الحل $(${X_RIGHT} ; ${Y_RIGHT})$ ، والتحقّق $15 - 8 = ${NUMS.checkRight}$`,
  },
  why: `ضرب معادلة في عدد عملية على المساواة كلّها: الطرف الأول والطرف الثاني معًا. ومن يضرب الطرفين يجد $7x = ${RIGHT_C + S.c2}$ ثم الثنائية $(${X_RIGHT} ; ${Y_RIGHT})$ التي تحقّق المعادلتين.`,
};
