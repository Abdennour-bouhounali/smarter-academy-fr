/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des quatre leçons de l'unité 3 (قوى العدد 10, قواعد الحساب عليها,
 * الكتابة العلمية ورتبة القدر, قوة عدد نسبي), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). L'idée de l'ICT du manuel (le grain
 * sur l'échiquier, 2ⁿ) est REDESSINÉE en situation 1 ; celle de la « وضعية للتقويم » (les globules rouges) en situation 4 avec d'autres nombres ; les situations 2, 3, 5 et 6 sont
 * de la plateforme. Aucune notion nouvelle ; ni Pythagore, ni Thalès, ni fraction au-delà de l'unité 2. Une réponse en écriture scientifique se SAISIT en deux nombres
 * (a puis n) ; chaque nombre est recalculé dans ./problems.test.js (BigInt). Les grandeurs réelles sont introduites par « حوالي ».
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('ict', 53, 'أوظّف تكنولوجيات الإعلام والاتصال');
const S4 = src('evaluation', 52, 'وضعية للتقويم');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — رقعة القمح',
    context: 'قوى العدد 2 ورتبة القدر وكتلة كمية ضخمة',
    emoji: '♟️',
    source: S1,
    tone: 'amber',
    illustration: { kind: 'stacks', rows: [
      { icon: 'sack', count: 1, label: 'الخانة 1' },
      { icon: 'sack', count: 2, label: 'الخانة 2' },
      { icon: 'sack', count: 4, label: 'الخانة 3' },
    ], ariaLabel: 'ثلاثة صفوف من أكياس القمح: حبّة واحدة في الخانة الأولى وحبّتان في الثانية وأربع حبّات في الثالثة' },
    statement: 'في نادي الشطرنج بالمتوسطة رقعة من $64$ خانة. نضع حبّة قمح في الخانة الأولى، وحبّتين في الثانية، وأربعًا في الثالثة، ونضاعف هكذا حتى الخانة الأخيرة. كتلة حبّة القمح حوالي $0{,}04$ g .',
    data: [
      { id: 'cells', text: 'الرقعة من 64 خانة', useful: true },
      { id: 'rule', text: 'الخانة 1: 1 حبّة، الخانة 2: 2، الخانة 3: 4، ونضاعف', useful: true },
      { id: 'mass', text: 'كتلة الحبّة حوالي 0,04 g', useful: true },
      { id: 'day', text: 'النادي يجتمع يوم الثلاثاء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حبّات الخانة 11',
        question: 'كم حبّة في الخانة 11؟ اكتب العدد بقوة للعدد $2$ ثم بالأرقام.',
        asks: ['الأسّ في قوة العدد 2', 'عدد الحبّات'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwa-taarif'], prompt: 'الخانة 1 فيها $2^{0}$ ، والخانة 2 فيها $2^{1}$ ، والخانة 3 فيها $2^{2}$ . أسّ القوة في الخانة 11 هو:', expected: 10,
            explain: 'أسّ القوة أقل من رقم الخانة بواحد: $11 - 1 = 10$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['quwa-taarif'], prompt: '$2^{10} =$', expected: 1024, suffix: 'حبّة',
            explain: '$2^{10} = 2^{5} \\times 2^{5} = 32 \\times 32 = 1\\,024$ .' },
          { kind: 'solution', ask: 0, lines: ['الخانة $n$ فيها $2^{n-1}$ حبّة، وبالمضاعفة المتتالية: $1, 2, 4, 8, \\ldots$ .', 'الخانة 11 فيها $2^{10} = 1\\,024$ حبّة.'] },
        ],
      },
      {
        label: '2)', title: 'الخانة الأخيرة',
        question: 'ما أسّ القوة للعدد $2$ التي تعطي عدد الحبّات في الخانة 64؟',
        asks: ['الأسّ في الخانة 64'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwa-taarif'], prompt: 'الخانة 64 فيها $2^{n}$ حبّة، و $n =$', expected: 63, explain: 'الأسّ أقل من رقم الخانة بواحد: $64 - 1 = 63$ .' },
          { kind: 'solution', ask: 0, lines: ['الخانة 64 هي آخر خانة، وأسّ قوتها $64 - 1 = 63$ .', 'عدد حبّاتها $2^{63}$ ، وهو عدد ضخم لا نكتبه بالأرقام.'] },
        ],
      },
      {
        label: '3)', title: 'رتبة القدر',
        question: 'علمًا أنّ $2^{10} \\approx 10^{3}$ ، ما رتبة قدر $2^{60}$ ؟',
        asks: ['رتبة قدر 2^60'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['quwat-quwa-ashara'], prompt: 'نكتب $2^{60}$ بدلالة $2^{10}$ :', options: ['$2^{60} = (2^{10})^{6}$', '$2^{60} = 2^{10} \\times 6$', '$2^{60} = 2^{10} + 2^{50}$'], correct: 0,
            explain: 'الأسّ $60 = 10 \\times 6$ ، فنستعمل $(a^{m})^{n} = a^{m \\times n}$ : $2^{60} = (2^{10})^{6}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['rutbat-qadr', 'quwat-quwa-ashara'], prompt: 'إذن $2^{60} \\approx (10^{3})^{6}$ ، ورتبة قدره حوالي:', options: ['$10^{18}$', '$10^{9}$', '$10^{60}$'], correct: 0, cols: 3,
            explain: '$(10^{3})^{6} = 10^{3 \\times 6} = 10^{18}$ . الخطأ الثاني جمع الأسّين $3 + 6$ ، والثالث أبقى الأسّ $60$ دون تحويل.' },
          { kind: 'solution', ask: 0, lines: ['$2^{60} = (2^{10})^{6} \\approx (10^{3})^{6}$ .', '$(10^{3})^{6} = 10^{18}$ : رتبة قدر $2^{60}$ حوالي $10^{18}$ .'] },
        ],
      },
      {
        label: '4)', title: 'كتلة القمح كلّه',
        question: 'عدد الحبّات في الرقعة كلّها حوالي $1{,}8 \\times 10^{19}$ . ما كتلة القمح كلّه بالكيلوغرام؟ اكتبها كتابة علمية.',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ashara-salib'], prompt: 'كتلة الحبّة $0{,}04\\ \\mathrm{g}$ بالكيلوغرام ($1\\ \\mathrm{g} = 10^{-3}\\ \\mathrm{kg}$) هي:', options: ['$4 \\times 10^{-5}\\ \\mathrm{kg}$', '$4 \\times 10^{-2}\\ \\mathrm{kg}$', '$4 \\times 10^{-3}\\ \\mathrm{kg}$'], correct: 0, cols: 1,
            explain: '$0{,}04\\ \\mathrm{g} = 4 \\times 10^{-2} \\times 10^{-3}\\ \\mathrm{kg} = 4 \\times 10^{-5}\\ \\mathrm{kg}$ . الخطأ الثاني ترك الوحدة $\\mathrm{g}$ ، والثالث نسي العامل $10^{-2}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya', 'hasil-quwa-ashara'], prompt: 'الكتلة $= 1{,}8 \\times 10^{19} \\times 4 \\times 10^{-5} = (1{,}8 \\times 4) \\times 10^{n}$ : $a = 1{,}8 \\times 4 =$', expected: 7.2, display: '7,2',
            explain: '$1{,}8 \\times 4 = 7{,}2$ ، وهو من $1$ إلى أقل من $10$ فلا حاجة لتعديل.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasil-quwa-ashara'], prompt: 'والأسّ $n = 19 + (-5) =$', expected: 14, explain: 'في الجداء نجمع الأسّين: $19 - 5 = 14$ .' },
          { kind: 'solution', ask: 0, lines: ['$1{,}8 \\times 10^{19} \\times 4 \\times 10^{-5} = (1{,}8 \\times 4) \\times 10^{19 - 5}$ .', 'كتلة القمح $7{,}2 \\times 10^{14}\\ \\mathrm{kg}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — بكتيريا المخبر',
    context: 'تضاعف عشري: قوى العدد 10 وجداء قوتين ومقارنة',
    emoji: '🧪',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'timeline', icon: 'bottle', marks: [
      { label: 'بداية الملاحظة', value: '3 × 10²' },
      { label: 'بعد ساعة', value: '× 10' },
      { label: 'بعد 5 ساعات' },
    ], ariaLabel: 'خط زمني لعيّنة ماء: عند بداية الملاحظة ثلاثة في عشرة أُسّ اثنين بكتيريا، ثم يتضاعف العدد عشر مرّات كل ساعة' },
    statement: 'في مخبر لتحليل الماء يصير عدد البكتيريا في عيّنة عشرة أمثاله كل ساعة. عند بداية الملاحظة كان عددها $3 \\times 10^{2}$ .',
    data: [
      { id: 'start', text: 'العدد في البداية 3 × 10²', useful: true },
      { id: 'rule', text: 'يصير العدد عشرة أمثاله كل ساعة', useful: true },
      { id: 'goal', text: 'نريد بلوغ 10¹² بكتيريا', useful: true },
      { id: 'room', text: 'المخبر في الطابق الأرضي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بعد 5 ساعات',
        question: 'ما عدد البكتيريا بعد 5 ساعات؟ اكتبه على الشكل $a \\times 10^{n}$ .',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: 'بعد 5 ساعات نضرب $3 \\times 10^{2}$ في $10^{5}$ : العدد $a =$', expected: 3, explain: 'الضرب في $10^{5}$ لا يغيّر العدد $3$ ، بل يغيّر الأسّ.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasil-quwa-ashara'], prompt: 'والأسّ $n = 2 + 5 =$', expected: 7, explain: 'في الجداء نجمع الأسّين: $2 + 5 = 7$ .' },
          { kind: 'solution', ask: 0, lines: ['كل ساعة نضرب في $10$ ، وبعد 5 ساعات نضرب في $10^{5}$ .', '$3 \\times 10^{2} \\times 10^{5} = 3 \\times 10^{7}$ .'] },
        ],
      },
      {
        label: '2)', title: 'بعد h ساعة',
        question: 'ما عدد البكتيريا بعد $h$ ساعة؟',
        asks: ['العبارة بدلالة h'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasil-quwa-ashara', 'quwat-quwa-ashara'], prompt: 'العدد بعد $h$ ساعة هو:', options: ['$3 \\times 10^{2 + h}$', '$3 \\times 10^{2h}$', '$30^{h}$'], correct: 0, cols: 1,
            explain: 'نضرب $3 \\times 10^{2}$ في $10^{h}$ فنجمع الأسّين: $2 + h$ . في الثاني ضُرب الأسّ بدل جمعه (عند $h = 1$ يعطي $3 \\times 10^{2}$ لا $3 \\times 10^{3}$) ، والثالث يعطي $30$ عند $h = 1$ لا $3\\,000$ .' },
          { kind: 'solution', ask: 0, lines: ['بعد $h$ ساعة نضرب العدد الأوّل في $10^{h}$ .', '$3 \\times 10^{2} \\times 10^{h} = 3 \\times 10^{2 + h}$ .'] },
        ],
      },
      {
        label: '3)', title: 'متى نبلغ $10^{12}$ ؟',
        question: 'ما أوّل ساعة كاملة يبلغ فيها العدد $10^{12}$ على الأقل؟',
        asks: ['عدد الساعات'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hasil-quwa-ashara'], prompt: 'بعد 9 ساعات العدد $3 \\times 10^{n}$ : $n =$', expected: 11, explain: '$n = 2 + 9 = 11$ ، أي $3 \\times 10^{11}$ ، وهو أقل من $10^{12}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara', 'rutbat-qadr'], prompt: 'أوّل ساعة يبلغ فيها $3 \\times 10^{2 + h} \\ge 10^{12}$ ، فـ $h =$', expected: 10, suffix: 'ساعات',
            explain: 'عند $h = 10$ العدد $3 \\times 10^{12} \\ge 10^{12}$ ، وعند $h = 9$ هو $3 \\times 10^{11} < 10^{12}$ .' },
          { kind: 'solution', ask: 0, lines: ['بعد 9 ساعات: $3 \\times 10^{11} < 10^{12}$ .', 'بعد 10 ساعات: $3 \\times 10^{12} \\ge 10^{12}$ ، فالساعة العاشرة هي الأولى.'] },
        ],
      },
      {
        label: '4)', title: 'الساعة 8 والساعة 3',
        question: 'كم مرّة يكون العدد في الساعة 8 أكبر منه في الساعة 3؟',
        asks: ['عدد المرّات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: '$\\frac{3 \\times 10^{10}}{3 \\times 10^{5}} = 10^{n}$ : $n =$', expected: 5, explain: '$\\frac{3}{3} = 1$ و $\\frac{10^{10}}{10^{5}} = 10^{10 - 5} = 10^{5}$ .' },
          { kind: 'solution', ask: 0, lines: ['الساعة 8: $3 \\times 10^{10}$ ، والساعة 3: $3 \\times 10^{5}$ .', '$\\frac{3 \\times 10^{10}}{3 \\times 10^{5}} = 10^{5}$ : أكبر بمئة ألف مرّة.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — دفتر سلمى',
    context: 'أحكم على سطور زميلة وأصحّحها',
    emoji: '📒',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'scene', icon: 'pen', bg: 'rose', chips: [{ label: 'عدد السطور', value: 6, tone: 'rose' }, { label: 'نقطة لكل سطر صحيح', value: 1, tone: 'green' }], ariaLabel: 'دفتر سلمى: ستة سطور، ونقطة واحدة عن كل سطر صحيح' },
    statement: 'كتبت سلمى في دفترها ستة سطور: (a) $(-2)^{4} = -16$ ، (b) $10^{-3} = -1000$ ، (c) $10^{5} \\times 10^{3} = 10^{8}$ ، (d) الكتابة العلمية للعدد $45\\,000$ هي $45 \\times 10^{3}$ ، (e) رتبة قدر $6{,}7 \\times 10^{5}$ هي $7 \\times 10^{5}$ ، (f) $3^{-2} = \\frac{1}{9}$ . أعطها نقطة عن كل سطر صحيح.',
    data: [
      { id: 'lines', text: 'السطور الستة (a) إلى (f)', useful: true },
      { id: 'mark', text: 'نقطة عن كل سطر صحيح', useful: true },
      { id: 'who', text: 'سلمى تلميذة في القسم نفسه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صحيح أم خاطئ؟',
        question: 'احكم على كل سطر من السطور الستة.',
        asks: ['الحكم على السطور الستة'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['ishara-quwa', 'ashara-salib', 'hasil-quwa-ashara', 'kitaba-ilmiya', 'rutbat-qadr', 'quwa-salib'], prompt: 'اختر الحكم:',
            rows: [
              { label: '$(-2)^{4} = -16$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الأسّ زوجي فالناتج موجب: $(-2)^{4} = 16$ .' },
              { label: '$10^{-3} = -1000$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الأسّ السالب لا يعطي عددًا سالبًا: $10^{-3} = \\frac{1}{1000} = 0{,}001$ .' },
              { label: '$10^{5} \\times 10^{3} = 10^{8}$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'في الجداء نجمع الأسّين: $5 + 3 = 8$ .' },
              { label: 'الكتابة العلمية لـ $45\\,000$ هي $45 \\times 10^{3}$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'العدد $45$ ليس من $1$ إلى أقل من $10$ : $45\\,000 = 4{,}5 \\times 10^{4}$ .' },
              { label: 'رتبة قدر $6{,}7 \\times 10^{5}$ هي $7 \\times 10^{5}$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'نُدوّر $6{,}7$ إلى الوحدة فنجد $7$ ونُبقي القوة.' },
              { label: '$3^{-2} = \\frac{1}{9}$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$3^{-2} = \\frac{1}{3^{2}} = \\frac{1}{9}$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: ['(a) خطأ، (b) خطأ، (c) صحيح، (d) خطأ، (e) صحيح، (f) صحيح.', 'نتحقّق من كل سطر بقاعدة الإشارة والأسّ السالب وقاعدة الجداء وشرط الكتابة العلمية ثم تدوير العدد.'] },
        ],
      },
      {
        label: '2)', title: 'تصحيح الخاطئة',
        question: 'ما القيمة الصحيحة في السطر (a) وفي السطر (b)؟ وما الكتابة العلمية الصحيحة في السطر (d)؟',
        asks: ['القيمة الصحيحة في (a)', 'القيمة الصحيحة في (b)', 'العدد $a$ في (d)', 'الأسّ $n$ في (d)'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ishara-quwa'], prompt: '$(-2)^{4} =$', expected: 16, explain: 'أربعة عوامل سالبة: الجداء موجب، $2^{4} = 16$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashara-salib'], prompt: '$10^{-3} =$', expected: 0.001, display: '0,001', explain: '$10^{-3} = \\frac{1}{10^{3}} = 0{,}001$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['kitaba-ilmiya'], prompt: '$45\\,000 = a \\times 10^{n}$ : $a =$', expected: 4.5, display: '4,5', explain: 'نُزيح الفاصلة حتى يبقى رقم واحد قبلها: $4{,}5$ .' },
          { kind: 'numeric', role: 'answer', ask: 3, requires: ['kitaba-ilmiya'], prompt: 'والأسّ $n =$', expected: 4, explain: 'أزحنا الفاصلة أربع رتب: $45\\,000 = 4{,}5 \\times 10^{4}$ .' },
          { kind: 'solution', ask: 0, lines: ['(a) $(-2)^{4} = 16$ و (b) $10^{-3} = 0{,}001$ .', '(d) $45\\,000 = 4{,}5 \\times 10^{4}$ ؛ كتبت سلمى $45$ وهو أكبر من $10$ .'] },
        ],
      },
      {
        label: '3)', title: 'نقطة سلمى',
        question: 'ما نقطة سلمى من 6؟',
        asks: ['نقطة سلمى'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ishara-quwa'], prompt: 'عدد سطورها الصحيحة، وهي (c) و (e) و (f):', expected: 3, explain: 'نقطة عن كل سطر صحيح، والصحيحة ثلاثة: (c) و (e) و (f).' },
          { kind: 'solution', ask: 0, lines: ['السطور (c) و (e) و (f) صحيحة.', 'نقطة سلمى: $3$ من $6$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — الكريات الحمراء',
    context: 'تحويل الوحدات وجداء عددين بالكتابة العلمية وتحويل المتر إلى الكيلومتر',
    emoji: '🩸',
    source: S4,
    tone: 'violet',
    illustration: { kind: 'tags', cards: [
      { title: 'الدم', icon: 'bottle', lines: [{ label: 'الكريات في 1 mm³', value: '5 × 10⁶' }, { label: 'كمية الدم', value: 5, unit: 'L' }] },
      { title: 'الكرية الحمراء', icon: 'coin', lines: [{ label: 'السُّمك', value: '2,5', unit: 'µm' }] },
    ], ariaLabel: 'بطاقتان: الدم فيه خمسة في عشرة أُسّ ستة كرية حمراء في الميلّيمتر المكعّب الواحد، وكمية الدم خمسة لترات، والكرية الحمراء سُمكها اثنان فاصلة خمسة ميكرومتر' },
    statement: 'يحتوي $1\\ \\mathrm{mm}^{3}$ من الدم على حوالي $5 \\times 10^{6}$ كرية حمراء، وفي جسم رجل حوالي $5$ لترات من الدم. نشبّه الكرية بقرص سُمكه حوالي $2{,}5\\ \\mu\\mathrm{m}$ .',
    data: [
      { id: 'cells', text: '5 × 10⁶ كرية في 1 mm³', useful: true },
      { id: 'blood', text: 'حوالي 5 لترات من الدم', useful: true },
      { id: 'thick', text: 'سُمك الكرية حوالي 2,5 µm', useful: true },
      { id: 'color', text: 'لون الكرية أحمر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حجم الدم بـ mm³',
        question: 'علمًا أنّ $1\\ \\mathrm{L} = 10^{6}\\ \\mathrm{mm}^{3}$ ، ما حجم الدم في الجسم بـ $\\mathrm{mm}^{3}$ ؟ اكتبه على الشكل $a \\times 10^{n}$ .',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: '$5\\ \\mathrm{L} = 5 \\times 10^{6}\\ \\mathrm{mm}^{3}$ : العدد $a =$', expected: 5, explain: '$5$ لترات هي $5 \\times 10^{6}$ ، والعدد $5$ بين $1$ و $10$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashara-salib'], prompt: 'والأسّ $n =$', expected: 6, explain: 'كل لتر يساوي $10^{6}\\ \\mathrm{mm}^{3}$ .' },
          { kind: 'solution', ask: 0, lines: ['$5\\ \\mathrm{L} = 5 \\times 10^{6}\\ \\mathrm{mm}^{3}$ .', 'حجم الدم $5 \\times 10^{6}\\ \\mathrm{mm}^{3}$ .'] },
        ],
      },
      {
        label: '2)', title: 'عدد الكريات الحمراء',
        question: 'ما عدد الكريات الحمراء في الجسم؟ اكتبه كتابة علمية.',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hasil-quwa-ashara'], prompt: 'العدد $= 5 \\times 10^{6} \\times 5 \\times 10^{6} = (5 \\times 5) \\times 10^{12}$ ، و $5 \\times 5 =$', expected: 25, explain: '$25 \\times 10^{12}$ ليست كتابة علمية، لأنّ $25$ أكبر من $10$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$25 \\times 10^{12} = a \\times 10^{n}$ : $a =$', expected: 2.5, display: '2,5', explain: '$25 = 2{,}5 \\times 10^{1}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kitaba-ilmiya', 'hasil-quwa-ashara'], prompt: 'والأسّ $n = 12 + 1 =$', expected: 13, explain: '$25 \\times 10^{12} = 2{,}5 \\times 10^{1} \\times 10^{12} = 2{,}5 \\times 10^{13}$ .' },
          { kind: 'solution', ask: 0, lines: ['$5 \\times 10^{6} \\times 5 \\times 10^{6} = 25 \\times 10^{12}$ .', '$25 \\times 10^{12} = 2{,}5 \\times 10^{13}$ كرية.'] },
        ],
      },
      {
        label: '3)', title: 'ارتفاع العمود',
        question: 'إذا تراكمت كل الكريات فوق بعضها، فما ارتفاع العمود بالمتر ($1\\ \\mu\\mathrm{m} = 10^{-6}\\ \\mathrm{m}$)؟ اكتبه كتابة علمية.',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya', 'hasil-quwa-ashara'], prompt: 'الارتفاع $= 2{,}5 \\times 10^{13} \\times 2{,}5 \\times 10^{-6} = (2{,}5 \\times 2{,}5) \\times 10^{n}$ : $a = 2{,}5 \\times 2{,}5 =$', expected: 6.25, display: '6,25', explain: '$2{,}5 \\times 2{,}5 = 6{,}25$ ، وهو من $1$ إلى أقل من $10$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasil-quwa-ashara'], prompt: 'والأسّ $n = 13 + (-6) =$', expected: 7, explain: 'نجمع الأسّين: $13 - 6 = 7$ .' },
          { kind: 'solution', ask: 0, lines: ['سُمك الكرية $2{,}5\\ \\mu\\mathrm{m} = 2{,}5 \\times 10^{-6}\\ \\mathrm{m}$ .', 'الارتفاع $2{,}5 \\times 10^{13} \\times 2{,}5 \\times 10^{-6} = 6{,}25 \\times 10^{7}\\ \\mathrm{m}$ .'] },
        ],
      },
      {
        label: '4)', title: 'رتبة القدر بالكيلومتر',
        question: 'ما رتبة قدر هذا الارتفاع بالكيلومتر؟',
        asks: ["العدد $a'$", 'الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasil-quwa-ashara', 'ashara-salib'], prompt: '$6{,}25 \\times 10^{7}\\ \\mathrm{m} = 6{,}25 \\times 10^{7} \\times 10^{-3}\\ \\mathrm{km}$ ، فالأسّ $n =$', expected: 4, explain: '$1\\ \\mathrm{m} = 10^{-3}\\ \\mathrm{km}$ ، إذن $7 + (-3) = 4$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['rutbat-qadr'], prompt: "رتبة قدره $a' \\times 10^{4}\\ \\mathrm{km}$ : مدوّر $6{,}25$ إلى الوحدة هو $a' =$", expected: 6, explain: '$6{,}25$ أقرب إلى $6$ منه إلى $7$ .' },
          { kind: 'solution', ask: 0, lines: ['$6{,}25 \\times 10^{7}\\ \\mathrm{m} = 6{,}25 \\times 10^{4}\\ \\mathrm{km}$ .', 'رتبة قدره $6 \\times 10^{4}\\ \\mathrm{km}$ ، أي ستون ألف كيلومتر تقريبًا.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — ثلاثة أعداد',
    context: 'أولوية العمليات وقوى عدد نسبي وقوى العدد 10 والكتابة العلمية',
    emoji: '🔢',
    source: SOURCE,
    tone: 'indigo',
    illustration: { kind: 'tags', cards: [
      { title: 'العدد A', lines: [{ label: 'العبارة', value: '(−3)² × 10⁻² + 4 × 10⁻¹' }] },
      { title: 'العدد B', lines: [{ label: 'العبارة', value: '(2³ × 5³)² ÷ 10⁴' }] },
      { title: 'العدد C', lines: [{ label: 'العبارة', value: '(−1)⁷ − 2 × (−2)³' }] },
    ], ariaLabel: 'ثلاث بطاقات: عبارات الأعداد A و B و C' },
    statement: 'نعتبر الأعداد: $A = (-3)^{2} \\times 10^{-2} + 4 \\times 10^{-1}$ ؛ $B = \\frac{(2^{3} \\times 5^{3})^{2}}{10^{4}}$ ؛ $C = (-1)^{7} - 2 \\times (-2)^{3}$ .',
    data: [
      { id: 'a', text: 'A = (−3)² × 10⁻² + 4 × 10⁻¹', useful: true },
      { id: 'b', text: 'B = (2³ × 5³)² ÷ 10⁴', useful: true },
      { id: 'c', text: 'C = (−1)⁷ − 2 × (−2)³', useful: true },
      { id: 'n', text: 'الأعداد A و B و C مكتوبة بخط عريض', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'قيمة A',
        question: 'احسب $A$ واكتب النتيجة بالفاصلة.',
        asks: ['قيمة A'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['ishara-quwa'], prompt: '$(-3)^{2} =$', expected: 9, explain: 'الأسّ زوجي فالناتج موجب: $9$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['awlawiya-quwa', 'ashara-salib'], prompt: '$A = 9 \\times 0{,}01 + 4 \\times 0{,}1 =$', expected: 0.49, display: '0,49', explain: 'الضرب أوّلًا: $0{,}09 + 0{,}4 = 0{,}49$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-3)^{2} = 9$ و $10^{-2} = 0{,}01$ و $10^{-1} = 0{,}1$ .', '$A = 0{,}09 + 0{,}4 = 0{,}49$ .'] },
        ],
      },
      {
        label: '2)', title: 'الكتابة العلمية لـ A',
        question: 'ما الكتابة العلمية للعدد $A$ ؟',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$0{,}49 = a \\times 10^{n}$ : $a =$', expected: 4.9, display: '4,9', explain: 'نُزيح الفاصلة رتبة واحدة نحو اليمين حتى يبقى رقم غير معدوم قبلها.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kitaba-ilmiya'], prompt: 'والأسّ $n =$', expected: -1, display: '−1', explain: 'العدد أصغر من $1$ فالأسّ سالب: $0{,}49 = 4{,}9 \\times 10^{-1}$ .' },
          { kind: 'solution', ask: 0, lines: ['$0{,}49 = 4{,}9 \\times 0{,}1$ .', 'الكتابة العلمية $A = 4{,}9 \\times 10^{-1}$ .'] },
        ],
      },
      {
        label: '3)', title: 'B قوة للعدد 10',
        question: 'اكتب $B$ على شكل قوة للعدد $10$ .',
        asks: ['الأسّ في B'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jidaa-quwa-ashara', 'quwat-jidaa'], prompt: '$2^{3} \\times 5^{3} = (2 \\times 5)^{3} = 10^{n}$ : $n =$', expected: 3, explain: 'لهما الأسّ نفسه فنضرب القاعدتين: $(2 \\times 5)^{3} = 10^{3}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwat-quwa-ashara', 'hasil-quwatayn'], prompt: '$B = \\frac{(10^{3})^{2}}{10^{4}} = \\frac{10^{6}}{10^{4}} = 10^{n}$ : $n =$', expected: 2, explain: '$(10^{3})^{2} = 10^{6}$ ثم $10^{6 - 4} = 10^{2}$ .' },
          { kind: 'solution', ask: 0, lines: ['$2^{3} \\times 5^{3} = 10^{3}$ ، و $(10^{3})^{2} = 10^{6}$ .', '$B = \\frac{10^{6}}{10^{4}} = 10^{2}$ .'] },
        ],
      },
      {
        label: '4)', title: 'قيمة C',
        question: 'احسب $C$ .',
        asks: ['قيمة C'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ishara-quwa'], prompt: '$(-2)^{3} =$', expected: -8, display: '−8', explain: 'ثلاثة عوامل سالبة: الجداء سالب، $-8$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['awlawiya-quwa'], prompt: '$C = (-1) - 2 \\times (-8) =$', expected: 15, explain: 'الضرب قبل الطرح: $-1 + 16 = 15$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-1)^{7} = -1$ و $(-2)^{3} = -8$ .', '$C = -1 - 2 \\times (-8) = -1 + 16 = 15$ .'] },
        ],
      },
      {
        label: '5)', title: 'المقارنة',
        question: 'قارن $A$ والعدد $\\frac{1}{2}$ .',
        asks: ['المقارنة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kitaba-ilmiya'], prompt: 'بما أنّ $A = 0{,}49$ و $\\frac{1}{2} = 0{,}5$ :', options: ['$A < \\frac{1}{2}$', '$A > \\frac{1}{2}$', '$A = \\frac{1}{2}$'], correct: 0, cols: 3,
            explain: '$0{,}49 < 0{,}50$ : مئة جزء أقل بجزء واحد، فـ $A$ أصغر.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{1}{2} = 0{,}5 = 0{,}50$ .', '$0{,}49 < 0{,}50$ ، إذن $A < \\frac{1}{2}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — الجزائر بالأرقام',
    context: 'الكتابة العلمية وتحويل الوحدات ورتبة قدر خارج قسمة',
    emoji: '🇩🇿',
    source: SOURCE,
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'الجزائر', icon: 'house', lines: [{ label: 'المساحة', value: '2 381 741', unit: 'km²' }, { label: 'عدد السكان', value: 47, unit: 'مليون' }] },
    ], ariaLabel: 'بطاقة الجزائر: المساحة حوالي مليونين وثلاثمئة وواحد وثمانين ألفًا وسبعمئة وواحد وأربعين كيلومترًا مربّعًا، وعدد السكان حوالي سبعة وأربعين مليون نسمة' },
    statement: 'مساحة الجزائر حوالي $2\\,381\\,741\\ \\mathrm{km}^{2}$ ، وعدد سكّانها حوالي $47$ مليون نسمة.',
    data: [
      { id: 'area', text: 'المساحة حوالي 2 381 741 km²', useful: true },
      { id: 'pop', text: 'عدد السكان حوالي 47 مليون', useful: true },
      { id: 'conv', text: '1 km² = 10⁶ m²', useful: true },
      { id: 'cap', text: 'العاصمة على ساحل البحر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المساحة بالكيلومتر المربّع',
        question: 'اكتب المساحة بالكيلومتر المربّع كتابة علمية.',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$2\\,381\\,741 = a \\times 10^{n}$ : $a =$', expected: 2.381741, display: '2,381741', explain: 'نُزيح الفاصلة حتى يبقى رقم واحد قبلها: $2{,}381741$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kitaba-ilmiya'], prompt: 'والأسّ $n =$', expected: 6, explain: 'أزحنا الفاصلة ست رتب: $2\\,381\\,741 = 2{,}381741 \\times 10^{6}$ .' },
          { kind: 'solution', ask: 0, lines: ['العدد $2\\,381\\,741$ سبعة أرقام، فنُزيح الفاصلة ست رتب.', 'المساحة $2{,}381741 \\times 10^{6}\\ \\mathrm{km}^{2}$ .'] },
        ],
      },
      {
        label: '2)', title: 'المساحة بالمتر المربّع',
        question: 'علمًا أنّ $1\\ \\mathrm{km}^{2} = 10^{6}\\ \\mathrm{m}^{2}$ ، اكتب المساحة بالمتر المربّع كتابة علمية، ثم أعط رتبة قدرها.',
        asks: ['الأسّ $n$', "العدد $a'$ في رتبة القدر"],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: '$2{,}381741 \\times 10^{6} \\times 10^{6} = 2{,}381741 \\times 10^{n}$ : $n =$', expected: 12, explain: 'نضرب في $10^{6}$ فنجمع الأسّين: $6 + 6 = 12$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['rutbat-qadr'], prompt: "رتبة قدرها $a' \\times 10^{12}\\ \\mathrm{m}^{2}$ : $a' =$", expected: 2, explain: 'مدوّر $2{,}381741$ إلى الوحدة هو $2$ .' },
          { kind: 'solution', ask: 0, lines: ['$2{,}381741 \\times 10^{6} \\times 10^{6} = 2{,}381741 \\times 10^{12}\\ \\mathrm{m}^{2}$ .', 'رتبة القدر $2 \\times 10^{12}\\ \\mathrm{m}^{2}$ .'] },
        ],
      },
      {
        label: '3)', title: 'عدد السكان',
        question: 'اكتب عدد السكان كتابة علمية.',
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$47\\ \\text{مليون} = 47 \\times 10^{6} = a \\times 10^{n}$ : $a =$', expected: 4.7, display: '4,7', explain: '$47 = 4{,}7 \\times 10^{1}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kitaba-ilmiya', 'hasil-quwa-ashara'], prompt: 'والأسّ $n = 6 + 1 =$', expected: 7, explain: '$47 \\times 10^{6} = 4{,}7 \\times 10^{1} \\times 10^{6} = 4{,}7 \\times 10^{7}$ .' },
          { kind: 'solution', ask: 0, lines: ['$47$ مليون هي $47 \\times 10^{6}$ .', '$47 \\times 10^{6} = 4{,}7 \\times 10^{7}$ نسمة.'] },
        ],
      },
      {
        label: '4)', title: 'مساحة كل ساكن',
        question: 'ما رتبة قدر المساحة التي تعود لكل ساكن لو قُسّمت الأرض بالتساوي، بالمتر المربّع؟',
        asks: ['رتبة القدر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hasil-quwa-ashara'], prompt: '$\\frac{2{,}381741 \\times 10^{12}}{4{,}7 \\times 10^{7}}$ : قوة العدد $10$ في الناتج هي $10^{n}$ ، و $n =$', expected: 5, explain: '$\\frac{10^{12}}{10^{7}} = 10^{12 - 7} = 10^{5}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kitaba-ilmiya', 'rutbat-qadr'], prompt: 'وبما أنّ $2{,}381741 \\div 4{,}7 \\approx 0{,}507$ ، فالمساحة $\\approx 0{,}507 \\times 10^{5} = 5{,}07 \\times 10^{4}$ ، ورتبة قدرها:',
            options: ['$5 \\times 10^{4}\\ \\mathrm{m}^{2}$', '$5 \\times 10^{5}\\ \\mathrm{m}^{2}$', '$1 \\times 10^{5}\\ \\mathrm{m}^{2}$'], correct: 0, cols: 3,
            explain: 'نكتب النتيجة كتابة علمية $5{,}07 \\times 10^{4}$ ثم نُدوّر $5{,}07$ إلى الوحدة. الخطأ الثاني أبقى $10^{5}$ دون تعديل الفاصلة، والثالث دوّر $0{,}507$ إلى $1$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{2{,}381741 \\times 10^{12}}{4{,}7 \\times 10^{7}} \\approx 0{,}507 \\times 10^{5} = 5{,}07 \\times 10^{4}$ .', 'لكل ساكن حوالي $5 \\times 10^{4}\\ \\mathrm{m}^{2}$ ، أي حوالي خمسة هكتارات.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
