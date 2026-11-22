/**
 * La carte PROGRESSIVE du درس 2 « مفهوم وتعيين الدالة الخطية » — docs/architecture/KNOWLEDGE_MAP.md,
 * Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 corrigé et ses
 * calculs (content/textbook.js › ACTIVITY, ACTIVITY_LINES), معارف 1 et 2 (KNOWLEDGE), la صورة
 * (IMAGE_METHOD), la طريقة (METHOD) et la condition m ≠ 0 (ZERO_NOTE), et le `commonError` / la
 * correction de l'exercice 7 (content/exercises.js). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit (`requires`).
 *
 *   core   cinq items (notebook) + trois exemples (معارف 1, معارف 2, la طريقة) ;
 *   guide  خطأ شائع « 3x + √2 est linéaire » (تمرين 7), انتبه « m ≠ 0 », خلاصة.
 * Rien de l'إختبار أولي (−9 et −6, 8 et 14, n/m, le tableau −5 / 25 / 10) n'est montré ici.
 *
 *                 [دالة التخفيض]                       m1
 *                        │ نعمّم
 *                 [الدالة الخطية]                      m2
 *          مثال ┌────────┴────────┐ صورة عدد
 *        [أمثلة الكتاب]       [صورة عدد]
 *   خطأ شائع │                    │ نجمعها في
 *     ⛔ [3x + √2]       [جدول قيمها تناسبي]
 *                       مثال ┌────┴────┐ نعكسه
 *                    [جدول −3x]   [تعيين a من عدد وصورته]
 *                       انتبه إلى ┌────┴────┐ مثال
 *                         ⚠ [m ≠ 0]    [g(−2) = 6]
 *                                          │ نستخلص
 *                                      🎯 [خلاصة]
 */
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, IMAGE_METHOD, METHOD, ZERO_NOTE } from './content/textbook';
import { EX } from './content/exercises';

const ex7 = EX['ex-7'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'dala-nashat', notebook: true,
      title: 'دالة التخفيض', subtitle: '$f(x) = 0{,}8x$',
      context: { text: ACTIVITY.naming, note: ACTIVITY_LINES.formula },
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'definition', lane: 'center', requires: 'dala-khattiya', notebook: true,
      title: 'الدالة الخطية', subtitle: '$x \\longmapsto ax$',
      reveals: ['mithal-tarif', 'sura'],
    },
    {
      id: 'mithal-tarif', kind: 'example', lane: 'start', requires: 'dala-khattiya',
      title: 'أمثلة الكتاب', subtitle: '$a = 80$',
      context: { text: KNOWLEDGE.linear.examples[0], note: KNOWLEDGE.linear.examples[1] },
      reveals: ['khata-ex7'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 7 : une expression qui « contient 3x ».
      id: 'khata-ex7', kind: 'common_mistake', lane: 'start', requires: 'dala-khattiya',
      title: 'ليست خطية رغم 3x', subtitle: '$3x + \\sqrt{2}$',
      context: {
        parts: [
          { role: 'wrong', text: ex7.commonError },
          { role: 'why', text: ex7.question.rows[1].correction },
          { role: 'right', text: ex7.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'sura', kind: 'method', lane: 'end', requires: 'hisab-sura', notebook: true,
      title: 'صورة عدد', subtitle: '$f(m) = a \\times m$',
      reveals: ['jadwal'],
    },
    {
      id: 'jadwal', kind: 'relationship', lane: 'center', requires: 'jadwal-khattiya', notebook: true,
      title: 'جدول قيمها تناسبي', subtitle: '$\\times a$',
      reveals: ['mithal-jadwal', 'tayin'],
    },
    {
      id: 'mithal-jadwal', kind: 'example', lane: 'start', requires: 'jadwal-khattiya',
      title: 'جدول الدالة −3x', subtitle: '$a = -3$',
      context: { text: KNOWLEDGE.table.example, note: IMAGE_METHOD.example },
      reveals: [],
    },
    {
      id: 'tayin', kind: 'method', lane: 'end', requires: 'tayin-dala', notebook: true,
      title: 'تعيين a من عدد وصورته', subtitle: '$am = n$',
      reveals: ['intabih', 'mithal-tayin'],
    },
    {
      // ⚠ انتبه — la condition m ≠ 0 (la carte 0 du lab : 0 ⟼ 0 pour tout a).
      id: 'intabih', kind: 'warning', lane: 'start', requires: 'tayin-dala',
      title: 'العدد m غير معدوم', subtitle: '$m \\neq 0$',
      context: { text: ZERO_NOTE.text },
      reveals: [],
    },
    {
      id: 'mithal-tayin', kind: 'example', lane: 'end', requires: 'tayin-dala',
      title: 'مثال الطريقة', subtitle: '$a = -3$',
      context: { text: METHOD.exercise, list: METHOD.solution },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la phrase qui nomme (نشاط 1), puis la طريقة.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tayin-dala',
      title: 'خلاصة', subtitle: '$f(x) = ax$',
      context: { text: ACTIVITY.closing, note: METHOD.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'tarif', label: 'نعمّم' },
    { from: 'tarif', to: 'mithal-tarif', label: 'مثال' },
    { from: 'mithal-tarif', to: 'khata-ex7', label: 'خطأ شائع' },
    { from: 'tarif', to: 'sura', label: 'صورة عدد' },
    { from: 'sura', to: 'jadwal', label: 'نجمعها في' },
    { from: 'jadwal', to: 'mithal-jadwal', label: 'مثال' },
    { from: 'jadwal', to: 'tayin', label: 'نعكسه' },
    { from: 'tayin', to: 'intabih', label: 'انتبه إلى' },
    { from: 'tayin', to: 'mithal-tayin', label: 'مثال' },
    { from: 'mithal-tayin', to: 'khulasa', label: 'نستخلص' },
  ],
};
