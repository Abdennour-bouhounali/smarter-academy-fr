/**
 * La carte PROGRESSIVE du درس 3 « استعمال المجدولات (Excel) » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — `content/textbook.js` (KNOW,
 * EX7_RANGE_TRAP, EX7_MAX_TRAP, EX15) et `content/exercises.js` (explications). Chaque nœud est gardé par
 * l'item de knowledge.jsx qui l'établit. Rien de l'إختبار أولي n'y est.
 *
 *                         [حجز وحفظ]                                  m1
 *                             │ في
 *                     [الخلية والمجال]
 *                             │ نحسب عليه بـ
 *                         [الدستور]
 *                             │ ثم
 *                   [دساتير المؤشّرات]
 *          خطأ شائع ┌─────────┴─────────┐ منها
 *           ⛔[مجال ناقص]             [المنوال]
 *               │ وأيضًا                  │ ثم
 *         ⛔[أكبر قيمة بدل المدى]  [يعيد الحساب]
 *                                         │ ثم نرسم
 *                           [التمثيل المناسب]                          m2
 *                      مثال ┌──────┴──────┐ نقول أيضًا
 *                 [نفايات الشاطئ]    [أسماء الدوال]                    m3
 *                                         │ دون مجدول
 *                               [ذاكرة الحاسبة] ─نستخلص→ 🎯 [خلاصة]     m4
 */
import { KNOW, EX7_RANGE_TRAP, EX7_MAX_TRAP, EX15, CALC } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'hajz',
  nodes: [
    {
      id: 'hajz', kind: 'method', lane: 'center', requires: 'hajz-hifz', notebook: true,
      title: 'حجز سلسلة وحفظها',
      reveals: ['khaliya'],
    },
    {
      id: 'khaliya', kind: 'concept', lane: 'center', requires: 'khaliya-majal', notebook: true,
      title: 'الخلية والمجال',
      reveals: ['dustur'],
    },
    {
      id: 'dustur', kind: 'definition', lane: 'center', requires: 'dustur', notebook: true,
      title: 'الدستور',
      reveals: ['arbaa'],
    },
    {
      id: 'arbaa', kind: 'relationship', lane: 'center', requires: 'dasatir-arbaa', notebook: true,
      title: 'دساتير المؤشّرات الأربعة',
      reveals: ['khata-majal', 'manwal'],
    },
    {
      // ⛔ خطأ شائع — la plage qui oublie G1 (le lab, ex-7).
      id: 'khata-majal', kind: 'common_mistake', lane: 'start', requires: 'dasatir-arbaa',
      title: 'مجال ناقص',
      context: { parts: [{ role: 'wrong', text: EX7_RANGE_TRAP.wrong }, { role: 'why', text: EX7_RANGE_TRAP.why }, { role: 'right', text: EX7_RANGE_TRAP.right }] },
      reveals: ['khata-max'],
    },
    {
      // ⛔ خطأ شائع — MAX seul n'est pas l'étendue.
      id: 'khata-max', kind: 'common_mistake', lane: 'start', requires: 'dasatir-arbaa',
      title: 'أكبر قيمة بدل المدى',
      context: { parts: [{ role: 'wrong', text: EX7_MAX_TRAP.wrong }, { role: 'why', text: EX7_MAX_TRAP.why }, { role: 'right', text: EX7_MAX_TRAP.right }] },
      reveals: [],
    },
    {
      id: 'manwal', kind: 'definition', lane: 'end', requires: 'manwal', notebook: true,
      title: 'المنوال',
      reveals: ['iada'],
    },
    {
      id: 'iada', kind: 'idea', lane: 'center', requires: 'iadat-hisab', notebook: true,
      title: 'المجدول يعيد الحساب',
      reveals: ['tamthil'],
    },
    {
      id: 'tamthil', kind: 'relationship', lane: 'center', requires: 'tamthil-munasib', notebook: true,
      title: 'التمثيل البياني المناسب',
      reveals: ['shati', 'asmaa'],
    },
    {
      id: 'shati', kind: 'example', lane: 'start', requires: 'tamthil-munasib',
      title: 'نفايات الشاطئ',
      context: { text: EX15.answers.why, note: EX15.answers.angles },
      reveals: [],
    },
    {
      id: 'asmaa', kind: 'term', lane: 'end', requires: 'asmaa-dawal', notebook: true,
      title: 'أسماء الدوال',
      reveals: ['dhakira'],
    },
    {
      id: 'dhakira', kind: 'method', lane: 'center', requires: 'dhakira-hasiba', notebook: true,
      title: 'ذاكرة الحاسبة',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les phrases des معارف de la plateforme.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'dhakira-hasiba',
      title: 'خلاصة',
      context: { text: KNOW.formula, list: [...KNOW.four, ...KNOW.charts], note: CALC.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'hajz', to: 'khaliya', label: 'في' },
    { from: 'khaliya', to: 'dustur', label: 'نحسب عليه بـ' },
    { from: 'dustur', to: 'arbaa', label: 'ثم' },
    { from: 'arbaa', to: 'khata-majal', label: 'خطأ شائع' },
    { from: 'khata-majal', to: 'khata-max', label: 'وأيضًا' },
    { from: 'arbaa', to: 'manwal', label: 'منها' },
    { from: 'manwal', to: 'iada', label: 'ثم' },
    { from: 'iada', to: 'tamthil', label: 'ثم نرسم' },
    { from: 'tamthil', to: 'shati', label: 'مثال' },
    { from: 'tamthil', to: 'asmaa', label: 'نقول أيضًا' },
    { from: 'asmaa', to: 'dhakira', label: 'دون مجدول' },
    { from: 'dhakira', to: 'khulasa', label: 'نستخلص' },
  ],
};
