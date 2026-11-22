/**
 * « ورقة صهيب » — la dernière étape du module 2 (rollout 2026-11-12, unité 5 leçon 1 ; conseil du 2026-11-11, verdict X1 et L1.7) — contenu PROPRE
 * à la plateforme : le camarade est inventé (KidFigure, garçon en sweat ; prénom d'aucune autre « ورقة زميل »). L'idée fausse visée : le SIGNE perdu
 * en substituant une valeur NÉGATIVE (« − 3 × (−2) » lu « − 6 ») — l'élève rejette ainsi une vraie solution. Les deux erreurs classiques de la leçon
 * (une seule équation, l'ordre) appartiennent aux corrections de la مسألة : la feuille ne les pose pas (Q6). Ses nombres sont CALCULÉS ; le contrôle
 * se fait en (1 ; −2), où chaque terme se voit.
 */
const SYS = { a: 2, b: -3, c: 8, a2: 1, b2: 1, c2: -1 };          // 2x − 3y = 8 ∣ x + y = −1
const PAIR = { x: 1, y: -2 };
const RIGHT1 = SYS.a * PAIR.x + SYS.b * PAIR.y;                     // 2 + 6 = 8
const WRONG1 = SYS.a * PAIR.x - Math.abs(SYS.b * PAIR.y);           // 2 − 6 = −4 : le signe de (−3) × (−2) perdu
const RIGHT2 = SYS.a2 * PAIR.x + SYS.b2 * PAIR.y;                   // 1 + (−2) = −1
export const NUMS = { SYS, PAIR, RIGHT1, WRONG1, RIGHT2 };
/** La jumla corrigée (le registre de l'unité la lit : `_unit/signatures/mafhum-jumla.js`, niveau `peer`). */
export const PEER_SYSTEM = ['2x - 3y = 8', 'x + y = -1'];

export const PEER_KID = { name: 'صهيب', figure: { outfit: 'green' } };

const sysTex = '\\begin{cases} 2x - 3y = 8 \\\\ x + y = -1 \\end{cases}';
const pairTex = `(${PAIR.x} ; ${PAIR.y})`;

export const PEER_SHEET = {
  id: 'm2-suhayb',
  task: `اختبر صهيب الثنائية $${pairTex}$ في الجملة $${sysTex}$ ، فوجد أنّها ليست حلًّا…`,
  lines: [
    `المعادلة (1): $2 \\times ${PAIR.x} - 3 \\times (${PAIR.y}) = 2 - 6 = ${WRONG1}$`,
    `$${WRONG1} \\neq ${SYS.c}$ : المعادلة (1) غير محقّقة`,
    `إذن $${pairTex}$ ليست حلًّا للجملة`,
  ],
  errorLine: 0,
  fixes: [
    { text: `$2 \\times ${PAIR.x} - 3 \\times (${PAIR.y}) = 2 + 6 = ${RIGHT1}$`, ok: true },
    { text: `$2 \\times ${PAIR.x} - 3 \\times (${PAIR.y}) = -1 \\times (${PAIR.y}) = 2$`, why: 'نحسب الضربين قبل الطرح: $2 \\times 1$ ثم $3 \\times (-2)$ .' },
    { text: `$2 \\times ${PAIR.x} - 3 - 2 = -3$`, why: '$-2$ عدد واحد بإشارته: نضربه في 3 كاملًا، $3 \\times (-2) = -6$ .' },
  ],
  fixedLines: {
    1: `$${RIGHT1} = ${SYS.c}$ : المعادلة (1) محقّقة`,
    2: `و $${PAIR.x} + (${PAIR.y}) = ${RIGHT2}$ : المعادلة (2) محقّقة، إذن $${pairTex}$ حلّ للجملة`,
  },
  why: 'طرح عدد سالب يعني إضافة مقابله: $-3 \\times (-2) = +6$ . ونتحقّق من المعادلتين معًا قبل أن نحكم.',
};
