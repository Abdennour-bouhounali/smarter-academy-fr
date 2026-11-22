/**
 * La carte PROGRESSIVE du درس « حساب قيمة عبارة حرفية » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_VALUES`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                       [التعويض: العدد في كل مكان] (M1)                                    مفهوم
 *                  نُظهر ┌──────────┴──────────┐ ونحفظ
 *        [علامة الضرب] (M1)                      [القوسان] (M1)
 *          خطأ شائع │                              │ ثم                 خطأ شائع │
 *   ⛔ [4x تصير 43؟]                        [حرفان] (M1)              ⛔ [x² تصير −3²؟]
 *                                                  │ فنعتمد
 *                                          [عوّض ثم احسب] (M2)
 *                                                  │ ثم
 *                                          [مثال مضاد] (M3)
 *                                       خطأ شائع │       │ فنعتمد
 *                        ⛔ [قيمة واحدة تكفي؟]    [القيم تبطل والنشر يثبت] (M3)
 *                                                  │ نستخلص
 *                                          🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_VALUES, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tawid',
  nodes: [
    {
      id: 'tawid', kind: 'concept', lane: 'center', requires: 'nafs-al-adad', notebook: true,
      title: 'التعويض: العدد في كل مكان', subtitle: 'الحرف يأخذ عددًا',
      context: { text: 'نعوّض الحرف بعدد، والعدد نفسه يدخل كل مكان للحرف في العبارة.', note: KNOWLEDGE.same.text },
      reveals: ['times', 'brackets'],
    },
    {
      id: 'times', kind: 'relationship', lane: 'start', requires: 'ithar-darb', notebook: true,
      title: 'علامة الضرب تُظهَر', subtitle: 'الضرب لا يُحذف',
      context: { text: KNOWLEDGE.times.text },
      reveals: ['khataFused'],
    },
    {
      // ⛔ خطأ شائع — le × caché fond les chiffres (`GUIDE.fused`).
      id: 'khataFused', kind: 'common_mistake', lane: 'start', requires: 'ithar-darb',
      title: 'نكتب 4x هكذا: 43؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.fused.wrong },
          { role: 'why', text: GUIDE.fused.why },
          { role: 'right', text: GUIDE.fused.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'brackets', kind: 'relationship', lane: 'end', requires: 'aqwas-salib', notebook: true,
      title: 'العدد السالب بين قوسين', subtitle: '(−2)² و −2²',
      context: { text: KNOWLEDGE.brackets.text },
      reveals: ['khataNeg', 'two'],
    },
    {
      // ⛔ خطأ شائع — le carré d'un négatif écrit sans parenthèses (`GUIDE.negPower`).
      id: 'khataNeg', kind: 'common_mistake', lane: 'end', requires: 'aqwas-salib',
      title: 'نكتب x² هكذا: −3²؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.negPower.wrong },
          { role: 'why', text: GUIDE.negPower.why },
          { role: 'right', text: GUIDE.negPower.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'two', kind: 'relationship', lane: 'center', requires: 'harfan', notebook: true,
      title: 'حرفان وعددان', subtitle: 'كل حرف وكريته',
      context: { text: KNOWLEDGE.letters.text },
      reveals: ['method'],
    },
    {
      id: 'method', kind: 'method', lane: 'center', requires: 'tawid-qimat', notebook: true,
      title: 'عوّض ثم احسب', subtitle: 'الأقواس والأولوية',
      context: { text: KNOWLEDGE.definition.text, note: KNOWLEDGE.example.text },
      reveals: ['counter'],
    },
    {
      id: 'counter', kind: 'relationship', lane: 'end', requires: 'mithal-mudad', notebook: true,
      title: 'مثال مضاد', subtitle: 'قيمة تفرّق بين عبارتين',
      context: { text: KNOWLEDGE.counter.text, note: KNOWLEDGE.noProof.text },
      reveals: ['khataOne', 'proof'],
    },
    {
      // ⛔ خطأ شائع — une valeur commune est prise pour une preuve d'égalité (`GUIDE.oneValue`).
      id: 'khataOne', kind: 'common_mistake', lane: 'end', requires: 'mithal-mudad',
      title: 'قيمة واحدة تكفي؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.oneValue.wrong },
          { role: 'why', text: GUIDE.oneValue.why },
          { role: 'right', text: GUIDE.oneValue.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'proof', kind: 'method', lane: 'center', requires: 'nashr-yuthbit', notebook: true,
      title: 'القيم تبطل والنشر يثبت', subtitle: 'خطوتان',
      context: { text: METHOD_VALUES.exercise, note: METHOD_VALUES.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'nashr-yuthbit',
      title: 'الخلاصة', subtitle: 'حساب قيمة عبارة حرفية',
      context: { text: 'نعوّض الحرف بالعدد نفسه في كل مكان، ونُظهر الضرب، ونضع السالب بين قوسين، ونحسب باحترام الأولوية ؛ وقيمة تفرّق بين عبارتين تثبت أنهما مختلفتان، أمّا تساوي القيم فلا يثبت التساوي.', note: KNOWLEDGE.noProof.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tawid', to: 'times', label: 'نُظهر' },
    { from: 'times', to: 'khataFused', label: 'خطأ شائع' },
    { from: 'tawid', to: 'brackets', label: 'ونحفظ' },
    { from: 'brackets', to: 'khataNeg', label: 'خطأ شائع' },
    { from: 'brackets', to: 'two', label: 'ثم' },
    { from: 'two', to: 'method', label: 'فنعتمد' },
    { from: 'method', to: 'counter', label: 'ثم' },
    { from: 'counter', to: 'khataOne', label: 'خطأ شائع' },
    { from: 'counter', to: 'proof', label: 'فنعتمد' },
    { from: 'proof', to: 'khulasa', label: 'نستخلص' },
  ],
};
