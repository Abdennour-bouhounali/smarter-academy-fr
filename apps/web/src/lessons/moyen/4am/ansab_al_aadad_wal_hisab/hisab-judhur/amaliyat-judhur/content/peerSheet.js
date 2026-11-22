/**
 * « ورقة زميل » du module 2 (rollout 2026-11-10, unité 2 leçon 4 ; conseil du 2026-11-10) — contenu PROPRE à la plateforme : la camarade est
 * inventée (KidFigure, hijab). L'idée fausse visée est celle du module 2 : la racine prise comme si elle se DISTRIBUAIT sur une somme —
 * « √(4 + 9) = √4 + √9 = 5 ». Ses nombres sont d'autres que ceux du module (16 + 9, 100 − 36) et que ceux de la مسألة (180, 5 comme aire, 12,
 * 6√5, 2√3, 192, 45, 3√5, 18, 90, 150) ; elle ne reproduit aucun piège de la مسألة (« la moitié du côté, donc la moitié des dalles »). Les
 * nombres sont CALCULÉS, jamais retapés.
 */
const A = 4;
const B = 9;
const SUM = A + B;               // 13
const RA = Math.sqrt(A);         // 2
const RB = Math.sqrt(B);         // 3
const WRONG = RA + RB;           // 5 — la « racine distribuée »
const HALF = RA + B;             // 11 — la 2e fausse correction (la racine du premier terme seulement)
export const NUMS = { A, B, SUM, RA, RB, WRONG, HALF };

export const PEER_KID = { name: 'ياسمين', figure: { outfit: 'violet', hairStyle: 'hijab', scarf: 'sand' } };

export const PEER_SHEET = {
  id: 'm2-yasmine',
  task: `حسبت ياسمين $\\sqrt{${A} + ${B}}$ .`,
  lines: [
    `جذرا العددين معروفان: $\\sqrt{${A}} = ${RA}$ و $\\sqrt{${B}} = ${RB}$ .`,
    `$\\sqrt{${A} + ${B}} = \\sqrt{${A}} + \\sqrt{${B}}$`,
    `إذن $\\sqrt{${A} + ${B}} = ${WRONG}$ .`,
  ],
  errorLine: 1,
  // la conclusion découle de l'erreur : corrigée elle aussi, barrée puis réécrite
  fixedLines: [null, null, `إذن $\\sqrt{${A} + ${B}} = \\sqrt{${SUM}}$ ، وهو ليس ${WRONG}.`],
  fixes: [
    { text: `الجذر لا يتوزّع على الجمع: $${WRONG}^2 = ${WRONG * WRONG}$ وليس ${SUM}. إذن $\\sqrt{${A} + ${B}} = \\sqrt{${SUM}}$ .`, ok: true },
    { text: `$\\sqrt{${A} + ${B}} = ${RA} + ${B} = ${HALF}$`, why: `الجذر يشمل المجموع كلّه، لا الحدّ الأوّل وحده: $${HALF}^2 = ${HALF * HALF}$ وليس ${SUM}.` },
    { text: `$\\sqrt{${A} + ${B}} = ${A} + ${RB}$`, why: `$${A} + ${RB} = ${A + RB}$ ، و $${A + RB}^2 = ${(A + RB) ** 2}$ وليس ${SUM}.` },
  ],
  why: 'جذر جداء هو جداء الجذرين، أمّا جذر مجموع فليس مجموع الجذرين — نتحقّق دائمًا بالتربيع.',
};
