/**
 * La carte PROGRESSIVE du درس « قراءة مركبتي شعاع وتمثيلهما في معلم » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 (content/textbook.js › ACTIVITY,
 * ACTIVITY_LINES), معارف 1, 3 أ et la نتيجة (KNOW1, KNOW3, KNOW_ORIGIN), la طريقة (METHOD_DRAW) et les `commonError`
 * des exercices 1, 2 et 5 (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit
 * (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *                         [مركبتا شعاع]                         m1
 *                               │ نقرؤهما بـ
 *                   [القراءة في تمثيل بياني]                    m2
 *                خطأ شائع ┌─────┴─────┐ من المبدأ O
 *            ⛔ [إشارة منسية]     [مركبتا OM]
 *                     خطأ شائع ┌──────┴──────┐ في أي معلم؟
 *              ⛔ [العنوان بدل الرحلة]   [أنواع المعالم]
 *                                         │ والعكس
 *                                   [تمثيل شعاع]          m3
 *                         انتبه إلى ┌──────┴──────┐ نستخلص
 *                       ⚠ [الأفقي أولا]       🎯 [خلاصة]
 */
import { ACTIVITY, ACTIVITY_LINES, KNOW1, KNOW3, KNOW_ORIGIN } from './content/textbook';
import { EX } from './content/exercises';

export const KNOWLEDGE_GRAPH = {
  root: 'murakkibatan',
  nodes: [
    {
      id: 'murakkibatan', kind: 'concept', lane: 'center', requires: 'murakkibatan', notebook: true,
      title: 'مركبتا شعاع', subtitle: 'أفقيا ثم عموديا',
      reveals: ['qiraa'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 1 (3), la lecture de CD (معارف 3 أ), la phrase du نشاط 1 (3).
      id: 'ishara', kind: 'common_mistake', lane: 'start', requires: 'qiraa-bayaniya',
      title: 'إشارة منسية', subtitle: 'نحو الأسفل: سالب',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-1-b'].commonError },
          { role: 'why', text: KNOW3.cd },
          { role: 'right', text: ACTIVITY.closing },
        ],
      },
      reveals: [],
    },
    {
      id: 'qiraa', kind: 'method', lane: 'center', requires: 'qiraa-bayaniya', notebook: true,
      title: 'القراءة في تمثيل بياني', subtitle: '$\\overrightarrow{CD}\\begin{pmatrix} -5 \\\\ 1 \\end{pmatrix}$',
      reveals: ['ishara', 'om'],
    },
    {
      // ⚠ انتبه — l'ordre des deux nombres, d'après le `commonError` de l'exercice 2.
      id: 'tartib', kind: 'warning', lane: 'start', requires: 'tamthil-shuaa',
      title: 'الأفقي أولا', subtitle: 'ثم العمودي',
      context: { text: EX['ex-2-b'].commonError },
      reveals: [],
    },
    {
      id: 'om', kind: 'relationship', lane: 'end', requires: 'murakkibata-om', notebook: true,
      title: 'مركبتا الشعاع OM', subtitle: '$\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$',
      reveals: ['ihdathiyat', 'maalim'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 5 (1), la نتيجة des معارف, la correction de l'exercice.
      id: 'ihdathiyat', kind: 'common_mistake', lane: 'start', requires: 'murakkibata-om',
      title: 'العنوان بدل الرحلة', subtitle: 'المبدأ ليس O',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-5-a'].commonError },
          { role: 'why', text: KNOW_ORIGIN.property },
          { role: 'right', text: EX['ex-5-a'].question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'maalim', kind: 'term', lane: 'center', requires: 'anwa-maalim', notebook: true,
      title: 'أنواع المعالم', subtitle: 'متعامد · متجانس',
      reveals: ['tamthil'],
    },
    {
      id: 'tamthil', kind: 'method', lane: 'center', requires: 'tamthil-shuaa', notebook: true,
      title: 'تمثيل شعاع علمت مركبتاه', subtitle: '$\\vec{u}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$',
      reveals: ['tartib', 'khulasa'],
    },
    {
      // 🎯 خلاصة — la phrase du نشاط 1 (3) et la règle OM (معارف 1), au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tamthil-shuaa',
      title: 'خلاصة', subtitle: 'رحلة لا عنوان',
      context: { text: ACTIVITY_LINES.rule, note: KNOW1.property },
      reveals: [],
    },
  ],
  edges: [
    { from: 'murakkibatan', to: 'qiraa', label: 'نقرؤهما بـ' },
    { from: 'qiraa', to: 'ishara', label: 'خطأ شائع' },
    { from: 'qiraa', to: 'om', label: 'من O' },
    { from: 'om', to: 'ihdathiyat', label: 'خطأ شائع' },
    { from: 'om', to: 'maalim', label: 'في أي معلم؟' },
    { from: 'maalim', to: 'tamthil', label: 'والعكس' },
    { from: 'tamthil', to: 'tartib', label: 'انتبه إلى' },
    { from: 'tamthil', to: 'khulasa', label: 'نستخلص' },
  ],
};
