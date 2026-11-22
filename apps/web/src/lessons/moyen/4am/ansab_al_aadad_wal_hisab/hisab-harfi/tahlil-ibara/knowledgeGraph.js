/**
 * La carte PROGRESSIVE du درس 3 « تحليل عبارة جبرية » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le
 * نشاط 3, معارف 3 et les طرائق pp. 35–36 (content/textbook.js), les
 * `commonError` / `method` des exercices (content/exercises.js), « أستعدّ »
 * et « أؤكّد تعلّماتي » (item 9, qui n'est PAS dans l'évaluation). Chaque
 * nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   cinq items (notebook) + cinq exemples du manuel ;
 *   guide  تذكّر (x(x + 3) = x² + 3x, « أستعدّ » 9), خطأ شائع (le 1 oublié —
 *          ex. 22 C), انتبه (x² + 25 — QCM 9), تحقّق (une valeur de x —
 *          ex. 21), خلاصة (les deux règles « طريقة »).
 * Rien de l'إختبار أولي (ab + b, a − ab, x² ± 10x + 25, x² − 25, (x + 4)…)
 * n'est montré ici.
 *
 *                      [تحليل عبارة]                      m1
 *                           │ مثال
 *                      [كرّاس إيمان]
 *                           │ نعمّم
 *                    [استخراج عامل مشترك]                 m2
 *                           │ مثال
 *                   [العامل المشترك 2x]
 *           يعتمد على ┌─────┴─────┐ خطأ شائع
 *  📌 [النشر عكس التحليل]     ⛔ [الحد 1 المنسي]
 *                     └─────┐ وبالعكس
 *                  [التحليل بالمتطابقات]
 *                           │ مثال
 *                     [مربع مجموع]
 *          انتبه إلى ┌──────┴──────┐ طريقة
 *     ⚠ [مجموع مربّعين]     [طريقة العامل المشترك]        m3
 *                                 │ مثال …
 */
import { ACTIVITY, KNOWLEDGE, METHOD_COMMON_FACTOR, METHOD_IDENTITIES, PREP_ITEMS, QCM } from './content/textbook';
import { EX } from './content/exercises';

const prep9 = PREP_ITEMS[0];
const ex22C = EX['ex-22-C'];
const ex21 = EX['ex-21-1'];

export const KNOWLEDGE_GRAPH = {
  root: 'tahlil',
  nodes: [
    {
      id: 'tahlil', kind: 'definition', lane: 'center', requires: 'tahlil-taarif', notebook: true,
      title: 'تحليل عبارة', subtitle: 'مجموع ← جداء',
      context: { text: KNOWLEDGE.definition, note: ACTIVITY.closing },
      reveals: ['imane'],
    },
    {
      id: 'imane', kind: 'example', lane: 'end', requires: 'tahlil-taarif',
      title: 'كرّاس إيمان', subtitle: '$3{,}5 \\times 2 = 7$',
      context: { text: ACTIVITY.figure },
      reveals: ['tawzii'],
    },
    {
      id: 'tawzii', kind: 'relationship', lane: 'center', requires: 'khassiya-tawziiya', notebook: true,
      title: 'استخراج عامل مشترك', subtitle: '$ka + kb = k(a + b)$',
      reveals: ['ex6x'],
    },
    {
      id: 'ex6x', kind: 'example', lane: 'center', requires: 'khassiya-tawziiya',
      title: 'العامل المشترك 2x', subtitle: '$2x(3x + 2)$',
      context: { text: KNOWLEDGE.examples[0], note: KNOWLEDGE.examples[1] },
      reveals: ['khata-amil', 'tadhakkar'],
    },
    {
      // 📌 تذكّر — « أستعدّ » item 9 du manuel : le نشر, lu dans l'autre sens.
      id: 'tadhakkar', kind: 'prerequisite', lane: 'start', requires: 'khassiya-tawziiya',
      title: 'النشر عكس التحليل', subtitle: '$x(x + 3) = x^2 + 3x$',
      context: { text: prep9.text, note: prep9.why },
      reveals: ['mutatabiqat'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 22 (C) et son distracteur 5x(2x + 1).
      id: 'khata-amil', kind: 'common_mistake', lane: 'end', requires: 'khassiya-tawziiya',
      title: 'الحد 1 المنسي', subtitle: '$(2x + 1)(5x + 1)$',
      context: {
        parts: [
          { role: 'wrong', text: ex22C.commonError },
          { role: 'why', text: ex22C.method },
          { role: 'right', text: ex22C.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'mutatabiqat', kind: 'relationship', lane: 'center', requires: 'tahlil-mutatabiqat', notebook: true,
      title: 'التحليل بالمتطابقات', subtitle: '$a^2 - b^2 = (a + b)(a - b)$',
      reveals: ['ex9x'],
    },
    {
      id: 'ex9x', kind: 'example', lane: 'center', requires: 'tahlil-mutatabiqat',
      title: 'مربع مجموع', subtitle: '$(3x + 1)^2$',
      context: { text: KNOWLEDGE.examples[2], note: KNOWLEDGE.examples[4] },
      reveals: ['majmu', 'tariqa1'],
    },
    {
      // ⚠ انتبه — « أؤكّد تعلّماتي » item 9 (exercice formatif du module 4, hors évaluation).
      id: 'majmu', kind: 'warning', lane: 'start', requires: 'tahlil-mutatabiqat',
      title: 'مجموع مربّعين', subtitle: '$x^2 + 25$',
      context: { text: QCM[9].explain },
      reveals: [],
    },
    {
      id: 'tariqa1', kind: 'method', lane: 'end', requires: 'tariqat-amil-mushtarak', notebook: true,
      title: 'طريقة العامل المشترك',
      reveals: ['exB'],
    },
    {
      id: 'exB', kind: 'example', lane: 'end', requires: 'tariqat-amil-mushtarak',
      title: 'العبارة B', subtitle: '$(x - 5)(x + 3)$',
      context: { text: METHOD_COMMON_FACTOR.solution[1] },
      reveals: ['tariqa2'],
    },
    {
      id: 'tariqa2', kind: 'method', lane: 'center', requires: 'tariqat-mutatabiqat', notebook: true,
      title: 'طريقة المتطابقات',
      reveals: ['exC'],
    },
    {
      id: 'exC', kind: 'example', lane: 'center', requires: 'tariqat-mutatabiqat',
      title: 'العبارة C', subtitle: '$15(x - 1)(x + 1)$',
      context: { text: METHOD_IDENTITIES.solution[2] },
      reveals: ['tahaqqaq'],
    },
    {
      // 🔍 تحقّق — la méthode de l'exercice 21 : une valeur de x dans les deux écritures.
      id: 'tahaqqaq', kind: 'check', lane: 'end', requires: 'tariqat-mutatabiqat',
      title: 'نتحقّق بقيمة لـ x', subtitle: '$x = 0$',
      context: { text: ex21.method, note: ex21.question.explain },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les deux encadrés « طريقة » des pp. 35 et 36, réunis.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-mutatabiqat',
      title: 'طريقتان للتحليل', subtitle: 'عامل مشترك · متطابقة شهيرة',
      context: { text: METHOD_COMMON_FACTOR.rule, note: METHOD_IDENTITIES.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tahlil', to: 'imane', label: 'مثال' },
    { from: 'imane', to: 'tawzii', label: 'نعمّم' },
    { from: 'tawzii', to: 'ex6x', label: 'مثال' },
    { from: 'ex6x', to: 'tadhakkar', label: 'يعتمد على' },
    { from: 'ex6x', to: 'khata-amil', label: 'خطأ شائع' },
    { from: 'tadhakkar', to: 'mutatabiqat', label: 'وبالعكس' },
    { from: 'mutatabiqat', to: 'ex9x', label: 'مثال' },
    { from: 'ex9x', to: 'majmu', label: 'انتبه إلى' },
    { from: 'ex9x', to: 'tariqa1', label: 'طريقة' },
    { from: 'tariqa1', to: 'exB', label: 'مثال' },
    { from: 'exB', to: 'tariqa2', label: 'طريقة ثانية' },
    { from: 'tariqa2', to: 'exC', label: 'مثال' },
    { from: 'exC', to: 'tahaqqaq', label: 'نتحقق منه بـ' },
    { from: 'tahaqqaq', to: 'khulasa', label: 'نستخلص' },
  ],
};
