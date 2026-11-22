/**
 * La carte PROGRESSIVE du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 (content/textbook.js › ACTIVITY,
 * ACTIVITY_LINES), معارف 1 et 2 (KNOW1, KNOW2), نشاط 2 أ (ACTIVITY_2_LINES) et le `commonError` de l'exercice 3
 * (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de
 * l'إختبار أولي n'est montré.
 *
 *                 [الانسحاب يعرّف شعاعا]                    m1
 *                          │ نصفه بـ
 *                   [المنحى والاتجاه]                      m2
 *                          │ مع الطول
 *                   [الشعاع: ثلاثة عناصر]
 *                          │ نقارن
 *                   [تساوي شعاعين]
 *          خطأ شائع ┌──────┴──────┐ يرسم
 *       ⛔ [اتجاه معاكس]     [متوازي أضلاع ABCD]          m3
 *                  انتبه إلى ┌──────┴──────┐ نستنتج
 *            ⚠ [ترتيب الحروف]       [القطران والمنتصف]
 *                       حالة خاصة ┌──────┴──────┐ نستخلص
 *                       ⚠ [في استقامية]     🎯 [خلاصة]
 */
import { ACTIVITY_LINES, ACTIVITY_2_LINES, KNOW1, KNOW2 } from './content/textbook';
import { EX } from './content/exercises';

const ex3 = EX['ex-3'];

export const KNOWLEDGE_GRAPH = {
  root: 'insihab',
  nodes: [
    {
      id: 'insihab', kind: 'concept', lane: 'center', requires: 'insihab-shuaa', notebook: true,
      title: 'الانسحاب يعرّف شعاعا', subtitle: "$\\vec{u} = \\overrightarrow{AA'} = \\overrightarrow{KH}$",
      reveals: ['manha'],
    },
    {
      id: 'manha', kind: 'definition', lane: 'center', requires: 'manha-ittijah', notebook: true,
      title: 'المنحى والاتجاه', subtitle: '$(d) \\parallel (d\')$',
      reveals: ['shuaa'],
    },
    {
      id: 'shuaa', kind: 'definition', lane: 'center', requires: 'shuaa', notebook: true,
      title: 'الشعاع: منحى واتجاه وطول', subtitle: '$\\overrightarrow{AB}$',
      reveals: ['tasawi'],
    },
    {
      id: 'tasawi', kind: 'definition', lane: 'center', requires: 'tasawi-shuaayn', notebook: true,
      title: 'تساوي شعاعين', subtitle: '$\\overrightarrow{AB} = \\overrightarrow{CD}$',
      reveals: ['khata', 'mutawazi'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 3, la définition (معارف 1) et la réponse du نشاط 1 2-د.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'tasawi-shuaayn',
      title: 'نفس الطول والمنحى فقط', subtitle: '$\\overrightarrow{RP}$ ، $\\overrightarrow{EF}$',
      context: {
        parts: [
          { role: 'wrong', text: ex3.commonError },
          { role: 'why', text: KNOW1.tasawi },
          { role: 'right', text: ACTIVITY_LINES.rp },
        ],
      },
      reveals: [],
    },
    {
      id: 'mutawazi', kind: 'relationship', lane: 'end', requires: 'mutawazi-adlaa', notebook: true,
      title: 'متوازي الأضلاع ABCD', subtitle: '$\\overrightarrow{AB} = \\overrightarrow{DC}$',
      reveals: ['tartib', 'mulahazat'],
    },
    {
      // ⚠ انتبه — l'ordre des lettres, tel que le module 3 l'écrit.
      id: 'tartib', kind: 'warning', lane: 'start', requires: 'mutawazi-adlaa',
      title: 'ترتيب الحروف', subtitle: 'ABCD · ABDC',
      context: { text: ACTIVITY_2_LINES.order },
      reveals: [],
    },
    {
      id: 'mulahazat', kind: 'relationship', lane: 'center', requires: 'mulahazat', notebook: true,
      title: 'القطران والمنتصف', subtitle: '$\\overrightarrow{AD} = \\overrightarrow{BC}$',
      reveals: ['istiqama', 'khulasa'],
    },
    {
      // ⚠ انتبه — la حالة خاصة de معارف 2.
      id: 'istiqama', kind: 'warning', lane: 'start', requires: 'mulahazat',
      title: 'نقط في استقامية', subtitle: 'متوازي أضلاع «مسطّح»',
      context: { text: KNOW2.special, note: KNOW2.specialLine },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la définition de l'égalité et la propriété du parallélogramme, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'mulahazat',
      title: 'خلاصة', subtitle: 'منحى · اتجاه · طول',
      context: { text: KNOW1.tasawi, note: KNOW2.property },
      reveals: [],
    },
  ],
  edges: [
    { from: 'insihab', to: 'manha', label: 'نصفه بـ' },
    { from: 'manha', to: 'shuaa', label: 'مع الطول' },
    { from: 'shuaa', to: 'tasawi', label: 'نقارن' },
    { from: 'tasawi', to: 'khata', label: 'خطأ شائع' },
    { from: 'tasawi', to: 'mutawazi', label: 'يرسم' },
    { from: 'mutawazi', to: 'tartib', label: 'انتبه إلى' },
    { from: 'mutawazi', to: 'mulahazat', label: 'نستنتج' },
    { from: 'mulahazat', to: 'istiqama', label: 'حالة خاصة' },
    { from: 'mulahazat', to: 'khulasa', label: 'نستخلص' },
  ],
};
