/**
 * « ورقة زينب » — la dernière étape du module 2 (rollout 2026-11-11, unité 3 leçon 1 ; conseil du 2026-11-11, verdict X4 et « L1 ») — contenu
 * PROPRE à la plateforme : la camarade est inventée (KidFigure, en hijab). L'idée fausse visée est celle de la leçon : ne multiplier que les
 * termes « en face » (x × x et 3 × 6), oublier les deux zones croisées — puis « vérifier » à x = 0, la valeur qui cache justement toutes les zones
 * où x apparaît. Termes croisés de MÊME signe (6x et 3x) : aucune réduction de termes opposés (la méthode de la مسألة). Les nombres sont CALCULÉS.
 */
const A = 3;
const B = 6;
const at = (x) => ({ product: (x + A) * (x + B), wrong: x * x + A * B, right: x * x + (A + B) * x + A * B });
export const NUMS = { A, B, cross: A + B, constant: A * B, at0: at(0), at1: at(1) };

export const PEER_KID = { name: 'زينب', figure: { hairStyle: 'hijab', scarf: 'sky', outfit: 'teal' } };

export const PEER_SHEET = {
  id: 'm2-zaynab',
  task: `انشر وبسّط $(x + ${A})(x + ${B})$ .`,
  lines: [
    `$(x + ${A})(x + ${B}) = x \\times x + ${A} \\times ${B}$`,
    `$= x^2 + ${A * B}$`,
    `تحقّقت من أجل $x = 0$ : $${A} \\times ${B} = ${A * B}$ و $0 + ${A * B} = ${A * B}$ ✓`,
  ],
  errorLine: 0,
  fixes: [
    { text: `كل حدّ من القوس الأول في كل حدّ من الثاني: $x \\times x + x \\times ${B} + ${A} \\times x + ${A} \\times ${B}$`, ok: true },
    { text: '$x \\times x$ يساوي $2x$ ، لا $x^2$', why: '$x \\times x = x^2$ : هذا صحيح في ورقتها. الخطأ أنّ منطقتين من الملعب لم تُحسبا.' },
    { text: 'الخطأ في التحقّق فقط، والنشر صحيح', why: `القيمة $x = 0$ تُخفي كل منطقة فيها $x$ . من أجل $x = 1$ : $${1 + A} \\times ${1 + B} = ${at(1).product}$ ، أمّا $1 + ${A * B} = ${at(1).wrong}$ : النشر نفسه خاطئ.` },
  ],
  fixedLines: { 1: `$= x^2 + ${B}x + ${A}x + ${A * B} = x^2 + ${A + B}x + ${A * B}$` },
  why: `مساحة الملعب $(x + ${A})(x + ${B})$ أربع مناطق، لا المنطقتان المتقابلتان وحدهما. وقيمة واحدة لـ $x$ لا تُثبت نشرًا: $x = 0$ تُخفي كل منطقة فيها $x$ .`,
};
