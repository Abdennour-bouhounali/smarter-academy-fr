/**
 * « ورقة رانية » — la dernière étape du module 2 (rollout 2026-11-10, unité 9 leçon 1 ; conseil du 2026-11-10, verdict « Cross-lesson » et L1.8) —
 * contenu PROPRE à la plateforme : la camarade est inventée (KidFigure, en tenue islamique). L'idée fausse visée est celle de la leçon : prendre
 * la قطعة BA (la distance entre le bâton et l'arbre) pour le côté OA du grand triangle — OB/BA au lieu de OB/OA.
 * Ses nombres ne sont pas ceux de la مسألة ; ils sont CALCULÉS (en centimètres entiers, écrits en mètres) et revérifiés par peerSheet.test.js.
 */
const OB = 80;                 // cm — l'ombre du bâton
const BA = 180;                // cm — du bâton au pied de l'arbre
const BE = 100;                // cm — le bâton
const OA = OB + BA;            // 260 cm — l'ombre de l'arbre, le CÔTÉ du grand triangle
const wrong = (BE * BA) / OB;  // 225 cm — ce qu'elle a calculé : BE × BA ÷ OB
const right = (BE * OA) / OB;  // 325 cm — BE × OA ÷ OB
export const NUMS = { OB, BA, BE, OA, wrong, right, additive: BA + BE, product: (OB * BA) / 100 };

const mt = (cm) => String(cm / 100).replace('.', '{,}');
const f = (n, d) => `\\dfrac{${n}}{${d}}`;

export const PEER_KID = { name: 'رانية', figure: { hairStyle: 'hijab', scarf: 'sand', outfit: 'teal' } };

export const PEER_SHEET = {
  id: 'm2-rania',
  task: `تريد رانية ارتفاع شجرة $[AM]$ . غرست عصا $[BE]$ طولها ${mt(BE)} m حتى انتهى ظلّها مع ظلّ الشجرة في النقطة $O$ ، ثم قاست على الأرض.`,
  lines: [
    `قستُ على الأرض: $OB = ${mt(OB)}$ m و $BA = ${mt(BA)}$ m .`,
    `العصا والشجرة شاقوليتان، إذن $${f('BE', 'AM')} = ${f('OB', 'BA')}$ .`,
    `ومنه $AM = ${mt(BA)} \\div ${mt(OB)} = ${mt(wrong)}$ m .`,
    `ارتفاع الشجرة ${mt(wrong)} m .`,
  ],
  errorLine: 1,
  fixes: [
    { text: 'نقارن $OB$ بالضلع $OA$ كلّه، لا بالقطعة $BA$ .', ok: true },
    { text: `نجمع: $AM = BA + BE = ${mt(BA + BE)}$ m .`, why: 'الجمع يفترض أن الفرق بين الظلّ والطول هو نفسه للعصا وللشجرة، والذي يبقى هو النسبة لا الفرق.' },
    { text: `نضرب: $AM = ${mt(OB)} \\times ${mt(BA)} = ${mt((OB * BA) / 100)}$ m .`, why: 'ضرب الطولين لا يقارن مثلثًا بمثلث، والخطأ يبقى: $BA$ ليست ضلعًا من المثلث الكبير.' },
  ],
  fixedLines: {
    2: `$OA = ${mt(OB)} + ${mt(BA)} = ${mt(OA)}$ m ، ومنه $AM = ${mt(OA)} \\div ${mt(OB)} = ${mt(right)}$ m .`,
    3: `ارتفاع الشجرة ${mt(right)} m .`,
  },
  why: `المثلثان $OBE$ و $OAM$ لهما الرأس $O$ : ضلع الكبير على الأرض هو $OA = ${mt(OA)}$ m ، من $O$ إلى قاعدة الشجرة. أما $BA$ فهي المسافة بين القاعدتين فقط.`,
};
