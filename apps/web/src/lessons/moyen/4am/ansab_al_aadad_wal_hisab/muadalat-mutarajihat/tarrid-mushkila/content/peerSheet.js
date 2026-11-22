/**
 * « ورقة شيماء » — la dernière étape du module 2 (rollout 2026-11-11, unité 4 leçon 4 ; conseil du 2026-11-11, L4.5 et verdict §3.4) — contenu PROPRE à la
 * plateforme : la camarade est inventée (KidFigure, en hijab). L'idée fausse visée est celle de « ملاءمة الواقع » : GARDER un résultat de l'équation
 * alors que la situation le refuse — ici un nombre qui n'est pas entier (trois entiers consécutifs de somme 100). Ce n'est ni un leurre du labo
 * (« + x » une fois, un nombre qui vieillit, le futur au lieu du passé) ni l'une des corrections de la مسألة. Les nombres sont CALCULÉS.
 */
const T = 100;
const FLOOR = Math.floor((T - 3) / 3);          // 32
export const NUMS = { total: T, remainder: (T - 3) % 3, floor: FLOOR, kept: FLOOR * 3 + 3, next: (FLOOR + 1) * 3 + 3 };

export const PEER_KID = { name: 'شيماء', figure: { hairStyle: 'hijab', scarf: 'rose', outfit: 'green' } };

export const PEER_SHEET = {
  id: 'm2-shaymaa',
  task: `بحثت شيماء عن ثلاثة أعداد طبيعية متتالية مجموعها $${T}$ ، فأجابت: ${FLOOR} و ${FLOOR + 1} و ${FLOOR + 2}. لكنّ $${FLOOR} + ${FLOOR + 1} + ${FLOOR + 2} = ${NUMS.kept}$ !`,
  lines: [
    'نسمّي $x$ أصغر الأعداد الثلاثة.',
    `$x + (x + 1) + (x + 2) = ${T}$ أي $3x + 3 = ${T}$`,
    `$3x = ${T - 3}$`,
    `$x \\approx ${FLOOR}$ : الأعداد هي ${FLOOR} و ${FLOOR + 1} و ${FLOOR + 2}`,
  ],
  errorLine: 3,
  fixes: [
    { text: `${T - 3} لا يقبل القسمة على 3 : $x$ ليس عددًا طبيعيًا، فلا توجد ثلاثة أعداد طبيعية متتالية مجموعها $${T}$ .`, ok: true },
    { text: `نأخذ الأعداد التالية: ${FLOOR + 1} و ${FLOOR + 2} و ${FLOOR + 3}.`, why: `$${FLOOR + 1} + ${FLOOR + 2} + ${FLOOR + 3} = ${NUMS.next}$ ، لا $${T}$ .` },
    { text: `المعادلة هي $3x = ${T}$ .`, why: '$x + (x + 1) + (x + 2) = 3x + 3$ : الأعداد الثلاثة تُجمع مع $3x$ .' },
  ],
  why: `حلّ المعادلة $\\dfrac{${T - 3}}{3}$ ليس عددًا طبيعيًا، والمشكلة تطلب أعدادًا طبيعية: نرفضه ونقول إنّ المشكلة بلا حلّ. المجموعان القريبان هما ${NUMS.kept} و ${NUMS.next}.`,
};
