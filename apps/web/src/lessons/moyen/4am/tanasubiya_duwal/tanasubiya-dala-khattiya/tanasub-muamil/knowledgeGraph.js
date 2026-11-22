/**
 * La carte PROGRESSIVE du درس 1 « التناسبية ومعامل التناسبية » — docs/architecture/KNOWLEDGE_MAP.md,
 * Part A. Aucune mathématique n'est écrite ici : chaque texte vient de content/textbook.js (KNOWLEDGE,
 * MISTAKES, TAKEAWAY, ACTIVITY) — les rappels déclarés de la plateforme et la remise de l'Aïd.
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   six items (notebook) + deux exemples (la trottinette, la remise de l'Aïd) ;
 *   guide  deux خطأ شائع (le coefficient renversé, le رابع متناسب par addition — module 2 les explique),
 *          خلاصة.
 * Rien de l'إختبار أولي n'y est montré.
 *
 *                 [جدول التناسبية]                 m1
 *            مثال ┌──────┴──────┐ نحسب معامله
 *        [التروتينة]       [حساب المعامل]          m2
 *                 خطأ شائع ┌──────┴──────┐ مثال
 *              ⛔ [مقلوب]          [تخفيض العيد]
 *                                     │ نستعمل
 *                               [الخواص]
 *                                     │ نكمل به
 *                              [الرابع المتناسب]
 *                 خطأ شائع ┌──────┴──────┐ انتبه إلى
 *              ⛔ [الإضافة]         [مبلغ ثابت]
 *                                     │ وإلا نكتب
 *                               [y = a × x]
 *                                     │ نستخلص
 *                                🎯 [خلاصة]
 */
import { KNOWLEDGE, MISTAKES, TAKEAWAY } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jadwal',
  nodes: [
    {
      id: 'jadwal', kind: 'concept', lane: 'center', requires: 'jadwal-tanasub', notebook: true,
      title: 'جدول التناسبية', subtitle: 'نضرب في العدد نفسه',
      reveals: ['mithal-ride', 'muamil'],
    },
    {
      id: 'mithal-ride', kind: 'example', lane: 'start', requires: 'jadwal-tanasub',
      title: 'رحلات التروتينة', subtitle: '$15$',
      context: { text: KNOWLEDGE.jadwal.example },
      reveals: [],
    },
    {
      id: 'muamil', kind: 'method', lane: 'end', requires: 'muamil-tanasub', notebook: true,
      title: 'حساب المعامل', subtitle: '$\\dfrac{y}{x}$',
      reveals: ['khata-maqlub', 'mithal-eid'],
    },
    {
      // ⛔ خطأ شائع — le distracteur 0,4 du module 2 (MISC-TANASUB-MUAMIL-MAQLUB), expliqué.
      id: 'khata-maqlub', kind: 'common_mistake', lane: 'start', requires: 'muamil-tanasub',
      title: 'المعامل مقلوبًا', subtitle: '$0{,}4$',
      context: { parts: [{ role: 'wrong', text: MISTAKES.maqlub.wrong }, { role: 'why', text: MISTAKES.maqlub.why }, { role: 'right', text: MISTAKES.maqlub.right }] },
      reveals: [],
    },
    {
      id: 'mithal-eid', kind: 'example', lane: 'end', requires: 'muamil-tanasub',
      title: 'تخفيض العيد', subtitle: '$0{,}8$',
      context: { text: KNOWLEDGE.muamil.example },
      reveals: ['khawass'],
    },
    {
      id: 'khawass', kind: 'relationship', lane: 'center', requires: 'khawass-tanasub', notebook: true,
      title: 'خواص الجدول', subtitle: 'جمع عمودين، ضرب عمود',
      reveals: ['rabi'],
    },
    {
      id: 'rabi', kind: 'method', lane: 'center', requires: 'rabi-mutanasib', notebook: true,
      title: 'الرابع المتناسب', subtitle: 'الجداءان المتصالبان',
      reveals: ['khata-jama', 'mablagh'],
    },
    {
      // ⛔ خطأ شائع — la réponse 17 du module 2 (MISC-TANASUB-RABI-JAMA), expliquée.
      id: 'khata-jama', kind: 'common_mistake', lane: 'start', requires: 'rabi-mutanasib',
      title: 'إضافة الفرق', subtitle: '$17$',
      context: { parts: [{ role: 'wrong', text: MISTAKES.jama.wrong }, { role: 'why', text: MISTAKES.jama.why }, { role: 'right', text: MISTAKES.jama.right }] },
      reveals: [],
    },
    {
      id: 'mablagh', kind: 'relationship', lane: 'end', requires: 'mablagh-thabit', notebook: true,
      title: 'مبلغ ثابت', subtitle: 'ليست تناسبية',
      reveals: ['yax'],
    },
    {
      id: 'yax', kind: 'retain', lane: 'center', requires: 'y-ax', notebook: true,
      title: 'العلاقة بين السطرين', subtitle: '$y = a \\times x$',
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'y-ax',
      title: 'خلاصة', subtitle: 'حاصل قسمة ثابت',
      context: { text: TAKEAWAY.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jadwal', to: 'mithal-ride', label: 'مثال' },
    { from: 'jadwal', to: 'muamil', label: 'نحسب معامله' },
    { from: 'muamil', to: 'khata-maqlub', label: 'خطأ شائع' },
    { from: 'muamil', to: 'mithal-eid', label: 'مثال' },
    { from: 'mithal-eid', to: 'khawass', label: 'نستعمل' },
    { from: 'khawass', to: 'rabi', label: 'نكمل به' },
    { from: 'rabi', to: 'khata-jama', label: 'خطأ شائع' },
    { from: 'rabi', to: 'mablagh', label: 'انتبه إلى' },
    { from: 'mablagh', to: 'yax', label: 'وإلا نكتب' },
    { from: 'yax', to: 'khulasa', label: 'نستخلص' },
  ],
};
