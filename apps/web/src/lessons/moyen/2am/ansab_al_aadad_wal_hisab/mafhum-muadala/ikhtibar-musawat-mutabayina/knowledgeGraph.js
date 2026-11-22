/**
 * La carte PROGRESSIVE du درس « اختبار صحة مساواة أو متباينة » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *            [نعوّض ونحسب]  →  [الحدّ]  →  ⛔ [5000 تعبر؟]          مفهوم
 *                    │
 *            [مجهولان] → [مساواة عند قيمة] → [مثال مضادّ] (M1)
 *                    │
 *            [عبارتان متساويتان] → [متباينة ورموز] (M2)
 *                    │
 *            [جدول] → [ترتيب القيمتين] → [القيم المحقِّقة] (M3)
 *                    │
 *                 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'hisab',
  nodes: [
    {
      id: 'hisab', kind: 'concept', lane: 'center', requires: 'tawid-wa-hisab', notebook: true,
      title: 'نعوّض ونحسب كلّ طرف', subtitle: '$4000+50\\times15=4750$',
      context: { text: GUIDE.line, note: 'ماذا يكتب الميزان قبل أن يقول صحيحة أو خاطئة؟' },
      reveals: ['hadd'],
    },
    {
      id: 'hadd', kind: 'relationship', lane: 'end', requires: 'hadd', notebook: true,
      title: 'الحدّ: ليس أقلّ تمامًا', subtitle: '$5000<5000$ خاطئة',
      context: { text: GUIDE.edge },
      reveals: ['khata-hadd', 'majhulan'],
    },
    {
      // ⛔ خطأ شائع — prendre la masse égale à la limite pour « plus petite ».
      id: 'khata-hadd', kind: 'common_mistake', lane: 'start', requires: 'hadd',
      title: 'الحدّ نفسه يعبر؟', subtitle: 'الرمز $<$',
      context: { parts: [
        { role: 'wrong', text: 'كتلة الشاحنة بلغت الحدّ تمامًا، فهي أقلّ من الحدّ وتعبر.' },
        { role: 'why', text: 'العدد نفسه على الجهتين: ليس أقلّ تمامًا، فالرمز $<$ يرفض هذه الحمولة.' },
        { role: 'right', text: GUIDE.edge },
      ] },
      reveals: [],
    },
    {
      id: 'majhulan', kind: 'method', lane: 'center', requires: 'majhulan', notebook: true,
      title: 'مجهولان في قاعدة واحدة', subtitle: '$4500+50x+40y<7000$',
      context: { text: GUIDE.two },
      reveals: ['musawat'],
    },
    {
      id: 'musawat', kind: 'term', lane: 'center', requires: 'musawat-qima', notebook: true,
      title: 'مساواة صحيحة من أجل قيمة', subtitle: '$x=30$ : $5100=5100$',
      context: { text: GUIDE.equality },
      reveals: ['mudad'],
    },
    {
      id: 'mudad', kind: 'method', lane: 'center', requires: 'mithal-mudad', notebook: true,
      title: 'مثال مضادّ واحد يكفي', subtitle: '$x=31$ : $5170>5150$',
      context: { text: GUIDE.counter, note: GUIDE.oneValue },
      reveals: ['ibaratan'],
    },
    {
      id: 'ibaratan', kind: 'term', lane: 'center', requires: 'tasawi-ibaratayn', notebook: true,
      title: 'عبارتان متساويتان دائمًا', subtitle: '$2(x+3)=2x+6$',
      context: { text: KNOWLEDGE.equal.text, formula: KNOWLEDGE.equal.example },
      reveals: ['mutabaya'],
    },
    {
      id: 'mutabaya', kind: 'term', lane: 'center', requires: 'ikhtibar-mutabayina', notebook: true,
      title: 'اختبار متباينة والرموز', subtitle: '$<$ ، $>$ ، $\\le$ ، $\\ge$',
      context: { text: KNOWLEDGE.inequality.text, formula: KNOWLEDGE.inequality.example },
      reveals: ['jadwal'],
    },
    {
      id: 'jadwal', kind: 'method', lane: 'center', requires: 'jadwal-ikhtibar', notebook: true,
      title: 'جدول الاختبار', subtitle: '$2x+9=5x-3$',
      context: { text: METHOD.solution[0] },
      reveals: ['zawj'],
    },
    {
      id: 'zawj', kind: 'example', lane: 'center', requires: 'zawj-tartib', notebook: true,
      title: 'ترتيب القيمتين', subtitle: '$(4;6)$ و $(6;4)$',
      context: { text: METHOD.solution[1] },
      reveals: ['qiyam'],
    },
    {
      id: 'qiyam', kind: 'method', lane: 'center', requires: 'qiyam-muhaqqiqa', notebook: true,
      title: 'القيم التي تحقّق المتباينة', subtitle: '$4x-3\\le2x+7$',
      context: { text: GUIDE.given, formula: METHOD.solution[2] },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qiyam-muhaqqiqa',
      title: 'الخلاصة', subtitle: 'نعوّض · نحسب · نقارن',
      context: { text: METHOD.rule, note: METHOD.solution[3] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'hisab', to: 'hadd', label: 'نقارن' },
    { from: 'hadd', to: 'khata-hadd', label: 'خطأ شائع' },
    { from: 'hadd', to: 'majhulan', label: 'نزيد مجهولًا' },
    { from: 'majhulan', to: 'musawat', label: 'مساواة' },
    { from: 'musawat', to: 'mudad', label: 'ونبطل' },
    { from: 'mudad', to: 'ibaratan', label: 'نسمّي' },
    { from: 'ibaratan', to: 'mutabaya', label: 'ونقارن' },
    { from: 'mutabaya', to: 'jadwal', label: 'نطبّق' },
    { from: 'jadwal', to: 'zawj', label: 'ونتقدّم' },
    { from: 'zawj', to: 'qiyam', label: 'ونعمّم' },
    { from: 'qiyam', to: 'khulasa', label: 'نستخلص' },
  ],
};
