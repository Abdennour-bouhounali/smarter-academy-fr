/**
 * La carte PROGRESSIVE du درس « الكسور العشرية والكتابة العشرية » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_*`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                       [ورشة الزليج] (M1)                          مفهوم
 *                  نسمّي ┌─────┴─────┐ نكتب
 *        [الكسر العشري] (M1)        [الأرقام بعد الفاصلة] (M1)
 *       خطأ شائع │                    ⛔ [المقام يبقى 10؟]
 *  ⛔ [الصفر لا لزوم له؟]               │ ثم
 *                              [المفكوك النموذجي] (M2)
 *                                       │ وأيضًا
 *                              [الأصفار غير الضرورية] (M2)
 *                                       │ بطريقة
 *                              [من الفاصلة إلى الكسر] (M3)
 *                                       │ والفاصلة تنزلق
 *                              [إزاحة الفاصلة] (M4) ── خطأ شائع ── ⛔ [نضيف صفرًا؟]
 *                                       │ نستخلص
 *                                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_CONVERT, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'warsha',
  nodes: [
    {
      id: 'warsha', kind: 'concept', lane: 'center', requires: 'fasila-hajm', notebook: true,
      title: 'ورشة الزليج', subtitle: '2 ، 3 ، 5 وفاصلة تتحرّك',
      context: { text: 'الأرقام 2 و 3 و 5 تصنع 235 لوحة، أو 23,5، أو 2,35، أو 0,235 حسب موضع الفاصلة.', note: 'كل خطوة للفاصلة نحو اليمين تجعل القطعة التي يعدّها الرقم أصغر بعشر مرّات.' },
      reveals: ['kasr', 'kitaba'],
    },
    {
      id: 'kasr', kind: 'concept', lane: 'start', requires: 'kasr-ashri', notebook: true,
      title: 'الكسر العشري', subtitle: '$\\frac{1}{10}$ ، $\\frac{1}{100}$ ، $\\frac{1}{1000}$',
      context: { text: KNOWLEDGE.decimalFraction.definition, note: KNOWLEDGE.decimalFraction.equal },
      reveals: ['khataZero'],
    },
    {
      // ⛔ خطأ شائع — le zéro de 0,05 jugé inutile (`GUIDE.zeroPlace`).
      id: 'khataZero', kind: 'common_mistake', lane: 'start', requires: 'kasr-ashri',
      title: 'الصفر لا لزوم له؟', subtitle: '$0{,}05\\neq0{,}5$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.zeroPlace.wrong },
          { role: 'why', text: GUIDE.zeroPlace.why },
          { role: 'right', text: GUIDE.zeroPlace.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'kitaba', kind: 'relationship', lane: 'end', requires: 'kitaba-bifasila', notebook: true,
      title: 'الأرقام وأصفار المقام', subtitle: '$2{,}35=\\frac{235}{100}$',
      context: { text: KNOWLEDGE.comma.definition, note: KNOWLEDGE.comma.rule },
      reveals: ['khataDen', 'mafkuk'],
    },
    {
      // ⛔ خطأ شائع — le dénominateur qui ne suit pas le nombre de chiffres (`GUIDE.denDigits`).
      id: 'khataDen', kind: 'common_mistake', lane: 'end', requires: 'kitaba-bifasila',
      title: 'المقام يبقى 10؟', subtitle: '$31{,}25\\neq\\frac{3125}{10}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.denDigits.wrong },
          { role: 'why', text: GUIDE.denDigits.why },
          { role: 'right', text: GUIDE.denDigits.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'mafkuk', kind: 'concept', lane: 'center', requires: 'mafkuk-ashri', notebook: true,
      title: 'المفكوك النموذجي', subtitle: '$2{,}35=2+\\frac{3}{10}+\\frac{5}{100}$',
      context: { text: KNOWLEDGE.expansion.definition, note: KNOWLEDGE.count.text },
      reveals: ['aashar'],
    },
    {
      id: 'aashar', kind: 'concept', lane: 'start', requires: 'adad-al-aashar', notebook: true,
      title: 'رقم الأعشار وعددها', subtitle: '$2{,}35$ : 3 و 23',
      context: { text: KNOWLEDGE.count.text },
      reveals: ['asfar'],
    },
    {
      id: 'asfar', kind: 'relationship', lane: 'center', requires: 'asfar-ghayr-darurya', notebook: true,
      title: 'الأصفار غير الضرورية', subtitle: '$3{,}40=3{,}4$',
      context: { text: KNOWLEDGE.zeros.trailing, note: 'الصفر الذي يحفظ مرتبة فارغة يبقى.' },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-intiqal', notebook: true,
      title: 'من الفاصلة إلى الكسر وبالعكس', subtitle: '$31{,}25$ ⇄ $\\frac{3125}{100}$',
      context: { text: METHOD_CONVERT.exercise, note: METHOD_CONVERT.rule },
      reveals: ['azaha'],
    },
    {
      id: 'azaha', kind: 'concept', lane: 'center', requires: 'azaha-fasila', notebook: true,
      title: 'إزاحة الفاصلة', subtitle: '× ÷ 10 ، 100 ، 1000',
      context: { text: KNOWLEDGE.shift.rule, note: KNOWLEDGE.shift.byTenth },
      reveals: ['darb', 'khataAddZero'],
    },
    {
      id: 'darb', kind: 'relationship', lane: 'start', requires: 'darb-juz-ashar', notebook: true,
      title: 'الضرب في 0,1', subtitle: '$27{,}5\\times0{,}1=2{,}75$',
      context: { text: KNOWLEDGE.shift.byTenth },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — « ×10 يضيف صفرًا » (`GUIDE.addZero`).
      id: 'khataAddZero', kind: 'common_mistake', lane: 'end', requires: 'azaha-fasila',
      title: 'نضيف صفرًا؟', subtitle: '$3{,}5\\times10=35$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.addZero.wrong },
          { role: 'why', text: GUIDE.addZero.why },
          { role: 'right', text: GUIDE.addZero.right },
        ],
      },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'azaha-fasila',
      title: 'الخلاصة', subtitle: 'القطعة ، الفاصلة ، الأصفار',
      context: { text: 'الفاصلة تقول أيّ قطعة يعدّها كل رقم؛ عدد الأرقام بعدها هو عدد أصفار المقام؛ وتحريكها مرتبة يضرب في 10 أو يقسم عليه.', note: KNOWLEDGE.shift.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'warsha', to: 'kasr', label: 'نسمّي' },
    { from: 'warsha', to: 'kitaba', label: 'نكتب' },
    { from: 'kasr', to: 'khataZero', label: 'خطأ شائع' },
    { from: 'kitaba', to: 'khataDen', label: 'خطأ شائع' },
    { from: 'kitaba', to: 'mafkuk', label: 'ثم' },
    { from: 'mafkuk', to: 'aashar', label: 'ونعدّ' },
    { from: 'aashar', to: 'asfar', label: 'وأيضًا' },
    { from: 'asfar', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'azaha', label: 'والفاصلة تنزلق' },
    { from: 'azaha', to: 'darb', label: 'ومنه' },
    { from: 'azaha', to: 'khataAddZero', label: 'خطأ شائع' },
    { from: 'khataAddZero', to: 'khulasa', label: 'نستخلص' },
  ],
};
