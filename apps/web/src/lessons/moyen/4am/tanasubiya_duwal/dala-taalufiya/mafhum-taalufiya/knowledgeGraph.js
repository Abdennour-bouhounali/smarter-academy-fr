/**
 * La carte PROGRESSIVE du درس 1 « مفهوم وتعيين دالة تآلفية » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 et ses calculs
 * (content/textbook.js › ACTIVITY, ACTIVITY_LINES), le نشاط 2 et ses corrections (ACTIVITY2), les معارف
 * écrites par la plateforme (KNOWLEDGE, IMAGE_METHOD, METHOD, CONSTANT_NOTE) et les erreurs que la leçon
 * explique (MISTAKES). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   sept items (notebook) + l'exemple de la méthode ;
 *   guide  deux خطأ شائع (a et b inversés ; la صورة sans b), انتبه (a ≠ 0), خلاصة.
 * Rien de l'إختبار أولي n'est montré ici.
 *
 *                       [أجرة العامل]                         m1
 *                             │ نسمّي معاملَيها
 *                       [المعاملان a و b]                     m2
 *              خطأ شائع ┌─────┴─────┐ حالة خاصة
 *                ⛔ [2 + 3x]     [الخطية b = 0]
 *                                     │ وحالة أخرى
 *                               [الثابتة a = 0]
 *                                     │ نعرّف
 *                             [الدالة التآلفية]               m3
 *                     صورة عدد ┌──────┴──────┐ نعكسه
 *                       [صورة عدد]   [العدد الذي صورته m]
 *                  خطأ شائع │        انتبه إلى ├──────┐ مثال
 *                     ⛔ [بلا b]       ⚠ [a ≠ 0]   [37775 ← 15] → نستخلص → 🎯 خلاصة
 */
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, IMAGE_METHOD, METHOD, CONSTANT_NOTE, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ujra',
  nodes: [
    {
      id: 'ujra', kind: 'concept', lane: 'center', requires: 'dala-ujra', notebook: true,
      title: 'أجرة العامل', subtitle: '$S(x) = 185x + 35000$',
      context: { text: ACTIVITY.naming, note: ACTIVITY_LINES.formula },
      reveals: ['muamilan'],
    },
    {
      id: 'muamilan', kind: 'term', lane: 'center', requires: 'muamilan', notebook: true,
      title: 'المعاملان a و b', subtitle: '$ax + b$',
      reveals: ['khata-ab', 'khattiya'],
    },
    {
      // ⛔ خطأ شائع — la correction de هـ) du نشاط 2 : a et b lus dans l'ordre d'écriture.
      id: 'khata-ab', kind: 'common_mistake', lane: 'start', requires: 'muamilan',
      title: 'a و b مقلوبان', subtitle: '$2 + 3x$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.ab.wrong },
          { role: 'why', text: MISTAKES.ab.why },
          { role: 'right', text: MISTAKES.ab.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khattiya', kind: 'relationship', lane: 'end', requires: 'khattiya-taalufiya', notebook: true,
      title: 'الخطية حالة خاصة', subtitle: '$b = 0$',
      reveals: ['thabita'],
    },
    {
      id: 'thabita', kind: 'relationship', lane: 'end', requires: 'thabita', notebook: true,
      title: 'الثابتة حالة خاصة', subtitle: '$a = 0$',
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'definition', lane: 'center', requires: 'taarif-taalufiya', notebook: true,
      title: 'الدالة التآلفية', subtitle: '$x \\longmapsto ax + b$',
      context: { text: KNOWLEDGE.definition.lines[0], note: KNOWLEDGE.definition.examples[1] },
      reveals: ['sura', 'sabiq'],
    },
    {
      id: 'sura', kind: 'method', lane: 'start', requires: 'sura-taalufiya', notebook: true,
      title: 'صورة عدد', subtitle: '$f(m) = am + b$',
      reveals: ['khata-b'],
    },
    {
      // ⛔ خطأ شائع — MISC-TAALUFI-NISYAN-B : la صورة calculée sans b (module 3, sa correction).
      id: 'khata-b', kind: 'common_mistake', lane: 'start', requires: 'sura-taalufiya',
      title: 'نسيان b', subtitle: '$f(4) = 15$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.b.wrong },
          { role: 'why', text: MISTAKES.b.why },
          { role: 'right', text: MISTAKES.b.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sabiq', kind: 'method', lane: 'end', requires: 'sabiq-taalufiya', notebook: true,
      title: 'العدد الذي صورته m', subtitle: '$ax + b = m$',
      reveals: ['intabih', 'mithal-sabiq'],
    },
    {
      // ⚠ انتبه — la condition a ≠ 0 de la méthode (le cas ثابتة).
      id: 'intabih', kind: 'warning', lane: 'end', requires: 'sabiq-taalufiya',
      title: 'المعامل a غير معدوم', subtitle: '$a \\neq 0$',
      context: { text: CONSTANT_NOTE.text },
      reveals: [],
    },
    {
      id: 'mithal-sabiq', kind: 'example', lane: 'center', requires: 'sabiq-taalufiya',
      title: 'مثال الطريقة', subtitle: '$x = 15$',
      context: { text: METHOD.exercise, list: METHOD.solution },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la phrase qui nomme (نشاط 1) et l'image (معارف).
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'sabiq-taalufiya',
      title: 'خلاصة', subtitle: '$f(x) = ax + b$',
      context: { text: ACTIVITY.naming, note: IMAGE_METHOD.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ujra', to: 'muamilan', label: 'نسمّي معاملَيها' },
    { from: 'muamilan', to: 'khata-ab', label: 'خطأ شائع' },
    { from: 'muamilan', to: 'khattiya', label: 'حالة خاصة' },
    { from: 'khattiya', to: 'thabita', label: 'وحالة أخرى' },
    { from: 'thabita', to: 'tarif', label: 'نعرّف' },
    { from: 'tarif', to: 'sura', label: 'صورة عدد' },
    { from: 'sura', to: 'khata-b', label: 'خطأ شائع' },
    { from: 'tarif', to: 'sabiq', label: 'نعكسه' },
    { from: 'sabiq', to: 'intabih', label: 'انتبه إلى' },
    { from: 'sabiq', to: 'mithal-sabiq', label: 'مثال' },
    { from: 'mithal-sabiq', to: 'khulasa', label: 'نستخلص' },
  ],
};
