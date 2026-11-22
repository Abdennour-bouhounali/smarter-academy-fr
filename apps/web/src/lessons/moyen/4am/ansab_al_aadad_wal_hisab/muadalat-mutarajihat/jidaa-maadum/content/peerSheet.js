/**
 * « ورقة كوثر » — la dernière étape du module 2 (rollout 2026-11-11, unité 4 leçon 2 ; conseil du 2026-11-11, verdict L2.7 et X3) — contenu PROPRE à la
 * plateforme : la camarade est inventée (KidFigure, hijab et tenue islamique). L'idée fausse visée est la définition de la leçon lue à l'envers : la
 * propriété du produit nul APPLIQUÉE À UNE SOMME (« somme nulle ⇒ un terme nul »). Ce n'est aucun leurre du labo (la constante prise pour une
 * solution, « معًا », le coefficient, le quotient retourné) ni aucune erreur de la مسألة. Ses nombres ne sont pas ceux de la مسألة ; ils sont CALCULÉS
 * (x − 7 et x + 1 ; la vérification en x = 7 donne 8, en x = −1 donne −8, en x = −7 donne −20 ; la somme se simplifie en 2x − 6 = 0, donc x = 3).
 */
const A = { a: 1, b: -7 };      // x − 7
const B = { a: 1, b: 1 };       // x + 1
const at = (x) => (A.a * x + A.b) + (B.a * x + B.b);
const SOL = -(A.b + B.b) / (A.a + B.a);   // 2x − 6 = 0 → 3

export const NUMS = { A, B, at7: at(7), atMinus1: at(-1), atMinus7: at(-7), sol: SOL, atSol: at(SOL), simplified: '2x - 6' };

export const PEER_KID = { name: 'كوثر', figure: { hairStyle: 'hijab', scarf: 'mint', outfit: 'violet' } };

export const PEER_SHEET = {
  id: 'm2-kawthar',
  task: `حلّت كوثر المعادلة $(x - 7) + (x + 1) = 0$ ، ثم تحقّقت من أجل $x = 7$ : الطرف الأول يعطي ${NUMS.at7} لا 0 !`,
  lines: [
    '$(x - 7) + (x + 1) = 0$ يعني $x - 7 = 0$ أو $x + 1 = 0$',
    '$x = 7$ أو $x = -1$',
    'للمعادلة حلّان: $7$ و $-1$',
  ],
  errorLine: 0,
  fixes: [
    { text: 'الطرف الأول مجموع لا جداء: الخاصية لا تُطبَّق. نبسّط المجموع: $2x - 6 = 0$', ok: true },
    { text: 'نضرب الحدّين بدل جمعهما: $(x - 7)(x + 1) = 0$', why: `هذه معادلة أخرى: من أجل $x = 7$ تعطي $0$ ، أمّا المعادلة المعطاة فتعطي $0 + 8 = ${NUMS.at7}$ .` },
    { text: 'الخطأ في الإشارة: $x = -7$ أو $x = 1$', why: `من أجل $x = -7$ الطرف الأول يساوي $${NUMS.atMinus7}$ ، لا $0$ . الخطأ ليس في الإشارة: الخاصية نفسها لا تُطبَّق على مجموع.` },
  ],
  fixedLines: {
    1: '$x - 7 + x + 1 = 0$ ، أي $2x - 6 = 0$ ، أي $2x = 6$',
    2: `للمعادلة حلّ واحد: $x = ${NUMS.sol}$ ؛ التحقّق: $(${NUMS.sol} - 7) + (${NUMS.sol} + 1) = ${NUMS.sol - 7} + ${NUMS.sol + 1} = ${NUMS.atSol}$`,
  },
  why: `مجموع عددين قد ينعدم دون أن ينعدم أيّ منهما: $${NUMS.sol - 7} + ${NUMS.sol + 1} = 0$ . الجداء وحده يفرض عاملًا معدومًا.`,
};
