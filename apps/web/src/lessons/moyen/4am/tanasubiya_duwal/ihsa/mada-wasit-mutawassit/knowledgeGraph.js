/**
 * La carte PROGRESSIVE du درس « مدى ووسيط ومتوسط سلسلة إحصائية » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon (content/textbook.js, content/exercises.js).
 *   core   huit items (notebook) + l'exemple 1 de معارف 4 (corrigé) ;
 *   guide  خطأ شائع « moyenne sans pondération » (أستعدّ 2), خطأ شائع « médiane sans ranger » (تمرين 9),
 *          خلاصة (طرائق : 50 % au moins de chaque côté).
 * Rien de l'إختبار أولي (30 ; 5,3 ; 49 ; 8 < 10) n'est montré ici.
 *
 *   [مدى الرواتب] m1 → [المتوسط المتوازن] m1 ──خطأ شائع──▶ ⛔ [دون تكرارات]
 *        │ نعمّم
 *   [مدى سلسلة] m2 → [الوسيط] m2 ──مثال──▶ [مثال 1]
 *        │                 │ في فئات
 *        │          [مراكز الفئات] → [الفئة الوسيطية] m2
 *        │                                  │ نحسب بالرتب
 *        └───────────────────────── [الوسيط بالرتب] m3 ──خطأ شائع──▶ ⛔ [دون ترتيب]
 *                                           │ نقارن
 *                                   [قيمة بعيدة] m3 → 🎯 [خلاصة]
 */
import { ACT3_LINES, MEAN_REMINDER, PREP_ITEMS, KNOW3, KNOW4, ACT4_LINES, METHOD_1B, METHOD_2 } from './content/textbook';
import { EX } from './content/exercises';

const ex9 = EX['ex-9'];

export const KNOWLEDGE_GRAPH = {
  root: 'mada1',
  nodes: [
    {
      id: 'mada1', kind: 'concept', lane: 'center', requires: 'mada-nashat', notebook: true,
      title: 'مدى سلسلة الرواتب', subtitle: '$75000 - 30000 = 45000$',
      context: { text: ACT3_LINES.salary },
      reveals: ['mutawassit'],
    },
    {
      id: 'mutawassit', kind: 'definition', lane: 'center', requires: 'mutawassit-mutawazin', notebook: true,
      title: 'المتوسط المتوازن', subtitle: 'نقطة توازن القيم',
      context: { text: MEAN_REMINDER.text, note: MEAN_REMINDER.balance },
      reveals: ['khata-tarjih', 'mada'],
    },
    {
      // ⛔ خطأ شائع — أستعدّ 2 (le manuel) : 4,5 est la moyenne des quatre valeurs sans leurs effectifs.
      id: 'khata-tarjih', kind: 'common_mistake', lane: 'end', requires: 'mutawassit-mutawazin',
      title: 'متوسط دون تكرارات', subtitle: 'أستعدّ 2',
      context: {
        parts: [
          { role: 'wrong', text: PREP_ITEMS[1].text },
          { role: 'why', text: PREP_ITEMS[1].why },
          { role: 'right', text: MEAN_REMINDER.text },
        ],
      },
      reveals: [],
    },
    {
      id: 'mada', kind: 'definition', lane: 'start', requires: 'mada', notebook: true,
      title: 'مدى سلسلة إحصائية', subtitle: 'أكبر قيمة − أصغر قيمة',
      context: { text: KNOW3.definition, note: KNOW3.note },
      reveals: ['wasit'],
    },
    {
      id: 'wasit', kind: 'definition', lane: 'center', requires: 'wasit', notebook: true,
      title: 'وسيط سلسلة', subtitle: 'Med',
      context: { text: KNOW4.definition, note: KNOW4.notes[1] },
      reveals: ['mithal-wasit', 'markaz'],
    },
    {
      id: 'mithal-wasit', kind: 'example', lane: 'start', requires: 'wasit',
      title: 'مثال الكتاب', subtitle: 'تسع قيم ثم عشر قيم',
      context: { text: KNOW4.example1 },
      reveals: [],
    },
    {
      id: 'markaz', kind: 'method', lane: 'end', requires: 'markaz-fia', notebook: true,
      title: 'مراكز الفئات', subtitle: 'الوزن المتوسط',
      context: { text: ACT4_LINES.centers, note: ACT4_LINES.weightsMean },
      reveals: ['fia'],
    },
    {
      id: 'fia', kind: 'concept', lane: 'end', requires: 'fia-wasitiya', notebook: true,
      title: 'الفئة الوسيطية', subtitle: '$42 \\le P < 46$',
      context: { text: KNOW4.notes[2], note: ACT4_LINES.medianClass },
      reveals: ['rutba'],
    },
    {
      id: 'rutba', kind: 'method', lane: 'center', requires: 'wasit-rutba', notebook: true,
      title: 'الوسيط بالرتب', subtitle: 'N فردي أو زوجي',
      context: { text: METHOD_2.rule, note: METHOD_2.solution[1] },
      reveals: ['khata-tartib', 'mutatarrifa'],
    },
    {
      // ⛔ خطأ شائع — تمرين 9 (commonError) : la valeur écrite au milieu d'une série NON rangée.
      id: 'khata-tartib', kind: 'common_mistake', lane: 'start', requires: 'wasit-rutba',
      title: 'وسيط دون ترتيب', subtitle: 'تمرين 9',
      context: {
        parts: [
          { role: 'wrong', text: ex9.commonError },
          { role: 'why', text: METHOD_2.rule },
          { role: 'right', text: ex9.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'mutatarrifa', kind: 'relationship', lane: 'end', requires: 'qiyam-mutatarrifa', notebook: true,
      title: 'قيمة بعيدة', subtitle: 'يتغيّر المتوسط ويبقى الوسيط',
      context: { text: METHOD_1B.solution[0], note: METHOD_1B.solution[1] },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la dernière ligne de طرائق (50 % au moins de chaque côté).
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qiyam-mutatarrifa',
      title: 'خلاصة', subtitle: 'ثلاثة مؤشرات',
      context: { text: METHOD_1B.solution[2], note: KNOW3.note },
      reveals: [],
    },
  ],
  edges: [
    { from: 'mada1', to: 'mutawassit', label: 'ثم' },
    { from: 'mutawassit', to: 'khata-tarjih', label: 'خطأ شائع' },
    { from: 'mutawassit', to: 'mada', label: 'نعمّم' },
    { from: 'mada', to: 'wasit', label: 'مؤشّر آخر' },
    { from: 'wasit', to: 'mithal-wasit', label: 'مثال' },
    { from: 'wasit', to: 'markaz', label: 'في فئات' },
    { from: 'markaz', to: 'fia', label: 'والوسيط' },
    { from: 'fia', to: 'rutba', label: 'بالرتب' },
    { from: 'rutba', to: 'khata-tartib', label: 'خطأ شائع' },
    { from: 'rutba', to: 'mutatarrifa', label: 'نقارن' },
    { from: 'mutatarrifa', to: 'khulasa', label: 'نستخلص' },
  ],
};
