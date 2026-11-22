/**
 * La carte PROGRESSIVE du درس « قوة عدد نسبي » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js : معارف 6–8 et la طريقة réécrites, les phrases de correction
 * partagées avec les modules, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                              [القوة aⁿ]                                   مفهوم
 *              إشارتها ┌──────────────┴──────────────┐ حالات خاصّة
 *               [الإشارة والزوجية] (M1)           [الأس صفر] (M1)
 *              خطأ شائع │                           ثم │
 *               ⛔ [−2⁴ أم (−2)⁴؟]                [الأس السالب] (M1)
 *                                                خطأ شائع │
 *                                                ⛔ [3⁻² سالب؟]
 *                                    قواعد │
 *                             [الجداء] (M2) ── خطأ شائع ── ⛔ [ضرب الأسين؟]
 *                                    ثم │
 *                       [حاصل القسمة] (M2) → [قوة قوة] (M2) → [قوة جداء] (M2)
 *                                 نستعملها في │
 *                           [التبسيط] (M3) → ⚠️ [الأولوية] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'quwa',
  nodes: [
    {
      id: 'quwa', kind: 'concept', lane: 'center', requires: 'quwa-taarif', notebook: true,
      title: 'القوة: أساس وأس', subtitle: '$a^n = a \\times \\ldots \\times a$',
      context: { text: KNOWLEDGE.definition.text, note: KNOWLEDGE.definition.example },
      reveals: ['ishara', 'sifr'],
    },
    {
      id: 'ishara', kind: 'relationship', lane: 'start', requires: 'ishara-quwa', notebook: true,
      title: 'الإشارة والزوجية', subtitle: '$(-2)^5 = -32$',
      context: { text: KNOWLEDGE.sign.text, formula: '$(-2)^4 = 16$' },
      reveals: ['khata-minus'],
    },
    {
      // ⛔ خطأ شائع — −2⁴ lu comme (−2)⁴ (أتمرّن, ligne « $-2^4$ » et ses distracteurs).
      id: 'khata-minus', kind: 'common_mistake', lane: 'start', requires: 'ishara-quwa',
      title: 'سالب 2 أس 4؟', subtitle: '$-2^4 = -16$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.minusTrap.wrong },
          { role: 'why', text: GUIDE.minusTrap.why },
          { role: 'right', text: GUIDE.minusTrap.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sifr', kind: 'term', lane: 'end', requires: 'quwa-sifr', notebook: true,
      title: 'الأس صفر', subtitle: '$a^0 = 1$',
      context: { text: KNOWLEDGE.zero.text, note: GUIDE.zero },
      reveals: ['salib'],
    },
    {
      id: 'salib', kind: 'term', lane: 'end', requires: 'quwa-salib', notebook: true,
      title: 'الأس السالب', subtitle: '$a^{-n} = \\frac{1}{a^n}$',
      reveals: ['khata-salib'],
    },
    {
      id: 'khata-salib', kind: 'common_mistake', lane: 'end', requires: 'quwa-salib',
      title: 'أس سالب: قوة سالبة؟', subtitle: '$3^{-2} = \\frac{1}{9}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.negExp.wrong },
          { role: 'why', text: GUIDE.negExp.why },
          { role: 'right', text: GUIDE.negExp.right },
        ],
      },
      reveals: ['jidaa'],
    },
    {
      id: 'jidaa', kind: 'relationship', lane: 'center', requires: 'jidaa-quwatayn', notebook: true,
      title: 'جداء قوتين', subtitle: '$a^m \\times a^n = a^{m+n}$',
      reveals: ['khata-jidaa', 'hasil'],
    },
    {
      id: 'khata-jidaa', kind: 'common_mistake', lane: 'start', requires: 'jidaa-quwatayn',
      title: 'نضرب الأسين؟', subtitle: '$2^3 \\times 2^4 = 2^7$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.product.wrong },
          { role: 'why', text: GUIDE.product.why },
          { role: 'right', text: GUIDE.product.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'hasil', kind: 'relationship', lane: 'end', requires: 'hasil-quwatayn', notebook: true,
      title: 'حاصل قسمة قوتين', subtitle: '$\\frac{a^m}{a^n} = a^{m-n}$',
      reveals: ['quwat-quwa'],
    },
    {
      id: 'quwat-quwa', kind: 'relationship', lane: 'end', requires: 'quwat-quwa', notebook: true,
      title: 'قوة قوة', subtitle: '$(a^m)^n = a^{mn}$',
      reveals: ['quwat-jidaa'],
    },
    {
      id: 'quwat-jidaa', kind: 'relationship', lane: 'center', requires: 'quwat-jidaa', notebook: true,
      title: 'قوة جداء', subtitle: '$(ab)^n = a^n b^n$',
      reveals: ['tabsit'],
    },
    {
      id: 'tabsit', kind: 'method', lane: 'center', requires: 'tariqat-tabsit', notebook: true,
      title: 'أبسّط عبارة بقوى', subtitle: '$3^2 \\times 2^2 = 36$',
      context: { text: METHOD.simplify.rule },
      reveals: ['awlawiya'],
    },
    {
      id: 'awlawiya', kind: 'warning', lane: 'center', requires: 'awlawiya-quwa', notebook: true,
      title: 'القوى قبل الضرب', subtitle: '$-3^2 = -9$',
      context: { text: METHOD.priority.text, note: METHOD.priority.minus },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'awlawiya-quwa',
      title: 'الخلاصة', subtitle: '$a^0 = 1$ ، $a^{-n} = \\frac{1}{a^n}$',
      context: { text: KNOWLEDGE.inverse.text, note: KNOWLEDGE.sign.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'quwa', to: 'ishara', label: 'إشارتها' },
    { from: 'quwa', to: 'sifr', label: 'حالة خاصّة' },
    { from: 'ishara', to: 'khata-minus', label: 'خطأ شائع' },
    { from: 'sifr', to: 'salib', label: 'ثم' },
    { from: 'salib', to: 'khata-salib', label: 'خطأ شائع' },
    { from: 'khata-salib', to: 'jidaa', label: 'قواعد' },
    { from: 'jidaa', to: 'khata-jidaa', label: 'خطأ شائع' },
    { from: 'jidaa', to: 'hasil', label: 'ثم' },
    { from: 'hasil', to: 'quwat-quwa', label: 'ثم' },
    { from: 'quwat-quwa', to: 'quwat-jidaa', label: 'ثم' },
    { from: 'quwat-jidaa', to: 'tabsit', label: 'نستعملها' },
    { from: 'tabsit', to: 'awlawiya', label: 'انتبه' },
    { from: 'awlawiya', to: 'khulasa', label: 'نستخلص' },
  ],
};
