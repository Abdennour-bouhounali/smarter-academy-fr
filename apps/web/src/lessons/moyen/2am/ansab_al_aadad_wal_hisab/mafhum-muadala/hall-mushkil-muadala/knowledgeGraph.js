/**
 * La carte PROGRESSIVE du درس « حلّ مشكل باستعمال معادلة » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                    [ماذا قال الملء]                                   مفهوم
 *               نكتب │
 *        [معادلتان للوضعية نفسها] (M1)
 *               نحلّ │
 *        [القاسم الناقص بالقسمة] ──▶ ⛔ [ضرب العددين]               خطأ شائع
 *               نقلب │
 *        [المقسوم الناقص بالضرب] → [نلغي آخر عملية أوّلًا] (M1)
 *               نسمّي │
 *        [المعادلة وحلّها] → [ثلاثة أشكال] (M2)
 *               نطبّق │
 *        [نترجم المشكل] → [نتحقّق] → [معادلة من خطوتين] (M3)
 *               نستخلص │
 *                    🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'mil',
  nodes: [
    {
      id: 'mil', kind: 'concept', lane: 'center', requires: 'ma-qal-al-mil', notebook: true,
      title: 'ماذا قال الملء', subtitle: '$12\\times x=18$',
      context: { text: GUIDE.fill, note: 'ما الذي يقوله عدد القوارير الممتلئة وما يبقى في الخزّان؟' },
      reveals: ['kitabatan'],
    },
    {
      id: 'kitabatan', kind: 'relationship', lane: 'center', requires: 'muadala-kitabatan', notebook: true,
      title: 'معادلتان للوضعية نفسها', subtitle: '$12\\times x=18$ و $\\frac{18}{x}=12$',
      context: { text: GUIDE.fill },
      reveals: ['qasim'],
    },
    {
      // ⛔ خطأ شائع — multiplier les deux nombres connus au lieu de diviser.
      id: 'khata-mult', kind: 'common_mistake', lane: 'start', requires: 'qasim-naqis',
      title: 'ضرب العددين؟', subtitle: '$30\\times40=1200$',
      context: { parts: [
        { role: 'wrong', text: 'لضرب $30$ في $40$ نجد $1200$ لترًا للقارورة الواحدة.' },
        { role: 'why', text: 'القالب لا يتّسع لأكثر من لترين: الضرب يكبّر ما يجب أن يصغر.' },
        { role: 'right', text: GUIDE.rule },
      ] },
      reveals: [],
    },
    {
      id: 'qasim', kind: 'method', lane: 'end', requires: 'qasim-naqis', notebook: true,
      title: 'القاسم الناقص بالقسمة', subtitle: '$x=a\\div b$',
      context: { text: GUIDE.rule },
      reveals: ['khata-mult', 'maqsum'],
    },
    {
      id: 'maqsum', kind: 'method', lane: 'center', requires: 'maqsum-naqis', notebook: true,
      title: 'المقسوم الناقص بالضرب', subtitle: '$x=24\\times0{,}25$',
      context: { text: GUIDE.dividend },
      reveals: ['akhir'],
    },
    {
      id: 'akhir', kind: 'method', lane: 'center', requires: 'akhir-amaliya', notebook: true,
      title: 'نلغي آخر عملية أوّلًا', subtitle: '$4+x=10$',
      context: { text: GUIDE.twoSteps },
      reveals: ['ta3rif'],
    },
    {
      id: 'ta3rif', kind: 'term', lane: 'center', requires: 'ta3rif-muadala', notebook: true,
      title: 'المعادلة وحلّها', subtitle: '$\\frac{12}{x}=4$ ، $x=3$',
      context: { text: KNOWLEDGE.definition.text, formula: KNOWLEDGE.definition.example },
      reveals: ['ashkal'],
    },
    {
      id: 'ashkal', kind: 'method', lane: 'center', requires: 'thalath-ashkal', notebook: true,
      title: 'ثلاثة أشكال للمعادلة', subtitle: '$a\\times x$ ، $\\frac xa$ ، $\\frac ax$',
      context: { text: KNOWLEDGE.forms.text },
      reveals: ['tarjama'],
    },
    {
      id: 'tarjama', kind: 'method', lane: 'center', requires: 'tarjama-mushkil', notebook: true,
      title: 'نترجم المشكل بمعادلة', subtitle: '$x+150=2x+60$',
      context: { text: METHOD.solution[0] },
      reveals: ['tahaqquq'],
    },
    {
      id: 'tahaqquq', kind: 'example', lane: 'center', requires: 'tahaqquq-hall', notebook: true,
      title: 'نتحقّق من الحلّ', subtitle: '$63\\div14=4{,}5$',
      context: { text: GUIDE.check },
      reveals: ['khatwatan'],
    },
    {
      id: 'khatwatan', kind: 'method', lane: 'center', requires: 'khatwatan-tariqa', notebook: true,
      title: 'معادلة من خطوتين', subtitle: '$2x+240=300$',
      context: { text: KNOWLEDGE.twoSteps.text, formula: KNOWLEDGE.twoSteps.example },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'khatwatan-tariqa',
      title: 'الخلاصة', subtitle: 'نسمّي · نكتب · نعكس · نتحقّق',
      context: { text: METHOD.rule, note: GUIDE.divisor },
      reveals: [],
    },
  ],
  edges: [
    { from: 'mil', to: 'kitabatan', label: 'نكتب' },
    { from: 'kitabatan', to: 'qasim', label: 'نحلّ' },
    { from: 'qasim', to: 'khata-mult', label: 'خطأ شائع' },
    { from: 'qasim', to: 'maqsum', label: 'نقلب' },
    { from: 'maqsum', to: 'akhir', label: 'نزيد' },
    { from: 'akhir', to: 'ta3rif', label: 'نسمّي' },
    { from: 'ta3rif', to: 'ashkal', label: 'ونعمّم' },
    { from: 'ashkal', to: 'tarjama', label: 'نطبّق' },
    { from: 'tarjama', to: 'tahaqquq', label: 'نتحقّق' },
    { from: 'tahaqquq', to: 'khatwatan', label: 'ونتقدّم' },
    { from: 'khatwatan', to: 'khulasa', label: 'نستخلص' },
  ],
};
