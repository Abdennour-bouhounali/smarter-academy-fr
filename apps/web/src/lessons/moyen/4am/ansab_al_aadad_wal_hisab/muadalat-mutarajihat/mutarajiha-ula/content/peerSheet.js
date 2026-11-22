/**
 * « ورقة لقمان » — la dernière étape du module 2 (rollout 2026-11-11, unité 4 leçon 3 ; conseil du 2026-11-11, verdict L3.6 a et §3.3) — contenu
 * PROPRE à la plateforme : le camarade est inventé (KidFigure, `teal`). L'idée fausse visée : le sens a changé PARCE QU'UN NOMBRE NÉGATIF
 * APPARAÎT (le second membre −18), alors que le diviseur est POSITIF. Ce n'est ni le leurre de la construction du labo ni la correction de la
 * مسألة (le sens GARDÉ avec un diviseur négatif). Ses nombres sont CALCULÉS depuis `2x + 19 ≤ 1` ; la vérification se fait à x = 1 (tous les
 * termes se voient ; x = 0 cacherait 2x).
 */
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { parseIneq, rayOf, ineqPlain } from '../../../../../../common/manipulations/logic/solutionRay.js';

const I = parseIneq('2x+19<=1');
const RAY = rayOf(I);                                   // x ≤ -9
const A = Number(Lin.toNumber(I.L.a));                  // 2
const B = Number(Lin.toNumber(I.L.b));                  // 19
const C = Number(Lin.toNumber(I.R.b));                  // 1
const R1 = C - B;                                       // -18 : 2x ≤ -18
const BOUND = Number(Lin.toNumber(RAY.bound));          // -9
const X = 1;
const at = (x) => A * x + B;
export const NUMS = { A, B, C, R1, BOUND, X, at: at(X), ray: RAY, wrong1: 9, wrong1At: at(9), wrong2: 10, wrong2At: at(10), good: -10, goodAt: at(-10) };

export const PEER_KID = { name: 'لقمان', figure: { outfit: 'teal' } };

export const PEER_SHEET = {
  id: 'm2-luqman',
  task: `حلّ لقمان المتراجحة $${A}x + ${B} \\leq ${C}$ ، ثم تحقّق بالعدد ${X} : حسب حلّه العدد ${X} حلّ، لكنّ $${A} \\times ${X} + ${B} = ${NUMS.at}$ و $${NUMS.at} \\leq ${C}$ خاطئة!`,
  lines: [
    `نطرح ${B} من الطرفين: $${A}x \\leq ${R1}$`,
    `نقسم الطرفين على ${A}، والطرف الثاني سالب فنغيّر الاتجاه: $x \\geq ${BOUND}$`,
    `إذن حلول المتراجحة هي كل الأعداد الأكبر من أو تساوي $${BOUND}$`,
  ],
  errorLine: 1,
  fixes: [
    { text: `نقسم على ${A} وهو موجب، فيبقى الاتجاه: $x \\leq ${BOUND}$`, ok: true },
    { text: `نقسم على ${A} ونغيّر الاتجاه والإشارة: $x \\geq ${-BOUND}$`, why: `من أجل $x = ${-BOUND}$ نجد $${A} \\times ${-BOUND} + ${B} = ${NUMS.wrong1At}$ و $${NUMS.wrong1At} \\leq ${C}$ خاطئة.` },
    { text: `الخطأ في الطرح: $${A}x \\leq ${C + B}$ ثم $x \\leq ${(C + B) / A}$`, why: `$${C} - ${B} = ${R1}$ : السطر الأول صحيح. ومن أجل $x = ${(C + B) / A}$ نجد $${A} \\times ${(C + B) / A} + ${B} = ${NUMS.wrong2At}$ و $${NUMS.wrong2At} \\leq ${C}$ خاطئة.` },
  ],
  fixedLines: { 2: `إذن حلول المتراجحة هي كل الأعداد الأصغر من أو تساوي $${BOUND}$ ، ومن أجل $x = ${NUMS.good}$ : $${A} \\times (${NUMS.good}) + ${B} = ${NUMS.goodAt}$ و $${NUMS.goodAt} \\leq ${C}$ صحيحة.` },
  why: `الاتجاه يتغيّر حين نضرب أو نقسم على عدد سالب، لا حين يكون أحد الطرفين سالبًا. هنا قسمنا على ${A} وهو موجب.`,
};
export const PLAIN = ineqPlain(I);
