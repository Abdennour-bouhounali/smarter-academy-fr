/**
 * « ورقة طارق » — la dernière étape du module 2 (rollout 2026-11-11, unité 3 leçon 2 ; conseil du 2026-11-11, verdict X4 et L2.2) — contenu PROPRE
 * à la plateforme : le camarade est inventé (KidFigure, garçon). L'idée fausse visée est celle de la leçon : le carré d'une SOMME écrit comme la
 * somme des carrés, (x + 7)² = x² + 49 — le double produit 2ab oublié (les deux bandes du terrain). Le calcul qui suit le trahit : à x = 13 sa
 * formule donne 218, alors que le côté vaut 20 et l'aire 400. Les nombres sont CALCULÉS ; aucune différence (a − b)², aucun coin coupé deux fois
 * (la méthode et la correction de la مسألة), aucun nombre de la مسألة (content/peerSheet.test.js).
 */
const B = 7;
const X = 13;
const at = (x) => ({ side: x + B, area: (x + B) ** 2, wrong: x * x + B * B, right: x * x + 2 * B * x + B * B, strips: 2 * B * x });
export const NUMS = { B, X, ...at(X), at1: at(1) };

export const PEER_KID = { name: 'طارق', figure: { outfit: 'orange' } };

export const PEER_SHEET = {
  id: 'm2-tariq',
  task: `ساحة مربّعة ضلعها $x$ مترًا، يُزاد ضلعها ${B} أمتار. عبّر عن مساحتها $A$ ، ثم احسبها من أجل $x = ${X}$ .`,
  lines: [
    `$A = (x + ${B})^2 = x^2 + ${B * B}$`,
    `من أجل $x = ${X}$ : $A = ${X * X} + ${B * B} = ${at(X).wrong}$`,
    `لكنّ ضلع الساحة $${X} + ${B} = ${at(X).side}$ ، و $${at(X).side}^2 = ${at(X).area}$ … ؟`,
  ],
  errorLine: 0,
  fixes: [
    { text: `نسي الشريطين: $2 \\times x \\times ${B} = ${2 * B}x$ ، إذن $A = x^2 + ${2 * B}x + ${B * B}$`, ok: true },
    { text: `ينقص شريط واحد: $A = x^2 + ${B}x + ${B * B}$`, why: `من أجل $x = ${X}$ تعطي $${X * X} + ${B * X} + ${B * B} = ${X * X + B * X + B * B}$ ، لا $${at(X).area}$ : الشريطان متقايسان، وكلاهما في الساحة.` },
    { text: `الخطأ في الحساب فقط: $${X * X} + ${B * B}$ ليس $${at(X).wrong}$`, why: `الحساب صحيح: $${X * X} + ${B * B} = ${at(X).wrong}$ . الخطأ في السطر الأول: في النشر نفسه.` },
  ],
  fixedLines: {
    1: `من أجل $x = ${X}$ : $A = ${X * X} + ${2 * B * X} + ${B * B} = ${at(X).area}$`,
  },
  why: `مربّع مجموع ليس مجموع المربّعين: في الساحة المربّعان وشريطان مساحة كل منهما $${B}x$ . وقيمة واحدة لـ $x$ لا تُثبت نشرًا، لكنّها تكفي لكشف نشر خاطئ.`,
};
