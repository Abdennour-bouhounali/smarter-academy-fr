/**
 * « ورقة أيوب » — la dernière étape du module 2 (rollout 2026-11-11, unité 4 leçon 1 ; conseil du 2026-11-11, verdict X3 et L1.7) — contenu PROPRE
 * à la plateforme : le camarade est inventé (KidFigure, en sweat). L'idée fausse visée : ne diviser qu'UN SEUL terme par le coefficient
 * (« je divise par 2 : 2x devient x, le 6 reste ») — ce que la balance refuse sur le terrain (« لا تتوزّع دون تقطيع »), écrit sur le papier. Distincte
 * des leurres de construction du labo (un seul côté, un nombre qui traverse sans changer de signe) et de ceux de la مسألة. Ses nombres ne sont pas
 * ceux de la مسألة ; ils sont CALCULÉS, et le contrôle est fait en x = 1 où chaque terme se voit (2 × 1 + 6 = 8).
 */
const A = { a: 2, b: 6, c: 14 };                       // 2x + 6 = 14
const K = A.a;                                         // on divise par 2
const RIGHT = { b: A.b / K, c: A.c / K };              // x + 3 = 7
const X_RIGHT = RIGHT.c - RIGHT.b;                     // 4
const WRONG = { b: A.b, c: A.c / K };                  // x + 6 = 7 : le 6 n'a pas été divisé
const X_WRONG = WRONG.c - WRONG.b;                     // 1
export const NUMS = { A, K, RIGHT, X_RIGHT, WRONG, X_WRONG, at: A.a * X_WRONG + A.b, other: A.c, check: A.a * X_RIGHT + A.b };

export const PEER_KID = { name: 'أيوب', figure: { outfit: 'orange' } };

export const PEER_SHEET = {
  id: 'm2-ayoub',
  task: `حلّ أيوب المعادلة $${A.a}x + ${A.b} = ${A.c}$ ، ثم تحقّق: من أجل $x = ${X_WRONG}$ يساوي الطرف الأيسر ${NUMS.at} لكنّ الطرف الأيمن ${A.c} !`,
  lines: [
    `أقسم الطرفين على ${K} : $x + ${WRONG.b} = ${WRONG.c}$`,
    `أطرح ${WRONG.b} من الطرفين: $x = ${WRONG.c} - ${WRONG.b}$`,
    `إذن $x = ${X_WRONG}$`,
  ],
  errorLine: 0,
  fixes: [
    { text: `كل حدّ من الطرفين يُقسم على ${K} : $x + ${RIGHT.b} = ${RIGHT.c}$`, ok: true },
    { text: `$x + ${A.b} = ${A.c}$`, why: `قُسم الحدّ $${A.a}x$ وحده: $${A.c} \\div ${K} = ${RIGHT.c}$ و $${A.b} \\div ${K} = ${RIGHT.b}$ لم يُحسبا.` },
    { text: `$x + ${RIGHT.b} = ${A.c}$`, why: `الطرف الأيمن لم يُقسم: $${A.c} \\div ${K} = ${RIGHT.c}$ .` },
  ],
  fixedLines: {
    1: `أطرح ${RIGHT.b} من الطرفين: $x = ${RIGHT.c} - ${RIGHT.b}$`,
    2: `إذن $x = ${X_RIGHT}$ ، والتحقّق: $${A.a} \\times ${X_RIGHT} + ${A.b} = ${NUMS.check}$`,
  },
  why: `القسمة على ${K} عملية على الطرف كلّه: كل حدّ فيه يُقسم. ومن يطرح ${A.b} أوّلًا يجد $${A.a}x = ${A.c - A.b}$ ثم $x = ${X_RIGHT}$ : الحلّ نفسه.`,
};
