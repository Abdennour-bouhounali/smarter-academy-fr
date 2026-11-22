/**
 * La carte PROGRESSIVE du درس « الكرة والجلة » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 (content/textbook.js › ACTIVITY), معارف 1
 * (KNOW1), les طرائق (METHOD_DRAW, METHOD_POINT, METHOD_DISTANCE), les erreurs que les modules corrigent (MISTAKES). Chaque nœud
 * est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *            [سطح أجوف ومجسم مملوء]                    m1
 *                    │ نعرّفها
 *              [تعريف الكرة]                            m2
 *                    │ ونقابلها بـ
 *              [تعريف الجلة]
 *      خطأ شائع ┌────┤ عناصرها
 *  ⛔ [داخل الكرة؟]  [الأقطار]
 *                    │ نولّدها
 *         [دائرة تدور حول قطرها]
 *                    │ دوائرها
 *        [الدوائر الكبرى والصغرى]
 *        انتبه إلى ┌──┤ نمثّلها
 *     ⚠ [مركز الدائرة] [تمثيل كرة]                      m3
 *                    │ ثم نقطة
 *         [تمثيل نقطة من كرة أو جلة]
 *                    │ نحسب الموقع
 *         [موقع نقطة في معلم للفضاء]
 *                    │ نستخلص
 *                🎯 [خلاصة]
 */
import { KNOW1, METHOD_DISTANCE, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'kura-julla-nashat', notebook: true,
      title: 'أجوف أم مملوء', subtitle: 'كرة اليد · الكرية الحديدية',
      reveals: ['kura'],
    },
    {
      id: 'kura', kind: 'definition', lane: 'center', requires: 'tarif-kura', notebook: true,
      title: 'تعريف الكرة', subtitle: '$OM = R$',
      reveals: ['julla'],
    },
    {
      id: 'julla', kind: 'definition', lane: 'center', requires: 'tarif-julla', notebook: true,
      title: 'تعريف الجلة', subtitle: '$OM \\le R$',
      reveals: ['khata', 'aqtar'],
    },
    {
      // ⛔ خطأ شائع — un point INTÉRIEUR pris pour un point de la كرة (le refus du lab, la question 1 de معارف) ; le لماذا est la
      // définition de la كرة de معارف 1.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'tarif-julla',
      title: 'داخل الكرة؟', subtitle: '$OP < R$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.julla.wrong },
          { role: 'why', text: KNOW1.defSphere },
          { role: 'right', text: MISTAKES.julla.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'aqtar', kind: 'relationship', lane: 'end', requires: 'aqtar', notebook: true,
      title: 'أقطار الكرة', subtitle: '$2R$',
      reveals: ['tawlid'],
    },
    {
      id: 'tawlid', kind: 'idea', lane: 'center', requires: 'tawlid', notebook: true,
      title: 'دائرة تدور حول قطرها', subtitle: 'تولّد كرة',
      reveals: ['dawair'],
    },
    {
      id: 'dawair', kind: 'term', lane: 'center', requires: 'dawair', notebook: true,
      title: 'الدوائر الكبرى والصغرى', subtitle: 'كبرى · صغرى',
      reveals: ['intabih', 'tamthil'],
    },
    {
      // ⚠ انتبه — le centre décide : la ملاحظة de معارف 1 sur les دوائر الصغرى (centre ≠ O, rayon < R).
      id: 'intabih', kind: 'warning', lane: 'start', requires: 'dawair',
      title: 'مركز الدائرة', subtitle: '$O_1 \\neq O$',
      context: { text: KNOW1.noteSmall, note: MISTAKES.great.right },
      reveals: [],
    },
    {
      id: 'tamthil', kind: 'method', lane: 'end', requires: 'tamthil-kura', notebook: true,
      title: 'تمثيل كرة', subtitle: 'دائرة · شكل بيضوي',
      reveals: ['nuqta'],
    },
    {
      id: 'nuqta', kind: 'method', lane: 'center', requires: 'tamthil-nuqta', notebook: true,
      title: 'تمثيل نقطة', subtitle: 'دائرة كبرى',
      reveals: ['masafa'],
    },
    {
      id: 'masafa', kind: 'method', lane: 'center', requires: 'masafa-maalam', notebook: true,
      title: 'موقع نقطة في معلم', subtitle: '$OM^2 = x^2 + y^2 + z^2$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les deux تعاريف de معارف 1, au mot près, et la comparaison de la méthode.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'masafa-maalam',
      title: 'خلاصة', subtitle: '$=$ · $\\le$',
      context: { text: KNOW1.defBall, note: METHOD_DISTANCE.lines[2] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'kura', label: 'نعرّفها' },
    { from: 'kura', to: 'julla', label: 'ونقابلها بـ' },
    { from: 'julla', to: 'khata', label: 'خطأ شائع' },
    { from: 'julla', to: 'aqtar', label: 'عناصرها' },
    { from: 'aqtar', to: 'tawlid', label: 'نولّدها' },
    { from: 'tawlid', to: 'dawair', label: 'دوائرها' },
    { from: 'dawair', to: 'intabih', label: 'انتبه إلى' },
    { from: 'dawair', to: 'tamthil', label: 'نمثّلها' },
    { from: 'tamthil', to: 'nuqta', label: 'ثم نقطة' },
    { from: 'nuqta', to: 'masafa', label: 'نحسب الموقع' },
    { from: 'masafa', to: 'khulasa', label: 'نستخلص' },
  ],
};
