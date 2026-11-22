/**
 * La carte PROGRESSIVE du درس « المتباينات والعمليات » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui
 * l'établit (`requires`).
 *
 *   [المتباينة والجمع والطرح] (M1)
 *      │ الاتجاه                       │ ثم
 *   [الاتجاه محفوظ] (M1)           [الضرب في موجب] (M1) ── ثم ──▶ [الضرب في سالب] (M1)
 *      │ خطأ شائع                                               │ خطأ شائع             │ استثناء
 *   ⛔ [الطرح يعكس؟]                                       ⛔ [سالب بلا عكس؟]     [الصفر] (M2) ── نستعملها ──▶ [أستنتج] (M3) → [أحصر] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'mutabayina',
  nodes: [
    {
      id: 'mutabayina', kind: 'concept', lane: 'center', requires: 'jam-mutabayina', notebook: true,
      title: 'المتباينة والجمع والطرح', subtitle: '$a<b \\Rightarrow a+c<b+c$',
      context: { text: KNOWLEDGE.add.text, note: KNOWLEDGE.add.example },
      reveals: ['ittijah', 'mujab'],
    },
    {
      id: 'ittijah', kind: 'relationship', lane: 'start', requires: 'jam-mutabayina',
      title: 'الجمع والطرح يحفظان الاتجاه', subtitle: '$a-c<b-c$',
      context: { text: GUIDE.together },
      reveals: ['khata-tarh'],
    },
    {
      // ⛔ خطأ شائع — « الطرح يقلب الاتجاه » (labo : المشط بعدد سالب ; اختبار أولي 1).
      id: 'khata-tarh', kind: 'common_mistake', lane: 'start', requires: 'jam-mutabayina',
      title: 'الطرح يعكس الاتجاه؟', subtitle: '$a-4$ و $b-4$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.subFlip.wrong },
          { role: 'why', text: GUIDE.subFlip.why },
          { role: 'right', text: GUIDE.subFlip.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'mujab', kind: 'relationship', lane: 'end', requires: 'darb-mujab', notebook: true,
      title: 'الضرب في عدد موجب', subtitle: '$a<b, c>0 \\Rightarrow ac<bc$',
      context: { text: KNOWLEDGE.pos.text, note: KNOWLEDGE.pos.example },
      reveals: ['salib'],
    },
    {
      id: 'salib', kind: 'relationship', lane: 'end', requires: 'darb-salib', notebook: true,
      title: 'الضرب في عدد سالب', subtitle: '$a<b, c<0 \\Rightarrow ac>bc$',
      context: { text: KNOWLEDGE.neg.text, note: KNOWLEDGE.neg.example },
      reveals: ['khata-salib', 'sifr'],
    },
    {
      id: 'khata-salib', kind: 'common_mistake', lane: 'end', requires: 'darb-salib',
      title: 'سالب بلا عكس؟', subtitle: '$-3x$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.negNoFlip.wrong },
          { role: 'why', text: GUIDE.negNoFlip.why },
          { role: 'right', text: GUIDE.negNoFlip.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sifr', kind: 'term', lane: 'center', requires: 'sifr-mutabayina', notebook: true,
      title: 'الصفر', subtitle: '$0=0$',
      context: { text: KNOWLEDGE.zero.text },
      reveals: ['qisma'],
    },
    {
      id: 'qisma', kind: 'relationship', lane: 'center', requires: 'qisma-wa-taswiya', notebook: true,
      title: '≤ و ≥ والقسمة', subtitle: '$\\frac{a}{c}=a\\times\\frac{1}{c}$',
      context: { text: KNOWLEDGE.weak.text },
      reveals: ['istintaj'],
    },
    {
      id: 'istintaj', kind: 'method', lane: 'center', requires: 'istintaj', notebook: true,
      title: 'أستنتج متباينة من أخرى', subtitle: '$-2x\\geq -6 \\Rightarrow x\\leq 3$',
      context: { text: METHOD.deduce.rule },
      reveals: ['muqarana'],
    },
    {
      id: 'muqarana', kind: 'method', lane: 'center', requires: 'muqarana-bil-khawas', notebook: true,
      title: 'أقارن عبارتين', subtitle: '$A-B$',
      context: { text: METHOD.compare.rule },
      reveals: ['hasr'],
    },
    {
      id: 'hasr', kind: 'method', lane: 'center', requires: 'hasr-ab', notebook: true,
      title: 'أحصر عبارة', subtitle: '$2\\leq t\\leq 5$',
      context: { text: METHOD.bracket.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'hasr-ab',
      title: 'الخلاصة', subtitle: '$a<b \\Rightarrow a+c<b+c$',
      context: { text: GUIDE.together, note: GUIDE.flip },
      reveals: [],
    },
  ],
  edges: [
    { from: 'mutabayina', to: 'ittijah', label: 'الجمع والطرح' },
    { from: 'ittijah', to: 'khata-tarh', label: 'خطأ شائع' },
    { from: 'mutabayina', to: 'mujab', label: 'ثم' },
    { from: 'mujab', to: 'salib', label: 'وبعدد سالب' },
    { from: 'salib', to: 'khata-salib', label: 'خطأ شائع' },
    { from: 'salib', to: 'sifr', label: 'استثناء' },
    { from: 'sifr', to: 'qisma', label: 'ثم' },
    { from: 'qisma', to: 'istintaj', label: 'نستعملها' },
    { from: 'istintaj', to: 'muqarana', label: 'ثم' },
    { from: 'muqarana', to: 'hasr', label: 'ثم' },
    { from: 'hasr', to: 'khulasa', label: 'نستخلص' },
  ],
};
