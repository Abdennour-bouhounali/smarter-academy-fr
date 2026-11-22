/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des cinq leçons de l'unité 2 (مقلوب وقسمة كسرين، تساوي ومقارنة،
 * جمع وطرح، العدد الناطق، العمليات على الأعداد الناطقة), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). L'intégration du manuel
 * (le bassin 9/2 × 2 × 3/2 m, 1/3 puis 3/7 du reste) est REDESSINÉE en situation 1 (un bassin de club 5 × 3 × 3/2 m, 1/3 puis 3/8 du reste ; le « stock de briques » du manuel
 * est abandonné : son volume de briques est ambigu) ; la « وضعية للتقويم » en situation 2 (2/5 puis 1/2 du reste, 1800 DA) ; le registre de `deep-70` inspire la situation 4. Les
 * situations 3, 5 et 6 sont de la plateforme. Aucune notion nouvelle ; ni pourcentage, ni équation (un TOUT inconnu se trouve par UNE division par une fraction), ni Thalès, ni puissance.
 * Une réponse fractionnaire se CHOISIT (le GuidedProblem saisit des nombres décimaux) ; chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('integration', 36, 'أدمج تعلّماتي');
const S2 = src('evaluation', 36, 'وضعية للتقويم');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — تبليط حوض النادي',
    context: 'مساحة الأوجه وكسر الباقي يومًا بعد يوم',
    emoji: '🏊',
    source: S1,
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'حوض النادي', icon: 'tile', lines: [{ label: 'الطول', value: 5, unit: 'm' }, { label: 'العرض', value: 3, unit: 'm' }, { label: 'العمق', value: '3/2', unit: 'm' }] },
      { title: 'عمل التبليط', icon: 'tile', lines: [{ label: 'اليوم الأول', value: '1/3 من الكلّ' }, { label: 'اليوم الثاني', value: '3/8 من الباقي' }] },
    ], ariaLabel: 'بطاقتان: أبعاد حوض النادي الطول 5 أمتار والعرض 3 أمتار والعمق ثلاثة أنصاف المتر، ونصيب كل يوم من التبليط' },
    statement: 'حوض سباحة صغير للنادي على شكل متوازي مستطيلات بلا غطاء: طوله $5\\,\\text{m}$ وعرضه $3\\,\\text{m}$ وعمقه $\\frac{3}{2}\\,\\text{m}$ . بلّط العمّال في اليوم الأول $\\frac{1}{3}$ من القاع والجدران الأربعة، وفي اليوم الثاني $\\frac{3}{8}$ مما بقي، وأنهوا العمل في اليوم الثالث.',
    data: [
      { id: 'dims', text: 'الأبعاد: 5 m و 3 m و 3/2 m', useful: true },
      { id: 'd1', text: 'اليوم الأول: 1/3 من القاع والجدران', useful: true },
      { id: 'd2', text: 'اليوم الثاني: 3/8 مما بقي', useful: true },
      { id: 'd3', text: 'اليوم الثالث: ما بقي', useful: true },
      { id: 'club', text: 'الحوض في نادي الحيّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة ما يُبلَّط',
        question: 'ما مساحة القاع والجدران الأربعة التي يجب تبليطها؟',
        asks: ['المساحة الكلّية للتبليط'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['jida-kasrayn-2am'], prompt: 'مساحة القاع: $5 \\times 3 =$', expected: 15, suffix: 'm²', explain: 'جداء الطول في العرض: $15$ .' },
          { kind: 'numeric', role: 'compute', requires: ['jida-kasrayn-2am', 'jam-tarh-kasrayn-3am'], prompt: 'مساحة الجدران الأربعة: $2 \\times 5 \\times \\frac{3}{2} + 2 \\times 3 \\times \\frac{3}{2} =$', expected: 24, suffix: 'm²',
            explain: 'جداران طولهما $5$ : $2 \\times 5 \\times \\frac{3}{2} = 15$ ، وجداران عرضهما $3$ : $2 \\times 3 \\times \\frac{3}{2} = 9$ ، ومجموعهما $24$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-tarh-kasrayn-3am'], prompt: 'المساحة الكلّية: $15 + 24 =$', expected: 39, suffix: 'm²', explain: '$15 + 24 = 39$ .' },
          { kind: 'solution', ask: 0, lines: ['القاع: $5 \\times 3 = 15$ . الجدران: $2 \\times 5 \\times \\frac{3}{2} + 2 \\times 3 \\times \\frac{3}{2} = 15 + 9 = 24$ .', 'المساحة التي تُبلَّط $15 + 24 = 39\\,\\text{m}^2$ .'] },
        ],
      },
      {
        label: '2)', title: 'عمل اليوم الأول',
        question: 'كم متّرًا مربّعًا بُلِّط في اليوم الأول؟',
        asks: ['مساحة اليوم الأول'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: '$\\frac{1}{3} \\times 39 =$', expected: 13, suffix: 'm²', explain: 'ثلث $39$ هو $39 \\div 3 = 13$ .' },
          { kind: 'solution', ask: 0, lines: ['اليوم الأول هو $\\frac{1}{3}$ من $39$ : $\\frac{1}{3} \\times 39 = 13$ .', 'بُلِّط $13\\,\\text{m}^2$ .'] },
        ],
      },
      {
        label: '3)', title: 'عمل اليوم الثاني',
        question: 'ما مساحة ما بُلِّط في اليوم الثاني؟',
        asks: ['مساحة اليوم الثاني'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kasrayn-3am'], prompt: 'المساحة التي بقيت بعد اليوم الأول: $39 - 13 =$', expected: 26, suffix: 'm²', explain: '$39 - 13 = 26$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-kasrayn-2am'], prompt: 'اليوم الثاني هو $\\frac{3}{8}$ مما بقي، أي:',
            options: ['$\\frac{3}{8} \\times 26 = \\frac{39}{4}\\,\\text{m}^2$', '$\\frac{3}{8} \\times 39 = \\frac{117}{8}\\,\\text{m}^2$', '$\\frac{3}{8} \\times 13 = \\frac{39}{8}\\,\\text{m}^2$'], correct: 0, cols: 1,
            explain: 'الكسر $\\frac{3}{8}$ هنا من الباقي $26$ لا من $39$ ولا من $13$ : $\\frac{3 \\times 26}{8} = \\frac{78}{8} = \\frac{39}{4}$ .' },
          { kind: 'solution', ask: 0, lines: ['الباقي $39 - 13 = 26\\,\\text{m}^2$ .', 'اليوم الثاني: $\\frac{3}{8} \\times 26 = \\frac{78}{8} = \\frac{39}{4}\\,\\text{m}^2$ ، أي $9{,}75\\,\\text{m}^2$ .'] },
        ],
      },
      {
        label: '4)', title: 'عمل اليوم الثالث',
        question: 'ما مساحة ما بُلِّط في اليوم الثالث؟',
        asks: ['مساحة اليوم الثالث'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kasrayn-3am'], prompt: 'اليوم الثالث هو ما بقي بعد اليومين:',
            options: ['$26 - \\frac{39}{4} = \\frac{65}{4}\\,\\text{m}^2$', '$39 - \\frac{39}{4} = \\frac{117}{4}\\,\\text{m}^2$', '$26 - \\frac{3}{8} = \\frac{205}{8}\\,\\text{m}^2$'], correct: 0, cols: 1,
            explain: 'بعد اليوم الأول بقيت $26$ ، وبعد اليوم الثاني نطرح $\\frac{39}{4}$ منها: $\\frac{104}{4} - \\frac{39}{4} = \\frac{65}{4}$ . الخطأ الثاني نسي اليوم الأول، والثالث طرح الكسر $\\frac{3}{8}$ لا مساحته.' },
          { kind: 'solution', ask: 0, lines: ['ما بقي بعد اليوم الثاني $26 - \\frac{39}{4} = \\frac{104}{4} - \\frac{39}{4} = \\frac{65}{4}$ .', 'بُلِّط في اليوم الثالث $\\frac{65}{4}\\,\\text{m}^2$ ، أي $16{,}25\\,\\text{m}^2$ .'] },
        ],
      },
      {
        label: '5)', title: 'كسر اليوم الثالث من الحوض',
        question: 'ما الكسر الذي يمثّله عمل اليوم الثالث من التبليط كلّه؟',
        asks: ['كسر اليوم الثالث من الكلّ'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-kasrayn-2am', 'jam-tarh-kasrayn-3am'], prompt: 'بعد اليوم الأول بقي $\\frac{2}{3}$ من الكلّ، وبعد الثاني بقي $\\frac{5}{8}$ من ذلك الباقي. فاليوم الثالث هو:',
            options: ['$\\frac{2}{3} \\times \\frac{5}{8} = \\frac{5}{12}$ من الكلّ', '$\\frac{5}{8}$ من الكلّ', '$1 - \\frac{1}{3} - \\frac{3}{8} = \\frac{7}{24}$ من الكلّ'], correct: 0, cols: 1,
            explain: 'الكسر $\\frac{5}{8}$ كسر من الباقي لا من الكلّ، فنضربه في $\\frac{2}{3}$ : $\\frac{10}{24} = \\frac{5}{12}$ . نتحقّق: $\\frac{65}{4} \\div 39 = \\frac{65}{156} = \\frac{5}{12}$ .' },
          { kind: 'solution', ask: 0, lines: ['بعد اليوم الأول بقي $1 - \\frac{1}{3} = \\frac{2}{3}$ من الكلّ، وبعد الثاني بقي $1 - \\frac{3}{8} = \\frac{5}{8}$ من ذلك الباقي.', 'اليوم الثالث: $\\frac{2}{3} \\times \\frac{5}{8} = \\frac{10}{24} = \\frac{5}{12}$ من الكلّ.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — جائزة الإخوة',
    context: 'اختيار العبارة التي تمثّل حصّة، ثم الكلّ من جزئه',
    emoji: '🏆',
    source: S2,
    tone: 'amber',
    illustration: { kind: 'tags', cards: [
      { title: 'الأخ الأكبر', icon: 'coin', lines: [{ label: 'أخذ', value: '2/5', unit: 'من الجائزة' }] },
      { title: 'الأخ الثاني', icon: 'coin', lines: [{ label: 'أخذ', value: 'نصف الباقي' }] },
      { title: 'الأختان', icon: 'coin', lines: [{ label: 'اقتسمتا', value: 'ما بقي بالتساوي' }] },
    ], ariaLabel: 'ثلاث بطاقات: الأخ الأكبر أخذ خمسين من الجائزة، والأخ الثاني أخذ نصف الباقي، والأختان اقتسمتا ما بقي بالتساوي' },
    statement: 'اقتسم أربعة إخوة جائزة مالية: أخذ الأكبر $\\frac{2}{5}$ منها، وأخذ الثاني نصف الباقي، واقتسمت الأختان ما بقي بالتساوي.',
    data: [
      { id: 'eldest', text: 'الأكبر أخذ 2/5 من الجائزة', useful: true },
      { id: 'second', text: 'الثاني أخذ نصف الباقي', useful: true },
      { id: 'sisters', text: 'الأختان اقتسمتا ما بقي بالتساوي', useful: true },
      { id: 'ages', text: 'الإخوة من أعمار مختلفة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصّة الأخ الثاني',
        question: 'ما الكسر الذي يمثّل حصّة الأخ الثاني من الجائزة؟',
        asks: ['حصّة الأخ الثاني'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['jam-tarh-kasrayn-3am'], prompt: 'الباقي بعد حصّة الأكبر هو:', options: ['$1 - \\frac{2}{5} = \\frac{3}{5}$', '$\\frac{2}{5}$', '$\\frac{1}{2}$'], correct: 0,
            explain: 'الكلّ $1$ ناقص حصّة الأكبر $\\frac{2}{5}$ : $\\frac{5}{5} - \\frac{2}{5} = \\frac{3}{5}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-kasrayn-2am'], prompt: 'حصّة الثاني، وهي نصف هذا الباقي:', options: ['$\\frac{1}{2} \\times \\frac{3}{5} = \\frac{3}{10}$', '$\\frac{1}{2}$', '$\\frac{1}{2} \\times \\frac{2}{5} = \\frac{1}{5}$'], correct: 0,
            explain: 'النصف هنا نصف الباقي $\\frac{3}{5}$ لا نصف الجائزة كلّها ولا نصف حصّة الأكبر.' },
          { kind: 'solution', ask: 0, lines: ['الباقي بعد الأكبر $1 - \\frac{2}{5} = \\frac{3}{5}$ .', 'حصّة الثاني $\\frac{1}{2} \\times \\frac{3}{5} = \\frac{3}{10}$ من الجائزة.'] },
        ],
      },
      {
        label: '2)', title: 'عبارة حصّة الأخت',
        question: 'أيّ العبارات الثلاث تمثّل حصّة أخت واحدة من الجائزة؟',
        asks: ['العبارة الصحيحة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kasrayn-3am', 'jida-kasrayn-2am'], prompt: 'حصّة أخت واحدة هي:',
            options: ['$x = \\left(1 - \\frac{2}{5} - \\frac{1}{2}\\right) \\div 2$', '$y = \\left(1 - \\frac{2}{5} - \\frac{1}{2} \\times \\frac{3}{5}\\right) \\times \\frac{1}{2}$', '$z = \\left(\\frac{3}{5} - \\frac{1}{2}\\right) \\times 2$'], correct: 1, cols: 1,
            explain: 'الباقي للأختين هو $1 - \\frac{2}{5} - \\frac{1}{2} \\times \\frac{3}{5} = \\frac{3}{10}$ ، وحصّة الواحدة نصفه: $\\frac{3}{20}$ . في $x$ طُرح نصف الجائزة كلّها (وهو $\\frac{1}{2}$ من الكلّ لا من الباقي) فخرجت $\\frac{1}{20}$ ، وفي $z$ ضُرب في $2$ بدل أخذ النصف فخرجت $\\frac{1}{5}$ .' },
          { kind: 'solution', ask: 0, lines: ['حصّة الثاني $\\frac{1}{2} \\times \\frac{3}{5}$ ، فما يبقى للأختين $1 - \\frac{2}{5} - \\frac{1}{2} \\times \\frac{3}{5} = \\frac{3}{10}$ .', 'وتأخذ الواحدة نصفه: العبارة $y = \\frac{3}{20}$ .'] },
        ],
      },
      {
        label: '3)', title: 'قيمة الجائزة',
        question: 'إذا كانت حصّتا الأختين معًا $1800$ DA ، فما قيمة الجائزة؟',
        asks: ['قيمة الجائزة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jam-tarh-kasrayn-3am'], prompt: 'الأختان معًا تأخذان من الجائزة:', options: ['$\\frac{3}{10}$', '$\\frac{3}{20}$', '$\\frac{1}{10}$'], correct: 0,
            explain: 'الأختان معًا تأخذان ما بقي: $\\frac{3}{10}$ . و $\\frac{3}{20}$ حصّة واحدة منهما.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqlub-qismat-kasrayn-3am'], prompt: '$1800 \\div \\frac{3}{10} = 1800 \\times \\frac{10}{3} =$', expected: 6000, suffix: 'DA',
            explain: '$1800 \\div 3 = 600$ ثم $600 \\times 10 = 6000$ . نتحقّق: $\\frac{3}{10} \\times 6000 = 1800$ .' },
          { kind: 'solution', ask: 0, lines: ['$1800$ DA هي $\\frac{3}{10}$ من الجائزة، فالجائزة $1800 \\div \\frac{3}{10} = 1800 \\times \\frac{10}{3}$ .', 'قيمة الجائزة $6000$ DA .'] },
        ],
      },
      {
        label: '4)', title: 'حصّتا الأكبر والثاني',
        question: 'ما حصّة الأخ الأكبر وحصّة الأخ الثاني بالدينار؟',
        asks: ['حصّة الأكبر', 'حصّة الثاني'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: 'حصّة الأكبر: $\\frac{2}{5} \\times 6000 =$', expected: 2400, suffix: 'DA', explain: '$6000 \\div 5 = 1200$ ثم $1200 \\times 2 = 2400$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jida-kasrayn-2am'], prompt: 'حصّة الثاني: $\\frac{3}{10} \\times 6000 =$', expected: 1800, suffix: 'DA', explain: '$6000 \\div 10 = 600$ ثم $600 \\times 3 = 1800$ .' },
          { kind: 'solution', ask: 0, lines: ['الأكبر: $\\frac{2}{5} \\times 6000 = 2400$ DA .', 'الثاني: $\\frac{3}{10} \\times 6000 = 1800$ DA ، والأختان $1800$ DA معًا: المجموع $2400 + 1800 + 1800 = 6000$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — جرار العسل',
    context: 'قسمة كمية على سعة كسرية ومقارنة ثمنين للكيلوغرام',
    emoji: '🍯',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'tags', cards: [
      { title: 'الجرّة الصغيرة', icon: 'jar', lines: [{ label: 'سعتها', value: '3/8', unit: 'kg' }, { label: 'ثمنها', value: 900, unit: 'DA' }] },
      { title: 'الجرّة الكبيرة', icon: 'jar', lines: [{ label: 'سعتها', value: '5/8', unit: 'kg' }, { label: 'ثمنها', value: 1450, unit: 'DA' }] },
    ], ariaLabel: 'بطاقتان: الجرّة الصغيرة سعتها ثلاثة أثمان الكيلوغرام وثمنها 900 دينار، والجرّة الكبيرة سعتها خمسة أثمان الكيلوغرام وثمنها 1450 دينارًا' },
    statement: 'جنى نحّال $\\frac{27}{4}\\,\\text{kg}$ من العسل. يبيع الجرّة الصغيرة ($\\frac{3}{8}\\,\\text{kg}$) بـ $900$ DA ، والجرّة الكبيرة ($\\frac{5}{8}\\,\\text{kg}$) بـ $1450$ DA .',
    data: [
      { id: 'honey', text: 'كمية العسل 27/4 kg', useful: true },
      { id: 'small', text: 'الصغيرة 3/8 kg بـ 900 DA', useful: true },
      { id: 'large', text: 'الكبيرة 5/8 kg بـ 1450 DA', useful: true },
      { id: 'bees', text: 'خلايا النحل في بستان', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الجرار الصغيرة',
        question: 'كم جرّة صغيرة يملأ كل العسل؟',
        asks: ['عدد الجرار الصغيرة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['maqlub-qismat-kasrayn-3am'], prompt: 'عدد الجرار هو:', options: ['$\\frac{27}{4} \\div \\frac{3}{8}$', '$\\frac{27}{4} \\times \\frac{3}{8}$', '$\\frac{3}{8} \\div \\frac{27}{4}$'], correct: 0,
            explain: 'نبحث عن عدد المرّات التي تدخل فيها $\\frac{3}{8}$ في $\\frac{27}{4}$ : هذه قسمة الكمية على السعة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqlub-qismat-kasrayn-3am'], prompt: '$\\frac{27}{4} \\times \\frac{8}{3} =$', expected: 18, suffix: 'جرّة', explain: 'نختزل قبل الضرب: $\\frac{27 \\times 8}{4 \\times 3} = 9 \\times 2 = 18$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{27}{4} \\div \\frac{3}{8} = \\frac{27}{4} \\times \\frac{8}{3} = 18$ .', 'يملأ العسل $18$ جرّة صغيرة.'] },
        ],
      },
      {
        label: '2)', title: 'الجرار الكبيرة',
        question: 'كم جرّة كبيرة ممتلئة يملأ العسل؟ وكم يبقى منه؟',
        asks: ['عدد الجرار الكبيرة الممتلئة', 'ما يبقى من العسل'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqlub-qismat-kasrayn-3am'], prompt: '$\\frac{27}{4} \\div \\frac{5}{8} = \\frac{54}{5} = 10{,}8$ ، فعدد الجرار الممتلئة:', expected: 10, suffix: 'جرّات',
            explain: 'أحد عشر جرّة لا تمتلئ: الجرّة الأخيرة ناقصة، فنعدّ العشر الممتلئة فقط.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['jam-tarh-kasrayn-3am'], prompt: 'يبقى من العسل:', options: ['$\\frac{27}{4} - 10 \\times \\frac{5}{8} = \\frac{1}{2}\\,\\text{kg}$', '$\\frac{4}{5}\\,\\text{kg}$', '$\\frac{27}{4} - \\frac{5}{8} = \\frac{49}{8}\\,\\text{kg}$'], correct: 0, cols: 1,
            explain: 'العشر جرّات تحمل $10 \\times \\frac{5}{8} = \\frac{25}{4}$ ، ويبقى $\\frac{27}{4} - \\frac{25}{4} = \\frac{2}{4} = \\frac{1}{2}$ . العدد $0{,}8$ في $10{,}8$ ليس كيلوغرامات، بل جزء من جرّة.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{27}{4} \\div \\frac{5}{8} = \\frac{54}{5} = 10{,}8$ : تمتلئ $10$ جرّات.', 'الباقي $\\frac{27}{4} - 10 \\times \\frac{5}{8} = \\frac{27}{4} - \\frac{25}{4} = \\frac{1}{2}\\,\\text{kg}$ .'] },
        ],
      },
      {
        label: '3)', title: 'ثمن الكيلوغرام',
        question: 'ما ثمن الكيلوغرام الواحد في الجرّة الصغيرة وفي الجرّة الكبيرة؟',
        asks: ['ثمن الكيلوغرام في الصغيرة', 'ثمن الكيلوغرام في الكبيرة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqlub-qismat-kasrayn-3am'], prompt: 'الصغيرة: $900 \\div \\frac{3}{8} = 900 \\times \\frac{8}{3} =$', expected: 2400, suffix: 'DA', explain: '$900 \\div 3 = 300$ ثم $300 \\times 8 = 2400$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['maqlub-qismat-kasrayn-3am'], prompt: 'الكبيرة: $1450 \\div \\frac{5}{8} = 1450 \\times \\frac{8}{5} =$', expected: 2320, suffix: 'DA', explain: '$1450 \\div 5 = 290$ ثم $290 \\times 8 = 2320$ .' },
          { kind: 'solution', ask: 0, lines: ['الصغيرة: $900 \\div \\frac{3}{8} = 2400$ DA للكيلوغرام.', 'الكبيرة: $1450 \\div \\frac{5}{8} = 2320$ DA للكيلوغرام.'] },
        ],
      },
      {
        label: '4)', title: 'الأوفر للزبون',
        question: 'أيّ الجرّتين أوفر للزبون؟',
        asks: ['الجرّة الأوفر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-muqaranat-kasrayn-3am'], prompt: 'الأوفر:', options: ['الكبيرة، لأنّ ثمن كيلوغرامها $2320$ أصغر من $2400$', 'الصغيرة، لأنّ ثمنها $900$ أصغر من $1450$', 'متساويتان'], correct: 0, cols: 1,
            explain: 'لا نقارن ثمنين لسعتين مختلفتين، بل ثمنين لوحدة واحدة هي الكيلوغرام: $2320 < 2400$ .' },
          { kind: 'solution', ask: 0, lines: ['ثمن الكيلوغرام: $2400$ في الصغيرة و $2320$ في الكبيرة، و $2320 < 2400$ .', 'الجرّة الكبيرة أوفر للزبون.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — رحلة الدرّاجات',
    context: 'طول مسار من الجزء الباقي منه',
    emoji: '🚴',
    source: SOURCE,
    tone: 'violet',
    illustration: { kind: 'scene', icon: 'person', bg: 'green', chips: [{ label: 'صباحًا', value: '2/5', unit: 'من المسار', tone: 'green' }, { label: 'بعد الظهر', value: '1/3', unit: 'من المسار', tone: 'amber' }, { label: 'الباقي', value: 16, unit: 'km', tone: 'rose' }], ariaLabel: 'رحلة درّاجات: خمسان من المسار صباحًا وثلث منه بعد الظهر وبقي ستة عشر كيلومترًا' },
    statement: 'قطع فوج النادي $\\frac{2}{5}$ من مسار الرحلة صباحًا، و $\\frac{1}{3}$ منه بعد الظهر، وبقي له $16\\,\\text{km}$ .',
    data: [
      { id: 'am', text: 'الصباح: 2/5 من المسار', useful: true },
      { id: 'pm', text: 'بعد الظهر: 1/3 من المسار', useful: true },
      { id: 'left', text: 'بقي 16 km', useful: true },
      { id: 'bikes', text: 'الدرّاجات من نوع واحد', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الجزء المقطوع',
        question: 'ما الكسر الذي يمثّل ما قطعه الفوج من المسار؟',
        asks: ['الكسر المقطوع'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kasrayn-3am'], prompt: 'المقطوع صباحًا وبعد الظهر معًا:', options: ['$\\frac{2}{5} + \\frac{1}{3} = \\frac{11}{15}$', '$\\frac{2 + 1}{5 + 3} = \\frac{3}{8}$', '$\\frac{2}{5} \\times \\frac{1}{3} = \\frac{2}{15}$'], correct: 0,
            explain: 'الكسران من المسار نفسه، فنجمعهما بمقام مشترك: $\\frac{6}{15} + \\frac{5}{15} = \\frac{11}{15}$ . ولا نجمع البسطين والمقامين، ولا نضرب.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{2}{5} + \\frac{1}{3} = \\frac{6}{15} + \\frac{5}{15} = \\frac{11}{15}$ .', 'قطع الفوج $\\frac{11}{15}$ من المسار.'] },
        ],
      },
      {
        label: '2)', title: 'الجزء الباقي',
        question: 'ما الكسر الذي يمثّل ما بقي من المسار؟',
        asks: ['الكسر الباقي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kasrayn-3am'], prompt: 'الباقي هو:', options: ['$1 - \\frac{11}{15} = \\frac{4}{15}$', '$\\frac{11}{15}$', '$1 - \\frac{3}{8} = \\frac{5}{8}$'], correct: 0,
            explain: 'الباقي هو الكلّ ناقص المقطوع: $\\frac{15}{15} - \\frac{11}{15} = \\frac{4}{15}$ .' },
          { kind: 'solution', ask: 0, lines: ['$1 - \\frac{11}{15} = \\frac{15}{15} - \\frac{11}{15} = \\frac{4}{15}$ .', 'بقي $\\frac{4}{15}$ من المسار.'] },
        ],
      },
      {
        label: '3)', title: 'طول المسار',
        question: 'ما طول المسار كلّه؟',
        asks: ['طول المسار'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['maqlub-qismat-kasrayn-3am'], prompt: 'الكيلومترات الستة عشر هي $\\frac{4}{15}$ من المسار، فطول المسار:', options: ['$16 \\div \\frac{4}{15}$', '$16 \\times \\frac{4}{15}$', '$\\frac{4}{15} \\div 16$'], correct: 0,
            explain: 'قيمة معلومة تمثّل كسرًا من الكلّ: نجد الكلّ بقسمتها على الكسر.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqlub-qismat-kasrayn-3am'], prompt: '$16 \\times \\frac{15}{4} =$', expected: 60, suffix: 'km', explain: '$16 \\div 4 = 4$ ثم $4 \\times 15 = 60$ . نتحقّق: $\\frac{4}{15} \\times 60 = 16$ .' },
          { kind: 'solution', ask: 0, lines: ['$16$ km هي $\\frac{4}{15}$ من المسار: $16 \\div \\frac{4}{15} = 16 \\times \\frac{15}{4} = 60$ .', 'طول المسار $60$ km .'] },
        ],
      },
      {
        label: '4)', title: 'مسافة الصباح ومسافة بعد الظهر',
        question: 'ما المسافة المقطوعة صباحًا وما المقطوعة بعد الظهر؟',
        asks: ['مسافة الصباح', 'مسافة بعد الظهر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: 'صباحًا: $\\frac{2}{5} \\times 60 =$', expected: 24, suffix: 'km', explain: '$60 \\div 5 = 12$ ثم $12 \\times 2 = 24$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jida-kasrayn-2am'], prompt: 'بعد الظهر: $\\frac{1}{3} \\times 60 =$', expected: 20, suffix: 'km', explain: 'ثلث $60$ هو $20$ . نتحقّق: $24 + 20 + 16 = 60$ .' },
          { kind: 'solution', ask: 0, lines: ['صباحًا $\\frac{2}{5} \\times 60 = 24$ km ، وبعد الظهر $\\frac{1}{3} \\times 60 = 20$ km .', 'المجموع $24 + 20 + 16 = 60$ km .'] },
        ],
      },
      {
        label: '5)', title: 'أيّ فترة أطول؟',
        question: 'في أيّ فترة قطع الفوج مسافة أطول؟',
        asks: ['الفترة الأطول'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-muqaranat-kasrayn-3am'], prompt: 'الأطول:', options: ['الصباح، لأنّ $\\frac{2}{5} > \\frac{1}{3}$ ، أي $\\frac{6}{15} > \\frac{5}{15}$', 'بعد الظهر، لأنّ $3 > 2$', 'الفترتان متساويتان'], correct: 0, cols: 1,
            explain: 'بالمقام المشترك $15$ : $\\frac{6}{15} > \\frac{5}{15}$ ، وهذا يوافق $24 > 20$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{2}{5} = \\frac{6}{15}$ و $\\frac{1}{3} = \\frac{5}{15}$ ، و $\\frac{6}{15} > \\frac{5}{15}$ .', 'الصباح أطول ($24$ km مقابل $20$ km).'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — ليلة باردة في سطيف',
    context: 'أعداد ناطقة سالبة: تتبّع الحرارة ومقارنة سرعتي انخفاض',
    emoji: '🌙',
    source: SOURCE,
    tone: 'indigo',
    illustration: { kind: 'scene', icon: 'house', bg: 'blue', chips: [{ label: 'الساعة 18:00', value: 4, unit: '°C', tone: 'blue' }, { label: 'أربع ساعات: انخفاض كل ساعة', value: '5/4', unit: '°C', tone: 'rose' }, { label: 'ثلاث ساعات: انخفاض كل ساعة', value: '1/3', unit: '°C', tone: 'violet' }], ariaLabel: 'ليلة باردة في سطيف: الحرارة عند السادسة مساءً أربع درجات، ثم انخفاض بخمسة أرباع الدرجة كل ساعة أربع ساعات، ثم بثلث الدرجة كل ساعة ثلاث ساعات' },
    statement: 'عند الساعة 18:00 كانت الحرارة في سطيف $4\\,^\\circ\\text{C}$ . انخفضت بانتظام $\\frac{5}{4}\\,^\\circ$ في الساعة مدّة 4 ساعات، ثم $\\frac{1}{3}\\,^\\circ$ في الساعة مدّة 3 ساعات.',
    data: [
      { id: 'start', text: 'الحرارة 4°C عند 18:00', useful: true },
      { id: 'r1', text: 'انخفاض 5/4 ° كل ساعة مدّة 4 ساعات', useful: true },
      { id: 'r2', text: 'انخفاض 1/3 ° كل ساعة مدّة 3 ساعات', useful: true },
      { id: 'sky', text: 'السماء صافية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الحرارة عند 22:00',
        question: 'ما درجة الحرارة عند الساعة 22:00؟',
        asks: ['الحرارة عند 22:00'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['amaliyat-natiqa-3am'], prompt: 'التغيّر خلال 4 ساعات: $4 \\times \\left(-\\frac{5}{4}\\right) =$', expected: -5, display: '−5', explain: 'الإشارتان مختلفتان فالجداء سالب: $4 \\times \\frac{5}{4} = 5$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['amaliyat-natiqa-3am'], prompt: 'الحرارة: $4 + (-5) =$', expected: -1, display: '−1', suffix: '°C', explain: '$4 - 5 = -1$ .' },
          { kind: 'solution', ask: 0, lines: ['خلال 4 ساعات: $4 \\times \\left(-\\frac{5}{4}\\right) = -5$ .', 'الحرارة $4 + (-5) = -1\\,^\\circ\\text{C}$ .'] },
        ],
      },
      {
        label: '2)', title: 'الحرارة عند 1:00',
        question: 'ما درجة الحرارة عند الساعة 1:00 صباحًا؟',
        asks: ['الحرارة عند 1:00'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['amaliyat-natiqa-3am'], prompt: 'التغيّر خلال 3 ساعات: $3 \\times \\left(-\\frac{1}{3}\\right) =$', expected: -1, display: '−1', explain: '$3 \\times \\frac{1}{3} = 1$ والإشارة سالبة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['amaliyat-natiqa-3am'], prompt: 'الحرارة: $-1 + (-1) =$', expected: -2, display: '−2', suffix: '°C', explain: 'جمع عددين سالبين: $-1 - 1 = -2$ .' },
          { kind: 'solution', ask: 0, lines: ['من 22:00 إلى 1:00 ثلاث ساعات: $3 \\times \\left(-\\frac{1}{3}\\right) = -1$ .', 'الحرارة $-1 + (-1) = -2\\,^\\circ\\text{C}$ .'] },
        ],
      },
      {
        label: '3)', title: 'متوسّط التغيّر في الساعة',
        question: 'ما متوسّط التغيّر في الساعة بين 18:00 و 1:00؟',
        asks: ['متوسّط التغيّر في الساعة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['amaliyat-natiqa-3am'], prompt: 'المدّة من 18:00 إلى 1:00 بالساعات:', expected: 7, explain: 'من 18:00 إلى منتصف الليل 6 ساعات، ثم ساعة: $6 + 1 = 7$ .' },
          { kind: 'numeric', role: 'compute', requires: ['amaliyat-natiqa-3am'], prompt: 'التغيّر الكلّي: $-2 - 4 =$', expected: -6, display: '−6', explain: 'من $4$ إلى $-2$ : $-2 - 4 = -6$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['amaliyat-natiqa-3am'], prompt: 'المتوسّط $= (-6) \\div 7 =$', options: ['$-\\frac{6}{7}$', '$\\frac{6}{7}$', '$-\\frac{7}{6}$'], correct: 0,
            explain: 'الإشارتان مختلفتان فالحاصل سالب: $-\\frac{6}{7}$ . و $\\frac{6}{7}$ أسقط الإشارة، و $-\\frac{7}{6}$ قلب القسمة.' },
          { kind: 'solution', ask: 0, lines: ['التغيّر الكلّي $-2 - 4 = -6$ خلال $7$ ساعات.', 'المتوسّط $(-6) \\div 7 = -\\frac{6}{7}\\,^\\circ$ في الساعة.'] },
        ],
      },
      {
        label: '4)', title: 'مقارنة سرعتي الانخفاض',
        question: 'في مدينة أخرى كان متوسّط التغيّر $-\\frac{5}{6}$ في الساعة: أيّ المدينتين انخفضت حرارتها أسرع؟',
        asks: ['المدينة الأسرع انخفاضًا'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tasawi-muqaranat-kasrayn-3am', 'adad-natiq-3am'], prompt: 'نكتب $-\\frac{6}{7}$ بالمقام $42$ : $-\\frac{6}{7} = \\frac{?}{42}$ ، والبسط:', expected: -36, display: '−36', explain: '$7 \\times 6 = 42$ ، فنضرب البسط في $6$ أيضًا: $-6 \\times 6 = -36$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-natiq-3am'], prompt: 'بما أنّ $-\\frac{5}{6} = -\\frac{35}{42}$ :',
            options: ['سطيف: $-\\frac{36}{42} < -\\frac{35}{42}$ ، فانخفاضها أسرع', 'المدينة الأخرى: $-\\frac{35}{42} < -\\frac{36}{42}$', 'السرعتان متساويتان'], correct: 0, cols: 1,
            explain: 'على المستقيم المدرّج $-\\frac{36}{42}$ على يسار $-\\frac{35}{42}$ ، فهو الأصغر: المتوسّط الأصغر يعني انخفاضًا أكبر.' },
          { kind: 'solution', ask: 0, lines: ['$-\\frac{6}{7} = -\\frac{36}{42}$ و $-\\frac{5}{6} = -\\frac{35}{42}$ .', '$-\\frac{36}{42} < -\\frac{35}{42}$ : انخفضت الحرارة في سطيف أسرع.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ورقة إجابات سارة',
    context: 'أحكم على حسابات زميلة وأصحّحها',
    emoji: '📝',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'scene', icon: 'pen', bg: 'rose', chips: [{ label: 'عدد الإجابات', value: 5, tone: 'rose' }, { label: 'نقطة لكل إجابة صحيحة', value: 1, tone: 'green' }], ariaLabel: 'ورقة سارة: خمس إجابات تُمنح نقطة عن كل إجابة صحيحة' },
    statement: 'قدّمت سارة ورقة بخمس إجابات: (a) $\\frac{3}{4} + \\frac{2}{5} = \\frac{5}{9}$ ، (b) $\\frac{-6}{-9} = -\\frac{2}{3}$ ، (c) $\\left(\\frac{5}{6} - \\frac{3}{2}\\right) \\times \\frac{9}{4} = -\\frac{3}{2}$ ، (d) $\\frac{1}{2} - \\frac{3}{4} \\times \\frac{2}{3} = -\\frac{1}{6}$ ، (e) $\\frac{14}{5} \\div \\frac{7}{10} = 4$ . يمنح الأستاذ نقطة عن كل إجابة صحيحة.',
    data: [
      { id: 'a', text: 'الإجابات الخمس (a) إلى (e)', useful: true },
      { id: 'mark', text: 'نقطة عن كل إجابة صحيحة', useful: true },
      { id: 'who', text: 'سارة تلميذة في القسم نفسه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صحيح أم خاطئ؟',
        question: 'احكم على كل إجابة من الإجابات الخمس.',
        asks: ['الحكم على الإجابات الخمس'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['jam-tarh-kasrayn-3am', 'adad-natiq-3am', 'amaliyat-natiqa-3am', 'maqlub-qismat-kasrayn-3am'], prompt: 'اختر الحكم:',
            rows: [
              { label: '$\\frac{3}{4} + \\frac{2}{5} = \\frac{5}{9}$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'لا نجمع البسطين والمقامين: بالمقام $20$ ، $\\frac{15}{20} + \\frac{8}{20} = \\frac{23}{20}$ .' },
              { label: '$\\frac{-6}{-9} = -\\frac{2}{3}$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'البسط والمقام سالبان: الناتج موجب، $\\frac{-6}{-9} = \\frac{6}{9} = \\frac{2}{3}$ .' },
              { label: '$\\left(\\frac{5}{6} - \\frac{3}{2}\\right) \\times \\frac{9}{4} = -\\frac{3}{2}$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$\\frac{5}{6} - \\frac{9}{6} = -\\frac{2}{3}$ ثم $-\\frac{2}{3} \\times \\frac{9}{4} = -\\frac{18}{12} = -\\frac{3}{2}$ .' },
              { label: '$\\frac{1}{2} - \\frac{3}{4} \\times \\frac{2}{3} = -\\frac{1}{6}$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الضرب أوّلًا: $\\frac{3}{4} \\times \\frac{2}{3} = \\frac{1}{2}$ ثم $\\frac{1}{2} - \\frac{1}{2} = 0$ .' },
              { label: '$\\frac{14}{5} \\div \\frac{7}{10} = 4$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'نضرب في المقلوب: $\\frac{14}{5} \\times \\frac{10}{7} = \\frac{140}{35} = 4$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: ['(a) خطأ، (b) خطأ، (c) صحيح، (d) خطأ، (e) صحيح.', 'نتحقّق من كل واحدة بقاعدة الجمع بمقام مشترك، وقاعدة الإشارات، وأولوية العمليات، والقسمة بالضرب في المقلوب.'] },
        ],
      },
      {
        label: '2)', title: 'تصحيح الخاطئة',
        question: 'ما القيمة الصحيحة في الإجابتين (a) و (b)؟ وما قيمة الإجابة (d) الصحيحة، وما سبب خطأ سارة فيها؟',
        asks: ['القيمة الصحيحة في (a)', 'القيمة الصحيحة في (b)', 'القيمة الصحيحة في (d)', 'سبب الخطأ في (d)'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kasrayn-3am'], prompt: '$\\frac{3}{4} + \\frac{2}{5} =$', options: ['$\\frac{23}{20}$', '$\\frac{5}{9}$', '$\\frac{7}{20}$'], correct: 0, cols: 3,
            explain: 'بالمقام $20$ : $\\frac{15}{20} + \\frac{8}{20} = \\frac{23}{20}$ . و $\\frac{5}{9}$ جمع البسطين والمقامين.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['adad-natiq-3am'], prompt: '$\\frac{-6}{-9} =$', options: ['$\\frac{2}{3}$', '$-\\frac{2}{3}$', '$\\frac{3}{2}$'], correct: 0, cols: 3,
            explain: 'الإشارتان متماثلتان: $\\frac{-6}{-9} = \\frac{6}{9} = \\frac{2}{3}$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['amaliyat-natiqa-3am'], prompt: '$\\frac{1}{2} - \\frac{3}{4} \\times \\frac{2}{3} =$', expected: 0, explain: 'الضرب أوّلًا: $\\frac{3}{4} \\times \\frac{2}{3} = \\frac{1}{2}$ ثم $\\frac{1}{2} - \\frac{1}{2} = 0$ .' },
          { kind: 'choice', role: 'conclude', ask: 3, requires: ['amaliyat-natiqa-3am'], prompt: 'لقد حسبت سارة $\\left(\\frac{1}{2} - \\frac{3}{4}\\right) \\times \\frac{2}{3} = -\\frac{1}{6}$ . خطؤها:',
            options: ['أجرت الطرح قبل الضرب خلافًا للأولوية', 'أخطأت في ضرب $\\frac{3}{4}$ في $\\frac{2}{3}$', 'قلبت الكسر $\\frac{2}{3}$'], correct: 0, cols: 1,
            explain: 'الضرب والقسمة قبل الجمع والطرح ما لم توجد أقواس: كان عليها أن تحسب $\\frac{3}{4} \\times \\frac{2}{3}$ أوّلًا.' },
          { kind: 'solution', ask: 0, lines: ['(a) $\\frac{3}{4} + \\frac{2}{5} = \\frac{23}{20}$ و (b) $\\frac{-6}{-9} = \\frac{2}{3}$ .', '(d) $\\frac{1}{2} - \\frac{3}{4} \\times \\frac{2}{3} = \\frac{1}{2} - \\frac{1}{2} = 0$ ؛ وقد طبّقت سارة الطرح قبل الضرب.'] },
        ],
      },
      {
        label: '3)', title: 'نقطة سارة',
        question: 'ما نقطة سارة من 5؟',
        asks: ['نقطة سارة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['amaliyat-natiqa-3am'], prompt: 'عدد إجاباتها الصحيحة، وهي (c) و (e):', expected: 2, explain: 'نقطة عن كل إجابة صحيحة، والصحيحتان (c) و (e): $2$ من $5$ .' },
          { kind: 'solution', ask: 0, lines: ['الإجابتان (c) و (e) صحيحتان.', 'نقطة سارة: $2$ من $5$ .'] },
        ],
      },
      {
        label: '4)', title: 'هرم المجاميع (إضافة)',
        question: 'في قاعدة هرم ثلاثة أعداد: $-\\frac{1}{2}$ و $\\frac{2}{3}$ و $-\\frac{1}{4}$ ، وكل عدد في الصف الأعلى هو مجموع العددين اللذين تحته. ما العدد في القمة؟',
        asks: ['العدد في القمة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jam-tarh-kasrayn-3am', 'amaliyat-natiqa-3am'], prompt: 'عددا الصف الأوسط هما:', options: ['$\\frac{1}{6}$ و $\\frac{5}{12}$', '$-\\frac{7}{6}$ و $\\frac{11}{12}$', '$\\frac{1}{6}$ و $-\\frac{11}{12}$'], correct: 0,
            explain: '$-\\frac{1}{2} + \\frac{2}{3} = -\\frac{3}{6} + \\frac{4}{6} = \\frac{1}{6}$ و $\\frac{2}{3} + \\left(-\\frac{1}{4}\\right) = \\frac{8}{12} - \\frac{3}{12} = \\frac{5}{12}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kasrayn-3am'], prompt: 'القمة $= \\frac{1}{6} + \\frac{5}{12} =$', options: ['$\\frac{7}{12}$', '$\\frac{6}{18}$', '$\\frac{1}{4}$'], correct: 0, cols: 3,
            explain: 'بالمقام $12$ : $\\frac{2}{12} + \\frac{5}{12} = \\frac{7}{12}$ . و $\\frac{6}{18}$ جمع البسطين والمقامين.' },
          { kind: 'solution', ask: 0, lines: ['الصف الأوسط: $-\\frac{1}{2} + \\frac{2}{3} = \\frac{1}{6}$ و $\\frac{2}{3} - \\frac{1}{4} = \\frac{5}{12}$ .', 'القمة $\\frac{1}{6} + \\frac{5}{12} = \\frac{2}{12} + \\frac{5}{12} = \\frac{7}{12}$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
