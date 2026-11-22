/**
 * La carte PROGRESSIVE du درس « المساويات والعمليات » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui
 * l'établit (`requires`).
 *
 *   [المساواة والجمع والطرح] (M1)
 *      │ الجمع والطرح                 │ ثم
 *   [العملية على الطرفين] (M1)    [الضرب والقسمة] (M2)
 *      │ خطأ شائع                     │ خطأ شائع            │ استثناء
 *   ⛔ [طرف واحد؟]              ⛔ [حدّ منسيّ؟]         [الصفر] (M2) ── نستعملها ──▶ [أحوّل مساواة] (M3) → [الضرب يشمل كل الحدود] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'musawat',
  nodes: [
    {
      id: 'musawat', kind: 'concept', lane: 'center', requires: 'musawat-jam', notebook: true,
      title: 'المساواة والجمع والطرح', subtitle: '$a = b \\Rightarrow a + c = b + c$',
      context: { text: KNOWLEDGE.add.text, note: KNOWLEDGE.add.example },
      reveals: ['tarafayn', 'darb'],
    },
    {
      id: 'tarafayn', kind: 'relationship', lane: 'start', requires: 'tarafayn', notebook: true,
      title: 'العملية على الطرفين', subtitle: '$a + c = b + c$',
      context: { text: KNOWLEDGE.both.text, formula: GUIDE.together },
      reveals: ['khata-tarafayn'],
    },
    {
      // ⛔ خطأ شائع — l'opération faite d'un seul côté (lab : « الأيسر وحده », أتمرّن ex-5).
      id: 'khata-tarafayn', kind: 'common_mistake', lane: 'start', requires: 'tarafayn',
      title: 'نضيف إلى طرف واحد؟', subtitle: '$10 = 4x - 2$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.oneSide.wrong },
          { role: 'why', text: GUIDE.oneSide.why },
          { role: 'right', text: GUIDE.oneSide.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'darb', kind: 'relationship', lane: 'end', requires: 'musawat-darb', notebook: true,
      title: 'المساواة والضرب والقسمة', subtitle: '$a = b \\Rightarrow ac = bc$',
      context: { text: KNOWLEDGE.times.text, note: KNOWLEDGE.times.example },
      reveals: ['khata-hadd', 'sifr'],
    },
    {
      id: 'khata-hadd', kind: 'common_mistake', lane: 'end', requires: 'musawat-darb',
      title: 'نضرب حدًّا واحدًا؟', subtitle: '$-3(2x - 5)$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.allTerms.wrong },
          { role: 'why', text: GUIDE.allTerms.why },
          { role: 'right', text: GUIDE.allTerms.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sifr', kind: 'term', lane: 'center', requires: 'sifr', notebook: true,
      title: 'الصفر', subtitle: '$0 = 0$',
      context: { text: KNOWLEDGE.zero.text },
      reveals: ['tahwil'],
    },
    {
      id: 'tahwil', kind: 'method', lane: 'center', requires: 'tahwil', notebook: true,
      title: 'أحوّل مساواة معطاة', subtitle: '$5 = 3x - 1 \\Rightarrow 4 = 3x - 2$',
      context: { text: METHOD.transform.rule },
      reveals: ['hukm'],
    },
    {
      id: 'hukm', kind: 'relationship', lane: 'center', requires: 'hukm', notebook: true,
      title: 'الضرب يشمل كل الحدود', subtitle: '$2(2x + 3) = 4x + 6$',
      context: { text: METHOD.scale.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'hukm',
      title: 'الخلاصة', subtitle: '$a = b \\Rightarrow a \\pm c = b \\pm c$',
      context: { text: GUIDE.together, note: GUIDE.scale },
      reveals: [],
    },
  ],
  edges: [
    { from: 'musawat', to: 'tarafayn', label: 'الجمع والطرح' },
    { from: 'tarafayn', to: 'khata-tarafayn', label: 'خطأ شائع' },
    { from: 'musawat', to: 'darb', label: 'ثم' },
    { from: 'darb', to: 'khata-hadd', label: 'خطأ شائع' },
    { from: 'darb', to: 'sifr', label: 'استثناء' },
    { from: 'sifr', to: 'tahwil', label: 'نستعملها' },
    { from: 'tahwil', to: 'hukm', label: 'انتبه' },
    { from: 'hukm', to: 'khulasa', label: 'نستخلص' },

  ],
};
