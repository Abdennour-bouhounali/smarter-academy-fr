/**
 * La carte PROGRESSIVE du درس « خواص الدوران وتوظيفها في الأشكال الهندسية » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — la situation du laboratoire (ACTIVITY), معارف 3
 * (KNOW3), l'ajout « المستقيم وصورته » (PERP), la طريقة p. 155 (METHOD), le centre (CENTER), les erreurs que les modules
 * corrigent (MISTAKES) et le `commonError` de l'exercice 6 (content/exercises.js). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *              [ما يبقى وما يتغيّر]                         m1
 *                     │ يصبح خاصية
 *              [خواص الدوران]                              m2
 *        خطأ شائع ┌───┴───┐ والمستقيمات؟
 *     ⛔ [صورة القطعة]   [المستقيم وصورته]
 *              خطأ شائع ┌───┴───┐ نوظّفها
 *            ⛔ [يوازيه دائما؟]  [إثبات بدوران]               m3
 *                     انتبه إلى ┌───┴───┐ وكذلك
 *                 ⚠ [قائم في O]     [صورة زاوية]
 *                                     │ وبالعكس
 *                                 [مركز الدوران]
 *                       انتبه إلى ┌───┴───┐ نستخلص
 *                    ⚠ [محوران منطبقان]   🎯 [خلاصة]
 */
import { ACTIVITY, KNOW3, PERP, METHOD, CENTER, MISTAKES } from './content/textbook';
import { EX } from './content/exercises';

const ex6 = EX['ex-6'];

export const KNOWLEDGE_GRAPH = {
  root: 'thabat',
  nodes: [
    {
      id: 'thabat', kind: 'idea', lane: 'center', requires: 'thabat-dawaran', notebook: true,
      title: 'ما يبقى وما يتغيّر', subtitle: 'ورقة شفافة تدور',
      reveals: ['khawas'],
    },
    {
      id: 'khawas', kind: 'relationship', lane: 'center', requires: 'khawas-dawaran', notebook: true,
      title: 'خواص الدوران', subtitle: 'الأطوال · الاستقامية · الزوايا · المساحات',
      reveals: ['tartib', 'zawiya'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 6 et sa correction.
      id: 'tartib', kind: 'common_mistake', lane: 'start', requires: 'khawas-dawaran',
      title: 'صورة القطعة', subtitle: '$[BM] \\mapsto [CN]$',
      context: {
        parts: [
          { role: 'wrong', text: ex6.commonError },
          { role: 'why', text: ex6.question.rows[1].correction },
          { role: 'right', text: ex6.question.rows[2].correction },
        ],
      },
      reveals: [],
    },
    {
      id: 'zawiya', kind: 'relationship', lane: 'end', requires: 'zawiya-sura', notebook: true,
      title: 'المستقيم وصورته', subtitle: "$(d') \\perp (d)$",
      reveals: ['tawazi', 'istimal'],
    },
    {
      // ⛔ خطأ شائع — le distracteur du module 2 et la correction de l'ajout.
      id: 'tawazi', kind: 'common_mistake', lane: 'start', requires: 'zawiya-sura',
      title: 'يوازيه دائما؟', subtitle: '$90^\\circ ,\\; 180^\\circ$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.tawazi.wrong },
          { role: 'why', text: PERP.text },
          { role: 'right', text: MISTAKES.tawazi.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'istimal', kind: 'method', lane: 'center', requires: 'istimal-khawas', notebook: true,
      title: 'إثبات بدوران', subtitle: '$AC = BD$',
      reveals: ['qaim', 'suratZawiya'],
    },
    {
      // ⚠ انتبه — ce que l'énoncé de la طريقة ne disait pas.
      id: 'qaim', kind: 'warning', lane: 'start', requires: 'istimal-khawas',
      title: 'المركز والاتجاه', subtitle: 'قائم في O',
      context: { text: METHOD.stated },
      reveals: [],
    },
    {
      id: 'suratZawiya', kind: 'method', lane: 'end', requires: 'surat-zawiya', notebook: true,
      title: 'صورة زاوية بدوران', subtitle: "$\\widehat{A'O'B'} = 45^\\circ$",
      reveals: ['markaz'],
    },
    {
      id: 'markaz', kind: 'method', lane: 'center', requires: 'markaz-dawaran', notebook: true,
      title: 'مركز الدوران', subtitle: "$OA = OA'$",
      reveals: ['mihwar', 'khulasa'],
    },
    {
      // ⚠ انتبه — deux médiatrices confondues (l'exercice 18, le laboratoire).
      id: 'mihwar', kind: 'warning', lane: 'start', requires: 'markaz-dawaran',
      title: 'محوران منطبقان', subtitle: "$[MM'] ,\\; [NN']$",
      context: { text: CENTER.warning },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la propriété du manuel et la phrase de la situation, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'markaz-dawaran',
      title: 'خلاصة', subtitle: 'الدوران لا يشوّه',
      context: { text: KNOW3.property + ' ' + KNOW3.items.join('، ') + '.', note: ACTIVITY.closing },
      reveals: [],
    },
  ],
  edges: [
    { from: 'thabat', to: 'khawas', label: 'يصبح خاصية' },
    { from: 'khawas', to: 'tartib', label: 'خطأ شائع' },
    { from: 'khawas', to: 'zawiya', label: 'والمستقيمات؟' },
    { from: 'zawiya', to: 'tawazi', label: 'خطأ شائع' },
    { from: 'zawiya', to: 'istimal', label: 'نوظّفها' },
    { from: 'istimal', to: 'qaim', label: 'انتبه إلى' },
    { from: 'istimal', to: 'suratZawiya', label: 'وكذلك' },
    { from: 'suratZawiya', to: 'markaz', label: 'وبالعكس' },
    { from: 'markaz', to: 'mihwar', label: 'انتبه إلى' },
    { from: 'markaz', to: 'khulasa', label: 'نستخلص' },
  ],
};
