/**
 * La carte du درس 3 « حل مشكلات بتوظيف جمل معادلتين » — docs/architecture/KNOWLEDGE_MAP.md, Part A (OUVERTE dès le départ : `knowledgeMapOpen`).
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — la manche « نادي الرسم », la حصّالة grandie, le problème « على طريقة أبي
 * كامل », les erreurs que le laboratoire refuse (content/textbook.js, content/exercises.js ; rollout 2026-11-12, nombres de la PLATEFORME). Chaque
 * nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي ni de la مسألة n'y figure.
 *
 *              [الترجمة بجملة]                         m1
 *                    │ مثال
 *               [نادي الرسم]
 *         نعمّم ┌────┴────┐ خطأ شائع
 *       [خمس مراحل]     ⛔ [ثمن يُعدّ قلمًا]
 *   خطأ شائع ┌───┴───┐ المرحلة 4
 *  ⛔ [نصف الحل]   [التحقق في النص]                    m2
 *                      │ مثال
 *                  [حصّالة القسم] → قبل ألف سنة → [على طريقة أبي كامل] → نستخلص → 🎯 [خلاصة]
 */
import { ACTIVITY_SOLUTION, MISTAKE_TARJAMA, MISTAKE_HALF, CHALLENGE, ABU_KAMIL_READING, STEPS, CHECK_RULE } from './content/textbook';
import { EX } from './content/exercises';

const coins = EX['challenge-3'];

export const KNOWLEDGE_GRAPH = {
  root: 'tarjama',
  nodes: [
    {
      id: 'tarjama', kind: 'concept', lane: 'center', requires: 'jumla-tarjama', notebook: true,
      title: 'ترجمة مشكلة بجملة', subtitle: 'معلومة ← معادلة',
      reveals: ['mathaf'],
    },
    {
      id: 'mathaf', kind: 'example', lane: 'center', requires: 'jumla-tarjama',
      title: 'أقلام نادي الرسم', subtitle: '$x + y = 12$',
      context: { text: ACTIVITY_SOLUTION.count, note: ACTIVITY_SOLUTION.money },
      reveals: ['khata', 'khutuwat'],
    },
    {
      // ⛔ خطأ شائع — ce que « تحقّق » du laboratoire refuse (MISC-JUMLA-TARJAMA).
      id: 'khata', kind: 'common_mistake', lane: 'end', requires: 'jumla-tarjama',
      title: 'ثمن يُعدّ قلمًا', subtitle: '$x + y$ لا $70x + 20y$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKE_TARJAMA.wrong },
          { role: 'why', text: MISTAKE_TARJAMA.why },
          { role: 'right', text: MISTAKE_TARJAMA.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khutuwat', kind: 'method', lane: 'start', requires: 'khutuwat-hall', notebook: true,
      title: 'خمس مراحل للحل', subtitle: 'نختار · نترجم · نحل · نتحقق · نجيب',
      reveals: ['nisf', 'tahaqquq'],
    },
    {
      // ⛔ خطأ شائع — la résolution du laboratoire refuse « انتهيت » après x seul (MISC-JUMLA-NISF-HALL).
      id: 'nisf', kind: 'common_mistake', lane: 'end', requires: 'khutuwat-hall',
      title: 'التوقف عند مجهول واحد', subtitle: '$(4 ; 8)$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKE_HALF.wrong },
          { role: 'why', text: MISTAKE_HALF.why },
          { role: 'right', text: MISTAKE_HALF.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tahaqquq', kind: 'relationship', lane: 'start', requires: 'tahaqquq-nas', notebook: true,
      title: 'التحقق في نص المشكلة', subtitle: 'القصة نفسها تتحقق',
      reveals: ['tahaddi'],
    },
    {
      id: 'tahaddi', kind: 'example', lane: 'start', requires: 'tahaqquq-nas',
      title: 'حصّالة القسم', subtitle: '$(16 ; 13)$',
      context: { text: CHALLENGE.text, note: coins.question.rows[0].correction },
      reveals: ['abu'],
    },
    {
      id: 'abu', kind: 'example', lane: 'center', requires: 'tahaqquq-nas',
      title: 'على طريقة أبي كامل', subtitle: '$(9 ; 21)$',
      context: { text: ABU_KAMIL_READING.text, note: EX['abu-kamil-2'].question.explain },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les étapes 4 et 5 de la méthode, réunies.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tahaqquq-nas',
      title: 'خلاصة', subtitle: 'نتحقق في القصة ثم نجيب',
      context: { text: STEPS.check, note: CHECK_RULE.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tarjama', to: 'mathaf', label: 'مثال' },
    { from: 'mathaf', to: 'khata', label: 'خطأ شائع' },
    { from: 'mathaf', to: 'khutuwat', label: 'نعمّم' },
    { from: 'khutuwat', to: 'nisf', label: 'خطأ شائع' },
    { from: 'khutuwat', to: 'tahaqquq', label: 'المرحلة 4' },
    { from: 'tahaqquq', to: 'tahaddi', label: 'مثال' },
    { from: 'tahaddi', to: 'abu', label: 'قبل ألف سنة' },
    { from: 'abu', to: 'khulasa', label: 'نستخلص' },
  ],
};
