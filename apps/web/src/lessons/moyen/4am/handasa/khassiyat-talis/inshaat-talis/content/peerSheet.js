/**
 * « ورقة سلمى » — la dernière étape du module 2 (rollout 2026-11-10, unité 9 leçon 3 ; conseil du 2026-11-10, verdict « Cross-lesson » et « L3 ») —
 * contenu PROPRE à la plateforme : la camarade est inventée (KidFigure, en tenue islamique). L'idée fausse visée est celle de la leçon : graduer
 * les deux parallèles avec DEUX ouvertures de compas différentes, puis comparer des NOMBRES de graduations comme si elles avaient la même unité.
 * Ses nombres ne sont pas ceux de la مسألة (10 cm, 4/3, 4/7, 40/7, 40, 30…) ; ils sont CALCULÉS (en millimètres entiers, écrits en cm).
 */
const AB = 6;                  // cm
const P = 2;                   // le rapport demandé MA/MB = 2/3
const Q = 3;
const OPEN_A = 15;             // mm — l'ouverture sur (d₁)
const OPEN_B = 10;             // mm — l'ouverture sur (d₂) : l'ERREUR (une autre unité)
const AF = P * OPEN_A;         // 30 mm = 3 cm
const BE = Q * OPEN_B;         // 30 mm = 3 cm
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const wrong = red(AF, BE);                         // 1/1 — le rapport qu'elle a VRAIMENT construit
const amWrong = red(AF * AB, AF + BE);             // AM = AF/(AF + BE) × AB = 3 cm : le milieu
const amRight = red(P * AB, P + Q);                // AM = 2/5 × 6 = 12/5 cm
export const NUMS = { AB, P, Q, openA: OPEN_A, openB: OPEN_B, AF, BE, wrong, amWrong, amRight };

const f = (n, d) => `\\dfrac{${n}}{${d}}`;
const cm = (mm) => String(mm / 10).replace('.', '{,}');
const dec = ([n, d]) => String(n / d).replace('.', '{,}');

export const PEER_KID = { name: 'سلمى', figure: { hairStyle: 'hijab', scarf: 'mint', outfit: 'violet' } };

export const PEER_SHEET = {
  id: 'm2-salma',
  task: `تريد سلمى النقطة M من [AB] حيث $AB = ${AB}$ cm و $${f('MA', 'MB')} = ${f(P, Q)}$ . لكن نقطتها وقعت على بعد ${dec(amWrong)} cm من A: في منتصف [AB]!`,
  lines: [
    'رسمتُ مستقيمين متوازيين (d₁) و (d₂) يشملان A و B.',
    `درّجتُ (d₁) بفتحة مدور $${cm(OPEN_A)}$ cm ، ثم درّجتُ (d₂) بفتحة $${cm(OPEN_B)}$ cm .`,
    'F هي العلامة الثانية على (d₁) و E هي العلامة الثالثة على (d₂)، في جهتين مختلفتين، والمستقيم (EF) يقطع [AB] في M.',
    `إذن $${f('MA', 'MB')} = ${f('AF', 'BE')} = ${f(P, Q)}$ .`,
  ],
  errorLine: 1,
  fixes: [
    { text: 'ندرّج (d₁) و (d₂) بفتحة المدور نفسها.', ok: true },
    { text: 'نضع F و E في الجهة نفسها من (AB).', why: 'في الجهة نفسها تقع النقطة خارج [AB]، والخطأ يبقى: التدريجان ليسا بالوحدة نفسها.' },
    { text: 'نأخذ ثلاث علامات على (d₁) وعلامتين على (d₂).', why: `هذا يطلب النسبة $${f(Q, P)}$ بدل $${f(P, Q)}$ ، والخطأ يبقى: الفتحتان ما زالتا مختلفتين.` },
  ],
  fixedLines: { 3: `بالوحدة نفسها: $${f('MA', 'MB')} = ${f('AF', 'BE')} = ${f(P, Q)}$ ، و $AM = ${f(P, P + Q)} \\times ${AB} = ${dec(amRight)}$ cm .` },
  why: `بفتحتين مختلفتين: $AF = ${P} \\times ${cm(OPEN_A)} = ${cm(AF)}$ cm و $BE = ${Q} \\times ${cm(OPEN_B)} = ${cm(BE)}$ cm ، فالنسبة ${wrong[0] / wrong[1]} لا $${f(P, Q)}$ . عدد التدريجات لا يُقارن إلا إذا كانت كلها بالوحدة نفسها.`,
};
