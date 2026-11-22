/**
 * La carte PROGRESSIVE du درس « حساب الرابع المتناسب » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js : propriétés, طريقة, `GUIDE`). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit (`requires`).
 *
 *                              [الرابع المتناسب]                              مفهوم
 *               طرق ┌─────────────────┴─────────────────┐ الجداءان
 *            [طرق الحساب] (M2)                     [الجداءان المتصالبان] (M1)
 *        خطأ شائع │                                       │ نحسب
 *   ⛔ [نضيف الفرق؟]                              [أحسب بالجداءين] (M2) → [أختار الطريق] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'rabi',
  nodes: [
    {
      id: 'rabi', kind: 'concept', lane: 'center', requires: 'rabi', notebook: true,
      title: 'الرابع المتناسب', subtitle: 'ثلاثة معلومة، رابع واحد',
      context: { text: KNOWLEDGE.fourth.text },
      reveals: ['jidaan'],
    },
    {
      id: 'turuq', kind: 'relationship', lane: 'end', requires: 'turuq', notebook: true,
      title: 'طرق الحساب', subtitle: 'الوحدة والخاصيتان',
      context: { text: KNOWLEDGE.routes.text },
      reveals: ['hisab-jidaan'],
    },
    {
      // ⛔ خطأ شائع — la même différence ajoutée aux deux nombres (أتمرّن ex-16, banque).
      id: 'khata-farq', kind: 'common_mistake', lane: 'start', requires: 'farq', notebook: true,
      title: 'نضيف الفرق؟', subtitle: '$5 \\to 6$ ، $625 \\to 626$ ؟',
      context: { parts: [{ role: 'wrong', text: GUIDE.addDiff.wrong }, { role: 'why', text: GUIDE.addDiff.why }, { role: 'right', text: GUIDE.addDiff.right }] },
      reveals: [],
    },
    {
      id: 'jidaan', kind: 'relationship', lane: 'start', requires: 'jidaan', notebook: true,
      title: 'الجداءان المتصالبان', subtitle: '$a \\times d = b \\times c$',
      context: { text: KNOWLEDGE.cross.text, note: KNOWLEDGE.remark.text },
      reveals: ['khata-farq', 'turuq'],
    },
    {
      id: 'hisab-jidaan', kind: 'relationship', lane: 'end', requires: 'hisab-jidaan', notebook: true,
      title: 'أحسب بالجداءين', subtitle: '$x = b \\times c \\div a$',
      context: { text: GUIDE.crossWrong.right, note: GUIDE.crossWrong.why },
      reveals: ['ikhtiyar'],
    },
    {
      id: 'ikhtiyar', kind: 'method', lane: 'center', requires: 'ikhtiyar', notebook: true,
      title: 'أختار الطريق', subtitle: 'أنظر إلى الأعداد أوّلًا',
      context: { text: METHOD.choose.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'ikhtiyar',
      title: 'الخلاصة', subtitle: 'رابع واحد وطرق كثيرة',
      context: { text: KNOWLEDGE.fourth.text, note: GUIDE.unique },
      reveals: [],
    },
  ],
  edges: [
    { from: 'rabi', to: 'jidaan', label: 'جداءان' },
    { from: 'jidaan', to: 'khata-farq', label: 'خطأ شائع' },
    { from: 'jidaan', to: 'turuq', label: 'طرق' },
    { from: 'turuq', to: 'hisab-jidaan', label: 'نحسب' },
    { from: 'hisab-jidaan', to: 'ikhtiyar', label: 'نختار' },
    { from: 'ikhtiyar', to: 'khulasa', label: 'نستخلص' },
  ],
};
