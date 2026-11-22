/**
 * La carte PROGRESSIVE du درس « تبسيط عبارة جبرية وحذف الأقواس » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_BRACKETS`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                               [طاولة النادي] (M1)                                      مفهوم
 *                          نرتّب ┌──────┴──────┐ ونغيّر x
 *              [الحدود المتشابهة] (M1)               [القيمة ثابتة] (M1)
 *                خطأ شائع │       │ نجمع
 *    ⛔ [4x²+4x = 8x²؟]        [جمع المعاملات] (M1)
 *                                   │ ونسمّي
 *                           [مجموع أم جداء؟] (M2)
 *                                   │ ونبسّط
 *                            [جداء حدود] (M2)
 *                                   │ ثم نحذف
 *                         [قوسان مسبوقان بـ +] (M3)
 *                                   │ وبـ −
 *                         [قوسان مسبوقان بـ −] (M3)
 *                          خطأ شائع │        │ فنعتمد
 *            ⛔ [نغيّر الحدّ الأول وحده؟]  [طريقة الحذف] (M3)
 *                                              │ نستخلص
 *                                         🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_BRACKETS, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tawla',
  nodes: [
    {
      id: 'tawla', kind: 'concept', lane: 'center', requires: 'hudud-mutashabiha',
      title: 'طاولة النادي', subtitle: 'حزم من القطع',
      context: { text: 'كل حدّ من عبارة حرفية حزمة من القطع الخشبية على شكل جزئه الحرفي: لا تُرصّ في صينية واحدة إلا الحزم التي لها الشكل نفسه.', note: KNOWLEDGE.valueKept.text },
      reveals: ['mutashabiha'],
    },
    {
      id: 'mutashabiha', kind: 'concept', lane: 'start', requires: 'hudud-mutashabiha', notebook: true,
      title: 'الحدود المتشابهة', subtitle: 'الجزء الحرفي نفسه',
      context: { text: KNOWLEDGE.like.text },
      reveals: ['khataMix', 'jam'],
    },
    {
      // ⛔ خطأ شائع — deux termes non semblables réunis (`GUIDE.merge`).
      id: 'khataMix', kind: 'common_mistake', lane: 'start', requires: 'jam-muamilat',
      title: 'نجمع $x^2$ مع $x$ ؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.merge.wrong },
          { role: 'why', text: GUIDE.merge.why },
          { role: 'right', text: GUIDE.merge.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'jam', kind: 'relationship', lane: 'center', requires: 'jam-muamilat', notebook: true,
      title: 'جمع المعاملات', subtitle: 'والمتعاكسان يتلاشيان',
      context: { text: KNOWLEDGE.merge.text, note: KNOWLEDGE.noMix.text },
      reveals: ['qima'],
    },
    {
      id: 'qima', kind: 'relationship', lane: 'center', requires: 'qima-thabita', notebook: true,
      title: 'القيمة ثابتة', subtitle: 'مهما كان x',
      context: { text: KNOWLEDGE.valueKept.text },
      reveals: ['majmu'],
    },
    {
      id: 'majmu', kind: 'concept', lane: 'center', requires: 'majmu-wa-jidaa', notebook: true,
      title: 'مجموع أم جداء؟', subtitle: 'آخر عملية',
      context: { text: KNOWLEDGE.sumOrProduct.text },
      reveals: ['jidaa'],
    },
    {
      id: 'jidaa', kind: 'relationship', lane: 'center', requires: 'jidaa-hududayn', notebook: true,
      title: 'جداء حدود', subtitle: 'الأعداد معًا والحروف معًا',
      context: { text: KNOWLEDGE.product.text },
      reveals: ['plus'],
    },
    {
      id: 'plus', kind: 'relationship', lane: 'center', requires: 'aqwas-jam', notebook: true,
      title: 'قوسان مسبوقان بـ +', subtitle: 'الإشارات كما هي',
      context: { text: KNOWLEDGE.plus.text },
      reveals: ['minus'],
    },
    {
      id: 'minus', kind: 'relationship', lane: 'center', requires: 'aqwas-tarh', notebook: true,
      title: 'قوسان مسبوقان بـ −', subtitle: 'كل الإشارات تتغيّر',
      context: { text: KNOWLEDGE.minus.text },
      reveals: ['tariqa'],
    },
    {
      // ⛔ خطأ شائع — le seul premier signe changé (`GUIDE.firstSign`).
      id: 'khataFirst', kind: 'common_mistake', lane: 'end', requires: 'aqwas-tarh',
      title: 'نغيّر الحدّ الأول وحده؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.firstSign.wrong },
          { role: 'why', text: GUIDE.firstSign.why },
          { role: 'right', text: GUIDE.firstSign.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-hadhf', notebook: true,
      title: 'أحذف الأقواس وأبسّط', subtitle: 'ثلاث خطوات',
      context: { text: METHOD_BRACKETS.exercise, note: METHOD_BRACKETS.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-hadhf',
      title: 'الخلاصة', subtitle: 'تبسيط عبارة جبرية',
      context: { text: 'نجمع الحدود المتشابهة وحدها ونضرب الأعداد والحروف في الجداء؛ ونحذف القوسين المسبوقين بـ + دون تغيير، وبـ − بتغيير إشارة كل حدّ؛ والقيمة لا تتغيّر.', note: KNOWLEDGE.sumOrProduct.text },
      reveals: ['khataFirst'],
    },
  ],
  edges: [
    { from: 'tawla', to: 'mutashabiha', label: 'نرتّب' },
    { from: 'mutashabiha', to: 'khataMix', label: 'خطأ شائع' },
    { from: 'mutashabiha', to: 'jam', label: 'نجمع' },
    { from: 'jam', to: 'qima', label: 'ونغيّر x' },
    { from: 'qima', to: 'majmu', label: 'ونسمّي' },
    { from: 'majmu', to: 'jidaa', label: 'ونبسّط' },
    { from: 'jidaa', to: 'plus', label: 'ثم نحذف' },
    { from: 'plus', to: 'minus', label: 'وبـ −' },
    { from: 'minus', to: 'tariqa', label: 'فنعتمد' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
    { from: 'khulasa', to: 'khataFirst', label: 'احذر' },
  ],
};
