/**
 * La carte PROGRESSIVE du درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم » — KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 3 et le نشاط 4 (content/textbook.js ›
 * ACTIVITY_LINES, ACTIVITY_4_LINES), معارف د و هـ (KNOW_MID, KNOW_DIST), les pièges que le lab refuse (KNOW_LINES) et les
 * `commonError` des exercices 10 et 15 (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui
 * l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *              [المنتصف وتساوي شعاعين]                       m1
 *                        │ نستنتج
 *               [إحداثيتا المنتصف]                          m3
 *       خطأ شائع ┌───────┴────────┐ مثال
 *  ⛔ [نصف الفرق]               [I(−1/2 ; −1/2)]
 *                        └ ثمّ ─────────▶ [المسافة بين نقطتين]   (couloir « end », une rangée plus bas)
 *                          خطأ شائع ┌─────────┼─────────┐ مثال
 *                     ⛔ [جمع الفرقين]        │     [AB = 5]
 *                                   انتبه إلى ▼
 *                              ⚠ [القيمة المضبوطة] ── نستخلص ──▶ 🎯 [خلاصة]
 */
import { ACTIVITY_LINES, ACTIVITY_4_LINES, KNOW_MID, KNOW_DIST, KNOW_LINES } from './content/textbook';
import { EX } from './content/exercises';

export const KNOWLEDGE_GRAPH = {
  root: 'murakkibat',
  nodes: [
    {
      id: 'murakkibat', kind: 'concept', lane: 'center', requires: 'muntasaf-murakkibat', notebook: true,
      title: 'المنتصف وتساوي شعاعين', subtitle: '$\\overrightarrow{KJ} = \\overrightarrow{JL}$',
      reveals: ['muntasaf'],
    },
    {
      id: 'muntasaf', kind: 'relationship', lane: 'center', requires: 'ihdathiyata-muntasaf', notebook: true,
      title: 'إحداثيتا منتصف قطعة', subtitle: '$x_I = \\dfrac{x_A + x_B}{2}$',
      reveals: ['khataMid', 'mithalMid', 'masafa'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 10 et la ligne du معارف que le lab illustre (la demi-différence).
      id: 'khataMid', kind: 'common_mistake', lane: 'start', requires: 'ihdathiyata-muntasaf',
      title: 'نصف الفرق بدل نصف المجموع', subtitle: '$\\dfrac{x_B - x_A}{2}$',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-10-a'].commonError },
          { role: 'why', text: ACTIVITY_LINES.solve },
          { role: 'right', text: KNOW_LINES.midTrap },
        ],
      },
      reveals: [],
    },
    {
      id: 'mithalMid', kind: 'example', lane: 'end', requires: 'ihdathiyata-muntasaf',
      title: 'مثال المنتصف', subtitle: '$I\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{1}{2}\\right)$',
      context: { text: KNOW_MID.example },
      reveals: [],
    },
    {
      id: 'masafa', kind: 'relationship', lane: 'end', requires: 'masafa', notebook: true,
      title: 'المسافة بين نقطتين', subtitle: '$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$',
      reveals: ['khataDist', 'mithalDist', 'madbuta'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 15 ; « لماذا » : la marche sur les deux côtés du نشاط 4.
      id: 'khataDist', kind: 'common_mistake', lane: 'start', requires: 'masafa',
      title: 'جمع الفرقين', subtitle: '$3 + 4 = 7$',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-15'].commonError },
          { role: 'why', text: ACTIVITY_4_LINES.taxi },
          { role: 'right', text: KNOW_LINES.distTrap },
        ],
      },
      reveals: [],
    },
    {
      id: 'mithalDist', kind: 'example', lane: 'end', requires: 'masafa',
      title: 'مثال المسافة', subtitle: '$AB = \\sqrt{25} = 5$',
      context: { text: KNOW_DIST.example },
      reveals: [],
    },
    {
      // ⚠ انتبه — « القيمة المضبوطة » (le تحدّ, l'exercice 15, le QCM 4)
      id: 'madbuta', kind: 'warning', lane: 'center', requires: 'masafa',
      title: 'القيمة المضبوطة', subtitle: '$\\sqrt{72} = 6\\sqrt{2}$',
      context: { text: KNOW_LINES.exact },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les deux propriétés du معارف, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'masafa',
      title: 'خلاصة', subtitle: 'المنتصف · المسافة',
      context: { text: KNOW_MID.property, note: KNOW_DIST.property },
      reveals: [],
    },
  ],
  edges: [
    { from: 'murakkibat', to: 'muntasaf', label: 'نستنتج' },
    { from: 'muntasaf', to: 'khataMid', label: 'خطأ شائع' },
    { from: 'muntasaf', to: 'mithalMid', label: 'مثال' },
    { from: 'muntasaf', to: 'masafa', label: 'ثمّ' },
    { from: 'masafa', to: 'khataDist', label: 'خطأ شائع' },
    { from: 'masafa', to: 'mithalDist', label: 'مثال' },
    { from: 'masafa', to: 'madbuta', label: 'انتبه إلى' },
    { from: 'madbuta', to: 'khulasa', label: 'نستخلص' },
  ],
};
