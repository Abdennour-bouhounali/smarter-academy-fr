/**
 * La carte PROGRESSIVE du درس « جداء عدة أعداد نسبية » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite
 * ici : chaque texte vient de la leçon (content/textbook.js, les phrases de correction partagées `GUIDE`). Chaque nœud est gardé par
 * l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                              [جداء عدة أعداد نسبية]                         مفهوم
 *                                        │
 *                       [الضرب في −1 ومعاكس عدد] (M1) ── [القاعدة: عدد العوامل السالبة] (M1) ── خطأ شائع ── ⛔ [عامل سالب واحد؟]
 *                                                                     │
 *                                       [مربّع عدد نسبي] (M2) ── خطأ شائع ── ⛔ [مربّع سالب؟]
 *                                                                     │
 *                                       [أدوار الإشارة] (M2) → [أحسب الجداء] (M3) → [التوزيع] (M3) ── خطأ شائع ── ⛔ [إشارة التوزيع]
 *                                                                     │
 *                                                              🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'idda',
  nodes: [
    {
      id: 'idda', kind: 'concept', lane: 'center', requires: 'maakus', notebook: true,
      title: 'الضرب في −1', subtitle: '$(-1) \\times a = -a$',
      context: { text: KNOWLEDGE.opposite.lines.join(' '), formula: KNOWLEDGE.opposite.examples },
      reveals: ['parity'],
    },
    {
      id: 'parity', kind: 'relationship', lane: 'start', requires: 'adad-salib', notebook: true,
      title: 'إشارة جداء عدة أعداد', subtitle: '$2 \\times (-5) \\times (-1) \\times (-3) = -30$',
      context: { text: KNOWLEDGE.parity.lines.join(' '), formula: KNOWLEDGE.parity.examples },
      reveals: ['khata-anyneg', 'murabba'],
    },
    {
      // ⛔ خطأ شائع — « عامل سالب واحد يكفي » (la banque : MISC-IDA-ANYNEG).
      id: 'khata-anyneg', kind: 'common_mistake', lane: 'start', requires: 'adad-salib',
      title: 'عامل سالب واحد؟', subtitle: '$(-2) \\times (-3) \\times 4 = 24$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.anyNeg.wrong },
          { role: 'why', text: GUIDE.anyNeg.why },
          { role: 'right', text: GUIDE.anyNeg.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'murabba', kind: 'relationship', lane: 'center', requires: 'murabba', notebook: true,
      title: 'مربّع عدد نسبي', subtitle: '$(-1{,}5)^2 = 2{,}25$',
      context: { text: KNOWLEDGE.square.text },
      reveals: ['khata-square', 'adwar'],
    },
    {
      id: 'khata-square', kind: 'common_mistake', lane: 'start', requires: 'murabba',
      title: 'مربّع سالب؟', subtitle: '$(-3)^2 = 9$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.squareNeg.wrong },
          { role: 'why', text: GUIDE.squareNeg.why },
          { role: 'right', text: GUIDE.squareNeg.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'adwar', kind: 'term', lane: 'end', requires: 'adwar', notebook: true,
      title: 'أدوار الإشارة −', subtitle: '$17 - 9$ ، $-8$ ، $-b$',
      context: { text: KNOWLEDGE.roles.text, note: GUIDE.minusA.why },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-iddat', notebook: true,
      title: 'أحسب جداء عدة أعداد', subtitle: 'نعدّ السالبة ثم نضرب المسافات',
      context: { text: METHOD.steps.rule, note: METHOD.reorder.text },
      reveals: ['tawzi'],
    },
    {
      id: 'tawzi', kind: 'method', lane: 'end', requires: 'tawzi-aadad', notebook: true,
      title: 'توزيع الضرب في الاتجاهين', subtitle: '$(-25) \\times (4 - 0{,}4) = -90$',
      context: { text: KNOWLEDGE.distribute.text },
      reveals: ['khata-dist', 'khulasa'],
    },
    {
      id: 'khata-dist', kind: 'common_mistake', lane: 'start', requires: 'tawzi-aadad',
      title: 'إشارة التوزيع', subtitle: '$(-25) \\times (4 - 0{,}4) = -100 + 10$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.distSign.wrong },
          { role: 'why', text: GUIDE.distSign.why },
          { role: 'right', text: GUIDE.distSign.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tawzi-aadad',
      title: 'الخلاصة', subtitle: 'عدد السالبة · المربّع · التوزيع',
      context: { text: KNOWLEDGE.parity.lines.join(' '), note: GUIDE.zero },
      reveals: [],
    },
  ],
  edges: [
    { from: 'idda', to: 'parity', label: 'قاعدتها' },
    { from: 'parity', to: 'khata-anyneg', label: 'خطأ شائع' },
    { from: 'parity', to: 'murabba', label: 'حالة خاصّة' },
    { from: 'murabba', to: 'khata-square', label: 'خطأ شائع' },
    { from: 'murabba', to: 'adwar', label: 'ثم' },
    { from: 'adwar', to: 'tariqa', label: 'نستعملها' },
    { from: 'tariqa', to: 'tawzi', label: 'ثم' },
    { from: 'tawzi', to: 'khata-dist', label: 'خطأ شائع' },
    { from: 'tawzi', to: 'khulasa', label: 'نستخلص' },
  ],
};
