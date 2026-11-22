/**
 * La carte PROGRESSIVE du درس « مفهوم الدوران وإنشاء صور أشكال هندسية بدوران » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 et le نشاط 3 (content/textbook.js ›
 * ACTIVITY, ACTIVITY_3_LINES), معارف 1 et 2 (KNOW1, KNOW2), les erreurs que le module 2 corrige (MISTAKES). Chaque nœud
 * est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *              [نقطة وصورتها]                       m1
 *                    │ نسمّيه
 *         [الدوران: مركز وزاوية واتجاه]             m2
 *                    │ اتجاهان
 *       [المباشر وغير المباشر]
 *                    │ نعرّف به
 *              [صورة نقطة]
 *       خطأ شائع ┌──────┤ حالة خاصة
 *  ⛔ [الاتجاه لا يهم؟]  [180°]
 *          انتبه إلى ┌──────┤ ننشئ
 *          ⚠ [المركز]     │
 *          [إنشاء صورة نقطة]                         m3
 *                 │ نكرّرها
 *          [إنشاء صورة قطعة]
 *                 │ نستنتج
 *       [صور القطعة والمستقيم والدائرة]
 *                 │ نستخلص
 *              🎯 [خلاصة]
 */
import { ACTIVITY_3_LINES, KNOW1, KNOW2, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tajribi',
  nodes: [
    {
      id: 'tajribi', kind: 'concept', lane: 'center', requires: 'dawaran-tajribi', notebook: true,
      title: 'نقطة وصورتها', subtitle: "$OA' = OA$",
      reveals: ['dawaran'],
    },
    {
      id: 'dawaran', kind: 'definition', lane: 'center', requires: 'dawaran', notebook: true,
      title: 'الدوران', subtitle: 'مركز · زاوية · اتجاه',
      reveals: ['ittijah'],
    },
    {
      id: 'ittijah', kind: 'term', lane: 'center', requires: 'ittijah', notebook: true,
      title: 'المباشر وغير المباشر', subtitle: '↺ · ↻',
      reveals: ['surat'],
    },
    {
      id: 'surat', kind: 'definition', lane: 'center', requires: 'surat-nuqta', notebook: true,
      title: 'صورة نقطة بدوران', subtitle: "$\\widehat{MOM'} = \\alpha$",
      reveals: ['khata', 'nisf'],
    },
    {
      // ⚠ انتبه — la ملاحظة de معارف 2 : le centre est la seule image de lui-même.
      id: 'markaz', kind: 'warning', lane: 'start', requires: 'nisf-dawra',
      title: 'المركز صورة نفسه', subtitle: "$O' = O$",
      context: { text: KNOW2.remark },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — le sens oublié (la roue : A ↦ B ou A ↦ F) ; le لماذا est l'اصطلاح de معارف 1.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'surat-nuqta',
      title: 'الاتجاه لا يهمّ؟', subtitle: '↺ ≠ ↻',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.sense.wrong },
          { role: 'why', text: KNOW1.convention },
          { role: 'right', text: MISTAKES.sense.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'nisf', kind: 'relationship', lane: 'end', requires: 'nisf-dawra', notebook: true,
      title: 'دوران زاويته 180 درجة', subtitle: 'تناظر مركزي',
      reveals: ['markaz', 'tnuqta'],
    },
    {
      id: 'tnuqta', kind: 'method', lane: 'center', requires: 'tariqat-nuqta', notebook: true,
      title: 'إنشاء صورة نقطة', subtitle: 'منقلة · مدور',
      reveals: ['tqitaa'],
    },
    {
      id: 'tqitaa', kind: 'method', lane: 'center', requires: 'tariqat-qitaa', notebook: true,
      title: 'إنشاء صورة قطعة', subtitle: 'صورتا الطرفين',
      reveals: ['suwar'],
    },
    {
      id: 'suwar', kind: 'relationship', lane: 'center', requires: 'suwar-ashkal', notebook: true,
      title: 'صور الأشكال', subtitle: "$A'B' = AB$",
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la définition de l'image d'un point et l'image d'une دائرة, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'suwar-ashkal',
      title: 'خلاصة', subtitle: 'بعد · زاوية · اتجاه',
      context: { text: KNOW2.definition, note: ACTIVITY_3_LINES.circle },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tajribi', to: 'dawaran', label: 'نسمّيه' },
    { from: 'dawaran', to: 'ittijah', label: 'اتجاهان' },
    { from: 'ittijah', to: 'surat', label: 'نعرّف به' },
    { from: 'surat', to: 'khata', label: 'خطأ شائع' },
    { from: 'surat', to: 'nisf', label: 'حالة خاصة' },
    { from: 'nisf', to: 'markaz', label: 'انتبه إلى' },
    { from: 'nisf', to: 'tnuqta', label: 'ننشئ' },
    { from: 'tnuqta', to: 'tqitaa', label: 'نكرّرها' },
    { from: 'tqitaa', to: 'suwar', label: 'نستنتج' },
    { from: 'suwar', to: 'khulasa', label: 'نستخلص' },
  ],
};
