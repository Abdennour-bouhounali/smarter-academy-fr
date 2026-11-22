/**
 * La carte PROGRESSIVE du درس « المسافة بين نقطتين على مستقيم مدرّج » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js : معارف, طريقة, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                              [المسافة بين نقطتين]                            مفهوم
 *            عبر الصفر ┌───────────────┴───────────────┐ جهة واحدة
 *          [المسافة عبر الصفر]                  [جهة واحدة من الصفر]
 *     خطأ شائع │                                  │ ثم        │ خطأ شائع
 *   ⛔ [نطرح الجزأين]            [الكبرى ناقص الصغرى] → [نقطتان] → [موجبة] → [الكبرى والصغرى] → [الطريقة] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'masafa-node',
  nodes: [
    {
      id: 'masafa-node', kind: 'concept', lane: 'center', requires: 'masafa-abr-sifr',
      title: 'المسافة بين نقطتين', subtitle: '$AB$',
      context: { text: KNOWLEDGE.rule.text },
      reveals: ['abr', 'nafs'],
    },
    {
      id: 'abr', kind: 'relationship', lane: 'start', requires: 'masafa-abr-sifr', notebook: true,
      title: 'المسافة عبر الصفر', subtitle: '$4+9=13$',
      context: { text: GUIDE.subDist.why, note: GUIDE.subDist.right },
      reveals: ['khata-abr'],
    },
    {
      // ⛔ خطأ شائع — la distance à travers zéro n'est pas une différence de distances à zéro.
      id: 'khata-abr', kind: 'common_mistake', lane: 'start', requires: 'masafa-abr-sifr',
      title: 'نطرح الجزأين عبر الصفر', subtitle: '$9-4=5$',
      context: { parts: [{ role: 'wrong', text: GUIDE.subDist.wrong }, { role: 'why', text: GUIDE.subDist.why }, { role: 'right', text: GUIDE.subDist.right }] },
      reveals: [],
    },
    {
      id: 'nafs', kind: 'relationship', lane: 'end', requires: 'masafa-nafs-jiha', notebook: true,
      title: 'المسافة في جهة واحدة', subtitle: '$7-2=5$',
      context: { text: GUIDE.addSame.why, note: GUIDE.addSame.right },
      reveals: ['khata-nafs', 'qaida'],
    },
    {
      // ⛔ خطأ شائع — deux nombres du même côté ne s'additionnent pas.
      id: 'khata-nafs', kind: 'common_mistake', lane: 'end', requires: 'masafa-nafs-jiha',
      title: 'نجمع بُعدين في جهة واحدة', subtitle: '$7+2=9$',
      context: { parts: [{ role: 'wrong', text: GUIDE.addSame.wrong }, { role: 'why', text: GUIDE.addSame.why }, { role: 'right', text: GUIDE.addSame.right }] },
      reveals: [],
    },
    {
      id: 'qaida', kind: 'relationship', lane: 'center', requires: 'qaidat-masafa', notebook: true,
      title: 'الفاصلة الكبرى ناقص الصغرى', subtitle: '$x_B-x_A$',
      context: { text: KNOWLEDGE.rule.text, note: GUIDE.negative },
      reveals: ['nuqtatan-node'],
    },
    {
      id: 'nuqtatan-node', kind: 'relationship', lane: 'center', requires: 'nuqtatan', notebook: true,
      title: 'نقطتان على بعد معلوم', subtitle: '$a-d\\ ,\\ a+d$',
      context: { text: KNOWLEDGE.atDistance.text },
      reveals: ['mujaba'],
    },
    {
      id: 'mujaba', kind: 'relationship', lane: 'center', requires: 'masafa-mujaba', notebook: true,
      title: 'المسافة موجبة و AB = BA', subtitle: '$AB=BA>0$',
      context: { text: KNOWLEDGE.positive.text },
      reveals: ['taarif'],
    },
    {
      id: 'taarif', kind: 'term', lane: 'center', requires: 'taarif-masafa', notebook: true,
      title: 'الفاصلة الكبرى والصغرى', subtitle: '$x_{\\max}-x_{\\min}$',
      context: { text: KNOWLEDGE.rule.text, note: KNOWLEDGE.rule.example },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-masafa', notebook: true,
      title: 'أحسب مسافة وأجد نقطتين', subtitle: 'الكبرى ناقص الصغرى',
      context: { text: METHOD.distance.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-masafa',
      title: 'الخلاصة', subtitle: '$AB=x_{\\max}-x_{\\min}$',
      context: { text: KNOWLEDGE.rule.text, note: KNOWLEDGE.positive.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'masafa-node', to: 'abr', label: 'عبر الصفر' },
    { from: 'masafa-node', to: 'nafs', label: 'جهة واحدة' },
    { from: 'abr', to: 'khata-abr', label: 'خطأ شائع' },
    { from: 'nafs', to: 'khata-nafs', label: 'خطأ شائع' },
    { from: 'nafs', to: 'qaida', label: 'نستخلص' },
    { from: 'qaida', to: 'nuqtatan-node', label: 'ثم' },
    { from: 'nuqtatan-node', to: 'mujaba', label: 'ثم' },
    { from: 'mujaba', to: 'taarif', label: 'نسمّي' },
    { from: 'taarif', to: 'tariqa', label: 'نستعملها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
