/**
 * La carte PROGRESSIVE du درس « حاصل قسمة عددين نسبيين » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite
 * ici : chaque texte vient de la leçon (content/textbook.js, les phrases de correction partagées `GUIDE`). Chaque nœud est gardé par
 * l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [القسمة عامل مجهول] (M1) → [إشارة حاصل القسمة] (M1) ── خطأ شائع ── ⛔ [سالب ÷ سالب]
 *                                        │
 *   [كتابات الكسر] (M2) ── خطأ شائع ── ⛔ [−2/−3 سالب؟]   → [لا قسمة على الصفر] (M2)
 *                                        │
 *   [أحسب حاصل قسمة] (M3) → [حاصل قسمة جداءين] (M3) → [سلسلة حسابات] (M3) ── خطأ شائع ── ⛔ [الأولوية] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'qisma',
  nodes: [
    {
      id: 'qisma', kind: 'concept', lane: 'center', requires: 'qisma-aamil', notebook: true,
      title: 'القسمة عامل مجهول', subtitle: '$a \\div b = q \\iff b \\times q = a$',
      context: { text: KNOWLEDGE.definition.lines.join(' '), formula: KNOWLEDGE.definition.examples },
      reveals: ['ishara'],
    },
    {
      id: 'ishara', kind: 'relationship', lane: 'center', requires: 'ishara-qisma', notebook: true,
      title: 'إشارة حاصل القسمة', subtitle: '$(-35) \\div (-5) = 7$',
      context: { text: KNOWLEDGE.signs.lines.join(' '), formula: KNOWLEDGE.signs.examples },
      reveals: ['khata-sign', 'kasr'],
    },
    {
      // ⛔ خطأ شائع — « سالب ÷ سالب = سالب » (la banque : MISC-QISMA-SIGN).
      id: 'khata-sign', kind: 'common_mistake', lane: 'start', requires: 'ishara-qisma',
      title: 'سالب ÷ سالب؟', subtitle: '$(-60) \\div (-12) = 5$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.negNeg.wrong },
          { role: 'why', text: GUIDE.negNeg.why },
          { role: 'right', text: GUIDE.negNeg.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'kasr', kind: 'relationship', lane: 'end', requires: 'kasr-qisma', notebook: true,
      title: 'كتابات الحاصل غير العشري', subtitle: '$\\frac{-a}{b} = \\frac{a}{-b} = -\\frac{a}{b}$',
      context: { text: KNOWLEDGE.fraction.lines.join(' '), formula: KNOWLEDGE.fraction.examples },
      reveals: ['khata-frac', 'sifr'],
    },
    {
      // ⛔ خطأ شائع — « 2/−3 ليس −2/3 » (la banque : MISC-QISMA-FRACSIGN).
      id: 'khata-frac', kind: 'common_mistake', lane: 'start', requires: 'kasr-qisma',
      title: 'كسر بإشارتين سالبتين؟', subtitle: '$\\frac{-2}{-3} = \\frac{2}{3}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.frac.wrong },
          { role: 'why', text: GUIDE.frac.why },
          { role: 'right', text: GUIDE.frac.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sifr', kind: 'concept', lane: 'center', requires: 'qisma-sifr', notebook: true,
      title: 'لا قسمة على الصفر', subtitle: '$0 \\times q = 0$',
      context: { text: KNOWLEDGE.zero.text, note: GUIDE.zero },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-qisma', notebook: true,
      title: 'أحسب حاصل قسمة', subtitle: 'الإشارة ثم المسافتان',
      context: { text: METHOD.compute.rule[0], note: METHOD.sign.text },
      reveals: ['jadaa'],
    },
    {
      id: 'jadaa', kind: 'relationship', lane: 'center', requires: 'ishara-jadaa', notebook: true,
      title: 'حاصل قسمة جداءين', subtitle: '$\\frac{(-2) \\times 3 \\times (-1)}{4 \\times (-5)}$',
      context: { text: METHOD.products.text },
      reveals: ['silsila'],
    },
    {
      id: 'silsila', kind: 'method', lane: 'end', requires: 'tariqat-awlawiya', notebook: true,
      title: 'سلسلة حسابات', subtitle: '$5 - (3 \\times (-4) + 7) = 10$',
      context: { text: KNOWLEDGE.priorities.lines.join(' '), formula: KNOWLEDGE.priorities.examples },
      reveals: ['khata-priority', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — الأولوية (la banque : MISC-QISMA-PRIORITY).
      id: 'khata-priority', kind: 'common_mistake', lane: 'start', requires: 'tariqat-awlawiya',
      title: 'الحساب من اليسار إلى اليمين؟', subtitle: '$(-12) \\div (1 - 4) + 2$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.priority.wrong },
          { role: 'why', text: GUIDE.priority.why },
          { role: 'right', text: GUIDE.priority.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-awlawiya',
      title: 'الخلاصة', subtitle: 'عامل مجهول · إشارة · كسر · أولويات',
      context: { text: KNOWLEDGE.definition.lines.join(' '), note: KNOWLEDGE.signs.lines[0] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qisma', to: 'ishara', label: 'قاعدتها' },
    { from: 'ishara', to: 'khata-sign', label: 'خطأ شائع' },
    { from: 'ishara', to: 'kasr', label: 'ثم' },
    { from: 'kasr', to: 'khata-frac', label: 'خطأ شائع' },
    { from: 'kasr', to: 'sifr', label: 'ونستثني' },
    { from: 'sifr', to: 'tariqa', label: 'نحسب' },
    { from: 'tariqa', to: 'jadaa', label: 'ثم' },
    { from: 'jadaa', to: 'silsila', label: 'ثم' },
    { from: 'silsila', to: 'khata-priority', label: 'خطأ شائع' },
    { from: 'silsila', to: 'khulasa', label: 'نستخلص' },
  ],
};
