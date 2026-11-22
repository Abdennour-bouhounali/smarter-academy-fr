/**
 * La carte PROGRESSIVE du درس 3 « التمثيل البياني لدالة خطية وقراءته بيانيًا » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 3 et ses calculs
 * (content/textbook.js › ACTIVITY, ACTIVITY_LINES), معارف (KNOWLEDGE), les deux طرائق (METHOD_DRAW,
 * METHOD_READ), et les `commonError` / `method` / corrections des exercices 12 et 14
 * (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit.
 *
 *   core   cinq items (notebook) + l'exemple −2x / 2x de معارف ;
 *   guide  خطأ شائع « le signe oublié » (تمرين 14 : B(5 ; 16) est sur 3,2x, pas sur −3,2x),
 *          خطأ شائع « l'axe confondu » (تمرين 12), خلاصة (la propriété + la règle de طرائق).
 * Rien de l'إختبار أولي (A(2 ; 7), (1 ; 0,25), −0,75x, −1,2x, la droite par (2 ; 3)) n'est montré ici.
 *
 *              [المستقيم (OA)]                     m1
 *                     │ نعمّم
 *          [التمثيل البياني لدالة خطية]            m2
 *              مثال ┌─┴──────────┐ يكفي
 *        [−2x و 2x]          [نرسم التمثيل]
 *                │ المنحى          │ نقرأ عليه
 *        [منحى المستقيم]     [نقرأ على التمثيل]
 *                │ خطأ شائع   خطأ شائع ┌──┴──┐ نستخلص
 *          ⛔ [الإشارة]       ⛔ [المحوران]  🎯 [خلاصة]
 */
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, METHOD_DRAW, METHOD_READ } from './content/textbook';
import { EX } from './content/exercises';

const ex14 = EX['ex-14-a'];
const ex14b = EX['ex-14-b'];
const ex12 = EX['ex-12-b'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'tamthil-nashat', notebook: true,
      title: 'المستقيم (OA)', subtitle: '$y = 0{,}5x$',
      context: { text: ACTIVITY.closing, note: ACTIVITY_LINES.aligned },
      reveals: ['mustaqim'],
    },
    {
      id: 'mustaqim', kind: 'definition', lane: 'center', requires: 'tamthil-mustaqim', notebook: true,
      title: 'تمثيل دالة خطية', subtitle: '$y = ax$',
      reveals: ['mithal', 'rasm'],
    },
    {
      id: 'mithal', kind: 'example', lane: 'start', requires: 'tamthil-mustaqim',
      title: 'مثال الكتاب', subtitle: '$-2x$ و $2x$',
      context: { text: KNOWLEDGE.example },
      reveals: ['munha'],
    },
    {
      id: 'munha', kind: 'relationship', lane: 'start', requires: 'munha-mustaqim', notebook: true,
      title: 'المنحى وإشارة a', subtitle: '$a > 0$ ، $a < 0$',
      reveals: ['khata-ishara'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 14 (MISC-KHATTIYA-ISHARA / MISC-BAYANI-MUNHA).
      id: 'khata-ishara', kind: 'common_mistake', lane: 'start', requires: 'munha-mustaqim',
      title: 'إشارة المعامل', subtitle: '$B(5 ; 16)$',
      context: {
        parts: [
          { role: 'wrong', text: ex14.commonError },
          { role: 'why', text: ex14.method },
          { role: 'right', text: ex14b.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'rasm', kind: 'method', lane: 'end', requires: 'rasm-tamthil', notebook: true,
      title: 'نرسم التمثيل', subtitle: 'O ونقطة ثانية',
      reveals: ['qiraa'],
    },
    {
      id: 'qiraa', kind: 'method', lane: 'end', requires: 'qiraa-bayaniya', notebook: true,
      title: 'نقرأ على التمثيل', subtitle: '$f(4) = 1{,}6$',
      reveals: ['khata-qiraa', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 12 (MISC-BAYANI-FASILA-TARTIB).
      id: 'khata-qiraa', kind: 'common_mistake', lane: 'end', requires: 'qiraa-bayaniya',
      title: 'الخلط بين المحورين', subtitle: '120DA',
      context: {
        parts: [
          { role: 'wrong', text: ex12.commonError },
          { role: 'why', text: METHOD_READ.rule[1] },
          { role: 'right', text: ex12.question.explain },
        ],
      },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la propriété de معارف, puis la règle de طرائق.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qiraa-bayaniya',
      title: 'خلاصة', subtitle: 'مستقيم يشمل O',
      context: { text: KNOWLEDGE.property, note: METHOD_DRAW.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'mustaqim', label: 'نعمّم' },
    { from: 'mustaqim', to: 'mithal', label: 'مثال' },
    { from: 'mustaqim', to: 'rasm', label: 'يكفي' },
    { from: 'mithal', to: 'munha', label: 'المنحى' },
    { from: 'munha', to: 'khata-ishara', label: 'خطأ شائع' },
    { from: 'rasm', to: 'qiraa', label: 'نقرأ عليه' },
    { from: 'qiraa', to: 'khata-qiraa', label: 'خطأ شائع' },
    { from: 'qiraa', to: 'khulasa', label: 'نستخلص' },
  ],
};
