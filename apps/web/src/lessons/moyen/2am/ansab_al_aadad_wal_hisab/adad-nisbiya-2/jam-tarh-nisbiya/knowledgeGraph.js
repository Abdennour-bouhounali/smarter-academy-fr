/**
 * La carte PROGRESSIVE du درس « جمع وطرح عددين نسبيين » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js : معارف, طريقة, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                                  [الجمع]                                        مفهوم
 *             نفس الإشارة ┌───────────────┼───────────────┐ متعاكسان
 *        [نفس الإشارة] (M1)   [إشارتان مختلفتان] (M1)   [المتعاكسان] (M1)
 *       خطأ شائع │                   │ ثم                  │ ثم
 *     ⛔ [مجموع سالبين موجب؟]    [قاعدة الجمع] (M2) → [الطرح] (M1) → [قاعدة الطرح] (M2) → [أكتب الحساب] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jam-asl',
  nodes: [
    {
      id: 'jam-asl', kind: 'concept', lane: 'center', requires: 'jam-nafs-ishara',
      title: 'جمع عددين نسبيين', subtitle: '$(-3)+(-5)=(-8)$',
      context: { text: KNOWLEDGE.same.text },
      reveals: ['nafs', 'mukhtalifa', 'mutaakisan'],
    },
    {
      id: 'nafs', kind: 'relationship', lane: 'start', requires: 'jam-nafs-ishara', notebook: true,
      title: 'الإشارة نفسها', subtitle: '$(-4)+(-7)=(-11)$',
      context: { text: KNOWLEDGE.same.text },
      reveals: ['khata-sign'],
    },
    {
      // ⛔ خطأ شائع — la somme de deux négatifs prise positive (أتمرّن, banque).
      id: 'khata-sign', kind: 'common_mistake', lane: 'start', requires: 'jam-nafs-ishara',
      title: 'مجموع سالبين موجب؟', subtitle: '$(-3)+(-5)=(-8)$',
      context: { parts: [{ role: 'wrong', text: GUIDE.signLost.wrong }, { role: 'why', text: GUIDE.signLost.why }, { role: 'right', text: GUIDE.signLost.right }] },
      reveals: [],
    },
    {
      id: 'mukhtalifa', kind: 'relationship', lane: 'end', requires: 'jam-ishara-mukhtalifa', notebook: true,
      title: 'إشارتان مختلفتان', subtitle: '$(-9)+(+5)=(-4)$',
      context: { text: KNOWLEDGE.different.text },
      reveals: ['khata-dist'],
    },
    {
      id: 'khata-dist', kind: 'common_mistake', lane: 'end', requires: 'jam-ishara-mukhtalifa',
      title: 'نجمع المسافتين دائمًا؟', subtitle: '$-14$ أم $-4$ ؟',
      context: { parts: [{ role: 'wrong', text: GUIDE.addDist.wrong }, { role: 'why', text: GUIDE.addDist.why }, { role: 'right', text: GUIDE.addDist.right }] },
      reveals: [],
    },
    {
      id: 'mutaakisan', kind: 'relationship', lane: 'center', requires: 'mutaakisan-sifr', notebook: true,
      title: 'المتعاكسان', subtitle: '$(-6)+(+6)=0$',
      context: { text: KNOWLEDGE.opposites.text },
      reveals: ['tarh', 'qaida-jam'],
    },
    {
      id: 'tarh', kind: 'relationship', lane: 'end', requires: 'tarh-bi-muakis', notebook: true,
      title: 'الطرح هو جمع المعاكس', subtitle: '$(+5)-(-7)=(+12)$',
      context: { text: KNOWLEDGE.subtract.text, note: KNOWLEDGE.subtract.example },
      reveals: ['khata-flip'],
    },
    {
      id: 'khata-flip', kind: 'common_mistake', lane: 'end', requires: 'tarh-bi-muakis',
      title: 'نطرح كما نجمع؟', subtitle: '$-10$ أم $-4$ ؟',
      context: { parts: [{ role: 'wrong', text: GUIDE.subNoFlip.wrong }, { role: 'why', text: GUIDE.subNoFlip.why }, { role: 'right', text: GUIDE.subNoFlip.right }] },
      reveals: [],
    },
    {
      id: 'qaida-jam', kind: 'term', lane: 'center', requires: 'qaidat-jam', notebook: true,
      title: 'قاعدتا الجمع', subtitle: '$a+b$',
      context: { text: KNOWLEDGE.same.text, note: KNOWLEDGE.different.text },
      reveals: ['qaida-tarh'],
    },
    {
      id: 'qaida-tarh', kind: 'term', lane: 'center', requires: 'qaidat-tarh', notebook: true,
      title: 'قاعدة الطرح', subtitle: '$a-b=a+(-b)$',
      context: { text: KNOWLEDGE.subtract.text, note: KNOWLEDGE.subtract.example },
      reveals: ['majmu-farq'],
    },
    {
      id: 'majmu-farq', kind: 'term', lane: 'center', requires: 'majmu-wa-farq', notebook: true,
      title: 'المجموع والفرق', subtitle: '$a+b\\ ,\\ a-b$',
      context: { text: KNOWLEDGE.names.text },
      reveals: ['tariqa-jam'],
    },
    {
      id: 'tariqa-jam', kind: 'method', lane: 'center', requires: 'tariqat-jam', notebook: true,
      title: 'أكتب حساب مجموع', subtitle: 'أميّز الحالتين',
      context: { text: METHOD.sum.rule.slice(1).join(' ') },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-tarh', notebook: true,
      title: 'أكتب حساب فرق', subtitle: 'جمع المعاكس ثم القاعدة',
      context: { text: METHOD.diff.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-tarh',
      title: 'الخلاصة', subtitle: '$(+5)-(-7)=(+12)$',
      context: { text: KNOWLEDGE.subtract.text, note: KNOWLEDGE.subtract.example },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jam-asl', to: 'nafs', label: 'نفس الإشارة' },
    { from: 'jam-asl', to: 'mukhtalifa', label: 'إشارتان' },
    { from: 'jam-asl', to: 'mutaakisan', label: 'متعاكسان' },
    { from: 'nafs', to: 'khata-sign', label: 'خطأ شائع' },
    { from: 'mukhtalifa', to: 'khata-dist', label: 'خطأ شائع' },
    { from: 'mutaakisan', to: 'tarh', label: 'طرح' },
    { from: 'mutaakisan', to: 'qaida-jam', label: 'نسمّي' },
        { from: 'tarh', to: 'khata-flip', label: 'خطأ شائع' },
    { from: 'qaida-jam', to: 'qaida-tarh', label: 'ثم' },
    { from: 'qaida-tarh', to: 'majmu-farq', label: 'ثم' },
    { from: 'majmu-farq', to: 'tariqa-jam', label: 'نستعملها' },
    { from: 'tariqa-jam', to: 'tariqa', label: 'ثم' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
