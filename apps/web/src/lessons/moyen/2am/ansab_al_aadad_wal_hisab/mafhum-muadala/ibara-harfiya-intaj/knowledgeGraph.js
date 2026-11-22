/**
 * La carte PROGRESSIVE du درس « إنتاج عبارة حرفية واستعمالها » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                    [الحرف يمثّل عددًا]                                مفهوم
 *             نسمّي ┌──────────┴──────────┐ خطأ شائع
 *        [قاعدة 5n+1] (M1)             ⛔ [6n]
 *                 نعوّض │
 *        [قيمة العبارة: n = 40] (M1)
 *                 نقارن │
 *       [كتابتان والجدول نفسه] (M1)
 *                 نزيد │
 *          [عبارة بحرفين] (M1)
 *                 نسمّي │
 *        [العبارة الحرفية] → [اختصار الكتابة] → [المربّع والمكعّب] (M2)
 *                 نكتب │
 *      [من الكلمات] → [تعميم نمط] → [برنامج حساب] → [تجميع الحدود] (M3)
 *                 نستخلص │
 *                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'harf',
  nodes: [
    {
      id: 'harf', kind: 'concept', lane: 'center', requires: 'harf-yaud', notebook: true,
      title: 'الحرف يمثّل عدد الخلايا', subtitle: '$n=1,\\ 2,\\ 3,\\ \\dots$',
      context: { text: GUIDE.cells, note: 'ما الذي يتغيّر من صفّ إلى صفّ؟' },
      reveals: ['qaida'],
    },
    {
      // ⛔ خطأ شائع — la règle 6n : le bâtonnet partagé est compté deux fois.
      id: 'khata-6n', kind: 'common_mistake', lane: 'start', requires: 'qaida-5n1',
      title: 'القاعدة 6n؟', subtitle: '$6\\times 2=12\\neq 11$',
      context: { parts: [
        { role: 'wrong', text: 'لو كانت كلّ خلية تحتاج $6$ أعواد لكتبنا $6n$ .' },
        { role: 'why', text: 'من أجل $n=2$ نجد $12$ والصفّ يحمل $11$ : العود المشترك عُدّ مرّتين.' },
        { role: 'right', text: GUIDE.rule },
      ] },
      reveals: [],
    },
    {
      id: 'qaida', kind: 'method', lane: 'end', requires: 'qaida-5n1', notebook: true,
      title: 'قاعدة عدد الأعواد', subtitle: '$5\\times n+1=5n+1$',
      context: { text: GUIDE.rule },
      reveals: ['khata-6n', 'qima'],
    },
    {
      id: 'qima', kind: 'example', lane: 'center', requires: 'qima-40', notebook: true,
      title: 'قيمة العبارة', subtitle: '$5\\times 40+1=201$',
      context: { text: GUIDE.far },
      reveals: ['kitabatan'],
    },
    {
      id: 'kitabatan', kind: 'relationship', lane: 'center', requires: 'kitabatan', notebook: true,
      title: 'كتابتان والجدول نفسه', subtitle: '$6+5(n-1)$ و $5n+1$',
      context: { text: GUIDE.same },
      reveals: ['harfan'],
    },
    {
      id: 'harfan', kind: 'example', lane: 'center', requires: 'harfan', notebook: true,
      title: 'عبارة بحرفين', subtitle: '$5n+1+8m+3$',
      context: { text: GUIDE.two },
      reveals: ['ta3rif'],
    },
    {
      id: 'ta3rif', kind: 'term', lane: 'center', requires: 'ta3rif', notebook: true,
      title: 'العبارة الحرفية', subtitle: '$4\\times x=4x$',
      context: { text: KNOWLEDGE.definition.text, formula: KNOWLEDGE.definition.example },
      reveals: ['ikhtisar'],
    },
    {
      id: 'ikhtisar', kind: 'method', lane: 'center', requires: 'ikhtisar-kitaba', notebook: true,
      title: 'اختصار الكتابة', subtitle: '$5\\times n=5n$',
      context: { text: KNOWLEDGE.conventions.text },
      reveals: ['murabba'],
    },
    {
      id: 'murabba', kind: 'term', lane: 'center', requires: 'murabba-mukaab', notebook: true,
      title: 'المربّع والمكعّب', subtitle: '$a^2$ و $a^3$',
      context: { text: KNOWLEDGE.powers.text },
      reveals: ['tarjama'],
    },
    {
      id: 'tarjama', kind: 'method', lane: 'center', requires: 'tarjama-harf', notebook: true,
      title: 'من الكلمات إلى الحرف', subtitle: '$35+x$ ، $6x$ ، $2x+7$',
      context: { text: METHOD.solution[0] },
      reveals: ['taamim'],
    },
    {
      id: 'taamim', kind: 'relationship', lane: 'center', requires: 'taamim-hadd', notebook: true,
      title: 'تعميم نمط بطريقتين', subtitle: '$4n+4=4(n+1)$',
      context: { text: GUIDE.border },
      reveals: ['barnamij'],
    },
    {
      id: 'barnamij', kind: 'example', lane: 'center', requires: 'barnamij', notebook: true,
      title: 'برنامج حساب بعبارة', subtitle: '$3x+5$',
      context: { text: METHOD.solution[2] },
      reveals: ['tajmi'],
    },
    {
      id: 'tajmi', kind: 'method', lane: 'center', requires: 'tajmi', notebook: true,
      title: 'تجميع الحدود المتشابهة', subtitle: '$2a+5a-3a=4a$',
      context: { text: KNOWLEDGE.like.text, formula: KNOWLEDGE.like.example },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tajmi',
      title: 'الخلاصة', subtitle: 'حرف · عبارة · قيمة · تبسيط',
      context: { text: METHOD.rule, note: GUIDE.simplify },
      reveals: [],
    },
  ],
  edges: [
    { from: 'harf', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'khata-6n', label: 'خطأ شائع' },
    { from: 'qaida', to: 'qima', label: 'نعوّض' },
    { from: 'qima', to: 'kitabatan', label: 'نقارن' },
    { from: 'kitabatan', to: 'harfan', label: 'نزيد' },
    { from: 'harfan', to: 'ta3rif', label: 'نسمّي' },
    { from: 'ta3rif', to: 'ikhtisar', label: 'نكتب' },
    { from: 'ikhtisar', to: 'murabba', label: 'ونوسّع' },
    { from: 'murabba', to: 'tarjama', label: 'نطبّق' },
    { from: 'tarjama', to: 'taamim', label: 'نعمّم' },
    { from: 'taamim', to: 'barnamij', label: 'نترجم' },
    { from: 'barnamij', to: 'tajmi', label: 'نبسّط' },
    { from: 'tajmi', to: 'khulasa', label: 'نستخلص' },
  ],
};
