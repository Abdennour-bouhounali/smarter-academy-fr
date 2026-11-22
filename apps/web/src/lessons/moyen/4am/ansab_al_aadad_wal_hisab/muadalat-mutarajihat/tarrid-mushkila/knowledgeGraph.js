/**
 * La carte PROGRESSIVE du درس 4 « ترييض مشكلة » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — la طريقة p. 49,
 * دوري الآن 2, les exercices 12 et 40 (content/textbook.js, content/exercises.js). Chaque
 * nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de
 * l'إختبار أولي n'y figure.
 *
 *                 [ترييض مشكلة]                m1
 *                      │ مثال
 *                 [مثال الكتاب]
 *          نعمّم ┌─────┴─────┐ خطأ شائع
 *        [الطريقة]          ⛔ [x مرة واحدة]   m2
 *            │ نتحقق منه بـ
 *       🔍 [التحقق]
 *            └──┐ ومع متراجحة
 *          [متراجحة] → مثال → [المربع والمثلث] → نختار → [حلّ يلائم الواقع]
 *                                  → مثال → [حلّ مرفوض] → نستخلص → 🎯 [خلاصة]
 */
import { METHOD_MODELLING, MISTAKE_ONE_X, NOW_49_2, STEPS } from './content/textbook';
import { EX } from './content/exercises';

const now49 = EX['now-49-2'];
const ex40 = EX['ex-40'];

export const KNOWLEDGE_GRAPH = {
  root: 'namdhaja',
  nodes: [
    {
      id: 'namdhaja', kind: 'concept', lane: 'center', requires: 'tarrid-namdhaja', notebook: true,
      title: 'ترييض مشكلة', subtitle: 'النص ← معادلة',
      reveals: ['mithal'],
    },
    {
      id: 'mithal', kind: 'example', lane: 'center', requires: 'tarrid-namdhaja',
      title: 'الأب وأبناؤه الأربعة', subtitle: '$x = 5$',
      context: { text: METHOD_MODELLING.solution[1], note: METHOD_MODELLING.solution[3] },
      reveals: ['khata', 'tariqa'],
    },
    {
      // ⛔ خطأ شائع — l'erreur que le laboratoire refuse (module 1, question 1).
      id: 'khata', kind: 'common_mistake', lane: 'end', requires: 'tarrid-namdhaja',
      title: 'x مرة واحدة لأربعة أبناء', subtitle: '$4x$ لا $x$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKE_ONE_X.wrong },
          { role: 'why', text: MISTAKE_ONE_X.why },
          { role: 'right', text: MISTAKE_ONE_X.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'start', requires: 'tarrid-tariqa', notebook: true,
      title: 'طريقة ترييض مشكلة', subtitle: 'نسمّي · نعبّر · نحلّ · نتحقّق',
      reveals: ['tahaqquq'],
    },
    {
      // 🔍 تحقّق — l'« التحقق » du manuel, p. 49.
      id: 'tahaqquq', kind: 'check', lane: 'start', requires: 'tarrid-tariqa',
      title: 'التحقق في النص', subtitle: '$12 + 13 + 15 + 17 = 57$',
      context: { text: METHOD_MODELLING.solution[3], note: STEPS.check },
      reveals: ['mutarajiha'],
    },
    {
      id: 'mutarajiha', kind: 'idea', lane: 'center', requires: 'tarrid-mutarajiha', notebook: true,
      title: 'مشكلة تترجمها متراجحة', subtitle: '«أكبر من أو يساوي»',
      reveals: ['murabba'],
    },
    {
      id: 'murabba', kind: 'example', lane: 'center', requires: 'tarrid-mutarajiha',
      title: 'المسدّس والمربّع', subtitle: '$6x \\geq 4(x + 5)$',
      context: { text: NOW_49_2.text, note: now49.question.explain },
      reveals: ['waqi'],
    },
    {
      id: 'waqi', kind: 'relationship', lane: 'center', requires: 'tahaqquq-waqi', notebook: true,
      title: 'حلّ يلائم الواقع', subtitle: 'طول موجب · عدد طبيعي',
      reveals: ['marfud'],
    },
    {
      id: 'marfud', kind: 'example', lane: 'start', requires: 'tahaqquq-waqi',
      title: 'حلّ مرفوض', subtitle: '$x = 4$',
      context: { text: ex40.question.rows[2].correction, note: ex40.commonError },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les étapes ب) et التحقق de la طريقة, réunies.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tahaqquq-waqi',
      title: 'خلاصة', subtitle: 'نترجم ثم نتحقّق',
      context: { text: STEPS.express, note: STEPS.check },
      reveals: [],
    },
  ],
  edges: [
    { from: 'namdhaja', to: 'mithal', label: 'مثال' },
    { from: 'mithal', to: 'khata', label: 'خطأ شائع' },
    { from: 'mithal', to: 'tariqa', label: 'نعمّم' },
    { from: 'tariqa', to: 'tahaqquq', label: 'نتحقق منه بـ' },
    { from: 'tahaqquq', to: 'mutarajiha', label: 'ومع متراجحة' },
    { from: 'mutarajiha', to: 'murabba', label: 'مثال' },
    { from: 'murabba', to: 'waqi', label: 'نختار' },
    { from: 'waqi', to: 'marfud', label: 'مثال' },
    { from: 'marfud', to: 'khulasa', label: 'نستخلص' },
  ],
};
