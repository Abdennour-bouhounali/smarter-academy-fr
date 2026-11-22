/**
 * La carte PROGRESSIVE du درس « نشر عبارات جبرية » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_EXPAND`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                               [أرض الحديقة] (M1)                                       مفهوم
 *                          نقطع ┌──────┴──────┐ ونقرّر
 *            [مساحة بطريقتين] (M1)               [الممرّ يُطرح] (M1)
 *               خطأ شائع │       │ فنسمّي              │ ثم الركن
 *   ⛔ [3(x+4)=3x+4؟]    [نشر k(a+b)] (M2)          [ركن يُردّ] (M1)
 *                                   │ ثم                  خطأ شائع │
 *                         [نشر (a+b)(c+d)] (M2)       ⛔ [(x−2)(x−3)=x²−5x−6؟]
 *                                   │ وصلته
 *                         [حذف الأقواس هو النشر] (M2)
 *                                   │ فنعتمد
 *                           [أنشر وأبسّط وأرتّب] (M3)
 *                                   │ نستخلص
 *                                🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_EXPAND, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'hadiqa',
  nodes: [
    {
      id: 'hadiqa', kind: 'concept', lane: 'center', requires: 'masaha-tariqatayn',
      title: 'أرض الحديقة', subtitle: 'مستطيل مقطوع إلى أجزاء',
      context: { text: 'ضلعا الأرض مكتوبان بدلالة x: نحسب مساحتها مرّةً كجداء البعدين ومرّةً كمجموع مساحات أجزائها.', note: KNOWLEDGE.areaTwoWays.text },
      reveals: ['masaha'],
    },
    {
      id: 'masaha', kind: 'concept', lane: 'start', requires: 'masaha-tariqatayn', notebook: true,
      title: 'مساحة بطريقتين', subtitle: 'جداء أو مجموع',
      context: { text: KNOWLEDGE.areaTwoWays.text },
      reveals: ['khataFirst', 'matruh'],
    },
    {
      // ⛔ خطأ شائع — le facteur multiplie le seul premier terme (`GUIDE.firstOnly`).
      id: 'khataFirst', kind: 'common_mistake', lane: 'start', requires: 'masaha-tariqatayn',
      title: 'نضرب الحدّ الأول وحده؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.firstOnly.wrong },
          { role: 'why', text: GUIDE.firstOnly.why },
          { role: 'right', text: GUIDE.firstOnly.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'matruh', kind: 'relationship', lane: 'end', requires: 'hadd-matruh', notebook: true,
      title: 'الممرّ يُطرح', subtitle: 'k(a − b) = ka − kb',
      context: { text: KNOWLEDGE.bite.text },
      reveals: ['rukn'],
    },
    {
      id: 'rukn', kind: 'relationship', lane: 'end', requires: 'rukn-yuad', notebook: true,
      title: 'ركن الممرّين يُردّ', subtitle: 'سالب في سالب موجب',
      context: { text: KNOWLEDGE.corner.text },
      reveals: ['khataCorner', 'k1'],
    },
    {
      // ⛔ خطأ شائع — le coin compté négativement (`GUIDE.corner`).
      id: 'khataCorner', kind: 'common_mistake', lane: 'end', requires: 'rukn-yuad',
      title: 'جداء سالبين سالب؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.corner.wrong },
          { role: 'why', text: GUIDE.corner.why },
          { role: 'right', text: GUIDE.corner.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'k1', kind: 'relationship', lane: 'center', requires: 'tawzi-darb', notebook: true,
      title: 'نشر k(a + b)', subtitle: 'العامل يضرب كل حدّ',
      context: { text: KNOWLEDGE.distribute1.text },
      reveals: ['k2'],
    },
    {
      id: 'k2', kind: 'relationship', lane: 'center', requires: 'jidaa-qawsayn', notebook: true,
      title: 'نشر (a + b)(c + d)', subtitle: 'كل حدّ مع كل حدّ',
      context: { text: KNOWLEDGE.distribute2.text, note: KNOWLEDGE.signs.text },
      reveals: ['jisr'],
    },
    {
      id: 'jisr', kind: 'concept', lane: 'center', requires: 'aqwas-tawzi', notebook: true,
      title: 'حذف الأقواس هو النشر', subtitle: 'العامل +1 أو −1',
      context: { text: KNOWLEDGE.bridge.text },
      reveals: ['ishara'],
    },
    {
      id: 'ishara', kind: 'relationship', lane: 'center', requires: 'ishara-jidaa', notebook: true,
      title: 'إشارة كل جداء', subtitle: 'مع كل سهم إشارة',
      context: { text: KNOWLEDGE.signs.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-nashr', notebook: true,
      title: 'أنشر وأبسّط وأرتّب', subtitle: 'ثلاث خطوات ومراقبة',
      context: { text: METHOD_EXPAND.exercise, note: METHOD_EXPAND.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-nashr',
      title: 'الخلاصة', subtitle: 'نشر عبارات جبرية',
      context: { text: 'ننشر بضرب كل حدّ في كل حدّ مع إشارة كل جداء، ثم نجمع الحدود المتشابهة ونرتّب تنازليًا؛ ومساحة المستطيل بطريقتين هي برهان النشر؛ والقيمة لا تتغيّر.', note: KNOWLEDGE.check.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'hadiqa', to: 'masaha', label: 'نقطع' },
    { from: 'masaha', to: 'khataFirst', label: 'خطأ شائع' },
    { from: 'masaha', to: 'matruh', label: 'ونقرّر' },
    { from: 'matruh', to: 'rukn', label: 'ثم الركن' },
    { from: 'rukn', to: 'khataCorner', label: 'خطأ شائع' },
    { from: 'rukn', to: 'k1', label: 'فنسمّي' },
    { from: 'k1', to: 'k2', label: 'ثم' },
        { from: 'k2', to: 'jisr', label: 'وصلته' },
    { from: 'jisr', to: 'ishara', label: 'ونكتب' },
    { from: 'ishara', to: 'tariqa', label: 'فنعتمد' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
