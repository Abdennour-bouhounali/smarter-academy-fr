/**
 * La carte PROGRESSIVE du درس « مقارنة وترتيب أعداد نسبية » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique
 * n'est écrite ici : chaque texte vient de la leçon (content/textbook.js : propriétés, طريقة, `GUIDE`). Chaque nœud est gardé par l'item
 * de knowledge.jsx qui l'établit (`requires`).
 *
 *                              [المقارنة]                                    مفهوم
 *           سالبان ┌──────────────┼──────────────┐ مختلفان
 *        [سالبان] (M1)       [موجبان] (M1)      [إشارتان مختلفتان] (M1)
 *     خطأ شائع │                                       │
 *   ⛔ [−8 > −3؟]                                      ثم │
 *                                                    نستعمله في │
 *                                                 [أقارن وأرتّب] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'muqarana',
  nodes: [
    {
      id: 'muqarana', kind: 'concept', lane: 'center', requires: 'salibayn',
      title: 'مقارنة عددين نسبيين', subtitle: 'الإشارة أوّلًا ثم المسافة إلى الصفر',
      context: { text: KNOWLEDGE.negatives.text },
      reveals: ['salibayn', 'mujabayn', 'mukhtalif'],
    },
    {
      id: 'salibayn', kind: 'relationship', lane: 'start', requires: 'salibayn', notebook: true,
      title: 'عددان سالبان', subtitle: '$-5 < -3$',
      context: { text: KNOWLEDGE.negatives.text },
      reveals: ['khata-bida'],
    },
    {
      // ⛔ خطأ شائع — l'éloignement pris pour de la grandeur (أتمرّن ex-13 « −1,6 … −2 », banque).
      id: 'khata-bida', kind: 'common_mistake', lane: 'start', requires: 'salibayn',
      title: '−8 أكبر من −3؟', subtitle: '$-8 < -3$',
      context: { parts: [{ role: 'wrong', text: GUIDE.farIsBig.wrong }, { role: 'why', text: GUIDE.farIsBig.why }, { role: 'right', text: GUIDE.farIsBig.right }] },
      reveals: [],
    },
    {
      id: 'mujabayn', kind: 'relationship', lane: 'end', requires: 'mujabayn', notebook: true,
      title: 'عددان موجبان', subtitle: '$2{,}5 < 4$',
      context: { text: KNOWLEDGE.positives.text },
      reveals: [],
    },
    {
      id: 'mukhtalif', kind: 'relationship', lane: 'center', requires: 'mukhtalifayn', notebook: true,
      title: 'إشارتان مختلفتان', subtitle: '$-0{,}3 < 0 < 0{,}2$',
      context: { text: KNOWLEDGE.different.text, note: GUIDE.different },
      reveals: ['tartib'],
    },
    {
      id: 'tartib', kind: 'term', lane: 'center', requires: 'tartib', notebook: true,
      title: 'الترتيب تصاعديًا وتنازليًا', subtitle: '$<$ و $>$',
      context: { text: KNOWLEDGE.order.text, note: KNOWLEDGE.order.example },
      reveals: ['hasr'],
    },
    {
      id: 'hasr', kind: 'relationship', lane: 'end', requires: 'hasr', notebook: true,
      title: 'عدد بين عددين', subtitle: '$-4{,}5 < -4{,}4 < -4{,}3$',
      context: { text: KNOWLEDGE.between.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa', notebook: true,
      title: 'أقارن وأرتّب', subtitle: 'الإشارة ثم المسافة',
      context: { text: METHOD.order.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa',
      title: 'الخلاصة', subtitle: '$-6 < -2{,}5 < 0 < 1{,}8$',
      context: { text: KNOWLEDGE.order.text, note: GUIDE.zero },
      reveals: [],
    },
  ],
  edges: [
    { from: 'muqarana', to: 'salibayn', label: 'سالبان' },
    { from: 'muqarana', to: 'mujabayn', label: 'موجبان' },
    { from: 'muqarana', to: 'mukhtalif', label: 'مختلفان' },
    { from: 'salibayn', to: 'khata-bida', label: 'خطأ شائع' },
    { from: 'mukhtalif', to: 'tartib', label: 'ثم' },
    { from: 'tartib', to: 'hasr', label: 'ثم' },
    { from: 'hasr', to: 'tariqa', label: 'نستعملها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
