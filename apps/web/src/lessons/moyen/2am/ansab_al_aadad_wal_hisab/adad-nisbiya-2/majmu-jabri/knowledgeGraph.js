/**
 * La carte PROGRESSIVE du درس « حساب مجموع جبري » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js : معارف, طريقة, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                                   [مجموع جبري]                                      مفهوم
 *             طرح → جمع ┌───────────────┼───────────────┐ متعاكسان
 *        [الطرح جمع] (M1)        [تجميع الحدود] (M1)       [المتعاكسان] (M1)
 *       خطأ شائع │                      │ ثم                     │ ثم
 *     ⛔ [لا استدارة؟]       [نقل وتجميع] (M2) → [الكتابة المبسّطة] (M2) → [أحسب] (M3) → [الأقواس] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'majmu',
  nodes: [
    {
      id: 'majmu', kind: 'concept', lane: 'center', requires: 'tajmi-hudud', notebook: true,
      title: 'تجميع الموجبة والسالبة', subtitle: '$(+12)+(-9)=(+3)$',
      context: { text: KNOWLEDGE.move.text, note: KNOWLEDGE.move.example },
      reveals: ['tarh', 'mutaakisan'],
    },
    {
      id: 'tarh', kind: 'relationship', lane: 'start', requires: 'tarh-ila-jam', notebook: true,
      title: 'الطرح هو جمع المعاكس', subtitle: '$(-8)-(+3)=(-8)+(-3)$',
      context: { text: KNOWLEDGE.definition.text },
      reveals: ['khata-turn'],
    },
    {
      // ⛔ خطأ شائع — l'enfant précédé de « − » qui ne se retourne pas (أتمرّن, banque).
      id: 'khata-turn', kind: 'common_mistake', lane: 'start', requires: 'tarh-ila-jam',
      title: 'نُبقي العدد كما هو؟', subtitle: '$-11$ أم $-5$ ؟',
      context: { parts: [{ role: 'wrong', text: GUIDE.noTurn.wrong }, { role: 'why', text: GUIDE.noTurn.why }, { role: 'right', text: GUIDE.noTurn.right }] },
      reveals: [],
    },
    {
      id: 'mutaakisan', kind: 'relationship', lane: 'end', requires: 'hadhf-mutaakisayn', notebook: true,
      title: 'المتعاكسان يتعادلان', subtitle: '$(+5)+(-5)=0$',
      context: { text: KNOWLEDGE.move.text },
      reveals: ['qaida'],
    },
    {
      id: 'qaida', kind: 'term', lane: 'center', requires: 'qaidat-majmu-jabri', notebook: true,
      title: 'قاعدة المجموع الجبري', subtitle: '$P+N$',
      context: { text: KNOWLEDGE.move.text, note: KNOWLEDGE.move.example },
      reveals: ['taarif'],
    },
    {
      id: 'taarif', kind: 'term', lane: 'center', requires: 'taarif-majmu-jabri', notebook: true,
      title: 'المجموع الجبري', subtitle: '$A=a-b+c-d$',
      context: { text: KNOWLEDGE.definition.text },
      reveals: ['naql'],
    },
    {
      id: 'naql', kind: 'term', lane: 'center', requires: 'naql-tajmi', notebook: true,
      title: 'نقل الحدود وتجميعها', subtitle: '$a+b+c=a+c+b$',
      context: { text: KNOWLEDGE.move.text, note: KNOWLEDGE.move.example },
      reveals: ['mubassata'],
    },
    {
      id: 'mubassata', kind: 'term', lane: 'center', requires: 'kitaba-mubassata', notebook: true,
      title: 'الكتابة المبسّطة', subtitle: '$7-9-4-2$',
      context: { text: KNOWLEDGE.simplified.text, note: KNOWLEDGE.simplified.example },
      reveals: ['tariqa-jam'],
    },
    {
      id: 'tariqa-jam', kind: 'method', lane: 'center', requires: 'tariqat-majmu-jabri', notebook: true,
      title: 'أحسب مجموعًا جبريًا', subtitle: 'أحوّل ثم أجمّع',
      context: { text: METHOD.chain.rule.slice(1).join(' ') },
      reveals: ['tariqa-aqwas'],
    },
    {
      id: 'tariqa-aqwas', kind: 'method', lane: 'center', requires: 'tariqat-aqwas-awwalan', notebook: true,
      title: 'ما بين الأقواس أوّلًا', subtitle: 'ثم أكمل',
      context: { text: METHOD.brackets.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-aqwas-awwalan',
      title: 'الخلاصة', subtitle: '$(+12)-[(-6)-(-2)+(+9)]=(+7)$',
      context: { text: KNOWLEDGE.brackets.text, note: KNOWLEDGE.move.example },
      reveals: [],
    },
  ],
  edges: [
    { from: 'majmu', to: 'tarh', label: 'طرح' },
    { from: 'majmu', to: 'mutaakisan', label: 'متعاكسان' },
    { from: 'tarh', to: 'khata-turn', label: 'خطأ شائع' },
    { from: 'mutaakisan', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'taarif', label: 'ثم' },
    { from: 'taarif', to: 'naql', label: 'ثم' },
    { from: 'naql', to: 'mubassata', label: 'ثم' },
    { from: 'mubassata', to: 'tariqa-jam', label: 'نستعملها' },
    { from: 'tariqa-jam', to: 'tariqa-aqwas', label: 'ثم' },
    { from: 'tariqa-aqwas', to: 'khulasa', label: 'نستخلص' },
  ],
};
