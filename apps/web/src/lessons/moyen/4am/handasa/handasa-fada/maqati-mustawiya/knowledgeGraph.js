/**
 * La carte PROGRESSIVE du درس « المقاطع المستوية للمجسمات المألوفة » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — معارف 3 (content/textbook.js › KNOW3), la معرفة
 * de la pyramide et du cône (KNOW_APEX, ajout déclaré), les erreurs que les modules corrigent (MISTAKES). Chaque nœud est gardé
 * par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *   centre : طبقات الكرة → مقطع كرة → (fin) مقطع بلاطة → (centre) مقطعا الأسطوانة → الهرم والمخروط → (fin) نصف قطر مقطع
 *            كرة → (fin) عرض مقطع أسطوانة → (centre) 🎯 خلاصة ;
 *   début (aides) : ⚠ h > R (sous مقطع كرة), ⛔ نفس القاعدة؟ (sous الهرم), ⛔ R − h ؟ (sous نصف قطر مقطع كرة).
 *   Un nœud à deux enfants les pose dans deux couloirs OPPOSÉS (début / fin) : une étiquette d'arête au centre se poserait
 *   sinon sur l'aide voisine (lessonGraphs.test.js, mesuré de 328 à 1100 px).
 */
import { KNOW3, KNOW_APEX, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tajribi',
  nodes: [
    {
      id: 'tajribi', kind: 'concept', lane: 'center', requires: 'maqta-tajribi', notebook: true,
      title: 'طبقات الكرة', subtitle: 'دائرة تصغر',
      reveals: ['kura'],
    },
    {
      id: 'kura', kind: 'relationship', lane: 'center', requires: 'maqta-kura', notebook: true,
      title: 'مقطع كرة بمستو', subtitle: '$r = \\sqrt{R^2 - h^2}$',
      reveals: ['mumas', 'balata'],
    },
    {
      // ⚠ انتبه — la condition du tableau de معارف 3 : au-delà de R, rien.
      id: 'mumas', kind: 'warning', lane: 'start', requires: 'maqta-kura',
      title: 'مستو بعيد', subtitle: '$h > R$',
      context: { text: KNOW3.outside, note: KNOW3.tangent },
      reveals: [],
    },
    {
      id: 'balata', kind: 'relationship', lane: 'end', requires: 'maqta-balata', notebook: true,
      title: 'مقطع بلاطة قائمة', subtitle: 'مستطيل',
      reveals: ['ustuwana'],
    },
    {
      id: 'ustuwana', kind: 'relationship', lane: 'center', requires: 'maqta-ustuwana', notebook: true,
      title: 'مقطعا الأسطوانة', subtitle: 'دائرة · مستطيل',
      reveals: ['haram'],
    },
    {
      id: 'haram', kind: 'relationship', lane: 'center', requires: 'maqta-haram', notebook: true,
      title: 'الهرم والمخروط', subtitle: '$k = \\dfrac{SE}{SA}$',
      reveals: ['khata-haram', 'nisf'],
    },
    {
      // ⛔ خطأ شائع — le carré de côté 4 (la pyramide du نشاط 5) ; le لماذا est la معرفة د).
      id: 'khata-haram', kind: 'common_mistake', lane: 'start', requires: 'maqta-haram',
      title: 'نفس القاعدة؟', subtitle: 'تصغير',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.haram.wrong },
          { role: 'why', text: KNOW_APEX.pyramid },
          { role: 'right', text: MISTAKES.haram.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'nisf', kind: 'method', lane: 'end', requires: 'tariqat-nisf-qutr', notebook: true,
      title: 'نصف قطر مقطع كرة', subtitle: 'فيثاغورس',
      reveals: ['khata-tarh', 'ustmethod'],
    },
    {
      // ⛔ خطأ شائع — « r = R − h », la carte que la trancheuse refuse ; le لماذا est le cercle fantôme du lab.
      id: 'khata-tarh', kind: 'common_mistake', lane: 'start', requires: 'tariqat-nisf-qutr',
      title: 'نصف القطر R − h؟', subtitle: '$\\sqrt{13} \\neq 5$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.tarh.wrong },
          { role: 'why', text: MISTAKES.tarh.why },
          { role: 'right', text: MISTAKES.tarh.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'ustmethod', kind: 'method', lane: 'end', requires: 'tariqat-ustuwana', notebook: true,
      title: 'عرض مقطع أسطوانة', subtitle: '$2\\sqrt{r^2 - d^2}$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la propriété de معارف 3, au mot près, et la condition de contact.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-ustuwana',
      title: 'خلاصة', subtitle: 'مقطع = طبقة',
      context: { text: KNOW3.property, note: KNOW3.cuboidFace },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tajribi', to: 'kura', label: 'نصوغها' },
    { from: 'kura', to: 'mumas', label: 'انتبه إلى' },
    { from: 'kura', to: 'balata', label: 'ثم' },
    { from: 'balata', to: 'ustuwana', label: 'ثم' },
    { from: 'ustuwana', to: 'haram', label: 'ثم' },
    { from: 'haram', to: 'khata-haram', label: 'خطأ شائع' },
    { from: 'haram', to: 'nisf', label: 'نحسب' },
    { from: 'nisf', to: 'khata-tarh', label: 'خطأ شائع' },
    { from: 'nisf', to: 'ustmethod', label: 'نفس الفكرة' },
    { from: 'ustmethod', to: 'khulasa', label: 'نستخلص' },
  ],
};
