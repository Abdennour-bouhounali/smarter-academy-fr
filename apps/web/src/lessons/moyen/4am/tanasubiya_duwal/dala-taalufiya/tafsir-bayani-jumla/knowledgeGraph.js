/**
 * La carte PROGRESSIVE du درس 4 « التفسير البياني لحل جملة معادلتين من الدرجة الأولى بمجهولين » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 5 et ses calculs
 * (content/textbook.js › ACTIVITY_LINES), la formalisation de la plateforme (KNOWLEDGE, EXAMPLE), et les
 * erreurs / méthodes / corrections des exercices (content/exercises.js). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit.
 *
 *   core   six items (notebook), dont « انتبه » (la lecture approchée) porté par un nœud warning ;
 *   guide  خطأ شائع « le signe oublié » (تمرين 1), خطأ شائع « parallèles / confondues » (تمرين 3), خلاصة.
 * Rien de l'إختبار أولي n'est montré ici.
 *
 *            [صندوق القسم (36 ; 7)]                 m1
 *                     │ نعمّم
 *            [المعادلة والمستقيم]                    m2
 *          خطأ شائع ┌──┴──────┐ معادلتان
 *          ⛔ [الإشارة]   [الحل ونقطة التقاطع]
 *                    طريقة ┌─┴────────┐ ثلاث حالات
 *               [حل جملة بيانيًا]   [الحالات الثلاث]
 *                     │ انتبه    خطأ شائع ┌──┴──┐ نستخلص
 *               ⚠ [قراءة تقريبية]  ⛔ [متوازيان؟]  🎯 [خلاصة]
 */
import { ACTIVITY_LINES, KNOWLEDGE, EXAMPLE } from './content/textbook';
import { EX } from './content/exercises';

const exA = EX['ex-a-1'];
const exC = EX['ex-c'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'tafsir-nashat', notebook: true,
      title: 'صندوق القسم', subtitle: '$(36 ; 7)$',
      context: { text: ACTIVITY_LINES.closing, note: ACTIVITY_LINES.check },
      reveals: ['mustaqim'],
    },
    {
      id: 'mustaqim', kind: 'definition', lane: 'center', requires: 'muadala-mustaqim', notebook: true,
      title: 'المعادلة والمستقيم', subtitle: '$y = ax + b$',
      reveals: ['khata-ishara', 'taqatu'],
    },
    {
      // ⛔ خطأ شائع — l'erreur de l'exercice 1 (MISC-JUMLA-ISHARA-Y).
      id: 'khata-ishara', kind: 'common_mistake', lane: 'end', requires: 'muadala-mustaqim',
      title: 'إشارة الحدّ المنقول', subtitle: '$x + y = 6$',
      context: {
        parts: [
          { role: 'wrong', text: exA.mistake },
          { role: 'why', text: exA.method },
          { role: 'right', text: exA.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'taqatu', kind: 'relationship', lane: 'start', requires: 'hall-taqatu', notebook: true,
      title: 'الحل ونقطة التقاطع', subtitle: '$(x_0 ; y_0)$',
      context: { text: KNOWLEDGE.solutionPoint.text, note: EXAMPLE.lines[1] },
      reveals: ['tariqa', 'halat'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'end', requires: 'hall-bayani', notebook: true,
      title: 'حل جملة بيانيًا', subtitle: 'أكتب، أرسم، أقرأ، أتحقّق',
      reveals: ['taqribiya'],
    },
    {
      id: 'taqribiya', kind: 'warning', lane: 'end', requires: 'qiraa-taqribiya', notebook: true,
      title: 'قراءة تقريبية', subtitle: 'عقدة من الشبكة؟',
      reveals: [],
    },
    {
      id: 'halat', kind: 'relationship', lane: 'start', requires: 'halat-thalath', notebook: true,
      title: 'الحالات الثلاث', subtitle: 'حل، لا حل، ما لا نهاية',
      context: { list: KNOWLEDGE.cases.items, note: KNOWLEDGE.cases.link },
      reveals: ['khata-tawazi', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 3 (MISC-JUMLA-BAYANI-TAWAZI).
      id: 'khata-tawazi', kind: 'common_mistake', lane: 'start', requires: 'halat-thalath',
      title: 'متوازيان أم منطبقان؟', subtitle: 'معامل التوجيه نفسه',
      context: {
        parts: [
          { role: 'wrong', text: exC.commonError },
          { role: 'why', text: exC.method },
          { role: 'right', text: exC.question.rows[1].correction },
        ],
      },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la propriété du حل, puis la méthode.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'halat-thalath',
      title: 'خلاصة', subtitle: 'مستقيمان ونقطة',
      context: { text: KNOWLEDGE.solutionPoint.text, note: KNOWLEDGE.approx.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'mustaqim', label: 'نعمّم' },
    { from: 'mustaqim', to: 'khata-ishara', label: 'خطأ شائع' },
    { from: 'mustaqim', to: 'taqatu', label: 'معادلتان' },
    { from: 'taqatu', to: 'tariqa', label: 'طريقة' },
    { from: 'tariqa', to: 'taqribiya', label: 'انتبه إلى' },
    { from: 'taqatu', to: 'halat', label: 'ثلاث حالات' },
    { from: 'halat', to: 'khata-tawazi', label: 'خطأ شائع' },
    { from: 'halat', to: 'khulasa', label: 'نستخلص' },
  ],
};
