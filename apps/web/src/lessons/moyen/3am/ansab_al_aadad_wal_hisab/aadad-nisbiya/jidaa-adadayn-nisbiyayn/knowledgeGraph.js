/**
 * La carte PROGRESSIVE du درس « جداء عددين نسبيين » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite
 * ici : chaque texte vient de la leçon (content/textbook.js, les phrases de correction partagées `GUIDE`). Chaque nœud est gardé par
 * l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                              [جداء عددين نسبيين]                           مفهوم
 *               ┌───────────────┴────────────────┐
 *        [الجمع المتكرر] (M1)                [قاعدة الإشارات] (M1) ── خطأ شائع ── ⛔ [سالب × سالب؟]
 *                                                │ نبرّرها
 *                              [الخاصية التوزيعية] (M2) → [جدول الجداءات] (M2)
 *                                                │ نستعملها في
 *                              [أحسب الجداء] (M3) ── خطأ شائع ── ⛔ [الفاصلة]
 *                                                │
 *                                    [جداء الصفر] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jidaa',
  nodes: [
    {
      id: 'jidaa', kind: 'concept', lane: 'center', requires: 'jidaa-jamaa', notebook: true,
      title: 'جداء عدد سالب في عدد موجب', subtitle: '$(-2) \\times 3 = -6$',
      context: { text: KNOWLEDGE.repeated.text },
      reveals: ['ishara'],
    },
    {
      id: 'ishara', kind: 'relationship', lane: 'start', requires: 'ishara-jidaa', notebook: true,
      title: 'قاعدة الإشارات', subtitle: '$(-5) \\times (-4) = 20$',
      context: { text: KNOWLEDGE.signRule.lines.join(' '), formula: KNOWLEDGE.signRule.examples },
      reveals: ['khata-negneg', 'tabrir'],
    },
    {
      // ⛔ خطأ شائع — « سالب × سالب = سالب » (la banque : MISC-JIDAA-NEGNEG).
      id: 'khata-negneg', kind: 'common_mistake', lane: 'start', requires: 'ishara-jidaa',
      title: 'سالب في سالب؟', subtitle: '$(-3) \\times (-4) = 12$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.negneg.wrong },
          { role: 'why', text: GUIDE.negneg.why },
          { role: 'right', text: GUIDE.negneg.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tabrir', kind: 'relationship', lane: 'center', requires: 'tabrir-tawzi', notebook: true,
      title: 'لماذا جداء سالبين موجب؟', subtitle: '$(-3) \\times 4 + (-3) \\times (-4) = 0$',
      context: { text: KNOWLEDGE.justify.text },
      reveals: ['jadwal'],
    },
    {
      id: 'jadwal', kind: 'relationship', lane: 'end', requires: 'jadwal-munakhafid', notebook: true,
      title: 'جدول ينقص عاملُه الثاني', subtitle: '$(-4) \\times (-1) = 4$',
      context: { text: KNOWLEDGE.table.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-jidaa', notebook: true,
      title: 'أحسب جداء عددين نسبيين', subtitle: 'الإشارة ثم المسافتان',
      context: { text: METHOD.steps.rule },
      reveals: ['khata-decimal', 'sifr'],
    },
    {
      id: 'khata-decimal', kind: 'common_mistake', lane: 'start', requires: 'tariqat-jidaa',
      title: 'أين الفاصلة؟', subtitle: '$(-0{,}3) \\times (-0{,}2) = 0{,}06$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.decimal.wrong },
          { role: 'why', text: GUIDE.decimal.why },
          { role: 'right', text: GUIDE.decimal.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sifr', kind: 'term', lane: 'end', requires: 'jidaa-sifr', notebook: true,
      title: 'جداء عدد في الصفر', subtitle: '$a \\times 0 = 0$',
      context: { text: KNOWLEDGE.distance.zero, note: GUIDE.zero },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'jidaa-sifr',
      title: 'الخلاصة', subtitle: 'الإشارة ثم المسافتان',
      context: { text: KNOWLEDGE.signRule.lines.join(' '), note: KNOWLEDGE.distance.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jidaa', to: 'ishara', label: 'قاعدتها' },
    { from: 'ishara', to: 'khata-negneg', label: 'خطأ شائع' },
    { from: 'ishara', to: 'tabrir', label: 'نبرّرها' },
    { from: 'tabrir', to: 'jadwal', label: 'ثم' },
    { from: 'jadwal', to: 'tariqa', label: 'نستعملها' },
    { from: 'tariqa', to: 'khata-decimal', label: 'خطأ شائع' },
    { from: 'tariqa', to: 'sifr', label: 'حالة خاصّة' },
    { from: 'sifr', to: 'khulasa', label: 'نستخلص' },
  ],
};
