/**
 * La carte PROGRESSIVE du درس 2 « التمثيل البياني لدالة تآلفية وقراءته بيانيًا » — KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 3 et ses calculs
 * (content/textbook.js › ACTIVITY, ACTIVITY_LINES), les معارف et طرائق de la plateforme (KNOWLEDGE, METHOD_*),
 * et les deux erreurs que ses questions expliquent (COMMON_ERRORS). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit. Rien de l'إختبار أولي n'est montré ici.
 *
 *        [المستقيم المرفوع بـ b]                 m1
 *                 │ نسمّي
 *        [الترتيب عند المبدأ]                    m1
 *                 │ نعمّم
 *        [تمثيل دالة تآلفية]                     m2
 *        مثال ┌───┴──────┐ معامل التوجيه
 *     [2x − 3]        [معامل التوجيه]
 *       │ خطأ شائع        │ يكفي
 *    ⛔ [المبدأ]       [نرسم بنقطتين]
 *                         │ نقرأ عليه
 *                    [نقرأ a و b]               m3
 *            خطأ شائع ┌───┴───┐ ثم
 *              ⛔ [b]     [نقرأ صورة]
 *                             │ نستخلص
 *                         🎯 [خلاصة]
 */
import { ACTIVITY_LINES, KNOWLEDGE, METHOD_AB, COMMON_ERRORS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'irtifa',
  nodes: [
    {
      id: 'irtifa', kind: 'concept', lane: 'center', requires: 'irtifa-b', notebook: true,
      title: 'المستقيم المرفوع بـ b', subtitle: '$f(x) = g(x) + 1$',
      context: { text: ACTIVITY_LINES.rule, note: ACTIVITY_LINES.f2 },
      reveals: ['tartib'],
    },
    {
      id: 'tartib', kind: 'term', lane: 'center', requires: 'tartib-mabda', notebook: true,
      title: 'الترتيب عند المبدأ', subtitle: '$(0 ; b)$',
      reveals: ['tamthil'],
    },
    {
      id: 'tamthil', kind: 'definition', lane: 'center', requires: 'tamthil-taalufi', notebook: true,
      title: 'تمثيل دالة تآلفية', subtitle: '$y = ax + b$',
      reveals: ['mithal', 'muamil'],
    },
    {
      id: 'mithal', kind: 'example', lane: 'start', requires: 'tamthil-taalufi',
      title: 'مثال', subtitle: '$2x - 3$',
      context: { text: KNOWLEDGE.example },
      reveals: ['khata-mabda'],
    },
    {
      // ⛔ خطأ شائع — le distracteur « O et (1 ; 3) » de معارف (étape 3) et son explication.
      id: 'khata-mabda', kind: 'common_mistake', lane: 'start', requires: 'tamthil-taalufi',
      title: 'المبدأ ليس دائمًا', subtitle: '$3x - 1$',
      context: {
        parts: [
          { role: 'wrong', text: COMMON_ERRORS.mabda.wrong },
          { role: 'why', text: COMMON_ERRORS.mabda.why },
          { role: 'right', text: COMMON_ERRORS.mabda.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'muamil', kind: 'relationship', lane: 'end', requires: 'muamil-tawjih', notebook: true,
      title: 'معامل التوجيه', subtitle: '$a > 0$ ، $a < 0$',
      reveals: ['rasm'],
    },
    {
      id: 'rasm', kind: 'method', lane: 'end', requires: 'rasm-taalufi', notebook: true,
      title: 'نرسم بنقطتين', subtitle: '$(0 ; b)$',
      reveals: ['qiraa-ab'],
    },
    {
      id: 'qiraa-ab', kind: 'method', lane: 'center', requires: 'qiraa-ab', notebook: true,
      title: 'نقرأ a و b', subtitle: '$a = -\\dfrac{3}{2}$',
      reveals: ['khata-b', 'qiraa-sura'],
    },
    {
      // ⛔ خطأ شائع — le distracteur « b sur l'axe des abscisses » de القراءة البيانية (étape 1) et sa correction.
      id: 'khata-b', kind: 'common_mistake', lane: 'start', requires: 'qiraa-ab',
      title: 'b على محور التراتيب', subtitle: '$b = -2$',
      context: {
        parts: [
          { role: 'wrong', text: COMMON_ERRORS.bFasila.wrong },
          { role: 'why', text: COMMON_ERRORS.bFasila.why },
          { role: 'right', text: COMMON_ERRORS.bFasila.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'qiraa-sura', kind: 'method', lane: 'end', requires: 'qiraa-sura-taalufi', notebook: true,
      title: 'نقرأ صورة وعددًا', subtitle: '$f(4) = 1$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la propriété de معارف et la règle de lecture de b et a.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qiraa-sura-taalufi',
      title: 'خلاصة', subtitle: '$(0 ; b)$ و $a$',
      context: { text: KNOWLEDGE.property, note: METHOD_AB.rule[0] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'irtifa', to: 'tartib', label: 'نسمّي' },
    { from: 'tartib', to: 'tamthil', label: 'نعمّم' },
    { from: 'tamthil', to: 'mithal', label: 'مثال' },
    { from: 'mithal', to: 'khata-mabda', label: 'خطأ شائع' },
    { from: 'tamthil', to: 'muamil', label: 'a' },
    { from: 'muamil', to: 'rasm', label: 'يكفي' },
    { from: 'rasm', to: 'qiraa-ab', label: 'نقرأ عليه' },
    { from: 'qiraa-ab', to: 'khata-b', label: 'خطأ شائع' },
    { from: 'qiraa-ab', to: 'qiraa-sura', label: 'ثم' },
    { from: 'qiraa-sura', to: 'khulasa', label: 'نستخلص' },
  ],
};
