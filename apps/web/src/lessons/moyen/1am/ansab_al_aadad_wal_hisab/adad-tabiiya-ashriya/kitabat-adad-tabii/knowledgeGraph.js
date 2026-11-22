/**
 * La carte PROGRESSIVE du درس « كتابة الأعداد الطبيعية ودلالة الأرقام » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (نشاط 1, معارف 1 et 4 a, le مفكوك déclaré, la
 * طريقة رقم / عدد, les phrases de correction `GUIDE` partagées avec les modules).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                     [نظام العدّ العشري] (M1)                       مفهوم
 *                          الموقع │
 *              [قيمة الرقم حسب موقعه] (M1) ──خطأ شائع──┐
 *             في جدول │               ⛔ [نكتب الأعداد جنبًا إلى جنب؟]
 *                     │                  │ وأيضًا
 *              [جدول المراتب] (M2)    ⛔ [765 بدل 7065؟]
 *          للقراءة ┌───┴───┐ للتفكيك
 *   [فئات من ثلاثة] (M2)   [المفكوك النموذجي] (M2)
 *        مثال │                │ ولعدد الوحدات
 *   [4 908 732]          [رقم المرتبة وعدد وحداتها] (M3)
 *                     خطأ شائع ┌───┘
 *             ⛔ [عدد العشرات = رقم العشرات؟]
 *                      وأكبر └───┐
 *                     [المليون والمليار] (M5)
 *                    نستخلص └───┐
 *                          🎯 [الخلاصة]
 */
import { WORKSHOP, KNOWLEDGE, RANKS, DECOMPOSITION, BIG, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'nizam',
  nodes: [
    {
      id: 'nizam', kind: 'concept', lane: 'center', requires: 'tabadul', notebook: true,
      title: 'نظام العدّ العشري', subtitle: 'عشرة بواحدة',
      context: { text: KNOWLEDGE.digits, note: 'ربطنا كل عشرة أقلام في حزمة، وكل عشر حزم في علبة.' },
      reveals: ['mawdi'],
    },
    {
      id: 'mawdi', kind: 'relationship', lane: 'start', requires: 'qima-mawdi', notebook: true,
      title: 'قيمة الرقم حسب موقعه', subtitle: '7 ، 70',
      context: { text: WORKSHOP.sevens, note: RANKS.box },
      reveals: ['khataConcat', 'jadwal'],
    },
    {
      // ⛔ خطأ شائع — l'option réfutée de la découverte du labo (lire les quantités telles quelles) : `GUIDE.concat`.
      id: 'khataConcat', kind: 'common_mistake', lane: 'end', requires: 'tabadul',
      title: 'نكتب الأعداد جنبًا إلى جنب؟', subtitle: '1132437 ؟',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.concat.wrong },
          { role: 'why', text: GUIDE.concat.why },
          { role: 'right', text: GUIDE.concat.right },
        ],
      },
      reveals: ['khataZero'],
    },
    {
      // ⛔ خطأ شائع — le zéro oublié (استحضر مكتسباتي item 3, la dictée du labo) : `GUIDE.zero`.
      id: 'khataZero', kind: 'common_mistake', lane: 'end', requires: 'jadwal-maratib',
      title: '765 بدل 7065؟', subtitle: 'الصفر يحفظ المكان',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.zero.wrong },
          { role: 'why', text: GUIDE.zero.why },
          { role: 'right', text: GUIDE.zero.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'jadwal', kind: 'concept', lane: 'center', requires: 'jadwal-maratib', notebook: true,
      title: 'جدول المراتب', subtitle: '$6\\,392{,}459$',
      context: { text: RANKS.roles },
      reveals: ['fiaat', 'mafkuk'],
    },
    {
      id: 'fiaat', kind: 'relationship', lane: 'start', requires: 'fiaat', notebook: true,
      title: 'فئات من ثلاثة أرقام', subtitle: 'من اليمين',
      context: { text: KNOWLEDGE.reading },
      reveals: ['exFiaat'],
    },
    {
      id: 'exFiaat', kind: 'example', lane: 'start', requires: 'fiaat',
      title: 'مثال الكتاب', subtitle: '$4\\,908\\,732$',
      context: { text: KNOWLEDGE.readingExamples[1].words, note: KNOWLEDGE.readingExamples[0].words },
      reveals: [],
    },
    {
      id: 'mafkuk', kind: 'relationship', lane: 'end', requires: 'mafkuk', notebook: true,
      title: 'المفكوك النموذجي', subtitle: '$6 \\times 1000 + \\dots$',
      context: { text: DECOMPOSITION.example, note: DECOMPOSITION.zero },
      reveals: ['raqmAdad'],
    },
    {
      id: 'raqmAdad', kind: 'method', lane: 'center', requires: 'raqm-adad', notebook: true,
      title: 'رقم المرتبة وعدد وحداتها', subtitle: '2017 : 1 و 201',
      reveals: ['khataDigit'],
    },
    {
      // ⛔ خطأ شائع — رقم العشرات pris pour عدد العشرات (استحضر مكتسباتي items 1–2, l'ouverture de 2017 au labo).
      id: 'khataDigit', kind: 'common_mistake', lane: 'start', requires: 'raqm-adad',
      title: 'عدد العشرات = رقم العشرات؟', subtitle: '$2017 = 201 \\times 10 + 7$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.digitCount.wrong },
          { role: 'why', text: GUIDE.digitCount.why },
          { role: 'right', text: GUIDE.digitCount.right },
        ],
      },
      reveals: ['malyun'],
    },
    {
      id: 'malyun', kind: 'concept', lane: 'end', requires: 'malyun-milyar', notebook: true,
      title: 'المليون والمليار', subtitle: BIG.facts[0],
      context: { text: BIG.facts[1] },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'malyun-milyar',
      title: 'الخلاصة', subtitle: 'الموقع يعطي القيمة',
      context: { text: GUIDE.classes, note: RANKS.box },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nizam', to: 'mawdi', label: 'الموقع' },
    { from: 'mawdi', to: 'khataConcat', label: 'خطأ شائع' },
    { from: 'khataConcat', to: 'khataZero', label: 'وأيضًا' },
    { from: 'mawdi', to: 'jadwal', label: 'في جدول' },
    { from: 'jadwal', to: 'fiaat', label: 'للقراءة' },
    { from: 'jadwal', to: 'mafkuk', label: 'للتفكيك' },
    { from: 'fiaat', to: 'exFiaat', label: 'مثال' },
    { from: 'mafkuk', to: 'raqmAdad', label: 'ولعدد الوحدات' },
    { from: 'raqmAdad', to: 'khataDigit', label: 'خطأ شائع' },
    { from: 'khataDigit', to: 'malyun', label: 'وأكبر' },
    { from: 'malyun', to: 'khulasa', label: 'نستخلص' },
  ],
};
