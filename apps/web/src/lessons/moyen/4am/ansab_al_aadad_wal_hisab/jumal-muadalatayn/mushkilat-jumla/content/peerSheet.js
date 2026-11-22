/**
 * « ورقة وئام » — la dernière étape du module 2 (rollout 2026-11-12, unité 5 leçon 3 ; design L3 §6, verdict X1 et L3.7) — contenu PROPRE à la
 * plateforme : la camarade est inventée (KidFigure, en hijab). L'idée fausse visée : une COMPARAISON « يزيد … عن … بـ » écrite à l'envers.
 * Ce n'est ni un leurre du labo (le labo n'a pas de phrase de comparaison) ni une correction de la مسألة (l'échange et l'arrondi) ; la paire
 * fausse n'est PAS l'échange de la bonne (l'équation d'argent n'est pas symétrique). Les nombres sont CALCULÉS.
 *
 *   x + 5 = y (l'erreur) : 200x + 300(x + 5) = 8500 → 500x = 7000 → (14 ; 19) — elle vérifie l'argent, pas la comparaison ;
 *   x = y + 5 (la correction) : 200(y + 5) + 300y = 8500 → 500y = 7500 → (20 ; 15).
 */
const STORY = 200; const SCI = 300; const TOTAL = 8500; const MORE = 5;
const herX = (TOTAL - SCI * MORE) / (STORY + SCI);           // 14
const rightY = (TOTAL - STORY * MORE) / (STORY + SCI);       // 15
export const NUMS = { herX, herY: herX + MORE, rightX: rightY + MORE, rightY };

export const PEER_KID = { name: 'وئام', figure: { hairStyle: 'hijab', scarf: 'lavender', outfit: 'teal' } };

export const PEER_SHEET = {
  id: 'm2-wiam',
  task: `في مكتبة القسم قصص بـ ${STORY} دج للقصة وكتب علمية بـ ${SCI} دج للكتاب، ثمنها كلّها ${TOTAL} دج، وعدد القصص يزيد عن عدد الكتب العلمية بـ ${MORE}. كم قصة وكم كتابًا علميًا؟`,
  lines: [
    'نسمّي $x$ عدد القصص و $y$ عدد الكتب العلمية.',
    `«ثمنها كلّها ${TOTAL} دج»: $${STORY}x + ${SCI}y = ${TOTAL}$`,
    `«عدد القصص يزيد عن عدد الكتب العلمية بـ ${MORE}»: $y = x + ${MORE}$`,
    `$${STORY}x + ${SCI}(x + ${MORE}) = ${TOTAL}$ أي $${STORY + SCI}x = ${TOTAL - SCI * MORE}$ ، ومنه $x = ${herX}$ ثم $y = ${herX + MORE}$`,
    `«في المكتبة ${herX} قصة و ${herX + MORE} كتابًا علميًا.»`,
  ],
  errorLine: 2,
  fixes: [
    { text: `$x = y + ${MORE}$ : القصص أكثر، فعددها هو الذي يزيد بـ ${MORE}.`, ok: true },
    { text: `$y = ${MORE}x$`, why: `«يزيد بـ ${MORE}» فرق بين العددين، لا ${MORE} أضعاف.` },
    { text: `$x + y = ${MORE}$`, why: `${MORE} هو الفرق بين العددين، لا مجموعهما.` },
  ],
  fixedLines: {
    3: `$${STORY}(y + ${MORE}) + ${SCI}y = ${TOTAL}$ أي $${STORY + SCI}y = ${TOTAL - STORY * MORE}$ ، ومنه $y = ${rightY}$ ثم $x = ${rightY + MORE}$`,
    4: `«في المكتبة ${rightY + MORE} قصة و ${rightY} كتابًا علميًا.»`,
  },
  why: `جواب وئام يحقّق المبلغ ($${STORY} \\times ${herX} + ${SCI} \\times ${herX + MORE} = ${TOTAL}$) لكنه يجعل القصص أقلّ من الكتب: ${herX} أصغر من ${herX + MORE}. القصص هي التي تزيد: $x = y + ${MORE}$ ، والجواب ${rightY + MORE} قصة و ${rightY} كتابًا ($${STORY} \\times ${rightY + MORE} + ${SCI} \\times ${rightY} = ${TOTAL}$).`,
};
