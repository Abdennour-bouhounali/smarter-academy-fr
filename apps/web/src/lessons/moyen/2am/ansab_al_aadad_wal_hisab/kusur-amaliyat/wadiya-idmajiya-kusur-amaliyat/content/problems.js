/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des cinq leçons de l'unité 2 de 2AM (القسمة الإقليدية والحصر، الكسر حاصل قسمة
 * وقيم مقرّبة، جمع وطرح كسرين، جداء كسرين، مقارنة كسرين), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). L'intégration du manuel
 * (l'assainissement dans le monde) est REDESSINÉE en situation 1 (le réseau d'eau d'une commune : 4800 familles, 3/8 puis 1/4) ; la « وضعية للتقويم » en situation 2 (la باقة d'internet :
 * 1/3 puis 3/4 du reste, 500 MB restent) ; les cartes du تحدّي en situation 3 (1/2, 1/3, 1/4, 1/6, 1/12 : UN choix de quatre fait 1) ; le registre de `2am-s1-91` inspire la situation 5
 * (réécrit sans l'événement). Les situations 4 et 6 sont de la plateforme. Aucune notion nouvelle ; ni pourcentage, ni équation, ni division PAR une fraction (un TOUT inconnu se trouve d'une
 * fraction unité par une MULTIPLICATION : « 1/6 est 500 MB, donc 6/6 est 6 × 500 »), ni dénominateurs sans multiple commun immédiat (3AM). Une réponse fractionnaire se CHOISIT
 * (le GuidedProblem saisit des nombres décimaux) ; chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('integration', 36, 'أدمج تعلّماتي');
const S2 = src('evaluation', 36, 'وضعية للتقويم');
const S3 = src('challenge', 22, 'تحدّي');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — شبكة مياه البلدية',
    context: 'كسران من عدد الأسر ثم نصيب الأسرة',
    emoji: '🚰',
    source: S1,
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'البلدية', icon: 'house', lines: [{ label: 'عدد الأسر', value: 4800 }] },
      { title: 'الربط بالشبكة', icon: 'bottle', lines: [{ label: 'السنة الأولى', value: '3/8', unit: 'من الأسر' }, { label: 'السنة الثانية', value: '1/4', unit: 'من الأسر' }] },
    ], ariaLabel: 'بطاقتان: في البلدية 4800 أسرة، رُبط منها ثلاثة أثمان في السنة الأولى وربع في السنة الثانية بشبكة المياه' },
    statement: 'في بلدية $4800$ أسرة. رُبطت $\\frac{3}{8}$ منها بشبكة المياه الجديدة في السنة الأولى، و $\\frac{1}{4}$ منها في السنة الثانية. يوفّر الخزّان للأسر المربوطة $2500\\,\\text{m}^3$ من الماء يوميًا.',
    data: [
      { id: 'families', text: 'عدد الأسر: 4800', useful: true },
      { id: 'y1', text: 'السنة الأولى: 3/8 من الأسر', useful: true },
      { id: 'y2', text: 'السنة الثانية: 1/4 من الأسر', useful: true },
      { id: 'tank', text: 'الخزّان يوفّر 2500 m³ يوميًا', useful: true },
      { id: 'mount', text: 'المياه تأتي من جبل قريب', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كسر الأسر المربوطة',
        question: 'ما الكسر الذي يمثّله عدد الأسر المربوطة في السنتين من عدد الأسر؟',
        asks: ['كسر الأسر المربوطة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: 'نكتب $\\frac{1}{4}$ بالمقام $8$ : $\\frac{1}{4} = \\frac{?}{8}$ . البسط:', expected: 2, explain: '$4 \\times 2 = 8$ ، فنضرب البسط في $2$ أيضًا: $1 \\times 2 = 2$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'الكسران من العدد نفسه، فمجموعهما:',
            options: ['$\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}$', '$\\frac{3 + 1}{8 + 4} = \\frac{4}{12}$', '$\\frac{3}{8} + \\frac{1}{4} = \\frac{4}{8}$'], correct: 0, cols: 1,
            explain: 'نجمع البسطين فقط بعد توحيد المقامين: $\\frac{5}{8}$ . الخطأ الأوّل جمع البسطين والمقامين، والثاني نسي أنّ $\\frac{1}{4}$ تساوي $\\frac{2}{8}$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{1}{4} = \\frac{2}{8}$ .', 'الأسر المربوطة: $\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}$ من الأسر.'] },
        ],
      },
      {
        label: '2)', title: 'هل رُبط أكثر من النصف؟',
        question: 'هل رُبط بالشبكة أكثر من نصف الأسر؟',
        asks: ['المقارنة بالنصف'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['muqarana-kasrayn-2am'], prompt: 'النصف بالمقام $8$ : $\\frac{1}{2} = \\frac{?}{8}$ . البسط:', expected: 4, explain: '$2 \\times 4 = 8$ ، فنضرب البسط في $4$ أيضًا.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-kasrayn-2am'], prompt: 'نقارن $\\frac{5}{8}$ بالنصف:',
            options: ['نعم: $\\frac{5}{8} > \\frac{4}{8}$ أي $\\frac{5}{8} > \\frac{1}{2}$', 'لا: $\\frac{5}{8} < \\frac{1}{2}$ لأنّ $8 > 2$', 'لا: لأنّ $5 > 4$'], correct: 0, cols: 1,
            explain: 'للكسرين المقام نفسه $8$ : الأكبر هو ذو البسط الأكبر، و $5 > 4$ . الخطأ الثاني حكم بالمقام وحده.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{1}{2} = \\frac{4}{8}$ و $\\frac{5}{8} > \\frac{4}{8}$ .', 'نعم: رُبط أكثر من نصف الأسر.'] },
        ],
      },
      {
        label: '3)', title: 'عدد الأسر المربوطة',
        question: 'كم أسرة رُبطت بالشبكة؟',
        asks: ['عدد الأسر المربوطة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jida-kasrayn-2am'], prompt: 'السنة الأولى: $\\frac{3}{8} \\times 4800 =$', expected: 1800, explain: '$4800 \\div 8 = 600$ ثم $600 \\times 3 = 1800$ .' },
          { kind: 'numeric', role: 'compute', requires: ['jida-kasrayn-2am'], prompt: 'السنة الثانية: $\\frac{1}{4} \\times 4800 =$', expected: 1200, explain: 'ربع $4800$ هو $4800 \\div 4 = 1200$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'عدد الأسر المربوطة: $1800 + 1200 =$', expected: 3000, explain: '$1800 + 1200 = 3000$ ؛ نتحقّق: $\\frac{5}{8} \\times 4800 = 3000$ .' },
          { kind: 'solution', ask: 0, lines: ['السنة الأولى $\\frac{3}{8} \\times 4800 = 1800$ والثانية $\\frac{1}{4} \\times 4800 = 1200$ .', 'رُبطت $1800 + 1200 = 3000$ أسرة.'] },
        ],
      },
      {
        label: '4)', title: 'الأسر غير المربوطة',
        question: 'ما الكسر الذي تمثّله الأسر غير المربوطة؟ وكم عددها؟',
        asks: ['كسر الأسر غير المربوطة', 'عدد الأسر غير المربوطة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'غير المربوطة هي ما بقي من الكلّ:',
            options: ['$1 - \\frac{5}{8} = \\frac{3}{8}$', '$\\frac{5}{8}$', '$1 - \\frac{1}{4} = \\frac{3}{4}$'], correct: 0, cols: 1,
            explain: 'الكلّ $\\frac{8}{8}$ ناقص المربوطة $\\frac{5}{8}$ : $\\frac{3}{8}$ . و $\\frac{5}{8}$ هو كسر المربوطة نفسه.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam-tarh-kusur-2am'], prompt: 'عددها: $4800 - 3000 =$', expected: 1800, explain: '$4800 - 3000 = 1800$ ؛ نتحقّق: $\\frac{3}{8} \\times 4800 = 1800$ .' },
          { kind: 'solution', ask: 0, lines: ['غير المربوطة: $1 - \\frac{5}{8} = \\frac{3}{8}$ من الأسر.', 'عددها $4800 - 3000 = 1800$ أسرة.'] },
        ],
      },
      {
        label: '5)', title: 'حصر نصيب الأسرة',
        question: 'يوفّر الخزّان $2500\\,\\text{m}^3$ للأسر المربوطة (وعددها $3000$ ): احصر نصيب الأسرة الواحدة إلى $0{,}01$ .',
        asks: ['حصر نصيب الأسرة إلى 0,01'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['kasr-hasil-qisma-2am'], prompt: 'نصيب الأسرة الواحدة هو حاصل قسمة:',
            options: ['$2500 \\div 3000 = \\frac{2500}{3000}$ ، أي $\\frac{5}{6}$ من $\\text{m}^3$', '$3000 \\div 2500 = \\frac{6}{5}$', '$2500 \\times 3000$'], correct: 0, cols: 1,
            explain: 'نقسم الماء على عدد الأسر: $\\frac{2500}{3000} = \\frac{5}{6}$ . والخطآن قلبا القسمة أو ضربا.' },
          { kind: 'numeric', role: 'compute', requires: ['kasr-hasil-qisma-2am'], prompt: '$3000 \\times 0{,}83 =$', expected: 2490, explain: '$3000 \\times 0{,}83 = 2490$ ، وهو أصغر من $2500$ .' },
          { kind: 'numeric', role: 'compute', requires: ['kasr-hasil-qisma-2am'], prompt: '$3000 \\times 0{,}84 =$', expected: 2520, explain: '$3000 \\times 0{,}84 = 2520$ ، وهو أكبر من $2500$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-hasil-qisma-2am'], prompt: 'بما أنّ $2490 < 2500 < 2520$ :',
            options: ['$0{,}83 < \\frac{5}{6} < 0{,}84$', '$0{,}84 < \\frac{5}{6} < 0{,}85$', '$0{,}82 < \\frac{5}{6} < 0{,}83$'], correct: 0, cols: 1,
            explain: 'حاصل القسمة بين $0{,}83$ و $0{,}84$ ، لأنّ $3000$ ضرب $0{,}83$ يعطي $2490$ و ضرب $0{,}84$ يعطي $2520$ والعدد $2500$ بينهما.' },
          { kind: 'solution', ask: 0, lines: ['$3000 \\times 0{,}83 = 2490 < 2500 < 2520 = 3000 \\times 0{,}84$ .', 'نصيب الأسرة: $0{,}83 < \\frac{5}{6} < 0{,}84$ من $\\text{m}^3$ في اليوم.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — باقة الإنترنت',
    context: 'كسر من الباقي ثم الكلّ من جزئه',
    emoji: '📶',
    source: S2,
    tone: 'amber',
    illustration: { kind: 'tags', cards: [
      { title: 'الأسبوع الأول', icon: 'phone', lines: [{ label: 'استُعمل', value: '1/3', unit: 'من الباقة' }] },
      { title: 'بقيّة الشهر', icon: 'phone', lines: [{ label: 'استُعمل', value: '3/4', unit: 'من الباقي' }] },
      { title: 'آخر الشهر', icon: 'phone', lines: [{ label: 'بقي', value: 500, unit: 'MB' }] },
    ], ariaLabel: 'ثلاث بطاقات: في الأسبوع الأول استُعمل ثلث الباقة، وفي بقيّة الشهر ثلاثة أرباع الباقي، وبقي في آخر الشهر 500 ميغابايت' },
    statement: 'استعملت عائلة $\\frac{1}{3}$ من باقة الإنترنت الشهرية في الأسبوع الأول، ثم استعملت $\\frac{3}{4}$ ما بقي في بقيّة الشهر. وبقي لها في آخر الشهر $500\\,\\text{MB}$ .',
    data: [
      { id: 'w1', text: 'الأسبوع الأول: 1/3 من الباقة', useful: true },
      { id: 'w2', text: 'بقيّة الشهر: 3/4 من الباقي', useful: true },
      { id: 'left', text: 'بقي في آخر الشهر: 500 MB', useful: true },
      { id: 'who', text: 'تستعمل العائلة الإنترنت مساءً', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الباقي بعد الأسبوع الأول',
        question: 'ما الكسر الذي بقي من الباقة بعد الأسبوع الأول؟',
        asks: ['الكسر الباقي بعد الأسبوع الأول'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'الباقي هو الكلّ ناقص المستعمَل:',
            options: ['$1 - \\frac{1}{3} = \\frac{2}{3}$', '$\\frac{1}{3}$', '$1 - \\frac{3}{4} = \\frac{1}{4}$'], correct: 0,
            explain: '$\\frac{3}{3} - \\frac{1}{3} = \\frac{2}{3}$ . الخطأ الثالث أخذ كسر الأسبوع الثاني.' },
          { kind: 'solution', ask: 0, lines: ['الباقة كلّها $1 = \\frac{3}{3}$ .', 'بعد الأسبوع الأول بقي $\\frac{3}{3} - \\frac{1}{3} = \\frac{2}{3}$ من الباقة.'] },
        ],
      },
      {
        label: '2)', title: 'ما استُعمل بعد ذلك',
        question: 'ما الكسر الذي يمثّله ما استُعمل في بقيّة الشهر من الباقة كلّها؟',
        asks: ['كسر ما استُعمل في بقيّة الشهر من الباقة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jida-kasrayn-2am'], prompt: 'الكسر $\\frac{3}{4}$ هو كسر من:', options: ['الباقي بعد الأسبوع الأول، أي $\\frac{2}{3}$ من الباقة', 'الباقة كلّها', 'ما استُعمل في الأسبوع الأول'], correct: 0, cols: 1,
            explain: 'الجملة «ثلاثة أرباع ما بقي» تعني أنّ الكسر يُؤخذ من الباقي.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-kasrayn-2am'], prompt: 'ثلاثة أرباع $\\frac{2}{3}$ :',
            options: ['$\\frac{3}{4} \\times \\frac{2}{3} = \\frac{6}{12} = \\frac{1}{2}$', '$\\frac{3}{4}$ من الباقة', '$\\frac{3}{4} + \\frac{2}{3} = \\frac{17}{12}$'], correct: 0, cols: 1,
            explain: 'كسر من كسر جداء: $\\frac{3 \\times 2}{4 \\times 3} = \\frac{6}{12} = \\frac{1}{2}$ . الخطأ الثاني جعل $\\frac{3}{4}$ من الباقة كلّها، والثالث جمع بدل الضرب.' },
          { kind: 'solution', ask: 0, lines: ['ثلاثة أرباع الباقي: $\\frac{3}{4} \\times \\frac{2}{3} = \\frac{6}{12} = \\frac{1}{2}$ .', 'استُعمل في بقيّة الشهر نصف الباقة.'] },
        ],
      },
      {
        label: '3)', title: 'ما بقي في آخر الشهر',
        question: 'ما الكسر الذي بقي من الباقة في آخر الشهر؟',
        asks: ['الكسر الباقي في آخر الشهر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: 'نكتب المستعمَل $\\frac{1}{3} + \\frac{1}{2}$ بالمقام $6$ : $\\frac{2}{6} + \\frac{3}{6}$ . بسط المجموع:', expected: 5, explain: '$2 + 3 = 5$ ، فالمستعمَل $\\frac{5}{6}$ من الباقة.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'الباقي $1 - \\frac{5}{6} =$', options: ['$\\frac{1}{6}$', '$\\frac{5}{6}$', '$\\frac{1}{5}$'], correct: 0, cols: 3,
            explain: '$\\frac{6}{6} - \\frac{5}{6} = \\frac{1}{6}$ .' },
          { kind: 'solution', ask: 0, lines: ['المستعمَل $\\frac{1}{3} + \\frac{1}{2} = \\frac{2}{6} + \\frac{3}{6} = \\frac{5}{6}$ .', 'بقي $1 - \\frac{5}{6} = \\frac{1}{6}$ من الباقة.'] },
        ],
      },
      {
        label: '4)', title: 'حجم الباقة',
        question: 'ما حجم الباقة الشهرية؟',
        asks: ['حجم الباقة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jida-kasrayn-2am'], prompt: 'الـ $500\\,\\text{MB}$ هي $\\frac{1}{6}$ من الباقة، فالباقة كلّها $\\frac{6}{6}$ ، أي:', options: ['$6 \\times 500$', '$500 \\div 6$', '$500 + 6$'], correct: 0,
            explain: 'السدس مأخوذ $6$ مرّات يعطي الكلّ: نضرب في $6$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: '$6 \\times 500 =$', expected: 3000, suffix: 'MB', explain: '$6 \\times 500 = 3000$ . نتحقّق: $\\frac{1}{6} \\times 3000 = 500$ .' },
          { kind: 'solution', ask: 0, lines: ['$500\\,\\text{MB}$ هي $\\frac{1}{6}$ من الباقة.', 'الباقة كلّها $6 \\times 500 = 3000\\,\\text{MB}$ .'] },
        ],
      },
      {
        label: '5)', title: 'استعمال الأسبوع الأول',
        question: 'كم ميغابايت استُعملت في الأسبوع الأول؟',
        asks: ['ما استُعمل في الأسبوع الأول'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: '$\\frac{1}{3} \\times 3000 =$', expected: 1000, suffix: 'MB', explain: 'ثلث $3000$ هو $3000 \\div 3 = 1000$ .' },
          { kind: 'solution', ask: 0, lines: ['الأسبوع الأول هو $\\frac{1}{3}$ من $3000$ : $\\frac{1}{3} \\times 3000 = 1000$ .', 'استُعمل $1000\\,\\text{MB}$ ؛ تحقّق: $1000 + 1500 + 500 = 3000$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — بطاقات المجموع',
    context: 'خمس بطاقات كسرية ومجموع يساوي 1',
    emoji: '🎴',
    source: S3,
    tone: 'emerald',
    illustration: { kind: 'tags', cards: [
      { title: 'بطاقات سارة', icon: 'ticket', lines: [{ label: 'الأولى', value: '1/2' }, { label: 'الثانية', value: '1/3' }, { label: 'الثالثة', value: '1/4' }] },
      { title: 'بقيّة البطاقات', icon: 'ticket', lines: [{ label: 'الرابعة', value: '1/6' }, { label: 'الخامسة', value: '1/12' }] },
    ], ariaLabel: 'بطاقتان تجمعان خمس بطاقات لسارة: النصف والثلث والربع والسدس وجزء من اثني عشر' },
    statement: 'لدى سارة خمس بطاقات تحمل الكسور $\\frac{1}{2}$ و $\\frac{1}{3}$ و $\\frac{1}{4}$ و $\\frac{1}{6}$ و $\\frac{1}{12}$ . تريد اختيار بعض البطاقات بحيث يساوي مجموع كسورها $1$ .',
    data: [
      { id: 'cards', text: 'البطاقات: 1/2 و 1/3 و 1/4 و 1/6 و 1/12', useful: true },
      { id: 'goal', text: 'المجموع المطلوب يساوي 1', useful: true },
      { id: 'color', text: 'البطاقات ملوّنة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المقام المشترك',
        question: 'اكتب كل بطاقة بالمقام $12$ .',
        asks: ['البطاقات الخمس بالمقام 12'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'اختر كلّ كتابة بالمقام $12$ :',
            rows: [
              { label: '$\\frac{1}{2} =$', options: ['$\\frac{6}{12}$', '$\\frac{2}{12}$', '$\\frac{12}{12}$'], correct: 0, correction: '$2 \\times 6 = 12$ ، فالبسط $1 \\times 6 = 6$ .' },
              { label: '$\\frac{1}{3} =$', options: ['$\\frac{3}{12}$', '$\\frac{4}{12}$', '$\\frac{1}{12}$'], correct: 1, correction: '$3 \\times 4 = 12$ ، فالبسط $1 \\times 4 = 4$ .' },
              { label: '$\\frac{1}{4} =$', options: ['$\\frac{4}{12}$', '$\\frac{3}{12}$', '$\\frac{2}{12}$'], correct: 1, correction: '$4 \\times 3 = 12$ ، فالبسط $1 \\times 3 = 3$ .' },
              { label: '$\\frac{1}{6} =$', options: ['$\\frac{6}{12}$', '$\\frac{1}{12}$', '$\\frac{2}{12}$'], correct: 2, correction: '$6 \\times 2 = 12$ ، فالبسط $1 \\times 2 = 2$ .' },
              { label: '$\\frac{1}{12} =$', options: ['$\\frac{1}{12}$', '$\\frac{12}{12}$', '$\\frac{2}{12}$'], correct: 0, correction: 'المقام $12$ هو نفسه، فلا يتغيّر الكسر.' },
            ] },
          { kind: 'solution', ask: 0, lines: ['$\\frac{1}{2} = \\frac{6}{12}$ و $\\frac{1}{3} = \\frac{4}{12}$ و $\\frac{1}{4} = \\frac{3}{12}$ .', '$\\frac{1}{6} = \\frac{2}{12}$ و $\\frac{1}{12} = \\frac{1}{12}$ .'] },
        ],
      },
      {
        label: '2)', title: 'ترتيب البطاقات',
        question: 'رتّب البطاقات الخمس ترتيبًا تصاعديًا.',
        asks: ['الترتيب التصاعدي'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['muqarana-kasrayn-2am'], prompt: 'البسط في الكسور الخمسة هو $1$ ، فالكسر الأكبر هو ذو المقام:', options: ['الأصغر', 'الأكبر'], correct: 0,
            explain: 'عند البسط نفسه، كلّما صغر المقام كبرت القطعة: النصف أكبر من الثلث.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-kasrayn-2am'], prompt: 'الترتيب من الأصغر إلى الأكبر:',
            options: ['$\\frac{1}{12} < \\frac{1}{6} < \\frac{1}{4} < \\frac{1}{3} < \\frac{1}{2}$', '$\\frac{1}{2} < \\frac{1}{3} < \\frac{1}{4} < \\frac{1}{6} < \\frac{1}{12}$', '$\\frac{1}{12} < \\frac{1}{4} < \\frac{1}{6} < \\frac{1}{3} < \\frac{1}{2}$'], correct: 0, cols: 1,
            explain: 'بالمقام $12$ : $1 < 2 < 3 < 4 < 6$ . الخطأ الثاني رتّبها تنازليًا، والثالث بدّل الربع والسدس ($\\frac{3}{12} > \\frac{2}{12}$).' },
          { kind: 'solution', ask: 0, lines: ['بالمقام $12$ البسوط $6 , 4 , 3 , 2 , 1$ .', 'الترتيب التصاعدي: $\\frac{1}{12} < \\frac{1}{6} < \\frac{1}{4} < \\frac{1}{3} < \\frac{1}{2}$ .'] },
        ],
      },
      {
        label: '3)', title: 'أربع بطاقات مجموعها 1',
        question: 'اختر أربع بطاقات مجموع كسورها يساوي $1$ .',
        asks: ['الأربع بطاقات'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: 'مجموع بسوط البطاقات الخمس بالمقام $12$ : $6 + 4 + 3 + 2 + 1 =$', expected: 16, explain: '$6 + 4 = 10$ ثم $13$ ثم $15$ ثم $16$ .' },
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: 'نريد المجموع $\\frac{12}{12}$ ، فنُسقط بطاقة بسطها:', expected: 4, explain: '$16 - 12 = 4$ : نُسقط البطاقة التي بسطها $4$ ، أي $\\frac{1}{3}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'البطاقات الأربع هي:',
            options: ['$\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12} = \\frac{12}{12}$', '$\\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4} + \\frac{1}{12} = \\frac{14}{12}$', '$\\frac{1}{3} + \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12} = \\frac{10}{12}$'], correct: 0, cols: 1,
            explain: 'بإسقاط $\\frac{1}{3}$ نجد $6 + 3 + 2 + 1 = 12$ ، أي $1$ . الخطآن الآخران مجموعهما $\\frac{14}{12}$ و $\\frac{10}{12}$ .' },
          { kind: 'solution', ask: 0, lines: ['مجموع البطاقات الخمس $\\frac{16}{12}$ ، ونريد $\\frac{12}{12}$ فنُسقط $\\frac{4}{12} = \\frac{1}{3}$ .', 'الأربع: $\\frac{6}{12} + \\frac{3}{12} + \\frac{2}{12} + \\frac{1}{12} = \\frac{12}{12} = 1$ .'] },
        ],
      },
      {
        label: '4)', title: 'ثلاث بطاقات مجموعها 1',
        question: 'هل توجد ثلاث بطاقات مجموعها $1$ ؟ اذكرها.',
        asks: ['الثلاث بطاقات'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'نعم، وهي:',
            options: ['$\\frac{1}{2} + \\frac{1}{3} + \\frac{1}{6} = \\frac{6}{12} + \\frac{4}{12} + \\frac{2}{12} = 1$', '$\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{6} = \\frac{11}{12}$', '$\\frac{1}{3} + \\frac{1}{4} + \\frac{1}{6} = \\frac{9}{12}$'], correct: 0, cols: 1,
            explain: 'نبحث عن ثلاثة بسوط مجموعها $12$ من $6, 4, 3, 2, 1$ : هي $6 + 4 + 2$ . الخطآن مجموعهما $\\frac{11}{12}$ و $\\frac{9}{12}$ .' },
          { kind: 'solution', ask: 0, lines: ['نبحث عن ثلاثة من البسوط $6 , 4 , 3 , 2 , 1$ مجموعها $12$ .', 'هي $6 + 4 + 2 = 12$ ، أي $\\frac{1}{2} + \\frac{1}{3} + \\frac{1}{6} = 1$ .'] },
        ],
      },
      {
        label: '5)', title: 'مجموع البطاقات الخمس',
        question: 'بكم يزيد مجموع البطاقات الخمس على $1$ ؟',
        asks: ['زيادة المجموع على 1'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'المجموع $\\frac{16}{12}$ والزيادة على $1$ :',
            options: ['$\\frac{16}{12} - 1 = \\frac{4}{12} = \\frac{1}{3}$', '$\\frac{16}{12}$', '$\\frac{1}{12}$'], correct: 0, cols: 1,
            explain: '$\\frac{16}{12} - \\frac{12}{12} = \\frac{4}{12} = \\frac{1}{3}$ : هي البطاقة التي أُسقطت.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{16}{12} - 1 = \\frac{16}{12} - \\frac{12}{12} = \\frac{4}{12}$ .', 'تزيد على $1$ بـ $\\frac{1}{3}$ ، وهي البطاقة التي أُسقطت.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — قماش الستائر',
    context: 'قسمة إقليدية ثم قسمة على عدد عشري وحصرها',
    emoji: '🪟',
    source: SOURCE,
    tone: 'violet',
    illustration: { kind: 'tags', cards: [
      { title: 'لفّة القماش', icon: 'tile', lines: [{ label: 'الطول', value: 50, unit: 'm' }] },
      { title: 'الستارة', icon: 'tile', lines: [{ label: 'الطول', value: '2,6', unit: 'm' }, { label: 'المطلوب', value: 21, unit: 'ستارة' }] },
    ], ariaLabel: 'بطاقتان: لفّة قماش طولها 50 مترًا، وستارة طولها 2,6 متر، والمطلوب 21 ستارة' },
    statement: 'لفّة قماش طولها $50\\,\\text{m}$ ، تُقصّ منها ستائر لأقسام المدرسة، طول كلّ ستارة $2{,}6\\,\\text{m}$ . تحتاج المدرسة $21$ ستارة.',
    data: [
      { id: 'roll', text: 'طول اللفّة: 50 m', useful: true },
      { id: 'cur', text: 'طول الستارة: 2,6 m', useful: true },
      { id: 'need', text: 'المطلوب: 21 ستارة', useful: true },
      { id: 'blue', text: 'القماش أزرق اللون', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القسمة الإقليدية بالديسيمتر',
        question: 'حوّل الطولين إلى الديسيمتر ثم اكتب القسمة الإقليدية للطول الأول على الثاني.',
        asks: ['القسمة الإقليدية للطولين'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['kasr-hasil-qisma-2am'], prompt: '$50\\,\\text{m} =$ ... $\\text{dm}$ :', expected: 500, explain: 'المتر عشرة ديسيمترات: $50 \\times 10 = 500$ ، و $2{,}6\\,\\text{m} = 26\\,\\text{dm}$ .' },
          { kind: 'numeric', role: 'compute', requires: ['qisma-iqlidiya-hasr-2am'], prompt: '$26 \\times 19 =$', expected: 494, explain: '$26 \\times 20 = 520$ ثم $520 - 26 = 494$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qisma-iqlidiya-hasr-2am'], prompt: 'القسمة الإقليدية لـ $500$ على $26$ :',
            options: ['$500 = 26 \\times 19 + 6$', '$500 = 26 \\times 18 + 32$', '$500 = 26 \\times 19 + 16$'], correct: 0, cols: 1,
            explain: '$494 + 6 = 500$ والباقي $6$ أصغر من $26$ . في الخطأ الثاني الباقي $32$ أكبر من القاسم، وفي الثالث $494 + 16 = 510 \\ne 500$ .' },
          { kind: 'solution', ask: 0, lines: ['$50\\,\\text{m} = 500\\,\\text{dm}$ و $2{,}6\\,\\text{m} = 26\\,\\text{dm}$ .', '$500 = 26 \\times 19 + 6$ مع $6 < 26$ .'] },
        ],
      },
      {
        label: '2)', title: 'الستائر الكاملة',
        question: 'كم ستارة كاملة تُقصّ؟ وكم مترًا يبقى من اللفّة؟',
        asks: ['عدد الستائر الكاملة', 'ما يبقى من القماش بالمتر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-iqlidiya-hasr-2am'], prompt: 'عدد الستائر الكاملة:', expected: 19, explain: 'حاصل القسمة الإقليدية $19$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qisma-iqlidiya-hasr-2am'], prompt: 'الباقي $6\\,\\text{dm}$ ، أي بالمتر:', expected: 0.6, display: '0,6', suffix: 'm', explain: 'الباقي $6\\,\\text{dm} = 0{,}6\\,\\text{m}$ .' },
          { kind: 'solution', ask: 0, lines: ['حاصل القسمة $19$ : تُقصّ $19$ ستارة كاملة.', 'الباقي $6\\,\\text{dm} = 0{,}6\\,\\text{m}$ .'] },
        ],
      },
      {
        label: '3)', title: 'حصر حاصل القسمة',
        question: 'احصر $\\frac{50}{2{,}6}$ إلى $0{,}1$ .',
        asks: ['حصر حاصل القسمة إلى 0,1'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['kasr-hasil-qisma-2am'], prompt: 'نكتب $\\frac{50}{2{,}6} = \\frac{500}{26}$ . ثم $26 \\times 19{,}2 =$', expected: 499.2, display: '499,2', explain: '$26 \\times 19 = 494$ و $26 \\times 0{,}2 = 5{,}2$ ، فالمجموع $499{,}2$ وهو أصغر من $500$ .' },
          { kind: 'numeric', role: 'compute', requires: ['kasr-hasil-qisma-2am'], prompt: 'و $26 \\times 19{,}3 =$', expected: 501.8, display: '501,8', explain: '$494 + 26 \\times 0{,}3 = 494 + 7{,}8 = 501{,}8$ وهو أكبر من $500$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-hasil-qisma-2am'], prompt: 'بما أنّ $499{,}2 < 500 < 501{,}8$ :',
            options: ['$19{,}2 < \\frac{50}{2{,}6} < 19{,}3$', '$19{,}1 < \\frac{50}{2{,}6} < 19{,}2$', '$19{,}3 < \\frac{50}{2{,}6} < 19{,}4$'], correct: 0, cols: 1,
            explain: 'قيمة مقرّبة بالنقصان $19{,}2$ وبالزيادة $19{,}3$ لأنّ ضرب $26$ في كلّ منهما يحيط بالعدد $500$ .' },
          { kind: 'solution', ask: 0, lines: ['$26 \\times 19{,}2 = 499{,}2 < 500 < 501{,}8 = 26 \\times 19{,}3$ .', '$19{,}2 < \\frac{50}{2{,}6} < 19{,}3$ .'] },
        ],
      },
      {
        label: '4)', title: 'هل تكفي اللفّة؟',
        question: 'هل تكفي اللفّة لـ $21$ ستارة؟ وكم مترًا ينقص؟',
        asks: ['هل تكفي اللفّة', 'ما ينقص من القماش'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jida-kasrayn-2am'], prompt: 'القماش اللازم لـ $21$ ستارة: $21 \\times 2{,}6 =$', expected: 54.6, display: '54,6', suffix: 'm', explain: '$20 \\times 2{,}6 = 52$ و $1 \\times 2{,}6 = 2{,}6$ ، فالمجموع $54{,}6$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-hasil-qisma-2am'], prompt: 'نقارن $54{,}6$ بطول اللفّة $50$ :',
            options: ['لا تكفي: $54{,}6 > 50$', 'تكفي: $21 < 50$', 'تكفي لأنّ $19$ ستارة كاملة قريبة من $21$'], correct: 0, cols: 1,
            explain: 'اللازم $54{,}6\\,\\text{m}$ أكبر من $50\\,\\text{m}$ فلا تكفي؛ وهذا يوافق أنّ $19{,}3 < 21$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam-tarh-kusur-2am'], prompt: 'الناقص: $54{,}6 - 50 =$', expected: 4.6, display: '4,6', suffix: 'm', explain: '$54{,}6 - 50 = 4{,}6$ .' },
          { kind: 'solution', ask: 0, lines: ['$21 \\times 2{,}6 = 54{,}6\\,\\text{m}$ وهو أكبر من $50\\,\\text{m}$ : اللفّة لا تكفي.', 'ينقص $54{,}6 - 50 = 4{,}6\\,\\text{m}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — تبرّعات المستويات',
    context: 'حصص من مبلغ، ترتيبها ومقدارها',
    emoji: '📚',
    source: SOURCE,
    tone: 'indigo',
    illustration: { kind: 'tags', cards: [
      { title: 'المبلغ المجموع', icon: 'coin', lines: [{ label: 'لتجهيز المكتبة', value: 9600, unit: 'DA' }] },
      { title: 'حصص المستويات', icon: 'book', lines: [{ label: 'الأولى', value: '3/8' }, { label: 'الثانية', value: '1/4' }, { label: 'الثالثة', value: '5/16' }] },
    ], ariaLabel: 'بطاقتان: المبلغ المجموع 9600 دينار، وحصص المستويات: الأولى ثلاثة أثمان والثانية ربع والثالثة خمسة أجزاء من ستة عشر، والرابعة الباقي' },
    statement: 'جمعت متوسطة $9600\\,\\text{DA}$ لتجهيز مكتبتها بالكتب: ساهم مستوى السنة الأولى بـ $\\frac{3}{8}$ من المبلغ، ومستوى الثانية بـ $\\frac{1}{4}$ ، ومستوى الثالثة بـ $\\frac{5}{16}$ ، وساهم مستوى الرابعة بالباقي.',
    data: [
      { id: 'total', text: 'المبلغ المجموع: 9600 DA', useful: true },
      { id: 'l1', text: 'السنة الأولى: 3/8 من المبلغ', useful: true },
      { id: 'l2', text: 'السنة الثانية: 1/4 من المبلغ', useful: true },
      { id: 'l3', text: 'السنة الثالثة: 5/16 من المبلغ', useful: true },
      { id: 'l4', text: 'السنة الرابعة: الباقي', useful: true },
      { id: 'shelf', text: 'الرفوف من خشب', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصّة المستوى الرابع',
        question: 'ما الكسر الذي ساهم به مستوى السنة الرابعة؟',
        asks: ['حصّة المستوى الرابع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: 'نكتب $\\frac{3}{8} = \\frac{?}{16}$ . البسط:', expected: 6, explain: '$8 \\times 2 = 16$ ، فالبسط $3 \\times 2 = 6$ .' },
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: 'و $\\frac{1}{4} = \\frac{?}{16}$ . البسط:', expected: 4, explain: '$4 \\times 4 = 16$ ، فالبسط $1 \\times 4 = 4$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: 'الثلاثة معًا $\\frac{6}{16} + \\frac{4}{16} + \\frac{5}{16} = \\frac{15}{16}$ ، فالرابعة:',
            options: ['$1 - \\frac{15}{16} = \\frac{1}{16}$', '$\\frac{15}{16}$', '$1 - \\frac{3}{4} = \\frac{1}{4}$'], correct: 0, cols: 1,
            explain: '$\\frac{16}{16} - \\frac{15}{16} = \\frac{1}{16}$ . و $\\frac{15}{16}$ هو مجموع الثلاثة لا الباقي.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{3}{8} = \\frac{6}{16}$ و $\\frac{1}{4} = \\frac{4}{16}$ و $\\frac{5}{16}$ ، فمجموعها $\\frac{15}{16}$ .', 'مستوى الرابعة ساهم بـ $1 - \\frac{15}{16} = \\frac{1}{16}$ .'] },
        ],
      },
      {
        label: '2)', title: 'ترتيب الحصص',
        question: 'رتّب الحصص الأربع من الأكبر إلى الأصغر.',
        asks: ['الترتيب التنازلي للحصص'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-kasrayn-2am'], prompt: 'بالمقام $16$ البسوط $6 , 4 , 5 , 1$ . الترتيب التنازلي:',
            options: ['$\\frac{3}{8} > \\frac{5}{16} > \\frac{1}{4} > \\frac{1}{16}$', '$\\frac{1}{16} > \\frac{1}{4} > \\frac{5}{16} > \\frac{3}{8}$', '$\\frac{5}{16} > \\frac{3}{8} > \\frac{1}{4} > \\frac{1}{16}$'], correct: 0, cols: 1,
            explain: '$6 > 5 > 4 > 1$ . الخطأ الثاني ترتيب تصاعدي، والثالث بدّل الحصّتين الأولى والثالثة.' },
          { kind: 'solution', ask: 0, lines: ['بالمقام $16$ : $\\frac{6}{16} , \\frac{4}{16} , \\frac{5}{16} , \\frac{1}{16}$ .', 'الترتيب: $\\frac{3}{8} > \\frac{5}{16} > \\frac{1}{4} > \\frac{1}{16}$ .'] },
        ],
      },
      {
        label: '3)', title: 'مبلغ كل مستوى',
        question: 'ما مبلغ كل مستوى بالدينار؟',
        asks: ['مبلغ السنة الأولى', 'مبلغ السنة الثانية', 'مبلغ السنة الثالثة', 'مبلغ السنة الرابعة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: '$\\frac{3}{8} \\times 9600 =$', expected: 3600, suffix: 'DA', explain: '$9600 \\div 8 = 1200$ ثم $1200 \\times 3 = 3600$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jida-kasrayn-2am'], prompt: '$\\frac{1}{4} \\times 9600 =$', expected: 2400, suffix: 'DA', explain: '$9600 \\div 4 = 2400$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['jida-kasrayn-2am'], prompt: '$\\frac{5}{16} \\times 9600 =$', expected: 3000, suffix: 'DA', explain: '$9600 \\div 16 = 600$ ثم $600 \\times 5 = 3000$ .' },
          { kind: 'numeric', role: 'answer', ask: 3, requires: ['jida-kasrayn-2am'], prompt: '$\\frac{1}{16} \\times 9600 =$', expected: 600, suffix: 'DA', explain: '$9600 \\div 16 = 600$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{3}{8} \\times 9600 = 3600$ و $\\frac{1}{4} \\times 9600 = 2400$ .', '$\\frac{5}{16} \\times 9600 = 3000$ و $\\frac{1}{16} \\times 9600 = 600$ ؛ المجموع $3600 + 2400 + 3000 + 600 = 9600$ .'] },
        ],
      },
      {
        label: '4)', title: 'أكثر من النصف؟',
        question: 'هل ساهم مستويا السنتين الأولى والثانية معًا بأكثر من نصف المبلغ؟',
        asks: ['المقارنة بالنصف'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jam-tarh-kusur-2am'], prompt: '$\\frac{3}{8} + \\frac{1}{4} = \\frac{3}{8} + \\frac{2}{8}$ . بسط المجموع:', expected: 5, explain: '$3 + 2 = 5$ ، فالمجموع $\\frac{5}{8}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-kasrayn-2am'], prompt: 'نقارن $\\frac{5}{8}$ بـ $\\frac{1}{2} = \\frac{4}{8}$ :',
            options: ['نعم: $\\frac{5}{8} > \\frac{1}{2}$', 'لا: $\\frac{5}{8} < \\frac{1}{2}$', 'لا: لأنّ المقام $8$ أكبر من $2$'], correct: 0, cols: 1,
            explain: '$5 > 4$ والمقام نفسه $8$ . ونتحقّق بالمبلغ: $3600 + 2400 = 6000 > 4800$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{3}{8} + \\frac{1}{4} = \\frac{5}{8}$ و $\\frac{1}{2} = \\frac{4}{8}$ .', 'نعم: $\\frac{5}{8} > \\frac{1}{2}$ ، وهما ساهما بـ $6000$ DA من $9600$ DA .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ورقة إجابات رياض',
    context: 'أحكم على حسابات زميل وأصحّحها',
    emoji: '📝',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'scene', icon: 'pen', bg: 'rose', chips: [{ label: 'عدد الإجابات', value: 5, tone: 'rose' }, { label: 'نقطة لكل إجابة صحيحة', value: 1, tone: 'green' }], ariaLabel: 'ورقة رياض: خمس إجابات تُمنح نقطة عن كل إجابة صحيحة' },
    statement: 'قدّم رياض ورقة بخمس إجابات: (a) $\\frac{2}{5} + \\frac{3}{10} = \\frac{5}{15}$ ، (b) $\\frac{3}{4} \\times \\frac{8}{9} = \\frac{2}{3}$ ، (c) $\\frac{4}{7} > \\frac{4}{5}$ ، (d) $3{,}14$ قيمة مقرّبة إلى $0{,}01$ بالنقصان لـ $\\frac{22}{7}$ ، (e) $125 = 9 \\times 12 + 17$ هي القسمة الإقليدية لـ $125$ على $9$ . يمنح الأستاذ نقطة عن كل إجابة صحيحة.',
    data: [
      { id: 'a', text: 'الإجابات الخمس (a) إلى (e)', useful: true },
      { id: 'mark', text: 'نقطة عن كل إجابة صحيحة', useful: true },
      { id: 'who', text: 'رياض تلميذ في القسم نفسه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صحيح أم خاطئ؟',
        question: 'احكم على كل إجابة من الإجابات الخمس.',
        asks: ['الحكم على الإجابات الخمس'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['jam-tarh-kusur-2am', 'jida-kasrayn-2am', 'muqarana-kasrayn-2am', 'kasr-hasil-qisma-2am', 'qisma-iqlidiya-hasr-2am'], prompt: 'اختر الحكم:',
            rows: [
              { label: '$\\frac{2}{5} + \\frac{3}{10} = \\frac{5}{15}$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'لا نجمع البسطين والمقامين: بالمقام $10$ ، $\\frac{4}{10} + \\frac{3}{10} = \\frac{7}{10}$ .' },
              { label: '$\\frac{3}{4} \\times \\frac{8}{9} = \\frac{2}{3}$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$\\frac{3 \\times 8}{4 \\times 9} = \\frac{24}{36} = \\frac{2}{3}$ .' },
              { label: '$\\frac{4}{7} > \\frac{4}{5}$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'البسط نفسه $4$ : الأكبر هو ذو المقام الأصغر، فـ $\\frac{4}{5} > \\frac{4}{7}$ .' },
              { label: '$3{,}14$ قيمة مقرّبة إلى $0{,}01$ بالنقصان لـ $\\frac{22}{7}$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$\\frac{22}{7} = 3{,}142\\ldots$ فهو بين $3{,}14$ و $3{,}15$ .' },
              { label: '$125 = 9 \\times 12 + 17$ هي القسمة الإقليدية لـ $125$ على $9$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'المساواة صحيحة لكنّ الباقي $17$ أكبر من القاسم $9$ ، فليست قسمة إقليدية.' },
            ] },
          { kind: 'solution', ask: 0, lines: ['(a) خطأ، (b) صحيح، (c) خطأ، (d) صحيح، (e) خطأ.', 'نتحقّق من كل واحدة بقاعدتها: الجمع بمقام مشترك، وضرب البسطين والمقامين، والبسط نفسه، وحصر حاصل القسمة، وباقي أصغر من القاسم.'] },
        ],
      },
      {
        label: '2)', title: 'تصحيح الخاطئة',
        question: 'ما القيمة الصحيحة في (a)؟ وما الحكم الصحيح بين $\\frac{4}{7}$ و $\\frac{4}{5}$ ؟ وما القسمة الإقليدية الصحيحة في (e)؟',
        asks: ['القيمة الصحيحة في (a)', 'المقارنة الصحيحة في (c)', 'القسمة الإقليدية الصحيحة في (e)'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-tarh-kusur-2am'], prompt: '$\\frac{2}{5} + \\frac{3}{10} =$', options: ['$\\frac{7}{10}$', '$\\frac{5}{15}$', '$\\frac{5}{10}$'], correct: 0, cols: 3,
            explain: 'بالمقام $10$ : $\\frac{4}{10} + \\frac{3}{10} = \\frac{7}{10}$ . و $\\frac{5}{15}$ جمع البسطين والمقامين.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['muqarana-kasrayn-2am'], prompt: 'بين $\\frac{4}{7}$ و $\\frac{4}{5}$ :', options: ['$\\frac{4}{5} > \\frac{4}{7}$', '$\\frac{4}{7} > \\frac{4}{5}$', '$\\frac{4}{7} = \\frac{4}{5}$'], correct: 0, cols: 3,
            explain: 'البسط نفسه $4$ : قطع الأخماس أكبر من قطع الأسباع، فالأكبر $\\frac{4}{5}$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['qisma-iqlidiya-hasr-2am'], prompt: 'القسمة الإقليدية لـ $125$ على $9$ :',
            options: ['$125 = 9 \\times 13 + 8$', '$125 = 9 \\times 12 + 17$', '$125 = 9 \\times 14 + 1$'], correct: 0, cols: 1,
            explain: '$9 \\times 13 = 117$ و $117 + 8 = 125$ مع $8 < 9$ . في الثاني الباقي $17$ أكبر من $9$ ، وفي الثالث $126 + 1 = 127 \\ne 125$ .' },
          { kind: 'solution', ask: 0, lines: ['(a) $\\frac{2}{5} + \\frac{3}{10} = \\frac{4}{10} + \\frac{3}{10} = \\frac{7}{10}$ ، و (c) $\\frac{4}{5} > \\frac{4}{7}$ .', '(e) $125 = 9 \\times 13 + 8$ مع $8 < 9$ .'] },
        ],
      },
      {
        label: '3)', title: 'نقطة رياض',
        question: 'ما نقطة رياض من 5؟',
        asks: ['نقطة رياض'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jida-kasrayn-2am'], prompt: 'عدد إجاباته الصحيحة، وهي (b) و (d):', expected: 2, explain: 'نقطة عن كل إجابة صحيحة، والصحيحتان (b) و (d): $2$ من $5$ .' },
          { kind: 'solution', ask: 0, lines: ['الإجابتان (b) و (d) صحيحتان.', 'نقطة رياض: $2$ من $5$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
