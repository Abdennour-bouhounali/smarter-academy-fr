/**
 * La carte PROGRESSIVE du درس « تساوي كسرين ومقارنتهما » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [الجداءان المتصالبان] (M1) → [المقارنة بالجداءين] (M1) → [توحيد المقامين] (M1) ── خطأ شائع ── ⛔ [الإضافة بدل الضرب]
 *        ثم │
 *   [الخاصية في الاتجاهين] (M2) → [قاعدة توحيد المقامين] (M2) → [اختيار الطريقة] (M3) ── خطأ شائع ── ⛔ [الحاسبة] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jidaa',
  nodes: [
    {
      id: 'jidaa', kind: 'concept', lane: 'center', requires: 'jidaa-mutasalib', notebook: true,
      title: 'تساوي كسرين', subtitle: '$a\\times d=b\\times c$',
      context: { text: GUIDE.paint },
      reveals: ['muqarana'],
    },
    {
      id: 'muqarana', kind: 'relationship', lane: 'center', requires: 'muqarana-mutasalib', notebook: true,
      title: 'مقارنة كسرين بالجداءين', subtitle: '$a\\times d<b\\times c$',
      context: { text: KNOWLEDGE.rule.text },
      reveals: ['khata-add', 'tawhid'],
    },
    {
      id: 'tawhid', kind: 'relationship', lane: 'end', requires: 'tawhid-maqamat', notebook: true,
      title: 'توحيد المقامين', subtitle: '$\\frac{15}{20}$ و $\\frac{14}{20}$',
      context: { text: KNOWLEDGE.examples.text },
      reveals: ['khassa'],
    },
    {
      // ⛔ خطأ شائع — ajouter le même nombre au numérateur et au dénominateur.
      id: 'khata-add', kind: 'common_mistake', lane: 'start', requires: 'tawhid-maqamat',
      title: 'الإضافة بدل الضرب؟', subtitle: '$\\frac{7}{8}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.addsame.wrong },
          { role: 'why', text: GUIDE.addsame.why },
          { role: 'right', text: GUIDE.addsame.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khassa', kind: 'term', lane: 'center', requires: 'jidaa-property', notebook: true,
      title: 'الخاصية في الاتجاهين', subtitle: '$\\frac{a}{b}=\\frac{c}{d}$',
      context: { text: KNOWLEDGE.property.text, note: KNOWLEDGE.proof.text },
      reveals: ['qaida'],
    },
    {
      id: 'qaida', kind: 'concept', lane: 'center', requires: 'qaida-tawhid', notebook: true,
      title: 'قاعدة توحيد المقامين', subtitle: '$b\\times d$',
      context: { text: KNOWLEDGE.rule.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'ikhtiyar-tariqa', notebook: true,
      title: 'اختيار الطريقة', subtitle: '$\\frac{125}{97}>1>\\frac{61}{340}$',
      context: { text: METHOD.choose.rule, note: METHOD.digits.rule },
      reveals: ['khata-calc', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — croire qu'un affichage de calculatrice prouve l'égalité.
      id: 'khata-calc', kind: 'common_mistake', lane: 'end', requires: 'ikhtiyar-tariqa',
      title: 'الحاسبة تؤكّد التساوي؟', subtitle: '$\\frac{355}{113}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.calc.wrong },
          { role: 'why', text: GUIDE.calc.why },
          { role: 'right', text: GUIDE.calc.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'ikhtiyar-tariqa',
      title: 'الخلاصة', subtitle: '$\\frac{a}{b}=\\frac{c}{d}\\Leftrightarrow a\\times d=b\\times c$',
      context: { text: KNOWLEDGE.property.text, note: METHOD.choose.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jidaa', to: 'muqarana', label: 'ثم' },
    { from: 'muqarana', to: 'khata-add', label: 'خطأ شائع' },
    { from: 'muqarana', to: 'tawhid', label: 'ثم' },
    { from: 'tawhid', to: 'khassa', label: 'نسمّي' },
    { from: 'khassa', to: 'qaida', label: 'ونقارن' },
    { from: 'qaida', to: 'tariqa', label: 'نختار' },
    { from: 'tariqa', to: 'khata-calc', label: 'خطأ شائع' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
