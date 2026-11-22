/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des quatre leçons de l'unité 1 (سلسلة دون أقواس، بأقواس، وصف سلسلة، توزيع الضرب),
 * résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Le programme de Fahrenheit de l'`integration` est REDESSINÉ (la distance de l'orage : le
 * Fahrenheit est déjà pris par la synthèse 3AM de l'unité 1) ; la situation 6 reprend le registre des quatre 3 de `deep-40` avec des nombres propres ; les autres sont de la plateforme.
 * Aucune notion nouvelle : ni fraction comme opération, ni nombre relatif, ni lettre hors d'un programme. Une réponse en expression se CHOISIT (le GuidedProblem saisit des nombres décimaux) ;
 * chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const B = 'silsila-bidun-aqwas-2am';
const A = 'silsila-bi-aqwas-2am';
const W = 'wasf-silsila-hisab-2am';
const T = 'tawzi-darb-jam-tarh-2am';

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — برنامج الرعد',
    context: 'برنامج حساب يقدّر بُعد العاصفة',
    emoji: '⛈️',
    source: src('integration', 20, 'أدمج تعلّماتي'),
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'برنامج الحساب', lines: [{ label: 'نضرب عدد الثواني في', value: '340' }, { label: 'ثم نقسم الناتج على', value: '1000' }] },
    ], ariaLabel: 'بطاقة برنامج الحساب: نضرب عدد الثواني في ثلاثمئة وأربعين ثم نقسم الناتج على ألف' },
    statement: 'نرى البرق قبل أن نسمع الرعد. لمعرفة بُعد العاصفة بالكيلومتر نعدّ الثواني بين البرق والرعد، ثم نضرب العدد في $340$ ، ثم نقسم الناتج على $1000$ (الصوت يقطع نحو $340\\,\\text{m}$ في الثانية، تقريبًا).',
    data: [
      { id: 'prog', text: 'البرنامج: نضرب عدد الثواني في 340 ثم نقسم الناتج على 1000', useful: true },
      { id: 'speed', text: 'الصوت يقطع نحو 340 m في الثانية', useful: true },
      { id: 'unit', text: 'النتيجة بالكيلومتر', useful: true },
      { id: 'cloud', text: 'السماء ملبّدة بغيوم رمادية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تطبيق البرنامج',
        question: 'عدّ حمزة $6$ ثوانٍ بين البرق والرعد. كم يبعد البرق بالكيلومتر؟',
        asks: ['بُعد البرق'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: '$6 \\times 340 \\div 1000 =$', expected: 2.04, suffix: 'km', explain: '$6 \\times 340 = 2040$ ثم $2040 \\div 1000 = 2{,}04$ .' },
          { kind: 'solution', ask: 0, lines: ['السلسلة $6 \\times 340 \\div 1000$ : نحسب من اليسار إلى اليمين.', '$6 \\times 340 = 2040$ و $2040 \\div 1000 = 2{,}04$ : البرق على بعد $2{,}04\\,\\text{km}$ .'] },
        ],
      },
      {
        label: '2)', title: 'وصف السلسلة',
        question: 'كيف نصف السلسلة $6 \\times 340 \\div 1000$ بجملة؟',
        asks: ['وصف السلسلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [W], prompt: 'آخر عملية تُنجز في السلسلة هي القسمة، فهي ...',
            options: ['حاصل قسمة جداء العددين $6$ و $340$ على العدد $1000$', 'جداء العدد $6$ وحاصل قسمة $340$ على $1000$', 'مجموع جداء العددين $6$ و $340$ والعدد $1000$'], correct: 0, cols: 1,
            explain: 'آخر عملية تُنجز هي التي تسمّي السلسلة: قسمة المقسوم $6 \\times 340$ على القاسم $1000$ . الجملة الثانية سمّتها جداءً وهي لم تنجز الضرب أخيرًا، والثالثة سمّتها مجموعًا.' },
          { kind: 'solution', ask: 0, lines: ['العمليتان ضرب ثم قسمة، والأخيرة هي القسمة.', 'فالسلسلة حاصل قسمة جداء العددين $6$ و $340$ على العدد $1000$ .'] },
        ],
      },
      {
        label: '3)', title: 'هل يلزم ترتيب آخر؟',
        question: 'هل يلزم ترتيب آخر للعمليات أو أقواس لحساب هذه السلسلة؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [B], prompt: 'نقرّر:',
            options: ['لا: فيها ضرب وقسمة فقط، نحسبهما من اليسار إلى اليمين', 'نعم: القسمة تسبق الضرب لأنّها أصعب', 'نعم: لا بدّ من قوسين حول $6 \\times 340$ وإلّا اختلفت القيمة'], correct: 0, cols: 1,
            explain: 'الضرب والقسمة لهما الأولوية نفسها فنحسبهما بترتيب كتابتهما. وضع قوسين حول $6 \\times 340$ لا يغيّر شيئًا هنا، وكذلك $6 \\times (340 \\div 1000)$ تعطي القيمة نفسها $2{,}04$ في هذه السلسلة بالذات.' },
          { kind: 'solution', ask: 0, lines: ['الضرب والقسمة أولويتهما واحدة، فنحسب من اليسار إلى اليمين.', 'لا حاجة إلى أقواس، والقيمة $2{,}04$ .'] },
        ],
      },
      {
        label: '4)', title: 'استعمال البرنامج في الاتجاه المعاكس',
        question: 'تقول نسرين إنّ العاصفة على بعد $1{,}7\\,\\text{km}$ . كم ثانية عدّت؟',
        asks: ['عدد الثواني'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: 'عدد الثواني الذي يعطي بعد البرنامج $1{,}7$ هو:', expected: 5, suffix: 's', explain: '$1{,}7 \\times 1000 = 1700$ ثم $1700 \\div 340 = 5$ ؛ نتحقّق: $5 \\times 340 \\div 1000 = 1{,}7$ .' },
          { kind: 'solution', ask: 0, lines: ['نعكس البرنامج: $1{,}7 \\times 1000 = 1700$ ثم $1700 \\div 340 = 5$ .', 'نتحقّق: $5 \\times 340 \\div 1000 = 1{,}7$ ، فعدّت نسرين $5$ ثوانٍ.'] },
        ],
      },
      {
        label: '5)', title: 'قرار',
        question: 'يُنصح بالابتعاد عن المكان المفتوح إذا كانت العاصفة على أقلّ من $3\\,\\text{km}$ . عدّت ليلى $9$ ثوانٍ: هل تبتعد؟',
        asks: ['القرار'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [B], prompt: '$9 \\times 340 \\div 1000 =$', expected: 3.06, suffix: 'km', explain: '$9 \\times 340 = 3060$ ثم $3060 \\div 1000 = 3{,}06$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [B], prompt: 'نقارن $3{,}06$ بالعدد $3$ :',
            options: ['ليس بعد: $3{,}06$ أكبر من $3$ ، لكنّها قريبة فتواصل المراقبة', 'نعم: $3{,}06$ قريب جدًّا من $3$ فهو أقلّ منه', 'نعم: تسع ثوانٍ عدد كبير'], correct: 0, cols: 1,
            explain: 'الابتعاد يكون إذا كان البعد أقلّ من $3$ ، و $3{,}06 > 3$ . قرب العدد من $3$ لا يجعله أقلّ منه.' },
          { kind: 'solution', ask: 0, lines: ['البعد $9 \\times 340 \\div 1000 = 3{,}06\\,\\text{km}$ .', '$3{,}06 > 3$ : العاصفة ليست بعدُ أقلّ من $3\\,\\text{km}$ ، فلا تبتعد ليلى الآن وتواصل المراقبة.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — قفّة السوق',
    context: 'ترجمة مشتريات إلى سلسلة بأقواس',
    emoji: '🧺',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'tags', cards: [
      { title: 'الطماطم', lines: [{ label: '3 كيلوغرامات', value: '⁦80 DA⁩ للكيلوغرام' }] },
      { title: 'البطاطا', lines: [{ label: '2 كيلوغرامين', value: '⁦60 DA⁩ للكيلوغرام' }] },
      { title: 'ما دُفع', lines: [{ label: 'ورقة نقدية', value: '⁦500 DA⁩' }] },
    ], ariaLabel: 'ثلاث بطاقات: ثلاثة كيلوغرامات من الطماطم بثمانين دينارًا للكيلوغرام، وكيلوغرامان من البطاطا بستين دينارًا للكيلوغرام، وورقة نقدية بخمسمئة دينار' },
    statement: 'اشترت أمّ يونس $3\\,\\text{kg}$ من الطماطم بـ $80\\,\\mathrm{DA}$ للكيلوغرام و $2\\,\\text{kg}$ من البطاطا بـ $60\\,\\mathrm{DA}$ للكيلوغرام، ودفعت ورقة نقدية من $500\\,\\mathrm{DA}$ .',
    data: [
      { id: 'tom', text: '3 كيلوغرامات طماطم بـ 80 DA للكيلوغرام', useful: true },
      { id: 'pot', text: '2 كيلوغرامين بطاطا بـ 60 DA للكيلوغرام', useful: true },
      { id: 'note', text: 'دفعت ورقة نقدية من 500 DA', useful: true },
      { id: 'bag', text: 'وضعت المشتريات في قفّة من الحلفاء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ترجمة الوضعية',
        question: 'أيّ سلسلة تعطي ما بقي لها من النقود؟',
        asks: ['السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [A], prompt: 'ما بقي = النقود − ثمن المشتريات كلّها:',
            options: ['$500 - (3 \\times 80 + 2 \\times 60)$', '$500 - 3 \\times 80 + 2 \\times 60$', '$(500 - 3) \\times 80 + 2 \\times 60$'], correct: 0, cols: 1,
            explain: 'ثمن المشتريات هو مجموع ثمني الطماطم والبطاطا، ويُطرح كلّه من $500$ فيلزم قوسان. الثانية طرحت ثمن الطماطم وحده وأضافت ثمن البطاطا (تقرأ القوسين زينة)، والثالثة طرحت $3$ من النقود.' },
          { kind: 'solution', ask: 0, lines: ['ثمن المشتريات $3 \\times 80 + 2 \\times 60$ ، ويُحسب أوّلًا.', 'فالسلسلة $500 - (3 \\times 80 + 2 \\times 60)$ .'] },
        ],
      },
      {
        label: '2)', title: 'ما بقي',
        question: 'كم دينارًا بقي لأمّ يونس؟',
        asks: ['ما بقي'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [A], prompt: 'ثمن المشتريات: $3 \\times 80 + 2 \\times 60 =$', expected: 360, suffix: 'DA', explain: '$240 + 120 = 360$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [A], prompt: '$500 - 360 =$', expected: 140, suffix: 'DA', explain: '$500 - 360 = 140$ .' },
          { kind: 'solution', ask: 0, lines: ['ما بين القوسين: $3 \\times 80 + 2 \\times 60 = 240 + 120 = 360$ .', 'ما بقي: $500 - 360 = 140\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '3)', title: 'الكتابة دون أقواس',
        question: 'كيف نكتب السلسلة دون أقواس بحيث تبقى صحيحة؟',
        asks: ['السلسلة دون أقواس'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [A], prompt: 'نطرح الثمنين واحدًا بعد الآخر:',
            options: ['$500 - 3 \\times 80 - 2 \\times 60$', '$500 - 3 \\times 80 + 2 \\times 60$', '$500 - 3 - 80 - 2 - 60$'], correct: 0, cols: 1,
            explain: 'طرح مجموع ثمنين يساوي طرحهما واحدًا بعد الآخر: $500 - 240 - 120 = 140$ . الثانية تعطي $380$ لأنّها أضافت ثمن البطاطا، والثالثة طرحت الأعداد مفردة فأهملت الضرب.' },
          { kind: 'solution', ask: 0, lines: ['$500 - 240 = 260$ ثم $260 - 120 = 140$ .', 'القيمة نفسها $140$ : $500 - 3 \\times 80 - 2 \\times 60$ تعطي ما بقي.'] },
        ],
      },
      {
        label: '4)', title: 'هل يكفي؟',
        question: 'هل يكفي ما بقي لشراء $2\\,\\text{kg}$ من البصل بـ $65\\,\\mathrm{DA}$ للكيلوغرام؟',
        asks: ['القرار'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [B], prompt: 'ثمن البصل: $2 \\times 65 =$', expected: 130, suffix: 'DA', explain: '$2 \\times 65 = 130$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [B], prompt: 'نقارن $130$ بما بقي ($140$) :',
            options: ['نعم: $130 < 140$ ويبقى $10\\,\\mathrm{DA}$', 'لا: $130$ أكبر من $140$', 'لا: لأنّ البصل أغلى من الطماطم'], correct: 0, cols: 1,
            explain: '$130 < 140$ فالمبلغ يكفي، ويبقى $140 - 130 = 10$ دنانير.' },
          { kind: 'solution', ask: 0, lines: ['ثمن البصل $2 \\times 65 = 130\\,\\mathrm{DA}$ .', '$130 < 140$ : يكفي الباقي ويبقى $10\\,\\mathrm{DA}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — معدّل سمير',
    context: 'معدّل بخطّ كسر وحجزه على الآلة',
    emoji: '🧮',
    source: SOURCE,
    tone: 'violet',
    illustration: { kind: 'tags', cards: [
      { title: 'علامات سمير', lines: [{ label: 'الفرض الأول', value: '13' }, { label: 'الفرض الثاني', value: '15,5' }, { label: 'الفرض الثالث', value: '12' }] },
    ], ariaLabel: 'بطاقة علامات سمير في ثلاثة فروض: ثلاثة عشر وخمسة عشر ونصف واثنا عشر' },
    statement: 'علامات سمير في ثلاثة فروض: $13$ و $15{,}5$ و $12$ . معدّله هو مجموع علاماته مقسومًا على $3$ . حجز سمير على آلته: $13 + 15{,}5 + 12 \\div 3 =$',
    data: [
      { id: 'marks', text: 'العلامات 13 و 15,5 و 12', useful: true },
      { id: 'rule', text: 'المعدّل = المجموع مقسومًا على 3', useful: true },
      { id: 'keys', text: 'ما حجزه سمير على الآلة', useful: true },
      { id: 'room', text: 'الفروض أُجريت في قاعة الدرس', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المعدّل',
        question: 'ما السلسلة التي تعطي المعدّل بخطّ كسر؟ وما قيمته؟',
        asks: ['السلسلة', 'المعدّل'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [A], prompt: 'المجموع كلّه في البسط و $3$ في المقام:',
            options: ['$\\dfrac{13 + 15{,}5 + 12}{3}$', '$13 + 15{,}5 + \\dfrac{12}{3}$', '$13 + 15{,}5 + 12 - 3$'], correct: 0, cols: 1,
            explain: 'خطّ الكسر يجمع البسط كلّه: نقسم المجموع $13 + 15{,}5 + 12$ على $3$ . الثانية قسمت العلامة الأخيرة وحدها (خطّ الكسر لا يقسم الحدّ الأخير فقط)، والثالثة طرحت $3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [A], prompt: '$\\dfrac{13 + 15{,}5 + 12}{3} = \\dfrac{40{,}5}{3} =$', expected: 13.5, explain: '$13 + 15{,}5 + 12 = 40{,}5$ و $40{,}5 \\div 3 = 13{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['البسط: $13 + 15{,}5 + 12 = 40{,}5$ ، والمقام $3$ .', 'المعدّل $40{,}5 \\div 3 = 13{,}5$ .'] },
        ],
      },
      {
        label: '2)', title: 'ما ظهر على الآلة',
        question: 'ما العدد الذي ظهر على آلة سمير؟',
        asks: ['العدد الظاهر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [B], prompt: 'الآلة تحسب القسمة أوّلًا: $12 \\div 3 =$', expected: 4, explain: '$12 \\div 3 = 4$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: '$13 + 15{,}5 + 4 =$', expected: 32.5, explain: '$13 + 15{,}5 = 28{,}5$ ثم $28{,}5 + 4 = 32{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['الآلة تطبّق الأولوية: $12 \\div 3 = 4$ أوّلًا.', 'ثم $13 + 15{,}5 + 4 = 32{,}5$ ، وهو ليس المعدّل.'] },
        ],
      },
      {
        label: '3)', title: 'الحجز الصحيح',
        question: 'ما الحجز الصحيح على الآلة؟',
        asks: ['الحجز'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [A], prompt: 'نحجز المجموع بين قوسين ثم نقسم:',
            options: ['$( 13 + 15{,}5 + 12 ) \\div 3 =$', '$13 + 15{,}5 + ( 12 \\div 3 ) =$', '$13 + 15{,}5 + 12 \\div 3 =$'], correct: 0, cols: 1,
            explain: 'الآلة لا ترى خطّ الكسر، فنضع المجموع بين قوسين قبل القسمة. الثانية والثالثة تقسمان العلامة الأخيرة وحدها وتعطيان $32{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['القوسان يجعلان الجمع أوّلًا: $( 13 + 15{,}5 + 12 ) = 40{,}5$ .', 'ثم $\\div 3 =$ فيظهر المعدّل $13{,}5$ .'] },
        ],
      },
      {
        label: '4)', title: 'بعد فرض رابع',
        question: 'نال سمير $17$ في فرض رابع. ما معدّله الجديد؟ وهل تحسّن معدّله؟',
        asks: ['المعدّل الجديد', 'الحكم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [A], prompt: '$\\dfrac{13 + 15{,}5 + 12 + 17}{4} = \\dfrac{57{,}5}{4} =$', expected: 14.375, explain: '$13 + 15{,}5 + 12 + 17 = 57{,}5$ و $57{,}5 \\div 4 = 14{,}375$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [B], prompt: 'نقارن $14{,}375$ بالمعدّل السابق $13{,}5$ :',
            options: ['تحسّن: $14{,}375 > 13{,}5$', 'لم يتحسّن: $14{,}375 < 13{,}5$', 'لم يتغيّر'], correct: 0, cols: 1,
            explain: '$14{,}375 > 13{,}5$ لأنّ الجزء الصحيح $14$ أكبر من $13$ .' },
          { kind: 'solution', ask: 0, lines: ['المجموع الجديد $57{,}5$ والمقام $4$ : المعدّل $57{,}5 \\div 4 = 14{,}375$ .', '$14{,}375 > 13{,}5$ : تحسّن معدّل سمير.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — فاتورة الكهربائي',
    context: 'كتابة فاتورة من وصفها ومقارنة عرضين',
    emoji: '🔌',
    source: SOURCE,
    tone: 'amber',
    illustration: { kind: 'tags', cards: [
      { title: 'الكهربائي الأوّل', lines: [{ label: 'التنقّل', value: '⁦800 DA⁩' }, { label: 'كلّ ساعة عمل', value: '⁦450 DA⁩' }] },
      { title: 'الكهربائي الثاني', lines: [{ label: 'التنقّل', value: '⁦1200 DA⁩' }, { label: 'كلّ ساعة عمل', value: '⁦350 DA⁩' }] },
    ], ariaLabel: 'بطاقتان: الكهربائي الأوّل يطلب ثمانمئة دينار للتنقّل وأربعمئة وخمسين دينارًا لكلّ ساعة، والثاني ألفًا ومئتين للتنقّل وثلاثمئة وخمسين لكلّ ساعة' },
    statement: 'يطلب كهربائي $800\\,\\mathrm{DA}$ للتنقّل و $450\\,\\mathrm{DA}$ لكلّ ساعة عمل. ويطلب كهربائي آخر $1200\\,\\mathrm{DA}$ للتنقّل و $350\\,\\mathrm{DA}$ لكلّ ساعة.',
    data: [
      { id: 'a', text: 'الأوّل: 800 DA للتنقّل و 450 DA لكلّ ساعة', useful: true },
      { id: 'b', text: 'الثاني: 1200 DA للتنقّل و 350 DA لكلّ ساعة', useful: true },
      { id: 'time', text: 'مدّة العمل المقصودة بالساعات', useful: true },
      { id: 'tools', text: 'يحمل الكهربائي صندوق أدواته', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'فاتورة الأوّل لثلاث ساعات',
        question: 'ما السلسلة التي تعطي ثمن $3$ ساعات عند الأوّل؟ وما قيمتها؟',
        asks: ['السلسلة', 'الثمن'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [A], prompt: 'التنقّل مرّة واحدة والساعة تتكرّر $3$ مرّات:',
            options: ['$800 + 450 \\times 3$', '$(800 + 450) \\times 3$', '$800 \\times 450 + 3$'], correct: 0, cols: 1,
            explain: 'التنقّل يُدفع مرّة واحدة، والساعات الثلاث تُضرب في ثمن الساعة. الثانية تضاعف التنقّل ثلاث مرّات (قوسان في غير موضعهما)، والثالثة ضربت التنقّل في ثمن الساعة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [B], prompt: '$800 + 450 \\times 3 =$', expected: 2150, suffix: 'DA', explain: 'الضرب أوّلًا: $450 \\times 3 = 1350$ ثم $800 + 1350 = 2150$ .' },
          { kind: 'solution', ask: 0, lines: ['$450 \\times 3 = 1350$ ثم $800 + 1350 = 2150$ .', 'ثمن ثلاث ساعات عند الأوّل $2150\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '2)', title: 'وصف السلسلة',
        question: 'كيف نصف السلسلة $800 + 450 \\times 3$ بجملة؟',
        asks: ['وصف السلسلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [W], prompt: 'آخر عملية تُنجز هي الجمع، فالسلسلة ...',
            options: ['مجموع العدد $800$ وجداء العددين $450$ و $3$', 'جداء مجموع العددين $800$ و $450$ في العدد $3$', 'مجموع الأعداد $800$ و $450$ و $3$'], correct: 0, cols: 1,
            explain: 'الجمع هو آخر ما يُنجز فالسلسلة مجموع، وحدّاه $800$ وجداء $450$ و $3$ . الثانية سمّتها جداءً (سمّتها بأوّل عملية)، والثالثة نسيت الضرب.' },
          { kind: 'solution', ask: 0, lines: ['الضرب $450 \\times 3$ يُنجز أوّلًا ثم الجمع في الأخير.', 'فهي مجموع العدد $800$ وجداء العددين $450$ و $3$ .'] },
        ],
      },
      {
        label: '3)', title: 'فاتورة الثاني',
        question: 'كم يطلب الكهربائي الثاني مقابل $3$ ساعات؟',
        asks: ['الثمن'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: '$1200 + 350 \\times 3 =$', expected: 2250, suffix: 'DA', explain: '$350 \\times 3 = 1050$ ثم $1200 + 1050 = 2250$ .' },
          { kind: 'solution', ask: 0, lines: ['$350 \\times 3 = 1050$ ثم $1200 + 1050 = 2250$ .', 'ثلاث ساعات عند الثاني $2250\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '4)', title: 'عمل من 5 ساعات',
        question: 'كم يطلب كلّ كهربائي لعمل يدوم $5$ ساعات؟',
        asks: ['ثمن الأوّل', 'ثمن الثاني'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: 'الأوّل: $800 + 450 \\times 5 =$', expected: 3050, suffix: 'DA', explain: '$450 \\times 5 = 2250$ ثم $800 + 2250 = 3050$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [B], prompt: 'الثاني: $1200 + 350 \\times 5 =$', expected: 2950, suffix: 'DA', explain: '$350 \\times 5 = 1750$ ثم $1200 + 1750 = 2950$ .' },
          { kind: 'solution', ask: 0, lines: ['الأوّل: $800 + 450 \\times 5 = 800 + 2250 = 3050$ .', 'الثاني: $1200 + 350 \\times 5 = 1200 + 1750 = 2950$ .'] },
        ],
      },
      {
        label: '5)', title: 'أيّ العرضين أفضل؟',
        question: 'أيّ العرضين أفضل لعمل يدوم $5$ ساعات؟',
        asks: ['العرض الأفضل'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [B], prompt: 'نقارن $3050$ و $2950$ :',
            options: ['الثاني: $2950 < 3050$', 'الأوّل: لأنّ تنقّله أقلّ', 'الأوّلان متساويان'], correct: 0, cols: 1,
            explain: '$2950 < 3050$ فالثاني أرخص لخمس ساعات. التنقّل الأقلّ لا يكفي للحكم، لأنّ ثمن الساعة يتكرّر.' },
          { kind: 'solution', ask: 0, lines: ['$2950 < 3050$ .', 'العرض الثاني أفضل لعمل من خمس ساعات: يوفّر $100\\,\\mathrm{DA}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — دكّان الحيّ',
    context: 'حساب ذهني بتوزيع الضرب',
    emoji: '🏪',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'tags', cards: [
      { title: 'العصير', lines: [{ label: 'العلبة الواحدة', value: '⁦98 DA⁩' }, { label: 'عدد العلب', value: '25' }] },
      { title: 'الشريط', lines: [{ label: 'المتر الواحد', value: '⁦12,5 DA⁩' }, { label: 'الأحمر والأزرق بالمتر', value: '7 + 3' }] },
    ], ariaLabel: 'بطاقتان: علب العصير بثمانية وتسعين دينارًا للعلبة وخمس وعشرون علبة، والشريط باثني عشر دينارًا ونصف للمتر وسبعة أمتار حمراء وثلاثة زرقاء' },
    statement: 'يبيع صاحب دكّان الحيّ علب العصير بـ $98\\,\\mathrm{DA}$ للعلبة، فاشترى منه نادي المدرسة $25$ علبة. ويبيع الشريط الملوّن بـ $12{,}5\\,\\mathrm{DA}$ للمتر، فاشترى النادي $7\\,\\text{m}$ منه أحمر و $3\\,\\text{m}$ أزرق.',
    data: [
      { id: 'juice', text: '25 علبة عصير بـ 98 DA للعلبة', useful: true },
      { id: 'ribbon', text: 'شريط بـ 12,5 DA للمتر', useful: true },
      { id: 'len', text: '7 m أحمر و 3 m أزرق', useful: true },
      { id: 'shop', text: 'الدكّان قرب المسجد', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن العصير ذهنيًا',
        question: 'ما ثمن $25$ علبة عصير؟',
        asks: ['ثمن العصير'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: [T], prompt: '$98$ قريب من $100$ ، فنكتب $25 \\times 98 =$',
            options: ['$25 \\times (100 - 2)$', '$25 \\times 100 - 2$', '$25 \\times (100 + 2)$'], correct: 0, cols: 3,
            explain: '$98 = 100 - 2$ ويُضرب الفرق كلّه في $25$ . الثانية ضربت $100$ وحده في $25$ (وزّعت على الحدّ الأوّل فقط)، والثالثة كتبت $102$ .' },
          { kind: 'numeric', role: 'compute', requires: [T], prompt: '$25 \\times 100 =$', expected: 2500, explain: '$25 \\times 100 = 2500$ .' },
          { kind: 'numeric', role: 'compute', requires: [T], prompt: '$25 \\times 2 =$', expected: 50, explain: '$25 \\times 2 = 50$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [T], prompt: '$2500 - 50 =$', expected: 2450, suffix: 'DA', explain: '$25 \\times (100 - 2) = 25 \\times 100 - 25 \\times 2 = 2500 - 50 = 2450$ .' },
          { kind: 'solution', ask: 0, lines: ['$25 \\times 98 = 25 \\times (100 - 2) = 25 \\times 100 - 25 \\times 2$ .', '$= 2500 - 50 = 2450\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '2)', title: 'ثمن الشريط بطريقتين',
        question: 'ما ثمن الشريطين معًا؟ وما الكتابة التي تحسبه بضرب واحد؟',
        asks: ['ثمن الشريطين', 'الكتابة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [T], prompt: 'الأحمر: $12{,}5 \\times 7 =$', expected: 87.5, suffix: 'DA', explain: '$12{,}5 \\times 7 = 87{,}5$ .' },
          { kind: 'numeric', role: 'compute', requires: [T], prompt: 'الأزرق: $12{,}5 \\times 3 =$', expected: 37.5, suffix: 'DA', explain: '$12{,}5 \\times 3 = 37{,}5$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [T], prompt: 'الثمن كلّه: $87{,}5 + 37{,}5 =$', expected: 125, suffix: 'DA', explain: '$87{,}5 + 37{,}5 = 125$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [T], prompt: 'الطول كلّه $7 + 3$ أمتار بالثمن نفسه للمتر:',
            options: ['$12{,}5 \\times (7 + 3) = 12{,}5 \\times 10$', '$12{,}5 \\times 7 + 3$', '$12{,}5 + 7 \\times 3$'], correct: 0, cols: 1,
            explain: 'الثمن نفسه للمتر فنوزّع في الاتجاه المعاكس: $12{,}5 \\times 7 + 12{,}5 \\times 3 = 12{,}5 \\times (7 + 3) = 125$ . الثانية ضربت الأحمر وحده وأضافت $3$ ، والثالثة خلطت الأعداد.' },
          { kind: 'solution', ask: 0, lines: ['بطريقتين: $12{,}5 \\times 7 + 12{,}5 \\times 3 = 87{,}5 + 37{,}5 = 125$ .', 'أو $12{,}5 \\times (7 + 3) = 12{,}5 \\times 10 = 125\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '3)', title: 'المبلغ الكلّي',
        question: 'ما المبلغ الكلّي؟ وما اسم السلسلة $25 \\times 98 + 12{,}5 \\times (7 + 3)$ ؟',
        asks: ['المبلغ الكلّي', 'اسم السلسلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: '$2450 + 125 =$', expected: 2575, suffix: 'DA', explain: '$2450 + 125 = 2575$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [W], prompt: 'آخر عملية تُنجز في $25 \\times 98 + 12{,}5 \\times (7 + 3)$ هي الجمع، فهي ...',
            options: ['مجموع جداء العددين $25$ و $98$ وجداء العدد $12{,}5$ ومجموع العددين $7$ و $3$', 'جداء العدد $25$ ومجموع العددين $98$ و $12{,}5$ في $10$', 'جداء مجموع الأعداد كلّها'], correct: 0, cols: 1,
            explain: 'الجمع الذي بين الجداءين هو آخر ما يُنجز، فالسلسلة مجموع حدّاه جداءان. الثانية والثالثة سمّتاها جداءً.' },
          { kind: 'solution', ask: 0, lines: ['العصير $2450$ والشريط $125$ : $2450 + 125 = 2575$ .', 'المبلغ الكلّي $2575\\,\\mathrm{DA}$ ، والسلسلة مجموع جداءين.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ورقة زميلة',
    context: 'نحكم على حسابات زميلة ونصحّح',
    emoji: '📝',
    source: src('deep-40', 18, 'أتعمّق', 40),
    tone: 'rose',
    table: {
      head: ['الحساب', 'ما كتبته ريم'],
      rows: [['أ', '$18 - 6 + 2 = 10$'], ['ب', '$4 + 6 \\times 5 = 34$'], ['ج', '$\\dfrac{30 + 6}{10 - 4} = 6$'], ['د', '$7 \\times (8 + 2) = 7 \\times 8 + 2 = 58$'], ['هـ', '$5 \\times (12 - 3)$ جداء']],
      caption: 'ورقة ريم (لم تُوضع العلامات بعد)',
    },
    statement: 'كتبت ريم خمسة حسابات في ورقتها، ولم تضع المعلّمة العلامات بعد. تعطى علامة واحدة على كلّ حساب صحيح. ثم نتحدّى أنفسنا بأربع ثلاثات.',
    data: [
      { id: 'five', text: 'خمسة حسابات في الورقة', useful: true },
      { id: 'mark', text: 'علامة واحدة على كلّ حساب صحيح', useful: true },
      { id: 'goal', text: 'المطلوب الحكم ثم التصحيح', useful: true },
      { id: 'pen', text: 'كتبت ريم بقلم أزرق', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الحكم على الحسابات',
        question: 'احكم على كلّ حساب من حسابات ريم: صحيح أم خطأ؟',
        asks: ['الأحكام'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: [B],
            prompt: 'صحيح أم خطأ؟',
            rows: [
              { label: 'أ) $18 - 6 + 2 = 10$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الطرح والجمع من اليسار إلى اليمين: $18 - 6 = 12$ ثم $12 + 2 = 14$ ، لا $10$ .' },
              { label: 'ب) $4 + 6 \\times 5 = 34$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'الضرب أوّلًا: $6 \\times 5 = 30$ ثم $4 + 30 = 34$ .' },
              { label: 'ج) $\\dfrac{30 + 6}{10 - 4} = 6$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$36 \\div 6 = 6$ : البسط وحده والمقام وحده.' },
              { label: 'د) $7 \\times (8 + 2) = 7 \\times 8 + 2$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الضرب يوزَّع على الحدّين: $7 \\times 8 + 7 \\times 2 = 70$ ، لا $58$ .' },
              { label: 'هـ) $5 \\times (12 - 3)$ جداء', options: ['صحيح', 'خطأ'], correct: 0, correction: 'آخر عملية تُنجز هي الضرب، فهي جداء العدد $5$ والفرق $12 - 3$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: ['أ) خطأ، ب) صحيح، ج) صحيح، د) خطأ، هـ) صحيح.', 'نحكم بإنجاز الحساب بأنفسنا وفق الأولوية والأقواس.'] },
        ],
      },
      {
        label: '2)', title: 'التصحيح',
        question: 'ما القيمة الصحيحة في الحساب (أ)؟ وفي الحساب (د)؟',
        asks: ['قيمة أ', 'قيمة د'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: '$18 - 6 + 2 =$', expected: 14, explain: '$18 - 6 = 12$ ثم $12 + 2 = 14$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [T], prompt: '$7 \\times (8 + 2) = 7 \\times 8 + 7 \\times 2 =$', expected: 70, explain: '$56 + 14 = 70$ ؛ ونتحقّق: $7 \\times 10 = 70$ .' },
          { kind: 'solution', ask: 0, lines: ['(أ) خطأ ريم أنّها جمعت $6 + 2$ أوّلًا: الصواب $14$ .', '(د) نسيت ضرب الحدّ الثاني في $7$ : الصواب $70$ .'] },
        ],
      },
      {
        label: '3)', title: 'علامة ريم',
        question: 'ما علامة ريم من $5$ ؟',
        asks: ['العلامة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [B], prompt: 'عدد الحسابات الصحيحة (ب، ج، هـ):', expected: 3, suffix: '/ 5', explain: 'ثلاثة حسابات صحيحة وحسابان خطأ، فالعلامة $3$ من $5$ .' },
          { kind: 'solution', ask: 0, lines: ['الصحيحة: ب و ج و هـ، أي ثلاثة حسابات.', 'علامة ريم $3$ من $5$ .'] },
        ],
      },
      {
        label: '4)', title: 'تحدّي الأعداد الأربعة',
        question: 'باستعمال العدد $3$ أربع مرّات والعمليات والأقواس، أيّ سلسلة تساوي $1$ ؟ وأيّ سلسلة تساوي $10$ ؟',
        asks: ['السلسلة التي تساوي 1', 'السلسلة التي تساوي 10'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [A], prompt: 'قيمتها $1$ :',
            options: ['$(3 + 3) \\div (3 + 3)$', '$3 \\times 3 \\div 3 + 3$', '$3 + 3 \\div 3 + 3$', '$3 \\times 3 - 3 \\div 3$'], correct: 0, cols: 1,
            explain: '$6 \\div 6 = 1$ . الأخريات تساوي $6$ و $7$ و $8$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [B], prompt: 'قيمتها $10$ :',
            options: ['$3 \\times 3 + 3 \\div 3$', '$3 + 3 \\times 3 + 3$', '$(3 + 3) \\times 3 \\div 3$', '$3 \\times 3 + 3 - 3$'], correct: 0, cols: 1,
            explain: '$9 + 1 = 10$ . الأخريات تساوي $15$ و $6$ و $9$ .' },
          { kind: 'solution', ask: 0, lines: ['$(3 + 3) \\div (3 + 3) = 6 \\div 6 = 1$ .', '$3 \\times 3 + 3 \\div 3 = 9 + 1 = 10$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
